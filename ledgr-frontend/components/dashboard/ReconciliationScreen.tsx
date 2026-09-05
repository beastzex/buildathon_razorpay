'use client';

import { useState, useEffect } from 'react';
import { TRANSACTIONS, type TransactionRecord, type RecordStatus } from '@/lib/mock-data';
import { StatusDot } from '@/components/shared/StatusDot';
import { ConfidenceBar } from '@/components/shared/ConfidenceBar';
import { RecordDetailPanel } from '@/components/shared/RecordDetailPanel';
import { LiveTickerScreen } from '@/components/dashboard/LiveTickerScreen';

const STATUS_OPTIONS: { label: string; value: RecordStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Matched', value: 'matched' },
  { label: 'Flagged', value: 'flagged' },
  { label: 'Mismatched', value: 'mismatched' },
];

export function ReconciliationScreen() {
  // Master Prompt: Live ticker is the default primary screen on the Reconciliation view
  const [activeTab, setActiveTab] = useState<'ticker' | 'table'>('ticker');
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
      {/* Surface Mode Tab Switcher */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '2px solid var(--border-strong)',
          paddingBottom: 16,
          flexWrap: 'wrap',
          gap: 12
        }}
      >
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('ticker')}
            id="tab-live-ticker"
            className="brutal-btn"
            style={{
              padding: '9px 18px',
              borderColor: '#0D0D11',
              background: activeTab === 'ticker' ? '#FE4A23' : 'var(--surface)',
              color: activeTab === 'ticker' ? '#FFFFFF' : 'var(--text)',
              boxShadow: activeTab === 'ticker' ? '3px 3px 0px #0D0D11' : '2px 2px 0px var(--border-strong)',
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: activeTab === 'ticker' ? '#FFD028' : '#10B981',
                boxShadow: '0 0 6px currentColor'
              }}
            />
            LIVE AGENT RELAY & TICKER
          </button>

          <button
            onClick={() => setActiveTab('table')}
            id="tab-browse-table"
            className="brutal-btn"
            style={{
              padding: '9px 18px',
              borderColor: '#0D0D11',
              background: activeTab === 'table' ? '#0D0D11' : 'var(--surface)',
              color: activeTab === 'table' ? '#FFFFFF' : 'var(--text)',
              boxShadow: activeTab === 'table' ? '3px 3px 0px #FE4A23' : '2px 2px 0px var(--border-strong)',
            }}
          >
            <span>📋</span>
            BROWSE RECORDS ({records.length})
          </button>

          <a
            href="/portal"
            id="tab-stream-portal"
            className="brutal-btn"
            style={{
              padding: '9px 18px',
              borderColor: '#0D0D11',
              background: '#FFD028',
              color: '#0D0D11',
              boxShadow: '3px 3px 0px #0D0D11',
            }}
          >
            <span>⚡</span>
            STREAM 10K ROWS (PORTAL)
          </a>
        </div>

        <span
          className="brutal-badge"
          style={{
            fontSize: '0.76rem',
            background: 'var(--surface)',
            color: 'var(--text)',
            borderColor: 'var(--border-strong)',
            padding: '6px 12px'
          }}
        >
          ACTIVE: <strong style={{ color: '#FE4A23', marginLeft: 4 }}>BATCH #214 / #STREAM</strong>
        </span>
      </div>

      {/* Conditional View: Live Ticker or Table Grid */}
      {activeTab === 'ticker' ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <LiveTickerScreen batchId="batch-214" />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
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
      )}
    </div>
  );
}
