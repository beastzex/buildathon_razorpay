"""
Night-Shift Digest Notification Dispatcher (Tier 2B)
Formats concise, scannable summaries and dispatches via webhook/email/log.
"""

import os
import json
import logging
from typing import Dict, Any, Optional
import urllib.request

logger = logging.getLogger("ledgr.notifications")

SLACK_WEBHOOK_URL = os.getenv("SLACK_WEBHOOK_URL", "").strip()


def format_digest_text(digest_data: Dict[str, Any], dashboard_url: str = "http://localhost:3000/dashboard") -> str:
    batch_id = digest_data.get("batch_id", "Unknown")
    total = digest_data.get("total_records", 0)
    matched = digest_data.get("auto_matched", 0)
    debated = digest_data.get("debated_and_resolved", 0)
    escalated = digest_data.get("escalated_to_human", 0)
    
    text = (
        f"🌙 *Ledgr Night-Shift Autonomous Report: Batch #{batch_id}*\n"
        f"• Total Processed: {total} records\n"
        f"• Auto-Matched: {matched}/{total} ({(matched/total*100):.1f}%)\n"
        f"• Resolved via AI Debate: {debated}\n"
        f"• Escalated for Human Review: {escalated}\n"
        f"• Status: {'All clear! Zero manual action required.' if escalated == 0 else f'{escalated} discrepancies need controller attention.'}\n"
        f"👉 Review details: {dashboard_url}/exceptions"
    )
    return text


def send_digest_notification(digest_data: Dict[str, Any]) -> bool:
    """Dispatches night-shift digest to configured webhook or stdout logger."""
    text = format_digest_text(digest_data)
    logger.info(f"\n--- [NIGHT-SHIFT DIGEST DISPATCHED] ---\n{text}\n--------------------------------------")

    if SLACK_WEBHOOK_URL and SLACK_WEBHOOK_URL.startswith("http"):
        try:
            payload = json.dumps({"text": text}).encode("utf-8")
            req = urllib.request.Request(
                SLACK_WEBHOOK_URL,
                data=payload,
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=5) as response:
                return response.status == 200
        except Exception as e:
            logger.warning(f"Failed to post to webhook {SLACK_WEBHOOK_URL}: {e}")
            return False

    return True
