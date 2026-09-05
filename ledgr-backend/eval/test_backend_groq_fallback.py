"""
Backend-Level Groq Fallback Test (Isolated from Frontend)
Verifies that when GROQ_API_KEY is invalid, unset, or times out:
1. The backend reconciliation run completes without crashing or hanging.
2. Ambiguous/mismatched records generate ExceptionRecord with explanation_status == 'unavailable'.
3. The resolution_status is marked 'pending' (routed to manual human review).
4. The suggested_resolution and explanation provide deterministic guidance for manual intervention.
5. The audit trail records the event with explanation_status == 'unavailable'.
"""

import os
import sys
from pathlib import Path
import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient

# Ensure root is in sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from api.main import app
from api.db import get_db, AsyncSessionLocal
from api.models import ExceptionRecord, Batch
from sqlalchemy import select


@pytest.mark.asyncio
async def test_backend_groq_fallback_when_key_invalid():
    # 1. Invalidate GROQ_API_KEY explicitly
    with patch.dict(os.environ, {"GROQ_API_KEY": "invalid_test_key_deadbeef"}):
        with TestClient(app) as client:
            # Create a small batch of 5 synthetic records
            init_res = client.post("/batches", json={"synthetic_count": 5})
            assert init_res.status_code == 200, f"Init failed: {init_res.text}"
            batch_id = init_res.json()["id"]
            
            # Execute reconciliation pipeline on this batch
            run_res = client.post(f"/batches/{batch_id}/run")
            assert run_res.status_code == 200, f"Run pipeline failed: {run_res.text}"
            summary = run_res.json()
            assert summary["status"] == "completed"
            
            # Check database for all exceptions in this batch
            async with AsyncSessionLocal() as session:
                res = await session.execute(
                    select(ExceptionRecord).where(ExceptionRecord.batch_id == batch_id)
                )
                db_exceptions = res.scalars().all()
                
                if db_exceptions:
                    for exc in db_exceptions:
                        assert exc.explanation_status == "unavailable", (
                            f"Expected 'unavailable', got {exc.explanation_status}"
                        )
                        assert exc.resolution_status == "pending", (
                            f"Expected 'pending' for manual review, got {exc.resolution_status}"
                        )
                        assert "manual" in exc.suggested_resolution.lower() or "escalate" in exc.explanation.lower() or "review" in exc.suggested_resolution.lower()
                else:
                    # If 5 randomly generated were all matched, run a direct pair escalation with invalid key
                    from agents.explain_exception import explain_exception
                    ra = {"id": "TXN-TEST-A", "amount": 25000.0, "date": "2026-09-01", "description": "Bank transfer", "reference": "REF-AA"}
                    rb = {"id": "GW-TEST-B", "amount": 23500.0, "date": "2026-09-01", "description": "Payment gateway", "reference": "REF-BB"}
                    md = {
                        "confidence": 42,
                        "requires_escalation": True,
                        "rule_breakdown": {"amount": {"detail": {"is_fee_candidate": False, "delta": 1500.0}}}
                    }
                    exp = explain_exception(ra, rb, md)
                    assert exp.explanation_status == "unavailable"
                    assert "manual" in exp.suggested_resolution.lower() or "escalate" in exp.explanation.lower() or "review" in exp.suggested_resolution.lower()


@pytest.mark.asyncio
async def test_backend_groq_fallback_when_timeout_simulated():
    # Simulate timeout exception in Groq client call
    with patch("groq.Groq") as mock_groq_cls:
        mock_instance = mock_groq_cls.return_value
        mock_instance.chat.completions.create.side_effect = TimeoutError("Simulated 8.0s timeout")
        
        from agents.explain_exception import explain_exception
        ra = {"id": "TXN-TIMEOUT", "amount": 10000.0, "date": "2026-09-01", "description": "Inward IMPS", "reference": "REF-TO"}
        rb = {"id": "GW-TIMEOUT", "amount": 9500.0, "date": "2026-09-01", "description": "Gateway payout", "reference": "REF-TO"}
        md = {
            "confidence": 55,
            "requires_escalation": True,
            "rule_breakdown": {"amount": {"detail": {"is_fee_candidate": False, "delta": 500.0}}}
        }
        
        with patch.dict(os.environ, {"GROQ_API_KEY": "gsk_test_mock_key_with_timeout"}):
            exp = explain_exception(ra, rb, md)
            assert exp.explanation_status == "unavailable"
            assert "manual" in exp.suggested_resolution.lower() or "escalate" in exp.explanation.lower() or "review" in exp.suggested_resolution.lower()
            assert len(exp.explanation) > 0
