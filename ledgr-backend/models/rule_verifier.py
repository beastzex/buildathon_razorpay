"""
Rule Verifier for Financial Records (Part 1.3)
Deterministic, non-ML validation backstop for financial transaction reconciliation.
Provides:
1. Amount tolerance check (with configurable gateway fee deduction tolerance)
2. Date window check (configurable allowed settlement lag)
3. Reference ID fuzzy/token match (RapidFuzz ratio)

Returns: (rule_pass: bool, rule_score: float, rule_breakdown: dict)
"""

import os
from typing import Dict, Any, Tuple, Optional
from datetime import datetime
from rapidfuzz import fuzz

# Default configurable thresholds (can be overridden via env or args)
DEFAULT_MAX_DATE_LAG_DAYS = int(os.getenv("LEDGR_MAX_DATE_LAG_DAYS", "2"))
DEFAULT_MAX_FEE_TOLERANCE_PCT = float(os.getenv("LEDGR_MAX_FEE_TOLERANCE_PCT", "2.5"))  # Up to 2.5% fee
DEFAULT_MAX_FIXED_FEE = float(os.getenv("LEDGR_MAX_FIXED_FEE", "50.0"))               # Flat fee cap
DEFAULT_MIN_REF_FUZZY_SCORE = float(os.getenv("LEDGR_MIN_REF_FUZZY_SCORE", "65.0"))   # Minimum token similarity


def parse_iso_or_slash_date(date_str: str) -> Optional[datetime]:
    """Parse common date formats (YYYY-MM-DD, DD/MM/YYYY, MM/DD/YYYY)."""
    if not date_str:
        return None
    date_str = str(date_str).strip()
    for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%m/%d/%Y", "%d-%m-%Y", "%Y/%m/%d"):
        try:
            return datetime.strptime(date_str, fmt)
        except ValueError:
            continue
    return None


def verify_amount(
    amount_a: float,
    amount_b: float,
    max_fee_pct: float = DEFAULT_MAX_FEE_TOLERANCE_PCT,
    max_fixed_fee: float = DEFAULT_MAX_FIXED_FEE
) -> Tuple[bool, float, Dict[str, Any]]:
    """
    Check amount consistency:
    - Exact match -> score 1.0
    - Amount B is slightly less than Amount A by reasonable gateway fee -> pass with score 0.85 - 0.95
    - Discrepancy exceeds fee bounds -> fail with low score
    """
    try:
        if amount_a is None or amount_b is None:
            return False, 0.0, {"reason": "Missing amount", "delta": 0.0}
        amt_a = float(amount_a)
        amt_b = float(amount_b)
    except (ValueError, TypeError):
        return False, 0.0, {"reason": "Non-numeric amount", "delta": 0.0}

    if amt_a <= 0 or amt_b <= 0:
        return False, 0.0, {"reason": "Non-positive amount", "delta": abs(amt_a - amt_b)}

    # Extreme value guard: amounts >₹100,000,000 or <₹1.00 require human review
    if amt_a > 100_000_000.0 or amt_b > 100_000_000.0 or amt_a < 1.0 or amt_b < 1.0:
        return False, 0.50, {
            "amount_match": "extreme_value_flagged",
            "delta": abs(amt_a - amt_b),
            "reason": "Amount outside standard operational bounds"
        }

    diff = amt_a - amt_b
    abs_diff = abs(diff)

    # 1. Exact match within 1 paisa / cent
    if abs_diff < 0.01:
        return True, 1.0, {"amount_match": "exact", "delta": 0.0, "is_fee_candidate": False}

    # 2. Bank gross > Gateway net (standard gateway deduction)
    if diff > 0:
        pct_diff = (diff / amt_a) * 100.0
        if pct_diff <= max_fee_pct or diff <= max_fixed_fee:
            score = max(0.80, 1.0 - (pct_diff / 10.0))
            return True, score, {
                "amount_match": "fee_tolerance_pass",
                "delta": round(diff, 2),
                "fee_pct": round(pct_diff, 2),
                "is_fee_candidate": True
            }

    # 3. Mismatch exceeding tolerances
    pct_mismatch = (abs_diff / max(amt_a, amt_b)) * 100.0
    score = max(0.0, 1.0 - (pct_mismatch / 20.0))
    return False, round(score, 3), {
        "amount_match": "mismatch",
        "delta": round(abs_diff, 2),
        "pct_mismatch": round(pct_mismatch, 2),
        "is_fee_candidate": False
    }


