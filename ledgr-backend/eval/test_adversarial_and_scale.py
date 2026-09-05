"""
Adversarial Stress Testing & Scale Benchmark Suite for Ledgr (Part 2.3)
Evaluates:
1. Randomized Synthetic Batch (Seed 999 != 42, 500 records, 10% mismatch rate)
2. Malformed / Corrupted Input Batch (Broken dates, negative amounts, nulls, injection strings)
3. Adversarial Near-Duplicates (Identical amounts & dates, distinct counterparties & references)
4. Scale & Load Test (2,000+ records processed end-to-end with p95/p99 latency)
"""

import time
import math
import json
import random
import statistics
from datetime import datetime, timedelta
from typing import List, Dict, Any, Tuple
import numpy as np
import pytest

from models.rule_verifier import rule_verifier
from models.features import extract_features_single
from models.matcher import get_matcher


# ============================================================================
# 1. Randomized Synthetic Batch (Seed 999 != 42, 500 records)
# ============================================================================

def generate_randomized_batch(count: int = 500, seed: int = 999, mismatch_ratio: float = 0.10):
    """Generates 500 records with a previously unseen seed and diverse transaction patterns."""
    rng = random.Random(seed)
    start_date = datetime(2026, 9, 1)
    
    bank_prefixes = ["BNK-YES-", "BNK-IDBI-", "BNK-PNB-", "BNK-CANARA-", "BNK-BOB-"]
    gateway_prefixes = ["GW-RZP-X-", "PO-RZP-PAY-", "SETTLE-RZP-"]
    categories = ["Logistics", "Cloud Services", "Healthcare", "EdTech", "FinTech", "Retail"]

    records = []
    
    mismatches_target = int(count * mismatch_ratio)
    flagged_target = int(count * 0.15)
    matched_target = count - mismatches_target - flagged_target

    statuses = ["matched"] * matched_target + ["flagged"] * flagged_target + ["mismatched"] * mismatches_target
    rng.shuffle(statuses)

    for i, target_status in enumerate(statuses):
        rec_id = f"TXN-RND-{i+1:04d}"
        amount = round(rng.uniform(1000, 150000), 2)
        day_offset = rng.randint(0, 20)
        dt = start_date + timedelta(days=day_offset)
        date_str = dt.strftime("%Y-%m-%d")
        cat = rng.choice(categories)
        ref_num = rng.randint(100000, 999999)

        if target_status == "matched":
            sa = {
                "id": f"{rng.choice(bank_prefixes)}{1000+i}",
                "amount": amount,
                "date": date_str,
                "description": f"NEFT CR-REF{ref_num}-{cat.upper()} SETTLEMENT",
                "reference": f"REF-{ref_num}"
            }
            sb = {
                "id": f"{rng.choice(gateway_prefixes)}{2000+i}",
                "amount": amount,
                "date": date_str,
                "description": f"Razorpay payout {cat} auto-sweep",
                "reference": f"PO-{ref_num}"
            }
        elif target_status == "flagged":
            fee_pct = rng.uniform(0.1, 1.8)
            fee = round(amount * (fee_pct / 100.0), 2)
            gateway_amount = max(round(amount - fee, 2), 10.0)
            lag = rng.choice([1, 2])
            gw_dt = dt + timedelta(days=lag)
            sa = {
                "id": f"{rng.choice(bank_prefixes)}{1000+i}",
                "amount": amount,
                "date": date_str,
                "description": f"IMPS INWARD-REF{ref_num}-{cat.upper()}",
                "reference": f"REF-{ref_num}"
            }
            sb = {
                "id": f"{rng.choice(gateway_prefixes)}{2000+i}",
                "amount": gateway_amount,
                "date": gw_dt.strftime("%Y-%m-%d"),
                "description": f"Razorpay {cat} net of MDR fees",
                "reference": f"PO-{ref_num}"
            }
        else:  # Mismatched
            discrepancy = round(rng.uniform(500, 8000), 2)
            gateway_amount = max(round(amount - discrepancy, 2), 10.0)
            sa = {
                "id": f"{rng.choice(bank_prefixes)}{1000+i}",
                "amount": amount,
                "date": date_str,
                "description": f"RTGS CR-REF{ref_num}-VENDOR TRANSFER",
                "reference": f"REF-{ref_num}"
            }
            sb = {
                "id": f"{rng.choice(gateway_prefixes)}{2000+i}",
                "amount": gateway_amount,
                "date": date_str,
                "description": f"Disputed payout batch {cat}",
                "reference": f"PO-{ref_num+rng.randint(100, 999)}"
            }

        records.append({
            "id": rec_id,
            "target_status": target_status,
            "sourceA": sa,
            "sourceB": sb
        })

    return records


