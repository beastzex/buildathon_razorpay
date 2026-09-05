'use client';

import { useState, useEffect } from 'react';
import { TRANSACTIONS } from '@/lib/mock-data';
import { ExceptionCard } from '@/components/shared/ExceptionCard';
import { fetchRootCauses, resolveAllPatternExceptions, type RootCausePattern } from '@/lib/api';

export function ExceptionsScreen() {
  const exceptions = TRANSACTIONS.filter((t) => t.status !== 'matched');
  const [resolved, setResolved] = useState<Set<string>>(new Set());
  const [log, setLog] = useState<{ id: string; action: string; at: string }[]>([]);
  const [patterns, setPatterns] = useState<RootCausePattern[]>([]);
  const [selectedPattern, setSelectedPattern] = useState<RootCausePattern | null>(null);
  const [isBulkResolving, setIsBulkResolving] = useState(false);

  useEffect(() => {
    async function loadPatterns() {
      try {
        const pts = await fetchRootCauses('batch-214');
        setPatterns(pts || []);
      } catch {}
    }
    loadPatterns();
  }, []);

  const handleConfirm = async (id: string) => {
    setResolved((prev) => new Set([...prev, id]));
    setLog((prev) => [
      {
        id,
        action: 'Confirmed match',
        at: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }),
      },
      ...prev,
    ]);
    try {
      const { resolveException } = await import('@/lib/api');
      await resolveException(id, 'confirm');
    } catch {}
  };

  const handleMismatch = async (id: string) => {
    setResolved((prev) => new Set([...prev, id]));
    setLog((prev) => [
      {
        id,
        action: 'Marked as mismatch',
        at: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }),
      },
      ...prev,
    ]);
    try {
      const { resolveException } = await import('@/lib/api');
      await resolveException(id, 'reject');
    } catch {}
  };

  const handleResolveAllPattern = async (pattern: RootCausePattern) => {
    setIsBulkResolving(true);
    try {
      await resolveAllPatternExceptions('batch-214', pattern.pattern_id, pattern.supporting_record_ids);
      
      const newResolved = new Set(resolved);
      pattern.supporting_record_ids.forEach((id) => newResolved.add(id));
      setResolved(newResolved);

      const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
      setLog((prev) => [
        {
          id: `BULK [${pattern.pattern_id}]`,
          action: `Resolved all ${pattern.supporting_record_ids.length} records via root cause`,
          at: timeStr,
        },
        ...prev,
      ]);
      setSelectedPattern(null);
    } catch {
      alert('Bulk resolution error.');
    } finally {
      setIsBulkResolving(false);
    }
  };

  const remaining = exceptions.filter((e) => !resolved.has(e.id));

  // Map each transaction to its discovered pattern
  const getPatternForRecord = (recordId: string) => {
    return patterns.find((p) => p.supporting_record_ids.includes(recordId));
  };

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Summary Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <p className="font-display-md" style={{ fontSize: '1rem', color: 'var(--text)', marginBottom: 2 }}>
            Exception queue
          </p>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            {remaining.length} of {exceptions.length} remaining — resolve individually or resolve systemic patterns in bulk.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {patterns.length > 0 && (
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#38bdf8',
                background: 'rgba(56, 189, 248, 0.12)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                padding: '4px 12px',
                borderRadius: 100,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <span>✦</span>
              <span>{patterns.length} Systemic Pattern(s) Detected</span>
            </span>
          )}
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
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(0, 280px)', gap: 20, alignItems: 'flex-start' }}>
        {/* Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {remaining.length === 0 ? (
            <div className="card" style={{ padding: '40px 24px', textAlign: 'center' }}>
              <p style={{ fontSize: '1rem', color: 'var(--text)', fontWeight: 600, marginBottom: 6 }}>
                All exceptions resolved.
              </p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Nothing needs your attention.
              </p>
            </div>
          ) : (
            remaining.map((record) => (
              <ExceptionCard
                key={record.id}
                record={record}
                pattern={getPatternForRecord(record.id)}
                onConfirm={handleConfirm}
                onMismatch={handleMismatch}
                onOpenPatternModal={(p) => setSelectedPattern(p)}
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
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>No actions yet.</p>
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

      {/* Root-Cause Pattern Investigation Modal (Tier 3A) */}
      {selectedPattern && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 150,
            padding: 24,
          }}
          onClick={() => setSelectedPattern(null)}
        >
          <div
            className="brutal-card"
            style={{
              maxWidth: 680,
              width: '100%',
              padding: 28,
              background: 'var(--surface)',
              border: '2px solid #0D0D11',
              boxShadow: '6px 6px 0px #0D0D11',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '1.3rem' }}>✦</span>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text)' }}>
                    Multi-Hop Root-Cause Investigation
                  </h3>
                  <p className="font-mono-id" style={{ fontSize: '0.75rem', color: '#0284c7', marginTop: 2, fontWeight: 700 }}>
                    {selectedPattern.pattern_id} • Signature: {selectedPattern.pattern_signature}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPattern(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '1.3rem',
                  fontWeight: 800,
                }}
              >
                ✕
              </button>
            </div>

            {/* Hypothesis Box */}
            <div
              style={{
                padding: '14px 16px',
                borderRadius: 8,
                background: 'rgba(56, 189, 248, 0.08)',
                borderLeft: '4px solid #0284c7',
                border: '1.5px solid #0284c7',
                borderLeftWidth: '5px',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'SF Mono', monospace" }}>
                Diagnosed Systemic Cause
              </span>
              <p style={{ fontSize: '0.875rem', color: 'var(--text)', lineHeight: 1.5, fontWeight: 600 }}>
                {selectedPattern.hypothesis}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4, fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                <span>Confidence: <strong style={{ color: 'var(--text)' }}>{Math.round(selectedPattern.confidence * 100)}%</strong></span>
                <span>Category: <strong style={{ color: 'var(--text)' }}>{selectedPattern.root_cause_category}</strong></span>
              </div>
            </div>

            {/* Step-by-Step Investigation Trace Reveal */}
            <div>
              <p style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--text)', marginBottom: 10 }}>
                Autonomous Investigation Trace (Tool-Call Sequence):
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {selectedPattern.investigation_trace.map((step, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 8,
                      background: 'var(--bg)',
                      border: '1.5px solid #0D0D11',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: 4,
                        background: '#0D0D11',
                        color: '#FFFFFF',
                        marginTop: 1,
                        fontFamily: "'SF Mono', monospace",
                      }}
                    >
                      Step {idx + 1}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text)', lineHeight: 1.4, fontFamily: "'SF Mono', monospace", fontWeight: 600 }}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Affected Records Section */}
            <div>
              <p style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>
                Verified Supporting Records ({selectedPattern.supporting_record_ids.length} transactions):
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {selectedPattern.supporting_record_ids.map((id) => (
                  <span
                    key={id}
                    className="font-mono-id"
                    style={{
                      padding: '4px 10px',
                      borderRadius: 6,
                      background: 'var(--bg)',
                      border: '1.5px solid #0D0D11',
                      fontSize: '0.75rem',
                      color: '#FE4A23',
                      fontWeight: 800,
                    }}
                  >
                    {id}
                  </span>
                ))}
              </div>
            </div>

            {/* Footer / Bulk Action */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '2px solid #0D0D11', paddingTop: 16 }}>
              <button
                onClick={() => setSelectedPattern(null)}
                className="brutal-btn"
                style={{ padding: '8px 18px', fontSize: '0.8125rem' }}
              >
                Close
              </button>

              <button
                onClick={() => handleResolveAllPattern(selectedPattern)}
                disabled={isBulkResolving}
                className="btn-primary"
                style={{
                  padding: '8px 20px',
                  fontSize: '0.8125rem',
                  background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                {isBulkResolving ? (
                  <>
                    <span className="spinner" style={{ width: 14, height: 14 }} />
                    Sealing Bulk Resolution...
                  </>
                ) : (
                  <>⚡ Resolve All {selectedPattern.supporting_record_ids.length} At Once</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