def verify_date(
    date_a_str: str,
    date_b_str: str,
    max_lag_days: int = DEFAULT_MAX_DATE_LAG_DAYS
) -> Tuple[bool, float, Dict[str, Any]]:
    """
    Check date consistency:
    - Exact match -> score 1.0
    - 1-2 days settlement lag -> pass with score 0.80 - 0.90
    - Greater lag -> fail
    """
    da = parse_iso_or_slash_date(date_a_str)
    db = parse_iso_or_slash_date(date_b_str)

    if not da or not db:
        return False, 0.3, {"reason": "Unparseable date", "raw_a": date_a_str, "raw_b": date_b_str}

    day_diff = (db - da).days
    abs_day_diff = abs(day_diff)

    if abs_day_diff == 0:
        return True, 1.0, {"date_match": "exact", "lag_days": 0}
    elif 0 < day_diff <= max_lag_days:
        # Standard gateway settlement delay (T+1, T+2)
        score = 0.90 if day_diff == 1 else 0.80
        return True, score, {"date_match": "settlement_lag_pass", "lag_days": day_diff}
    elif -1 <= day_diff < 0:
        # Minor pre-posting difference
        return True, 0.85, {"date_match": "minor_prepost_pass", "lag_days": day_diff}
    else:
        penalty = min(abs_day_diff * 0.15, 0.9)
        return False, max(0.1, 1.0 - penalty), {"date_match": "lag_exceeded", "lag_days": day_diff}


def verify_reference(
    ref_a: str,
    ref_b: str,
    min_fuzzy_score: float = DEFAULT_MIN_REF_FUZZY_SCORE
) -> Tuple[bool, float, Dict[str, Any]]:
    """
    Fuzzy string matching on references/identifiers.
    Extracts core alphanumeric tokens (e.g. '991882' from 'REF-991882A' and 'PO-991882').
    """
    str_a = str(ref_a or "").strip().upper()
    str_b = str(ref_b or "").strip().upper()

    if not str_a or not str_b:
        return False, 0.2, {"reason": "Missing reference"}

    # Adversarial / injection / excessive length guard
    if any(s in str_a or s in str_b for s in ["<SCRIPT", "DROP TABLE", "--", ";", "\x00", "\xff"]) or len(str_a) > 200 or len(str_b) > 200:
        return False, 0.1, {"reason": "Suspicious or malformed reference content"}

    # Exact equality
    if str_a == str_b:
        return True, 1.0, {"ref_match": "exact", "similarity": 100.0}

    # Substring containment (e.g. '991882' inside 'REF-991882')
    import re
    GENERIC_TOKENS = {"BANK", "PAYMENT", "SETTLEMENT", "TRANSFER", "INWARD", "OUTWARD", "RAZORPAY", "PAYOUT", "STATEMENT"}
    tokens_a = set(re.findall(r'[A-Z0-9]{4,}', str_a)) - GENERIC_TOKENS
    tokens_b = set(re.findall(r'[A-Z0-9]{4,}', str_b)) - GENERIC_TOKENS
    common_tokens = tokens_a.intersection(tokens_b)
    meaningful_tokens = [t for t in common_tokens if any(c.isdigit() for c in t) or len(t) >= 6]

    if meaningful_tokens:
        return True, 0.95, {"ref_match": "token_containment", "common": meaningful_tokens}

    # RapidFuzz token sort ratio
    ratio = fuzz.token_set_ratio(str_a, str_b)
    passed = ratio >= min_fuzzy_score
    norm_score = round(ratio / 100.0, 3)

    return passed, norm_score, {"ref_match": "fuzzy", "ratio": ratio, "passed": passed}


