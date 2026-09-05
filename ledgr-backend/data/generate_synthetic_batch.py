"""
Synthetic Batch Generator for Ledgr Evaluation (Part 0.3)
Generates 500+ realistic multi-source financial transaction records:
- Source A: Bank Statement (HDFC, ICICI, SBI, Axis, etc.)
- Source B: Payment Gateway Settlement (Razorpay Payouts / Settlements)
- Controlled injection of 8-12% true anomalies / mismatches
Outputs:
- data/synthetic_batch_v1.csv
- data/synthetic_batch_v1_ground_truth.json
"""

import os
import json
import random
import argparse
from datetime import datetime, timedelta
import pandas as pd
from pathlib import Path

# Fix seed for reproducible evaluation across runs
SEED = 42
random.seed(SEED)

DATA_DIR = Path(__file__).resolve().parent

BANK_PREFIXES = ["BNK-HDFC-", "BNK-ICICI-", "BNK-SBI-", "BNK-AXIS-", "BNK-KOTAK-"]
GATEWAY_PREFIXES = ["GW-RZP-", "PO-RZP-", "PAY-RZP-"]

BANK_DESC_TEMPLATES = [
    "NEFT CR-{ref}-RAZORPAY SETTLEMENT-{cat}",
    "IMPS INWARD-{ref}-MERCHANT DISBURSEMENT",
    "RTGS CR-{ref}-BULK PAYOUT BATCH",
    "TRANSFER-{ref}-DAILY SETTLEMENT SWEEP",
    "ACH CR-{ref}-SUBSCRIPTION POOL-{cat}",
    "UPI CR-{ref}-INSTANT SETTLEMENT"
]

GATEWAY_DESC_TEMPLATES = [
    "Razorpay payout {cat} settlement batch",
    "Gateway settlement auto-sweep {cat}",
    "Merchant disbursement net of platform fees",
    "Customer checkout collection settlement",
    "Recurring subscription payout batch",
    "Daily automated merchant credit"
]

CATEGORIES = ["SaaS", "E-Commerce", "Vendor", "Enterprise", "Subscription", "D2C", "B2B Services"]


