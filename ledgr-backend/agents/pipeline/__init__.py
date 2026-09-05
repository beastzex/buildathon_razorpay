"""
Pipeline Agents Package (Tier 1 & Tier 2)
"""

from agents.pipeline.agent_base import AgentResult
from agents.pipeline.event_bus import get_event_bus, EventBus
from agents.pipeline.ingestion_agent import IngestionAgent
from agents.pipeline.normalizer_agent import NormalizerAgent
from agents.pipeline.matcher_agent import MatcherAgent
from agents.pipeline.detective_agent import DetectiveAgent
from agents.pipeline.debate_agent import DebateAgent, DebateResult
from agents.pipeline.explainer_agent import ExplainerAgent
from agents.pipeline.auditor_agent import AuditorAgent
from agents.pipeline.orchestrator import PipelineOrchestrator

__all__ = [
    "AgentResult",
    "get_event_bus",
    "EventBus",
    "IngestionAgent",
    "NormalizerAgent",
    "MatcherAgent",
    "DetectiveAgent",
    "DebateAgent",
    "DebateResult",
    "ExplainerAgent",
    "AuditorAgent",
    "PipelineOrchestrator",
]