# ============================================================================
# 2. Corrupted / Malformed Input Batch (100 records)
# ============================================================================

def generate_malformed_batch() -> List[Dict[str, Any]]:
    """Deliberately corrupted, invalid, and adversarial inputs to stress-test stability."""
    corrupted_cases = [
        # Broken dates
        {"amount_a": 5000.0, "amount_b": 5000.0, "date_a": "31/02/2026", "date_b": "2026-09-01", "ref_a": "REF-1", "ref_b": "REF-1"},
        {"amount_a": 12000.0, "amount_b": 12000.0, "date_a": "NOT_A_DATE", "date_b": "2026-99-99", "ref_a": "REF-2", "ref_b": "REF-2"},
        {"amount_a": 8500.0, "amount_b": 8500.0, "date_a": "", "date_b": None, "ref_a": "REF-3", "ref_b": "REF-3"},
        
        # Negative / Zero amounts
        {"amount_a": -5000.0, "amount_b": -5000.0, "date_a": "2026-09-01", "date_b": "2026-09-01", "ref_a": "REF-4", "ref_b": "REF-4"},
        {"amount_a": 0.0, "amount_b": 0.0, "date_a": "2026-09-01", "date_b": "2026-09-01", "ref_a": "REF-5", "ref_b": "REF-5"},
        {"amount_a": None, "amount_b": 10000.0, "date_a": "2026-09-01", "date_b": "2026-09-01", "ref_a": "REF-6", "ref_b": "REF-6"},
        {"amount_a": "ten thousand", "amount_b": 10000.0, "date_a": "2026-09-01", "date_b": "2026-09-01", "ref_a": "REF-7", "ref_b": "REF-7"},

        # Extreme values / Overflow
        {"amount_a": 1e12, "amount_b": 1e12, "date_a": "2026-09-01", "date_b": "2026-09-01", "ref_a": "REF-8", "ref_b": "REF-8"},
        {"amount_a": 0.00001, "amount_b": 0.00002, "date_a": "2026-09-01", "date_b": "2026-09-01", "ref_a": "REF-9", "ref_b": "REF-9"},

        # Adversarial injection strings
        {"amount_a": 25000.0, "amount_b": 25000.0, "date_a": "2026-09-01", "date_b": "2026-09-01", "ref_a": "<script>alert(1)</script>", "ref_b": "'; DROP TABLE matches;--"},
        {"amount_a": 34000.0, "amount_b": 34000.0, "date_a": "2026-09-01", "date_b": "2026-09-01", "ref_a": "A" * 5000, "ref_b": "B" * 5000},
        {"amount_a": 45000.0, "amount_b": 45000.0, "date_a": "2026-09-01", "date_b": "2026-09-01", "ref_a": "\x00\x01\x02\xff\xfe", "ref_b": "NULL"}
    ]

    # Replicate up to 100 records
    out = []
    for i in range(100):
        tmpl = corrupted_cases[i % len(corrupted_cases)]
        out.append({
            "id": f"TXN-CORRUPT-{i+1:03d}",
            "sourceA": {
                "id": f"BNK-CORRUPT-{i+1}",
                "amount": tmpl["amount_a"],
                "date": tmpl["date_a"],
                "description": f"Corrupted description {tmpl['ref_a']}",
                "reference": tmpl["ref_a"]
            },
            "sourceB": {
                "id": f"GW-CORRUPT-{i+1}",
                "amount": tmpl["amount_b"],
                "date": tmpl["date_b"],
                "description": f"Corrupted gateway record {tmpl['ref_b']}",
                "reference": tmpl["ref_b"]
            }
        })
    return out


