"""
10,000 Enterprise Transaction Dataset Generator for Ledgr Real-Time Pipeline & External Portal
Generates 10,000 authentic multi-rail financial transactions:
- UPI, Cards, NetBanking, NEFT, RTGS
- Gateways: Razorpay, Stripe, PayU, Cashfree
- Banks: HDFC, ICICI, SBI, Axis, Kotak
- Controlled anomalies: fee mismatch, settlement lag, duplicate auth, partial chargeback, reference token corruption
Outputs:
- data/external_10k_transactions.json
- data/external_10k_transactions.csv
"""

import json
import random
from datetime import datetime, timedelta
from pathlib import Path
import pandas as pd

DATA_DIR = Path(__file__).resolve().parent

BANKS = ["HDFC", "ICICI", "SBI", "AXIS", "KOTAK"]
GATEWAYS = ["Razorpay", "Stripe", "Cashfree", "PayU"]
PAYMENT_RAILS = ["UPI", "Credit Card", "Debit Card", "NetBanking", "NEFT/RTGS"]
RAIL_WEIGHTS = [0.45, 0.25, 0.12, 0.10, 0.08]

MERCHANTS = [
    {"name": "Dunzo Quick Commerce", "cat": "E-Commerce", "prefix": "DNZ"},
    {"name": "Freshworks SaaS Cloud", "cat": "SaaS", "prefix": "FRSH"},
    {"name": "Cleartrip Flights & Hotels", "cat": "Travel", "prefix": "CLRT"},
    {"name": "Zomato Logistics Payouts", "cat": "Logistics", "prefix": "ZMT"},
    {"name": "Zerodha Securities Payout", "cat": "FinTech", "prefix": "ZRD"},
    {"name": "Nykaa Cosmetics D2C", "cat": "D2C", "prefix": "NYK"},
    {"name": "Razorpay Capital Advances", "cat": "Lending", "prefix": "RZPC"},
    {"name": "Infosys Contractor Payroll", "cat": "Enterprise", "prefix": "INFY"},
    {"name": "Postman API Cloud", "cat": "SaaS", "prefix": "POST"},
    {"name": "Swiggy Instamart Fleet", "cat": "Quick Commerce", "prefix": "SWG"}
]

BANK_TEMPLATES = {
    "UPI": "UPI CR-{ref}-{gw}-COLLECTION-{merchant}",
    "Credit Card": "CARD SETTLE-{ref}-{gw}-POS DISBURSE-{merchant}",
    "Debit Card": "DEBIT CR-{ref}-{gw}-SETTLEMENT-{merchant}",
    "NetBanking": "NB CR-{ref}-{gw}-DIRECT DISBURSE-{merchant}",
    "NEFT/RTGS": "NEFT/RTGS CR-{ref}-{gw}-TREASURY SWEEP-{merchant}"
}

GATEWAY_TEMPLATES = {
    "UPI": "UPI instant merchant payout batch {ref}",
    "Credit Card": "Card settlement net of gateway interchange {ref}",
    "Debit Card": "Debit collection clearance sweep {ref}",
    "NetBanking": "Internet banking settlement net of fee {ref}",
    "NEFT/RTGS": "Corporate treasury gross settlement {ref}"
}


