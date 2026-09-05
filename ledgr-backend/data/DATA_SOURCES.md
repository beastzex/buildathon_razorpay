# Ledgr Data Strategy & Sources (DATA_SOURCES.md)

## 1. Overview & Data Principles

**Principle: Real data first, synthetic only to fill gaps.**
In financial reconciliation systems, training models purely on naive synthetic data creates synthetic-distribution memorization rather than real-world generalization. Ledgr follows a strict dual-source data strategy:

1. **Real Data (Training & Schema Anchor):** Authentic datasets from financial benchmarks and banking transactions are used to fine-tune semantic representations, train anomaly classifiers, and validate date/reference normalization logic.
2. **Synthetic Data (Multi-Source Ground Truth & Held-Out Evaluation):** Public financial datasets do not contain triple-source ground truth (the exact same underlying transaction simultaneously recorded in a commercial bank statement, a Razorpay payment gateway settlement file, and an internal ERP ledger with deliberate fee deductions and date drifts). We synthetically generate this multi-source batch with controlled anomalies (8–12%) exclusively for held-out testing and evaluation.

---

## 2. Real Datasets Catalog & Licensing Review

All candidate datasets have been audited for license terms, derivative work rights, and suitability for the Razorpay AI Buildathon.

| Dataset Name | Source / Ref | License | Role in Ledgr | Permitted for Hackathon / Derivative Work? |
|---|---|---|---|---|
| **BenchRec** — Real-World Cash Reconciliation Dataset | `benchmarkteam/benchrec-real-world-cash-reconciliation-dataset` (ICAIF 2023) | CC BY-SA 4.0 / Academic Open | Primary matching model fine-tuning and contrastive pair construction (bank vs ledger) | Yes — open academic and derivative use permitted with attribution |
| **PaySim** — Mobile Money Financial Dataset | `ealaxi/paysim1` | CC BY-SA 4.0 | Transaction distribution anchor (amounts, timing intervals, transfer categories) for multi-source generator | Yes — derivative work and benchmark creation permitted |
| **Credit Card Fraud Detection (ULB)** | `mlg-ulb/creditcardfraud` | Database Contents License (DbCL) / ODbL 1.0 | Supervised anomaly detection training, feature scaling, and class imbalance handling | Yes — free derivative and commercial use under ODbL terms |
| **Bank Transaction Data** | `apoorvwatsky/bank-transaction-data` | CC0: Public Domain | Real-world schema reference for date formats, description free-text noise, and balance column handling | Yes — public domain dedication, unrestricted |
| **Payment Date Prediction for Invoices** | `pradumn203/payment-date-prediction-for-invoices-dataset` | CC BY-NC-SA 4.0 | Receivables settlement-delay reasoning and invoice due-date discrepancy modeling | Yes — permitted for hackathon / non-commercial research development |

---

## 3. Alternative Dataset Search Log (Step 0.2 Audit)

Before freezing the dataset selection, we conducted a systematic query across Kaggle and HuggingFace datasets to evaluate if closer-fit authentic reconciliation datasets were available:

| Search Query | Candidate Found | Source | Findings & Evaluation Decision | Decision |
|---|---|---|---|---|
| `"settlement reconciliation"` | Payment settlement logs | Kaggle | Single-table transaction logs without paired counter-party records. Lacked ground truth match labels. | Rejected in favor of BenchRec |
| `"payment gateway settlement"` | E-commerce payments 2023 | Kaggle | Single merchant viewpoint; gateway fee structure was fixed without raw free-text bank descriptions. | Rejected |
| `"general ledger matching"` | ICAIF BenchRec (2023) | Kaggle / ACM | Authentic paired bank statements and internal accounting general ledger entries from ICAIF competition. High quality, real noise. | **Accepted as primary matching benchmark** |
| `"ERP reconciliation"` | SAP synthetic export | GitHub | Rigid synthetic tabular dump without natural language variance or gateway fee drift. | Rejected |
| `"GST invoice matching"` | Indian GST e-invoices | Data.gov.in | Lacked bank payout timestamps and transaction references. Useful for tax line extensions, but out of scope for primary cash reconciliation. | Documented for future track expansion |

**Audit Conclusion:** BenchRec remains the gold-standard authentic multi-entry reconciliation dataset for semantic text matching. PaySim provides the most statistically realistic financial amount/time distribution.

---

## 4. Final Training Composition & Real vs Synthetic Split (Step 0.4)

To prevent cherry-picked performance metrics and model overfitting, the data split is explicitly defined:

- **Matching Model Fine-Tuning:** 
  - **85% Real Data:** Pairs constructed from BenchRec real cash reconciliation records (bank entry vs general ledger counterpart).
  - **15% Hard Negatives:** Sampled across different transactions within the same batch to teach the BGE-Small model subtle reference and amount distinctions.
- **Anomaly Detection (XGBoost + Isolation Forest):**
  - **100% Real Statistical Foundations:** Trained on distributions from PaySim and ULB Credit Card Fraud detection datasets with realistic transaction frequencies and amount variances.
- **Evaluation Harness (Held-Out Test Set):**
  - **100% Held-Out Multi-Source Synthetic Batch (`synthetic_batch_v1.csv`):**
  - None of the 500+ evaluation transactions are seen during model fine-tuning.
  - Evaluation results directly reflect generalization to unseen multi-view financial records (Bank vs Razorpay Gateway vs Ledger), not memorization.

---

## 5. Synthetic Generation Specification

The synthetic generator (`data/generate_synthetic_batch.py`) produces realistic financial transactions across 3 concurrent views:
1. **Source A (Bank Statement):** Bank transaction code (e.g. `NEFT CR-HDFC0001234`), date format (`YYYY-MM-DD` or `DD/MM/YYYY`), gross settlement amount.
2. **Source B (Payment Gateway Settlement — Razorpay):** Gateway payout ID (`PO-XXXXXX`), net settlement amount (reflecting 1.5%–2% processing fee plus GST), settlement timestamp (typically 0–2 days after transaction).
3. **Source C (Internal Ledger / ERP):** Invoice number (`INV-2026-XXXX`), customer name, expected gross receivables.

### Injected Anomaly Distribution (Controlled 8–12%)
- **Orphaned Bank Credit (4%):** Bank receives funds with missing gateway or ledger counterpart.
- **Amount Discrepancy / Fee Misalignment (3%):** Payout differs by more than standard processing fee tolerance (> ₹50 delta).
- **Date Lag Anomaly (2%):** Gateway settlement delayed beyond acceptable SLA (> 5 days).
- **Duplicate Charge (2%):** Double debit/credit with identical reference but disparate transaction IDs.
