"""
Unified Groq Client Utility with Rate-Limit Circuit Breaker
Protects the Ledgr reconciliation pipeline against 429 TPD exhaustion,
prevents blocking retry sleeps, and ensures instant failover to
deterministic institutional fallback reasoning.
"""

import os
import time
import json
import logging
from typing import Optional, Dict, Any, List

logger = logging.getLogger("ledgr.groq")

# Global circuit breaker state
_CIRCUIT_BREAKER_UNTIL: float = 0.0
_LAST_CIRCUIT_LOG: float = 0.0
DEFAULT_COOLDOWN_SECONDS: float = 180.0  # 3 minutes

GROQ_DEFAULT_MODEL = os.getenv("LEDGR_GROQ_MODEL", "openai/gpt-oss-120b")
GROQ_DEFAULT_TIMEOUT = float(os.getenv("LEDGR_GROQ_TIMEOUT", "8.0"))


def is_groq_circuit_open() -> bool:
    """Returns True if the circuit breaker is currently active (cooling down)."""
    return time.time() < _CIRCUIT_BREAKER_UNTIL


def trip_circuit_breaker(error_msg: str, cooldown_seconds: float = DEFAULT_COOLDOWN_SECONDS):
    """Activates the circuit breaker after a 429 rate limit or quota exhaustion."""
    global _CIRCUIT_BREAKER_UNTIL, _LAST_CIRCUIT_LOG
    now = time.time()
    _CIRCUIT_BREAKER_UNTIL = now + cooldown_seconds
    
    # Only log once per minute to avoid spamming logs
    if now - _LAST_CIRCUIT_LOG > 60:
        _LAST_CIRCUIT_LOG = now
        logger.warning(
            f"Groq API rate limit reached (TPD/RPM exceeded). "
            f"Circuit breaker active for {int(cooldown_seconds)}s — "
            f"pipeline instantly using verified institutional fallbacks."
        )


def get_groq_client(timeout: Optional[float] = None):
    """
    Returns an initialized Groq client with max_retries=0 if available,
    or None if the API key is missing or the circuit breaker is open.
    """
    if is_groq_circuit_open():
        return None

    api_key = os.getenv("GROQ_API_KEY", "").strip()
    if not api_key or api_key in ("your_groq_api_key_here", "mock_key_for_ci_skip"):
        return None

    try:
        from groq import Groq
        t = timeout if timeout is not None else GROQ_DEFAULT_TIMEOUT
        # Critical: max_retries=0 avoids 5-10s exponential backoff sleeps on 429s
        return Groq(api_key=api_key, timeout=t, max_retries=0)
    except Exception as e:
        logger.warning(f"Could not initialize Groq client: {e}")
        return None


def call_groq_chat_completion(
    messages: List[Dict[str, str]],
    model: Optional[str] = None,
    json_mode: bool = True,
    temperature: float = 0.1,
    max_tokens: int = 1000,
    timeout: Optional[float] = None
) -> Optional[Dict[str, Any]]:
    """
    Executes a chat completion call with circuit-breaker protection.
    Returns parsed JSON dict if json_mode=True, or raw response dict with 'content'.
    Returns None if Groq is unavailable, rate-limited, or fails.
    """
    client = get_groq_client(timeout=timeout)
    if not client:
        return None

    use_model = model or os.getenv("LEDGR_GROQ_MODEL", GROQ_DEFAULT_MODEL)

    kwargs: Dict[str, Any] = {
        "model": use_model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }
    if json_mode:
        kwargs["response_format"] = {"type": "json_object"}

    try:
        resp = client.chat.completions.create(**kwargs)
        raw_text = resp.choices[0].message.content or "{}"
        if json_mode:
            return json.loads(raw_text)
        return {"content": raw_text}
    except Exception as e:
        err_str = str(e)
        if "429" in err_str or "rate_limit" in err_str.lower() or "too many requests" in err_str.lower():
            trip_circuit_breaker(err_str)
        else:
            logger.warning(f"Groq API call failed: {e}")
        return None
