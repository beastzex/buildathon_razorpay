"""
Batches Router for Ledgr API (Part 4.3)
Handles batch creation, asynchronous pipeline triggering, and paginated record querying.
"""

import time
import uuid
import logging
from datetime import datetime
from typing import List, Optional
import numpy as np

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from api.db import get_db
from api.models import Batch, Record, Match, ExceptionRecord, AuditLogEntry
from api.schemas import (
    BatchCreateRequest, BatchSummaryResponse, TransactionRecordResponse,
    SourceDetail, RecordListResponse
)
from api.audit import compute_entry_hash, GENESIS_HASH
from models.matcher import get_matcher
from models.train_anomaly_scorer import get_anomaly_scorer
from agents.explain_exception import explain_exception
from agents.settlement_qa import get_qa_agent

logger = logging.getLogger("ledgr.api.batches")
router = APIRouter(prefix="/batches", tags=["batches"])


@router.post("", response_model=BatchSummaryResponse)
async def create_batch(
    req: BatchCreateRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Creates a reconciliation batch.
    Optionally pre-populates with authentic synthetic multi-source records.
    """
    batch_id = req.batch_id or f"batch-{int(time.time()) % 10000}"
    
    # Check if already exists
    existing = await db.execute(select(Batch).where(Batch.id == batch_id))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail=f"Batch {batch_id} already exists")

    batch = Batch(
        id=batch_id,
        created_at=datetime.utcnow(),
        source_a_label=req.source_a_label,
        source_b_label=req.source_b_label,
        status="pending",
        total_records=0
    )
    db.add(batch)

    # Add initial Genesis Audit Log Entry
    payload = {"event": "batch_created", "batch_id": batch_id, "source_a": req.source_a_label, "source_b": req.source_b_label}
    entry_hash = compute_entry_hash(GENESIS_HASH, payload)
    audit_entry = AuditLogEntry(
        id=f"AE-{uuid.uuid4().hex[:8]}",
        batch_id=batch_id,
        event_type="ingestion",
        actor="system",
        description=f"Batch {batch_id} initialized with sources: {req.source_a_label} and {req.source_b_label}",
        payload=payload,
        prev_hash=GENESIS_HASH,
        hash=entry_hash,
        created_at=datetime.utcnow()
    )
    db.add(audit_entry)
    await db.commit()
    await db.refresh(batch)

    # If synthetic records requested, load sample
    if req.load_synthetic:
        from data.generate_synthetic_batch import generate_batch
        import pandas as pd
        from pathlib import Path
        
        data_csv = Path(__file__).resolve().parent.parent.parent / "data" / "synthetic_batch_v1.csv"
        if not data_csv.exists():
            generate_batch(count=req.synthetic_count)
            
        df = pd.read_csv(data_csv)
        sample_df = df.head(req.synthetic_count)

        matcher = get_matcher()
        records_to_index = []

        for _, row in sample_df.iterrows():
            rec_id = str(row["record_id"])
            sa = {
                "id": str(row["source_a_id"]),
                "amount": float(row["source_a_amount"]),
                "date": str(row["source_a_date"]),
                "description": str(row["source_a_description"]),
                "reference": str(row["source_a_reference"])
            }
            sb = {
                "id": str(row["source_b_id"]),
                "amount": float(row["source_b_amount"]),
                "date": str(row["source_b_date"]),
                "description": str(row["source_b_description"]),
                "reference": str(row["source_b_reference"])
            }
            
            # Record A
            db.add(Record(
                id=f"{batch_id}-{rec_id}-A",
                batch_id=batch_id,
                source="sourceA",
                raw_fields=sa,
                normalized_fields=sa
            ))
            # Record B
            db.add(Record(
                id=f"{batch_id}-{rec_id}-B",
                batch_id=batch_id,
                source="sourceB",
                raw_fields=sb,
                normalized_fields=sb
            ))

            records_to_index.append({
                "id": rec_id,
                "sourceA": sa,
                "sourceB": sb,
                "status": "pending"
            })

        batch.total_records = len(sample_df)
        await db.commit()
        await db.refresh(batch)

        # Index in Settlement Q&A Agent
        qa_agent = get_qa_agent()
        qa_agent.index_batch(batch_id, records_to_index)

    return BatchSummaryResponse(
        id=batch.id,
        label=f"Batch #{batch.id}",
        runAt=batch.created_at.isoformat() + "Z",
        status=batch.status,
        matchRate=batch.match_rate,
        totalRecords=batch.total_records,
        matchedCount=batch.matched_count,
        flaggedCount=batch.flagged_count,
        mismatchedCount=batch.mismatched_count,
        avgResolutionMs=batch.avg_resolution_ms,
        p95LatencyMs=batch.p95_latency_ms,
        p99LatencyMs=batch.p99_latency_ms
    )


@router.get("", response_model=List[BatchSummaryResponse])
async def list_batches(db: AsyncSession = Depends(get_db)):
    """List all batches sorted by creation time descending."""
    res = await db.execute(select(Batch).order_by(desc(Batch.created_at)))
    batches = res.scalars().all()
    return [
        BatchSummaryResponse(
            id=b.id,
            label=f"Batch #{b.id}",
            runAt=b.created_at.isoformat() + "Z",
            status=b.status,
            matchRate=b.match_rate,
            totalRecords=b.total_records,
            matchedCount=b.matched_count,
            flaggedCount=b.flagged_count,
            mismatchedCount=b.mismatched_count,
            avgResolutionMs=b.avg_resolution_ms,
            p95LatencyMs=b.p95_latency_ms,
            p99LatencyMs=b.p99_latency_ms
        )
        for b in batches
    ]


@router.get("/{batch_id}", response_model=BatchSummaryResponse)
async def get_batch_summary(batch_id: str, db: AsyncSession = Depends(get_db)):
    """Fetch summary metrics for a specific batch."""
    res = await db.execute(select(Batch).where(Batch.id == batch_id))
    b = res.scalar_one_or_none()
    if not b:
        raise HTTPException(status_code=404, detail=f"Batch {batch_id} not found")

    return BatchSummaryResponse(
        id=b.id,
        label=f"Batch #{b.id}",
        runAt=b.created_at.isoformat() + "Z",
        status=b.status,
        matchRate=b.match_rate,
        totalRecords=b.total_records,
        matchedCount=b.matched_count,
        flaggedCount=b.flagged_count,
        mismatchedCount=b.mismatched_count,
        avgResolutionMs=b.avg_resolution_ms,
        p95LatencyMs=b.p95_latency_ms,
        p99LatencyMs=b.p99_latency_ms
    )


@router.post("/{batch_id}/run", response_model=BatchSummaryResponse)
async def run_reconciliation_pipeline(
    batch_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Executes the full autonomous reconciliation pipeline:
    normalize -> match (two-stage) -> score anomaly -> escalate exception -> audit hash chain.
    Tracks and records p95 and p99 matching latency.
    """
    res = await db.execute(select(Batch).where(Batch.id == batch_id))
    batch = res.scalar_one_or_none()
    if not batch:
        raise HTTPException(status_code=404, detail=f"Batch {batch_id} not found")

    batch.status = "running"
    await db.commit()

    matcher = get_matcher()
    anomaly_scorer = get_anomaly_scorer()

    # Get records
    rec_res = await db.execute(select(Record).where(Record.batch_id == batch_id))
    all_records = rec_res.scalars().all()

    # Group into pairs by base ID (e.g. TXN-5001-A and TXN-5001-B)
    pairs_map = {}
    for r in all_records:
        base_id = r.id.rsplit("-", 1)[0]
        pairs_map.setdefault(base_id, {})[r.source] = r

    matched_count = 0
    flagged_count = 0
    mismatched_count = 0
    latencies_ms = []

    # Get latest audit entry hash for chaining
    audit_res = await db.execute(
        select(AuditLogEntry).where(AuditLogEntry.batch_id == batch_id).order_by(desc(AuditLogEntry.created_at))
    )
    latest_audit = audit_res.scalars().first()
    prev_hash = latest_audit.hash if latest_audit else GENESIS_HASH

    qa_indexed_records = []

    for base_id, pair in pairs_map.items():
        rec_a = pair.get("sourceA")
        rec_b = pair.get("sourceB")
        if not rec_a or not rec_b:
            continue

        start_t = time.perf_counter()
        
        # 1. Matcher Two-Stage Gate
        match_result = matcher.match_pair(rec_a.normalized_fields, rec_b.normalized_fields)
        
        # 2. Anomaly Scoring
        anom_score = anomaly_scorer.score_pair(rec_a.normalized_fields, rec_b.normalized_fields)
        
        elapsed_ms = (time.perf_counter() - start_t) * 1000.0
        latencies_ms.append(elapsed_ms)

        status = match_result["status"]
        if status == "matched":
            matched_count += 1
        elif status == "flagged":
            flagged_count += 1
        else:
            mismatched_count += 1

        # 3. Create/Update Match Record
        match_record = Match(
            id=base_id,
            batch_id=batch_id,
            record_a_id=rec_a.id,
            record_b_id=rec_b.id,
            embedding_score=match_result["embedding_score"],
            rule_score=match_result["rule_score"],
            final_confidence=match_result["confidence"],
            status=status,
            anomaly_score=anom_score,
            rule_breakdown=match_result["rule_breakdown"]
        )
        db.add(match_record)

        # 4. Exception Escalation to Groq if ambiguous or mismatch
        explanation_text = None
        if match_result["requires_escalation"]:
            exp_res = explain_exception(
                rec_a.normalized_fields,
                rec_b.normalized_fields,
                match_result
            )
            explanation_text = exp_res.explanation
            
            exc = ExceptionRecord(
                id=f"EXC-{base_id}",
                match_id=base_id,
                batch_id=batch_id,
                explanation=exp_res.explanation,
                suggested_resolution=exp_res.suggested_resolution,
                confidence_reasoning=exp_res.confidence_reasoning,
                explanation_status=exp_res.explanation_status,
                resolution_status="pending"
            )
            db.add(exc)

            # Audit log entry for escalation
            esc_payload = {
                "event": "exception_escalated",
                "match_id": base_id,
                "confidence": match_result["confidence"],
                "status": status,
                "anomaly_score": anom_score,
                "explanation_status": exp_res.explanation_status
            }
            new_hash = compute_entry_hash(prev_hash, esc_payload)
            db.add(AuditLogEntry(
                id=f"AE-{uuid.uuid4().hex[:8]}",
                batch_id=batch_id,
                event_type="escalation",
                actor="ledgr-engine",
                description=f"{base_id} escalated — confidence {match_result['confidence']}%, status {status}",
                payload=esc_payload,
                prev_hash=prev_hash,
                hash=new_hash,
                created_at=datetime.utcnow()
            ))
            prev_hash = new_hash

        qa_indexed_records.append({
            "id": base_id,
            "sourceA": rec_a.normalized_fields,
            "sourceB": rec_b.normalized_fields,
            "confidence": match_result["confidence"],
            "status": status,
            "explanation": explanation_text or ""
        })

    # Update Batch Summary
    total = matched_count + flagged_count + mismatched_count
    match_rate = round((matched_count / total * 100.0), 1) if total > 0 else 0.0
    avg_ms = float(np.mean(latencies_ms)) if latencies_ms else 0.0
    p95_ms = float(np.percentile(latencies_ms, 95)) if latencies_ms else 0.0
    p99_ms = float(np.percentile(latencies_ms, 99)) if latencies_ms else 0.0

    batch.status = "completed"
    batch.total_records = total
    batch.matched_count = matched_count
    batch.flagged_count = flagged_count
    batch.mismatched_count = mismatched_count
    batch.match_rate = match_rate
    batch.avg_resolution_ms = round(avg_ms, 2)
    batch.p95_latency_ms = round(p95_ms, 2)
    batch.p99_latency_ms = round(p99_ms, 2)

    # Pipeline Complete Audit Entry
    completion_payload = {
        "event": "pipeline_completed",
        "batch_id": batch_id,
        "total_records": total,
        "matched": matched_count,
        "flagged": flagged_count,
        "mismatched": mismatched_count,
        "match_rate": match_rate,
        "p95_ms": p95_ms
    }
    comp_hash = compute_entry_hash(prev_hash, completion_payload)
    db.add(AuditLogEntry(
        id=f"AE-{uuid.uuid4().hex[:8]}",
        batch_id=batch_id,
        event_type="match",
        actor="ledgr-engine",
        description=f"Pipeline run completed. {matched_count} matched, {flagged_count} flagged, {mismatched_count} mismatched.",
        payload=completion_payload,
        prev_hash=prev_hash,
        hash=comp_hash,
        created_at=datetime.utcnow()
    ))

    await db.commit()
    await db.refresh(batch)

    # Refresh QA vector index
    qa_agent = get_qa_agent()
    qa_agent.index_batch(batch_id, qa_indexed_records)

    return BatchSummaryResponse(
        id=batch.id,
        label=f"Batch #{batch.id}",
        runAt=batch.created_at.isoformat() + "Z",
        status=batch.status,
        matchRate=batch.match_rate,
        totalRecords=batch.total_records,
        matchedCount=batch.matched_count,
        flaggedCount=batch.flagged_count,
        mismatchedCount=batch.mismatched_count,
        avgResolutionMs=batch.avg_resolution_ms,
        p95LatencyMs=batch.p95_latency_ms,
        p99LatencyMs=batch.p99_latency_ms
    )


@router.get("/{batch_id}/records", response_model=RecordListResponse)
async def get_batch_records(
    batch_id: str,
    status: Optional[str] = Query(None, description="Filter by status: 'matched', 'flagged', 'mismatched'"),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns paginated, filterable reconciliation records matching frontend TransactionRecord shape.
    """
    query = (
        select(Match, ExceptionRecord)
        .outerjoin(ExceptionRecord, Match.id == ExceptionRecord.match_id)
        .where(Match.batch_id == batch_id)
    )
    if status:
        query = query.where(Match.status == status)

    # Order by anomaly score desc so highest-risk items appear first
    query = query.order_by(desc(Match.anomaly_score))

    res = await db.execute(query)
    rows = res.all()

    # Load normalized source fields
    rec_res = await db.execute(select(Record).where(Record.batch_id == batch_id))
    all_recs = {r.id: r.normalized_fields for r in rec_res.scalars().all()}

    txns = []
    for row in rows:
        m = row[0]
        exc = row[1]
        
        sa_data = all_recs.get(m.record_a_id, {})
        sb_data = all_recs.get(m.record_b_id, {})
        display_id = f"TXN-{m.id.split('TXN-')[-1]}" if "TXN-" in m.id else m.id

        txns.append(TransactionRecordResponse(
            id=display_id,
            sourceA=SourceDetail(
                id=sa_data.get("id", "BNK"),
                amount=float(sa_data.get("amount", 0.0)),
                date=str(sa_data.get("date", "")),
                description=str(sa_data.get("description", "")),
                reference=str(sa_data.get("reference", ""))
            ),
            sourceB=SourceDetail(
                id=sb_data.get("id", "GW"),
                amount=float(sb_data.get("amount", 0.0)),
                date=str(sb_data.get("date", "")),
                description=str(sb_data.get("description", "")),
                reference=str(sb_data.get("reference", ""))
            ),
            confidence=m.final_confidence,
            status=m.status,
            anomaly_score=m.anomaly_score,
            explanation=exc.explanation if exc else None,
            suggested_resolution=exc.suggested_resolution if exc else None,
            explanation_status=exc.explanation_status if exc else None
        ))

    # Pagination slice
    start_idx = (page - 1) * page_size
    paged_txns = txns[start_idx : start_idx + page_size]

    return RecordListResponse(
        batch_id=batch_id,
        total=len(txns),
        page=page,
        page_size=page_size,
        records=paged_txns
    )
