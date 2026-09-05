# 03. System Architecture & Technical Specifications

## Architectural Topology

```mermaid
flowchart TD
    subgraph Data Sources
        SRC_A[Bank Statements Source A]
        SRC_B[Payment Gateway Settlement Source B]
    end

    subgraph Preprocessing Layer
        NORM[Canonical Normalizer\n- Currency Float Parsing\n- ISO-8601 UTC Standardization\n- Alphanumeric Tokenization]
    end

    subgraph Two-Stage Matching Engine
        BGE[Stage 1: Neural Matcher\nBAAI/bge-small-en-v1.5 + LoRA\nDense Embeddings 384-dim]
        RULES[Stage 2: Deterministic Rule Verifier\n- Exact Paisa Tolerance\n- MDR Fee Candidate Detection\n- T+3 Settlement Window\n- Reference Substring Match]
        GATE{Confidence Gate\nC = 0.45 * Embed + 0.55 * Rules}
    end

    subgraph Anomaly Scoring Layer
        ANOM[Composite ML Anomaly Scorer\nXGBoost Classifier + Isolation Forest\n6 Tabular Feature Vector]
    end

    subgraph Agentic Reasoning Layer
        GROQ[Exception Explanation Agent\nGroq Cloud: openai/gpt-oss-120b\n8s Timeout + JSON Schema]
        FALLBACK[Deterministic Rule Fallback Engine\nexplanation_status: unavailable]
    end

    subgraph Storage & Audit Layer
        DB[(PostgreSQL 16 + pgvector / aiosqlite)]
        AUDIT[Immutable Audit Trail\nSHA-256 Hash Chained\nH_i = Hash H_prev + Payload]
    end

    subgraph Interactive Applications
        API[FastAPI Backend Server\nEndpoints: /batches, /matches, /exceptions, /qa, /audit]
        RAG[Settlement Q&A Agent\nVector Index + BM25 + Tool Calling\nHinglish Support + Anti-Hallucination]
        UI[Next.js 14 Frontend\n- Lenis Smooth Scroll\n- 6 Dashboard Screens\n- Real-time Citation Chips]
    end

    SRC_A --> NORM
    SRC_B --> NORM
    NORM --> BGE
    NORM --> RULES
    BGE --> GATE
    RULES --> GATE
    GATE -->|Confidence >= 85%| AUTO[Auto-Match Confirmed]
    GATE -->|< 85%| ESCALATE[Discrepancy Escalated]
    NORM --> ANOM
    ANOM --> ESCALATE
    ESCALATE -->|Attempt Groq LLM| GROQ
    GROQ -.->|On Timeout or Error| FALLBACK
    AUTO --> DB
    ESCALATE --> DB
    GROQ --> DB
    FALLBACK --> DB
    DB --> AUDIT
    DB --> API
    API --> UI
    API --> RAG
    RAG --> UI
```

---

## The Two-Stage Confidence Matching Architecture

Reconciliation cannot rely solely on opaque deep neural networks (which hallucinate false matches) nor solely on brittle regex rules (which fail on slight counterparty naming variations). Ledgr implements a hybrid **two-stage architecture**.

### Stage 1: Neural Semantic Matching (Fine-Tuned LoRA)
- **Base Foundation Model**: `BAAI/bge-small-en-v1.5` (33M parameters, 384 embedding dimensions, max sequence length 512).
- **Fine-Tuning Architecture**: Low-Rank Adaptation (LoRA) applied to attention projections:
  - Target modules: `["query", "key", "value"]`
  - LoRA Rank $r = 8$, Scaling factor $\alpha = 16$, Dropout rate $p = 0.05$.
  - Trainable parameters: 589,824 (~1.7% of base model weights).
  - Adapter Checkpoint: `models/checkpoints/matcher-lora-v1/adapter_model.safetensors` (~0.57 MB).
- **Embedding Distance Computation**:
  $$S_{\text{embed}}(\mathbf{x}_a, \mathbf{x}_b) = \frac{\mathbf{e}_a \cdot \mathbf{e}_b}{\|\mathbf{e}_a\|_2 \|\mathbf{e}_b\|_2}$$

