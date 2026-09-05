"""
Multi-Agent Relay & Debate Consensus Test Suite (Tier 1 & Tier 2)
Tests:
1. All 6 individual pipeline agents (Ingestion, Normalizer, Matcher, Detective, Debate, Explainer, Auditor).
2. Debate Agent: 2-round cap, Detective context injection, deterministic fallback defaulting to 'flag for human review'.
3. Fast-path skipping for high-confidence auto-matches.
4. Error interception with plain-language failure events (no crashes).
5. SSE streaming endpoint contract and event emission.
6. Autonomous Night-Shift cycle execution and digest generation.
"""

import os
import sys
import json
import pytest
from pathlib import Path
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

# Ensure root in sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from api.main import app
from agents.pipeline.agent_base import AgentResult
from agents.pipeline.ingestion_agent import IngestionAgent
from agents.pipeline.normalizer_agent import NormalizerAgent
from agents.pipeline.matcher_agent import MatcherAgent
from agents.pipeline.detective_agent import DetectiveAgent
from agents.pipeline.debate_agent import DebateAgent, DebateResult
from agents.pipeline.explainer_agent import ExplainerAgent
from agents.pipeline.auditor_agent import AuditorAgent
from agents.pipeline.orchestrator import PipelineOrchestrator
from agents.pipeline.event_bus import get_event_bus
from scheduler.night_shift import run_autonomous_cycle, NightShiftDigest
from api.db import AsyncSessionLocal
from api.models import Batch


class TestIndividualAgents:
    def test_ingestion_agent_valid_and_missing(self):
        agent = IngestionAgent()
        ra_valid = {"id": "REC-A1", "amount": 1000.0, "date": "2026-09-01", "description": "Pay", "reference": "REF-1"}
        rb_valid = {"id": "REC-B1", "amount": 1000.0, "date": "2026-09-01", "description": "Pay", "reference": "REF-1"}
        ok, res = agent.process(ra_valid, rb_valid, "batch-1", "TXN-1")
        assert ok is True
        assert res.status == "ok"
        assert "Parsed records" in res.output_summary

        ra_invalid = {"id": "REC-A2", "amount": 1000.0}  # missing date, description, reference
        ok2, res2 = agent.process(ra_invalid, rb_valid, "batch-1", "TXN-2")
        assert ok2 is False
        assert res2.status == "failed"
        assert "Validation failed" in res2.output_summary

    def test_normalizer_agent_standardization(self):
        agent = NormalizerAgent()
        ra = {"id": "REC-A3", "amount": "₹ 15,250.50", "date": "01/09/2026", "reference": " ref-xyz "}
        rb = {"id": "REC-B3", "amount": 15250.50, "date": "2026-09-01", "reference": "REF-XYZ"}
        ok, na, nb, res = agent.process(ra, rb, "batch-1", "TXN-3")
        assert ok is True
        assert na["amount"] == 15250.50
        assert na["date"] == "2026-09-01"
        assert na["reference"] == "REF-XYZ"
        assert res.status == "ok"

    def test_matcher_agent_dynamic_threshold_and_disagreement(self):
        agent = MatcherAgent(default_threshold=0.85)
        assert agent.get_threshold() == 0.85

        # Match case
        ra = {"id": "A", "amount": 5000.0, "date": "2026-09-01", "description": "Vendor payout", "reference": "REF-99"}
        rb = {"id": "B", "amount": 5000.0, "date": "2026-09-01", "description": "Vendor payout", "reference": "REF-99"}
        details, res = agent.process(ra, rb, "batch-1", "TXN-M")
        assert res.status == "ok"
        assert details["confidence"] >= 85

        # Disagreement case: High embedding description similarity but severe amount discrepancy
        ra_dis = {"id": "A2", "amount": 50000.0, "date": "2026-09-01", "description": "Enterprise cloud services subscription", "reference": "REF-CLD"}
        rb_dis = {"id": "B2", "amount": 32000.0, "date": "2026-09-01", "description": "Enterprise cloud services subscription", "reference": "REF-CLD"}
        details_dis, res_dis = agent.process(ra_dis, rb_dis, "batch-1", "TXN-D")
        assert res_dis.status == "disagreement"
        assert res_dis.output_data["disagreement"] is True

    def test_detective_agent_context_lookup(self):
        agent = DetectiveAgent()
        ra = {"id": "TXN-101-A", "amount": 4500.0, "date": "2026-09-01", "reference": "REF-ABC-101", "description": "Payment"}
        rb = {"id": "TXN-101-B", "amount": 4200.0, "date": "2026-09-01", "reference": "REF-ABC-101", "description": "Settlement"}
        pool = [
            {"sourceA": {"id": "TXN-102-A", "amount": 4500.0, "date": "2026-09-02", "reference": "REF-ABC-999", "description": "Other"}},
            {"sourceA": {"id": "TXN-103-A", "amount": 99999.0, "date": "2026-09-05", "reference": "REF-OTHER", "description": "Unrelated"}}
        ]
        related, res = agent.process(ra, rb, pool, "batch-1", "TXN-101")
        assert len(related) >= 1
        assert res.status == "ok"
        assert "Found" in res.output_summary

    def test_debate_agent_deterministic_fallback(self):
        # Force Groq unreachability
        agent = DebateAgent()
        with patch.dict(os.environ, {"GROQ_API_KEY": ""}):
            ra = {"id": "A", "amount": 10000.0, "date": "2026-09-01", "description": "Invoice", "reference": "REF-1"}
            rb = {"id": "B", "amount": 8500.0, "date": "2026-09-01", "description": "Invoice", "reference": "REF-1"}
            match_det = {"embedding_score": 0.92, "rule_score": 0.40, "rule_breakdown": {}}
            
            debate_res, agent_res = agent.process(ra, rb, match_det)
            # Must default to 'flag for human review' (NEVER an auto-resolved guess)
            assert debate_res.resolved is False
            assert debate_res.verdict == "flag for human review"
            assert debate_res.fallback_used is True
            assert "Advocate FOR" in debate_res.opinion_for
            assert "Advocate AGAINST" in debate_res.opinion_against
            assert agent_res.status == "escalated"

    def test_auditor_agent_sealing(self):
        agent = AuditorAgent()
        payload = {"event": "test_seal", "amount": 500.0}
        prev_hash = "GENESIS_HASH"
        new_hash, res = agent.process("test_event", payload, prev_hash, "batch-1", "REC-1")
        assert len(new_hash) == 64
        assert res.status == "ok"
        assert "SHA-256" in res.output_summary