def generate_10k_dataset(count: int = 10000, seed: int = 42):
    random.seed(seed)
    start_date = datetime(2026, 8, 1, 9, 0, 0)
    
    records = []
    summary = {
        "total_count": count,
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "rail_distribution": {},
        "anomaly_distribution": {
            "matched_clean": 0,
            "fee_deduction": 0,
            "settlement_lag": 0,
            "amount_discrepancy": 0,
            "reference_corruption": 0,
            "duplicate_auth": 0
        },
        "total_gross_volume_inr": 0.0,
        "total_fees_inr": 0.0
    }

    # Anomaly distribution target: 82% clean match, 10% fee deduction/lag, 5% amount discrepancy, 2% ref corruption, 1% duplicate auth
    for i in range(count):
        idx = i + 1
        merchant = random.choice(MERCHANTS)
        bank = random.choice(BANKS)
        gw = random.choice(GATEWAYS)
        rail = random.choices(PAYMENT_RAILS, weights=RAIL_WEIGHTS, k=1)[0]
        summary["rail_distribution"][rail] = summary["rail_distribution"].get(rail, 0) + 1

        # Amount model
        if rail == "UPI":
            base_amount = round(random.uniform(150.0, 15000.0), 2)
        elif rail in ["Credit Card", "Debit Card"]:
            base_amount = round(random.uniform(1200.0, 75000.0), 2)
        elif rail == "NetBanking":
            base_amount = round(random.uniform(5000.0, 180000.0), 2)
        else:  # NEFT/RTGS
            base_amount = round(random.uniform(50000.0, 1200000.0), 2)

        # Dates & timestamps
        day_offset = random.randint(0, 34)
        minute_offset = random.randint(0, 1439)
        bank_dt = start_date + timedelta(days=day_offset, minutes=minute_offset)
        bank_date_str = bank_dt.strftime("%Y-%m-%d %H:%M:%S")

        token_num = random.randint(1000000, 9999999)
        ref_code = f"{merchant['prefix']}{token_num}"
        source_a_ref = f"REF-{ref_code}"
        source_b_ref = f"PO-{ref_code}"

        source_a_id = f"BNK-{bank}-{100000 + idx}"
        source_b_id = f"GW-{gw.upper()[:3]}-{200000 + idx}"

        source_a_desc = BANK_TEMPLATES[rail].format(ref=ref_code, gw=gw.upper(), merchant=merchant['name'])
        source_b_desc = GATEWAY_TEMPLATES[rail].format(ref=ref_code)

        # Gateway fee calculation: 1.5% - 2.2% + GST
        pct = random.uniform(0.015, 0.022) if rail in ["Credit Card", "Debit Card", "NetBanking"] else (0.002 if rail == "UPI" else 0.0)
        standard_fee = round(base_amount * pct, 2)
        gst = round(standard_fee * 0.18, 2)
        total_fee = round(standard_fee + gst, 2) if base_amount > 200 else 0.0

        # Roll category
        roll = random.random()
        anomaly_flag = False
        anomaly_category = "clean_match"

        if roll < 0.82:
            # Clean Match
            source_b_amount = round(base_amount - total_fee, 2) if total_fee > 0 else base_amount
            # In bank, either gross or net
            source_a_amount = base_amount
            source_b_date_str = bank_date_str
            status = "matched"
            anomaly_category = "matched_clean"
            summary["anomaly_distribution"]["matched_clean"] += 1

        elif roll < 0.90:
            # Fee discrepancy / unexpected charge
            source_a_amount = base_amount
            unexpected_fee = round(total_fee + random.uniform(15.0, 120.0), 2)
            source_b_amount = round(base_amount - unexpected_fee, 2)
            source_b_date_str = bank_date_str
            status = "flagged"
            anomaly_flag = True
            anomaly_category = "fee_deduction"
            summary["anomaly_distribution"]["fee_deduction"] += 1

        elif roll < 0.95:
            # Settlement lag (T+2 or T+3)
            lag_days = random.randint(2, 4)
            gw_dt = bank_dt + timedelta(days=lag_days)
            source_a_amount = base_amount
            source_b_amount = round(base_amount - total_fee, 2)
            source_b_date_str = gw_dt.strftime("%Y-%m-%d %H:%M:%S")
            status = "flagged"
            anomaly_flag = True
            anomaly_category = "settlement_lag"
            summary["anomaly_distribution"]["settlement_lag"] += 1

        elif roll < 0.98:
            # High amount discrepancy (chargeback/partial delivery)
            discrepancy = round(random.uniform(500.0, 5500.0), 2)
            source_a_amount = base_amount
            source_b_amount = round(max(10.0, base_amount - discrepancy - total_fee), 2)
            source_b_date_str = bank_date_str
            status = "mismatched"
            anomaly_flag = True
            anomaly_category = "amount_discrepancy"
            summary["anomaly_distribution"]["amount_discrepancy"] += 1

        elif roll < 0.995:
            # Reference token corruption
            source_a_amount = base_amount
            source_b_amount = round(base_amount - total_fee, 2)
            source_b_ref = f"PO-CORRUPT-{token_num // 10}"
            source_b_date_str = bank_date_str
            status = "flagged"
            anomaly_flag = True
            anomaly_category = "reference_corruption"
            summary["anomaly_distribution"]["reference_corruption"] += 1

        else:
            # Duplicate Auth / Double settlement attempt
            source_a_amount = base_amount
            source_b_amount = base_amount
            source_b_desc = f"[DUPLICATE ATTEMPT] {source_b_desc}"
            source_b_date_str = bank_date_str
            status = "mismatched"
            anomaly_flag = True
            anomaly_category = "duplicate_auth"
            summary["anomaly_distribution"]["duplicate_auth"] += 1

        summary["total_gross_volume_inr"] += base_amount
        summary["total_fees_inr"] += total_fee

        record = {
            "id": f"TXN-10K-{idx:05d}",
            "record_index": idx,
            "merchant_name": merchant["name"],
            "merchant_category": merchant["cat"],
            "payment_rail": rail,
            "bank_name": bank,
            "gateway_name": gw,
            "gross_amount": base_amount,
            "fee_amount": total_fee,
            "status": status,
            "anomaly_flag": anomaly_flag,
            "anomaly_category": anomaly_category,
            "sourceA": {
                "id": source_a_id,
                "amount": source_a_amount,
                "date": bank_date_str,
                "reference": source_a_ref,
                "description": source_a_desc,
                "bank": bank
            },
            "sourceB": {
                "id": source_b_id,
                "amount": source_b_amount,
                "date": source_b_date_str,
                "reference": source_b_ref,
                "description": source_b_desc,
                "gateway": gw
            }
        }
        records.append(record)

    summary["total_gross_volume_inr"] = round(summary["total_gross_volume_inr"], 2)
    summary["total_fees_inr"] = round(summary["total_fees_inr"], 2)
    summary["anomaly_rate_pct"] = round((sum(1 for r in records if r["anomaly_flag"]) / count) * 100, 2)

    # Save JSON
    json_path = DATA_DIR / "external_10k_transactions.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump({"summary": summary, "records": records}, f, indent=2)
    print(f"Saved {count} records to {json_path}")

    # Flatten for CSV export
    csv_rows = []
    for r in records:
        csv_rows.append({
            "record_id": r["id"],
            "merchant": r["merchant_name"],
            "category": r["merchant_category"],
            "rail": r["payment_rail"],
            "bank": r["bank_name"],
            "gateway": r["gateway_name"],
            "gross_amount": r["gross_amount"],
            "fee_amount": r["fee_amount"],
            "bank_amount": r["sourceA"]["amount"],
            "gateway_amount": r["sourceB"]["amount"],
            "bank_date": r["sourceA"]["date"],
            "gateway_date": r["sourceB"]["date"],
            "bank_ref": r["sourceA"]["reference"],
            "gateway_ref": r["sourceB"]["reference"],
            "bank_desc": r["sourceA"]["description"],
            "gateway_desc": r["sourceB"]["description"],
            "status": r["status"],
            "anomaly_flag": r["anomaly_flag"],
            "anomaly_category": r["anomaly_category"]
        })

    csv_path = DATA_DIR / "external_10k_transactions.csv"
    df = pd.DataFrame(csv_rows)
    df.to_csv(csv_path, index=False)
    print(f"Saved CSV with shape {df.shape} to {csv_path}")

    return summary, records


if __name__ == "__main__":
    summary, _ = generate_10k_dataset(10000)
    print("Generation complete!")
    print(json.dumps(summary, indent=2))
