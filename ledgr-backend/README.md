# Ledgr AI Pipeline & Backend Architecture

> **Autonomous AI Finance Controller for Multi-Source Reconciliation, Anomaly Scoring, and Settlement Intelligence.**  
> Built for the **Razorpay AI Buildathon 2026** (Track 04 — AI Finance Controller).

---

## 1. System Architecture

```
[ Bank Statements ]    [ Razorpay Settlements ]    [ Internal Ledgers ]
         \                    |                    /
          +-------------------+-------------------+
                              |
                     [ Normalization ]
                              |
               +--------------+--------------+
               |                             |
     [ BGE-Small LoRA ]             [ Rule Verifier ]
    (Semantic Similarity)         (Tolerance, Date, Ref)
               |                             |
               +--------------+--------------+
                              |
               [ Two-Stage Confidence Gate ]
                 /            |            \
       >= 85% & Pass     65% - 84%        < 65% / Mismatch
             /                |                \
      [ Auto-Match ]   [ Flagged Review ]   [ Confirmed Mismatch ]
             |                |                    |
             |       [ Groq Reasoning Agent ] <----+
             |       (openai/gpt-oss-120b)
             |       - Explanation & Resolution
             |       - Fallback on Timeout
             |                |
             +----------------+
                              |
             [ Anomaly Scorer (XGBoost + IForest) ]
                              |
             [ Tamper-Evident Hash Chain Audit ]
             (SHA-256 Linkage: Genesis -> Resolution)
                              |
             [ PostgreSQL 16 + pgvector / SQLite ]
                              |
             [ FastAPI Async Backend API (Port 8000) ]
```

---

## 2. Core Capabilities & Components

1. **Two-Stage Confidence Gate (`models/matcher.py`)**:
   - Neural semantic representations fine-tuned using **LoRA** (`BAAI/bge-small-en-v1.5`) on consumer 6GB VRAM (NVIDIA RTX 3050).
   - Independent non-ML **Rule Verifier** (`models/rule_verifier.py`) enforcing fee deduction tolerances, settlement day windows (0–2 days), and token fuzzy containment (`RapidFuzz`).
   - Ensures no ML model is the sole source of truth.

2. **Anomaly & Risk Scorer (`models/train_anomaly_scorer.py`)**:
   - Supervised **XGBoost** classifier trained on financial fraud distributions (PaySim / ULB credit card fraud).
   - Unsupervised **Isolation Forest** detecting out-of-distribution patterns.
   - Evaluated on cost-weighted risk (cost of auditor manual review vs financial leakage risk).

3. **Autonomous AI Reasoning Layer (`agents/`)**:
   - **Exception Explanation Agent (`agents/explain_exception.py`)**: Powered by Groq's `openai/gpt-oss-120b` with structured Pydantic schema validation and an explicit 8s timeout with graceful fallback (`explanation_status: "unavailable"`).
   - **Settlement Q&A Agent (`agents/settlement_qa.py`)**: Dual-path retrieval (dense vector embeddings + regex transaction ID extraction) with native **Hinglish** support (e.g. *"TXN-4006 mein kya problem hai?"*).

4. **Tamper-Evident Hash-Chained Audit Trail (`api/audit.py`)**:
   - Every financial action, state change, and controller resolution is cryptographically chained:
     $$\text{hash}_i = \text{SHA256}(\text{prev\_hash}_{i-1} + \text{canonical\_json}(\text{payload}_i))$$
   - Verification endpoint (`POST /audit/{batch_id}/verify`) recomputes and validates chain integrity end-to-end.

---

## 3. Evaluation Results (Real Held-Out Run)

Evaluated against the held-out **520-record multi-source synthetic batch** (`data/synthetic_batch_v1.csv`) containing authentic noise and 8–12% controlled anomalies:

| Metric | Measured Value | Benchmark | Status |
|---|---|---|---|
| **Overall Classification Accuracy** | **91.73%** | > 90.0% | PASS |
| **Auto-Match Precision** | **93.53%** | > 90.0% | PASS |
| **Auto-Match Recall** | **100.0%** | > 90.0% | PASS |
| **False Positive Rate (FPR)** | **20.77%** | < 25.0% | PASS |
| **Two-Stage Gate Auto-Resolved** | **80.19% (417 records)** | > 75.0% | PASS |
| **LLM Escalation Ratio** | **19.81% (103 records)** | < 25.0% minority | PASS |
| **p95 Latency** | **54.63 ms** | < 100.0 ms | PASS |
| **p99 Latency** | **57.97 ms** | < 150.0 ms | PASS |

*Full metrics and cost breakdown documented in [`eval/REPORT.md`](file:///c:/Hackathons%20and%20projects/buildathon_razorpay/ledgr-backend/eval/REPORT.md) and [`eval/results.json`](file:///c:/Hackathons%20and%20projects/buildathon_razorpay/ledgr-backend/eval/results.json).*

---

## 4. API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/batches` | Create a new reconciliation batch (or load synthetic batch) |
| `GET` | `/batches` | List all historical batches with match rate summaries |
| `GET` | `/batches/{id}` | Get summary statistics (match rate, counts, p95 latency) |
| `POST` | `/batches/{id}/run` | Execute autonomous reconciliation pipeline on batch |
| `GET` | `/batches/{id}/records` | Paginated, filterable transaction records |
| `GET` | `/matches/{id}` | Full pairwise match breakdown for inspection slide-over panel |
| `POST` | `/exceptions/{id}/resolve` | Human controller resolution (Confirm match / Mark mismatch) |
| `POST` | `/qa` | Settlement Q&A agent grounded RAG query |
| `GET` | `/audit/{batch_id}` | Chronological audit trail |
| `POST` | `/audit/{batch_id}/verify` | Cryptographically verify SHA-256 hash-chain integrity |
| `GET` | `/health` | Diagnostic health status for DB, Redis, Groq, and GPU |

---

## 5. Quickstart & Local Execution

### 5.1 Local Dev (Zero-Docker Mode)
```powershell
cd ledgr-backend
# Copy environment file
cp .env.example .env

# Run standalone evaluation harness
python eval/run_evaluation.py

# Run failure handling test suite
python eval/test_failure_handling.py

# Launch FastAPI server on port 8000
python api/main.py
```

### 5.2 Docker Compose Deployment
```bash
cd ledgr-backend
docker-compose up --build -d
```
Starts:
- PostgreSQL 16 with `pgvector` on port `5432`
- Redis on port `6379`
- FastAPI backend on port `8000` (docs at `http://localhost:8000/docs`)
