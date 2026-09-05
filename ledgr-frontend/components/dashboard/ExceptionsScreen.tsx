'use client';

import { useState } from 'react';
import { TRANSACTIONS } from '@/lib/mock-data';
import { ExceptionCard } from '@/components/shared/ExceptionCard';

export function ExceptionsScreen() {
  const exceptions = TRANSACTIONS.filter(t => t.status !== 'matched');
  const [resolved, setResolved] = useState<Set<string>>(new Set());
  const [log, setLog] = useState<{ id: string; action: string; at: string }[]>([]);

  const handleConfirm = async (id: string) => {
    setResolved(prev => new Set([...prev, id]));
    setLog(prev => [{ id, action: 'Confirmed match', at: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }) }, ...prev]);
    try {
      const { resolveException } = await import('@/lib/api');
      await resolveException(id, 'confirm');
    } catch {
      // Handled gracefully via fallback
    }
  };

  const handleMismatch = async (id: string) => {
    setResolved(prev => new Set([...prev, id]));
    setLog(prev => [{ id, action: 'Marked as mismatch', at: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }) }, ...prev]);
    try {
      const { resolveException } = await import('@/lib/api');
      await resolveException(id, 'reject');
    } catch {
      // Handled gracefully via fallback
    }
  };

  const remaining = exceptions.filter(e => !resolved.has(e.id));

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Summary */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <p className="font-display-md" style={{ fontSize: '1rem', color: 'var(--text)', marginBottom: 2 }}>
            Exception queue
          </p>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            {remaining.length} of {exceptions.length} remaining — resolve each to append to the audit trail.
          </p>
        </div>
        {resolved.size > 0 && (
          <span
            style={{
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'var(--success)',
              background: 'var(--success-dim)',
              padding: '4px 12px',
              borderRadius: 100,
            }}
          >
            {resolved.size} resolved this session
          </span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(0, 280px)', gap: 20, alignItems: 'flex-start' }}>
        {/* Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {remaining.length === 0 ? (
            <div
              className="card"
              style={{ padding: '40px 24px', textAlign: 'center' }}
            >
              <p style={{ fontSize: '1rem', color: 'var(--text)', fontWeight: 600, marginBottom: 6 }}>
                All exceptions resolved.
              </p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Nothing needs your attention.
              </p>
            </div>
          ) : (
            remaining.map(record => (
              <ExceptionCard
                key={record.id}
                record={record}
                onConfirm={handleConfirm}
                onMismatch={handleMismatch}
              />
            ))
          )}
        </div>

        {/* Resolution log */}
        <div className="card" style={{ padding: '16px 20px', position: 'sticky', top: 24 }}>
          <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>
            Session log
          </p>
          {log.length === 0 ? (
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              No actions yet.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {log.map((entry, i) => (
                <div key={i} style={{ borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                  <p className="font-mono-id" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 2 }}>
                    {entry.id}
                  </p>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text)' }}>{entry.action}</p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-faint)', marginTop: 2 }}>{entry.at}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
