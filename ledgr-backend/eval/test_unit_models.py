"""
Exhaustive Unit Test Suite for Ledgr Models, Agents & Security Layers
Covers clean, edge, and adversarial cases for:
1. models.rule_verifier (verify_amount, verify_date, verify_reference, rule_verifier)
2. models.features (calculate_shannon_entropy, parse_date, extract_features_single)
3. models.matcher (embed_text, compute_similarity, candidate_ranking)
4. api.audit (canonical_json, compute_entry_hash, verify_chain_integrity, tampering)
5. agents.explain_exception (fallback generator, schema validation, unavailable status)
"""

import math
import pytest
from datetime import datetime
from models.rule_verifier import (
    verify_amount,
    verify_date,
    verify_reference,
    rule_verifier,
    parse_iso_or_slash_date,
)
from models.features import (
    calculate_shannon_entropy,
    parse_date,
    extract_features_single,
    FEATURE_COLUMNS,
)
from models.matcher import get_matcher
from api.audit import (
    GENESIS_HASH,
    canonical_json,
    compute_entry_hash,
    verify_chain_integrity,
)
from agents.explain_exception import (
    ExceptionExplanation,
    generate_fallback_explanation,
)


# ============================================================================
# 1. models.rule_verifier Unit Tests
# ============================================================================

class TestRuleVerifierUnit:
    """Rigorous clean, edge, and adversarial testing for deterministic rule verifier."""

    # --- Amount Verification ---
    def test_amount_clean_exact(self):
        passed, score, detail = verify_amount(5000.0, 5000.0)
        assert passed is True
        assert score == 1.0
        assert detail["amount_match"] == "exact"

    def test_amount_clean_fee_tolerance(self):
        # 1.5% fee on 10,000 = 150 -> 9850
        passed, score, detail = verify_amount(10000.0, 9850.0, max_fee_pct=2.0)
        assert passed is True
        assert score >= 0.80
        assert detail["is_fee_candidate"] is True

    def test_amount_edge_zero_and_negative(self):
        # Edge: zero amount or negative amounts should not auto-match
        p1, s1, d1 = verify_amount(0.0, 0.0)
        assert p1 is False
        assert s1 == 0.0

        p2, s2, d2 = verify_amount(-500.0, -500.0)
        assert p2 is False
        assert s2 == 0.0

    def test_amount_edge_tiny_delta(self):
        # Edge: sub-cent / sub-paisa difference should count as exact match
        passed, score, detail = verify_amount(1250.004, 1250.001)
        assert passed is True
        assert score == 1.0

    def test_amount_adversarial_huge_discrepancy(self):
        # Adversarial: extreme discrepancy (₹1,000 vs ₹10,000,000)
        passed, score, detail = verify_amount(1000.0, 10_000_000.0)
        assert passed is False
        assert score == 0.0
        assert detail["amount_match"] == "mismatch"

    def test_amount_adversarial_reverse_fee(self):
        # Adversarial: gateway paying MORE than bank (impossible fee direction)
        passed, score, detail = verify_amount(1000.0, 1050.0)
        assert passed is False
        assert detail["is_fee_candidate"] is False

    # --- Date Verification ---
    def test_date_clean_exact(self):
        passed, score, detail = verify_date("2026-09-01", "2026-09-01")
        assert passed is True
        assert score == 1.0
        assert detail["lag_days"] == 0

    def test_date_clean_settlement_lag(self):
        # 1-day T+1 lag
        p1, s1, d1 = verify_date("2026-09-01", "2026-09-02", max_lag_days=2)
        assert p1 is True
        assert s1 == 0.90
        assert d1["lag_days"] == 1

        # 2-day T+2 lag
        p2, s2, d2 = verify_date("2026-09-01", "2026-09-03", max_lag_days=2)
        assert p2 is True
        assert s2 == 0.80
        assert d2["lag_days"] == 2

    def test_date_edge_empty_and_unparseable(self):
        # Edge: empty string, None, invalid strings
        p1, s1, d1 = verify_date("", "2026-09-01")
        assert p1 is False
        assert s1 == 0.3
        assert "Unparseable" in d1.get("reason", "")

        p2, s2, d2 = verify_date("not-a-date", "2026-02-30")
        assert p2 is False

    def test_date_adversarial_extreme_lag(self):
        # Adversarial: 180-day lag
        passed, score, detail = verify_date("2026-01-01", "2026-07-01", max_lag_days=2)
        assert passed is False
        assert score <= 0.15
        assert detail["date_match"] == "lag_exceeded"

    def test_date_adversarial_malformed_unicode(self):
        # Adversarial: SQL injection / XSS payload in date field
        passed, score, detail = verify_date("2026-09-01'; DROP TABLE batches;--", "2026-09-01")
        assert passed is False
        assert "Unparseable" in detail["reason"]

    # --- Reference Verification ---
    def test_ref_clean_exact(self):
        passed, score, detail = verify_reference("REF-991823", "REF-991823")
        assert passed is True
        assert score == 1.0

    def test_ref_clean_token_containment(self):
        # Shared core token '991823' between bank ref and gateway PO
        passed, score, detail = verify_reference("BANK-TXN-991823-IN", "PO-991823-SETTLED")
        assert passed is True
        assert score == 0.95
        assert "991823" in detail.get("common", [])

    def test_ref_edge_empty_and_whitespace(self):
        p1, s1, d1 = verify_reference("", "   ")
        assert p1 is False
        assert s1 == 0.2

    def test_ref_adversarial_extremely_long_string(self):
        # Adversarial: 10,000-character repetitive string
        long_a = "A" * 10000
        long_b = "B" * 10000
        passed, score, detail = verify_reference(long_a, long_b)
        assert passed is False

    # --- Composite Rule Verifier ---
    def test_composite_rule_verifier_full_flow(self):
        # Clean exact
        ra = {"amount": 25000.0, "date": "2026-09-01", "reference": "REF-8899"}
        rb = {"amount": 25000.0, "date": "2026-09-01", "reference": "PO-8899"}
        p, s, b = rule_verifier(ra, rb)
        assert p is True
        assert s >= 0.95

        # Edge: empty records
        p_edge, s_edge, _ = rule_verifier({}, {})
        assert p_edge is False
        assert s_edge <= 0.30

        # Adversarial: wrong data types gracefully handled
        ra_bad = {"amount": "invalid_amt", "date": None, "reference": 12345}
        rb_bad = {"amount": None, "date": 99999, "reference": {}}
        p_adv, s_adv, _ = rule_verifier(ra_bad, rb_bad)
        assert p_adv is False


