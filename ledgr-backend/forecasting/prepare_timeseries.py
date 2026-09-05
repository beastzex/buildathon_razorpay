"""
Time-Series Data Preparation (Tier 3B)
Prepares daily net cash settlement time-series for cash-flow forecasting.
Tracks known recurring outflow patterns to ground LLM forecast explanations.
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, Any, List, Tuple, Optional


RECURRING_PATTERNS = [
    {
        "name": "Weekly Vendor Payout Cycle",
        "weekday": 1,  # Tuesday (0=Monday, 1=Tuesday, ...)
        "typical_outflow": 95000.0,
        "description": "Recurring Tuesday partner merchant settlement batch"
    },
    {
        "name": "Cloud Hosting & SaaS Infrastructure",
        "day_of_month": [1, 15],
        "typical_outflow": 145000.0,
        "description": "Bi-weekly cloud compute & SaaS subscription auto-debit"
    },
    {
        "name": "Monthly Operations & Contractor Payout",
        "day_of_month": [28],
        "typical_outflow": 280000.0,
        "description": "Month-end institutional contractor and vendor settlement run"
    }
]


def generate_historical_cashflow_series(days: int = 90, end_date: Optional[str] = None) -> pd.DataFrame:
    """
    Generates realistic historical daily net cash-flow movements (90 days).
    Incorporates natural weekly seasonality, random walk, and recurring calendar events.
    """
    np.random.seed(42)
    end_dt = datetime.strptime(end_date, "%Y-%m-%d") if end_date else datetime(2026, 9, 1)
    start_dt = end_dt - timedelta(days=days - 1)

    records = []
    current = start_dt

    for day_idx in range(days):
        date_str = current.strftime("%Y-%m-%d")
        weekday = current.weekday()
        day_of_month = current.day

        # Base daily customer payment inflows (higher on weekdays, lower on Sunday)
        weekday_multiplier = 0.65 if weekday == 6 else (0.85 if weekday == 5 else 1.15)
        base_inflow = (350000.0 + np.random.normal(0, 40000.0)) * weekday_multiplier
        base_inflow = max(120000.0, base_inflow)

        # Baseline operating outflows (refunds, small vendor settlements)
        base_outflow = (180000.0 + np.random.normal(0, 25000.0)) * weekday_multiplier
        base_outflow = max(60000.0, base_outflow)

        recurring_event_note = None

        # Check recurring outflow patterns
        if weekday == 1:  # Tuesday
            base_outflow += 95000.0
            recurring_event_note = "Recurring Tuesday partner vendor payout"

        if day_of_month in (1, 15):
            base_outflow += 145000.0
            recurring_event_note = "Cloud infrastructure & SaaS hosting debit"

        if day_of_month == 28:
            base_outflow += 280000.0
            recurring_event_note = "Month-end contractor settlement batch"

        net_cashflow = round(base_inflow - base_outflow, 2)

        records.append({
            "ds": date_str,
            "y": net_cashflow,
            "inflows": round(base_inflow, 2),
            "outflows": round(base_outflow, 2),
            "recurring_event": recurring_event_note
        })
        current += timedelta(days=1)

    return pd.DataFrame(records)


def get_upcoming_recurring_events(start_date_str: str, horizon_days: int) -> List[Dict[str, Any]]:
    """Identifies expected recurring cash outflows within the forecast horizon."""
    start_dt = datetime.strptime(start_date_str, "%Y-%m-%d")
    events = []

    for i in range(1, horizon_days + 1):
        target_dt = start_dt + timedelta(days=i)
        target_str = target_dt.strftime("%Y-%m-%d")
        weekday = target_dt.weekday()
        day_of_month = target_dt.day

        if weekday == 1:
            events.append({
                "date": target_str,
                "day_name": target_dt.strftime("%A"),
                "event": "Recurring Tuesday partner vendor payout",
                "estimated_outflow": 95000.0,
                "is_dip": True
            })
        if day_of_month in (1, 15):
            events.append({
                "date": target_str,
                "day_name": target_dt.strftime("%A"),
                "event": "Cloud infrastructure & SaaS hosting debit",
                "estimated_outflow": 145000.0,
                "is_dip": True
            })
        if day_of_month == 28:
            events.append({
                "date": target_str,
                "day_name": target_dt.strftime("%A"),
                "event": "Month-end contractor settlement batch",
                "estimated_outflow": 280000.0,
                "is_dip": True
            })

    return events
