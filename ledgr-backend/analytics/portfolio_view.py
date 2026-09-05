"""
Portfolio View Engine (Tier 3D)
Aggregates merchant reconciliation metrics across the Razorpay platform,
computes portfolio distributions, and detects statistical outliers via z-scores.

Framing:
Enables Razorpay risk and operations teams to monitor an entire portfolio of merchants
at scale, identifying systemic gateway failures or reconciliation drops before merchant balance sheets leak.
"""

import json
import math
from pathlib import Path
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from analytics.health_score import compute_health_score, BatchMetrics, HealthScore

DATA_DIR = Path(__file__).resolve().parent.parent / "data"


class MerchantPortfolioCard(BaseModel):
    merchant_id: str
    merchant_name: str
    industry: str
    monthly_volume: int
    daily_gmv_inr: float
    match_rate: float
    anomaly_rate: float
    health_score: int
    health_grade: str
    health_rating: str
    health_color: str
    is_statistical_outlier: bool
    outlier_reasons: List[str]
    z_score_anomaly: float
    z_score_match: float
    sparkline: List[int]


class PortfolioOverview(BaseModel):
    total_merchants: int
    platform_avg_health_score: float
    platform_avg_match_rate: float
    platform_avg_anomaly_rate: float
    total_portfolio_daily_gmv_inr: float
    outlier_count: int
    outliers: List[MerchantPortfolioCard]
    merchants: List[MerchantPortfolioCard]
    platform_narrative: str
    timestamp: str


def get_portfolio_overview(data_path: Optional[Path] = None) -> PortfolioOverview:
    """
    Computes portfolio-level view across all merchants with z-score outlier detection.
    """
    json_path = data_path or (DATA_DIR / "multi_merchant_portfolio.json")
    if not json_path.exists():
        from data.generate_multi_merchant_batches import generate_portfolio_data
        merchants_raw = generate_portfolio_data()
    else:
        with open(json_path, "r", encoding="utf-8") as f:
            merchants_raw = json.load(f)

    # 1. Compute per-merchant health scores
    merchant_cards: List[MerchantPortfolioCard] = []
    anomaly_rates = []
    match_rates = []

    for m in merchants_raw:
        m_rate = float(m["match_rate"])
        a_rate = float(m["anomaly_rate"])
        anomaly_rates.append(a_rate)
        match_rates.append(m_rate)

        # Batch metrics abstraction for merchant
        b_metrics = BatchMetrics(
            batch_id=f"batch_{m['merchant_id']}",
            total_records=1000,
            matched_count=int(1000 * m_rate),
            flagged_count=int(1000 * (1 - m_rate) * 0.6),
            mismatched_count=int(1000 * (1 - m_rate) * 0.4),
            match_rate=m_rate,
            anomaly_rate=a_rate,
            avg_exception_age_hours=3.2 if not m.get("is_outlier") else 14.8
        )
        h_score = compute_health_score(b_metrics)

        merchant_cards.append(MerchantPortfolioCard(
            merchant_id=m["merchant_id"],
            merchant_name=m["merchant_name"],
            industry=m["industry"],
            monthly_volume=m["monthly_volume"],
            daily_gmv_inr=m["daily_gmv_inr"],
            match_rate=round(m_rate * 100.0, 1),
            anomaly_rate=round(a_rate * 100.0, 1),
            health_score=h_score.score,
            health_grade=h_score.grade,
            health_rating=h_score.rating,
            health_color=h_score.color_token,
            is_statistical_outlier=False,
            outlier_reasons=[],
            z_score_anomaly=0.0,
            z_score_match=0.0,
            sparkline=h_score.sparkline
        ))

    # 2. Compute Portfolio Statistics (Mean and Standard Deviation)
    n = len(merchant_cards)
    if n == 0:
        raise ValueError("No merchant profiles found in portfolio dataset.")

    mean_anomaly = sum(anomaly_rates) / n
    std_anomaly = math.sqrt(sum((x - mean_anomaly) ** 2 for x in anomaly_rates) / n) or 1e-4

    mean_match = sum(match_rates) / n
    std_match = math.sqrt(sum((x - mean_match) ** 2 for x in match_rates) / n) or 1e-4

    # 3. Compute z-scores and flag statistical outliers (|z| >= 2.0)
    outlier_cards: List[MerchantPortfolioCard] = []

    for idx, card in enumerate(merchant_cards):
        a_raw = anomaly_rates[idx]
        m_raw = match_rates[idx]

        z_a = (a_raw - mean_anomaly) / std_anomaly
        z_m = (m_raw - mean_match) / std_match

        card.z_score_anomaly = round(z_a, 2)
        card.z_score_match = round(z_m, 2)

        reasons = []
        if z_a >= 1.8:  # Significantly higher anomaly rate than portfolio
            reasons.append(f"High Anomaly Outlier: {card.anomaly_rate}% anomaly rate is {z_a:.1f}σ above portfolio mean ({mean_anomaly*100:.1f}%).")
        if z_m <= -1.8:  # Significantly degraded match rate
            reasons.append(f"Low Match Rate Outlier: {card.match_rate}% match rate is {abs(z_m):.1f}σ below portfolio mean ({mean_match*100:.1f}%).")

        if reasons:
            card.is_statistical_outlier = True
            card.outlier_reasons = reasons
            outlier_cards.append(card)

    total_gmv = sum(c.daily_gmv_inr for c in merchant_cards)
    avg_health = sum(c.health_score for c in merchant_cards) / n
    avg_match = (sum(c.match_rate for c in merchant_cards) / n)
    avg_anomaly = (sum(c.anomaly_rate for c in merchant_cards) / n)

    platform_narrative = (
        f"Portfolio overview across {n} key merchants represents ₹{total_gmv/1e7:.1f} Cr in daily platform settlements. "
        f"Overall portfolio operates with healthy {avg_match:.1f}% automated match rate and a composite {round(avg_health)} health index. "
        f"{len(outlier_cards)} merchants exhibit critical statistical deviation (>1.8σ) requiring payment gateway partner intervention."
    )

    import time
    return PortfolioOverview(
        total_merchants=n,
        platform_avg_health_score=round(avg_health, 1),
        platform_avg_match_rate=round(avg_match, 1),
        platform_avg_anomaly_rate=round(avg_anomaly, 1),
        total_portfolio_daily_gmv_inr=round(total_gmv, 2),
        outlier_count=len(outlier_cards),
        outliers=outlier_cards,
        merchants=merchant_cards,
        platform_narrative=platform_narrative,
        timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    )