# ============================================================================
# 2. models.features Unit Tests
# ============================================================================

class TestFeaturesUnit:
    """Clean, edge, and adversarial tests for tabular feature extraction."""

    def test_shannon_entropy_clean(self):
        # Repetitive low entropy
        low_ent = calculate_shannon_entropy("AAAAAAAAAAAA")
        assert low_ent == 0.0

        # Varied text
        high_ent = calculate_shannon_entropy("Razorpay Payout TXN-9941a87b")
        assert high_ent > 3.0

    def test_shannon_entropy_edge(self):
        assert calculate_shannon_entropy("") == 0.0
        assert calculate_shannon_entropy(None) == 0.0

    def test_parse_date_formats(self):
        d1 = parse_date("2026-09-01")
        assert d1.year == 2026 and d1.month == 9 and d1.day == 1

        d2 = parse_date("01/09/2026")
        assert d2.year == 2026

        # Edge fallback
        d_fallback = parse_date("invalid-date-string")
        assert isinstance(d_fallback, datetime)

    def test_extract_features_single_clean(self):
        ra = {"amount": 10000.0, "date": "2026-09-01", "description": "Vendor Payment"}
        rb = {"amount": 9900.0, "date": "2026-09-02", "description": "Vendor Settlement"}
        feats = extract_features_single(ra, rb)

        for col in FEATURE_COLUMNS:
            assert col in feats, f"Missing feature column: {col}"
            assert not math.isnan(feats[col]), f"NaN encountered in feature: {col}"

        assert feats["amount_diff"] == 100.0
        assert feats["date_lag_days"] == 1.0

    def test_extract_features_single_adversarial(self):
        # Malformed / extreme / missing data
        ra_corrupt = {"amount": -99999.0, "date": "", "description": "\x00\x01\xff\xfe"}
        rb_corrupt = {"amount": 0.0, "date": None, "description": ""}
        feats = extract_features_single(ra_corrupt, rb_corrupt)

        for col in FEATURE_COLUMNS:
            assert col in feats
            assert isinstance(feats[col], (int, float))
            assert not math.isnan(feats[col])


# ============================================================================
# 3. models.matcher Unit Tests
# ============================================================================

class TestMatcherUnit:
    """Unit tests for neural matcher embeddings and similarity scoring."""

    @pytest.fixture(scope="class")
    def matcher(self):
        return get_matcher()

    def test_matcher_embed_clean(self, matcher):
        text = "Razorpay payment settlement TXN-4001 amount 12500"
        emb = matcher.embed_text(text)
        assert emb is not None
        assert len(emb) == 384  # BGE-small embedding dimension
        # Check normalized unit vector (L2 norm == 1.0)
        norm = float(math.sqrt(sum(x * x for x in emb)))
        assert abs(norm - 1.0) < 1e-3

    def test_matcher_embed_edge_empty(self, matcher):
        emb = matcher.embed_text("")
        assert len(emb) == 384

    def test_matcher_embed_adversarial_long_unicode(self, matcher):
        adversarial_text = "HDFC INWARD CREDIT " * 500 + " 🚀🔥💰" + "\u200b" * 50
        emb = matcher.embed_text(adversarial_text)
        assert len(emb) == 384

    def test_matcher_compute_similarity(self, matcher):
        t1 = "HDFC Bank Ref 991823 Inward Credit from Razorpay"
        t2 = "Razorpay Settlement Payout to HDFC Ref 991823"
        t3 = "Completely unrelated grocery bill at supermarket"

        sim_related = matcher.compute_similarity(t1, t2)
        sim_unrelated = matcher.compute_similarity(t1, t3)

        assert 0.0 <= sim_related <= 1.0
        assert 0.0 <= sim_unrelated <= 1.0
        assert sim_related > sim_unrelated, "Semantic matcher failed to rank related higher than unrelated"


