# 02. System Overview: Capabilities & Boundaries

## Executive Overview
**Ledgr** is an autonomous AI Finance Controller architected to resolve multi-source financial discrepancies between banking ledgers, gateway settlements, and internal enterprise databases. It replaces brittle, static reconciliation scripts with a multi-stage ML/LLM pipeline that pairs high-throughput deterministic verification with fine-tuned semantic embeddings, anomaly detection, plain-language exception reasoning, and natural language settlement search.

---

## Working System Capabilities

### 1. Ingestion & Normalization Layer
- **Multi-Source Ingestion**: Ingests heterogeneous records from Bank Statements (Source A) and Payment Gateway Settlement files (Source B).
- **Canonical Standardization**: Normalizes currency amounts to floating-point INR (handling regional symbols `₹`, `$`, `,`), parses 6+ date/timestamp formats into ISO-8601 UTC timestamps, and strips narrative noise into clean alphanumeric tokens.

### 2. Two-Stage Confidence Gating Engine
- **Stage 1 (Neural Embedding Matching)**: Uses `BAAI/bge-small-en-v1.5` fine-tuned with Low-Rank Adaptation (LoRA rank=8, alpha=16) on financial reconciliation pairs. Generates 384-dimensional dense vectors to capture semantic counterparty equivalence (e.g., `Swiggy Bundl` $\approx$ `SWIGGY BANGALORE`).
- **Stage 2 (Deterministic Rule Verification)**: Enforces hard transactional invariants:
  - Exact match ($\Delta \le ₹0.01$) $\rightarrow$ score 1.0.
  - Gateway MDR/Interchange candidate ($\Delta \in [0.5\%, 3.5\%] + 18\%\text{ GST}$) $\rightarrow$ score 0.95.
  - Settlement timing window ($\Delta t \le 3\text{ days}$) $\rightarrow$ score 1.0 with linear decay up to 7 days.
  - Substring/Token UTR containment $\rightarrow$ score 0.90 – 1.0.
- **Composite Gating**:
  - **$\ge 85\%$ Confidence**: Auto-Matched instantly. Zero human intervention.
  - **$65\% \le C < 85\%$**: Flagged for Review. Discrepancy explained via LLM.
  - **$< 65\%$**: Hard Mismatch / Unreconciled. Discrepancy escalated.

### 3. Machine Learning Anomaly Scorer
- Pre-trained composite scorer combining **XGBoost Classifier** and **Isolation Forest** unsupervised outlier detector.
- Computes a 6-feature tabular vector: amount ratio, absolute difference, settlement day delta, Shannon token entropy, reference Levenshtein distance, and semantic cosine similarity.
- Assigns anomaly risk probabilities $[0.0, 1.0]$ to flag suspicious fraud patterns or systemic platform bugs.

### 4. Agentic Exception Explanation (Groq LLM)
- Ambiguous or mismatched pairs automatically invoke the **Exception Explanation Agent** powered by Groq high-speed inference (`openai/gpt-oss-120b`).
- Formats structured JSON containing:
  1. `explanation`: Plain-language explanation of the discrepancy (e.g., *"₹17.00 delta matches standard 1.7% payment gateway MDR on ₹1,000.00"*).
  2. `suggested_resolution`: Clear action plan for finance operations.
  3. `confidence_reasoning`: Audit rationale.
  4. `explanation_status`: `"ok"` or `"unavailable"`.
- **Zero-Failure Fallback**: If Groq API key is invalid, missing, or hits an 8s timeout, an internal deterministic rule engine generates valid structured explanations with `explanation_status: "unavailable"`, ensuring zero pipeline disruption.

### 5. Grounded Settlement Q&A (RAG Agent)
- Natural language conversational assistant grounded strictly in verified reconciliation records.
- Incorporates agent tool calling (`lookup_record`, `search_records`), cosine similarity vector retrieval, and BM25 token matching.
- **Anti-Hallucination Guard**: Explicitly returns *"Record not found in indexed batch"* when queried for fictitious transaction IDs.
- **Bilingual / Hinglish Support**: Native comprehension of Indian English and Hinglish queries (e.g., *"Mera ₹1,700 ka difference kyu aya TXN-4006 mein?"*).
- **Interactive Record Citations**: Every response includes clickable citation chips (`[TXN-4006]`) that allow operators to deep-link directly to transactional records.

### 6. Cryptographic Tamper-Evident Audit Trail
- Each reconciliation event, resolution confirmation, or manual escalation writes to an immutable append-only ledger.
- Entries are cryptographically chained using **SHA-256**:
  $$H_i = \text{SHA-256}(H_{i-1} \parallel \text{CanonicalJSON}(\text{Payload}_i))$$
- Built-in `/audit/verify` endpoint verifies chain integrity end-to-end, detecting any single-byte payload tampering or broken linkages.

### 7. Full-Stack User Interface
- **Next.js 14 App Router** frontend styled with Tailwind CSS and custom tokens.
- **Smooth Motion & Micro-interactions**: Smooth scrolling via Lenis, entry reveals, GSAP ticker synchronization, and interactive hover states.
- **6 Production Dashboard Screens**: Overview, Reconciliation Table (with interactive drawer), Exceptions Queue, Settlement Q&A, Audit Trail, and Settings.

---

## Architectural Boundaries: What Is Built vs. Future Scope

| Component | Status in Current System | Production Boundary / Future Work |
| :--- | :--- | :--- |
| **Data Ingestion** | Synthetic generators + BenchRec test datasets ingested via REST API & CSV upload | Direct webhook ingestion from live Core Banking APIs / Razorpay Webhooks |
| **Database** | SQLite async (aiosqlite) local + PostgreSQL 16 + pgvector dockerized | Distributed CockroachDB / AWS Aurora Serverless for multi-region active-active |
| **Worker Processing** | In-process asyncio async pipeline | Celery / Redis distributed queue with autoscaling worker pods |
| **Authentication** | Demo role session gate with API-key headers | Enterprise OAuth2 / SAML SSO with RBAC (Finance Analyst vs. Controller) |
| **LLM Provider** | Groq Cloud API (`openai/gpt-oss-120b`) | Self-hosted vLLM deployment on local GPU cluster for data sovereignty |
