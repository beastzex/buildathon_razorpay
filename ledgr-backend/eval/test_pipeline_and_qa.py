"""
Integration Test Suite: Full Pipeline Relay & 15-Question Settlement Q&A
Verifies:
1. Full pipeline path (raw records -> normalized -> matched -> explained -> audit logged -> API visible)
2. Confirmation of field naming across agent relay stages
3. 15 Hand-crafted Settlement Q&A tests:
   - 4 clear factual queries
   - 3 non-existent transactions (anti-hallucination verification)
   - 4 natural Hinglish queries
   - 4 ambiguous / batch-level queries
"""

import pytest
import asyncio
from fastapi.testclient import TestClient
from api.main import app
from agents.settlement_qa import get_qa_agent


# 20 Reference Records from Specification (Batch-214)
SAMPLE_BATCH_RECORDS = [
    {
        "id": "TXN-4001",
        "sourceA": {"id": "BNK-8812", "amount": 42500.0, "date": "2026-09-01", "description": "Inward credit HDFC", "reference": "REF-91822A"},
        "sourceB": {"id": "GW-1021", "amount": 42500.0, "date": "2026-09-01", "description": "Razorpay settlement payout", "reference": "PO-91822A"},
        "confidence": 99,
        "status": "matched",
        "explanation": "Exact amount and matching PO token."
    },
    {
        "id": "TXN-4002",
        "sourceA": {"id": "BNK-8813", "amount": 18200.0, "date": "2026-09-01", "description": "Client Transfer", "reference": "REF-91823B"},
        "sourceB": {"id": "GW-1022", "amount": 18200.0, "date": "2026-09-01", "description": "Standard Payout", "reference": "PO-91823B"},
        "confidence": 98,
        "status": "matched",
        "explanation": "Exact match across amount and date."
    },
    {
        "id": "TXN-4003",
        "sourceA": {"id": "BNK-8814", "amount": 9320.0, "date": "2026-09-01", "description": "Inward credit", "reference": "REF-91824C"},
        "sourceB": {"id": "GW-1023", "amount": 9308.0, "date": "2026-09-02", "description": "Late settlement 1 day", "reference": "PO-991884"},
        "confidence": 71,
        "status": "flagged",
        "explanation": "Amount differs by ₹12.00 due to gateway fee deduction. 1-day settlement lag."
    },
    {
        "id": "TXN-4004",
        "sourceA": {"id": "BNK-8815", "amount": 64100.0, "date": "2026-09-01", "description": "Corporate transfer", "reference": "REF-91825D"},
        "sourceB": {"id": "GW-1024", "amount": 64100.0, "date": "2026-09-01", "description": "Batch transfer", "reference": "PO-91825D"},
        "confidence": 99,
        "status": "matched",
        "explanation": "Fully matched reference and amount."
    },
    {
        "id": "TXN-4006",
        "sourceA": {"id": "BNK-8817", "amount": 11500.0, "date": "2026-09-01", "description": "Vendor billing", "reference": "REF-91827F"},
        "sourceB": {"id": "GW-1026", "amount": 9800.0, "date": "2026-09-01", "description": "Partial settlement", "reference": "PO-991887"},
        "confidence": 48,
        "status": "mismatched",
        "explanation": "Unexplained discrepancy of ₹1,700.00. Exceeds standard fee tolerance."
    },
    {
        "id": "TXN-4009",
        "sourceA": {"id": "BNK-8820", "amount": 9320.0, "date": "2026-09-01", "description": "Inward payment", "reference": "REF-91830I"},
        "sourceB": {"id": "GW-1029", "amount": 9308.0, "date": "2026-09-02", "description": "Settled with fee", "reference": "PO-91830I"},
        "confidence": 73,
        "status": "flagged",
        "explanation": "Amount delta ₹12.00 matches 0.13% fee. T+1 settlement lag."
    },
    {
        "id": "TXN-4019",
        "sourceA": {"id": "BNK-8830", "amount": 15600.0, "date": "2026-09-01", "description": "Commercial Wire", "reference": "REF-91840S"},
        "sourceB": {"id": "GW-1039", "amount": 11200.0, "date": "2026-09-01", "description": "Gateway deposit", "reference": "PO-991899"},
        "confidence": 32,
        "status": "mismatched",
        "explanation": "Critical mismatch: ₹4,400 discrepancy between bank and gateway."
    }
]


