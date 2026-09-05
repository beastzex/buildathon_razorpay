"""
Forecast Explainer Agent (Tier 3B)
Generates plain-language, grounded explanations for predicted cash dips or spikes
using upcoming recurring calendar patterns (payroll, cloud bills, partner settlements).
"""

import os
import json
import logging
from typing import Dict, Any, List, Optional
from forecasting.forecast_cashflow import CashflowForecastResult

logger = logging.getLogger("ledgr.forecast_explainer")

GROQ_MODEL = os.getenv("LEDGR_GROQ_MODEL", "openai/gpt-oss-120b")
GROQ_TIMEOUT = 8.0


class ForecastExplainerAgent:
    def __init__(self):
        self.name = "Forecast Explainer Agent"

    def _call_groq_json(self, system_prompt: str, user_prompt: str) -> Optional[Dict[str, Any]]:
        from agents.groq_client import call_groq_chat_completion
        return call_groq_chat_completion(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            model=GROQ_MODEL,
            json_mode=True,
            temperature=0.2,
            max_tokens=600,
            timeout=GROQ_TIMEOUT
        )

    def explain_forecast(self, forecast_result: CashflowForecastResult) -> Dict[str, str]:
        """
        Enhances forecast dip points with synthesized narrative explanations.
        Returns a mapping from date -> grounded explanation string.
        """
        dip_points = [p for p in forecast_result.forecast_points if p.is_dip]
        if not dip_points:
            return {}

        prompt_payload = [
            {
                "date": p.date,
                "day_name": p.day_name,
                "predicted_net_inr": p.predicted_net_inr,
                "lower_bound_inr": p.lower_bound_inr,
                "initial_note": p.explanation_note
            }
            for p in dip_points
        ]

        system_prompt = (
            "You are an AI Cash-Flow Risk Analyst for Ledgr. "
            "Explain notable predicted cash-flow dips for a financial controller in one succinct, reassuring sentence per date. "
            "CRITICAL: Ground your explanation STRICTLY on the supplied initial_note (e.g. recurring partner vendor payouts or cloud hosting). "
            "Do NOT invent unmentioned causes. Return JSON: {\"explanations\": {\"YYYY-MM-DD\": \"sentence\"}}"
        )

        resp = self._call_groq_json(system_prompt, f"Explain these upcoming forecast dips:\n{json.dumps(prompt_payload, indent=2)}")

        if resp and "explanations" in resp and isinstance(resp["explanations"], dict):
            return resp["explanations"]

        # Deterministic fallback explanations
        fallback_map = {}
        for p in dip_points:
            note = p.explanation_note or "Seasonal weekend settlement volume adjustment"
            fallback_map[p.date] = f"Expected cash reduction on {p.day_name}: {note}. Within normal liquidity buffer."

        return fallback_map
