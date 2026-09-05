"""
Pydantic Request & Response Schemas for Ledgr API (Part 4)
Maintains strict contract alignment with the Next.js frontend console.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


# ── Batches ──────────────────────────────────────────────────────────────────
class BatchCreateRequest(BaseModel):
    batch_id: Optional[str] = None
    source_a_label: Optional[str] = "HDFC Bank Statement"
    source_b_label: Optional[str] = "Razorpay Settlement File"
    load_synthetic: bool = True
    synthetic_count: int = 50  # Default 50 records per run as required


class BatchSummaryResponse(BaseModel):
    id: str
    label: str
    runAt: str
    status: str
    matchRate: float
    totalRecords: int
    matchedCount: int
    flaggedCount: int
    mismatchedCount: int
    avgResolutionMs: float
    p95LatencyMs: float = 0.0
    p99LatencyMs: float = 0.0


# ── Records & Matches ────────────────────────────────────────────────────────
class SourceDetail(BaseModel):
    id: str
    amount: float
    date: str
    description: str
    reference: str


class TransactionRecordResponse(BaseModel):
    id: str
    sourceA: SourceDetail
    sourceB: SourceDetail
    confidence: int  # 0 - 100
    status: str      # 'matched' | 'flagged' | 'mismatched'
    anomaly_score: Optional[float] = None
    explanation: Optional[str] = None
    suggested_resolution: Optional[str] = None
    explanation_status: Optional[str] = None


class RecordListResponse(BaseModel):
    batch_id: str
    total: int
    page: int
    page_size: int
    records: List[TransactionRecordResponse]


class MatchDetailResponse(BaseModel):
    id: str
    batch_id: str
    record_a: Dict[str, Any]
    record_b: Dict[str, Any]
    embedding_score: float
    rule_score: float
    final_confidence: int
    status: str
    anomaly_score: float
    rule_breakdown: Optional[Dict[str, Any]] = None
    explanation: Optional[Dict[str, Any]] = None


# ── Exception Resolution ─────────────────────────────────────────────────────
class ResolveExceptionRequest(BaseModel):
    action: str = Field(description="'confirm' to accept match, 'reject' to mark confirmed mismatch")
    actor: str = Field(default="controller-admin", description="Name of operator performing resolution")
    notes: Optional[str] = Field(default=None, description="Optional controller audit remarks")


class ResolveExceptionResponse(BaseModel):
    match_id: str
    status: str
    resolution_status: str
    resolved_by: str
    resolved_at: str
    audit_event_id: str


# ── Settlement Q&A ───────────────────────────────────────────────────────────
class QARequest(BaseModel):
    query: str
    batch_id: str = "batch-214"


class QAResponseSchema(BaseModel):
    answer: str
    citations: List[str] = []
    retrieved_record_ids: List[str] = []
    status: str = "ok"


# ── Audit Trail ──────────────────────────────────────────────────────────────
class AuditEntryResponse(BaseModel):
    id: str
    timestamp: str
    type: str
    description: str
    hash: str
    prev_hash: str
    actor: str
    payload: Dict[str, Any]


class AuditVerifyResponse(BaseModel):
    batch_id: str
    is_valid: bool
    verified_count: int
    status: str
    message: str


# ── Health ───────────────────────────────────────────────────────────────────
class HealthResponse(BaseModel):
    status: str
    database: str
    redis: str
    groq: str
    gpu: str
    timestamp: str
