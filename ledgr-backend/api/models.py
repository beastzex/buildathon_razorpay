"""
SQLAlchemy ORM Data Models for Ledgr (Part 4.2)
Implements:
- Batch: Reconciliation batch lifecycle and aggregate performance metrics
- Record: Ingested financial records across sources (Bank, Gateway, Ledger)
- Match: Pairwise matching decisions, confidence scores, and anomaly ratings
- Exception: Escalated exceptions with Groq explanations and resolution states
- AuditLogEntry: Immutable, hash-chained tamper-evident event log
"""

import json
from datetime import datetime
from sqlalchemy import (
    Column, String, Float, Integer, Text, DateTime, Boolean, ForeignKey, JSON
)
from sqlalchemy.orm import relationship

from api.db import Base


class Batch(Base):
    __tablename__ = "batches"

    id = Column(String(64), primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    source_a_label = Column(String(128), default="HDFC Bank Statement")
    source_b_label = Column(String(128), default="Razorpay Settlement File")
    status = Column(String(32), default="pending")  # pending, running, completed, failed
    
    total_records = Column(Integer, default=0)
    matched_count = Column(Integer, default=0)
    flagged_count = Column(Integer, default=0)
    mismatched_count = Column(Integer, default=0)
    match_rate = Column(Float, default=0.0)
    avg_resolution_ms = Column(Float, default=0.0)
    p95_latency_ms = Column(Float, default=0.0)
    p99_latency_ms = Column(Float, default=0.0)

    records = relationship("Record", back_populates="batch", cascade="all, delete-orphan")
    matches = relationship("Match", back_populates="batch", cascade="all, delete-orphan")
    audit_entries = relationship("AuditLogEntry", back_populates="batch", cascade="all, delete-orphan")


class Record(Base):
    __tablename__ = "records"

    id = Column(String(64), primary_key=True, index=True)
    batch_id = Column(String(64), ForeignKey("batches.id", ondelete="CASCADE"), nullable=False, index=True)
    source = Column(String(32), nullable=False)  # sourceA, sourceB, sourceC
    
    raw_fields = Column(JSON, nullable=False)
    normalized_fields = Column(JSON, nullable=False)
    embedding_json = Column(JSON, nullable=True)  # Stored as JSON float list for universal compatibility

    batch = relationship("Batch", back_populates="records")


class Match(Base):
    __tablename__ = "matches"

    id = Column(String(64), primary_key=True, index=True)
    batch_id = Column(String(64), ForeignKey("batches.id", ondelete="CASCADE"), nullable=False, index=True)
    record_a_id = Column(String(64), nullable=True, index=True)
    record_b_id = Column(String(64), nullable=True, index=True)
    
    embedding_score = Column(Float, default=0.0)
    rule_score = Column(Float, default=0.0)
    final_confidence = Column(Integer, default=0)  # 0 - 100
    status = Column(String(32), default="matched")  # matched, flagged, mismatched
    anomaly_score = Column(Float, default=0.0)      # 0.0 - 1.0 from XGBoost+IForest
    
    rule_breakdown = Column(JSON, nullable=True)
    resolved_by = Column(String(64), nullable=True)
    resolved_at = Column(DateTime, nullable=True)

    batch = relationship("Batch", back_populates="matches")
    exception = relationship("ExceptionRecord", back_populates="match", uselist=False, cascade="all, delete-orphan")


class ExceptionRecord(Base):
    __tablename__ = "exceptions"

    id = Column(String(64), primary_key=True, index=True)
    match_id = Column(String(64), ForeignKey("matches.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    batch_id = Column(String(64), nullable=False, index=True)

    explanation = Column(Text, nullable=False)
    suggested_resolution = Column(Text, nullable=False)
    confidence_reasoning = Column(Text, nullable=False)
    explanation_status = Column(String(32), default="ok")  # ok, unavailable
    resolution_status = Column(String(32), default="pending")  # pending, confirmed, rejected
    debate_transcript = Column(JSON, nullable=True)  # Stores opinions, rounds, and consensus

    match = relationship("Match", back_populates="exception")


class AuditLogEntry(Base):
    __tablename__ = "audit_log"

    id = Column(String(64), primary_key=True, index=True)
    batch_id = Column(String(64), ForeignKey("batches.id", ondelete="CASCADE"), nullable=False, index=True)
    event_type = Column(String(32), nullable=False)  # ingestion, match, escalation, resolution, export
    actor = Column(String(64), default="system")
    description = Column(Text, nullable=False)
    
    payload = Column(JSON, nullable=False)
    prev_hash = Column(String(64), nullable=False)
    hash = Column(String(64), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    batch = relationship("Batch", back_populates="audit_entries")


class NightShiftRun(Base):
    __tablename__ = "night_shift_runs"

    id = Column(String(64), primary_key=True, index=True)
    batch_id = Column(String(64), nullable=False, index=True)
    total_records = Column(Integer, default=0)
    auto_matched = Column(Integer, default=0)
    debated_and_resolved = Column(Integer, default=0)
    escalated_to_human = Column(Integer, default=0)
    processing_time_seconds = Column(Float, default=0.0)
    top_anomalies = Column(JSON, nullable=True)
    digest_text = Column(Text, nullable=True)
    notification_sent = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

