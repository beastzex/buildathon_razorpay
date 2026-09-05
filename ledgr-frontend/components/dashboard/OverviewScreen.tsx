'use client';

import { CURRENT_BATCH, RECENT_BATCHES, MATCH_RATE_TREND } from '@/lib/mock-data';
import { StatCard } from '@/components/shared/StatCard';
import { StatusDot } from '@/components/shared/StatusDot';
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
    </div>
  );
}
