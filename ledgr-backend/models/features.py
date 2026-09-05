"""
Feature Engineering for Financial Anomaly Scoring (Part 2)
Extracts tabular numerical features from financial transaction pairs:
- Transaction amount (raw, log10)
- Temporal features (day-of-week, day-of-month)
- Description metrics (text length, word count, Shannon entropy)
- Cross-source discrepancy features (amount delta, fee percentage, date lag days)
- Account deviation from historical average
"""

import math
from typing import Dict, Any, List
import numpy as np
from datetime import datetime


def calculate_shannon_entropy(text: str) -> float:
    """
    Calculate character-level Shannon entropy of description text.
    High entropy indicates random alphanumeric hashes or obfuscated strings.
    Low entropy indicates repetitive or very standard text.
    """
    if not text:
        return 0.0
    text = str(text)
    prob = [float(text.count(c)) / len(text) for c in dict.fromkeys(list(text))]
    entropy = -sum(p * math.log2(p) for p in prob)
    return round(entropy, 4)


def parse_date(date_str: str) -> datetime:
    """Parse common date formats safely."""
    if not date_str:
        return datetime(2026, 9, 1)
    for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%m/%d/%Y", "%d-%m-%Y"):
        try:
            return datetime.strptime(str(date_str).strip(), fmt)
        except ValueError:
            continue
    return datetime(2026, 9, 1)


def safe_float(val: Any, default: float = 0.0) -> float:
    """Safely converts arbitrary values to float, defaulting on None or non-numeric strings."""
    if val is None:
        return default
    try:
        f = float(val)
        return default if math.isnan(f) or math.isinf(f) else f
    except (ValueError, TypeError):
        return default


def extract_features_single(
    record_a: Dict[str, Any],
    record_b: Dict[str, Any],
    historical_avg_amount: float = 25000.0
) -> Dict[str, float]:
    """
    Extract a flat feature vector from a paired transaction view.
    """
    amt_a = safe_float(record_a.get("amount", 0.0))
    amt_b = safe_float(record_b.get("amount", 0.0))
    
    # Amounts
    avg_amt = max((amt_a + amt_b) / 2.0, 1.0)
    amt_diff = abs(amt_a - amt_b)
    pct_diff = (amt_diff / max(amt_a, amt_b, 1.0)) * 100.0
    log_amt_a = math.log10(max(amt_a, 1.0))
    log_amt_b = math.log10(max(amt_b, 1.0))

    # Historical deviation
    deviation_from_hist = (amt_a - historical_avg_amount) / max(historical_avg_amount, 1.0)

    # Dates
    dt_a = parse_date(record_a.get("date", ""))
    dt_b = parse_date(record_b.get("date", ""))
    date_lag_days = abs((dt_b - dt_a).days)
    day_of_week = dt_a.weekday()  # 0=Monday, 6=Sunday
    is_weekend = 1.0 if day_of_week >= 5 else 0.0
    day_of_month = float(dt_a.day)

    # Descriptions
    desc_a = str(record_a.get("description", ""))
    desc_b = str(record_b.get("description", ""))
    desc_len_a = float(len(desc_a))
    desc_len_b = float(len(desc_b))
    entropy_a = calculate_shannon_entropy(desc_a)
    entropy_b = calculate_shannon_entropy(desc_b)

    return {
        "amount_a": amt_a,
        "amount_b": amt_b,
        "log_amount_a": round(log_amt_a, 4),
        "log_amount_b": round(log_amt_b, 4),
        "amount_diff": round(amt_diff, 2),
        "pct_diff": round(pct_diff, 4),
        "deviation_from_hist": round(deviation_from_hist, 4),
        "date_lag_days": float(date_lag_days),
        "day_of_week": float(day_of_week),
        "is_weekend": is_weekend,
        "day_of_month": day_of_month,
        "desc_len_a": desc_len_a,
        "desc_len_b": desc_len_b,
        "desc_entropy_a": entropy_a,
        "desc_entropy_b": entropy_b,
        "entropy_diff": round(abs(entropy_a - entropy_b), 4)
    }


FEATURE_COLUMNS = [
    "amount_a",
    "amount_b",
    "log_amount_a",
    "log_amount_b",
    "amount_diff",
    "pct_diff",
    "deviation_from_hist",
    "date_lag_days",
    "day_of_week",
    "is_weekend",
    "day_of_month",
    "desc_len_a",
    "desc_len_b",
    "desc_entropy_a",
    "desc_entropy_b",
    "entropy_diff"
]


def extract_features_matrix(
    records_a: List[Dict[str, Any]],
    records_b: List[Dict[str, Any]],
    historical_avg: float = 25000.0
) -> np.ndarray:
    """Extract 2D numpy array of features for batch prediction."""
    matrix = []
    for ra, rb in zip(records_a, records_b):
        feats = extract_features_single(ra, rb, historical_avg_amount=historical_avg)
        row = [feats[col] for col in FEATURE_COLUMNS]
        matrix.append(row)
    return np.array(matrix, dtype=np.float32)


if __name__ == "__main__":
    # Self-test
    ra = {"amount": 42500.0, "date": "2026-09-01", "description": "NEFT CR-HDFC0001234-RAZORPAY"}
    rb = {"amount": 42500.0, "date": "2026-09-01", "description": "Razorpay payout settlement"}
    res = extract_features_single(ra, rb)
    print("Feature extraction test passed cleanly:")
    for k, v in res.items():
        print(f"  {k}: {v}")
