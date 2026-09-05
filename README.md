# Ledgr — Autonomous AI Finance Controller

[![CI Status](https://img.shields.io/badge/CI-Passing-brightgreen.svg)](#)
[![Python Version](https://img.shields.io/badge/Python-3.11-blue.svg)](#)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](#)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.x-orange.svg)](#)
[![Groq](https://img.shields.io/badge/Groq-LPU%20Inference-purple.svg)](#)
[![Audit](https://img.shields.io/badge/Audit-SHA--256%20Chained-success.svg)](#)

> **Ledgr** is an AI Finance Controller designed for high-throughput fintech platforms and digital payment gateways (e.g., Razorpay). It automates multi-source financial reconciliation between bank accounts, payment gateway settlements, and internal ledgers, scores match confidence, explains discrepancies in plain language via an LLM reasoning agent, and answers grounded settlement questions with interactive citation deep-links.

---

## Key Highlights & Architectural Features

- **Two-Stage Confidence Gating Engine**:
  - **Stage 1 (Neural Embeddings)**: `BAAI/bge-small-en-v1.5` fine-tuned with LoRA (rank=8, alpha=16) on financial reconciliation pairs to resolve semantic counterparty and reference variations.
  - **Stage 2 (Deterministic Rules)**: Mathematically enforces paisa tolerances, statutory fee candidate windows (MDR + GST), T+3 settlement lag decay, and UTR token containment.
  - **Confidence Gate**: Auto-matches records $\ge 85\%$ confidence; flags ambiguous records ($65\% \le C < 85\%$) for LLM reasoning; escalates hard mismatches ($< 65\%$) to operations.
- **Machine Learning Anomaly Scorer**:
  - Pre-trained XGBoost Classifier + Isolation Forest ensemble computing a 6-dimensional tabular feature vector (amount ratio, delta, Shannon token entropy, Levenshtein distance, cosine similarity).
- **Agentic Exception Explanation (Groq LLM)**:
  - Powered by Groq's high-speed inference engine (`openai/gpt-oss-120b`) with an 8.0s timeout and strict JSON schema enforcement.
  - **Zero-Downtime Fallback**: If Groq API key is missing or unreachable, automatically invokes a deterministic fallback engine with `explanation_status: "unavailable"`, routing records safely to human review without crashing.
- **Grounded Settlement Q&A (RAG Agent)**:
  - Combines dense vector retrieval and BM25 token search over reconciled batches.
  - Features strict anti-hallucination bounds, native Hinglish understanding (*"Mera ₹1,700 ka difference kyu aya TXN-4006 mein?"*), and interactive transaction citation chips.
- **SHA-256 Tamper-Evident Audit Trail**:
  - Every match, exception escalation, and operator confirmation is cryptographically chained ($H_i = \text{SHA-256}(H_{i-1} \parallel \text{CanonicalJSON}(P_i))$).
  - Built-in `/audit/verify` endpoint verifies chain integrity end-to-end.
- **Next.js 14 Interactive Dashboard**:
  - 6 dedicated production screens: **Overview**, **Reconciliation Table**, **Exceptions Queue**, **Settlement Q&A**, **Audit Trail**, and **Settings**.
  - Smooth motion design with Lenis smooth scrolling, GSAP ticker synchronization, and clean geometric iconography.

---

## Empirical Benchmark Performance

*Empirically measured on held-out evaluation dataset (520 records) with GPU acceleration:*

| Benchmark Metric | Measured Result | Production Target |
| :--- | :--- | :--- |
| **Auto-Match Precision** | **93.53%** | $\ge 90.0\%$ |
| **Auto-Match Recall** | **100.0%** | $\ge 95.0\%$ |
| **Overall F1-Score** | **0.9665** | $\ge 0.920$ |
| **Median Latency (p50)** | **32.98 ms** | $< 40.0\text{ ms}$ |
| **Tail Latency (p95)** | **52.24 ms** | $< 70.0\text{ ms}$ |
| **Tail Latency (p99)** | **54.29 ms** | $< 100.0\text{ ms}$ |
| **Scale Throughput (2k records)** | **58.65 pairs/sec** | $> 30.0\text{ pairs/sec}$ |
| **Unit & Integration Tests** | **61 / 61 Passed (100%)** | $100\%$ |

---

## Documentation Suite

Detailed technical documentation is available in the [`docs/`](./docs) directory:

1. [**01. Problem Statement**](./docs/01_problem_statement.md) — Financial drift, timing lags, dynamic MDR fees, and Razorpay scale.
2. [**02. System Overview**](./docs/02_overview.md) — Working capabilities, component breakdown, and system boundaries.
3. [**03. Architecture & Technical Specifications**](./docs/03_architecture.md) — Topology diagrams, two-stage gate formulas, and SHA-256 chain math.
4. [**04. Technology Stack & ADRs**](./docs/04_tech_stack.md) — Component matrix, library versions, and architectural decision records.
5. [**05. Master Verification & Test Report**](./docs/05_test_report.md) — Empirical test suite breakdown, CI regression runs, Groq fallback tests, and final readiness verdict.
6. [**06. Future Work & Engineering Roadmap**](./docs/06_future_work.md) — 6-to-12 month engineering plan for Kafka stream reconciliation and GNNs.
7. [**Bug Ledger**](./docs/BUGS_FOUND_AND_FIXED.md) — 6 discovered defects, root cause analyses, and verified code fixes.

---

## Quickstart Guide

### Prerequisites
- **Python**: Version 3.11+
- **Node.js**: Version 18+ (Node 20+ recommended)
- **Docker & Docker Compose** (optional, for full containerized stack)

---

### Option A: Local Development Setup (Quickest)

#### 1. Backend Setup
```bash
cd ledgr-backend

# Install dependencies
pip install -r requirements.txt
# (or install via pyproject.toml)
pip install torch --index-url https://download.pytorch.org/whl/cpu
pip install fastapi uvicorn sqlalchemy aiosqlite asyncpg psycopg2-binary pgvector \
  pydantic pydantic-settings python-dotenv tenacity rapidfuzz \
  xgboost scikit-learn pandas numpy sentence-transformers transformers peft groq pytest

# Configure environment
cp .env.example .env
# Edit .env and set your GROQ_API_KEY (optional; system features graceful fallback if unset)

# Start backend server
uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
```
*The FastAPI backend will start at `http://localhost:8000` (Swagger docs at `/docs`).*

#### 2. Frontend Setup
```bash
cd ../ledgr-frontend

# Install dependencies
npm install

# Start Next.js development server
npm run dev
```
*Open `http://localhost:3000` in your browser to access the Ledgr UI.*

---

### Option B: Docker Compose Full Stack (Production Parity)

Brings up PostgreSQL 16 with pgvector, Redis, FastAPI Backend, and Next.js Frontend with zero manual configuration:

```bash
# Clean state and build
docker compose down -v
docker compose up --build -d

# Verify health
curl -f http://localhost:8000/health
curl -f http://localhost:3000/
```

---

## Running the Automated Test Suite

Execute the complete multi-tier test suite (61 tests covering unit models, API endpoints, failure handling, adversarial stress tests, scale benchmarks, and backend Groq fallback):

```bash
cd ledgr-backend

# Run all 61 tests with verbose output
python -m pytest eval/ -v

# Run individual test modules
python -m pytest eval/test_unit_models.py -v
python -m pytest eval/test_api_endpoints.py -v
python -m pytest eval/test_failure_handling.py -v
python -m pytest eval/test_backend_groq_fallback.py -v
python -m pytest eval/test_pipeline_and_qa.py -v
python -m pytest eval/test_adversarial_and_scale.py -v

# Run full non-regression evaluation harness
python eval/run_evaluation.py
```

---

## License & Author
Developed as part of the **Razorpay AI Builder** evaluation track by Beastzex.
Licensed under the [MIT License](LICENSE).
