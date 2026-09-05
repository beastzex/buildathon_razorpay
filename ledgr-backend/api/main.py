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
from api.routers import batches, matches, exceptions, qa, audit, health

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("ledgr.api.main")


async def seed_default_batch_if_empty():
    """
    Seeds 'batch-214' matching the 20 transactions from the frontend specification
    if the database is newly initialized.
    """
    from sqlalchemy import select
    async with AsyncSessionLocal() as session:
        res = await session.execute(select(Batch).where(Batch.id == "batch-214"))
        if res.scalar_one_or_none():
            return

        logger.info("Database empty: Seeding reference Batch #214 (20 records)...")
        b = Batch(
            id="batch-214",
            source_a_label="HDFC Bank Statement",
            source_b_label="Razorpay Settlement File",
            status="completed",
            total_records=20,
            matched_count=15,
            flagged_count=3,
            mismatched_count=2,
            match_rate=97.4,
            avg_resolution_ms=1800.0,
            p95_latency_ms=2100.0,
            p99_latency_ms=2350.0
        )
        session.add(b)

        # Seed Genesis Audit Log
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
                hash=curr_hash
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
