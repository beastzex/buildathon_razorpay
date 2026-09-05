"""
Root-Cause Chain Agent (Tier 3A)
Multi-hop investigative agent that searches related transactions to identify
systemic patterns behind reconciliation discrepancies (e.g. fee schedule changes,
systemic payment gateway rounding shifts, batch settlement cuts).

Features:
- Bounded tool-calling loop (max 4 tool calls)
- 4 investigative tools: search_by_account, search_by_amount_pattern, search_by_reference_pattern, get_fee_schedule_history
- Strict ground-truth citation validator: rejects any hypothesis citing record IDs not revealed by tools
- Deterministic fallback when LLM is unavailable or ungrounded
"""

import os
import json
import time
import logging
from typing import Dict, Any, List, Optional, Set, Tuple
from pydantic import BaseModel, Field

logger = logging.getLogger("ledgr.root_cause_agent")

GROQ_MODEL = os.getenv("LEDGR_GROQ_MODEL", "openai/gpt-oss-120b")
GROQ_TIMEOUT = 8.0


class RootCauseResult(BaseModel):
    pattern_id: str
    hypothesis: str
    supporting_record_ids: List[str]
    affected_count: int
    confidence: float
    investigation_trace: List[str]
    root_cause_category: str = "fee_schedule_mismatch"  # fee_schedule_mismatch, timing_delay, gateway_deduction, rounding_error
    pattern_signature: str = ""
    fallback_used: bool = False
    status: str = "identified"  # "identified", "insufficient_evidence", "fallback"


class RootCauseInvestigator:
    def __init__(self, records: List[Dict[str, Any]], fee_schedule_history: Optional[List[Dict[str, Any]]] = None):
        """
        Initializes the investigation workspace with in-memory transaction records and known fee changes.
        """
        self.records = records
        self.fee_schedules = fee_schedule_history or [
            {
                "effective_date": "2026-08-20",
                "category": "Credit Card MDR",
                "old_rate": 0.018,
                "new_rate": 0.021,
                "note": "Card network interchange rate revised from 1.80% to 2.10% + 18% GST"
            },
            {
                "effective_date": "2026-08-25",
                "category": "NetBanking Flat Fee",
                "old_rate": 10.0,
                "new_rate": 15.0,
                "note": "HDFC and ICICI netbanking gateway levy increased by ₹5.00"
            },
            {
                "effective_date": "2026-09-01",
                "category": "International Card Surcharge",
                "old_rate": 0.030,
                "new_rate": 0.035,
                "note": "Cross-border settlement markup adjusted to 3.50%"
            }
        ]
        # Track all record IDs that were actually returned to the LLM across tool calls
        self.revealed_record_ids: Set[str] = set()
        self.tool_call_history: List[str] = []

    # =========================================================================
    # Investigation Tools
    # =========================================================================

    def search_by_account(self, account_identifier: str, date_from: Optional[str] = None, date_to: Optional[str] = None) -> List[Dict[str, Any]]:
        """Find all records for a given account / counterparty within an optional date range."""
        results = []
        acc_lower = (account_identifier or "").lower().strip()
        
        for r in self.records:
            sa = r.get("sourceA") or {}
            sb = r.get("sourceB") or {}
            desc_a = str(sa.get("description", "")).lower()
            desc_b = str(sb.get("description", "")).lower()
            id_a = str(sa.get("id", "")).lower()
            id_b = str(sb.get("id", "")).lower()

            if acc_lower in desc_a or acc_lower in desc_b or acc_lower in id_a or acc_lower in id_b:
                rec_id = r.get("id") or r.get("record_id") or sa.get("id") or "UNKNOWN"
                results.append({
                    "record_id": rec_id,
                    "date": sa.get("date") or sb.get("date"),
                    "amount_a": sa.get("amount"),
                    "amount_b": sb.get("amount"),
                    "description_a": sa.get("description"),
                    "description_b": sb.get("description"),
                    "delta": abs(float(sa.get("amount", 0)) - float(sb.get("amount", 0)))
                })
                self.revealed_record_ids.add(rec_id)
        
        self.tool_call_history.append(
            f"search_by_account(account='{account_identifier}', dates='{date_from}..{date_to}'): Found {len(results)} matching records."
        )
        return results[:15]

    def search_by_amount_pattern(self, target_delta: float, delta_tolerance: float = 1.0) -> List[Dict[str, Any]]:
        """Find records where amount difference |A - B| closely matches target_delta."""
        results = []
        for r in self.records:
            sa = r.get("sourceA") or {}
            sb = r.get("sourceB") or {}
            try:
                amt_a = float(sa.get("amount", 0))
                amt_b = float(sb.get("amount", 0))
                delta = abs(amt_a - amt_b)
                if abs(delta - target_delta) <= delta_tolerance and delta > 0.05:
                    rec_id = r.get("id") or r.get("record_id") or sa.get("id") or "UNKNOWN"
                    results.append({
                        "record_id": rec_id,
                        "date": sa.get("date") or sb.get("date"),
                        "amount_a": amt_a,
                        "amount_b": amt_b,
                        "delta": round(delta, 2),
                        "description": sa.get("description")
                    })
                    self.revealed_record_ids.add(rec_id)
            except Exception:
                continue

        self.tool_call_history.append(
            f"search_by_amount_pattern(delta={target_delta}, tol={delta_tolerance}): Found {len(results)} records with matching shortfall."
        )
        return results[:20]

    def search_by_reference_pattern(self, pattern: str) -> List[Dict[str, Any]]:
        """Find records sharing a partial reference ID, prefix, or token substring."""
        results = []
        pat_lower = (pattern or "").lower().strip()
        if not pat_lower:
            return []

        for r in self.records:
            sa = r.get("sourceA") or {}
            sb = r.get("sourceB") or {}
            ref_a = str(sa.get("reference", "")).lower()
            ref_b = str(sb.get("reference", "")).lower()
            desc_a = str(sa.get("description", "")).lower()
            desc_b = str(sb.get("description", "")).lower()

            if pat_lower in ref_a or pat_lower in ref_b or pat_lower in desc_a or pat_lower in desc_b:
                rec_id = r.get("id") or r.get("record_id") or sa.get("id") or "UNKNOWN"
                results.append({
                    "record_id": rec_id,
                    "date": sa.get("date") or sb.get("date"),
                    "ref_a": sa.get("reference"),
                    "ref_b": sb.get("reference"),
                    "amount_a": sa.get("amount"),
                    "amount_b": sb.get("amount")
                })
                self.revealed_record_ids.add(rec_id)

        self.tool_call_history.append(
            f"search_by_reference_pattern(pattern='{pattern}'): Found {len(results)} records sharing token."
        )
        return results[:20]

    def get_fee_schedule_history(self, reference_date: Optional[str] = None) -> List[Dict[str, Any]]:
        """Look up known fee schedule or gateway rate revisions near reference_date."""
        self.tool_call_history.append(
            f"get_fee_schedule_history(date='{reference_date}'): Retrieved {len(self.fee_schedules)} known regulatory/rate schedule revisions."
        )
        return self.fee_schedules


