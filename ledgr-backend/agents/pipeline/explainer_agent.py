"""
Explainer Agent (Tier 1 & Tier 2)
Synthesizes discrepancy analysis using Groq LLM, integrating Detective context
and Debate consensus arguments into the final human-facing explanation.
"""

import time
from typing import Dict, Any, List, Optional, Tuple
from agents.pipeline.agent_base import AgentResult
from agents.explain_exception import explain_exception, ExceptionExplanation


class ExplainerAgent:
    def __init__(self):
        self.name = "Explainer Agent"

    def process(
        self,
        record_a: Dict[str, Any],
        record_b: Dict[str, Any],
        match_details: Dict[str, Any],
        detective_context: Optional[List[Dict[str, Any]]] = None,
        debate_result: Optional[Any] = None,
        batch_id: str = "",
        record_id: str = ""
    ) -> Tuple[ExceptionExplanation, AgentResult]:
        t0 = time.perf_counter()

        # Augment match_details with detective and debate context
        augmented_details = {**match_details}
        if detective_context:
            augmented_details["detective_findings"] = detective_context
        if debate_result:
            if hasattr(debate_result, "model_dump"):
                augmented_details["debate_consensus"] = debate_result.model_dump()
            elif isinstance(debate_result, dict):
                augmented_details["debate_consensus"] = debate_result

        # Run explanation engine
        exp_res: ExceptionExplanation = explain_exception(record_a, record_b, augmented_details)
        duration_ms = int(round((time.perf_counter() - t0) * 1000.0))

        status = "ok" if exp_res.explanation_status == "ok" else "escalated"
        summary = exp_res.explanation
        if len(summary) > 120:
            summary = summary[:117] + "..."

        agent_res = AgentResult(
            agent_name=self.name,
            input_summary=f"Analyzing discrepancy on {record_id or record_a.get('id')}",
            output_summary=f"Discrepancy explained: {summary}",
            output_data={
                "explanation": exp_res.explanation,
                "suggested_resolution": exp_res.suggested_resolution,
                "confidence_reasoning": exp_res.confidence_reasoning,
                "explanation_status": exp_res.explanation_status,
                "detective_used": bool(detective_context),
                "debate_used": bool(debate_result)
            },
            duration_ms=duration_ms,
            status=status,
            record_id=record_id,
            batch_id=batch_id
        )

        return exp_res, agent_res
