'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Download,
  Zap,
  ArrowRight,
  Search,
  Filter,
  RefreshCw,
  Database,
  Building2,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Layers,
  ArrowUpRight,
  Activity,
  Server
} from 'lucide-react';

interface RecordItem {
  id: string;
  merchant_name: string;
  merchant_category: string;
  payment_rail: string;
  bank_name: string;
  gateway_name: string;
  gross_amount: number;
  fee_amount: number;
  status: string;
  anomaly_flag: boolean;
  anomaly_category: string;
  sourceA: {
    id: string;
    amount: number;
    date: string;
    reference: string;
    description: string;
  };
  sourceB: {
    id: string;
    amount: number;
    date: string;
    reference: string;
    description: string;
  };
}

interface DatasetSummary {
  total_count: number;
  total_gross_volume_inr: number;
  total_fees_inr: number;
  anomaly_rate_pct: number;
  rail_distribution: Record<string, number>;
  anomaly_distribution: Record<string, number>;
}

export default function ExternalDataPortalPage() {
  const [summary, setSummary] = useState<DatasetSummary | null>(null);
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRail, setSelectedRail] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [onlyAnomalies, setOnlyAnomalies] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFiltered, setTotalFiltered] = useState(0);

  // Streaming modal state
  const [isStreamingModalOpen, setIsStreamingModalOpen] = useState(false);
  const [streamingProgress, setStreamingProgress] = useState(0);
  const [isStreamingActive, setIsStreamingActive] = useState(false);
  const [streamStats, setStreamStats] = useState<{
    ingested: number;
    rps: number;
    duration: number;
    matched: number;
    flagged: number;
    mismatched: number;
  } | null>(null);

  const fetchDataset = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        page_size: '25',
        only_anomalies: String(onlyAnomalies)
      });
      if (selectedRail !== 'all') params.append('rail', selectedRail);
      if (selectedStatus !== 'all') params.append('status', selectedStatus);
      if (search.trim()) params.append('search', search.trim());

      const res = await fetch(`http://localhost:8000/batches/external-10k-dataset?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setSummary(data.summary);
        setRecords(data.records);
        setTotalPages(data.total_pages);
        setTotalFiltered(data.total_filtered);
      }
    } catch (err) {
      console.error('Failed to load external dataset:', err);
    } finally {
      setLoading(false);
    }
  }, [page, selectedRail, selectedStatus, search, onlyAnomalies]);

  useEffect(() => {
    fetchDataset();
  }, [fetchDataset]);

  const handleDownloadCsv = () => {
    window.open('http://localhost:8000/batches/external-10k-dataset/csv', '_blank');
  };

  const startLiveStream = async (targetCount: number = 10000) => {
    setIsStreamingActive(true);
    setStreamingProgress(5);
    setStreamStats(null);

    // Simulate animated progressive increment while backend processes
    const timer = setInterval(() => {
      setStreamingProgress((prev) => {
        if (prev >= 92) return prev;
        return prev + Math.floor(Math.random() * 12) + 6;
      });
    }, 280);

    try {
      const res = await fetch('http://localhost:8000/batches/external-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: targetCount, chunk_size: 1000 })
      });
      clearInterval(timer);
      if (res.ok) {
        const data = await res.json();
        setStreamingProgress(100);
        setStreamStats({
          ingested: data.records_ingested,
          rps: data.throughput_rps,
          duration: data.duration_seconds,
          matched: data.matched_count,
          flagged: data.flagged_count,
          mismatched: data.mismatched_count
        });
      }
    } catch (err) {
      clearInterval(timer);
      console.error('Streaming ingestion error:', err);
    } finally {
      setIsStreamingActive(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0F1117', color: '#F3F4F6', fontFamily: 'var(--font-sans, system-ui, sans-serif)' }}>
      {/* Top Banner */}
      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(15,17,23,0.95)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #FE4A23, #FF8C00)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(254,74,35,0.35)' }}>
              <Building2 size={22} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#FFFFFF' }}>FinStream Global Clearinghouse</span>
                <span style={{ fontSize: '0.72rem', background: 'rgba(254,74,35,0.15)', color: '#FE4A23', padding: '2px 8px', borderRadius: 999, fontWeight: 700, border: '1px solid rgba(254,74,35,0.3)' }}>
                  EXTERNAL PROVIDER FEED
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>Simulated enterprise payment clearing system generating high-velocity multi-source transaction batches</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link
              href="/dashboard/reconciliation"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 18px',
                borderRadius: 999,
                background: '#1F2430',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#E5E7EB',
                fontSize: '0.86rem',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'all 0.2s'
              }}
            >
              <span>Switch to Ledgr AI Controller</span>
              <ArrowRight size={15} />
            </Link>

            <button
              onClick={() => setIsStreamingModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 20px',
                borderRadius: 999,
                background: '#FE4A23',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(254,74,35,0.4)',
                transition: 'transform 0.15s, background 0.15s'
              }}
            >
              <Zap size={16} fill="#FFFFFF" />
              <span>Transmit Stream to Ledgr (10K)</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px' }}>
        {/* KPI Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 28 }}>
          <div style={{ background: '#161922', borderRadius: 18, padding: '22px 24px', border: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Available Dataset Size</span>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#FFFFFF', marginTop: 4, letterSpacing: '-0.03em' }}>
                  {summary ? summary.total_count.toLocaleString() : '10,000'}
                </div>
              </div>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Database size={20} color="#FE4A23" />
              </div>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: 8 }}>10,000 complete multi-rail payment rows synthesized</p>
          </div>

          <div style={{ background: '#161922', borderRadius: 18, padding: '22px 24px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Gross Volume</span>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#FE4A23', marginTop: 4, letterSpacing: '-0.03em' }}>
                  ₹{summary ? (summary.total_gross_volume_inr / 10000000).toFixed(2) : '74.46'} Cr
                </div>
              </div>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(254,74,35,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={20} color="#FE4A23" />
              </div>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: 8 }}>Combined clearing value across all partner merchant accounts</p>
          </div>

          <div style={{ background: '#161922', borderRadius: 18, padding: '22px 24px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Controlled Anomaly Rate</span>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#FFD028', marginTop: 4, letterSpacing: '-0.03em' }}>
                  {summary ? `${summary.anomaly_rate_pct}%` : '18.3%'}
                </div>
              </div>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,208,40,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={20} color="#FFD028" />
              </div>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: 8 }}>Injected fee drift, settlement lag, and chargeback anomalies</p>
          </div>

          <div style={{ background: '#161922', borderRadius: 18, padding: '22px 24px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Clearing Network Health</span>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#10B981', marginTop: 4, letterSpacing: '-0.03em' }}>
                  99.98%
                </div>
              </div>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Activity size={20} color="#10B981" />
              </div>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: 8 }}>Sub-millisecond simulated transaction dispatch socket</p>
          </div>
        </div>

        {/* Action Controls & Filters Bar */}
        <div style={{ background: '#161922', borderRadius: 18, padding: '18px 24px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            {/* Search Box */}
            <div style={{ position: 'relative', minWidth: 320 }}>
              <Search size={17} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
              <input
                type="text"
                placeholder="Search transaction ID, merchant, bank, gateway, or amount..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 40px',
                  borderRadius: 999,
                  background: '#0F1117',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#FFFFFF',
                  fontSize: '0.86rem',
                  outline: 'none'
                }}
              />
            </div>

            {/* Rail Filters */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto' }}>
              {['all', 'UPI', 'Credit Card', 'Debit Card', 'NetBanking', 'NEFT/RTGS'].map((rail) => (
                <button
                  key={rail}
                  onClick={() => { setSelectedRail(rail); setPage(1); }}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 999,
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: selectedRail === rail ? '#FE4A23' : 'rgba(255,255,255,0.05)',
                    color: selectedRail === rail ? '#FFFFFF' : '#9CA3AF',
                    border: '1px solid ' + (selectedRail === rail ? '#FE4A23' : 'rgba(255,255,255,0.08)'),
                    transition: 'all 0.15s'
                  }}
                >
                  {rail === 'all' ? 'All Payment Rails' : rail}
                </button>
              ))}
            </div>

            {/* Status Filter & CSV Download */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: '#D1D5DB', cursor: 'pointer', userSelect: 'none' }}>
                <input
                  type="checkbox"
                  checked={onlyAnomalies}
                  onChange={(e) => { setOnlyAnomalies(e.target.checked); setPage(1); }}
                  style={{ accentColor: '#FE4A23' }}
                />
                <span>Anomalies Only</span>
              </label>

              <button
                onClick={handleDownloadCsv}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 16px',
                  borderRadius: 999,
                  background: '#1F2430',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#E5E7EB',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Download size={14} />
                <span>Export 10,000 CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* Transaction Explorer Table */}
        <div style={{ background: '#161922', borderRadius: 18, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Layers size={18} color="#FE4A23" />
              <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#FFFFFF' }}>Transaction Data Feed ({totalFiltered.toLocaleString()} matching records)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: '#9CA3AF' }}>
              <span>Page {page} of {totalPages}</span>
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                style={{ padding: '4px 10px', borderRadius: 6, background: '#0F1117', border: '1px solid rgba(255,255,255,0.1)', color: page <= 1 ? '#4B5563' : '#E5E7EB', cursor: page <= 1 ? 'not-allowed' : 'pointer' }}
              >
                Prev
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                style={{ padding: '4px 10px', borderRadius: 6, background: '#0F1117', border: '1px solid rgba(255,255,255,0.1)', color: page >= totalPages ? '#4B5563' : '#E5E7EB', cursor: page >= totalPages ? 'not-allowed' : 'pointer' }}
              >
                Next
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)', color: '#9CA3AF' }}>
                  <th style={{ padding: '12px 20px', fontWeight: 600 }}>RECORD ID</th>
                  <th style={{ padding: '12px 20px', fontWeight: 600 }}>MERCHANT & SECTOR</th>
                  <th style={{ padding: '12px 20px', fontWeight: 600 }}>PAYMENT RAIL</th>
                  <th style={{ padding: '12px 20px', fontWeight: 600 }}>BANK & GATEWAY</th>
                  <th style={{ padding: '12px 20px', fontWeight: 600 }}>GROSS AMOUNT</th>
                  <th style={{ padding: '12px 20px', fontWeight: 600 }}>GATEWAY FEE</th>
                  <th style={{ padding: '12px 20px', fontWeight: 600 }}>SETTLEMENT STATUS</th>
                  <th style={{ padding: '12px 20px', fontWeight: 600 }}>ANOMALY CATEGORY</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '48px', textAlign: 'center', color: '#9CA3AF' }}>
                      <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px' }} />
                      <p>Loading enterprise transactions from FinStream database...</p>
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '48px', textAlign: 'center', color: '#9CA3AF' }}>
                      No records found matching your filters.
                    </td>
                  </tr>
                ) : (
                  records.map((r) => {
                    const statusColor = r.status === 'matched' ? '#10B981' : (r.status === 'flagged' ? '#F59E0B' : '#EF4444');
                    const statusBg = r.status === 'matched' ? 'rgba(16,185,129,0.1)' : (r.status === 'flagged' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)');
                    return (
                      <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}>
                        <td style={{ padding: '14px 20px', fontFamily: 'monospace', fontWeight: 600, color: '#FFFFFF' }}>{r.id}</td>
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ fontWeight: 600, color: '#E5E7EB' }}>{r.merchant_name}</div>
                          <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>{r.merchant_category}</div>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <span style={{ padding: '3px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.06)', fontSize: '0.75rem', fontWeight: 600 }}>
                            {r.payment_rail}
                          </span>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ color: '#D1D5DB' }}>{r.bank_name} Bank</div>
                          <div style={{ fontSize: '0.72rem', color: '#FE4A23' }}>via {r.gateway_name}</div>
                        </td>
                        <td style={{ padding: '14px 20px', fontWeight: 700, color: '#FFFFFF' }}>
                          ₹{r.gross_amount.toLocaleString()}
                        </td>
                        <td style={{ padding: '14px 20px', color: '#9CA3AF' }}>
                          ₹{r.fee_amount.toFixed(2)}
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 999, fontSize: '0.74rem', fontWeight: 700, background: statusBg, color: statusColor }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor }} />
                            {r.status.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          {r.anomaly_flag ? (
                            <span style={{ color: '#F59E0B', fontSize: '0.76rem', fontWeight: 600 }}>
                              {r.anomaly_category.replace(/_/g, ' ')}
                            </span>
                          ) : (
                            <span style={{ color: '#6B7280', fontSize: '0.76rem' }}>Clean reconciliation</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Streaming Modal Drawer */}
      {isStreamingModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
          <div style={{ background: '#161922', borderRadius: 24, border: '1px solid rgba(254,74,35,0.3)', width: '100%', maxWidth: 580, padding: 32, boxShadow: '0 20px 50px rgba(0,0,0,0.6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FE4A23', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Zap size={20} color="#FFFFFF" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>Transmit Stream to Ledgr Pipeline</h3>
                  <p style={{ fontSize: '0.78rem', color: '#9CA3AF', margin: 0 }}>Push 10,000 live payment rows through the real-time AI reconciliation engine</p>
                </div>
              </div>
              <button
                onClick={() => setIsStreamingModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: '1.4rem' }}
              >
                ×
              </button>
            </div>

            {/* Progress Bar Container */}
            <div style={{ margin: '24px 0', background: '#0F1117', padding: 20, borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: '0.85rem' }}>
                <span style={{ color: '#9CA3AF' }}>Pipeline Ingestion Progress</span>
                <span style={{ color: '#FE4A23', fontWeight: 700 }}>{streamingProgress}%</span>
              </div>
              <div style={{ width: '100%', height: 10, background: 'rgba(255,255,255,0.08)', borderRadius: 999, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${streamingProgress}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #FE4A23, #FF8C00)',
                    borderRadius: 999,
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>

              {streamStats && (
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, textAlign: 'center' }}>
                  <div style={{ background: '#161922', padding: 10, borderRadius: 10 }}>
                    <div style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>Throughput</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10B981' }}>{streamStats.rps} tx/sec</div>
                  </div>
                  <div style={{ background: '#161922', padding: 10, borderRadius: 10 }}>
                    <div style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>Auto-Matched</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FE4A23' }}>{streamStats.matched}</div>
                  </div>
                  <div style={{ background: '#161922', padding: 10, borderRadius: 10 }}>
                    <div style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>Anomalies Flagged</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F59E0B' }}>{streamStats.flagged + streamStats.mismatched}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                disabled={isStreamingActive}
                onClick={() => startLiveStream(10000)}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: 999,
                  background: isStreamingActive ? '#4B5563' : '#FE4A23',
                  border: 'none',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  cursor: isStreamingActive ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
              >
                {isStreamingActive ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    <span>Streaming Ingestion in Progress...</span>
                  </>
                ) : (
                  <>
                    <Zap size={18} />
                    <span>{streamingProgress === 100 ? 'Re-Stream 10,000 Records' : 'Launch 10,000-Record Live Stream'}</span>
                  </>
                )}
              </button>

              <Link
                href="/dashboard/reconciliation?batch=batch-external-stream"
                style={{
                  padding: '14px 24px',
                  borderRadius: 999,
                  background: '#1F2430',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '0.92rem',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <span>View in Ledgr</span>
                <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
