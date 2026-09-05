'use client';

import { useState, useEffect } from 'react';
import { CURRENT_BATCH, RECENT_BATCHES, MATCH_RATE_TREND, NightShiftRun } from '@/lib/mock-data';
import { StatCard } from '@/components/shared/StatCard';
import { StatusDot } from '@/components/shared/StatusDot';
import { fetchAutonomousHistory, runAutonomousCycle } from '@/lib/api';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

const SPARKLINE_RATE = MATCH_RATE_TREND.slice(-6).map(d => d.rate);
const SPARKLINE_EXCEPTIONS = [3, 2, 5, 1, 4, 5]; // exceptions per last 6 batches
const SPARKLINE_RES = [2.1, 1.9, 2.3, 1.7, 1.6, 1.8]; // avg resolution time

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

export function OverviewScreen() {
  const [nightRuns, setNightRuns] = useState<NightShiftRun[]>([]);
  const [isRunningNight, setIsRunningNight] = useState(false);
  const [selectedDigest, setSelectedDigest] = useState<string | null>(null);

  useEffect(() => {
    async function loadHistory() {
      try {
        const history = await fetchAutonomousHistory();
        if (history && history.length > 0) {
          setNightRuns(history);
        } else {
          // Default mock night-shift run
          setNightRuns([
            {
              id: 'NIGHT-RUN-01A',
              batch_id: 'batch-214',
              total_records: 20,
              auto_matched: 15,
              debated_and_resolved: 2,
              escalated_to_human: 3,
              processing_time_seconds: 3.42,
              top_anomalies: ['₹12.00 Razorpay gateway fee deduction on TXN-4003'],
              created_at: new Date(Date.now() - 3600 * 6000).toISOString(),
              digest_text: 'Autonomous Cycle Summary for Batch #batch-214:\n- 20 transactions ingested & normalized\n- 15 auto-matched on fast path\n- 2 debated via consensus arbiter\n- 3 escalated to human controller review\n- Cryptographic audit trail sealed with 21 blocks.',
              notification_sent: true,
            },
          ]);
        }
      } catch {
        // Mock fallback
      }
    }
    loadHistory();
  }, []);

  const handleRunAutonomous = async () => {
    setIsRunningNight(true);
    try {
      const digest = await runAutonomousCycle('batch-214');
      setSelectedDigest(digest.digest_text || 'Autonomous cycle completed successfully with 100% surface consistency.');
      const updated = await fetchAutonomousHistory();
      if (updated && updated.length > 0) {
        setNightRuns(updated);
      }
    } catch {
      setSelectedDigest('Autonomous cycle completed on simulated offline mode.');
    } finally {
      setIsRunningNight(false);
    }
  };

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
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

      {/* Autonomous Night-Shift Section */}
      <div
        className="card"
        style={{
          padding: '20px 24px',
          borderLeft: '4px solid #8b5cf6',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '1.1rem' }}>🌙</span>
              <p className="font-display-md" style={{ fontSize: '1rem', color: 'var(--text)', fontWeight: 700 }}>
                Autonomous Night-Shift Runner (Tier 2B)
              </p>
              <span
                style={{
                  fontSize: '0.72rem',
                  padding: '2px 8px',
                  borderRadius: 100,
                  background: 'rgba(139, 92, 246, 0.15)',
                  color: '#a78bfa',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  fontWeight: 600,
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
            className="btn-primary"
            style={{
              padding: '8px 18px',
              fontSize: '0.8125rem',
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
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
              <tr>
                <th>Run ID</th>
                <th>Batch</th>
                <th>Run Timestamp</th>
                <th>Total Records</th>
                <th>Auto-Matched</th>
                <th>Debated &amp; Resolved</th>
                <th>Escalated</th>
                <th>Runtime</th>
                <th>Digest</th>
              </tr>
            </thead>
            <tbody>
              {nightRuns.map((r) => (
                <tr key={r.id}>
                  <td>
                    <span className="font-mono-id" style={{ fontSize: '0.78rem', color: '#a78bfa' }}>
                      {r.id}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text)' }}>#{r.batch_id}</span>
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
                  <td style={{ color: 'var(--text)', fontSize: '0.8rem', fontWeight: 600 }}>{r.total_records}</td>
                  <td style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 600 }}>{r.auto_matched}</td>
                  <td style={{ color: '#6366f1', fontSize: '0.8rem', fontWeight: 600 }}>{r.debated_and_resolved}</td>
                  <td style={{ color: '#f59e0b', fontSize: '0.8rem', fontWeight: 600 }}>{r.escalated_to_human}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{r.processing_time_seconds}s</td>
                  <td>
                    <button
                      onClick={() => setSelectedDigest(r.digest_text || 'No digest text recorded.')}
                      style={{
                        padding: '3px 10px',
                        borderRadius: 4,
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-muted)',
                        fontSize: '0.72rem',
                        cursor: 'pointer',
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
      <div className="card" style={{ padding: '20px 24px' }}>
        <p
          className="font-display-md"
          style={{ fontSize: '0.9375rem', color: 'var(--text)', marginBottom: 4 }}
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
                  <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="var(--brand)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="batch"
                tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[90, 100]}
                tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => `${v}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="rate"
                stroke="var(--brand)"
                strokeWidth={2}
                fill="url(#rateGrad)"
                dot={false}
                activeDot={{ r: 4, fill: 'var(--brand)', stroke: 'var(--surface)', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent batches */}
      <div className="card" style={{ padding: '0' }}>
        <div style={{ padding: '16px 24px 12px', borderBottom: '1px solid var(--border)' }}>
          <p className="font-display-md" style={{ fontSize: '0.9375rem', color: 'var(--text)' }}>
            Recent activity
          </p>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Batch</th>
              <th>Run at</th>
              <th>Records</th>
              <th>Match rate</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {RECENT_BATCHES.map(b => (
              <tr key={b.id}>
                <td>
                  <span className="font-mono-id" style={{ fontSize: '0.8rem', color: 'var(--text)' }}>
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
                <td style={{ color: 'var(--text)', fontSize: '0.8125rem' }}>{b.totalRecords}</td>
                <td style={{ fontSize: '0.8125rem', fontWeight: 600, color: b.matchRate >= 97 ? 'var(--success)' : b.matchRate >= 94 ? 'var(--warning)' : 'var(--critical)' }}>
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
            background: 'rgba(0, 0, 0, 0.7)',
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
            className="card"
            style={{
              maxWidth: 600,
              width: '100%',
              padding: 24,
              background: '#090b10',
              border: '1px solid #334155',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>📬</span>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>
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
                  fontSize: '1.2rem',
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
                color: '#cbd5e1',
                background: '#040508',
                padding: 16,
                borderRadius: 6,
                border: '1px solid #1e293b',
                whiteSpace: 'pre-wrap',
                maxHeight: 350,
                overflowY: 'auto',
              }}
            >
              {selectedDigest}
            </pre>

            <button
              onClick={() => setSelectedDigest(null)}
              className="btn-primary"
              style={{ alignSelf: 'flex-end', padding: '6px 16px', fontSize: '0.8rem' }}
            >
              Close Digest
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
