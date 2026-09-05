"""
Evaluation Test Suite for 10,000 External Dataset and Real-Time Streaming Ingestion Pipeline
"""

import pytest
from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)


def test_external_10k_dataset_retrieval():
    """Verify GET /batches/external-10k-dataset returns 10,000 records and summary metrics."""
    res = client.get("/batches/external-10k-dataset?page=1&page_size=20")
    assert res.status_code == 200
    data = res.json()
    assert "summary" in data
    assert data["summary"]["total_count"] == 10000
    assert data["total_filtered"] == 10000
    assert len(data["records"]) == 20
    assert data["records"][0]["id"].startswith("TXN-10K-")
    assert "payment_rail" in data["records"][0]
    assert data["summary"]["total_gross_volume_inr"] > 10000000.0


def test_external_10k_dataset_filtering():
    """Verify filtering by payment rail and anomaly status."""
    # Rail filter
    res_upi = client.get("/batches/external-10k-dataset?rail=UPI&page_size=10")
    assert res_upi.status_code == 200
    data_upi = res_upi.json()
    assert all(r["payment_rail"] == "UPI" for r in data_upi["records"])

    # Anomalies filter
    res_anom = client.get("/batches/external-10k-dataset?only_anomalies=true&page_size=10")
    assert res_anom.status_code == 200
    data_anom = res_anom.json()
    assert all(r["anomaly_flag"] is True for r in data_anom["records"])


def test_external_10k_csv_download():
    """Verify GET /batches/external-10k-dataset/csv serves downloadable CSV."""
    res = client.get("/batches/external-10k-dataset/csv")
    assert res.status_code == 200
    assert "text/csv" in res.headers.get("content-type", "")
    assert len(res.content) > 1000000  # > 1 MB


def test_external_stream_ingestion_pipeline():
    """Verify POST /batches/external-stream ingests stream chunks and records audit trail."""
    res = client.post("/batches/external-stream", json={"count": 200, "chunk_size": 100})
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "stream_completed"
    assert data["records_ingested"] == 200
    assert data["matched_count"] > 0
    assert data["throughput_rps"] > 0

    # Verify batch is accessible via GET /batches/{id}
    batch_res = client.get("/batches/batch-external-stream")
    assert batch_res.status_code == 200
    b_data = batch_res.json()
    assert b_data["totalRecords"] == 200
