# 04. Technology Stack & Architectural Decision Records (ADRs)

## Full-Stack Component Matrix

| Layer | Component | Technology / Library | Version | Rationale & Architectural Trade-offs |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend** | Framework | **Next.js (App Router)** | 16.3.4 (Turbopack) | Server-Side Rendering (SSR) for static dashboard pre-rendering, route-level code splitting, sub-second fast refresh. |
| | Core Library | **React** | 19.2.8 | Latest concurrent mode primitives, transition hooks, optimized DOM diffing. |
| | Language | **TypeScript** | 5.x | Strict end-to-end type safety, schema parity with backend Pydantic models. |
| | Styling | **Tailwind CSS** | 4.x | Utility-first design tokens, low bundle footprint, consistent light/dark theme switching. |
| | Motion & Scroll | **Lenis + GSAP** | Lenis 1.3 / GSAP 3.15 | Hardware-accelerated smooth scrolling, scroll-scrubbed confidence pills, requestAnimationFrame synchronized tickers. |
| | Charts & Visuals | **Recharts** | 3.10.1 | Declarative SVG-based charting for match latency trends and confidence distribution. |
| | Icons | **Lucide React** | 1.39.0 | Tree-shakeable, clean geometric iconography without emoji pollution. |
| **Backend** | Framework | **FastAPI** | 0.111+ | High-throughput asynchronous ASGI web framework with native OpenAPI/Swagger auto-generation. |
| | Server | **Uvicorn** | 0.30+ | High-concurrency uvloop-powered async worker server. |
| | Validation | **Pydantic v2** | 2.7+ | High-performance C-extension (Rust-backed) data validation and serialization. |
| | ORM / DB Layer | **SQLAlchemy Async** | 2.0+ | Modern async session architecture; dual-compatible with PostgreSQL (asyncpg) and SQLite (aiosqlite). |
| | Vector Store | **pgvector** | pg16 | In-database cosine similarity indexing; avoids operating separate external vector database clusters. |
| **AI / ML** | Neural Embeddings | **BAAI/bge-small-en-v1.5** | Hugging Face | State-of-the-art MTEB retrieval model at 33M parameters; 384-dimensional dense vectors. |
| | Fine-Tuning | **PEFT (LoRA)** | 0.10+ | Low-Rank Adaptation ($r=8, \alpha=16$) fine-tuned on financial reconciliation triples. |
| | Tabular ML | **XGBoost & Scikit-learn** | 2.0+ / 1.4+ | High-accuracy gradient boosted trees and Isolation Forest for tabular anomaly and fee pattern detection. |
| | String Distance | **RapidFuzz** | 3.9+ | C++ accelerated Levenshtein and token-sort similarity for high-throughput string comparison. |
| | LLM Reasoning | **Groq Cloud API** | `openai/gpt-oss-120b` | Ultra-low latency LLM inference (sub-1.5s TTFT) for real-time natural language exception reasoning. |
| | Forecasting Engine | **Meta Prophet** | 1.4.0 | Robust additive time-series forecasting with automated day-of-week and monthly seasonality and 90% confidence bands. |
| **Infra & DevOps**| Containerization | **Docker & Compose** | 29.4 / v5.1 | Multi-stage production container builds with health checks and zero manual state setup. |
| | CI / CD | **GitHub Actions** | Ubuntu-latest | Automated unit, integration, and non-regression threshold assertion suites. |

---

## Architectural Decision Records (ADRs)

### ADR 1: Why BGE-Small with LoRA over OpenAI Ada/Text-3 Embeddings?
- **Data Privacy & Compliance**: Financial ledger descriptions contain sensitive merchant PII and account references. Running embeddings locally on host/container prevents exfiltration of raw ledger strings to third-party endpoints.
- **Inference Latency**: `bge-small-en-v1.5` on GPU runs in **<1.2 ms per pair** (or ~12 ms on CPU), compared to 150–300 ms per network call to commercial cloud APIs.
- **Domain Adaptation**: Off-the-shelf commercial embeddings fail to capture domain-specific equivalences (e.g., mapping bank UTR patterns to gateway order IDs). LoRA adaptation tailored the 384-dimensional vector space specifically to transactional pairs with only 0.57 MB of adapter weights.

### ADR 2: Why Two-Stage Gating (Rules + Embeddings) instead of Pure End-to-End Deep Learning?
- **Deterministic Accountability**: In financial accounting, an auditor cannot accept "the neural network thought these two amounts matched." Stage 2 hard rules enforce immutable paisa tolerances, fee thresholds, and date bounds.
- **Zero Hallucination Auto-Matches**: Stage 1 embeddings suggest candidate alignment, but Stage 2 rules veto any auto-match if amounts diverge beyond statutory fee calculations.

### ADR 3: Why Groq for Exception Reasoning with Deterministic Fallback?
- **Speed**: Standard hosted LLMs (e.g., GPT-4) take 4–8 seconds to stream reasoning, which halts batch reconciliation queues. Groq's LPU architecture generates structured JSON explanations in **sub-1.5 seconds**.
- **Resilience**: Groq could hit rate limits or transient outages. The **Exception Explanation Agent** features an automatic circuit breaker: if Groq is unavailable, it returns a valid deterministic explanation with `explanation_status: "unavailable"`, marking the record for manual review with calculated delta hints rather than crashing the batch.

### ADR 4: Why Dual Database Strategy (PostgreSQL + pgvector in Docker, SQLite async for local testing)?
- **Frictionless Developer Experience**: Contributors can clone the repo and run `python -m pytest eval/` immediately without setting up a live PostgreSQL instance.
- **Production Parity**: In Docker Compose, the system automatically uses PostgreSQL 16 with the native `pgvector` extension for production-grade transactional integrity and vector indexing.

### ADR 5: Why Meta Prophet for Cash-Flow Forecasting?
- **Interpretability & Seasonality**: Daily cash flow in Indian e-commerce exhibits strong day-of-week effects (weekend dips, Tuesday gateway settlements) and calendar-based recurring outflows (1st/15th hosting, 28th contractor payroll). Prophet natively models these additive components without requiring complex deep sequential architectures (LSTM/DeepAR) that are prone to overfitting short historical windows.
- **Native Uncertainty Bounds**: Prophet directly outputs empirical 90% confidence bands $[\hat{y}_{\text{lower}}, \hat{y}_{\text{upper}}]$, providing risk controllers with explicit downside volatility bounds for working capital reserves.

### ADR 6: Why the 4-Component Weighted Financial Health Score?
- **Auditability**: Many financial dashboards display opaque "AI health ratings." Ledgr uses a transparent linear combination ($w_m=0.35, w_a=0.30, w_r=0.20, w_f=0.15$) directly tied to GAAP reconciler obligations: Match Coverage, Balance Sheet Integrity, Exception Resolution SLA (<24h), and Fee Schedule Compliance.
- **Actionable Breakdown**: Every score change can be precisely attributed to the offending component via the interactive breakdown drawer.

