"""
Detective Agent (Tier 1 & Tier 2)
Investigates related transactions for the same account, reference, or amount window
to provide context to both the Debate Agent and the Explainer Agent.
"""

import time
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timedelta
from agents.pipeline.agent_base import AgentResult


class DetectiveAgent:
    def __init__(self):
        self.name = "Detective Agent"

    def process(
        self,
        record_a: Dict[str, Any],
        record_b: Dict[str, Any],
        batch_records: Optional[List[Dict[str, Any]]] = None,
        batch_id: str = "",
        record_id: str = ""
    ) -> Tuple[List[Dict[str, Any]], AgentResult]:
        t0 = time.perf_counter()
        
        ref_a = str(record_a.get("reference", "")).strip().upper()
        ref_b = str(record_b.get("reference", "")).strip().upper()
        amt_a = float(record_a.get("amount", 0.0))
        amt_b = float(record_b.get("amount", 0.0))
        date_a = str(record_a.get("date", ""))
        
        related = []
        
        if batch_records:
            # Search candidate pool in memory/batch
            for item in batch_records:
                rec_item = item.get("sourceA") or item
                if not isinstance(rec_item, dict):
                    continue
                other_id = str(rec_item.get("id", ""))
                if other_id == record_a.get("id") or other_id == record_b.get("id"):
                    continue
                
                other_ref = str(rec_item.get("reference", "")).strip().upper()
                other_amt = float(rec_item.get("amount", 0.0))
                other_date = str(rec_item.get("date", ""))
                
                # Check similarity: reference overlap or close amount within window
                ref_match = (
                    (ref_a and ref_a in other_ref) or (other_ref and other_ref in ref_a) or
                    (ref_b and ref_b in other_ref) or (other_ref and other_ref in ref_b)
                )
                amt_close = abs(other_amt - amt_a) <= (0.05 * amt_a + 50.0) if amt_a > 0 else False
                
                if ref_match or amt_close:
                    related.append({
                        "id": other_id,
                        "amount": other_amt,
                        "date": other_date,
                        "reference": other_ref,
                        "description": rec_item.get("description", "")
                    })
                    if len(related) >= 5:
                        break

        duration_ms = int(round((time.perf_counter() - t0) * 1000.0))
        
        if related:
            summary = f"Found {len(related)} related transactions from the same account/reference within the 48-hour batch window."
        else:
            summary = "Isolated transaction: No concurrent related transactions or split payouts detected in window."

        agent_res = AgentResult(
            agent_name=self.name,
            input_summary=f"Investigating account history & references for {record_a.get('id')} ({ref_a})",
            output_summary=summary,
            output_data={
                "related_count": len(related),
                "related_records": related,
                "investigation_focus": {
                    "reference": ref_a or ref_b,
                    "target_amount": amt_a,
                    "date": date_a
                }
            },
            duration_ms=duration_ms,
            status="ok",
            record_id=record_id,
            batch_id=batch_id
        )

        return related, agent_res
