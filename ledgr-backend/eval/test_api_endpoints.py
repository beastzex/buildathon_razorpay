"""
End-to-End API Integration & Contract Test Suite (Part 4)
Tests all FastAPI endpoints against live application context.
"""

import sys
import asyncio
from pathlib import Path

# Ensure root in sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi.testclient import TestClient
from api.main import app
from api.db import init_db

client = TestClient(app)


def test_health_endpoint():
    resp = client.get("/health")
    assert resp.status_code == 200
    data = resp.json()
    assert "status" in data
    assert "database" in data
    assert "gpu" in data
    print("✓ /health passed:", data["status"], "| GPU:", data["gpu"])


def test_batch_lifecycle_and_run():
    import uuid
    test_bid = f"test-{uuid.uuid4().hex[:6]}"
    
    # 1. Create Batch with synthetic records
    create_resp = client.post("/batches", json={
        "batch_id": test_bid,
        "load_synthetic": True,
        "synthetic_count": 25
    })
    assert create_resp.status_code == 200
    batch_data = create_resp.json()
    assert batch_data["id"] == test_bid
    assert batch_data["totalRecords"] == 25
    print("✓ POST /batches created:", batch_data["id"])

    # 2. Get Batch Summary
    summary_resp = client.get(f"/batches/{test_bid}")
    assert summary_resp.status_code == 200
    assert summary_resp.json()["id"] == test_bid
    print(f"✓ GET /batches/{test_bid} verified")

    # 3. Trigger Reconciliation Pipeline
    run_resp = client.post(f"/batches/{test_bid}/run")
    assert run_resp.status_code == 200
    run_data = run_resp.json()
    assert run_data["status"] == "completed"
    assert run_data["totalRecords"] == 25
    assert run_data["p95LatencyMs"] >= 0.0
    print(f"✓ POST /batches/{test_bid}/run completed: {run_data['matchedCount']} matched, {run_data['flaggedCount']} flagged, {run_data['mismatchedCount']} mismatched | p95: {run_data['p95LatencyMs']}ms")

    # 4. Fetch Paginated Records
    records_resp = client.get(f"/batches/{test_bid}/records?page=1&page_size=10")
    assert records_resp.status_code == 200
    rec_data = records_resp.json()
    assert len(rec_data["records"]) == 10
    sample_rec = rec_data["records"][0]
    assert "sourceA" in sample_rec
    assert "sourceB" in sample_rec
    assert "confidence" in sample_rec
    assert "status" in sample_rec
    print(f"✓ GET /batches/test-batch-001/records fetched {len(rec_data['records'])} records")

    # 5. Fetch Match Detail for side panel
    match_id = sample_rec["id"]
    match_resp = client.get(f"/matches/{match_id}")
    assert match_resp.status_code == 200
    match_detail = match_resp.json()
    assert match_detail["id"] == match_id
    assert "rule_score" in match_detail
    assert "anomaly_score" in match_detail
    print(f"✓ GET /matches/{match_id} fetched details (confidence: {match_detail['final_confidence']}%)")

    # 6. Resolve an Exception
    resolve_resp = client.post(f"/exceptions/{match_id}/resolve", json={
        "action": "confirm",
        "actor": "controller-lead",
        "notes": "Verified against gateway schedule"
    })
    assert resolve_resp.status_code == 200
    res_data = resolve_resp.json()
    assert res_data["status"] == "matched"
    assert res_data["resolved_by"] == "controller-lead"
    print(f"✓ POST /exceptions/{match_id}/resolve successfully confirmed")

    # 7. Settlement Q&A Query
    qa_resp = client.post("/qa", json={
        "query": f"What is the status of {match_id}?",
        "batch_id": test_bid
    })
    assert qa_resp.status_code == 200
    qa_data = qa_resp.json()
    assert len(qa_data["answer"]) > 0
    print(f"✓ POST /qa responded with {len(qa_data['citations'])} citations:", qa_data["citations"])

    # 8. Fetch and Verify Audit Trail
    audit_resp = client.get(f"/audit/{test_bid}")
    assert audit_resp.status_code == 200
    audit_entries = audit_resp.json()
    assert len(audit_entries) >= 3  # Ingestion + Pipeline + Resolution
    print(f"✓ GET /audit/{test_bid} returned {len(audit_entries)} hash-chained events")

    verify_resp = client.post(f"/audit/{test_bid}/verify")
    assert verify_resp.status_code == 200
    verify_data = verify_resp.json()
    assert verify_data["is_valid"] is True
    assert verify_data["status"] == "VERIFIED"
    print(f"✓ POST /audit/{test_bid}/verify passed: {verify_data['message']}")


if __name__ == "__main__":
    print("Initializing database and running API endpoint integration tests...")
    asyncio.run(init_db())
    with TestClient(app) as test_c:
        globals()["client"] = test_c
        test_health_endpoint()
        test_batch_lifecycle_and_run()
    print("\nAll API integration tests passed with 100% success!")
