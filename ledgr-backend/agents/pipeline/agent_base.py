"""
Agent Result Schema & Base Interface (Tier 1 & Tier 2)
Defines the uniform communication and event payload contract for all pipeline agents.
"""

from typing import Literal, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime


class AgentResult(BaseModel):
    agent_name: str
    input_summary: str
    output_summary: str
    output_data: Dict[str, Any] = Field(default_factory=dict)
    duration_ms: int = 0
    status: Literal["ok", "escalated", "failed", "disagreement"] = "ok"
    record_id: Optional[str] = None
    batch_id: Optional[str] = None
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
