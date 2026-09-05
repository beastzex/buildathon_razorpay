"""
Ingestion Agent (Tier 1)
Validates raw records across sources, checks schema completeness, and extracts metadata.
"""

import time
from typing import Dict, Any, Tuple
from agents.pipeline.agent_base import AgentResult


class IngestionAgent:
    def __init__(self):
        self.name = "Ingestion Agent"

    def process(
        self,
        record_a: Dict[str, Any],
        record_b: Dict[str, Any],
        batch_id: str = "",
        record_id: str = ""
    ) -> Tuple[bool, AgentResult]:
        t0 = time.perf_counter()
        
        id_a = record_a.get("id", "UNKNOWN_A")
        id_b = record_b.get("id", "UNKNOWN_B")
        
        required_fields = ["amount", "date", "description", "reference"]
        missing_a = [f for f in required_fields if f not in record_a or record_a[f] is None]
        missing_b = [f for f in required_fields if f not in record_b or record_b[f] is None]
        
        duration_ms = int(round((time.perf_counter() - t0) * 1000.0))
        
        if missing_a or missing_b:
            err_details = []
            if missing_a:
                err_details.append(f"Source A missing {', '.join(missing_a)}")
            if missing_b:
                err_details.append(f"Source B missing {', '.join(missing_b)}")
            summary = "; ".join(err_details)
            
            return False, AgentResult(
                agent_name=self.name,
                input_summary=f"Raw records {id_a} and {id_b}",
                output_summary=f"Validation failed: {summary}",
                output_data={"record_a": record_a, "record_b": record_b, "errors": err_details},
                duration_ms=duration_ms,
                status="failed",
                record_id=record_id,
                batch_id=batch_id
            )

        fields_present = list(set(list(record_a.keys()) + list(record_b.keys())))
        out_summary = f"Parsed records {id_a} & {id_b}; validated {len(fields_present)} core transactional fields."
        
        return True, AgentResult(
            agent_name=self.name,
            input_summary=f"Raw inputs: Bank ({id_a}) & Gateway ({id_b})",
            output_summary=out_summary,
            output_data={
                "record_a_id": id_a,
                "record_b_id": id_b,
                "fields_validated": required_fields,
                "amount_a": record_a.get("amount"),
                "amount_b": record_b.get("amount")
            },
            duration_ms=duration_ms,
            status="ok",
            record_id=record_id,
            batch_id=batch_id
        )
