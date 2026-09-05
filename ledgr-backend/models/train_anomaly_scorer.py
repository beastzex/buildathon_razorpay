"""
Anomaly & Risk Scorer Training Pipeline for Ledgr (Part 2)
Combines:
1. Supervised XGBoost classifier (trained on financial fraud & discrepancy patterns)
2. Unsupervised Isolation Forest (detects out-of-distribution, novel anomalies)
3. Cost-sensitive evaluation reporting false-positive operational cost

Outputs:
- models/checkpoints/anomaly_scorer/xgboost_model.json
- models/checkpoints/anomaly_scorer/isolation_forest.joblib
- models/checkpoints/anomaly_scorer/anomaly_metrics.json
"""

import os
import json
import logging
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from typing import Dict, Any, Tuple, List
import numpy as np
import joblib

import xgboost as xgb
from sklearn.ensemble import IsolationForest
from sklearn.model_selection import train_test_split
from sklearn.metrics import precision_score, recall_score, f1_score, confusion_matrix

from models.features import extract_features_matrix, FEATURE_COLUMNS

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("ledgr.train_anomaly")

CHECKPOINT_DIR = Path(__file__).resolve().parent / "checkpoints" / "anomaly_scorer"

# Cost-weight parameters for operational finance reviews (in INR or cost units)
COST_FALSE_POSITIVE = 25.0    # Operational cost of auditor time wasted reviewing legitimate txn
COST_FALSE_NEGATIVE = 200.0   # Severe financial leakage risk of missing genuine discrepancy/fraud


def generate_training_data(n_samples: int = 2500, anomaly_rate: float = 0.08) -> Tuple[np.ndarray, np.ndarray]:
    """
    Synthesize statistical financial distribution grounded in PaySim and ULB fraud datasets:
    - 92% normal transactions (stable amounts, low entropy drift, 0-1 day lag, minimal fee)
    - 8% anomalies (unexplained deltas, irregular hours/entropy, orphaned records, fee spikes)
    """
    np.random.seed(42)
    n_anomalies = int(n_samples * anomaly_rate)
    n_normal = n_samples - n_anomalies

    records_a = []
    records_b = []
    labels = []

    # 1. Normal transactions
    for _ in range(n_normal):
        amt = float(np.random.exponential(scale=20000.0) + 500.0)
        fee = amt * np.random.uniform(0.012, 0.02) if np.random.random() < 0.3 else 0.0
        lag = int(np.random.choice([0, 1, 2], p=[0.7, 0.25, 0.05]))
        
        ra = {
            "amount": amt,
            "date": "2026-09-01",
            "description": "NEFT CR-HDFC0001234-SETTLEMENT"
        }
        rb = {
            "amount": amt - fee,
            "date": f"2026-09-0{1 + lag}",
            "description": "Razorpay payout batch settlement"
        }
        records_a.append(ra)
        records_b.append(rb)
        labels.append(0)

    # 2. Anomalous transactions (fraud, mismatch, high entropy drift)
    for _ in range(n_anomalies):
        anomaly_kind = np.random.choice(["large_discrepancy", "extreme_amount", "lag_spike", "entropy_noise"])
        if anomaly_kind == "large_discrepancy":
            amt = float(np.random.exponential(scale=35000.0) + 2000.0)
            delta = amt * np.random.uniform(0.25, 0.60)
            ra = {"amount": amt, "date": "2026-09-01", "description": "ACH DEBIT SUSPENSE"}
            rb = {"amount": amt - delta, "date": "2026-09-01", "description": "PARTIAL SETTLEMENT UNLINKED"}
        elif anomaly_kind == "extreme_amount":
            amt = float(np.random.uniform(300000.0, 950000.0))
            ra = {"amount": amt, "date": "2026-09-01", "description": "OFF-CYCLE ENTERPRISE WIRE"}
            rb = {"amount": amt, "date": "2026-09-07", "description": "DELAYED WIRE CLEARANCE"}
        elif anomaly_kind == "lag_spike":
            amt = float(np.random.exponential(scale=15000.0) + 1000.0)
            ra = {"amount": amt, "date": "2026-09-01", "description": "STANDARD PAYOUT"}
            rb = {"amount": amt, "date": "2026-09-12", "description": "OVERDUE AGED SETTLEMENT"}
        else:
            amt = float(np.random.exponential(scale=12000.0) + 500.0)
            ra = {"amount": amt, "date": "2026-09-01", "description": "XJ99A-8812-ZZ-CORRUPTED"}
            rb = {"amount": amt, "date": "2026-09-01", "description": "UNKNOWN VENDOR QWERTY998"}

        records_a.append(ra)
        records_b.append(rb)
        labels.append(1)

    X = extract_features_matrix(records_a, records_b)
    y = np.array(labels, dtype=np.int32)
    return X, y


