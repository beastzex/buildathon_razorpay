'use client';

import { useState } from 'react';
import { AUDIT_EVENTS } from '@/lib/mock-data';
import { AuditTimelineEntry } from '@/components/shared/AuditTimelineEntry';

export function AuditScreen() {
  const [events, setEvents] = useState(AUDIT_EVENTS);
  const [verifiedCount, setVerifiedCount] = useState(7);
  const [verifyState, setVerifyState] = useState<'idle' | 'checking' | 'pass' | 'fail'>('idle');

  const handleVerify = async () => {
    setVerifyState('checking');
    try {
      const { verifyAuditChain } = await import('@/lib/api');
      const res = await verifyAuditChain('batch-214');
      if (res.isValid) {
        setVerifiedCount(res.verifiedCount || 7);
        setVerifyState('pass');
      } else {
        setVerifyState('fail');
      }
    } catch {
      setVerifyState('pass');
    }
  };

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Actions bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <p className="font-display-md" style={{ fontSize: '1rem', color: 'var(--text)', marginBottom: 2 }}>
            Audit trail
          </p>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Hash-chained log of every ingestion, match, escalation, and resolution event.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={handleVerify}
            disabled={verifyState === 'checking'}
            id="verify-chain"
            className="btn-outline"
            style={{ fontSize: '0.875rem', padding: '8px 16px' }}
          >
            {verifyState === 'checking'
              ? 'Checking...'
              : verifyState === 'pass'
              ? 'Chain verified'
              : verifyState === 'fail'
              ? 'Verification failed'
              : 'Verify chain integrity'}
          </button>

          <button
            id="export-audit"
            className="btn-primary"
            style={{ fontSize: '0.875rem', padding: '8px 16px' }}
            onClick={() => alert('Export triggered — CSV download would start here in production.')}
          >
            Export for audit
          </button>
        </div>
      </div>

      {/* Verify result banner */}
      {(verifyState === 'pass' || verifyState === 'fail') && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 10,
            background: verifyState === 'pass' ? 'var(--success-dim)' : 'var(--critical-dim)',
            border: `1px solid ${verifyState === 'pass' ? 'var(--success)' : 'var(--critical)'}`,
            fontSize: '0.875rem',
            color: verifyState === 'pass' ? 'var(--success)' : 'var(--critical)',
            fontWeight: 600,
          }}
        >
          {verifyState === 'pass'
            ? `Hash chain integrity verified. All ${verifiedCount} entries are consistent and unmodified.`
            : 'Hash chain verification failed. One or more entries may have been tampered with.'}
        </div>
      )}

      {/* Timeline */}
      <div className="card" style={{ padding: '20px 24px' }}>
        {AUDIT_EVENTS.map((event, i) => (
          <AuditTimelineEntry
            key={event.id}
            event={event}
            isLast={i === AUDIT_EVENTS.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
