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
  const [showDebate, setShowDebate] = useState(false);

  const handleAction = (action: 'confirm' | 'mismatch') => {
    setLeaving(true);
    setTimeout(() => {
      if (action === 'confirm') onConfirm(record.id);
      else onMismatch(record.id);
    }, 280);
  };

  const dt = record.debate_transcript;

  return (
    <div
      className="card"
      style={{
        padding: '20px 24px',
        transition: 'opacity 0.28s ease, transform 0.28s ease, max-height 0.28s ease',
        opacity: leaving ? 0 : 1,
        transform: leaving ? 'translateX(16px)' : 'none',
        overflow: 'hidden',
        maxHeight: leaving ? 0 : 1200,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <StatusDot status={record.status} showLabel={true} />
          <span className="font-mono-id" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            {record.id}
          </span>
          {dt && (
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 4,
                background: 'rgba(244, 63, 94, 0.12)',
                color: '#fb7185',
                border: '1px solid rgba(244, 63, 94, 0.3)',
              }}
            >
              ⚖ AI DEBATED
            </span>
          )}
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

      {/* AI Debate Section (Tier 2) */}
      {dt && (
        <div style={{ marginBottom: 16 }}>
          <button
            onClick={() => setShowDebate(!showDebate)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 6,
              background: 'rgba(244, 63, 94, 0.08)',
              border: '1px solid rgba(244, 63, 94, 0.25)',
              color: '#fb7185',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>⚖ AI Consensus Debate Breakdown ({dt.rounds} Rounds)</span>
            <span>{showDebate ? '▲ Hide Debate' : '▼ Expand Debate'}</span>
          </button>

          {showDebate && (
            <div
              style={{
                marginTop: 8,
                padding: 14,
                borderRadius: 8,
                background: '#090b10',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto 1fr',
                  gap: 12,
                  alignItems: 'center',
                }}
              >
                {/* FOR */}
                <div
                  style={{
                    padding: 10,
                    borderRadius: 6,
                    background: 'rgba(16, 185, 129, 0.06)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                  }}
                >
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#34d399', marginBottom: 4 }}>
                    ✓ Advocate FOR
                  </div>
                  <p style={{ fontSize: '0.72rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                    {dt.opinion_for}
                  </p>
                </div>

                {/* VS */}
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    background: '#1e293b',
                    border: '1px solid #f43f5e',
                    color: '#fb7185',
                    fontWeight: 800,
                    fontSize: '0.68rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  VS
                </div>

                {/* AGAINST */}
                <div
                  style={{
                    padding: 10,
                    borderRadius: 6,
                    background: 'rgba(244, 63, 94, 0.06)',
                    border: '1px solid rgba(244, 63, 94, 0.2)',
                  }}
                >
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#fb7185', marginBottom: 4 }}>
                    ✗ Advocate AGAINST
                  </div>
                  <p style={{ fontSize: '0.72rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                    {dt.opinion_against}
                  </p>
                </div>
              </div>

              {dt.resolver_reasoning && (
                <div
                  style={{
                    padding: '8px 10px',
                    borderRadius: 4,
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderLeft: '3px solid #818cf8',
                    fontSize: '0.72rem',
                    color: '#94a3b8',
                  }}
                >
                  <strong style={{ color: '#e2e8f0' }}>Arbiter Reasoning:</strong> {dt.resolver_reasoning}
                </div>
              )}
            </div>
          )}
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