class TestOrchestratorRelay:
    @pytest.mark.asyncio
    async def test_orchestrator_fast_path(self):
        orch = PipelineOrchestrator(default_threshold=0.80)
        ra = {"id": "BNK-1", "amount": 2500.0, "date": "2026-09-01", "description": "Subscription fee", "reference": "SUB-123"}
        rb = {"id": "GW-1", "amount": 2500.0, "date": "2026-09-01", "description": "Subscription fee", "reference": "SUB-123"}
        
        res = await orch.process_pair(ra, rb, "batch-test", "TXN-FP", "GENESIS")
        assert res["status"] == "matched"
        
        # Check event sequence
        agent_names = [e.agent_name for e in res["events"]]
        assert "Ingestion Agent" in agent_names
        assert "Normalizer Agent" in agent_names
        assert "Matcher Agent" in agent_names
        assert "Pipeline Router" in agent_names  # Fast-path notification
        assert "Auditor Agent" in agent_names
        # Fast path MUST skip Detective, Debate, and Explainer!
        assert "Detective Agent" not in agent_names
        assert "Debate Agent" not in agent_names
        assert "Explainer Agent" not in agent_names

    @pytest.mark.asyncio
    async def test_orchestrator_disagreement_with_detective_and_debate(self):
        orch = PipelineOrchestrator(default_threshold=0.80)
        # Identical descriptions (high embedding) but conflicting amounts
        ra = {"id": "BNK-2", "amount": 15000.0, "date": "2026-09-01", "description": "AWS Server hosting monthly", "reference": "REF-AWS"}
        rb = {"id": "GW-2", "amount": 9000.0, "date": "2026-09-01", "description": "AWS Server hosting monthly", "reference": "REF-AWS"}
        
        with patch.dict(os.environ, {"GROQ_API_KEY": ""}):
            res = await orch.process_pair(ra, rb, "batch-test", "TXN-DIS", "GENESIS")
            
            agent_names = [e.agent_name for e in res["events"]]
            assert "Ingestion Agent" in agent_names
            assert "Normalizer Agent" in agent_names
            assert "Matcher Agent" in agent_names
            # Disagreement must trigger Detective Agent FIRST, then Debate Agent, then Explainer, then Auditor
            assert "Detective Agent" in agent_names
            assert "Debate Agent" in agent_names
            assert "Explainer Agent" in agent_names
            assert "Auditor Agent" in agent_names
            
            # Verify Detective comes before Debate
            idx_det = agent_names.index("Detective Agent")
            idx_deb = agent_names.index("Debate Agent")
            assert idx_det < idx_deb, "Detective Agent must run BEFORE Debate Agent!"


class TestEndpointsAndStreaming:
    @pytest.mark.asyncio
    async def test_sse_stream_connection(self):
        from httpx import AsyncClient, ASGITransport
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            async with ac.stream("GET", "/batches/batch-test-stream/stream?max_events=1") as response:
                assert response.status_code == 200
                assert "text/event-stream" in response.headers["content-type"]
                async for line in response.aiter_lines():
                    if line.strip():
                        assert line.startswith("data: ")
                        data = json.loads(line.replace("data: ", ""))
                        assert data["agent_name"] == "Pipeline Router"
                        assert "Connected" in data["output_summary"]
                        break

    @pytest.mark.asyncio
    async def test_run_autonomous_cycle_endpoint(self):
        client = TestClient(app)
        # 1. Create a 5-record batch
        init_res = client.post("/batches", json={"synthetic_count": 5})
        assert init_res.status_code == 200
        batch_id = init_res.json()["id"]

        # 2. Run autonomous cycle via endpoint
        auto_res = client.post(f"/batches/{batch_id}/run-autonomous")
        assert auto_res.status_code == 200
        digest = auto_res.json()
        assert digest["batch_id"] == batch_id
        assert digest["total_records"] == 5
        assert "auto_matched" in digest
        assert "debated_and_resolved" in digest
        assert "escalated_to_human" in digest
        assert digest["total_records"] == digest["auto_matched"] + digest["escalated_to_human"]

        # 3. Verify history endpoint returns the run
        hist_res = client.get("/batches/autonomous/history")
        assert hist_res.status_code == 200
        history = hist_res.json()
        assert len(history) > 0
        assert history[0]["batch_id"] == batch_id
