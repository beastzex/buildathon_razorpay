"""
Multi-Merchant Synthetic Batch Generator (Tier 3D)
Generates realistic reconciliation and financial health profiles for 10 diverse merchants
on the Razorpay platform, with 2 deliberate statistical outliers.
"""

import json
import random
from pathlib import Path
from typing import Dict, Any, List

DATA_DIR = Path(__file__).resolve().parent

MERCHANT_PROFILES = [
    {
        "merchant_id": "m_swiggy_01",
        "merchant_name": "Swiggy Bundl Technologies",
        "industry": "Food Delivery & Quick Commerce",
        "volume": 420000,
        "daily_gmv_inr": 85000000.0,
        "base_match_rate": 0.94,
        "base_anomaly_rate": 0.03,
        "is_outlier": False,
        "outlier_reason": None
    },
    {
        "merchant_id": "m_zomato_02",
        "merchant_name": "Zomato Media Ltd",
        "industry": "Food Delivery & Dining Out",
        "volume": 380000,
        "daily_gmv_inr": 79000000.0,
        "base_match_rate": 0.93,
        "base_anomaly_rate": 0.04,
        "is_outlier": False,
        "outlier_reason": None
    },
    {
        "merchant_id": "m_nykaa_03",
        "merchant_name": "Nykaa FSN E-Commerce",
        "industry": "Beauty & Personal Care Retail",
        "volume": 125000,
        "daily_gmv_inr": 28000000.0,
        "base_match_rate": 0.91,
        "base_anomaly_rate": 0.05,
        "is_outlier": False,
        "outlier_reason": None
    },
    {
        "merchant_id": "m_zepto_04",
        "merchant_name": "Zepto KiranaCart Ltd",
        "industry": "10-Minute Grocery Delivery",
        "volume": 210000,
        "daily_gmv_inr": 41000000.0,
        "base_match_rate": 0.89,
        "base_anomaly_rate": 0.06,
        "is_outlier": False,
        "outlier_reason": None
    },
    {
        "merchant_id": "m_bookmyshow_05",
        "merchant_name": "BookMyShow Bigtree Ent.",
        "industry": "Entertainment & Live Ticketing",
        "volume": 95000,
        "daily_gmv_inr": 19000000.0,
        "base_match_rate": 0.92,
        "base_anomaly_rate": 0.04,
        "is_outlier": False,
        "outlier_reason": None
    },
    {
        "merchant_id": "m_urbancompany_06",
        "merchant_name": "Urban Company Home Services",
        "industry": "On-Demand Home Services",
        "volume": 75000,
        "daily_gmv_inr": 14500000.0,
        "base_match_rate": 0.90,
        "base_anomaly_rate": 0.05,
        "is_outlier": False,
        "outlier_reason": None
    },
    {
        "merchant_id": "m_licious_07",
        "merchant_name": "Licious Delightful Gourmet",
        "industry": "Fresh Meat & Gourmet Food",
        "volume": 62000,
        "daily_gmv_inr": 11000000.0,
        "base_match_rate": 0.91,
        "base_anomaly_rate": 0.04,
        "is_outlier": False,
        "outlier_reason": None
    },
    {
        "merchant_id": "m_bigbasket_08",
        "merchant_name": "BigBasket Supermarket Groc.",
        "industry": "Supermarket E-Commerce",
        "volume": 180000,
        "daily_gmv_inr": 36000000.0,
        "base_match_rate": 0.92,
        "base_anomaly_rate": 0.04,
        "is_outlier": False,
        "outlier_reason": None
    },
    # Deliberate Outlier 1: High Anomaly Rate due to Gateway Timeout Spike
    {
        "merchant_id": "m_dunzo_09_outlier",
        "merchant_name": "Dunzo Daily Logistics",
        "industry": "Hyperlocal Express Courier",
        "volume": 110000,
        "daily_gmv_inr": 16000000.0,
        "base_match_rate": 0.64,  # Significantly degraded
        "base_anomaly_rate": 0.34,  # Outlier: 34% anomaly rate (> 3 standard deviations)
        "is_outlier": True,
        "outlier_reason": "Severe Gateway Timeout Spike: 34% anomaly rate in ICICI NetBanking settlement batch."
    },
    # Deliberate Outlier 2: Low Match Rate and Disputed Refunds
    {
        "merchant_id": "m_cleartrip_10_outlier",
        "merchant_name": "Cleartrip Travel Services",
        "industry": "Online Travel & Flight Booking",
        "volume": 85000,
        "daily_gmv_inr": 54000000.0,
        "base_match_rate": 0.62,  # Outlier: match rate < 65% (> 1.8 standard deviations)
        "base_anomaly_rate": 0.30,  # Outlier: high chargeback and refund lag
        "is_outlier": True,
        "outlier_reason": "High Airline Refund Lag: 30% discrepancy rate from airline API cancellation rollbacks."
    }
]


def generate_portfolio_data() -> List[Dict[str, Any]]:
    """Generates and saves the multi-merchant portfolio dataset."""
    random.seed(42)
    output = []

    for m in MERCHANT_PROFILES:
        # Add slight natural variation
        match_rate = round(m["base_match_rate"] + random.uniform(-0.01, 0.01), 4)
        anomaly_rate = round(m["base_anomaly_rate"] + random.uniform(-0.005, 0.005), 4)
        
        output.append({
            "merchant_id": m["merchant_id"],
            "merchant_name": m["merchant_name"],
            "industry": m["industry"],
            "monthly_volume": m["volume"],
            "daily_gmv_inr": m["daily_gmv_inr"],
            "match_rate": match_rate,
            "anomaly_rate": anomaly_rate,
            "is_outlier": m["is_outlier"],
            "outlier_reason": m["outlier_reason"],
            "historical_match_rates": [
                round(match_rate - 0.02, 3),
                round(match_rate - 0.015, 3),
                round(match_rate - 0.01, 3),
                round(match_rate - 0.005, 3),
                round(match_rate, 3)
            ]
        })

    DATA_DIR.mkdir(parents=True, exist_ok=True)
    out_file = DATA_DIR / "multi_merchant_portfolio.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2)

    return output


if __name__ == "__main__":
    data = generate_portfolio_data()
    print(f"Generated {len(data)} merchant profiles in data/multi_merchant_portfolio.json")
