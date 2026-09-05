'use client';

import { useState } from 'react';
import { useTheme } from '@/lib/theme';

export function SettingsScreen() {
  const { theme, toggle } = useTheme();
  const [threshold, setThreshold] = useState(85);

  const DATA_SOURCES = [
    { name: 'Bank statement', status: 'connected', detail: 'HDFC Bank API — last synced Sep 01, 2026' },
    { name: 'Gateway API', status: 'connected', detail: 'Razorpay settlement API — live' },
    { name: 'Ledger sync', status: 'pending', detail: 'QuickBooks sync — not yet configured' },
  ];

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 640 }}>
      <div>
        <p className="font-display-md" style={{ fontSize: '1rem', color: 'var(--text)', marginBottom: 2 }}>
          Settings
        </p>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          Adjust reconciliation behaviour and display preferences.
        </p>
      </div>

      {/* Theme */}
      <div className="card" style={{ padding: '20px 24px' }}>
        <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>
          Display
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text)', marginBottom: 2 }}>Theme</p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Currently using {theme} mode.
            </p>
          </div>
          <button
            onClick={toggle}
            id="settings-theme-toggle"
            className="btn-outline"
            style={{ fontSize: '0.875rem', padding: '8px 16px' }}
          >
            Switch to {theme === 'dark' ? 'light' : 'dark'} mode
          </button>
        </div>
      </div>

      {/* Confidence threshold */}
      <div className="card" style={{ padding: '20px 24px' }}>
        <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
          Confidence threshold
        </p>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.6 }}>
          Records above this threshold are auto-matched. Lower it to catch more edge cases; raise it to reduce false flags.
          Currently: <strong style={{ color: 'var(--brand)' }}>{threshold}%</strong>
        </p>
        <input
          id="confidence-threshold"
          type="range"
          min={50}
          max={99}
          value={threshold}
          onChange={e => setThreshold(Number(e.target.value))}
          style={{
            width: '100%',
            accentColor: 'var(--brand)',
            cursor: 'pointer',
            marginBottom: 8,
          }}
          aria-label="Confidence threshold"
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-faint)' }}>
          <span>50% — more matches flagged</span>
          <span>99% — fewer false flags</span>
        </div>
      </div>

      {/* Data sources */}
      <div className="card" style={{ padding: '20px 24px' }}>
        <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>
          Connected data sources
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {DATA_SOURCES.map(src => (
            <div
              key={src.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                background: 'var(--bg)',
                borderRadius: 10,
                border: '1px solid var(--border)',
                gap: 12,
              }}
            >
              <div>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>
                  {src.name}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{src.detail}</p>
              </div>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: src.status === 'connected' ? 'var(--success)' : 'var(--text-muted)',
                  background: src.status === 'connected' ? 'var(--success-dim)' : 'var(--surface-hover)',
                  padding: '3px 10px',
                  borderRadius: 100,
                  flexShrink: 0,
                }}
              >
                {src.status === 'connected' ? 'Connected' : 'Pending'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
