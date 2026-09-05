'use client';

import { useState } from 'react';
import { type TransactionRecord } from '@/lib/mock-data';
import { ConfidenceBar } from './ConfidenceBar';
import { StatusDot } from './StatusDot';

interface ExceptionCardProps {
  record: TransactionRecord;
  onConfirm: (id: string) => void;
  onMismatch: (id: string) => void;
}

export function ExceptionCard({ record, onConfirm, onMismatch }: ExceptionCardProps) {
  const [leaving, setLeaving] = useState(false);

  const handleAction = (action: 'confirm' | 'mismatch') => {
    setLeaving(true);
    setTimeout(() => {
      if (action === 'confirm') onConfirm(record.id);
      else onMismatch(record.id);
    }, 280);
  };

  return (
    <div
      className="card"
      style={{
        padding: '20px 24px',
        transition: 'opacity 0.28s ease, transform 0.28s ease, max-height 0.28s ease',
        opacity: leaving ? 0 : 1,
        transform: leaving ? 'translateX(16px)' : 'none',
        overflow: 'hidden',
        maxHeight: leaving ? 0 : 800,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <StatusDot status={record.status} showLabel={true} />
          <span className="font-mono-id" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            {record.id}
          </span>
        </div>
        <ConfidenceBar value={record.confidence} />
      </div>

      {/* Record comparison */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
          marginBottom: 16,
        }}
      >
        {/* Source A */}
        <div
          style={{
            padding: '12px 14px',
            background: 'var(--bg)',
            borderRadius: 10,
            border: '1px solid var(--border)',
          }}
        >
          <p style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--data)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Bank
          </p>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text)', fontWeight: 600, marginBottom: 4 }}>
            ₹{record.sourceA.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 2 }}>
            {record.sourceA.description}
          </p>
          <p className="font-mono-id" style={{ fontSize: '0.7rem', color: 'var(--text-faint)' }}>
            {record.sourceA.reference}
          </p>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-faint)', marginTop: 4 }}>
            {new Date(record.sourceA.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        </div>

        {/* Source B */}
        <div
          style={{
            padding: '12px 14px',
            background: 'var(--bg)',
            borderRadius: 10,
            border: '1px solid var(--border)',
          }}
        >
          <p style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--brand)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Gateway
          </p>
          <p
            style={{
              fontSize: '0.8125rem',
              color: record.sourceA.amount !== record.sourceB.amount ? 'var(--warning)' : 'var(--text)',
              fontWeight: 600,
              marginBottom: 4,
            }}
          >
            ₹{record.sourceB.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 2 }}>
            {record.sourceB.description}
          </p>
          <p className="font-mono-id" style={{ fontSize: '0.7rem', color: 'var(--text-faint)' }}>
            {record.sourceB.reference}
          </p>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-faint)', marginTop: 4 }}>
            {new Date(record.sourceB.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* AI Explanation */}
      {record.explanation ? (
        <div
          style={{
            padding: '12px 14px',
            background: record.status === 'mismatched' ? 'var(--critical-dim)' : 'var(--warning-dim)',
            borderRadius: 10,
            borderLeft: `3px solid ${record.status === 'mismatched' ? 'var(--critical)' : 'var(--warning)'}`,
            marginBottom: 16,
          }}
        >
          <p style={{ fontSize: '0.8125rem', lineHeight: 1.6, color: 'var(--text)' }}>
            {record.explanation}
          </p>
        </div>
      ) : (
        <div
          style={{
            padding: '10px 14px',
            background: 'var(--surface-hover)',
            borderRadius: 8,
            marginBottom: 16,
            fontSize: '0.8125rem',
            color: 'var(--text-muted)',
          }}
        >
          AI explanation unavailable — flagged for manual review.
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={() => handleAction('confirm')}
          className="btn-primary"
          style={{ fontSize: '0.875rem', padding: '8px 18px' }}
          id={`confirm-${record.id}`}
        >
          Confirm match
        </button>
        <button
          onClick={() => handleAction('mismatch')}
          className="btn-outline"
          style={{
            fontSize: '0.875rem',
            padding: '8px 18px',
            borderColor: 'var(--critical)',
            color: 'var(--critical)',
          }}
          id={`mismatch-${record.id}`}
        >
          Mark as mismatch
        </button>
      </div>
    </div>
  );
}