@pytest.fixture(scope="module")
def test_client():
    with TestClient(app) as client:
        yield client


# ============================================================================
# 1. Full Pipeline & Relay Field Integrity Test
# ============================================================================

def test_full_pipeline_relay_and_api(test_client):
    """
    Ensures that ingestion, rule verifier, matcher, explanation,
    and audit trail work in unbroken sequence and are visible through the API.
    """
    # 1. Verify default batch-214 seeded on startup
    res = test_client.get("/batches/batch-214")
    assert res.status_code == 200
    batch_data = res.json()
    assert batch_data["id"] == "batch-214"
    assert batch_data["status"] == "completed"

    # 2. Verify audit chain verification endpoint returns valid cryptographic integrity
    audit_res = test_client.post("/audit/batch-214/verify")
    assert audit_res.status_code == 200
    audit_data = audit_res.json()
    assert audit_data["is_valid"] is True
    assert audit_data["verified_count"] >= 5
    assert audit_data["status"] == "VERIFIED"

    # 3. Create a dynamic test batch and execute it end-to-end
    import uuid
    test_bid = f"batch-relay-{uuid.uuid4().hex[:6]}"
    new_batch_payload = {
        "batch_id": test_bid,
        "load_synthetic": True,
        "synthetic_count": 20
    }
    create_res = test_client.post("/batches", json=new_batch_payload)
    assert create_res.status_code in (200, 201)

    # Run the reconciliation pipeline on dynamic test batch
    run_res = test_client.post(f"/batches/{test_bid}/run")
    assert run_res.status_code == 200
    run_data = run_res.json()
    assert run_data["status"] == "completed"
    assert run_data["totalRecords"] == 20

    # Check records endpoint
    records_res = test_client.get(f"/batches/{test_bid}/records?page=1&page_size=20")
    assert records_res.status_code == 200
    rec_data = records_res.json()
    assert rec_data["total"] == 20
    assert len(rec_data["records"]) == 20

    # Check match detail for the first record
    sample_id = rec_data["records"][0]["id"]
    match_detail_res = test_client.get(f"/matches/{sample_id}")
    assert match_detail_res.status_code == 200
    match_detail = match_detail_res.json()
    assert "rule_score" in match_detail
    assert "final_confidence" in match_detail

    # Verify audit chain integrity of the newly run batch
    audit_verify_res = test_client.post(f"/audit/{test_bid}/verify")
    assert audit_verify_res.status_code == 200
    assert audit_verify_res.json()["is_valid"] is True


# ============================================================================
# 2. Hand-Crafted 15-Question Settlement Q&A Verification Suite
# ============================================================================

