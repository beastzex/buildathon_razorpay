'use client';

import { useState, useEffect } from 'react';
import { TRANSACTIONS, type TransactionRecord, type RecordStatus } from '@/lib/mock-data';
import { StatusDot } from '@/components/shared/StatusDot';
import { ConfidenceBar } from '@/components/shared/ConfidenceBar';
import { RecordDetailPanel } from '@/components/shared/RecordDetailPanel';

const STATUS_OPTIONS: { label: string; value: RecordStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Matched', value: 'matched' },
  { label: 'Flagged', value: 'flagged' },
  { label: 'Mismatched', value: 'mismatched' },
];

export function ReconciliationScreen() {
  const [records, setRecords] = useState<TransactionRecord[]>(TRANSACTIONS);
  const [statusFilter, setStatusFilter] = useState<RecordStatus | 'all'>('all');
  const [selectedRecord, setSelectedRecord] = useState<TransactionRecord | null>(null);

  useEffect(() => {
    async function loadLiveRecords() {
      try {
        const { fetchBatchRecords } = await import('@/lib/api');
        const res = await fetchBatchRecords('batch-214');
        if (res.records && res.records.length > 0) {
          setRecords(res.records);
        }
      } catch {
        // Keep default mock transactions
      }
    }
    loadLiveRecords();
  }, []);

  const filtered = records.filter(t =>
    statusFilter === 'all' ? true : t.status === statusFilter
  );

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
      {/* Filter bar */}
      <div
        className="card"
        style={{
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500 }}>Filter:</span>
        <div style={{ display: 'flex', gap: 6 }}>
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              id={`filter-${opt.value}`}
              style={{
                padding: '5px 14px',
                borderRadius: 100,
                border: '1px solid',
                fontSize: '0.8125rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                borderColor: statusFilter === opt.value ? 'var(--brand)' : 'var(--border)',
                background: statusFilter === opt.value ? 'var(--brand-dim)' : 'transparent',
                color: statusFilter === opt.value ? 'var(--brand)' : 'var(--text-muted)',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <span style={{ marginLeft: 'auto', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          {filtered.length} record{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div className="card" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {filtered.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: 40,
            }}
          >
            <p style={{ fontSize: '1rem', color: 'var(--text)', fontWeight: 600 }}>
              All records matched.
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Nothing needs your attention.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', overflowY: 'auto', flex: 1 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Bank description</th>
                  <th>Gateway description</th>
                  <th>Amount (Bank)</th>
                  <th>Confidence</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(record => (
                  <tr
                    key={record.id}
                    onClick={() => setSelectedRecord(record)}
                    id={`row-${record.id}`}
                    aria-label={`View details for ${record.id}`}
                  >
                    <td>
                      <span className="font-mono-id" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {record.id}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text)', fontSize: '0.8125rem', maxWidth: 200 }}>
                      <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {record.sourceA.description}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text)', fontSize: '0.8125rem', maxWidth: 200 }}>
                      <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {record.sourceB.description}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text)' }}>
                        ₹{record.sourceA.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td>
                      <ConfidenceBar value={record.confidence} />
                    </td>
                    <td>
                      <StatusDot status={record.status} showLabel={true} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <RecordDetailPanel
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
      />
    </div>
  );
}
