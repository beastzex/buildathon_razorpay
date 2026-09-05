"""
Matcher Agent (Tier 1 & Tier 2)
Wraps two-stage hybrid confidence matching (BGE-Small LoRA + Rule Verifier),
detects genuine signal disagreement between neural and deterministic signals,
and reads dynamic auto-match threshold from environment settings.
"""

import os
import time
from typing import Dict, Any, Tuple
from agents.pipeline.agent_base import AgentResult
from models.matcher import get_matcher


class MatcherAgent:
    def __init__(self, default_threshold: float = None):
        self.name = "Matcher Agent"
        self._matcher = get_matcher()
        self.default_threshold = default_threshold

    def get_threshold(self) -> float:
        if self.default_threshold is not None:
            return self.default_threshold
        return float(os.getenv("LEDGR_AUTO_MATCH_THRESHOLD", "0.80"))

    def process(
        self,
        record_a: Dict[str, Any],
        record_b: Dict[str, Any],
        batch_id: str = "",
        record_id: str = "",
        custom_threshold: float = None
    ) -> Tuple[Dict[str, Any], AgentResult]:
        t0 = time.perf_counter()
        threshold = custom_threshold if custom_threshold is not None else self.get_threshold()

        # Run two-stage confidence gate
        match_res = self._matcher.match_pair(record_a, record_b, auto_threshold=threshold)
        
        emb_score = match_res.get("embedding_score", 0.0)
        rule_score = match_res.get("rule_score", 0.0)
        rule_pass = match_res.get("rule_pass", False)
        confidence = match_res.get("confidence", 0)
        base_status = match_res.get("status", "flagged")
        rule_breakdown = match_res.get("rule_breakdown", {})
        
        # Check for genuine disagreement between neural embedding and deterministic rules:
        # Case 1: Neural embedding strongly matches (>= 0.80) but rule verifier failed amount check
        amount_pass = rule_breakdown.get("amount", {}).get("pass", True)
        disagreement = False
        disagreement_reason = None
        
        if emb_score >= 0.78 and not amount_pass:
            disagreement = True
            delta = rule_breakdown.get("amount", {}).get("detail", {}).get("delta", 0.0)
            disagreement_reason = (
                f"Neural embedding indicates strong match ({int(emb_score*100)}%), "
                f"but rule verifier failed amount check (delta = ₹{delta:.2f})."
            )
        elif rule_pass and rule_score >= 0.90 and emb_score < 0.40:
            disagreement = True
            disagreement_reason = (
                f"Rule verifier indicates exact financial match ({int(rule_score*100)}%), "
                f"but neural embedding similarity is low ({int(emb_score*100)}%)."
            )

        duration_ms = int(round((time.perf_counter() - t0) * 1000.0))

        if disagreement:
            status = "disagreement"
            out_summary = f"Disagreement detected: {disagreement_reason}"
        elif base_status == "matched":
            status = "ok"
            out_summary = f"Auto-matched with {confidence}% confidence (Embed: {int(emb_score*100)}%, Rule: {int(rule_score*100)}%). Threshold: {int(threshold*100)}%."
        else:
            status = "escalated"
            out_summary = f"Escalated for review: {confidence}% confidence below threshold {int(threshold*100)}% (Status: {base_status})."

        agent_res = AgentResult(
            agent_name=self.name,
            input_summary=f"Matching {record_a.get('id')} vs {record_b.get('id')} (Amounts: ₹{record_a.get('amount')} vs ₹{record_b.get('amount')})",
            output_summary=out_summary,
            output_data={
                "status": status,
                "confidence": confidence,
                "embedding_score": emb_score,
                "rule_score": rule_score,
                "rule_pass": rule_pass,
                "auto_threshold": threshold,
                "disagreement": disagreement,
                "disagreement_reason": disagreement_reason,
                "rule_breakdown": rule_breakdown
            },
            duration_ms=duration_ms,
            status=status,
            record_id=record_id,
            batch_id=batch_id
        )

        return match_res, agent_res
