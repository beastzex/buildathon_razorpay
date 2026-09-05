'use client';

import { type TransactionRecord } from '@/lib/mock-data';
import { ConfidenceBar } from './ConfidenceBar';
import { StatusDot } from './StatusDot';

interface RecordDetailPanelProps {
  record: TransactionRecord | null;
  onClose: () => void;
}

export function RecordDetailPanel({ record, onClose }: RecordDetailPanelProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.3)',
          zIndex: 40,
          opacity: record ? 1 : 0,
          transition: 'opacity 0.25s ease',
          pointerEvents: record ? 'auto' : 'none',
        }}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-label="Record detail"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: 420,
          maxWidth: '95vw',
          height: '100vh',
          background: 'var(--surface)',
          borderLeft: '1px solid var(--border)',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          transform: record ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease',
          overflowY: 'auto',
        }}
      >
        {record && (
          <>
            {/* Panel header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px 24px',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <div>
                <h2
                  className="font-display-md"
                  style={{ fontSize: '1.125rem', color: 'var(--text)', marginBottom: 4 }}
                >
                  Record Detail
                </h2>
                <span className="font-mono-id" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {record.id}
                </span>
              </div>
              <button
                onClick={onClose}
                aria-label="Close panel"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div style={{ padding: '20px 24px', flex: 1 }}>
              {/* Status + Confidence */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <StatusDot status={record.status} showLabel={true} />
                <ConfidenceBar value={record.confidence} />
              </div>

              {/* Source A */}
              <section style={{ marginBottom: 20 }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--data)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Bank record
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    ['Record ID', record.sourceA.id],
                    ['Amount', `₹${record.sourceA.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`],
                    ['Date', new Date(record.sourceA.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })],
                    ['Description', record.sourceA.description],
                    ['Reference', record.sourceA.reference],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', gap: 8 }}>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', minWidth: 90 }}>{k}</span>
                      <span
                        className={k === 'Reference' || k === 'Record ID' ? 'font-mono-id' : undefined}
                        style={{ fontSize: '0.8125rem', color: 'var(--text)', flex: 1, wordBreak: 'break-all' }}
                      >
                        {v}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              <div style={{ height: 1, background: 'var(--border)', marginBottom: 20 }} />

              {/* Source B */}
              <section style={{ marginBottom: 20 }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--brand)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Gateway record
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    ['Record ID', record.sourceB.id],
                    ['Amount', `₹${record.sourceB.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`],
                    ['Date', new Date(record.sourceB.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })],
                    ['Description', record.sourceB.description],
                    ['Reference', record.sourceB.reference],
                  ].map(([k, v]) => {
                    const isAmountDiff = k === 'Amount' && record.sourceA.amount !== record.sourceB.amount;
                    const isDateDiff = k === 'Date' && record.sourceA.date !== record.sourceB.date;
                    return (
                      <div key={k} style={{ display: 'flex', gap: 8 }}>
                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', minWidth: 90 }}>{k}</span>
                        <span
                          className={k === 'Reference' || k === 'Record ID' ? 'font-mono-id' : undefined}
                          style={{
                            fontSize: '0.8125rem',
                            color: (isAmountDiff || isDateDiff) ? 'var(--warning)' : 'var(--text)',
                            flex: 1,
                            wordBreak: 'break-all',
                            fontWeight: (isAmountDiff || isDateDiff) ? 600 : 400,
                          }}
                        >
                          {v}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Explanation */}
              {record.explanation && (
                <>
                  <div style={{ height: 1, background: 'var(--border)', marginBottom: 20 }} />
                  <section>
                    <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      AI explanation
                    </p>
                    <p style={{ fontSize: '0.875rem', lineHeight: 1.65, color: 'var(--text)' }}>
                      {record.explanation}
                    </p>
                  </section>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
