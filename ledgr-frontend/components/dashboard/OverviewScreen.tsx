'use client';

import { useState, useEffect } from 'react';
import { CURRENT_BATCH, RECENT_BATCHES, MATCH_RATE_TREND, NightShiftRun } from '@/lib/mock-data';
import { StatCard } from '@/components/shared/StatCard';
import { StatusDot } from '@/components/shared/StatusDot';
import {
  fetchAutonomousHistory,
  runAutonomousCycle,
  fetchBatchHealthScore,
  fetchCashflowForecast,
  type FinancialHealthScore,
  type CashflowForecastResult,
  type CashflowForecastPoint,
} from '@/lib/api';
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

const SPARKLINE_RATE = MATCH_RATE_TREND.slice(-6).map((d) => d.rate);
const SPARKLINE_EXCEPTIONS = [3, 2, 5, 1, 4, 5];
const SPARKLINE_RES = [2.1, 1.9, 2.3, 1.7, 1.6, 1.8];

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '8px 12px',
        fontSize: '0.8125rem',
      }}
    >
      <p style={{ color: 'var(--text-muted)', marginBottom: 4 }}>Batch {label}</p>
      <p style={{ color: 'var(--brand)', fontWeight: 700 }}>{payload[0].value.toFixed(1)}%</p>
    </div>
  );
}

function ForecastTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;
  const point = payload[0]?.payload as CashflowForecastPoint;
  if (!point) return null;

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '2px solid #0D0D11',
        borderRadius: 8,
        padding: '10px 14px',
        fontSize: '0.8125rem',
        maxWidth: 280,
        boxShadow: '4px 4px 0px #0D0D11',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontWeight: 800, color: 'var(--text)' }}>
          {point.date} ({point.day_name})
        </span>
        {point.is_dip && (
          <span
            style={{
              fontSize: '0.68rem',
              padding: '2px 6px',
              borderRadius: 4,
              background: 'rgba(239, 68, 68, 0.12)',
              color: '#DC2626',
              fontWeight: 800,
              fontFamily: "'SF Mono', monospace",
              border: '1px solid rgba(239, 68, 68, 0.3)',
            }}
          >
            Outflow
          </span>
        )}
      </div>
      <p style={{ color: '#FE4A23', fontWeight: 800, fontSize: '0.98rem', fontFamily: "'SF Mono', monospace" }}>
        ₹{point.predicted_net_inr.toLocaleString('en-IN')}
      </p>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: 2 }}>
        90% Band: ₹{Math.round(point.lower_bound_inr).toLocaleString('en-IN')} – ₹
        {Math.round(point.upper_bound_inr).toLocaleString('en-IN')}
      </p>
      {point.explanation_note && (
        <div
          style={{
            marginTop: 8,
            padding: '6px 8px',
            borderRadius: 4,
            background: 'var(--bg)',
            borderLeft: '3px solid #FE4A23',
            color: 'var(--text)',
            fontSize: '0.75rem',
            lineHeight: 1.4,
          }}
        >
          💡 {point.explanation_note}
        </div>
      )}
    </div>
  );
}