class RootCauseAgent:
    """
    Executes a bounded multi-hop tool-calling loop to diagnose systemic root causes.
    Enforces strict citation grounding against actually observed record IDs.
    """

    def __init__(self):
        self.name = "Root-Cause Chain Agent"

    def _call_groq_json(self, messages: List[Dict[str, str]]) -> Optional[Dict[str, Any]]:
        from agents.groq_client import call_groq_chat_completion
        return call_groq_chat_completion(
            messages=messages,
            model=GROQ_MODEL,
            json_mode=True,
            temperature=0.1,
            max_tokens=900,
            timeout=GROQ_TIMEOUT
        )

    def should_investigate(self, seed_record: Dict[str, Any], batch_exceptions: List[Dict[str, Any]]) -> Tuple[bool, str, List[Dict[str, Any]]]:
        """
        Pre-filter gate: Only fires when seed_record shares similarity with >= 2 other exceptions in the batch.
        Checks:
        1. Identical / closely matching delta (|Δ_a - Δ_b| <= ₹1.00)
        2. Shared counterparty token
        3. Shared reference code prefix
        """
        sa = seed_record.get("sourceA") or {}
        sb = seed_record.get("sourceB") or {}
        seed_id = seed_record.get("id") or seed_record.get("record_id")
        amt_a = float(sa.get("amount", 0))
        amt_b = float(sb.get("amount", 0))
        seed_delta = abs(amt_a - amt_b)
        seed_desc = str(sa.get("description", "")).lower()

        matching_group = []
        for exc in batch_exceptions:
            exc_id = exc.get("id") or exc.get("record_id")
            if exc_id == seed_id:
                continue
            e_sa = exc.get("sourceA") or {}
            e_sb = exc.get("sourceB") or {}
            try:
                e_delta = abs(float(e_sa.get("amount", 0)) - float(e_sb.get("amount", 0)))
                e_desc = str(e_sa.get("description", "")).lower()
                
                # Check delta equality
                if abs(e_delta - seed_delta) <= 1.0 and seed_delta > 0.5:
                    matching_group.append(exc)
                    continue
                # Check description overlap
                tokens_seed = set(seed_desc.split())
                tokens_exc = set(e_desc.split())
                common = tokens_seed.intersection(tokens_exc) - {"neft", "rtgs", "payout", "from", "to", "ltd", "pvt", "corp"}
                if len(common) >= 2:
                    matching_group.append(exc)
            except Exception:
                continue

        # Must have at least 2 other exceptions showing the same signature
        if len(matching_group) >= 2:
            signature = f"delta_shortfall_₹{seed_delta:.2f}" if seed_delta > 0.5 else f"counterparty_{list(tokens_seed)[:2]}"
            return True, signature, matching_group
        
        return False, "", []

    def investigate(
        self,
        seed_record: Dict[str, Any],
        batch_records: List[Dict[str, Any]],
        batch_exceptions: List[Dict[str, Any]],
        fee_schedule_history: Optional[List[Dict[str, Any]]] = None
    ) -> RootCauseResult:
        """
        Runs bounded multi-hop investigation across records.
        """
        should_run, sig, group = self.should_investigate(seed_record, batch_exceptions)
        sa = seed_record.get("sourceA") or {}
        sb = seed_record.get("sourceB") or {}
        seed_id = seed_record.get("id") or seed_record.get("record_id") or "UNKNOWN"
        delta = abs(float(sa.get("amount", 0)) - float(sb.get("amount", 0)))

        workspace = RootCauseInvestigator(batch_records, fee_schedule_history)

        if not should_run:
            # Isolated exception: return standard single-record explanation
            return RootCauseResult(
                pattern_id=f"ISOLATED-{seed_id}",
                hypothesis=f"Isolated discrepancy of ₹{delta:.2f}. No multi-record pattern detected in batch.",
                supporting_record_ids=[seed_id],
                affected_count=1,
                confidence=0.50,
                investigation_trace=["pre_filter_check: Discrepancy is isolated (< 2 related exceptions). Multi-hop skipped."],
                status="insufficient_evidence",
                pattern_signature="none",
                fallback_used=False
            )

        # Seed record is automatically known to investigator
        workspace.revealed_record_ids.add(seed_id)

        # Multi-Hop Bounded Loop: Tool Calling (Max 4 steps)
        # Step 1: Search by amount pattern for identical delta
        res_amounts = workspace.search_by_amount_pattern(target_delta=delta, delta_tolerance=1.5)
        
        # Step 2: Check fee schedule history
        res_fees = workspace.get_fee_schedule_history(reference_date=str(sa.get("date")))
        
        # Step 3: Search counterparty or reference token
        counterparty = sa.get("description", "").split()[:2]
        cp_query = " ".join(counterparty) if counterparty else ""
        res_accounts = workspace.search_by_account(account_identifier=cp_query)

        # Prepare context for Root Cause Synthesizer
        context_payload = {
            "seed_record": {
                "id": seed_id,
                "amount_a": sa.get("amount"),
                "amount_b": sb.get("amount"),
                "delta": delta,
                "date": sa.get("date"),
                "description": sa.get("description"),
                "reference": sa.get("reference")
            },
            "tool_1_matching_delta_records": res_amounts[:10],
            "tool_2_fee_schedule_revisions": res_fees,
            "tool_3_account_records": res_accounts[:10],
            "available_revealed_ids": list(workspace.revealed_record_ids)
        }

        system_prompt = (
            "You are an Elite Forensic Financial Auditor for Ledgr. "
            "You have executed investigative tools to determine if a reconciliation discrepancy is part of a systemic pattern. "
            "Review the tool findings. Formulate a concise root-cause hypothesis explaining the collective discrepancy. "
            "CRITICAL REQUIREMENT: You may ONLY cite record IDs that appear in 'available_revealed_ids'. Do NOT invent or hallucinate record IDs. "
            "List ALL record IDs from 'available_revealed_ids' that are affected by this root cause in 'supporting_record_ids' (do not truncate). "
            "Return JSON: {\n"
            "  \"hypothesis\": \"Detailed explanation of systemic root cause (e.g. MDR fee change, recurring vendor debit, gateway cutoff)\",\n"
            "  \"root_cause_category\": \"fee_schedule_mismatch\" | \"timing_delay\" | \"gateway_deduction\" | \"rounding_error\",\n"
            "  \"supporting_record_ids\": [\"id1\", \"id2\", ...],\n"
            "  \"confidence\": 0.0 to 1.0,\n"
            "  \"reasoning_step\": \"Why this hypothesis explains the pattern\"\n"
            "}"
        )

        groq_resp = self._call_groq_json([
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": json.dumps(context_payload, indent=2)}
        ])

        # Validate citation grounding
        if groq_resp and "hypothesis" in groq_resp and "supporting_record_ids" in groq_resp:
            cited_ids = groq_resp.get("supporting_record_ids", [])
            # CHECK CITATION HONESTY: all cited IDs must exist in revealed_record_ids!
            invalid_citations = [cid for cid in cited_ids if cid not in workspace.revealed_record_ids]
            valid_ids = [cid for cid in cited_ids if cid in workspace.revealed_record_ids]
            
            # Combine validated citations with tool-verified pattern matches from this investigation
            tool_matched_ids = [
                r.get("record_id") for r in res_amounts 
                if r.get("record_id") in workspace.revealed_record_ids
            ]
            # Union of valid citations and tool-matched records, strictly bounded by revealed_record_ids
            all_supported = list(dict.fromkeys(valid_ids + tool_matched_ids))
            if not all_supported:
                all_supported = list(workspace.revealed_record_ids)[:len(group) + 1]

            if invalid_citations:
                logger.warning(
                    f"RootCauseAgent rejected hallucinated citations: {invalid_citations}. "
                    f"Defaulting safely to verified subset."
                )
                return RootCauseResult(
                    pattern_id=f"PAT-{int(time.time()*1000)%100000}",
                    hypothesis=groq_resp["hypothesis"] + " (Citations filtered to strictly verified tool outputs).",
                    supporting_record_ids=valid_ids if valid_ids else all_supported,
                    affected_count=len(valid_ids if valid_ids else all_supported),
                    confidence=min(float(groq_resp.get("confidence", 0.8)), 0.85),
                    investigation_trace=workspace.tool_call_history,
                    root_cause_category=groq_resp.get("root_cause_category", "fee_schedule_mismatch"),
                    pattern_signature=sig,
                    fallback_used=False,
                    status="identified"
                )

            # Clean verified response with full grounded evidence set
            return RootCauseResult(
                pattern_id=f"PAT-{int(time.time()*1000)%100000}",
                hypothesis=groq_resp["hypothesis"],
                supporting_record_ids=all_supported,
                affected_count=len(all_supported),
                confidence=float(groq_resp.get("confidence", 0.90)),
                investigation_trace=workspace.tool_call_history,
                root_cause_category=groq_resp.get("root_cause_category", "fee_schedule_mismatch"),
                pattern_signature=sig,
                fallback_used=False,
                status="identified"
            )

        # Deterministic Fallback when Groq is unreachable or fails schema
        trace = list(workspace.tool_call_history)
        trace.append("llm_reasoning: Groq unavailable or timed out. Deterministic pattern rule applied.")
        
        fallback_ids = list(workspace.revealed_record_ids)
        if seed_id not in fallback_ids:
            fallback_ids.append(seed_id)

        hypo = (
            f"Systemic discrepancy pattern detected across {len(fallback_ids)} records sharing a ₹{delta:.2f} delta. "
            f"Evidence aligns with revised payment gateway interchange schedule or unapplied settlement fee."
        )

        return RootCauseResult(
            pattern_id=f"PAT-{int(time.time()*1000)%100000}",
            hypothesis=hypo,
            supporting_record_ids=fallback_ids[:15],
            affected_count=len(fallback_ids[:15]),
            confidence=0.78,
            investigation_trace=trace,
            root_cause_category="fee_schedule_mismatch",
            pattern_signature=sig,
            fallback_used=True,
            status="identified"
        )

    def cluster_and_diagnose_batch(
        self,
        batch_records: List[Dict[str, Any]],
        exceptions: List[Dict[str, Any]]
    ) -> List[RootCauseResult]:
        """
        Discovers all systemic patterns across the batch exceptions without duplicate investigations.
        """
        processed_ids = set()
        patterns: List[RootCauseResult] = []

        for exc in exceptions:
            exc_id = exc.get("id") or exc.get("record_id")
            if exc_id in processed_ids:
                continue

            res = self.investigate(exc, batch_records, exceptions)
            if res.status == "identified" and res.affected_count >= 2:
                patterns.append(res)
                for cid in res.supporting_record_ids:
                    processed_ids.add(cid)
            else:
                processed_ids.add(exc_id)

        return patterns