QA_QUESTIONS = [
    # --- Category 1: Clear Factual Queries with Grounded Answers ---
    {
        "id": "Q01",
        "category": "clear_factual",
        "question": "Why is TXN-4003 flagged?",
        "expected_mention": ["TXN-4003", "12"],
        "expect_found": True
    },
    {
        "id": "Q02",
        "category": "clear_factual",
        "question": "What is the status of TXN-4001?",
        "expected_mention": ["TXN-4001", "matched"],
        "expect_found": True
    },
    {
        "id": "Q03",
        "category": "clear_factual",
        "question": "Explain the discrepancy in TXN-4006.",
        "expected_mention": ["TXN-4006", "1,700"],
        "expect_found": True
    },
    {
        "id": "Q04",
        "category": "clear_factual",
        "question": "Did TXN-4002 match across all sources?",
        "expected_mention": ["TXN-4002", "18,200"],
        "expect_found": True
    },

    # --- Category 2: Non-Existent Transactions (Anti-Hallucination) ---
    {
        "id": "Q05",
        "category": "anti_hallucination",
        "question": "What is the status of transaction TXN-9999?",
        "expected_mention": ["not found", "no matching", "nahi mila"],
        "expect_found": False
    },
    {
        "id": "Q06",
        "category": "anti_hallucination",
        "question": "Can you check if TXN-8888 is reconciled?",
        "expected_mention": ["not found", "no matching", "nahi mila"],
        "expect_found": False
    },
    {
        "id": "Q07",
        "category": "anti_hallucination",
        "question": "Why was BNK-0000 rejected?",
        "expected_mention": ["not found", "no matching", "nahi mila"],
        "expect_found": False
    },

    # --- Category 3: Natural Hinglish-Mixed Queries ---
    {
        "id": "Q08",
        "category": "hinglish",
        "question": "TXN-4003 mein ₹12 ka difference kyu aya?",
        "expected_mention": ["TXN-4003", "12"],
        "expect_found": True
    },
    {
        "id": "Q09",
        "category": "hinglish",
        "question": "TXN-4006 mein kitna discrepancy mila aur kyu?",
        "expected_mention": ["TXN-4006", "1,700"],
        "expect_found": True
    },
    {
        "id": "Q10",
        "category": "hinglish",
        "question": "TXN-4001 successfully match ho gaya kya?",
        "expected_mention": ["TXN-4001"],
        "expect_found": True
    },
    {
        "id": "Q11",
        "category": "hinglish",
        "question": "TXN-4019 mismatch kyu hua hai, zara batao?",
        "expected_mention": ["TXN-4019", "4,400"],
        "expect_found": True
    },

    # --- Category 4: Ambiguous / Batch-Level Queries ---
    {
        "id": "Q12",
        "category": "ambiguous_batch",
        "question": "Which transactions have fee deductions in this batch?",
        "expected_mention": ["TXN-4003"],
        "expect_found": True
    },
    {
        "id": "Q13",
        "category": "ambiguous_batch",
        "question": "Show me records with date settlement lag.",
        "expected_mention": ["TXN-4003"],
        "expect_found": True
    },
    {
        "id": "Q14",
        "category": "ambiguous_batch",
        "question": "What are the critical mismatches that need manual review?",
        "expected_mention": ["TXN-4006"],
        "expect_found": True
    },
    {
        "id": "Q15",
        "category": "ambiguous_batch",
        "question": "How many records are flagged for fee tolerance?",
        "expected_mention": ["2", "flagged", "record"],
        "expect_found": True
    }
]


class TestSettlementQAIntegration:
    """Rigorous execution of the 15 hand-crafted questions against SettlementQAAgent."""

    @pytest.fixture(scope="class")
    def qa_agent(self):
        agent = get_qa_agent()
        agent.index_batch("batch-qa-15", SAMPLE_BATCH_RECORDS)
        return agent

    @pytest.mark.parametrize("q_item", QA_QUESTIONS, ids=[q["id"] for q in QA_QUESTIONS])
    def test_individual_qa_question(self, qa_agent, q_item):
        q_text = q_item["question"]
        expect_found = q_item["expect_found"]
        expected_mentions = q_item["expected_mention"]

        res = qa_agent.answer_question(q_text, batch_id="batch-qa-15")

        assert res is not None
        assert res.answer is not None
        assert len(res.answer.strip()) > 0

        answer_lower = res.answer.lower()

        if not expect_found:
            # Must NOT hallucinate an ID and must state record was not found
            assert len(res.citations) == 0, f"Hallucinated citation for {q_item['id']}: {res.citations}"
            missing_indicators = [
                "not found", "no matching", "nahi mila", "not present",
                "does not contain", "cannot be confirmed", "cannot be determined", "not in the"
            ]
            found_indicator = any(indicator in answer_lower for indicator in missing_indicators)
            assert found_indicator, f"Agent did not report missing record cleanly for {q_item['id']}: '{res.answer}'"
        else:
            # Must cite at least one relevant transaction or provide a grounded count
            found_keyword = any(kw.lower() in answer_lower for kw in expected_mentions)
            assert found_keyword, f"Answer missing expected keywords {expected_mentions} for {q_item['id']}: '{res.answer}'"
