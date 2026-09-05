"""
Audit Log Router for Ledgr API (Part 4.3 & 4.4)
Exposes the tamper-evident audit trail and cryptographic hash-chain verification endpoint.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from api.db import get_db
from api.models import AuditLogEntry
from api.schemas import AuditEntryResponse, AuditVerifyResponse
from api.audit import verify_chain_integrity

router = APIRouter(prefix="/audit", tags=["audit"])


@router.get("/{batch_id}", response_model=List[AuditEntryResponse])
async def get_audit_trail(
    batch_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Returns the complete chronological audit trail for a batch.
    """
    res = await db.execute(
        select(AuditLogEntry)
        .where(AuditLogEntry.batch_id == batch_id)
        .order_by(AuditLogEntry.created_at.asc(), AuditLogEntry.id.asc())
    )
    entries = res.scalars().all()

    return [
        AuditEntryResponse(
            id=e.id,
            timestamp=e.created_at.isoformat() + "Z",
            type=e.event_type,
            description=e.description,
            hash=e.hash,
            prev_hash=e.prev_hash,
            actor=e.actor,
            payload=e.payload
        )
        for e in entries
    ]


@router.post("/{batch_id}/verify", response_model=AuditVerifyResponse)
async def verify_audit_trail(
    batch_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Cryptographically verifies the hash-chain integrity of the batch audit trail:
    Recomputes SHA256(prev_hash + canonical_json(payload)) from the Genesis block to current.
    Guarantees no logs have been tampered with or modified.
    """
    res = await db.execute(
        select(AuditLogEntry)
        .where(AuditLogEntry.batch_id == batch_id)
        .order_by(AuditLogEntry.created_at.asc(), AuditLogEntry.id.asc())
    )
    entries = res.scalars().all()

    if not entries:
        return AuditVerifyResponse(
            batch_id=batch_id,
            is_valid=True,
            verified_count=0,
            status="EMPTY",
            message="No audit entries found for this batch."
        )

    dict_entries = [
        {
            "id": e.id,
            "prev_hash": e.prev_hash,
            "hash": e.hash,
            "payload": e.payload
        }
        for e in entries
    ]

    is_valid, err_msg, count = verify_chain_integrity(dict_entries)

    if is_valid:
        return AuditVerifyResponse(
            batch_id=batch_id,
            is_valid=True,
            verified_count=count,
            status="VERIFIED",
            message=f"Cryptographic hash chain verified. All {count} audit events are tamper-free."
        )
    else:
        return AuditVerifyResponse(
            batch_id=batch_id,
            is_valid=False,
            verified_count=count,
            status="TAMPERED",
            message=f"Audit chain verification failed: {err_msg}"
        )
