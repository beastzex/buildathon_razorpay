# 06. Future Work & Engineering Roadmap (Targeted Extensions)

## Strategic Vision
The current implementation of **Ledgr** establishes a verified baseline for two-stage confidence matching, neural semantic embeddings, LLM exception reasoning, and tamper-evident audit trails. Rather than chasing theoretical buzzwords, the roadmap focuses on practical, direct extensions of what is already built in the codebase.

---

## Roadmap Initiatives

### 1. Real-Time Stream Ingestion & Sliding Windows (Extending Ingestion & Normalizer)
- **Current Limitation**: Ingestion currently accepts static batch CSVs or bulk REST payloads via `/batches`.
- **Target Extension**:
  - Ingest live webhook events (e.g. Razorpay payment authorized, captured, refunded) directly into a continuous stream.
  - Implement time-sliding reconciliation windows (e.g., 15-minute tumbling windows for UPI/IMPS, 24-hour windows for NEFT/RTGS).
  - Eliminates the batch delay, allowing the Live Agent Ticker to run continuously as transactions occur in production.

### 2. Graph-Based Root-Cause & Split-Payout Engine (Extending Detective Agent)
- **Current Limitation**: The current pipeline reconciles 1-to-1 pairs (`sourceA` $\leftrightarrow$ `sourceB`). In production, payment gateways frequently settle in **1-to-many lump sums** (e.g., 1 bank payout of ₹2,45,820 matching 38 individual merchant orders minus aggregate MDR and refund adjustments).
- **Target Extension**:
  - Extend the `DetectiveAgent` to build local transaction bipartite graphs: linking lump-sum payout IDs to candidate cluster records via shared settlement batch references.
  - Implement subset-sum optimization heuristics to match clustered groups before handing edge cases to the LLM.

### 3. Active Learning & Human-in-the-Loop Feedback (Extending LoRA Fine-Tuning)
- **Current Limitation**: LoRA adapter weights are static once trained (`models/checkpoints/matcher-lora-v1`).
- **Target Extension**:
  - Capture operator decisions in the Exceptions Queue (approvals, rejections, manual counterparty corrections).
  - Automatically curate these into high-confidence positive/negative triplet training pairs.
  - Schedule periodic adapter fine-tuning to continuously adapt to new merchant naming patterns and bank narration formats.

### 4. Direct Core Banking & ERP Connector Adapters (Extending Storage Layer)
- **Current Limitation**: Records are ingested as standardized JSON dictionaries.
- **Target Extension**:
  - Pre-built connectors for Indian core banking statement formats (HDFC MT940, ICICI XML/Excel, SBI CSV) and ERPs (Zoho Books, TallyPrime, SAP S/4HANA).
  - Auto-generate balancing journal entries for confirmed matches and fee variance adjustments.

