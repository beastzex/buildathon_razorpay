"""
Automated Integration Tests for Simulation & Wealth Advisor Endpoints
"""

import pytest
from httpx import AsyncClient, ASGITransport
from api.main import app

@pytest.mark.asyncio
async def test_what_if_simulation():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        payload = {
            "horizon_days": 14,
            "volume_multiplier": 1.5,
            "gateway_fee_delta_pct": 0.4,
            "settlement_delay_days": 1,
            "chargeback_multiplier": 1.2,
            "historical_rows_count": 10000
        }
        resp = await ac.post("/simulation/what-if", json=payload)
        assert resp.status_code == 200
        data = resp.json()
        assert data["horizon_days"] == 14
        assert len(data["points"]) == 14
        assert "liquidity_risk_grade" in data
        assert data["working_capital_runway_days"] > 0
        assert len(data["mitigation_playbook"]) >= 3

@pytest.mark.asyncio
async def test_wealth_advisor_query():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        payload = {
            "query": "How can we optimize working capital against the upcoming weekend liquidity dip?",
            "context_horizon_days": 30
        }
        resp = await ac.post("/simulation/advisor/query", json=payload)
        assert resp.status_code == 200
        data = resp.json()
        assert "GPT-OSS-120B" in data["model_name"]
        assert len(data["answer"]) > 50
        assert len(data["capital_allocation_recommendations"]) >= 2
        assert data["liquidity_buffer_recommendation_inr"] > 0

@pytest.mark.asyncio
async def test_multimodal_verification():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        data = {"sample_type": "sbi_statement"}
        resp = await ac.post("/simulation/multimodal/verify", data=data)
        assert resp.status_code == 200
        result = resp.json()
        assert result["document_type"] == "SBI Corporate Bank Statement"
        assert result["extracted_utr"] == "SBIN4202609059124"
        assert result["match_status"] == "MATCHED"
        assert result["confidence_score"] > 0.95
        assert len(result["visual_bounding_boxes"]) >= 2

@pytest.mark.asyncio
async def test_agent_mesh_and_consensus_debate():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Agent mesh status
        resp_mesh = await ac.get("/simulation/agents/mesh")
        assert resp_mesh.status_code == 200
        agents = resp_mesh.json()
        assert len(agents) == 8
        assert any(a["name"] == "Neural Matcher Agent" for a in agents)
        assert any(a["name"] == "Challenger Agent" for a in agents)

        # Consensus debate
        resp_debate = await ac.get("/simulation/agents/debate/TXN-4003")
        assert resp_debate.status_code == 200
        debate = resp_debate.json()
        assert debate["consensus_reached"] is True
        assert len(debate["rounds"]) >= 3
        assert "CONFIRMED MATCH" in debate["arbiter_verdict"]
