"""
Exceptions Router for Ledgr API (Part 4.3)
Handles human-in-the-loop exception resolution actions (Confirm Match / Mark as Mismatch).
Appends cryptographic hash-chained audit event on every state change.
"""

import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from api.db import get_db
from api.models import Match, ExceptionRecord, AuditLogEntry, Batch
from api.schemas import ResolveExceptionRequest, ResolveExceptionResponse
from api.audit import compute_entry_hash, GENESIS_HASH

router = APIRouter(prefix="/exceptions", tags=["exceptions"])


@router.post("/{match_id}/resolve", response_model=ResolveExceptionResponse)
async def resolve_exception(
    match_id: str,
    req: ResolveExceptionRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Resolves an escalated exception:
    - 'confirm': Human controller overrides/approves match -> status becomes 'matched'
    - 'reject': Human controller rejects match -> status becomes 'mismatched'
    Appends audit log entry into the cryptographic hash chain.
    """
    res = await db.execute(
        select(Match).where((Match.id == match_id) | (Match.id.endswith(f"-{match_id}")))
    )
    m = res.scalars().first()
    if not m:
        raise HTTPException(status_code=404, detail=f"Match/Exception {match_id} not found")

    exc_res = await db.execute(select(ExceptionRecord).where(ExceptionRecord.match_id == match_id))
    exc = exc_res.scalar_one_or_none()

    new_match_status = "matched" if req.action.lower() == "confirm" else "mismatched"
    resolution_status = "confirmed" if req.action.lower() == "confirm" else "rejected"

    m.status = new_match_status
    m.resolved_by = req.actor
    m.resolved_at = datetime.utcnow()

    if exc:
        exc.resolution_status = resolution_status

    # Get latest audit entry hash
    audit_res = await db.execute(
        select(AuditLogEntry).where(AuditLogEntry.batch_id == m.batch_id).order_by(desc(AuditLogEntry.created_at))
    )
    latest_audit = audit_res.scalars().first()
    prev_hash = latest_audit.hash if latest_audit else GENESIS_HASH

    event_id = f"AE-{uuid.uuid4().hex[:8]}"
    payload = {
        "event": "exception_resolved",
        "match_id": match_id,
        "action": req.action,
        "new_status": new_match_status,
        "actor": req.actor,
        "notes": req.notes,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
    new_hash = compute_entry_hash(prev_hash, payload)

    audit_entry = AuditLogEntry(
        id=event_id,
        batch_id=m.batch_id,
        event_type="resolution",
        actor=req.actor,
        description=f"{match_id} resolved by {req.actor} ({req.action.upper()}) -> marked {new_match_status}",
        payload=payload,
        prev_hash=prev_hash,
        hash=new_hash,
        created_at=datetime.utcnow()
    )
    db.add(audit_entry)

    # Recalculate batch statistics
    batch_res = await db.execute(select(Batch).where(Batch.id == m.batch_id))
    b = batch_res.scalar_one_or_none()
    if b:
        all_matches_res = await db.execute(select(Match).where(Match.batch_id == m.batch_id))
        all_matches = all_matches_res.scalars().all()
        matched = sum(1 for match in all_matches if match.status == "matched")
        flagged = sum(1 for match in all_matches if match.status == "flagged")
        mismatched = sum(1 for match in all_matches if match.status == "mismatched")
        total = len(all_matches)
        
        b.matched_count = matched
        b.flagged_count = flagged
        b.mismatched_count = mismatched
        b.match_rate = round((matched / total * 100.0), 1) if total > 0 else 0.0

    await db.commit()

    display_id = f"TXN-{m.id.split('TXN-')[-1]}" if "TXN-" in m.id else m.id

    return ResolveExceptionResponse(
        match_id=display_id,
        status=new_match_status,
        resolution_status=resolution_status,
        resolved_by=req.actor,
        resolved_at=datetime.utcnow().isoformat() + "Z",
        audit_event_id=event_id
    )
