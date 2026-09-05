"""
Settlement Q&A Router for Ledgr API (Part 4.3)
Answers grounded natural language queries about financial batches using RAG.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from api.db import get_db
from api.models import Match, Record, ExceptionRecord
from api.schemas import QARequest, QAResponseSchema
from agents.settlement_qa import get_qa_agent

router = APIRouter(prefix="/qa", tags=["qa"])


@router.post("", response_model=QAResponseSchema)
async def ask_settlement_question(
    req: QARequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Submits a query to the Settlement Q&A Agent.
    Grounded strictly in the specified batch records with transaction ID citations.
    """
    agent = get_qa_agent()

    # If batch records not yet indexed in memory, populate from DB
    if req.batch_id not in agent._record_cache:
        match_res = await db.execute(select(Match).where(Match.batch_id == req.batch_id))
        matches = match_res.scalars().all()
        
        rec_res = await db.execute(select(Record).where(Record.batch_id == req.batch_id))
        all_recs = {r.id: r.normalized_fields for r in rec_res.scalars().all()}
        
        exc_res = await db.execute(select(ExceptionRecord).where(ExceptionRecord.batch_id == req.batch_id))
        all_excs = {e.match_id: e.explanation for e in exc_res.scalars().all()}

        records_to_index = []
        for m in matches:
            sa = all_recs.get(m.record_a_id, {})
            sb = all_recs.get(m.record_b_id, {})
            records_to_index.append({
                "id": m.id,
                "sourceA": sa,
                "sourceB": sb,
                "confidence": m.final_confidence,
                "status": m.status,
                "explanation": all_excs.get(m.id, "")
            })

        agent.index_batch(req.batch_id, records_to_index)

    response = agent.answer_question(query=req.query, batch_id=req.batch_id)

    return QAResponseSchema(
        answer=response.answer,
        citations=response.citations,
        retrieved_record_ids=response.retrieved_record_ids,
        status=response.status
    )