### Stage 2: Deterministic Rule Verifier
Evaluates strict mathematical and transactional invariants:
1. **Amount Verification ($S_{\text{amount}}$)**:
   - $|A_a - A_b| \le ₹0.01 \implies S_{\text{amount}} = 1.0$
   - $\Delta = A_a - A_b > 0$ and $\frac{\Delta}{A_a} \in [0.005, 0.035] + 18\%\text{ GST} \implies S_{\text{amount}} = 0.95$ (valid fee candidate).
   - Non-positive or inverse discrepancies $\implies S_{\text{amount}} = 0.0$.
2. **Date & Settlement Lag ($S_{\text{date}}$)**:
   - $|t_a - t_b| \le 3\text{ days} \implies S_{\text{date}} = 1.0$
   - $3\text{ days} < |t_a - t_b| \le 7\text{ days} \implies S_{\text{date}} = 1.0 - 0.15(|t_a - t_b| - 3)$
   - $|t_a - t_b| > 7\text{ days} \implies S_{\text{date}} = 0.0$.
3. **Reference Identifier Match ($S_{\text{ref}}$)**:
   - Exact string equality $\implies S_{\text{ref}} = 1.0$
   - Substring token containment or UTR substring $\implies S_{\text{ref}} = 0.90$
   - Levenshtein token similarity $> 0.85 \implies S_{\text{ref}} = 0.80$.

### Composite Confidence Score Formulation
The composite confidence score $C \in [0, 100]$ is computed as:
$$S_{\text{rule}} = 0.50 \cdot S_{\text{amount}} + 0.25 \cdot S_{\text{date}} + 0.25 \cdot S_{\text{ref}}$$
$$C = \text{round}\left(100 \times \left(0.45 \cdot S_{\text{embed}} + 0.55 \cdot S_{\text{rule}}\right)\right)$$

Gating thresholds:
- **$C \ge 85$**: `status = "matched"` (Zero-touch auto-match)
- **$65 \le C < 85$**: `status = "flagged"` (Escalated to Groq LLM exception reasoning)
- **$C < 65$**: `status = "mismatched"` (Hard mismatch escalated to operations queue)

---

## Machine Learning Anomaly Scorer

An independent tabular ML model analyzes transaction pairs for operational anomalies, fraud, and system discrepancies.
- **Ensemble Architecture**:
  1. **XGBoost Classifier**: Supervised tree ensemble trained on known historical reconciliation failure modes.
  2. **Isolation Forest**: Unsupervised tree-based anomaly isolation for out-of-distribution patterns.
- **Engineered Feature Vector (6 Dimensions)**:
  $$f_1 = \frac{\min(A_a, A_b)}{\max(A_a, A_b) + \epsilon} \quad (\text{Amount Ratio})$$
  $$f_2 = |A_a - A_b| \quad (\text{Absolute Discrepancy})$$
  $$f_3 = |t_a - t_b|_{\text{days}} \quad (\text{Date Delta})$$
  $$f_4 = -\sum_{c} p(c) \log_2 p(c) \quad (\text{Shannon Token Entropy})$$
  $$f_5 = 1.0 - \frac{\text{Levenshtein}(R_a, R_b)}{\max(|R_a|, |R_b|)} \quad (\text{Reference Distance})$$
  $$f_6 = \cos(\mathbf{e}_a, \mathbf{e}_b) \quad (\text{Semantic Cosine Distance})$$

---

## Cryptographic Hash-Chained Audit Trail

To satisfy statutory compliance (RBI Master Directions and SOC 2 Type II audit requirements), all state transitions generate tamper-evident audit ledger entries:

$$\text{CanonicalJSON}(P_i) = \text{SerializeWithSortedKeysNoWhitespace}(P_i)$$
$$H_0 = \text{SHA-256}("LEDGR_GENESIS_BLOCK_2026_09_01_V1")$$
$$H_i = \text{SHA-256}\left(H_{i-1} \parallel \text{CanonicalJSON}(P_i)\right)$$

### Tamper-Detection Guarantee
If an attacker modifies a single byte in any historical entry $P_k$ where $k < n$:
1. $H_k' = \text{SHA-256}(H_{k-1} \parallel \text{CanonicalJSON}(P_k')) \neq H_k$
2. For all subsequent blocks $j > k$, $H_j' \neq H_j$.
3. The `/audit/verify` verification endpoint traverses from block $0$ to block $n$, immediately detecting:
   - Linkage break at block $k+1$.
   - Payload tampering at block $k$.
