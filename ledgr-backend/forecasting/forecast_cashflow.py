"""
Prophet Cash-Flow Forecasting Model (Tier 3B)
Trains Meta Prophet on historical daily net movements to generate 3/7/30-day cash positions
with shaded confidence intervals and forecast volatility metrics.
"""

import logging
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from forecasting.prepare_timeseries import generate_historical_cashflow_series, get_upcoming_recurring_events

logger = logging.getLogger("ledgr.forecasting")


class ForecastPoint(BaseModel):
    date: str
    day_name: str
    predicted_net_inr: float
    lower_bound_inr: float
    upper_bound_inr: float
    historical_actual: Optional[float] = None
    is_forecast: bool = True
    is_dip: bool = False
    explanation_note: Optional[str] = None


class CashflowForecastResult(BaseModel):
    horizon_days: int
    start_date: str
    end_date: str
    historical_points: List[ForecastPoint]
    forecast_points: List[ForecastPoint]
    forecast_volatility: float
    mean_predicted_daily_net: float
    cumulative_net_position: float
    data_provenance: str = "Trained on synthetic historical settlement series with Meta Prophet"


def run_cashflow_forecast(horizon_days: int = 7, historical_days: int = 45) -> CashflowForecastResult:
    """
    Fits Prophet on historical daily cash flow series and predicts next horizon_days.
    """
    from prophet import Prophet

    # Suppress verbose cmdstanpy logging
    logging.getLogger("cmdstanpy").setLevel(logging.WARNING)

    df_hist = generate_historical_cashflow_series(days=historical_days)
    last_hist_date = df_hist["ds"].iloc[-1]

    # Initialize Prophet model with weekly seasonality & 90% uncertainty interval
    m = Prophet(
        interval_width=0.90,
        weekly_seasonality=True,
        daily_seasonality=False,
        yearly_seasonality=False
    )
    m.fit(df_hist[["ds", "y"]])

    # Generate future horizon
    future = m.make_future_dataframe(periods=horizon_days, freq="D")
    forecast = m.predict(future)

    # Cross-reference recurring events for grounded explanations
    upcoming_events = {e["date"]: e for e in get_upcoming_recurring_events(last_hist_date, horizon_days)}

    forecast_slice = forecast.tail(horizon_days)

    forecast_points = []
    yhat_values = []

    for _, row in forecast_slice.iterrows():
        dt_str = str(row["ds"])[:10]
        yhat = float(row["yhat"])
        y_low = float(row["yhat_lower"])
        y_up = float(row["yhat_upper"])
        yhat_values.append(yhat)

        dt_obj = pd.to_datetime(dt_str)
        day_name = dt_obj.strftime("%A")

        event_info = upcoming_events.get(dt_str)
        is_dip = False
        note = None

        if event_info:
            is_dip = True
            note = f"{event_info['event']} (approx ₹{event_info['estimated_outflow']:,.0f}). Expected seasonal outflow."
        elif yhat < np.mean(df_hist["y"]) * 0.70:
            is_dip = True
            note = f"Lower weekend transaction volume typically experienced on {day_name}s."

        forecast_points.append(ForecastPoint(
            date=dt_str,
            day_name=day_name,
            predicted_net_inr=round(yhat, 2),
            lower_bound_inr=round(y_low, 2),
            upper_bound_inr=round(y_up, 2),
            is_forecast=True,
            is_dip=is_dip,
            explanation_note=note
        ))

    # Package recent historical points (last 14 days) for continuous chart rendering
    hist_points = []
    for _, row in df_hist.tail(14).iterrows():
        d_str = str(row["ds"])[:10]
        y_val = float(row["y"])
        dt_obj = pd.to_datetime(d_str)
        hist_points.append(ForecastPoint(
            date=d_str,
            day_name=dt_obj.strftime("%A"),
            predicted_net_inr=y_val,
            lower_bound_inr=y_val,
            upper_bound_inr=y_val,
            historical_actual=y_val,
            is_forecast=False,
            is_dip=False,
            explanation_note=row.get("recurring_event")
        ))

    # Calculate forecast volatility
    vol = float(np.std(yhat_values) / (abs(np.mean(yhat_values)) + 1e-4))
    vol = round(min(1.0, max(0.05, vol)), 3)

    mean_daily = round(float(np.mean(yhat_values)), 2)
    cum_net = round(float(np.sum(yhat_values)), 2)

    return CashflowForecastResult(
        horizon_days=horizon_days,
        start_date=forecast_points[0].date,
        end_date=forecast_points[-1].date,
        historical_points=hist_points,
        forecast_points=forecast_points,
        forecast_volatility=vol,
        mean_predicted_daily_net=mean_daily,
        cumulative_net_position=cum_net
    )
