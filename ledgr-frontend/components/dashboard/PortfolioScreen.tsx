'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  fetchPortfolioOverview,
  type PortfolioOverview,
  type MerchantPortfolioCard,
} from '@/lib/api';

export function PortfolioScreen() {
  const [portfolio, setPortfolio] = useState<PortfolioOverview | null>(null);
  const [filter, setFilter] = useState<'all' | 'outliers'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPortfolio() {
      setIsLoading(true);
      try {
        const data = await fetchPortfolioOverview();
        setPortfolio(data);
      } catch {
      } finally {
        setIsLoading(false);
      }
    }
    loadPortfolio();
  }, []);

  if (isLoading || !portfolio) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
        <span className="spinner" style={{ width: 24, height: 24, marginBottom: 12 }} />
        <p>Aggregating platform-wide merchant reconciliation metrics...</p>
      </div>
    );
  }

  const displayedMerchants =
    filter === 'outliers' ? portfolio.outliers : portfolio.merchants.length > 0 ? portfolio.merchants : portfolio.outliers;

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Platform Vantage Point Header */}
      <div
        className="brutal-card"
        style={{
          padding: '22px 26px',
          background: 'var(--surface)',
          border: '2px solid #0D0D11',
          boxShadow: '4px 4px 0px #0D0D11',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: '1.5rem' }}>🌐</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text)' }}>
                  Platform Portfolio Vantage Point (Tier 3D)
                </h2>
                <span
                  className="brutal-badge"
                  style={{
                    fontSize: '0.7rem',
                    padding: '3px 8px',
                    background: 'rgba(99, 102, 241, 0.12)',
                    color: '#6366f1',
                    borderColor: '#6366f1',
                  }}
                >
                  Razorpay Risk &amp; Settlement Operations
                </span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 4, maxWidth: 800, lineHeight: 1.5 }}>
                {portfolio.platform_narrative}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setFilter('all')}
              className="brutal-btn"
              style={{
                padding: '7px 16px',
                fontSize: '0.78rem',
                background: filter === 'all' ? '#FE4A23' : 'var(--surface)',
                color: filter === 'all' ? '#FFFFFF' : 'var(--text)',
                boxShadow: filter === 'all' ? '2px 2px 0px #0D0D11' : '1px 1px 0px #0D0D11',
              }}
            >
              All Merchants ({portfolio.total_merchants})
            </button>
            <button
              onClick={() => setFilter('outliers')}
              className="brutal-btn"
              style={{
                padding: '7px 16px',
                fontSize: '0.78rem',
                background: filter === 'outliers' ? '#EF4444' : 'var(--surface)',
                color: filter === 'outliers' ? '#FFFFFF' : '#EF4444',
                borderColor: filter === 'outliers' ? '#0D0D11' : '#EF4444',
                boxShadow: filter === 'outliers' ? '2px 2px 0px #0D0D11' : '1px 1px 0px #EF4444',
              }}
            >
              ⚠ Risk Outliers ({portfolio.outlier_count})
            </button>
          </div>
        </div>

        {/* Platform KPI Summary Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 16,
            borderTop: '2px solid #0D0D11',
            paddingTop: 14,
            marginTop: 4,
          }}
        >
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Daily Portfolio GMV</span>
            <p style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text)', fontFamily: "'SF Mono', monospace" }}>
              ₹{(portfolio.total_portfolio_daily_gmv_inr / 10000000).toFixed(1)} Cr
            </p>
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Platform Avg Health</span>
            <p style={{ fontSize: '1.25rem', fontWeight: 900, color: '#6366f1', fontFamily: "'SF Mono', monospace" }}>
              {Math.round(portfolio.platform_avg_health_score)} / 100
            </p>
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Auto-Match Rate</span>
            <p style={{ fontSize: '1.25rem', fontWeight: 900, color: '#10b981', fontFamily: "'SF Mono', monospace" }}>
              {portfolio.platform_avg_match_rate.toFixed(1)}%
            </p>
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Outlier Accounts</span>
            <p style={{ fontSize: '1.25rem', fontWeight: 900, color: '#EF4444', fontFamily: "'SF Mono', monospace" }}>
              {portfolio.outlier_count} of {portfolio.total_merchants}
            </p>
          </div>
        </div>
      </div>

      {/* Outliers Attention Banner */}
      {portfolio.outlier_count > 0 && filter === 'all' && (
        <div
          style={{
            padding: '14px 18px',
            borderRadius: 8,
            background: 'rgba(244, 63, 94, 0.08)',
            borderLeft: '4px solid #f43f5e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div>
            <strong style={{ color: '#fb7185', fontSize: '0.85rem' }}>
              ⚠ Action Required: {portfolio.outlier_count} Merchants Exceed 1.8 Standard Deviations (z-score)
            </strong>
            <p style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: 2 }}>
              High anomaly rates detected in Dunzo and Cleartrip settlement files. Discrepancies indicate gateway timeout spikes and airline cancellation chargebacks.
            </p>
          </div>
          <button
            onClick={() => setFilter('outliers')}
            style={{
              padding: '6px 12px',
              borderRadius: 4,
              background: '#f43f5e',
              color: '#ffffff',
              border: 'none',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Inspect Outliers
          </button>
        </div>
      )}

      {/* Merchant Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
        {displayedMerchants.map((m) => {
          const isOutlier = m.is_statistical_outlier;
          const ringColor =
            m.health_score >= 90 ? '#6366f1' : m.health_score >= 80 ? '#10b981' : m.health_score >= 65 ? '#f59e0b' : '#f43f5e';
          const strokeOffset = 283 - (283 * m.health_score) / 100;

          return (
            <div
              key={m.merchant_id}
              className="brutal-card"
              style={{
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                border: isOutlier ? '2px solid #EF4444' : '2px solid #0D0D11',
                boxShadow: isOutlier ? '4px 4px 0px #EF4444' : '3px 3px 0px #0D0D11',
                background: isOutlier ? 'var(--surface)' : 'var(--surface)',
                position: 'relative',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text)' }}>
                    {m.merchant_name}
                  </h3>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{m.industry}</p>
                </div>

                {isOutlier && (
                  <span
                    className="brutal-badge"
                    style={{
                      fontSize: '0.68rem',
                      background: 'rgba(239, 68, 68, 0.12)',
                      color: '#EF4444',
                      borderColor: '#EF4444',
                    }}
                  >
                    ⚠ OUTLIER
                  </span>
                )}
              </div>

              {/* Health Ring & Metrics */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ position: 'relative', width: 56, height: 56, flexShrink: 0 }}>
                  <svg width="56" height="56" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="50" cy="50" r="45" fill="none" stroke="var(--border-strong)" strokeWidth="10" />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke={ringColor}
                      strokeWidth="10"
                      strokeDasharray="283"
                      strokeDashoffset={strokeOffset}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.05rem',
                      fontWeight: 800,
                      color: 'var(--text)',
                    }}
                  >
                    {m.health_score}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: ringColor }}>
                    Grade {m.health_grade} • {m.health_rating}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Auto-Match: <strong>{m.match_rate}%</strong>
                  </span>
                  <span style={{ fontSize: '0.72rem', color: isOutlier ? '#fb7185' : 'var(--text-muted)' }}>
                    Anomaly Rate: <strong>{m.anomaly_rate}%</strong>
                  </span>
                </div>
              </div>

              {/* Volume & GMV stats */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 8,
                  padding: '10px 12px',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: 6,
                  border: '1px solid var(--border)',
                  fontSize: '0.75rem',
                }}
              >
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>Monthly Volume</span>
                  <p style={{ fontWeight: 600, color: 'var(--text)', marginTop: 1 }}>
                    {m.monthly_volume.toLocaleString()} txns
                  </p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>Daily GMV</span>
                  <p style={{ fontWeight: 600, color: 'var(--text)', marginTop: 1 }}>
                    ₹{(m.daily_gmv_inr / 100000).toFixed(1)} Lakhs
                  </p>
                </div>
              </div>

              {/* Outlier reason if present */}
              {isOutlier && m.outlier_reasons.length > 0 && (
                <div
                  style={{
                    padding: '8px 10px',
                    borderRadius: 4,
                    background: 'rgba(244, 63, 94, 0.1)',
                    borderLeft: '2px solid #f43f5e',
                    fontSize: '0.7rem',
                    color: '#fecdd3',
                    lineHeight: 1.4,
                  }}
                >
                  {m.outlier_reasons[0]}
                </div>
              )}

              {/* Drill-down action link */}
              <Link
                href="/dashboard/reconciliation"
                className="btn-outline"
                style={{
                  textAlign: 'center',
                  fontSize: '0.75rem',
                  padding: '7px 12px',
                  marginTop: 'auto',
                  borderColor: isOutlier ? 'rgba(244, 63, 94, 0.4)' : 'var(--border)',
                  color: isOutlier ? '#fb7185' : 'var(--text)',
                }}
              >
                Drill Down to Ledger Dashboard →
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