# ============================================================================
# 3. Adversarial Near-Duplicates (100 pairs designed to test collision avoidance)
# ============================================================================

def generate_adversarial_near_duplicates() -> List[Dict[str, Any]]:
    """
    Pairs of genuinely DIFFERENT transactions that are deliberately designed to look similar:
    - Same round amount (e.g. ₹50,000.00)
    - Same transaction date (2026-09-01)
    - But DIFFERENT counterparties and UNRELATED reference codes.
    Tests whether the confidence gate discriminates rather than superficially pattern matching.
    """
    counterparties_a = ["Apollo Hospitals", "Infosys Ltd", "Zomato Media", "Swiggy Bundl", "Reliance Retail"]
    counterparties_b = ["Bharat Petroleum", "Tata Motors", "Flipkart Internet", "Nykaa E-Retail", "Paytm Payments"]

    pairs = []
    for i in range(100):
        amount = 50000.0  # Identical collision amount
        date_str = "2026-09-01"
        cp_a = counterparties_a[i % len(counterparties_a)]
        cp_b = counterparties_b[i % len(counterparties_b)]
        ref_a = f"REF-A-ALPHA-{1000 + i}"
        ref_b = f"REF-B-BETA-{9000 + i}"

        pairs.append({
            "id": f"TXN-NEAR-DUP-{i+1:03d}",
            "sourceA": {
                "id": f"BNK-DUP-{1000+i}",
                "amount": amount,
                "date": date_str,
                "description": f"NEFT transfer from {cp_a}",
                "reference": ref_a
            },
            "sourceB": {
                "id": f"GW-DUP-{2000+i}",
                "amount": amount,
                "date": date_str,
                "description": f"Razorpay payout to {cp_b}",
                "reference": ref_b
            },
            "ground_truth_match": False  # These are GSL (Genuinely Separate Ledgers)
        })
    return pairs


# ============================================================================
# PyTest Adversarial & Scale Test Suite
# ============================================================================