def generate_batch(count: int = 520, mismatch_ratio: float = 0.10):
    """
    Generate synthetic batch records with authentic multi-source drift and controlled mismatches.
    """
    start_date = datetime(2026, 9, 1)
    records = []
    ground_truth = {
        "metadata": {
            "total_records": count,
            "generated_at": datetime.utcnow().isoformat() + "Z",
            "mismatch_target_ratio": mismatch_ratio,
            "random_seed": SEED
        },
        "records": {}
    }

    mismatches_target = int(count * mismatch_ratio)
    flagged_target = int(count * 0.15)  # ~15% flagged for review (fees, minor date drift)
    matched_target = count - mismatches_target - flagged_target

    # Create planned status distribution
    statuses = (
        ["matched"] * matched_target +
        ["flagged"] * flagged_target +
        ["mismatched"] * mismatches_target
    )
    random.shuffle(statuses)

    for i, planned_status in enumerate(statuses):
        record_id = f"TXN-{5000 + i + 1}"
        source_a_num = 1000 + i + 1
        source_b_num = 2000 + i + 1
        
        bank_pfx = random.choice(BANK_PREFIXES)
        gw_pfx = random.choice(GATEWAY_PREFIXES)
        
        source_a_id = f"{bank_pfx}{source_a_num}"
        source_b_id = f"{gw_pfx}{source_b_num}"
        
        # Base amount sampled from realistic distribution (e.g. ₹500 to ₹150,000)
        if random.random() < 0.60:
            base_amount = round(random.uniform(500, 25000), 2)
        elif random.random() < 0.90:
            base_amount = round(random.uniform(25000, 85000), 2)
        else:
            base_amount = round(random.uniform(85000, 250000), 2)

        # Date modeling
        day_offset = random.randint(0, 14)
        base_txn_date = start_date + timedelta(days=day_offset)
        cat = random.choice(CATEGORIES)
        common_ref = f"{random.randint(100000, 999999)}{chr(65 + (i % 26))}"

        source_a_date = base_txn_date.strftime("%Y-%m-%d")
        source_a_amount = base_amount
        source_a_ref = f"REF-{common_ref}"
        source_a_desc = random.choice(BANK_DESC_TEMPLATES).format(ref=common_ref, cat=cat)

        source_b_desc = random.choice(GATEWAY_DESC_TEMPLATES).format(cat=cat)
        fee_amount = 0.0
        anomaly_type = "none"

        if planned_status == "matched":
            # Exact or near-exact match
            source_b_amount = source_a_amount
            source_b_date = source_a_date
            source_b_ref = f"PO-{common_ref}"
            ground_truth_label = "matched"
            expected_confidence = random.randint(92, 99)

        elif planned_status == "flagged":
            # Ambiguous: fee deduction or minor date drift (1-2 days)
            drift_kind = random.choice(["fee_deduction", "date_lag", "both"])
            if drift_kind in ["fee_deduction", "both"]:
                # Standard gateway fee: 1.5% to 2% + ₹3-₹18 fixed
                pct_fee = round(source_a_amount * random.uniform(0.012, 0.02), 2)
                fee_amount = min(pct_fee, 50.0) if source_a_amount < 5000 else pct_fee
                source_b_amount = round(source_a_amount - fee_amount, 2)
                anomaly_type = "gateway_fee_deduction"
            else:
                source_b_amount = source_a_amount

            if drift_kind in ["date_lag", "both"]:
                lag_days = random.randint(1, 2)
                source_b_date = (base_txn_date + timedelta(days=lag_days)).strftime("%Y-%m-%d")
                anomaly_type = "settlement_date_drift" if anomaly_type == "none" else "fee_and_date_drift"
            else:
                source_b_date = source_a_date

            source_b_ref = f"PO-{common_ref}"
            ground_truth_label = "flagged"
            expected_confidence = random.randint(68, 84)

        else:  # planned_status == "mismatched"
            mismatch_kind = random.choice(["amount_discrepancy", "orphan_bank", "orphan_gateway", "unrelated_pair"])
            if mismatch_kind == "amount_discrepancy":
                # Unexplained discrepancy (> ₹500 or arbitrary delta)
                unexplained_delta = round(random.uniform(250, 4500), 2)
                source_b_amount = round(max(source_a_amount - unexplained_delta, 100.0), 2)
                source_b_date = source_a_date
                source_b_ref = f"PO-{common_ref}"
                anomaly_type = "unexplained_amount_delta"
            elif mismatch_kind == "orphan_bank":
                # Bank transaction has unrelated dummy gateway entry
                source_b_amount = round(random.uniform(500, 10000), 2)
                source_b_date = (base_txn_date + timedelta(days=random.randint(4, 10))).strftime("%Y-%m-%d")
                source_b_ref = f"PO-{random.randint(100000, 999999)}Z"
                source_b_desc = "Unrelated ad-hoc vendor settlement"
                anomaly_type = "orphaned_bank_record"
            elif mismatch_kind == "orphan_gateway":
                source_b_amount = source_a_amount * 2.5
                source_b_date = (base_txn_date + timedelta(days=random.randint(5, 12))).strftime("%Y-%m-%d")
                source_b_ref = f"PO-{random.randint(100000, 999999)}X"
                source_b_desc = "Legacy customer refund without bank tag"
                anomaly_type = "orphaned_gateway_record"
            else:
                source_b_amount = round(source_a_amount * 0.45, 2)
                source_b_date = (base_txn_date + timedelta(days=3)).strftime("%Y-%m-%d")
                source_b_ref = f"PO-{random.randint(100000, 999999)}M"
                anomaly_type = "severe_mismatch"

            ground_truth_label = "mismatched"
            expected_confidence = random.randint(25, 58)

        record_entry = {
            "batch_id": "batch-synth-v1",
            "record_id": record_id,
            "source_a_id": source_a_id,
            "source_a_amount": source_a_amount,
            "source_a_date": source_a_date,
            "source_a_description": source_a_desc,
            "source_a_reference": source_a_ref,
            "source_b_id": source_b_id,
            "source_b_amount": source_b_amount,
            "source_b_date": source_b_date,
            "source_b_description": source_b_desc,
            "source_b_reference": source_b_ref,
            "expected_status": ground_truth_label,
            "anomaly_type": anomaly_type,
            "fee_amount": fee_amount
        }
        records.append(record_entry)

        ground_truth["records"][record_id] = {
            "expected_status": ground_truth_label,
            "anomaly_type": anomaly_type,
            "source_a_id": source_a_id,
            "source_b_id": source_b_id,
            "expected_confidence_range": [expected_confidence - 5, expected_confidence + 5],
            "fee_amount": fee_amount
        }

    # Summary counts
    counts = {
        "matched": sum(1 for r in records if r["expected_status"] == "matched"),
        "flagged": sum(1 for r in records if r["expected_status"] == "flagged"),
        "mismatched": sum(1 for r in records if r["expected_status"] == "mismatched")
    }
    ground_truth["metadata"]["counts"] = counts
    ground_truth["metadata"]["actual_mismatch_pct"] = round(counts["mismatched"] / count * 100, 2)
    ground_truth["metadata"]["actual_flagged_pct"] = round(counts["flagged"] / count * 100, 2)
    ground_truth["metadata"]["actual_matched_pct"] = round(counts["matched"] / count * 100, 2)

    df = pd.DataFrame(records)
    csv_path = DATA_DIR / "synthetic_batch_v1.csv"
    json_path = DATA_DIR / "synthetic_batch_v1_ground_truth.json"

    df.to_csv(csv_path, index=False)
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(ground_truth, f, indent=2)

    print(f"Generated {count} records:")
    print(f"  - Matched: {counts['matched']} ({ground_truth['metadata']['actual_matched_pct']}%)")
    print(f"  - Flagged: {counts['flagged']} ({ground_truth['metadata']['actual_flagged_pct']}%)")
    print(f"  - Mismatched: {counts['mismatched']} ({ground_truth['metadata']['actual_mismatch_pct']}%)")
    print(f"Saved to:\n  CSV:  {csv_path}\n  JSON: {json_path}")
    return csv_path, json_path


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate synthetic multi-source evaluation batch.")
    parser.add_argument("--count", type=int, default=520, help="Number of records to generate (default 520)")
    parser.add_argument("--mismatch-ratio", type=float, default=0.10, help="Controlled mismatch ratio (default 0.10)")
    args = parser.parse_args()

    generate_batch(count=args.count, mismatch_ratio=args.mismatch_ratio)
