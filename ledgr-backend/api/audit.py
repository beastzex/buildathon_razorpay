"""
Hash-Chained Audit Logging & Cryptographic Verification (Part 4.4)
Ensures tamper-evident compliance logging for every financial controller event.

Chain Rule:
  hash_i = SHA256(prev_hash_{i-1} + canonical_json(payload_i))
  where genesis prev_hash = "0" * 64
"""

import json
import hashlib
from typing import Dict, Any, List, Tuple, Optional


GENESIS_HASH = "0" * 64


def canonical_json(data: Any) -> str:
    """Produces canonical deterministic JSON string with sorted keys and minimal whitespace."""
    return json.dumps(data, sort_keys=True, separators=(',', ':'), default=str)


def compute_entry_hash(prev_hash: str, payload: Dict[str, Any]) -> str:
    """Computes SHA-256 hash chaining the previous hash with the canonical payload."""
    payload_str = canonical_json(payload)
    hasher = hashlib.sha256()
    hasher.update((prev_hash + payload_str).encode("utf-8"))
    return hasher.hexdigest()


def verify_chain_integrity(entries: List[Dict[str, Any]]) -> Tuple[bool, Optional[str], int]:
    """
    Verifies that no entry in the audit chain has been altered or deleted.
    Returns: (is_valid: bool, error_message: Optional[str], verified_count: int)
    """
    if not entries:
        return True, None, 0

    expected_prev = GENESIS_HASH

    for idx, entry in enumerate(entries):
        current_prev = entry.get("prev_hash")
        current_hash = entry.get("hash")
        payload = entry.get("payload", {})

        # Check prev_hash linkage
        if current_prev != expected_prev:
            err = (
                f"Broken link at entry #{idx} (ID: {entry.get('id')}): "
                f"prev_hash '{current_prev}' does not match expected '{expected_prev}'"
            )
            return False, err, idx

        # Recompute hash
        recomputed = compute_entry_hash(expected_prev, payload)
        if recomputed != current_hash:
            err = (
                f"Tampered content at entry #{idx} (ID: {entry.get('id')}): "
                f"stored hash '{current_hash}' != recomputed hash '{recomputed}'"
            )
            return False, err, idx

        expected_prev = current_hash

    return True, None, len(entries)
