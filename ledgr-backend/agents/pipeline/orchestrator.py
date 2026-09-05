"""
Pipeline Orchestrator (Tier 1 & Tier 2)
Coordinates the sequential execution of Ingestion, Normalizer, Matcher,
Detective, Debate, Explainer, and Auditor agents.
Publishes real-time events to the EventBus (Redis Pub/Sub / in-process queue).
"""

import time
import asyncio
import logging
from typing import Dict, Any, List, Optional, Tuple

from agents.pipeline.agent_base import AgentResult
from agents.pipeline.event_bus import get_event_bus
from agents.pipeline.ingestion_agent import IngestionAgent
from agents.pipeline.normalizer_agent import NormalizerAgent
from agents.pipeline.matcher_agent import MatcherAgent
from agents.pipeline.detective_agent import DetectiveAgent
from agents.pipeline.debate_agent import DebateAgent, DebateResult
from agents.pipeline.explainer_agent import ExplainerAgent
from agents.pipeline.auditor_agent import AuditorAgent

logger = logging.getLogger("ledgr.orchestrator")


class PipelineOrchestrator:
    def __init__(self, default_threshold: float = None):
        self.ingestion = IngestionAgent()
        self.normalizer = NormalizerAgent()
        self.matcher = MatcherAgent(default_threshold=default_threshold)
        self.detective = DetectiveAgent()
        self.debate = DebateAgent()
        self.explainer = ExplainerAgent()
        self.auditor = AuditorAgent()
        self.event_bus = get_event_bus()

    async def _emit(self, batch_id: str, result: AgentResult):
        try:
            await self.event_bus.publish(batch_id, result)
        except Exception as e:
            logger.warning(f"Failed to publish event to bus: {e}")

    async def process_pair(
        self,
        record_a: Dict[str, Any],
        record_b: Dict[str, Any],
        batch_id: str,
        record_id: str,
        prev_audit_hash: str,
        batch_records: Optional[List[Dict[str, Any]]] = None,
        custom_threshold: float = None
    ) -> Dict[str, Any]:
        """
        Executes the agent relay for a single transaction pair,
        emitting live events at every stage transition.
        """
        events_emitted: List[AgentResult] = []

        # 1. Ingestion Agent
        try:
            valid, ing_res = self.ingestion.process(record_a, record_b, batch_id, record_id)
            await self._emit(batch_id, ing_res)
            events_emitted.append(ing_res)
            if not valid:
                return {
                    "status": "failed",
                    "reason": ing_res.output_summary,
                    "final_audit_hash": prev_audit_hash,
                    "events": events_emitted
                }
        except Exception as e:
            fail_res = AgentResult(
                agent_name="Ingestion Agent",
                input_summary=f"Ingesting {record_id}",
                output_summary=f"Ingestion crashed: {str(e)}",
                status="failed",
                record_id=record_id,
                batch_id=batch_id
            )
            await self._emit(batch_id, fail_res)
            events_emitted.append(fail_res)
            return {"status": "failed", "reason": str(e), "final_audit_hash": prev_audit_hash, "events": events_emitted}

        # 2. Normalizer Agent
        try:
            norm_ok, norm_a, norm_b, norm_res = self.normalizer.process(record_a, record_b, batch_id, record_id)
            await self._emit(batch_id, norm_res)
            events_emitted.append(norm_res)
            if not norm_ok:
                return {
                    "status": "failed",
                    "reason": norm_res.output_summary,
                    "final_audit_hash": prev_audit_hash,
                    "events": events_emitted
                }
        except Exception as e:
            fail_res = AgentResult(
                agent_name="Normalizer Agent",
                input_summary=f"Normalizing {record_id}",
                output_summary=f"Normalization crashed: {str(e)}",
                status="failed",
                record_id=record_id,
                batch_id=batch_id
            )
            await self._emit(batch_id, fail_res)
            events_emitted.append(fail_res)
            return {"status": "failed", "reason": str(e), "final_audit_hash": prev_audit_hash, "events": events_emitted}

        # 3. Matcher Agent (Two-stage gate + disagreement check)
        try:
            match_details, match_res = self.matcher.process(
                norm_a, norm_b, batch_id, record_id, custom_threshold=custom_threshold
            )
            await self._emit(batch_id, match_res)
            events_emitted.append(match_res)
        except Exception as e:
            fail_res = AgentResult(
                agent_name="Matcher Agent",
                input_summary=f"Matching {record_id}",
                output_summary=f"Matching calculation failed: {str(e)}",
                status="failed",
                record_id=record_id,
                batch_id=batch_id
            )
            await self._emit(batch_id, fail_res)
            events_emitted.append(fail_res)
            match_details = {"status": "mismatched", "confidence": 0, "rule_breakdown": {}}

        matcher_status = match_res.status  # "ok", "disagreement", or "escalated"
        detective_context = []
        debate_result = None
        explanation_obj = None

        # FAST-PATH BRANCH: If matcher is "ok", skip detective, debate, and explainer!
        if matcher_status == "ok":
            fast_path_res = AgentResult(
                agent_name="Pipeline Router",
                input_summary=f"Fast-path evaluation for {record_id}",
                output_summary=f"Fast-path match verified ({match_details.get('confidence')}% confidence). Skipping detective and explainer stages.",
                output_data={"confidence": match_details.get("confidence"), "action": "fast_path_matched"},
                status="ok",
                record_id=record_id,
                batch_id=batch_id
            )
            await self._emit(batch_id, fast_path_res)
            events_emitted.append(fast_path_res)

        else:
            # 4. Detective Agent (Runs BEFORE debate so debate opinions have access to related-transaction context)
            try:
                detective_context, det_res = self.detective.process(
                    norm_a, norm_b, batch_records, batch_id, record_id
                )
                await self._emit(batch_id, det_res)
                events_emitted.append(det_res)
            except Exception as e:
                fail_res = AgentResult(
                    agent_name="Detective Agent",
                    input_summary=f"Account context search for {record_id}",
                    output_summary=f"Investigation timed out or failed: {str(e)}",
                    status="failed",
                    record_id=record_id,
                    batch_id=batch_id
                )
                await self._emit(batch_id, fail_res)
                events_emitted.append(fail_res)

            # 5A. Debate Agent (Only invoked when matcher_status == "disagreement")
            if matcher_status == "disagreement":
                try:
                    debate_result, deb_res = self.debate.process(
                        norm_a, norm_b, match_details, detective_context, batch_id, record_id
                    )
                    await self._emit(batch_id, deb_res)
                    events_emitted.append(deb_res)
                except Exception as e:
                    logger.error(f"Debate failed: {e}")
                    debate_result = DebateResult(
                        resolved=False,
                        verdict="flag for human review",
                        rounds=0,
                        disagreement_summary=f"Debate aborted due to internal error: {e}",
                        opinion_for="Unavailable",
                        opinion_against="Unavailable",
                        fallback_used=True
                    )
                    fail_res = AgentResult(
                        agent_name="Debate Agent",
                        input_summary=f"Debate on {record_id}",
                        output_summary="Debate failed; defaulted safely to 'flag for human review'.",
                        status="failed",
                        record_id=record_id,
                        batch_id=batch_id
                    )
                    await self._emit(batch_id, fail_res)
                    events_emitted.append(fail_res)

            # 5B. Explainer Agent (Synthesizes match details, detective context, and debate consensus)
            try:
                explanation_obj, exp_res = self.explainer.process(
                    norm_a, norm_b, match_details, detective_context, debate_result, batch_id, record_id
                )
                await self._emit(batch_id, exp_res)
                events_emitted.append(exp_res)
            except Exception as e:
                logger.error(f"Explainer failed: {e}")
                fail_res = AgentResult(
                    agent_name="Explainer Agent",
                    input_summary=f"Explaining {record_id}",
                    output_summary=f"Explanation unavailable: {str(e)}. Marked for manual controller review.",
                    status="failed",
                    record_id=record_id,
                    batch_id=batch_id
                )
                await self._emit(batch_id, fail_res)
                events_emitted.append(fail_res)

        # 6. Auditor Agent (Seal event into SHA-256 hash chain)
        audit_payload = {
            "record_id": record_id,
            "record_a_id": norm_a.get("id"),
            "record_b_id": norm_b.get("id"),
            "confidence": match_details.get("confidence", 0),
            "status": match_details.get("status", "flagged"),
            "matcher_disagreement": (matcher_status == "disagreement"),
            "debated": bool(debate_result),
            "debate_verdict": debate_result.verdict if debate_result else None,
            "explanation_status": explanation_obj.explanation_status if explanation_obj else "not_applicable"
        }
        
        event_type = "auto_match" if matcher_status == "ok" else "exception_escalation"
        new_audit_hash, aud_res = self.auditor.process(
            event_type, audit_payload, prev_audit_hash, batch_id, record_id
        )
        await self._emit(batch_id, aud_res)
        events_emitted.append(aud_res)

        return {
            "status": match_details.get("status", "flagged"),
            "confidence": match_details.get("confidence", 0),
            "match_details": match_details,
            "normalized_a": norm_a,
            "normalized_b": norm_b,
            "detective_context": detective_context,
            "debate_result": debate_result,
            "explanation": explanation_obj,
            "audit_payload": audit_payload,
            "new_audit_hash": new_audit_hash,
            "events": events_emitted
        }