def rule_verifier(
    record_a: Dict[str, Any],
    record_b: Dict[str, Any],
    max_fee_pct: float = DEFAULT_MAX_FEE_TOLERANCE_PCT,
    max_lag_days: int = DEFAULT_MAX_DATE_LAG_DAYS,
    min_ref_score: float = DEFAULT_MIN_REF_FUZZY_SCORE
) -> Tuple[bool, float, Dict[str, Any]]:
    """
    Evaluates both records across amount, date, and reference rules.
    Weighted formula:
      rule_score = 0.50 * amount_score + 0.30 * date_score + 0.20 * ref_score
    Returns:
      (rule_pass: bool, rule_score: float, rule_breakdown: dict)
    """
    amt_pass, amt_score, amt_detail = verify_amount(
        record_a.get("amount", 0.0),
        record_b.get("amount", 0.0),
        max_fee_pct=max_fee_pct
    )

    date_pass, date_score, date_detail = verify_date(
        record_a.get("date", ""),
        record_b.get("date", ""),
        max_lag_days=max_lag_days
    )

    ref_pass, ref_score, ref_detail = verify_reference(
        record_a.get("reference", ""),
        record_b.get("reference", ""),
        min_fuzzy_score=min_ref_score
    )

    weighted_score = round(
        (0.50 * amt_score) + (0.30 * date_score) + (0.20 * ref_score),
        4
    )

    # Overarching pass criteria:
    # 1. Amount must pass or be within fee tolerance
    # 2. Date cannot exceed hard lag threshold
    # 3. If both records provide reference codes, they CANNOT completely contradict each other
    #    (Prevents near-duplicate collisions where unrelated entities share identical round amounts on the same day)
    ref_a_str = str(record_a.get("reference", "")).strip()
    ref_b_str = str(record_b.get("reference", "")).strip()
    has_conflicting_refs = bool(ref_a_str and ref_b_str and not ref_pass)

    overall_pass = amt_pass and (date_pass or date_score >= 0.75) and not has_conflicting_refs

    # If references strongly conflict, penalize the weighted score to prevent false-positive auto-matching
    if has_conflicting_refs:
        weighted_score = min(weighted_score, 0.50)

    breakdown = {
        "overall_pass": overall_pass,
        "rule_score": weighted_score,
        "has_conflicting_refs": has_conflicting_refs,
        "amount": {"pass": amt_pass, "score": amt_score, "detail": amt_detail},
        "date": {"pass": date_pass, "score": date_score, "detail": date_detail},
        "reference": {"pass": ref_pass, "score": ref_score, "detail": ref_detail}
    }

    return overall_pass, weighted_score, breakdown


if __name__ == "__main__":
    # Self-test with representative cases
    print("Testing Rule Verifier...")
    
    # Case 1: Exact match
    r1_a = {"amount": 42500.0, "date": "2026-09-01", "reference": "REF-91822A"}
    r1_b = {"amount": 42500.0, "date": "2026-09-01", "reference": "PO-91822A"}
    p1, s1, b1 = rule_verifier(r1_a, r1_b)
    print(f"Case 1 (Exact): Pass={p1}, Score={s1:.3f}")
    assert p1 and s1 > 0.90, "Case 1 failed"

    # Case 2: Gateway fee deduction + 1 day lag
    r2_a = {"amount": 9320.0, "date": "2026-09-01", "reference": "REF-91824C"}
    r2_b = {"amount": 9308.0, "date": "2026-09-02", "reference": "PO-91824C"}
    p2, s2, b2 = rule_verifier(r2_a, r2_b)
    print(f"Case 2 (Fee & Lag): Pass={p2}, Score={s2:.3f}")
    assert p2 and s2 >= 0.80, "Case 2 failed"

    # Case 3: Major unexplained discrepancy
    r3_a = {"amount": 11500.0, "date": "2026-09-01", "reference": "REF-91827F"}
    r3_b = {"amount": 9800.0, "date": "2026-09-01", "reference": "PO-991887"}
    p3, s3, b3 = rule_verifier(r3_a, r3_b)
    print(f"Case 3 (Discrepancy): Pass={p3}, Score={s3:.3f}")
    assert not p3, "Case 3 should fail rule verifier"

    print("All rule_verifier self-tests passed cleanly.")
