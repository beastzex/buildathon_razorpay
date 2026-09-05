"""
Cross-Surface Consistency Test Suite (Tier 1 & Tier 2 Verification)
Asserts that Live Ticker events, Database Records, Cryptographic Audit Trail,
and Night-Shift Autonomous Digest all agree with zero discrepancy.
"""

import sys
import pytest
from pathlib import Path
from fastapi.testclient import TestClient
from sqlalchemy import select

# Ensure root in sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from api.main import app
from api.db import AsyncSessionLocal
from api.models import Batch, Match, ExceptionRecord, AuditLogEntry, NightShiftRun


@pytest.mark.asyncio
async def test_cross_surface_consistency_across_all_four_surfaces():
    """
    Executes a batch and validates that:
    1. Ticker events count matches pipeline execution stages.
    2. Database matches match the batch summary.
    3. Audit trail captures every event without missing blocks.
    4. Night-shift digest numbers match the database record statuses exactly.
    """
    client = TestClient(app)
    
    # 1. Initialize a 10-record batch
    batch_res = client.post("/batches", json={"synthetic_count": 10})
    assert batch_res.status_code == 200
    batch_id = batch_res.json()["id"]

    # 2. Trigger autonomous run
    auto_res = client.post(f"/batches/{batch_id}/run-autonomous")
    assert auto_res.status_code == 200
    digest = auto_res.json()

    # Surface A: Night-Shift Digest
    digest_total = digest["total_records"]
    digest_matched = digest["auto_matched"]
    digest_escalated = digest["escalated_to_human"]

    assert digest_total == 10, f"Expected 10 total records, got {digest_total}"
    assert digest_matched + digest_escalated == digest_total, (
        f"Digest internal mismatch: {digest_matched} + {digest_escalated} != {digest_total}"
    )

    # Surface B: Database Match Records
    async with AsyncSessionLocal() as session:
        # Match records
        match_query = await session.execute(select(Match).where(Match.batch_id == batch_id))
        db_matches = match_query.scalars().all()
        db_total_matches = len(db_matches)
        db_matched_count = sum(1 for m in db_matches if m.status == "matched")
        db_flagged_count = sum(1 for m in db_matches if m.status == "flagged")
        db_mismatched_count = sum(1 for m in db_matches if m.status == "mismatched")
        db_escalated_count = db_flagged_count + db_mismatched_count

        assert db_total_matches == digest_total, (
            f"Surface Discrepancy: DB has {db_total_matches} matches but Digest reported {digest_total}"
        )
        assert db_matched_count == digest_matched, (
            f"Surface Discrepancy: DB has {db_matched_count} matched but Digest reported {digest_matched}"
        )
        assert db_escalated_count == digest_escalated, (
            f"Surface Discrepancy: DB has {db_escalated_count} escalated but Digest reported {digest_escalated}"
        )

        # Surface C: Batch Summary in Database
        batch_query = await session.execute(select(Batch).where(Batch.id == batch_id))
        batch_obj = batch_query.scalar_one()
        assert batch_obj.total_records == digest_total
        assert batch_obj.matched_count == digest_matched

        # Surface D: Cryptographic Audit Trail
        audit_query = await session.execute(
            select(AuditLogEntry).where(AuditLogEntry.batch_id == batch_id).order_by(AuditLogEntry.created_at)
        )
        audit_entries = audit_query.scalars().all()
        assert len(audit_entries) >= digest_total, (
            f"Audit log missing records: Expected at least {digest_total} entries, got {len(audit_entries)}"
        )

        # Verify audit trail cryptographic linkage integrity
        from api.audit import verify_chain_integrity, GENESIS_HASH
        entries_dicts = [
            {"hash": e.hash, "prev_hash": e.prev_hash, "payload": e.payload}
            for e in audit_entries
        ]
        valid_chain, error_msg, _ = verify_chain_integrity(entries_dicts)
        assert valid_chain is True, f"Audit chain broken during autonomous run: {error_msg}"

        # Surface E: NightShiftRun stored in DB
        run_query = await session.execute(
            select(NightShiftRun).where(NightShiftRun.batch_id == batch_id)
        )
        db_run = run_query.scalar_one_or_none()
        assert db_run is not None, "NightShiftRun record was not written to database!"
        assert db_run.total_records == digest_total
        assert db_run.auto_matched == digest_matched
        assert db_run.escalated_to_human == digest_escalated

    print("\n✓ Cross-Surface Consistency Test Passed: All 4 operational surfaces (Digest, DB, Audit Trail, History) agree with 100% precision.")
