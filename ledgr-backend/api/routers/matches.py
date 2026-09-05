"""
Matches Router for Ledgr API (Part 4.3)
Provides detailed pairwise match view for the slide-over inspection panel.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from api.db import get_db
from api.models import Match, Record, ExceptionRecord
from api.schemas import MatchDetailResponse

router = APIRouter(prefix="/matches", tags=["matches"])


@router.get("/{match_id}", response_model=MatchDetailResponse)
async def get_match_detail(match_id: str, db: AsyncSession = Depends(get_db)):
    """
    Returns full breakdown of matching signals, rule scores, and anomaly rating for side panel.
    """
    res = await db.execute(
        select(Match).where((Match.id == match_id) | (Match.id.endswith(f"-{match_id}")))
    )
    m = res.scalars().first()
    if not m:
        raise HTTPException(status_code=404, detail=f"Match {match_id} not found")

    rec_a_res = await db.execute(select(Record).where(Record.id == m.record_a_id))
    rec_b_res = await db.execute(select(Record).where(Record.id == m.record_b_id))
    rec_a = rec_a_res.scalar_one_or_none()
    rec_b = rec_b_res.scalar_one_or_none()

    exc_res = await db.execute(select(ExceptionRecord).where(ExceptionRecord.match_id == match_id))
    exc = exc_res.scalar_one_or_none()

    display_id = f"TXN-{m.id.split('TXN-')[-1]}" if "TXN-" in m.id else m.id

    return MatchDetailResponse(
        id=display_id,
        batch_id=m.batch_id,
        record_a=rec_a.normalized_fields if rec_a else {},
        record_b=rec_b.normalized_fields if rec_b else {},
        embedding_score=m.embedding_score,
        rule_score=m.rule_score,
        final_confidence=m.final_confidence,
        status=m.status,
        anomaly_score=m.anomaly_score,
        rule_breakdown=m.rule_breakdown,
        explanation={
            "explanation": exc.explanation,
            "suggested_resolution": exc.suggested_resolution,
            "confidence_reasoning": exc.confidence_reasoning,
            "explanation_status": exc.explanation_status,
            "resolution_status": exc.resolution_status
        } if exc else None
    )
