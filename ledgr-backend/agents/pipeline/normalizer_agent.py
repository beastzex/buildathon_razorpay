"""
Normalizer Agent (Tier 1)
Wraps data normalization logic, standardizing currencies, dates, and references,
and emits human-readable diff summaries.
"""

import time
import re
from datetime import datetime
from typing import Dict, Any, Tuple
from agents.pipeline.agent_base import AgentResult


class NormalizerAgent:
    def __init__(self):
        self.name = "Normalizer Agent"

    def _normalize_amount(self, val: Any) -> float:
        if isinstance(val, (int, float)):
            return float(val)
        s = str(val).replace("₹", "").replace("$", "").replace(",", "").strip()
        return float(s)

    def _normalize_date(self, val: Any) -> str:
        if isinstance(val, datetime):
            return val.strftime("%Y-%m-%d")
        s = str(val).strip()
        formats = [
            "%Y-%m-%d", "%d/%m/%Y", "%m/%d/%Y", "%d-%m-%Y",
            "%Y/%m/%d", "%d %b %Y", "%d-%b-%Y", "%Y-%m-%dT%H:%M:%S",
            "%Y-%m-%dT%H:%M:%SZ"
        ]
        for fmt in formats:
            try:
                dt = datetime.strptime(s.split(".")[0], fmt)
                return dt.strftime("%Y-%m-%d")
            except ValueError:
                continue
        raise ValueError(f"Unrecognized date format: '{val}'")

    def process(
        self,
        record_a: Dict[str, Any],
        record_b: Dict[str, Any],
        batch_id: str = "",
        record_id: str = ""
    ) -> Tuple[bool, Dict[str, Any], Dict[str, Any], AgentResult]:
        t0 = time.perf_counter()
        changes = []
        
        try:
            amt_a = self._normalize_amount(record_a.get("amount", 0))
            amt_b = self._normalize_amount(record_b.get("amount", 0))
            if str(record_a.get("amount")) != str(amt_a):
                changes.append(f"Source A amount '{record_a.get('amount')}' → ₹{amt_a:.2f}")
            if str(record_b.get("amount")) != str(amt_b):
                changes.append(f"Source B amount '{record_b.get('amount')}' → ₹{amt_b:.2f}")

            date_a = self._normalize_date(record_a.get("date", ""))
            date_b = self._normalize_date(record_b.get("date", ""))
            if str(record_a.get("date")) != date_a:
                changes.append(f"Source A date '{record_a.get('date')}' → {date_a}")
            if str(record_b.get("date")) != date_b:
                changes.append(f"Source B date '{record_b.get('date')}' → {date_b}")

            ref_a = str(record_a.get("reference", "")).strip().upper()
            ref_b = str(record_b.get("reference", "")).strip().upper()

            norm_a = {**record_a, "amount": amt_a, "date": date_a, "reference": ref_a}
            norm_b = {**record_b, "amount": amt_b, "date": date_b, "reference": ref_b}

            duration_ms = int(round((time.perf_counter() - t0) * 1000.0))
            change_summary = "; ".join(changes) if changes else "Canonical formats verified; zero transformation required."

            return True, norm_a, norm_b, AgentResult(
                agent_name=self.name,
                input_summary=f"Standardizing records for pair {record_id or norm_a.get('id')}",
                output_summary=f"Normalized fields: {change_summary}",
                output_data={
                    "normalized_a": norm_a,
                    "normalized_b": norm_b,
                    "transformations_applied": changes
                },
                duration_ms=duration_ms,
                status="ok",
                record_id=record_id,
                batch_id=batch_id
            )

        except Exception as e:
            duration_ms = int(round((time.perf_counter() - t0) * 1000.0))
            return False, record_a, record_b, AgentResult(
                agent_name=self.name,
                input_summary=f"Normalizing records for pair {record_id}",
                output_summary=f"Normalization failed: {str(e)}",
                output_data={"error": str(e)},
                duration_ms=duration_ms,
                status="failed",
                record_id=record_id,
                batch_id=batch_id
            )
