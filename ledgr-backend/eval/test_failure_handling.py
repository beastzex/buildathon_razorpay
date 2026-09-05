"""
Failure Handling & Graceful Degradation Test Suite (Part 5.4)
Validates that the reconciliation pipeline degrades gracefully under corrupted,
malformed, or adversary inputs without crashing or silently misclassifying transactions.
"""

import sys
import pytest
from pathlib import Path

# Ensure root in sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from models.rule_verifier import rule_verifier
from models.matcher import get_matcher
from agents.explain_exception import explain_exception, generate_fallback_explanation


def test_malformed_date_format():
    """
    Asserts that completely invalid date strings (e.g. 'invalid-date-format')
    fail date verification and do not crash or auto-match.
    """
    matcher = get_matcher()
    ra = {
        "id": "ERR-001",
        "amount": 15000.0,
        "date": "CORRUPTED_DATE_###",
        "description": "Standard vendor payment",
        "reference": "REF-123456"
    }
    rb = {
        "id": "ERR-002",
        "amount": 15000.0,
        "date": "2026-09-01",
        "description": "Standard vendor payout",
        "reference": "REF-123456"
    }

    res = matcher.match_pair(ra, rb)
    # Must NOT auto-match on corrupted date
    assert res["status"] in ("flagged", "mismatched")
    assert res["requires_escalation"] is True
    assert res["rule_breakdown"]["date"]["pass"] is False


def test_truncated_corrupted_description():
    """
    Asserts that empty or single-character truncated descriptions do not trigger exceptions.
    """
    matcher = get_matcher()
    ra = {
        "id": "ERR-003",
        "amount": 5000.0,
        "date": "2026-09-01",
        "description": "",
        "reference": "REF-998877"
    }
    rb = {
        "id": "ERR-004",
        "amount": 5000.0,
        "date": "2026-09-01",
        "description": "X",
        "reference": "REF-998877"
    }

    res = matcher.match_pair(ra, rb)
    # Neural embedding handles empty/short string gracefully without crashing
    assert "status" in res
    assert "confidence" in res
    assert 0 <= res["confidence"] <= 100


def test_negative_amount_degradation():
    """
    Asserts that negative or zero amounts fail amount verification immediately.
    """
    ra = {"amount": -500.0, "date": "2026-09-01", "reference": "REF-11"}
    rb = {"amount": 500.0, "date": "2026-09-01", "reference": "REF-11"}
    rule_pass, rule_score, detail = rule_verifier(ra, rb)

    assert rule_pass is False
    assert rule_score < 0.60
    assert detail["amount"]["pass"] is False


def test_groq_timeout_graceful_fallback():
    """
    Demonstrates that if the Groq LLM reasoning agent is unreachable or times out,
    it returns structured output with explanation_status: 'unavailable' and routes
    to manual review without crashing the reconciliation job.
    """
    ra = {"id": "TXN-ERR", "amount": 11500.0, "date": "2026-09-01", "description": "Bank transfer"}
    rb = {"id": "GW-ERR", "amount": 9800.0, "date": "2026-09-01", "description": "Gateway payout"}
    match_details = {
        "confidence": 48,
        "rule_breakdown": {
            "amount": {"detail": {"is_fee_candidate": False, "delta": 1700.0}}
        }
    }

    fallback = generate_fallback_explanation(
        ra, rb, match_details, error_msg="Simulated 8.0s timeout connection error"
    )

    assert fallback.explanation_status == "unavailable"
    assert "₹1,700.00" in fallback.explanation
    assert "manual" in fallback.suggested_resolution.lower() or "escalate" in fallback.explanation.lower()
    assert len(fallback.confidence_reasoning) > 0


if __name__ == "__main__":
    print("Running failure handling test suite...")
    test_malformed_date_format()
    test_truncated_corrupted_description()
    test_negative_amount_degradation()
    test_groq_timeout_graceful_fallback()
    print("All graceful degradation tests passed successfully!")