def train_anomaly_models():
    """
    Train supervised XGBoost and unsupervised Isolation Forest.
    Ensemble both and evaluate false-positive cost.
    """
    CHECKPOINT_DIR.mkdir(parents=True, exist_ok=True)
    logger.info("Generating statistical training distribution for anomaly models...")
    X, y = generate_training_data(n_samples=3000, anomaly_rate=0.08)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42, stratify=y
    )

    # 1. Supervised XGBoost Classifier
    logger.info("Training supervised XGBoost anomaly classifier...")
    # Scale positive weight to handle class imbalance (8% positive)
    scale_pos_weight = (len(y_train) - sum(y_train)) / max(sum(y_train), 1)
    
    xgb_model = xgb.XGBClassifier(
        n_estimators=120,
        max_depth=4,
        learning_rate=0.08,
        scale_pos_weight=scale_pos_weight,
        eval_metric="logloss",
        random_state=42
    )
    xgb_model.fit(X_train, y_train)

    # 2. Unsupervised Isolation Forest
    logger.info("Training unsupervised Isolation Forest...")
    iso_forest = IsolationForest(
        n_estimators=120,
        contamination=0.08,
        random_state=42,
        n_jobs=-1
    )
    iso_forest.fit(X_train)

    # Predictions & Ensembling
    xgb_probs = xgb_model.predict_proba(X_test)[:, 1]
    
    # Isolation forest decision function: lower means more anomalous -> normalize to 0..1
    iso_scores_raw = -iso_forest.decision_function(X_test)
    iso_scores = (iso_scores_raw - iso_scores_raw.min()) / (iso_scores_raw.max() - iso_scores_raw.min() + 1e-9)

    # Weighted ensemble
    ensemble_scores = (0.65 * xgb_probs) + (0.35 * iso_scores)
    ensemble_preds = (ensemble_scores >= 0.50).astype(int)

    # Metrics
    prec = precision_score(y_test, ensemble_preds)
    rec = recall_score(y_test, ensemble_preds)
    f1 = f1_score(y_test, ensemble_preds)
    cm = confusion_matrix(y_test, ensemble_preds)
    tn, fp, fn, tp = cm.ravel()
    fpr = fp / (fp + tn)

    # False Positive Cost Evaluation
    total_cost = (fp * COST_FALSE_POSITIVE) + (fn * COST_FALSE_NEGATIVE)
    baseline_unreviewed_cost = sum(y_test) * COST_FALSE_NEGATIVE
    net_savings = baseline_unreviewed_cost - total_cost

    metrics = {
        "precision": round(float(prec), 4),
        "recall": round(float(rec), 4),
        "f1_score": round(float(f1), 4),
        "false_positive_rate": round(float(fpr), 4),
        "confusion_matrix": {
            "true_negatives": int(tn),
            "false_positives": int(fp),
            "false_negatives": int(fn),
            "true_positives": int(tp)
        },
        "financial_cost_analysis": {
            "false_positive_count": int(fp),
            "unit_fp_cost_inr": COST_FALSE_POSITIVE,
            "false_positive_total_cost_inr": round(float(fp * COST_FALSE_POSITIVE), 2),
            "false_negative_count": int(fn),
            "unit_fn_cost_inr": COST_FALSE_NEGATIVE,
            "false_negative_total_cost_inr": round(float(fn * COST_FALSE_NEGATIVE), 2),
            "total_operational_risk_cost_inr": round(float(total_cost), 2),
            "baseline_unreviewed_cost_inr": round(float(baseline_unreviewed_cost), 2),
            "net_operational_savings_inr": round(float(net_savings), 2)
        }
    }

    logger.info(f"Anomaly Scorer Metrics: Precision={prec:.4f}, Recall={rec:.4f}, F1={f1:.4f}, FPR={fpr:.4f}")
    logger.info(f"False Positive Review Cost: ₹{fp * COST_FALSE_POSITIVE:.2f} | Net Savings: ₹{net_savings:.2f}")

    # Save artifacts
    xgb_model.save_model(str(CHECKPOINT_DIR / "xgboost_model.json"))
    joblib.dump(iso_forest, str(CHECKPOINT_DIR / "isolation_forest.joblib"))
    with open(CHECKPOINT_DIR / "anomaly_metrics.json", "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)

    logger.info(f"Saved anomaly models and metrics to {CHECKPOINT_DIR}")
    return metrics


class AnomalyScorer:
    """Production inference wrapper for anomaly detection ensemble."""
    def __init__(self):
        self.xgb_model = None
        self.iso_forest = None
        self._load_models()

    def _load_models(self):
        xgb_path = CHECKPOINT_DIR / "xgboost_model.json"
        iso_path = CHECKPOINT_DIR / "isolation_forest.joblib"
        if xgb_path.exists() and iso_path.exists():
            self.xgb_model = xgb.XGBClassifier()
            self.xgb_model.load_model(str(xgb_path))
            self.iso_forest = joblib.load(str(iso_path))
        else:
            logger.info("Anomaly models not found on disk. Running training pipeline...")
            train_anomaly_models()
            self._load_models()

    def score_pair(self, record_a: Dict[str, Any], record_b: Dict[str, Any]) -> float:
        """Returns ensemble anomaly risk score between 0.0 and 1.0."""
        X = extract_features_matrix([record_a], [record_b])
        p_xgb = float(self.xgb_model.predict_proba(X)[0, 1])
        raw_iso = -float(self.iso_forest.decision_function(X)[0])
        p_iso = 1.0 / (1.0 + np.exp(-raw_iso * 5.0))  # Sigmoid normalization
        score = (0.65 * p_xgb) + (0.35 * p_iso)
        return round(float(np.clip(score, 0.0, 1.0)), 4)


_anomaly_scorer_instance = None

def get_anomaly_scorer() -> AnomalyScorer:
    global _anomaly_scorer_instance
    if _anomaly_scorer_instance is None:
        _anomaly_scorer_instance = AnomalyScorer()
    return _anomaly_scorer_instance


if __name__ == "__main__":
    train_anomaly_models()
