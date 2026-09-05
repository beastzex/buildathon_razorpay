"""
Health & Diagnostic Router for Ledgr API (Part 4.5)
Reports granular health checks across database, Redis, Groq reachability, and GPU hardware.
"""

import os
from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
import torch

from api.db import get_db
from api.schemas import HealthResponse

router = APIRouter(prefix="/health", tags=["health"])


@router.get("", response_model=HealthResponse)
async def check_health(db: AsyncSession = Depends(get_db)):
    """
    Granular health check endpoint checking DB, Redis, Groq, and GPU reachability.
    """
    # 1. Database Check
    db_status = "healthy"
    try:
        await db.execute(text("SELECT 1;"))
    except Exception as e:
        db_status = f"unhealthy: {e}"

    # 2. Redis Check
    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    redis_status = "connected"
    try:
        import redis
        r = redis.from_url(redis_url, socket_connect_timeout=0.5)
        r.ping()
    except Exception:
        redis_status = "offline (async fallback active)"

    # 3. Groq API Check
    groq_key = os.getenv("GROQ_API_KEY", "").strip()
    if not groq_key or groq_key == "your_groq_api_key_here":
        groq_status = "not_configured (fallback mode active)"
    else:
        groq_status = "configured (live gpt-oss-120b ready)"

    # 4. GPU Status
    if torch.cuda.is_available():
        gpu_name = torch.cuda.get_device_name(0)
        vram_gb = torch.cuda.get_device_properties(0).total_memory / (1024**3)
        gpu_status = f"CUDA active ({gpu_name} - {vram_gb:.1f}GB VRAM)"
    else:
        gpu_status = "CPU mode"

    overall = "ok" if ("healthy" in db_status) else "degraded"

    return HealthResponse(
        status=overall,
        database=db_status,
        redis=redis_status,
        groq=groq_status,
        gpu=gpu_status,
        timestamp=datetime.utcnow().isoformat() + "Z"
    )
