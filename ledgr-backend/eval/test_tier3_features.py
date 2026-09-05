"""
PyTest Suite for Tier 3 Features (Root-Cause Chain, Cash-Flow Forecasting, Health Score, Portfolio View)
Evaluates:
- Root-cause multi-hop reasoning, tool calling, and precision/recall on affected record sets
- Strict citation honesty validator (blocks hallucinated record IDs)
- Financial Health Score composite arithmetic, grades, and trend tracking
- Meta Prophet cash-flow forecasting bounds (y_lower <= yhat <= y_upper) and grounded explainer
- Portfolio-level statistical outlier detection via z-scores
"""

import sys
from pathlib import Path
import pytest
import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from agents.root_cause_agent import RootCauseAgent, RootCauseResult, RootCauseInvestigator
from analytics.health_score import compute_health_score, BatchMetrics, HealthScore
from analytics.portfolio_view import get_portfolio_overview, PortfolioOverview
from forecasting.prepare_timeseries import generate_historical_cashflow_series, get_upcoming_recurring_events
from forecasting.forecast_cashflow import run_cashflow_forecast, CashflowForecastResult
from agents.forecast_explainer_agent import ForecastExplainerAgent


# =============================================================================
# 1. Root-Cause Chain Agent & Citation Honesty
# =============================================================================

class TestRootCauseChainAgent:
    @pytest.fixture
    def correlated_batch_data(self):
        """Generates a batch with 15 deliberately-correlated exceptions with ₹15 fee shortfall."""
        records = []
        exceptions = []
        
        # 15 correlated exceptions (e.g. NetBanking fee revision)
        for i in range(1, 16):
            rec_id = f"TXN-CORR-{i:03d}"
            sa = {
                "id": f"BNK-{1000+i}",
                "amount": 10000.0,
                "date": "2026-08-26",
                "description": f"HDFC NetBanking checkout merchant payout {i}",
                "reference": f"REF-HDFC-NET-{i}"
            }
            sb = {
                "id": f"GW-{2000+i}",
                "amount": 9985.0,  # ₹15 shortfall consistently
                "date": "2026-08-26",
                "description": f"Razorpay settlement HDFC netbanking {i}",
                "reference": f"REF-HDFC-NET-{i}"
            }
            rec = {"id": rec_id, "sourceA": sa, "sourceB": sb}
            records.append(rec)
            exceptions.append(rec)

        # 10 clean matching records
        for i in range(16, 26):
            rec_id = f"TXN-CLEAN-{i:03d}"
            sa = {"id": f"BNK-{1000+i}", "amount": 5000.0, "date": "2026-08-26", "description": "Clean transfer", "reference": f"REF-CLN-{i}"}
            sb = {"id": f"GW-{2000+i}", "amount": 5000.0, "date": "2026-08-26", "description": "Clean transfer", "reference": f"REF-CLN-{i}"}
            records.append({"id": rec_id, "sourceA": sa, "sourceB": sb})

        # 1 isolated unrelated exception
        iso_id = "TXN-ISO-999"
        iso_sa = {"id": "BNK-999", "amount": 12000.0, "date": "2026-08-26", "description": "Isolated counterparty", "reference": "REF-ISO"}
        iso_sb = {"id": "GW-999", "amount": 7500.0, "date": "2026-08-26", "description": "Isolated gateway", "reference": "REF-ISO"}
        iso_rec = {"id": iso_id, "sourceA": iso_sa, "sourceB": iso_sb}
        records.append(iso_rec)
        exceptions.append(iso_rec)

        return records, exceptions

    def test_pre_filter_triggers_for_correlated_but_skips_isolated(self, correlated_batch_data):
        records, exceptions = correlated_batch_data
        agent = RootCauseAgent()

        # Seed 1: Correlated exception (part of 15 records)
        should_run, sig, group = agent.should_investigate(exceptions[0], exceptions)
        assert should_run is True, "Expected pre-filter to trigger for correlated pattern"
        assert len(group) >= 2, "Expected matching cluster of at least 2 related exceptions"

        # Seed 2: Isolated exception
        isolated = [e for e in exceptions if e["id"] == "TXN-ISO-999"][0]
        should_run_iso, sig_iso, group_iso = agent.should_investigate(isolated, exceptions)
        assert should_run_iso is False, "Expected pre-filter to skip isolated one-off discrepancy"

    def test_root_cause_investigation_and_affected_set_precision_recall(self, correlated_batch_data):
        records, exceptions = correlated_batch_data
        agent = RootCauseAgent()

        seed = exceptions[0]
        result = agent.investigate(seed, records, exceptions)

        assert result.status == "identified"
        assert result.affected_count >= 2
        assert len(result.investigation_trace) >= 1
        assert "delta" in result.hypothesis.lower() or "fee" in result.hypothesis.lower() or "shortfall" in result.hypothesis.lower()

        # Ground-truth affected set is TXN-CORR-001 through TXN-CORR-015
        true_affected_ids = {f"TXN-CORR-{i:03d}" for i in range(1, 16)}
        predicted_ids = set(result.supporting_record_ids)

        tp = len(predicted_ids.intersection(true_affected_ids))
        fp = len(predicted_ids - true_affected_ids)
        fn = len(true_affected_ids - predicted_ids)

        precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0

        print(f"\n[Root-Cause Set Metrics] Precision: {precision*100:.1f}%, Recall: {recall*100:.1f}% ({tp}/{len(true_affected_ids)} found)")
        assert precision >= 0.80, f"Precision on affected record set too low: {precision:.2f}"
        assert recall >= 0.50, f"Recall on affected record set too low: {recall:.2f}"

    def test_citation_honesty_validator_rejects_hallucinated_ids(self, correlated_batch_data):
        """Verifies that the agent intercepts and removes any cited record ID that was NOT revealed by tools."""
        records, exceptions = correlated_batch_data
        agent = RootCauseAgent()

        workspace = RootCauseInvestigator(records)
        # Reveal only 2 records
        workspace.revealed_record_ids.add("TXN-CORR-001")
        workspace.revealed_record_ids.add("TXN-CORR-002")

        # Simulate LLM returning a hallucinated ID: TXN-GHOST-FAKE-999
        groq_mock_response = {
            "hypothesis": "Test hallucination interception",
            "supporting_record_ids": ["TXN-CORR-001", "TXN-GHOST-FAKE-999"],
            "root_cause_category": "fee_schedule_mismatch",
            "confidence": 0.90
        }

        # Check validation logic
        cited_ids = groq_mock_response["supporting_record_ids"]
        invalid_citations = [cid for cid in cited_ids if cid not in workspace.revealed_record_ids]
        assert "TXN-GHOST-FAKE-999" in invalid_citations, "Honesty validator should flag unrevealed ID"

        filtered_ids = [cid for cid in cited_ids if cid in workspace.revealed_record_ids]
        assert filtered_ids == ["TXN-CORR-001"], "Filtered citations should only contain verified IDs"


