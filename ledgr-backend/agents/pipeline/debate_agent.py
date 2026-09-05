"""
Debate / Consensus Agent (Tier 2A)
Runs a bounded 2-round multi-agent debate when neural embeddings and deterministic rules disagree.
Round 1: Two independent LLM opinions (Advocate FOR match vs Advocate AGAINST match).
Round 2: Consensus resolver evaluates both arguments and detective context.
Fallback: Defaults explicitly to 'flag for human review' (never an auto-resolved guess).
"""

import os
import time
import json
import logging
from typing import Dict, Any, List, Optional, Tuple
from pydantic import BaseModel, Field
from agents.pipeline.agent_base import AgentResult

logger = logging.getLogger("ledgr.debate_agent")

GROQ_MODEL = os.getenv("LEDGR_GROQ_MODEL", "openai/gpt-oss-120b")
GROQ_TIMEOUT = 8.0


class DebateOpinion(BaseModel):
    stance: str  # "FOR" or "AGAINST"
    arguments: List[str]
    verdict: str  # "match" or "mismatch" or "ambiguous"
    confidence_score: int  # 0-100


class DebateResult(BaseModel):
    resolved: bool
    verdict: str  # "match", "mismatch", "flag for human review"
    rounds: int  # 1 or 2
    disagreement_summary: str
    opinion_for: str
    opinion_against: str
    resolver_reasoning: Optional[str] = None
    fallback_used: bool = False


