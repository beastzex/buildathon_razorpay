"""
Auditor Agent (Tier 1)
Wraps SHA-256 tamper-evident cryptographic audit logging,
sealing transactions and emitting immutable block confirmation events.
"""

import time
from typing import Dict, Any, Tuple
from agents.pipeline.agent_base import AgentResult
from api.audit import compute_entry_hash, canonical_json


class AuditorAgent:
    def __init__(self):
        self.name = "Auditor Agent"

    def process(
        self,
        event_type: str,
        payload: Dict[str, Any],
        prev_hash: str,
        batch_id: str = "",
        record_id: str = ""
    ) -> Tuple[str, AgentResult]:
        t0 = time.perf_counter()
        
        entry_hash = compute_entry_hash(prev_hash, payload)
        duration_ms = int(round((time.perf_counter() - t0) * 1000.0))
        
        short_hash = f"{entry_hash[:8]}...{entry_hash[-6:]}"
        short_prev = f"{prev_hash[:8]}...{prev_hash[-6:]}" if len(prev_hash) > 14 else prev_hash
        out_summary = f"SHA-256 sealed block: hash={short_hash} (prev={short_prev}) for event '{event_type}'."

        agent_res = AgentResult(
            agent_name=self.name,
            input_summary=f"Audit sealing for {record_id or payload.get('record_id', 'batch')}",
            output_summary=out_summary,
            output_data={
                "hash": entry_hash,
                "prev_hash": prev_hash,
                "event_type": event_type,
                "canonical_size_bytes": len(canonical_json(payload))
            },
            duration_ms=duration_ms,
            status="ok",
            record_id=record_id,
            batch_id=batch_id
        )

        return entry_hash, agent_res
