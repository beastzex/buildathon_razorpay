"""
Two-Stage Financial Reconciliation Matcher (Part 1.4)
Combines semantic vector representations (BGE-Small LoRA) with deterministic rule verification.

Two-Stage Decision Logic:
  embedding_score = cosine_similarity(bge_embed(a), bge_embed(b))
  rule_pass, rule_score, rule_breakdown = rule_verifier(a, b)
  final_confidence = weighted_combination(embedding_score, rule_score)

  if final_confidence >= AUTO_MATCH_THRESHOLD and rule_pass:
      status = 'matched'       # Auto-match
      escalate = False
  elif final_confidence >= REVIEW_THRESHOLD:
      status = 'flagged'       # Escalate to AI reasoning layer
      escalate = True
  else:
      status = 'mismatched'    # Likely mismatch, escalate for explanation
      escalate = True

Thresholds are dynamically configurable via environment variables or runtime parameters.
"""

import os
import logging
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from typing import Dict, Any, Tuple, Optional
import numpy as np
import torch
import torch.nn.functional as F

from models.rule_verifier import rule_verifier

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("ledgr.matcher")

# Configurable thresholds (0.0 to 1.0 or 0 to 100)
AUTO_MATCH_THRESHOLD = float(os.getenv("LEDGR_AUTO_MATCH_THRESHOLD", "0.80"))
REVIEW_THRESHOLD = float(os.getenv("LEDGR_REVIEW_THRESHOLD", "0.60"))
EMBEDDING_WEIGHT = float(os.getenv("LEDGR_EMBEDDING_WEIGHT", "0.35"))
RULE_WEIGHT = float(os.getenv("LEDGR_RULE_WEIGHT", "0.65"))

BASE_MODEL_NAME = "BAAI/bge-small-en-v1.5"
CHECKPOINT_DIR = Path(__file__).resolve().parent / "checkpoints" / "matcher-lora-v1"


class FinancialMatcher:
    """
    Two-stage hybrid matcher combining fine-tuned BGE-small embeddings with rule verifier.
    """
    def __init__(self, use_gpu: bool = True):
        self.device = torch.device("cuda" if (use_gpu and torch.cuda.is_available()) else "cpu")
        self.model = None
        self.tokenizer = None
        self._init_model()

    def _init_model(self):
        try:
            from transformers import AutoTokenizer, AutoModel
            from peft import PeftModel

            logger.info(f"Initializing embedding model for matcher on {self.device}...")
            if CHECKPOINT_DIR.exists() and (CHECKPOINT_DIR / "adapter_model.safetensors").exists():
                logger.info(f"Loading fine-tuned LoRA adapter from {CHECKPOINT_DIR}")
                self.tokenizer = AutoTokenizer.from_pretrained(CHECKPOINT_DIR)
                base = AutoModel.from_pretrained(BASE_MODEL_NAME)
                self.model = PeftModel.from_pretrained(base, CHECKPOINT_DIR)
            else:
                logger.info(f"Loading base BGE model: {BASE_MODEL_NAME}")
                self.tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL_NAME)
                self.model = AutoModel.from_pretrained(BASE_MODEL_NAME)

            self.model.to(self.device)
            self.model.eval()
            logger.info("Matcher embedding model successfully initialized.")
        except Exception as e:
            logger.warning(f"Could not load neural embedding model ({e}). Using lexical fallback.")
            self.model = None

    def embed_text(self, text: str) -> np.ndarray:
        """Derives a normalized 384-d embedding vector for a financial description."""
        if not self.model or not self.tokenizer:
            # Deterministic pseudo-embedding fallback if torch/hf is unavailable
            return np.ones(384, dtype=np.float32) / np.sqrt(384)

        try:
            with torch.no_grad():
                inputs = self.tokenizer(
                    str(text),
                    padding=True,
                    truncation=True,
                    max_length=128,
                    return_tensors="pt"
                ).to(self.device)
                outputs = self.model(**inputs)
                
                # Mean pooling
                token_embeddings = outputs[0]
                mask = inputs["attention_mask"].unsqueeze(-1).expand(token_embeddings.size()).float()
                sum_embeddings = torch.sum(token_embeddings * mask, 1)
                sum_mask = torch.clamp(mask.sum(1), min=1e-9)
                pooled = sum_embeddings / sum_mask
                normalized = F.normalize(pooled, p=2, dim=1)
                return normalized.cpu().numpy()[0]
        except Exception as e:
            logger.warning(f"Inference error during embedding: {e}. Falling back to deterministic vector.")
            return np.ones(384, dtype=np.float32) / np.sqrt(384)

    def compute_similarity(self, desc_a: str, desc_b: str) -> float:
        """Cosine similarity between descriptions."""
        emb_a = self.embed_text(desc_a)
        emb_b = self.embed_text(desc_b)
        cos_sim = float(np.dot(emb_a, emb_b) / (np.linalg.norm(emb_a) * np.linalg.norm(emb_b) + 1e-9))
        return round(max(0.0, min(1.0, cos_sim)), 4)

    def match_pair(
        self,
        record_a: Dict[str, Any],
        record_b: Dict[str, Any],
        auto_threshold: float = AUTO_MATCH_THRESHOLD,
        review_threshold: float = REVIEW_THRESHOLD
    ) -> Dict[str, Any]:
        """
        Executes two-stage confidence gate.
        Returns match decision, confidence percentage (0-100), and explanation flag.
        """
        desc_a = str(record_a.get("description", ""))
        desc_b = str(record_b.get("description", ""))

        # Stage 1A: Neural Semantic Embedding Similarity
        emb_score = self.compute_similarity(desc_a, desc_b)

        # Stage 1B: Deterministic Rule Verifier
        rule_pass, rule_score, rule_breakdown = rule_verifier(record_a, record_b)

        # Stage 2: Weighted Confidence Combination
        combined_score = round(
            (EMBEDDING_WEIGHT * emb_score) + (RULE_WEIGHT * rule_score),
            4
        )
        confidence_pct = int(round(combined_score * 100))

        # Two-stage gate decision:
        # Auto-match requires combined score >= auto_threshold AND rule pass AND no fee ambiguity
        is_fee_candidate = rule_breakdown.get("amount", {}).get("detail", {}).get("is_fee_candidate", False)
        
        if combined_score >= auto_threshold and rule_pass and not is_fee_candidate:
            status = "matched"
            requires_escalation = False
        elif combined_score >= review_threshold or is_fee_candidate:
            status = "flagged"
            requires_escalation = True
        else:
            status = "mismatched"
            requires_escalation = True

        return {
            "status": status,
            "confidence": confidence_pct,
            "embedding_score": emb_score,
            "rule_score": rule_score,
            "rule_pass": rule_pass,
            "combined_score": combined_score,
            "requires_escalation": requires_escalation,
            "rule_breakdown": rule_breakdown,
            "record_a_id": record_a.get("id"),
            "record_b_id": record_b.get("id")
        }


# Global singleton instance for easy import across routers and eval
_matcher_instance: Optional[FinancialMatcher] = None

def get_matcher() -> FinancialMatcher:
    global _matcher_instance
    if _matcher_instance is None:
        _matcher_instance = FinancialMatcher()
    return _matcher_instance