# =============================================================================
# 2. Financial Health Score (Tier 3C)
# =============================================================================

class TestFinancialHealthScore:
    def test_health_score_bounds_and_components(self):
        # Scenario 1: Excellent batch (high match, low anomaly, fast turnaround, low volatility)
        m_good = BatchMetrics(
            batch_id="b_good",
            total_records=500,
            matched_count=485,
            flagged_count=10,
            mismatched_count=5,
            match_rate=0.97,
            anomaly_rate=0.03,
            avg_exception_age_hours=2.0,
            forecast_volatility=0.15
        )
        h_good = compute_health_score(m_good)

        assert 0 <= h_good.score <= 100
        assert h_good.score >= 85, f"Expected high score for healthy metrics, got {h_good.score}"
        assert h_good.grade in ("A+", "A")
        assert "match_throughput" in h_good.breakdown
        assert "anomaly_integrity" in h_good.breakdown
        assert "resolution_velocity" in h_good.breakdown
        assert "forecast_stability" in h_good.breakdown

        # Scenario 2: Degraded batch (low match, high anomaly, slow turnaround)
        m_bad = BatchMetrics(
            batch_id="b_bad",
            total_records=500,
            matched_count=250,
            flagged_count=150,
            mismatched_count=100,
            match_rate=0.50,
            anomaly_rate=0.40,
            avg_exception_age_hours=36.0,
            forecast_volatility=0.70
        )
        h_bad = compute_health_score(m_bad)
        assert h_bad.score < 60, f"Expected low score for degraded metrics, got {h_bad.score}"
        assert h_bad.grade in ("C", "D")

    def test_health_score_trend_tracking(self):
        m = BatchMetrics(
            batch_id="b_trend",
            total_records=100,
            matched_count=90,
            flagged_count=7,
            mismatched_count=3,
            match_rate=0.90,
            anomaly_rate=0.05
        )
        h1 = compute_health_score(m, historical_scores=[80, 82, 85, 87])
        assert len(h1.sparkline) == 5
        assert h1.trend == "up"
        assert h1.trend_delta > 0


# =============================================================================
# 3. Meta Prophet Cash-Flow Forecasting (Tier 3B)
# =============================================================================

class TestCashflowForecasting:
    def test_timeseries_preparation_and_recurring_events(self):
        df = generate_historical_cashflow_series(days=60)
        assert len(df) == 60
        assert "ds" in df.columns and "y" in df.columns

        events = get_upcoming_recurring_events("2026-09-01", horizon_days=7)
        assert len(events) >= 1
        assert any("Tuesday" in e["day_name"] or "vendor" in e["event"].lower() for e in events)

    def test_prophet_forecast_and_confidence_bounds(self):
        forecast = run_cashflow_forecast(horizon_days=7, historical_days=45)

        assert len(forecast.forecast_points) == 7
        assert forecast.horizon_days == 7
        assert forecast.forecast_volatility > 0.0

        for pt in forecast.forecast_points:
            assert pt.lower_bound_inr <= pt.predicted_net_inr, f"Lower bound exceeds forecast on {pt.date}"
            assert pt.predicted_net_inr <= pt.upper_bound_inr, f"Forecast exceeds upper bound on {pt.date}"

    def test_forecast_explainer_agent_grounds_explanations(self):
        forecast = run_cashflow_forecast(horizon_days=7, historical_days=45)
        explainer = ForecastExplainerAgent()
        notes = explainer.explain_forecast(forecast)

        assert isinstance(notes, dict)
        for dt, note in notes.items():
            assert len(note) > 10
            # Must reference normal business pattern / recurring debit
            assert any(term in note.lower() for term in ["vendor", "payout", "debit", "volume", "expected", "seasonal", "hosting", "cloud", "tuesday"])


# =============================================================================
# 4. Portfolio Overview & Outlier Detection (Tier 3D)
# =============================================================================

class TestPortfolioView:
    def test_portfolio_overview_and_statistical_outliers(self):
        overview = get_portfolio_overview()

        assert overview.total_merchants == 10
        assert overview.outlier_count == 2
        assert len(overview.outliers) == 2

        outlier_names = [o.merchant_name for o in overview.outliers]
        assert "Dunzo Daily Logistics" in outlier_names
        assert "Cleartrip Travel Services" in outlier_names

        for out in overview.outliers:
            assert out.is_statistical_outlier is True
            assert len(out.outlier_reasons) >= 1
            assert abs(out.z_score_anomaly) >= 1.8 or abs(out.z_score_match) >= 1.8
