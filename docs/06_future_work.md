# 06. Future Work & Engineering Roadmap (Razorpay AI Builder Focus)

## Strategic Vision
The current implementation of **Ledgr** establishes a verified baseline for two-stage confidence matching, neural semantic embeddings, LLM exception reasoning, and tamper-evident audit trails. To evolve Ledgr from a standalone prototype into a core component of Razorpay’s multi-billion dollar payment processing infrastructure, we outline a 6-to-12 month technical roadmap.

---

## Phase 1 (Months 1–3): Real-Time Stream Processing & Scale

### 1. Distributed Stream Reconciliation with Apache Kafka & Apache Flink
- **Current Limitation**: Reconciliation runs as discrete batches or API payloads.
- **Target Architecture**: Ingest raw authorization webhooks and settlement files from Razorpay payment switches directly via Kafka topics.
- **Implementation**:
  - Deploy **Apache Flink** stateful stream processing with sliding session windows (e.g., 10-minute tumbling windows for UPI, 24-hour tumbling windows for NEFT).
  - Target throughput: **100,000 TPS** with sub-250ms stream latency.

### 2. Multi-Region Active-Active Storage with CockroachDB & ScyllaDB
- Replace single-instance PostgreSQL with distributed SQL (CockroachDB) for ACID-compliant ledger storage across AWS Mumbai (`ap-south-1`) and AWS Hyderabad (`ap-south-2`).
- Store high-volume raw transaction logs in ScyllaDB (C++ Cassandra rewrite) for single-digit millisecond write latency.

---

## Phase 2 (Months 4–6): Advanced ML & Many-to-Many Matching

### 3. Graph Neural Networks (GNNs) for N-to-M (Split/Lump-Sum) Reconciliation
- **Current Limitation**: Current system excels at 1-to-1 pair matching and 1-to-N candidate ranking.
- **The Real-World Challenge**: Merchant settlement files frequently contain **1 lump-sum bank credit** (e.g., ₹4,50,000.00) that corresponds to **650 individual customer purchases** minus rolling reserves, refund deductions, and MDR.
- **Target Architecture**:
  - Construct bipartite transaction graphs: Nodes are individual orders and bank deposits; edges represent candidate relationships weighted by timestamps and reference substrings.
  - Apply **Heterogeneous Graph Neural Networks (HeteroGNN)** to solve subset-sum combinatorial matching in polynomial time.

### 4. Continuous Active Learning & Human-in-the-Loop Feedback Loop
- Implement an automated retraining pipeline:
  1. Finance operators confirm or reject flagged discrepancies in the Ledgr Exceptions Queue.
  2. Verified resolutions are streamed into a curated negative/positive dataset.
  3. Nightly worker jobs fine-tune the LoRA adapter on `BAAI/bge-small-en-v1.5` using Triplet Margin Loss, continuously improving precision without full model retraining.

---

## Phase 3 (Months 7–9): Data Sovereignty & Enterprise Security

### 5. Self-Hosted On-Premises LLM Inference (vLLM + TensorRT-LLM)
- **Current Limitation**: LLM reasoning relies on external Groq cloud endpoints.
- **Target Architecture**:
  - Host quantized open-weights LLMs (e.g., Llama-3.1-8B-Instruct or Mistral-NeMo-12B) internally within Razorpay’s VPC on NVIDIA L4 or H100 GPUs using **vLLM** and **PagedAttention**.
  - Guarantees strict adherence to RBI data localization mandates (all financial PII remains within Indian borders).

### 6. Zero-Knowledge Proofs (zk-SNARKs) for Cross-Bank Reconciliation
- Implement zero-knowledge cryptographic proofs allowing Razorpay and partner acquiring banks to mathematically verify that internal ledger debits match bank account credits without disclosing customer names, card numbers, or transaction metadata to external auditors.

---

## Phase 4 (Months 10–12): Automated Resolution Execution (Autonomous Controller)

### 7. Auto-Refund and Auto-Journaling Agent
- Move from "assisted suggestion" to "autonomous execution":
  - If a discrepancy is identified as an uncaptured gateway authorization with confidence $> 99\%$, the agent issues an automated reversal API call to the Razorpay Payments API.
  - Automatically posts balancing journal entries into enterprise ERPs (SAP S/4HANA, NetSuite) via pre-built connectors.