class TestAdversarialAndScale:
    """Rigorous execution of random 500 batch, corrupted data, near-duplicates, and 2000+ scale."""

    @pytest.fixture(scope="class")
    def matcher(self):
        return get_matcher()

    def test_randomized_synthetic_batch_500(self, matcher):
        """Processes 500 records with Seed 999 and validates classification accuracy."""
        batch = generate_randomized_batch(count=500, seed=999, mismatch_ratio=0.10)
        assert len(batch) == 500

        correct = 0
        total = len(batch)

        for rec in batch:
            sa = rec["sourceA"]
            sb = rec["sourceB"]
            target = rec["target_status"]

            rule_pass, rule_score, _ = rule_verifier(sa, sb)
            emb_sim = matcher.compute_similarity(
                f"{sa['description']} {sa['reference']}",
                f"{sb['description']} {sb['reference']}"
            )

            final_conf = int(round((0.60 * rule_score + 0.40 * emb_sim) * 100))

            if final_conf >= 80 and rule_pass:
                predicted = "matched"
            elif final_conf >= 60:
                predicted = "flagged"
            else:
                predicted = "mismatched"

            if predicted == target:
                correct += 1

        accuracy = (correct / total) * 100.0
        print(f"\n[Seed 999 500-Batch] Accuracy: {accuracy:.2f}% ({correct}/{total})")
        assert accuracy >= 85.0, f"Expected >=85% accuracy on unseen synthetic seed, got {accuracy:.2f}%"

    def test_corrupted_malformed_input_batch(self, matcher):
        """Ensures the system does not crash on corrupted data and flags all invalid inputs."""
        corrupted_batch = generate_malformed_batch()
        assert len(corrupted_batch) == 100

        crashed = 0
        auto_matched_improperly = 0

        for rec in corrupted_batch:
            sa = rec["sourceA"]
            sb = rec["sourceB"]

            try:
                rule_pass, rule_score, _ = rule_verifier(sa, sb)
                emb_sim = matcher.compute_similarity(str(sa.get("description", "")), str(sb.get("description", "")))
                feats = extract_features_single(sa, sb)
                final_conf = int(round((0.60 * rule_score + 0.40 * emb_sim) * 100))

                # Adversarial inputs MUST NOT pass as clean auto-matches (>=80% with rule_pass)
                if rule_pass and final_conf >= 80:
                    auto_matched_improperly += 1

            except Exception as e:
                crashed += 1
                print(f"Crash on record {rec['id']}: {e}")

        assert crashed == 0, f"System crashed on {crashed} corrupted records"
        assert auto_matched_improperly == 0, f"{auto_matched_improperly} corrupted records were improperly auto-matched!"
        print(f"\n[Corrupted Batch 100] Crashed: 0/100, Improper Auto-Matches: 0/100 (100% safely intercepted)")

    def test_adversarial_near_duplicates_discrimination(self, matcher):
        """Verifies near-duplicates (same amount & date, different parties) are NOT auto-matched."""
        near_dups = generate_adversarial_near_duplicates()
        assert len(near_dups) == 100

        false_positive_auto_matches = 0
        correctly_rejected_or_flagged = 0

        for rec in near_dups:
            sa = rec["sourceA"]
            sb = rec["sourceB"]

            rule_pass, rule_score, detail = rule_verifier(sa, sb)
            emb_sim = matcher.compute_similarity(
                f"{sa['description']} {sa['reference']}",
                f"{sb['description']} {sb['reference']}"
            )

            final_conf = int(round((0.60 * rule_score + 0.40 * emb_sim) * 100))

            # Auto-match occurs if confidence >= 80% AND rule_pass is True
            # Since counterparties are completely unrelated, reference rule should penalize this!
            if final_conf >= 80 and rule_pass:
                false_positive_auto_matches += 1
            else:
                correctly_rejected_or_flagged += 1

        rejection_rate = (correctly_rejected_or_flagged / len(near_dups)) * 100.0
        print(f"\n[Adversarial Near-Duplicates 100] Correctly Intercepted: {rejection_rate:.1f}% ({correctly_rejected_or_flagged}/100)")
        # Must intercept at least 95% of near-duplicate collisions
        assert rejection_rate >= 95.0, f"Near duplicate rejection rate too low: {rejection_rate:.1f}%"

    def test_scale_benchmark_2000_records(self, matcher):
        """Processes 2,000+ records end-to-end and measures throughput, p95, and p99 latency."""
        print("\n[Scale Benchmark] Generating 2,000 records...")
        batch = generate_randomized_batch(count=2000, seed=777, mismatch_ratio=0.10)
        assert len(batch) == 2000

        latencies_ms = []
        start_wall = time.perf_counter()

        for rec in batch:
            t0 = time.perf_counter()
            sa = rec["sourceA"]
            sb = rec["sourceB"]

            rule_pass, rule_score, _ = rule_verifier(sa, sb)
            emb_sim = matcher.compute_similarity(sa["description"], sb["description"])
            feats = extract_features_single(sa, sb)
            final_conf = int(round((0.60 * rule_score + 0.40 * emb_sim) * 100))

            elapsed = (time.perf_counter() - t0) * 1000.0
            latencies_ms.append(elapsed)

        total_wall_s = time.perf_counter() - start_wall
        throughput = len(batch) / total_wall_s

        p50 = statistics.median(latencies_ms)
        p95 = np.percentile(latencies_ms, 95)
        p99 = np.percentile(latencies_ms, 99)
        avg_ms = statistics.mean(latencies_ms)

        print(f"[Scale Benchmark Summary (2,000 records)]")
        print(f"  Total Wall-Clock Time: {total_wall_s:.2f}s")
        print(f"  Throughput:            {throughput:.1f} records/sec")
        print(f"  Average Latency:       {avg_ms:.2f}ms / record")
        print(f"  p50 Latency:           {p50:.2f}ms / record")
        print(f"  p95 Latency:           {p95:.2f}ms / record")
        print(f"  p99 Latency:           {p99:.2f}ms / record")

        # Performance SLA assertions
        assert throughput >= 40.0, f"Throughput below SLA: {throughput:.1f} rec/s"
        assert p99 < 100.0, f"p99 latency exceeded 100ms: {p99:.2f}ms"
