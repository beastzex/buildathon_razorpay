"""
Ledgr AI Reconciliation Engine & Controller Backend (Main Entrypoint)
FastAPI async application with CORS, request profiling, error handlers, and DB initialization.
"""

import os
import sys
import time
import uuid
import logging
from pathlib import Path
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from dotenv import load_dotenv
load_dotenv()

# Ensure root in sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

from api.db import init_db, AsyncSessionLocal
from api.models import Batch, Record, Match, ExceptionRecord, AuditLogEntry
from api.audit import compute_entry_hash, GENESIS_HASH
from api.routers import batches, matches, exceptions, qa, audit, health, portfolio

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("ledgr.api.main")


async def seed_default_batch_if_empty():
    """
    Seeds 'batch-214' matching the 20 transactions from the frontend specification
    including records, matches, exceptions, and audit entries.
    """
    from sqlalchemy import select, func
    from data.canonical_transactions import CANONICAL_20_TRANSACTIONS
    from agents.settlement_qa import get_qa_agent

    async with AsyncSessionLocal() as session:
        res = await session.execute(select(Batch).where(Batch.id == "batch-214"))
        b = res.scalar_one_or_none()
        if not b:
            logger.info("Database empty: Seeding reference Batch #214...")
            b = Batch(
                id="batch-214",
                source_a_label="HDFC Bank Statement",
                source_b_label="Razorpay Settlement File",
                status="completed",
                total_records=20,
                matched_count=16,
                flagged_count=2,
                mismatched_count=2,
                match_rate=97.4,
                avg_resolution_ms=1800.0,
                p95_latency_ms=2100.0,
                p99_latency_ms=2350.0
            )
            session.add(b)
            await session.commit()
            await session.refresh(b)

        # Check if Records exist for batch-214
        rec_count = (await session.execute(
            select(func.count(Record.id)).where(Record.batch_id == "batch-214")
        )).scalar()

        if rec_count == 0:
            logger.info("Seeding 20 canonical transactions for Batch #214...")
            qa_records = []
            for txn in CANONICAL_20_TRANSACTIONS:
                rec_id = txn["id"]
                sa = txn["sourceA"]
                sb = txn["sourceB"]
                status = txn["status"]
                conf = txn["confidence"]

                rec_a_id = f"batch-214-{rec_id}-A"
                rec_b_id = f"batch-214-{rec_id}-B"
                match_id = f"batch-214-{rec_id}"

                session.add(Record(
                    id=rec_a_id,
                    batch_id="batch-214",
                    source="sourceA",
                    raw_fields=sa,
                    normalized_fields=sa
                ))
                session.add(Record(
                    id=rec_b_id,
                    batch_id="batch-214",
                    source="sourceB",
                    raw_fields=sb,
                    normalized_fields=sb
                ))

                session.add(Match(
                    id=match_id,
                    batch_id="batch-214",
                    record_a_id=rec_a_id,
                    record_b_id=rec_b_id,
                    embedding_score=conf / 100.0,
                    rule_score=conf / 100.0,
                    final_confidence=conf,
                    status=status,
                    anomaly_score=0.85 if status == "mismatched" else (0.45 if status == "flagged" else 0.05),
                    rule_breakdown={
                        "amount": 1.0 if status == "matched" else 0.5,
                        "date": 1.0 if "lag" not in sb.get("description", "") else 0.7,
                        "reference": 0.95
                    }
                ))

                if status != "matched":
                    session.add(ExceptionRecord(
                        id=f"EXC-{match_id}",
                        match_id=match_id,
                        batch_id="batch-214",
                        explanation=txn.get("explanation", f"Discrepancy in {rec_id}"),
                        suggested_resolution="Confirm fee deduction" if status == "flagged" else "Manual review required",
                        confidence_reasoning="Discrepancy beyond automatic threshold",
                        explanation_status="available",
                        resolution_status="pending"
                    ))

                qa_records.append({
                    "id": rec_id,
                    "sourceA": sa,
                    "sourceB": sb,
                    "status": status,
                    "confidence": conf
                })

            b.total_records = 20
            await session.commit()
            logger.info("Batch #214 canonical records and matches successfully seeded.")

            try:
                qa_agent = get_qa_agent()
                qa_agent.index_batch("batch-214", qa_records)
            except Exception as e:
                logger.warning(f"QA indexing on seed: {e}")

        # Check Audit Log entries
        audit_count = (await session.execute(
            select(func.count(AuditLogEntry.id)).where(AuditLogEntry.batch_id == "batch-214")
        )).scalar()

        if audit_count == 0:
            from datetime import datetime, timedelta
            prev_hash = GENESIS_HASH
            events_data = [
                ("ingestion", "Bank statement ingested — 20 records from HDFC Bank API.", {"records": 20, "source": "HDFC"}),
                ("ingestion", "Gateway records ingested — 20 records from Razorpay settlement API.", {"records": 20, "source": "Razorpay"}),
                ("match", "Two-stage matching complete. 15 matched, 3 flagged, 2 mismatched.", {"matched": 15, "flagged": 3, "mismatched": 2}),
                ("escalation", "TXN-4003 escalated — confidence 71%, fee delta ₹12.", {"match_id": "TXN-4003", "confidence": 71}),
                ("escalation", "TXN-4006 escalated — confirmed mismatch, ₹1,700 discrepancy.", {"match_id": "TXN-4006", "confidence": 48}),
                ("escalation", "TXN-4009 escalated — confidence 73%, amount delta ₹12.", {"match_id": "TXN-4009", "confidence": 73}),
                ("escalation", "TXN-4019 escalated — confirmed mismatch, ₹4,400 discrepancy.", {"match_id": "TXN-4019", "confidence": 32})
            ]

            base_time = datetime(2026, 9, 1, 10, 0, 0)
            for i, (etype, desc, payload) in enumerate(events_data):
                curr_hash = compute_entry_hash(prev_hash, payload)
                session.add(AuditLogEntry(
                    id=f"AE-00{i+1}",
                    batch_id="batch-214",
                    event_type=etype,
                    actor="ledgr-engine",
                    description=desc,
                    payload=payload,
                    prev_hash=prev_hash,
                    hash=curr_hash,
                    created_at=base_time + timedelta(seconds=i)
                ))
                prev_hash = curr_hash

            await session.commit()
            logger.info("Batch #214 successfully seeded with valid cryptographic hash chain.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Initializing Ledgr backend services and database schema...")
    await init_db()
    await seed_default_batch_if_empty()
    try:
        from scheduler.night_shift import init_night_shift_scheduler
        init_night_shift_scheduler()
    except Exception as e:
        logger.warning(f"Night-shift scheduler init skipped: {e}")
    logger.info("Ledgr backend is ready for high-throughput reconciliation requests.")
    yield
    # Shutdown
    logger.info("Shutting down Ledgr backend services.")


app = FastAPI(
    title="Ledgr AI Reconciliation Engine",
    description="Autonomous AI Finance Controller for Multi-Source Reconciliation, Anomaly Scoring, and Settlement Q&A",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware allowing Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_process_time_and_request_id(request: Request, call_next):
    request_id = str(uuid.uuid4())
    start_time = time.perf_counter()
    
    response = await call_next(request)
    
    process_time = (time.perf_counter() - start_time) * 1000.0
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Response-Time-Ms"] = f"{process_time:.2f}"
    return response


# Mount Routers
app.include_router(health.router)
app.include_router(batches.router)
app.include_router(matches.router)
app.include_router(exceptions.router)
app.include_router(qa.router)
app.include_router(audit.router)
app.include_router(portfolio.router)


@app.get("/")
async def root():
    return {
        "service": "Ledgr AI Finance Controller API",
        "status": "online",
        "docs_url": "/docs",
        "version": "1.0.0"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=True)