class DebateAgent:
    def __init__(self):
        self.name = "Debate Agent"

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
            max_tokens=800,
            timeout=GROQ_TIMEOUT
        )

    def _deterministic_fallback(
        self,
        record_a: Dict[str, Any],
        record_b: Dict[str, Any],
        disagreement_reason: str
    ) -> DebateResult:
        """
        Deterministic fallback when Groq is unreachable.
        Explicitly defaults to 'flag for human review' (NEVER guesses an auto-resolution).
        """
        amt_a = record_a.get("amount", 0)
        amt_b = record_b.get("amount", 0)
        delta = abs(float(amt_a) - float(amt_b))
        
        opinion_for = (
            f"Advocate FOR: Semantic narration patterns match and reference tokens align. "
            f"The ₹{delta:.2f} delta could correspond to unapplied partner charges."
        )
        opinion_against = (
            f"Advocate AGAINST: Strict financial balance sheet requires exact paisa balance. "
            f"The delta of ₹{delta:.2f} exceeds standard tolerance; auto-matching risks financial leakage."
        )

        return DebateResult(
            resolved=False,
            verdict="flag for human review",
            rounds=0,
            disagreement_summary=f"Unresolved conflict: {disagreement_reason}. Groq offline; defaulting safely to human review.",
            opinion_for=opinion_for,
            opinion_against=opinion_against,
            resolver_reasoning="Consensus engine fell back to manual controller review due to LLM unreachability. No auto-resolution applied.",
            fallback_used=True
        )

    def process(
        self,
        record_a: Dict[str, Any],
        record_b: Dict[str, Any],
        match_details: Dict[str, Any],
        detective_context: Optional[List[Dict[str, Any]]] = None,
        batch_id: str = "",
        record_id: str = ""
    ) -> Tuple[DebateResult, AgentResult]:
        t0 = time.perf_counter()
        disagreement_reason = match_details.get("disagreement_reason") or "Embedding vs rule verifier divergence"
        
        context_str = json.dumps({
            "record_a": record_a,
            "record_b": record_b,
            "embedding_score": match_details.get("embedding_score"),
            "rule_breakdown": match_details.get("rule_breakdown"),
            "detective_related_transactions": detective_context or []
        }, indent=2)

        # Round 1: Two independent opinions
        prompt_for_system = (
            "You are an AI Forensic Auditor arguing FOR reconciliation. "
            "Your task is to find all plausible reasons why these two financial records represent the SAME transaction. "
            "Consider timing lag, MDR fees, gateway deductions, and reference token overlap. "
            "Return JSON: {\"arguments\": [\"...\"], \"verdict\": \"match\"|\"ambiguous\", \"confidence_score\": 0-100}"
        )
        prompt_against_system = (
            "You are an AI Risk Controller arguing AGAINST reconciliation. "
            "Your task is to identify every risk, discrepancy, and reason why these two records are NOT the same transaction. "
            "Highlight amount gaps, counterparty mismatches, and compliance hazards. "
            "Return JSON: {\"arguments\": [\"...\"], \"verdict\": \"mismatch\"|\"ambiguous\", \"confidence_score\": 0-100}"
        )

        resp_for = self._call_groq_json(prompt_for_system, f"Analyze and argue FOR match:\n{context_str}")
        resp_against = self._call_groq_json(prompt_against_system, f"Analyze and argue AGAINST match:\n{context_str}")

        if not resp_for or not resp_against:
            # Groq offline / timed out -> deterministic fallback to 'flag for human review'
            debate_res = self._deterministic_fallback(record_a, record_b, disagreement_reason)
            duration_ms = int(round((time.perf_counter() - t0) * 1000.0))
            agent_res = AgentResult(
                agent_name=self.name,
                input_summary=f"Conflicting signals on {record_id or record_a.get('id')}",
                output_summary="Debate fallback: Groq unavailable. Defaulted to 'flag for human review'.",
                output_data={
                    "debate_result": debate_res.model_dump(),
                    "rounds": debate_res.rounds,
                    "verdict": debate_res.verdict
                },
                duration_ms=duration_ms,
                status="escalated",
                record_id=record_id,
                batch_id=batch_id
            )
            return debate_res, agent_res

        op_for_text = "; ".join(resp_for.get("arguments", []))
        op_against_text = "; ".join(resp_against.get("arguments", []))
        v_for = resp_for.get("verdict", "match")
        v_against = resp_against.get("verdict", "mismatch")

        # Round 1 consensus check: if both agreed despite different priming
        if v_for == v_against:
            debate_res = DebateResult(
                resolved=True,
                verdict=v_for,
                rounds=1,
                disagreement_summary=f"Resolved in Round 1: Both advocates agreed on '{v_for}'.",
                opinion_for=op_for_text,
                opinion_against=op_against_text,
                resolver_reasoning=f"Both independent viewpoints independently reached consensus: {v_for}.",
                fallback_used=False
            )
        else:
            # Round 2: Consensus Resolver call
            resolver_system = (
                "You are the Senior Resolution Arbiter for Ledgr. "
                "Two specialized AI reviewers have debated a financial transaction discrepancy with conflicting views. "
                "Review the record pair, the detective's context, and both debate arguments. "
                "Deliver a final, decisive verdict: 'match' (if fee/timing explainable), 'mismatch' (if fraudulent/unrelated), "
                "or 'flag for human review' (if ambiguity is irreconcilable). "
                "Return JSON: {\"verdict\": \"match\"|\"mismatch\"|\"flag for human review\", \"reasoning\": \"...\"}"
            )
            resolver_user = (
                f"Data Context:\n{context_str}\n\n"
                f"Advocate FOR arguments:\n{op_for_text}\n\n"
                f"Advocate AGAINST arguments:\n{op_against_text}"
            )
            resp_resolver = self._call_groq_json(resolver_system, resolver_user)
            
            if resp_resolver and "verdict" in resp_resolver:
                final_verdict = resp_resolver.get("verdict", "flag for human review")
                resolver_reasoning = resp_resolver.get("reasoning", "")
                debate_res = DebateResult(
                    resolved=(final_verdict != "flag for human review"),
                    verdict=final_verdict,
                    rounds=2,
                    disagreement_summary=f"Resolved in Round 2 via arbiter consensus: '{final_verdict}'.",
                    opinion_for=op_for_text,
                    opinion_against=op_against_text,
                    resolver_reasoning=resolver_reasoning,
                    fallback_used=False
                )
            else:
                debate_res = self._deterministic_fallback(record_a, record_b, disagreement_reason)

        duration_ms = int(round((time.perf_counter() - t0) * 1000.0))
        agent_res = AgentResult(
            agent_name=self.name,
            input_summary=f"Debating discrepancy on {record_id or record_a.get('id')}",
            output_summary=f"Debate completed in {debate_res.rounds} round(s). Verdict: '{debate_res.verdict}'.",
            output_data={
                "debate_result": debate_res.model_dump(),
                "opinion_for": debate_res.opinion_for,
                "opinion_against": debate_res.opinion_against,
                "resolver_reasoning": debate_res.resolver_reasoning,
                "verdict": debate_res.verdict,
                "rounds": debate_res.rounds
            },
            duration_ms=duration_ms,
            status="ok" if debate_res.resolved else "escalated",
            record_id=record_id,
            batch_id=batch_id
        )

        return debate_res, agent_res