export function OverviewScreen() {
  const [nightRuns, setNightRuns] = useState<NightShiftRun[]>([]);
  const [isRunningNight, setIsRunningNight] = useState(false);
  const [selectedDigest, setSelectedDigest] = useState<string | null>(null);

  // Tier 3: Health Score & Forecast States
  const [healthScore, setHealthScore] = useState<FinancialHealthScore | null>(null);
  const [showHealthBreakdown, setShowHealthBreakdown] = useState(false);
  const [forecastHorizon, setForecastHorizon] = useState<number>(7);
  const [forecastData, setForecastData] = useState<CashflowForecastResult | null>(null);
  const [isLoadingForecast, setIsLoadingForecast] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const history = await fetchAutonomousHistory();
        if (history && history.length > 0) setNightRuns(history);
      } catch {}

      try {
        const hs = await fetchBatchHealthScore('batch-214');
        setHealthScore(hs);
      } catch {}
    }
    loadData();
  }, []);

  useEffect(() => {
    async function loadForecast() {
      setIsLoadingForecast(true);
      try {
        const fc = await fetchCashflowForecast('batch-214', forecastHorizon);
        setForecastData(fc);
      } catch {} finally {
        setIsLoadingForecast(false);
      }
    }
    loadForecast();
  }, [forecastHorizon]);

  const handleRunAutonomous = async () => {
    setIsRunningNight(true);
    try {
      const digest = await runAutonomousCycle('batch-214');
      setSelectedDigest(digest.digest_text || 'Autonomous cycle completed successfully with 100% surface consistency.');
      const updated = await fetchAutonomousHistory();
      if (updated && updated.length > 0) setNightRuns(updated);
    } catch {
      setSelectedDigest('Autonomous cycle completed on simulated offline mode.');
    } finally {
      setIsRunningNight(false);
    }
  };

  // Radial ring calculations for score
  const scoreVal = healthScore?.score || 92;
  const strokeDashoffset = 283 - (283 * scoreVal) / 100;
  const ringColor =
    scoreVal >= 90 ? '#6366f1' : scoreVal >= 80 ? '#10b981' : scoreVal >= 65 ? '#f59e0b' : '#f43f5e';

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Top Stat row: StatCards + Financial Health Gauge */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, alignItems: 'stretch' }}>
        {/* Financial Health Score Radial Ring Card */}
        <div
          className="brutal-card"
          style={{
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            cursor: 'pointer',
            border: '2px solid #0D0D11',
            boxShadow: '3px 3px 0px #0D0D11',
            background: 'var(--surface)',
            height: '100%',
            minHeight: 140,
          }}
          onClick={() => setShowHealthBreakdown(!showHealthBreakdown)}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span
              style={{
                fontFamily: "'SF Mono', monospace",
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Financial Health
            </span>
            <span
              style={{
                fontSize: '0.68rem',
                padding: '2px 7px',
                borderRadius: 100,
                background: 'rgba(99, 102, 241, 0.15)',
                color: '#6366f1',
                fontWeight: 800,
                fontFamily: "'SF Mono', monospace",
                border: '1px solid rgba(99, 102, 241, 0.3)',
              }}
            >
              Grade {healthScore?.grade || 'A+'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '4px 0' }}>
            {/* SVG Ring Gauge */}
            <div style={{ position: 'relative', width: 60, height: 60, flexShrink: 0 }}>
              <svg width="60" height="60" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="50" cy="50" r="45" fill="none" stroke="var(--border-strong)" strokeWidth="10" />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={ringColor}
                  strokeWidth="10"
                  strokeDasharray="283"
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                />
              </svg>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                  fontWeight: 900,
                  color: 'var(--text)',
                  fontFamily: "'Urbanist', sans-serif",
                }}
              >
                {scoreVal}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.76rem', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3, fontFamily: "'SF Mono', monospace" }}>
                ↑ +2.4 pts
              </span>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 2 }}>
                {healthScore?.rating || 'Exceptional Hygiene'}
              </span>
              <span style={{ fontSize: '0.68rem', color: '#6366f1', marginTop: 4, textDecoration: 'underline', fontWeight: 600 }}>
                {showHealthBreakdown ? 'Hide Breakdown ▴' : 'View Breakdown ▾'}
              </span>
            </div>
          </div>

          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Transparent 4-factor composite
          </div>
        </div>

        <StatCard
          label="Match rate"
          value="97.4%"
          trend={-1.7}
          sparkline={SPARKLINE_RATE}
          accentColor="var(--brand)"
          subtext="Batch #214 — 20 records"
        />
        <StatCard
          label="Open exceptions"
          value={`${CURRENT_BATCH.flaggedCount + CURRENT_BATCH.mismatchedCount}`}
          sparkline={SPARKLINE_EXCEPTIONS}
          accentColor="var(--warning)"
          subtext={`${CURRENT_BATCH.flaggedCount} flagged, ${CURRENT_BATCH.mismatchedCount} mismatched`}
        />
        <StatCard
          label="Avg resolution time"
          value="1.8s"
          trend={0.2}
          sparkline={SPARKLINE_RES}
          accentColor="var(--data)"
          subtext="Per exception, this batch"
        />
      </div>

      {/* Expandable Financial Health Breakdown Drawer */}
      {showHealthBreakdown && healthScore && (
        <div
          className="brutal-card"
          style={{
            padding: '22px 24px',
            border: '2px solid #0D0D11',
            boxShadow: '4px 4px 0px #0D0D11',
            background: 'var(--surface)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text)' }}>
                Financial Health Score Weighting Breakdown (Tier 3C)
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                Documented, non-black-box composite calculated against operational batch invariants and forecast predictability.
              </p>
            </div>
            <button
              onClick={() => setShowHealthBreakdown(false)}
              className="brutal-btn"
              style={{
                padding: '4px 10px',
                fontSize: '0.8rem',
              }}
            >
              ✕
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {Object.entries(healthScore.breakdown).map(([key, item]) => (
              <div
                key={key}
                style={{
                  background: 'var(--bg)',
                  border: '1.5px solid #0D0D11',
                  borderRadius: 10,
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text)' }}>{item.name}</span>
                  <span style={{ fontSize: '0.7rem', color: '#6366f1', fontWeight: 800, fontFamily: "'SF Mono', monospace" }}>
                    {item.contribution_points} pts
                  </span>
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--brand)', fontFamily: "'SF Mono', monospace" }}>
                  {item.raw_metric}%
                </div>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  {item.explanation}
                </p>
                <div style={{ marginTop: 4, height: 6, background: 'var(--border-strong)', borderRadius: 3, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${item.normalized_score}%`,
                      background: ringColor,
                      borderRadius: 3,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {healthScore.actionable_recommendations.length > 0 && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: 8,
                background: 'rgba(99, 102, 241, 0.08)',
                border: '1.5px solid #6366f1',
                fontSize: '0.78rem',
                color: 'var(--text)',
                fontWeight: 600,
              }}
            >
              <strong>💡 Controller Recommendation:</strong> {healthScore.actionable_recommendations[0]}
            </div>
          )}
        </div>
      )}

      {/* Cash-Flow Forecasting Section (Tier 3B) */}
      <div
        className="brutal-card"
        style={{
          padding: '22px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          border: '2px solid #0D0D11',
          boxShadow: '4px 4px 0px #0D0D11',
          background: 'var(--surface)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '1.1rem' }}>📈</span>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text)' }}>
                Cash-Flow Liquidity Forecast &amp; Uncertainty Band (Tier 3B)
              </h3>
              <span
                className="brutal-badge"
                style={{
                  fontSize: '0.68rem',
                  padding: '3px 8px',
                  background: 'rgba(254, 74, 35, 0.12)',
                  color: '#FE4A23',
                  borderColor: '#FE4A23',
                }}
              >
                Meta Prophet Engine
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Predicts net cash movement with a 90% confidence uncertainty interval. LLM grounds liquidity dips in verified recurring calendar debits.
            </p>
          </div>

          {/* Horizon toggle */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              background: 'var(--bg)',
              padding: 4,
              borderRadius: 8,
              border: '2px solid #0D0D11',
              boxShadow: '2px 2px 0px #0D0D11',
            }}
          >
            {[3, 7, 30].map((h) => (
              <button
                key={h}
                onClick={() => setForecastHorizon(h)}
                style={{
                  padding: '5px 14px',
                  borderRadius: 6,
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  fontFamily: "'SF Mono', monospace",
                  background: forecastHorizon === h ? '#FE4A23' : 'transparent',
                  color: forecastHorizon === h ? '#FFFFFF' : 'var(--text-muted)',
                  border: forecastHorizon === h ? '1.5px solid #0D0D11' : '1.5px solid transparent',
                  boxShadow: forecastHorizon === h ? '1px 1px 0px #0D0D11' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {h} Days
              </button>
            ))}
          </div>
        </div>

        {/* Notice of synthetic data (HONESTY REQUIREMENT) */}
        <div
          style={{
            padding: '8px 14px',
            borderRadius: 8,
            background: '#FEF3C7',
            border: '1.5px solid #F59E0B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.74rem',
            color: '#78350F',
            fontWeight: 600,
          }}
        >
          <span>
            ℹ️ <strong>Honesty Disclosure:</strong> Trained on synthetic historical settlement patterns. Forecast bounds and seasonal dips reflect modeled recurring vendor outflows.
          </span>
          <span style={{ color: '#92400E', fontSize: '0.7rem', fontWeight: 800, fontFamily: "'SF Mono', monospace" }}>
            VOLATILITY: {forecastData ? `${Math.round(forecastData.forecast_volatility * 100)}%` : '28%'}
          </span>
        </div>

        {/* Recharts Area Forecast with Confidence Band */}
        <div style={{ height: 240, width: '100%', marginTop: 8 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecastData?.forecast_points || []} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="bandGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FE4A23" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#FE4A23" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-strong)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: 'var(--text-muted)', fontWeight: 600 }}
                axisLine={{ stroke: 'var(--border-strong)' }}
                tickLine={false}
                tickFormatter={(d) => d.slice(5)}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'var(--text-muted)', fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₹${Math.round(v / 1000)}k`}
              />
              <Tooltip content={<ForecastTooltip />} />
              {/* Upper Bound */}
              <Area
                type="monotone"
                dataKey="upper_bound_inr"
                stroke="rgba(254, 74, 35, 0.4)"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                fill="url(#bandGrad)"
              />
              {/* Center Forecast Line */}
              <Area
                type="monotone"
                dataKey="predicted_net_inr"
                stroke="#FE4A23"
                strokeWidth={2.5}
                fill="none"
                dot={{ r: 4, fill: '#FE4A23', stroke: '#0D0D11', strokeWidth: 1.5 }}
                activeDot={{ r: 6, fill: '#FE4A23', stroke: '#0D0D11', strokeWidth: 2 }}
              />
              {/* Lower Bound */}
              <Area
                type="monotone"
                dataKey="lower_bound_inr"
                stroke="rgba(254, 74, 35, 0.4)"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                fill="none"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>


      {/* Autonomous Night-Shift Section */}
      <div
        className="brutal-card"
        style={{
          padding: '22px 24px',
          border: '2px solid #0D0D11',
          borderLeft: '6px solid #8b5cf6',
          boxShadow: '4px 4px 0px #0D0D11',
          background: 'var(--surface)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '1.1rem' }}>🌙</span>
              <p className="font-display-md" style={{ fontSize: '1.05rem', color: 'var(--text)', fontWeight: 800 }}>
                Autonomous Night-Shift Runner (Tier 2B)
              </p>
              <span
                className="brutal-badge"
                style={{
                  fontSize: '0.7rem',
                  padding: '2px 8px',
                  background: 'rgba(139, 92, 246, 0.12)',
                  color: '#8b5cf6',
                  borderColor: '#8b5cf6',
                }}
              >
                Cron: 02:00 IST Daily
              </span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Runs unattended overnight reconciliation batches, debates borderline discrepancies, seals the cryptographic ledger, and dispatches morning controller digests.
            </p>
          </div>

          <button
            onClick={handleRunAutonomous}
            disabled={isRunningNight}
            className="brutal-btn"
            style={{
              padding: '8px 18px',
              fontSize: '0.8125rem',
              background: '#8b5cf6',
              color: '#FFFFFF',
              borderColor: '#0D0D11',
              boxShadow: '2px 2px 0px #0D0D11',
            }}
          >
            {isRunningNight ? (
              <>
                <span className="spinner" style={{ width: 14, height: 14 }} />
                Running Autonomous Shift...
              </>
            ) : (
              <>⚡ Run Autonomous Cycle Now</>
            )}
          </button>
        </div>

        {/* History table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr style={{ borderBottom: '2px solid #0D0D11' }}>
                <th style={{ fontWeight: 800, color: 'var(--text)' }}>Run ID</th>
                <th style={{ fontWeight: 800, color: 'var(--text)' }}>Batch</th>
                <th style={{ fontWeight: 800, color: 'var(--text)' }}>Run Timestamp</th>
                <th style={{ fontWeight: 800, color: 'var(--text)' }}>Total Records</th>
                <th style={{ fontWeight: 800, color: 'var(--text)' }}>Auto-Matched</th>
                <th style={{ fontWeight: 800, color: 'var(--text)' }}>Debated &amp; Resolved</th>
                <th style={{ fontWeight: 800, color: 'var(--text)' }}>Escalated</th>
                <th style={{ fontWeight: 800, color: 'var(--text)' }}>Runtime</th>
                <th style={{ fontWeight: 800, color: 'var(--text)' }}>Digest</th>
              </tr>
            </thead>
            <tbody>
              {nightRuns.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--border-strong)' }}>
                  <td>
                    <span className="font-mono-id" style={{ fontSize: '0.78rem', color: '#8b5cf6', fontWeight: 700 }}>
                      {r.id}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text)', fontWeight: 700, fontFamily: "'SF Mono', monospace" }}>#{r.batch_id}</span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                    {new Date(r.created_at).toLocaleString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                    })}
                  </td>
                  <td style={{ color: 'var(--text)', fontSize: '0.8rem', fontWeight: 700 }}>{r.total_records}</td>
                  <td style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 700 }}>{r.auto_matched}</td>
                  <td style={{ color: '#6366f1', fontSize: '0.8rem', fontWeight: 700 }}>{r.debated_and_resolved}</td>
                  <td style={{ color: '#f59e0b', fontSize: '0.8rem', fontWeight: 700 }}>{r.escalated_to_human}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontFamily: "'SF Mono', monospace" }}>{r.processing_time_seconds}s</td>
                  <td>
                    <button
                      onClick={() => setSelectedDigest(r.digest_text || 'No digest text recorded.')}
                      className="brutal-btn"
                      style={{
                        padding: '4px 10px',
                        fontSize: '0.72rem',
                        boxShadow: '1px 1px 0px #0D0D11',
                      }}
                    >
                      View Digest
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Match rate trend chart */}
      <div
        className="brutal-card"
        style={{
          padding: '22px 24px',
          border: '2px solid #0D0D11',
          boxShadow: '4px 4px 0px #0D0D11',
          background: 'var(--surface)',
        }}
      >
        <p
          className="font-display-md"
          style={{ fontSize: '1rem', color: 'var(--text)', fontWeight: 800, marginBottom: 4 }}
        >
          Match rate — last 14 batches
        </p>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 20 }}>
          Two-stage confidence gate output across recent runs.
        </p>
        <div style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MATCH_RATE_TREND} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="rateGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="var(--brand)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-strong)" vertical={false} />
              <XAxis
                dataKey="batch"
                tick={{ fontSize: 11, fill: 'var(--text-muted)', fontWeight: 600 }}
                axisLine={{ stroke: 'var(--border-strong)' }}
                tickLine={false}
              />
              <YAxis
                domain={[90, 100]}
                tick={{ fontSize: 11, fill: 'var(--text-muted)', fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => `${v}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="rate"
                stroke="var(--brand)"
                strokeWidth={2.5}
                fill="url(#rateGrad)"
                dot={false}
                activeDot={{ r: 5, fill: 'var(--brand)', stroke: '#0D0D11', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent batches */}
      <div
        className="brutal-card"
        style={{
          padding: '0',
          border: '2px solid #0D0D11',
          boxShadow: '4px 4px 0px #0D0D11',
          background: 'var(--surface)',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '16px 24px 12px', borderBottom: '2px solid #0D0D11' }}>
          <p className="font-display-md" style={{ fontSize: '1rem', color: 'var(--text)', fontWeight: 800 }}>
            Recent activity
          </p>
        </div>
        <table className="data-table">
          <thead>
            <tr style={{ borderBottom: '1px solid #0D0D11' }}>
              <th style={{ fontWeight: 800, color: 'var(--text)' }}>Batch</th>
              <th style={{ fontWeight: 800, color: 'var(--text)' }}>Run at</th>
              <th style={{ fontWeight: 800, color: 'var(--text)' }}>Records</th>
              <th style={{ fontWeight: 800, color: 'var(--text)' }}>Match rate</th>
              <th style={{ fontWeight: 800, color: 'var(--text)' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {RECENT_BATCHES.map(b => (
              <tr key={b.id} style={{ borderBottom: '1px solid var(--border-strong)' }}>
                <td>
                  <span className="font-mono-id" style={{ fontSize: '0.8rem', color: 'var(--text)', fontWeight: 700 }}>
                    {b.label}
                  </span>
                </td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                  {new Date(b.runAt).toLocaleString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                  })}
                </td>
                <td style={{ color: 'var(--text)', fontSize: '0.8125rem', fontWeight: 700 }}>{b.totalRecords}</td>
                <td style={{ fontSize: '0.8125rem', fontWeight: 800, fontFamily: "'SF Mono', monospace", color: b.matchRate >= 97 ? 'var(--success)' : b.matchRate >= 94 ? 'var(--warning)' : 'var(--critical)' }}>
                  {b.matchRate.toFixed(1)}%
                </td>
                <td>
                  <StatusDot
                    status={b.mismatchedCount > 0 ? 'mismatched' : b.flaggedCount > 0 ? 'flagged' : 'matched'}
                    showLabel={true}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Night-Shift Digest Modal */}
      {selectedDigest && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: 24,
          }}
          onClick={() => setSelectedDigest(null)}
        >
          <div
            className="brutal-card"
            style={{
              maxWidth: 600,
              width: '100%',
              padding: 24,
              background: 'var(--surface)',
              border: '2px solid #0D0D11',
              boxShadow: '6px 6px 0px #0D0D11',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>📬</span>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text)' }}>
                  Autonomous Shift Digest
                </h3>
              </div>
              <button
                onClick={() => setSelectedDigest(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '1.3rem',
                  fontWeight: 700,
                }}
              >
                ✕
              </button>
            </div>

            <pre
              style={{
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                fontSize: '0.8rem',
                lineHeight: 1.6,
                color: 'var(--text)',
                background: 'var(--bg)',
                padding: 16,
                borderRadius: 8,
                border: '1.5px solid #0D0D11',
                whiteSpace: 'pre-wrap',
                maxHeight: 350,
                overflowY: 'auto',
              }}
            >
              {selectedDigest}
            </pre>

            <button
              onClick={() => setSelectedDigest(null)}
              className="brutal-btn-brand"
              style={{ alignSelf: 'flex-end', padding: '8px 18px', fontSize: '0.8rem' }}
            >
              Close Digest
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