# ============================================================================
# 4. api.audit Hash Chaining & Tamper Detection Unit Tests
# ============================================================================

class TestAuditSecurityUnit:
    """Unit tests for SHA-256 hash chaining and tamper-evident audit trail."""

    def test_canonical_json_determinism(self):
        # Key order should not change the canonical serialization
        d1 = {"z": 1, "a": 2, "m": [3, 2, 1]}
        d2 = {"a": 2, "m": [3, 2, 1], "z": 1}
        assert canonical_json(d1) == canonical_json(d2)

    def test_entry_hash_computation(self):
        h1 = compute_entry_hash(GENESIS_HASH, {"event": "ingest", "count": 20})
        h2 = compute_entry_hash(GENESIS_HASH, {"event": "ingest", "count": 20})
        assert h1 == h2
        assert len(h1) == 64  # SHA-256 hex string

    def test_valid_chain_passes_integrity(self):
        chain = []
        prev = GENESIS_HASH
        for i in range(5):
            payload = {"seq": i, "data": f"record-{i}"}
            h = compute_entry_hash(prev, payload)
            chain.append({
                "id": f"AE-{i+1}",
                "prev_hash": prev,
                "hash": h,
                "payload": payload
            })
            prev = h

        is_valid, err, count = verify_chain_integrity(chain)
        assert is_valid is True
        assert err is None
        assert count == 5

    def test_tampered_payload_detected(self):
        chain = []
        prev = GENESIS_HASH
        for i in range(5):
            payload = {"amount": 1000 * (i + 1)}
            h = compute_entry_hash(prev, payload)
            chain.append({
                "id": f"AE-{i+1}",
                "prev_hash": prev,
                "hash": h,
                "payload": payload
            })
            prev = h

        # Malicious alteration in middle entry #2
        chain[2]["payload"]["amount"] = 9999999

        is_valid, err, idx = verify_chain_integrity(chain)
        assert is_valid is False
        assert idx == 2
        assert "Tampered content" in err

    def test_tampered_linkage_detected(self):
        chain = []
        prev = GENESIS_HASH
        for i in range(3):
            payload = {"action": f"step-{i}"}
            h = compute_entry_hash(prev, payload)
            chain.append({
                "id": f"AE-{i+1}",
                "prev_hash": prev,
                "hash": h,
                "payload": payload
            })
            prev = h

        # Break the link at index 1
        chain[1]["prev_hash"] = "f" * 64

        is_valid, err, idx = verify_chain_integrity(chain)
        assert is_valid is False
        assert idx == 1
        assert "Broken link" in err


# ============================================================================
# 5. agents.explain_exception Unit Tests
# ============================================================================

class TestExceptionExplanationUnit:
    """Unit tests for fallback generator and Pydantic structured output."""

    def test_fallback_fee_candidate(self):
        ra = {"amount": 1000.0}
        rb = {"amount": 980.0}
        match_info = {
            "confidence": 75,
            "rule_breakdown": {"amount": {"detail": {"is_fee_candidate": True}}}
        }
        res = generate_fallback_explanation(ra, rb, match_info)
        assert isinstance(res, ExceptionExplanation)
        assert res.explanation_status == "unavailable"
        assert "gateway fee" in res.explanation.lower()
        assert "approve" in res.suggested_resolution.lower()

    def test_fallback_unexplained_discrepancy(self):
        ra = {"amount": 5000.0}
        rb = {"amount": 3200.0}
        match_info = {
            "confidence": 45,
            "rule_breakdown": {"amount": {"detail": {"is_fee_candidate": False}}}
        }
        res = generate_fallback_explanation(ra, rb, match_info)
        assert res.explanation_status == "unavailable"
        assert "manual investigation" in res.suggested_resolution.lower()

    def test_schema_serialization(self):
        expl = ExceptionExplanation(
            explanation="Amount delta matches 2% MDR deduction.",
            suggested_resolution="Confirm fee schedule and match.",
            confidence_reasoning="Deterministic fee tolerance rule passed.",
            explanation_status="ok"
        )
        dump = expl.model_dump()
        assert dump["explanation_status"] == "ok"
        assert len(dump["explanation"]) > 10
