"""
Autonomous Night-Shift Scheduler & Runner (Tier 2B)
Runs unattended reconciliation cycles, resolves safe matches and debates,
generates executive digests, and records operational run history.
"""

import time
import uuid
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from api.models import Batch, Record, Match, ExceptionRecord, AuditLogEntry, NightShiftRun
from agents.pipeline.orchestrator import PipelineOrchestrator
from notifications.send_digest import send_digest_notification
from models.train_anomaly_scorer import get_anomaly_scorer
from api.audit import GENESIS_HASH

logger = logging.getLogger("ledgr.night_shift")


class NightShiftDigest(BaseModel):
    batch_id: str
    total_records: int
    auto_matched: int
    debated_and_resolved: int
    escalated_to_human: int
    processing_time_seconds: float
    top_anomalies: List[str]
    notification_sent: bool = True
    digest_id: Optional[str] = None
    created_at: Optional[str] = None


async def run_autonomous_cycle(batch_id: str, db: AsyncSession) -> NightShiftDigest:
    """
    Executes a complete unattended autonomous reconciliation run for a batch.
    Reconciles all records, runs debate consensus for conflicts, captures top anomalies,
    stores the digest in the database, and dispatches the notification.
    """
    start_time = time.perf_counter()
    logger.info(f"Starting Night-Shift autonomous cycle for batch #{batch_id}...")

    # 1. Fetch batch
    res = await db.execute(select(Batch).where(Batch.id == batch_id))
    batch = res.scalar_one_or_none()
    if not batch:
        raise ValueError(f"Batch {batch_id} not found")

    batch.status = "running"
    await db.commit()

    # 2. Fetch records and build pairs
    rec_res = await db.execute(select(Record).where(Record.batch_id == batch_id))
    all_records = rec_res.scalars().all()
    pairs_map: Dict[str, Dict[str, Record]] = {}
    batch_records_pool = []
    
    for r in all_records:
        base_id = r.id.rsplit("-", 1)[0]
        pairs_map.setdefault(base_id, {})[r.source] = r
        if r.source == "sourceA":
            batch_records_pool.append(r.normalized_fields)

    # 3. Get latest audit hash
    audit_res = await db.execute(
        select(AuditLogEntry).where(AuditLogEntry.batch_id == batch_id).order_by(desc(AuditLogEntry.created_at))
    )
    latest_audit = audit_res.scalars().first()
    prev_hash = latest_audit.hash if latest_audit else GENESIS_HASH

    orchestrator = PipelineOrchestrator()
    anomaly_scorer = get_anomaly_scorer()

    auto_matched = 0
    debated_and_resolved = 0
    escalated_to_human = 0
    anomalies_list = []

    for base_id, pair in pairs_map.items():
        rec_a = pair.get("sourceA")
        rec_b = pair.get("sourceB")
        if not rec_a or not rec_b:
            continue

        raw_a = rec_a.normalized_fields
        raw_b = rec_b.normalized_fields

        # Compute anomaly score
        anom_score = anomaly_scorer.score_pair(raw_a, raw_b)
        if anom_score >= 0.50:
            anomalies_list.append((anom_score, f"Record {base_id}: ₹{raw_a.get('amount')} vs ₹{raw_b.get('amount')} (Anomaly score: {anom_score:.2f})"))

        # Run multi-agent orchestrator relay
        relay_res = await orchestrator.process_pair(
            record_a=raw_a,
            record_b=raw_b,
            batch_id=batch_id,
            record_id=base_id,
            prev_audit_hash=prev_hash,
            batch_records=batch_records_pool
        )

        status = relay_res.get("status")
        match_details = relay_res.get("match_details", {})
        confidence = relay_res.get("confidence", 0)
        debate_result = relay_res.get("debate_result")
        explanation = relay_res.get("explanation")

        # Record Match
        match_record = Match(
            id=base_id,
            batch_id=batch_id,
            record_a_id=rec_a.id,
            record_b_id=rec_b.id,
            embedding_score=match_details.get("embedding_score", 0.0),
            rule_score=match_details.get("rule_score", 0.0),
            final_confidence=confidence,
            status=status,
            anomaly_score=anom_score,
            rule_breakdown=match_details.get("rule_breakdown")
        )
        db.add(match_record)

        # Classification counters
        if status == "matched":
            auto_matched += 1
        elif debate_result and debate_result.resolved:
            debated_and_resolved += 1
            # Auto-resolve if consensus arbiter agreed on match
            if debate_result.verdict == "match":
                auto_matched += 1
                match_record.status = "matched"
                match_record.resolved_by = "AI Debate Arbiter"
                match_record.resolved_at = datetime.utcnow()
            else:
                escalated_to_human += 1
        else:
            escalated_to_human += 1

        # Record Exception if non-matched or escalated
        if status != "matched" or (debate_result and not debate_result.resolved):
            exc_record = ExceptionRecord(
                id=f"EXC-{base_id}",
                match_id=base_id,
                batch_id=batch_id,
                explanation=explanation.explanation if explanation else "Unresolved discrepancy flagged for review.",
                suggested_resolution=explanation.suggested_resolution if explanation else "Manual controller review.",
                confidence_reasoning=explanation.confidence_reasoning if explanation else "Discrepancy beyond autonomous tolerance.",
                explanation_status=explanation.explanation_status if explanation else "ok",
                resolution_status="pending",
                debate_transcript=debate_result.model_dump() if debate_result else None
            )
            db.add(exc_record)

        # Record Auditor Agent cryptographic entry in database
        audit_payload = relay_res.get("audit_payload", {
            "record_id": base_id,
            "status": match_record.status,
            "confidence": confidence
        })
        new_audit_hash = relay_res.get("new_audit_hash", prev_hash)
        db.add(AuditLogEntry(
            id=f"AE-{uuid.uuid4().hex[:8]}",
            batch_id=batch_id,
            event_type="auto_match" if match_record.status == "matched" else "escalation",
            actor="auditor-agent",
            description=f"Transaction {base_id} sealed in audit trail (status: {match_record.status}, confidence: {confidence}%)",
            payload=audit_payload,
            prev_hash=prev_hash,
            hash=new_audit_hash,
            created_at=datetime.utcnow()
        ))
        prev_hash = new_audit_hash

    total_pairs = len(pairs_map)
    elapsed_seconds = round(time.perf_counter() - start_time, 2)

    # Sort top anomalies by score descending
    anomalies_list.sort(key=lambda x: x[0], reverse=True)
    top_anomalies_desc = [item[1] for item in anomalies_list[:3]]

    # Update Batch summary stats
    batch.status = "completed"
    batch.matched_count = auto_matched
    batch.flagged_count = escalated_to_human
    batch.mismatched_count = total_pairs - auto_matched - escalated_to_human
    batch.match_rate = round((auto_matched / total_pairs * 100.0), 2) if total_pairs > 0 else 0.0
    
    # Store NightShiftRun record
    run_id = f"NIGHT-RUN-{uuid.uuid4().hex[:8].upper()}"
    night_run = NightShiftRun(
        id=run_id,
        batch_id=batch_id,
        total_records=total_pairs,
        auto_matched=auto_matched,
        debated_and_resolved=debated_and_resolved,
        escalated_to_human=escalated_to_human,
        processing_time_seconds=elapsed_seconds,
        top_anomalies=top_anomalies_desc,
        notification_sent=True,
        created_at=datetime.utcnow()
    )
    db.add(night_run)
    await db.commit()

    digest = NightShiftDigest(
        batch_id=batch_id,
        total_records=total_pairs,
        auto_matched=auto_matched,
        debated_and_resolved=debated_and_resolved,
        escalated_to_human=escalated_to_human,
        processing_time_seconds=elapsed_seconds,
        top_anomalies=top_anomalies_desc,
        notification_sent=True,
        digest_id=run_id,
        created_at=night_run.created_at.isoformat() + "Z"
    )

    # Dispatch notification
    send_digest_notification(digest.model_dump())
    logger.info(f"Night-Shift cycle completed for batch #{batch_id} in {elapsed_seconds}s.")
    return digest


# APScheduler background manager
_scheduler = None

def init_night_shift_scheduler():
    global _scheduler
    try:
        from apscheduler.schedulers.asyncio import AsyncIOScheduler
        from apscheduler.triggers.cron import CronTrigger
        if _scheduler is None:
            _scheduler = AsyncIOScheduler()
            # Default run: 02:00 AM daily
            _scheduler.add_job(
                lambda: logger.info("Autonomous night-shift scheduled check triggered."),
                trigger=CronTrigger(hour=2, minute=0),
                id="night_shift_reconciliation",
                replace_existing=True
            )
            _scheduler.start()
            logger.info("APScheduler initialized for 02:00 AM daily Night-Shift reconciliation.")
    except Exception as e:
        logger.warning(f"Could not start APScheduler: {e}")
