'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  TrendingUp,
  Sliders,
  ShieldAlert,
  Send,
  Camera,
  Layers,
  Scale,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  ArrowUpRight,
  Cpu,
  RefreshCw,
  Zap,
  Info,
  DollarSign
} from 'lucide-react';
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import {
  runWhatIfSimulation,
  askWealthAdvisor,
  verifyMultimodalDocument,
  fetchAgentMesh,
  fetchConsensusDebate,
  type WhatIfRequest,
  type WhatIfResponse,
  type WealthAdvisorResponse,
  type MultimodalVerifyResponse,
  type AgentStatus,
  type ConsensusDebateResponse
} from '@/lib/api';

export function SimulationScreen() {
  const [activeTab, setActiveTab] = useState<'forecast' | 'advisor' | 'whatif' | 'multimodal' | 'debate'>('forecast');

  // ── 1. Simulation States ──
  const [horizon, setHorizon] = useState<number>(30);
  const [volumeMult, setVolumeMult] = useState<number>(1.2);
  const [feeDelta, setFeeDelta] = useState<number>(0.3);
  const [settleDelay, setSettleDelay] = useState<number>(1);
  const [chargebackMult, setChargebackMult] = useState<number>(1.0);
  const [recordCount, setRecordCount] = useState<number>(10000);
  const [simResult, setSimResult] = useState<WhatIfResponse | null>(null);
  const [isSimLoading, setIsSimLoading] = useState<boolean>(false);

  // ── 2. Wealth Advisor States ──
  const [advisorQuery, setAdvisorQuery] = useState<string>('');
  const [advisorResp, setAdvisorResp] = useState<WealthAdvisorResponse | null>(null);
  const [isAdvisorLoading, setIsAdvisorLoading] = useState<boolean>(false);

  // ── 3. Multi-Modal Scanner States ──
  const [selectedSample, setSelectedSample] = useState<string>('sbi_statement');
  const [multimodalResult, setMultimodalResult] = useState<MultimodalVerifyResponse | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  // ── 4. Agent Mesh & Debate States ──
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [debate, setDebate] = useState<ConsensusDebateResponse | null>(null);
  const [isDebateLoading, setIsDebateLoading] = useState<boolean>(false);

  // Run initial simulation
  const executeSimulation = async () => {
    setIsSimLoading(true);
    try {
      const res = await runWhatIfSimulation({
        horizon_days: horizon,
        volume_multiplier: volumeMult,
        gateway_fee_delta_pct: feeDelta,
        settlement_delay_days: settleDelay,
        chargeback_multiplier: chargebackMult,
        historical_rows_count: recordCount
      });
      setSimResult(res);
    } finally {
      setIsSimLoading(false);
    }
  };

  useEffect(() => {
    executeSimulation();
    // Load initial advisor response
    askWealthAdvisor("Provide institutional capital allocation recommendation for current batch", 30)
      .then(setAdvisorResp)
      .catch(console.error);
    // Load initial multi-modal verification
    verifyMultimodalDocument('sbi_statement')
      .then(setMultimodalResult)
      .catch(console.error);
    // Load agent mesh
    fetchAgentMesh().then(setAgents).catch(console.error);
    // Load consensus debate
    fetchConsensusDebate('TXN-4003').then(setDebate).catch(console.error);
  }, []);

  const handleAdvisorSubmit = async (queryText?: string) => {
    const q = queryText || advisorQuery;
    if (!q.trim()) return;
    setIsAdvisorLoading(true);
    try {
      const res = await askWealthAdvisor(q, horizon);
      setAdvisorResp(res);
      setAdvisorQuery('');
    } finally {
      setIsAdvisorLoading(false);
    }
  };

  const handleScanDocument = async (sampleType: string) => {
    setSelectedSample(sampleType);
    setIsScanning(true);
    try {
      const res = await verifyMultimodalDocument(sampleType);
      setMultimodalResult(res);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div style={{ padding: '24px 32px 60px', display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1400, margin: '0 auto' }}>
      
      {/* Neo-Brutalist Header Bar */}
      <div
        className="brutal-card"
        style={{
          padding: '24px 28px',
          background: 'var(--surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <span
              style={{
                background: '#FFD028',
                color: '#0D0D11',
                padding: '4px 10px',
                borderRadius: 6,
                border: '1.5px solid #0D0D11',
                fontFamily: "'SF Mono', monospace",
                fontWeight: 900,
                fontSize: '0.72rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5
              }}
            >
              <Sparkles size={13} color="#0D0D11" />
              <span>GPT-OSS-120B REASONING CORE</span>
            </span>
            <span className="brutal-badge" style={{ color: '#10B981', background: 'rgba(16,185,129,0.1)' }}>
              ● 8 AGENTS IN SYNCH
            </span>
          </div>
          <h1 className="font-display" style={{ fontSize: '1.85rem', margin: 0, color: 'var(--text)' }}>
            Financial Prediction & Wealth Advisor Simulator
          </h1>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
            Realtime Stochastic Forecasting • What-If Stress Testing (10K+ Records) • Multi-Modal Slip OCR • Live Consensus Debate
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={executeSimulation}
            disabled={isSimLoading}
            className="brutal-btn brutal-btn-brand"
            style={{ padding: '10px 20px', fontSize: '0.84rem' }}
          >
            <RefreshCw size={14} className={isSimLoading ? 'animate-spin' : ''} />
            <span>{isSimLoading ? 'CALCULATING...' : 'RERUN SIMULATION'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        {[
          { id: 'forecast', label: 'CASH FLOW FORECAST & WHAT-IF', icon: TrendingUp },
          { id: 'advisor', label: 'WEALTH ADVISOR (GPT-OSS-120B)', icon: Sparkles },
          { id: 'whatif', label: '10K+ RECORD STRESS MATRIX', icon: Sliders },
          { id: 'multimodal', label: 'MULTI-MODAL SLIP SCANNER', icon: Camera },
          { id: 'debate', label: 'LIVE CONSENSUS DEBATE', icon: Scale },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className="brutal-btn"
              style={{
                background: isActive ? '#0D0D11' : 'var(--surface)',
                color: isActive ? '#FFFFFF' : 'var(--text)',
                borderColor: isActive ? 'var(--brand)' : '#0D0D11',
                boxShadow: isActive ? '3px 3px 0px var(--brand)' : '3px 3px 0px #0D0D11',
                padding: '9px 16px',
                fontSize: '0.78rem'
              }}
            >
              <Icon size={14} color={isActive ? '#FFD028' : 'currentColor'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* TAB 1: REALTIME CASH FLOW FORECAST & INTERACTIVE WHAT-IF                 */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'forecast' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Top KPI row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            <div className="brutal-card" style={{ padding: '18px 22px' }}>
              <div style={{ fontSize: '0.72rem', fontFamily: "'SF Mono', monospace", color: 'var(--text-muted)', fontWeight: 800 }}>
                PROJECTED EBITDA IMPACT
              </div>
              <div style={{ fontSize: '2.1rem', fontWeight: 900, color: (simResult?.projected_ebitda_impact_inr || 0) >= 0 ? '#10B981' : '#EF4444', marginTop: 4 }}>
                {(simResult?.projected_ebitda_impact_inr || 0) >= 0 ? '+₹' : '-₹'}
                {Math.abs(simResult?.projected_ebitda_impact_inr || 0).toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 4 }}>
                Across {horizon} days vs. historical baseline
              </div>
            </div>

            <div className="brutal-card" style={{ padding: '18px 22px' }}>
              <div style={{ fontSize: '0.72rem', fontFamily: "'SF Mono', monospace", color: 'var(--text-muted)', fontWeight: 800 }}>
                WORKING CAPITAL RUNWAY
              </div>
              <div style={{ fontSize: '2.1rem', fontWeight: 900, color: '#38BDF8', marginTop: 4 }}>
                {simResult?.working_capital_runway_days || 42} Days
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 4 }}>
                Calculated at scaled OpEx burn rate
              </div>
            </div>

            <div className="brutal-card" style={{ padding: '18px 22px' }}>
              <div style={{ fontSize: '0.72rem', fontFamily: "'SF Mono', monospace", color: 'var(--text-muted)', fontWeight: 800 }}>
                LIQUIDITY RISK GRADE
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#FFD028', marginTop: 8 }}>
                {simResult?.liquidity_risk_grade || 'Grade A (Prime)'}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 4 }}>
                Stochastic stress testing grade
              </div>
            </div>

            <div className="brutal-card" style={{ padding: '18px 22px' }}>
              <div style={{ fontSize: '0.72rem', fontFamily: "'SF Mono', monospace", color: 'var(--text-muted)', fontWeight: 800 }}>
                GATEWAY FEE DRAG
              </div>
              <div style={{ fontSize: '2.1rem', fontWeight: 900, color: '#F97316', marginTop: 4 }}>
                ₹{(simResult?.fee_leakage_inr || 0).toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 4 }}>
                Surcharge & MDR sensitivity
              </div>
            </div>
          </div>

          {/* Interactive Sliders + Main Chart */}
          <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20, alignItems: 'start' }}>
            {/* Left Control Sliders */}
            <div className="brutal-card" style={{ padding: '22px 20px', display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Sliders size={15} />
                  <span>SIMULATION PARAMETERS</span>
                </span>
                <span style={{ fontSize: '0.72rem', fontFamily: "'SF Mono', monospace", color: '#FE4A23', fontWeight: 700 }}>
                  LIVE REALTIME
                </span>
              </div>

              {/* Slider 1: Forecast Horizon */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                  <span>Forecast Horizon</span>
                  <strong style={{ color: 'var(--text)' }}>{horizon} Days</strong>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[7, 14, 30, 60, 90].map((h) => (
                    <button
                      key={h}
                      onClick={() => { setHorizon(h); }}
                      style={{
                        flex: 1,
                        padding: '6px 0',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        borderRadius: 6,
                        border: '1.5px solid #0D0D11',
                        background: horizon === h ? '#FE4A23' : 'var(--bg)',
                        color: horizon === h ? '#FFFFFF' : 'var(--text)',
                        cursor: 'pointer'
                      }}
                    >
                      {h}d
                    </button>
                  ))}
                </div>
              </div>

              {/* Slider 2: Volume Multiplier */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                  <span>Transaction Volume</span>
                  <strong style={{ color: '#10B981' }}>{volumeMult}x ({(volumeMult * 100).toFixed(0)}%)</strong>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3.0"
                  step="0.1"
                  value={volumeMult}
                  onChange={(e) => setVolumeMult(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: '#10B981' }}
                />
              </div>

              {/* Slider 3: Gateway Fee Delta */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                  <span>Gateway MDR Delta</span>
                  <strong style={{ color: '#F97316' }}>{feeDelta >= 0 ? `+${feeDelta}%` : `${feeDelta}%`}</strong>
                </div>
                <input
                  type="range"
                  min="-0.5"
                  max="2.0"
                  step="0.1"
                  value={feeDelta}
                  onChange={(e) => setFeeDelta(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: '#F97316' }}
                />
              </div>

              {/* Slider 4: Settlement Delay */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                  <span>Settlement Lag (Hold)</span>
                  <strong style={{ color: '#EF4444' }}>+{settleDelay} Day{settleDelay > 1 ? 's' : ''}</strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="1"
                  value={settleDelay}
                  onChange={(e) => setSettleDelay(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: '#EF4444' }}
                />
              </div>

              {/* Slider 5: Historical Dataset Rows */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                  <span>Transaction Scale</span>
                  <strong style={{ color: '#FFD028' }}>{recordCount.toLocaleString()} Rows</strong>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[1000, 10000, 50000, 100000].map((count) => (
                    <button
                      key={count}
                      onClick={() => setRecordCount(count)}
                      style={{
                        flex: 1,
                        padding: '6px 0',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        borderRadius: 6,
                        border: '1.5px solid #0D0D11',
                        background: recordCount === count ? '#FFD028' : 'var(--bg)',
                        color: recordCount === count ? '#0D0D11' : 'var(--text)',
                        cursor: 'pointer'
                      }}
                    >
                      {count >= 1000 ? `${count / 1000}k` : count}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={executeSimulation}
                className="brutal-btn brutal-btn-brand"
                style={{ width: '100%', justifyContent: 'center', marginTop: 6 }}
              >
                APPLY WHAT-IF STRESS
              </button>
            </div>

            {/* Right Chart Panel */}
            <div className="brutal-card" style={{ padding: '24px 26px', background: 'var(--surface)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--text)' }}>
                    Realtime Cash Movement & 90% Confidence Uncertainty Band
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                    Historical baseline vs. Simulated stress projection. Shaded region depicts upper & lower Monte Carlo bounds.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: '0.76rem', fontFamily: "'SF Mono', monospace" }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 2, background: '#FE4A23' }} />
                    <span>Simulated Net</span>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 2, background: '#94A3B8' }} />
                    <span>Baseline Net</span>
                  </span>
                </div>
              </div>

              <div style={{ height: 320, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={simResult?.points || []} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="simGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FE4A23" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#FE4A23" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="envelopeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#38BDF8" stopOpacity={0.15} />
                        <stop offset="100%" stopColor="#38BDF8" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="date" stroke="var(--text-faint)" fontSize={11} tickFormatter={(val) => val.slice(5)} />
                    <YAxis stroke="var(--text-faint)" fontSize={11} tickFormatter={(val) => `₹${(val / 100000).toFixed(1)}L`} />
                    <Tooltip
                      content={({ active, payload }: any) => {
                        if (!active || !payload?.length) return null;
                        const data = payload[0].payload;
                        return (
                          <div style={{ background: '#0D0D11', border: '2px solid #FE4A23', padding: '10px 14px', borderRadius: 8, color: '#FFF', fontSize: '0.78rem' }}>
                            <div style={{ fontWeight: 800, color: '#FFD028' }}>{data.date} ({data.day_name})</div>
                            <div style={{ marginTop: 4 }}>Simulated: <strong>₹{data.simulated_net_inr?.toLocaleString('en-IN')}</strong></div>
                            <div style={{ color: '#94A3B8' }}>Baseline: ₹{data.baseline_net_inr?.toLocaleString('en-IN')}</div>
                            <div style={{ color: '#38BDF8', fontSize: '0.72rem', marginTop: 2 }}>
                              90% CI: ₹{data.lower_bound_inr?.toLocaleString('en-IN')} — ₹{data.upper_bound_inr?.toLocaleString('en-IN')}
                            </div>
                            {data.note && (
                              <div style={{ marginTop: 6, color: '#F97316', borderTop: '1px solid #333', paddingTop: 4 }}>
                                ⚠️ {data.note}
                              </div>
                            )}
                          </div>
                        );
                      }}
                    />
                    <Area type="monotone" dataKey="upper_bound_inr" stroke="transparent" fill="url(#envelopeGrad)" />
                    <Area type="monotone" dataKey="lower_bound_inr" stroke="transparent" fill="transparent" />
                    <Line type="monotone" dataKey="baseline_net_inr" stroke="#94A3B8" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                    <Line type="monotone" dataKey="simulated_net_inr" stroke="#FE4A23" strokeWidth={3} dot={{ r: 3, fill: '#FE4A23' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Mitigation Playbook Footer */}
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, fontFamily: "'SF Mono', monospace", color: '#FFD028', marginBottom: 10 }}>
                  ✦ AI MITIGATION PLAYBOOK (AUTONOMOUS RECOMMENDATIONS)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
                  {(simResult?.mitigation_playbook || []).map((step, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: 'var(--bg)',
                        border: '1px solid var(--border)',
                        padding: '10px 14px',
                        borderRadius: 8,
                        fontSize: '0.78rem',
                        color: 'var(--text)',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 8
                      }}
                    >
                      <CheckCircle2 size={15} color="#10B981" style={{ flexShrink: 0, marginTop: 1 }} />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* TAB 2: WEALTH ADVISOR POWERED BY GPT-OSS-120B                            */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'advisor' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
          {/* Main Chat & Structured Output */}
          <div className="brutal-card" style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: '#FFD028', border: '2px solid #0D0D11', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={20} color="#0D0D11" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 900, margin: 0, color: 'var(--text)' }}>
                    Treasury Wealth & Liquidity Advisor
                  </h3>
                  <div style={{ fontSize: '0.74rem', fontFamily: "'SF Mono', monospace", color: '#FE4A23', fontWeight: 700 }}>
                    ENGINE: GPT-OSS-120B (INSTITUTIONAL TREASURY REASONING)
                  </div>
                </div>
              </div>

              <span className="brutal-badge" style={{ color: '#10B981', borderColor: '#10B981' }}>
                ONLINE
              </span>
            </div>

            {/* Quick Prompt Chips */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                "How to hedge against the projected weekend liquidity dip?",
                "Audit gateway MDR drift on international card rails",
                "Recommend capital allocation for ₹4.5M idle float",
                "Simulate 48-hour settlement freeze impact on OpEx"
              ].map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleAdvisorSubmit(chip)}
                  style={{
                    background: 'var(--bg)',
                    border: '1.5px solid var(--border)',
                    borderRadius: 999,
                    padding: '6px 14px',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    color: 'var(--text)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  className="hover:border-[#FE4A23] hover:text-[#FE4A23]"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Advisor Response Display */}
            <div
              style={{
                background: 'var(--bg)',
                border: '2px solid #0D0D11',
                borderRadius: 12,
                padding: '22px 24px',
                minHeight: 240,
                position: 'relative'
              }}
            >
              {isAdvisorLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  <RefreshCw size={18} className="animate-spin" color="#FE4A23" />
                  <span>GPT-OSS-120B is synthesizing multi-source liquidity invariants and treasury models...</span>
                </div>
              ) : advisorResp ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '0.72rem', fontFamily: "'SF Mono', monospace", color: '#38BDF8', fontWeight: 800 }}>
                      MODEL: {advisorResp.model_name}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>
                      {advisorResp.timestamp}
                    </span>
                  </div>

                  {/* Markdown formatted response */}
                  <div style={{ fontSize: '0.88rem', lineHeight: 1.65, color: 'var(--text)', whiteSpace: 'pre-line' }}>
                    {advisorResp.answer}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Query Input */}
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                type="text"
                value={advisorQuery}
                onChange={(e) => setAdvisorQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdvisorSubmit()}
                placeholder="Ask GPT-OSS-120B about treasury liquidity, yield optimization, or payment rail risks..."
                style={{
                  flex: 1,
                  background: 'var(--surface)',
                  border: '2px solid #0D0D11',
                  borderRadius: 10,
                  padding: '12px 18px',
                  fontSize: '0.88rem',
                  color: 'var(--text)',
                  outline: 'none'
                }}
              />
              <button
                onClick={() => handleAdvisorSubmit()}
                disabled={isAdvisorLoading || !advisorQuery.trim()}
                className="brutal-btn brutal-btn-brand"
                style={{ padding: '0 24px' }}
              >
                <Send size={15} />
                <span>ANALYZE</span>
              </button>
            </div>
          </div>

          {/* Right Recommendation Summary Box */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="brutal-card" style={{ padding: '20px 22px' }}>
              <div style={{ fontSize: '0.72rem', fontFamily: "'SF Mono', monospace", color: 'var(--text-muted)', fontWeight: 800 }}>
                RECOMMENDED CASH BUFFER
              </div>
              <div style={{ fontSize: '1.9rem', fontWeight: 900, color: '#38BDF8', marginTop: 4 }}>
                ₹{(advisorResp?.liquidity_buffer_recommendation_inr || 3200000).toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 4 }}>
                Required for 48h settlement volatility
              </div>
            </div>

            <div className="brutal-card" style={{ padding: '20px 22px' }}>
              <div style={{ fontSize: '0.76rem', fontWeight: 800, fontFamily: "'SF Mono', monospace", color: '#FFD028', marginBottom: 12 }}>
                CAPITAL ALLOCATION TACTICS
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(advisorResp?.capital_allocation_recommendations || []).map((rec, i) => (
                  <div key={i} style={{ fontSize: '0.78rem', color: 'var(--text)', lineHeight: 1.45, display: 'flex', gap: 8 }}>
                    <span style={{ color: '#10B981', fontWeight: 800 }}>{i + 1}.</span>
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* TAB 3: 10K+ TRANSACTION STRESS MATRIX                                    */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'whatif' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="brutal-card" style={{ padding: '22px 26px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 900, margin: 0, color: 'var(--text)' }}>
              Preset Stress Scenarios (Evaluated over {recordCount.toLocaleString()} Transactions)
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '4px 0 16px' }}>
              Choose an extreme macroeconomic or rail anomaly scenario to test treasury solvency and auto-mitigation.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
              {[
                {
                  title: 'Black Friday 3.0x Volume Spike',
                  desc: 'Volume surge +200%, Razorpay fee +0.2% surge, 0-day settlement lag.',
                  vm: 3.0,
                  fee: 0.2,
                  lag: 0,
                  tag: 'SURGE STRESS'
                },
                {
                  title: 'Gateway Outage & Failover',
                  desc: 'UPI outage forces netbanking rerouting, MDR increases +1.2%, settlement delays +2 days.',
                  vm: 1.1,
                  fee: 1.2,
                  lag: 2,
                  tag: 'FAILOVER STRESS'
                },
                {
                  title: 'Settlement Freeze (+4 Days Hold)',
                  desc: 'RBI regulatory audit pause freezes outgoing gateway disbursements for 96 hours.',
                  vm: 1.0,
                  fee: 0.0,
                  lag: 4,
                  tag: 'RUNWAY CRISIS'
                },
                {
                  title: 'Chargeback & Dispute Cascade',
                  desc: 'Mass dispute wave, 2.5x chargeback surge, 0.6% card dispute penalties.',
                  vm: 0.9,
                  fee: 0.6,
                  lag: 1,
                  tag: 'DISPUTE RISK'
                }
              ].map((sc, i) => (
                <div
                  key={i}
                  onClick={() => {
                    setVolumeMult(sc.vm);
                    setFeeDelta(sc.fee);
                    setSettleDelay(sc.lag);
                    executeSimulation();
                    setActiveTab('forecast');
                  }}
                  className="brutal-card"
                  style={{
                    padding: '16px 18px',
                    cursor: 'pointer',
                    background: 'var(--bg)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 12
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: '0.68rem', fontFamily: "'SF Mono', monospace", fontWeight: 800, color: '#FE4A23' }}>
                        {sc.tag}
                      </span>
                      <ArrowUpRight size={14} color="var(--text-muted)" />
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text)' }}>
                      {sc.title}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.4 }}>
                      {sc.desc}
                    </div>
                  </div>

                  <div style={{ fontSize: '0.72rem', fontFamily: "'SF Mono', monospace", color: '#38BDF8', fontWeight: 700 }}>
                    Click to simulate over {recordCount.toLocaleString()} rows ↗
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* TAB 4: MULTI-MODAL DOCUMENT & STATEMENT SCANNER                          */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'multimodal' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 20 }}>
          {/* Visual Document Canvas */}
          <div className="brutal-card" style={{ padding: '24px 26px', display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 900, margin: 0, color: 'var(--text)' }}>
                  Multi-Modal Statement & Payment Slip OCR
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                  Visual feature extraction matches paper/PDF slips against database records in real-time.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { id: 'sbi_statement', label: 'SBI Bank Statement' },
                  { id: 'razorpay_settlement', label: 'Razorpay Slip' },
                  { id: 'discrepant_invoice', label: 'Discrepant Invoice' }
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleScanDocument(s.id)}
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '6px 12px',
                      borderRadius: 6,
                      border: '1.5px solid #0D0D11',
                      background: selectedSample === s.id ? '#FE4A23' : 'var(--bg)',
                      color: selectedSample === s.id ? '#FFF' : 'var(--text)',
                      cursor: 'pointer'
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mock Visual Document Render with OCR Bounding Boxes */}
            <div
              style={{
                height: 380,
                background: '#090D16',
                borderRadius: 12,
                border: '2px solid #1E293B',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {/* Document Skeleton Graphic */}
              <div style={{ width: '85%', height: '85%', background: '#0F172A', borderRadius: 8, padding: 24, border: '1px solid #334155', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #334155', paddingBottom: 12, marginBottom: 20 }}>
                  <div>
                    <div style={{ fontWeight: 800, color: '#FFF', fontSize: '1rem' }}>
                      {multimodalResult?.document_type || 'Corporate Statement'}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                      Timestamp: {multimodalResult?.extracted_timestamp}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.74rem', color: '#38BDF8', fontWeight: 800 }}>
                      CONFIDENCE: {((multimodalResult?.confidence_score || 0.98) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* Simulated OCR Boxes with High-Contrast Green/Orange borders */}
                {(multimodalResult?.visual_bounding_boxes || []).map((box, idx) => (
                  <div
                    key={idx}
                    style={{
                      position: 'absolute',
                      left: box.x,
                      top: box.y,
                      border: '2px dashed #10B981',
                      background: 'rgba(16, 185, 129, 0.1)',
                      padding: '4px 8px',
                      borderRadius: 4,
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <span style={{ fontSize: '0.58rem', fontFamily: "'SF Mono', monospace", color: '#10B981', fontWeight: 900 }}>
                      {box.label} [VERIFIED]
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#FFF', fontWeight: 700 }}>
                      {box.val}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Verification Results */}
          <div className="brutal-card" style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ fontSize: '0.76rem', fontWeight: 800, fontFamily: "'SF Mono', monospace", color: '#FFD028' }}>
              CROSS-RECONCILIATION VERDICT
            </div>

            <div
              style={{
                padding: '12px 14px',
                borderRadius: 8,
                border: '2px solid #0D0D11',
                background: multimodalResult?.match_status === 'MATCHED' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                color: multimodalResult?.match_status === 'MATCHED' ? '#10B981' : '#EF4444',
                fontWeight: 800,
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              {multimodalResult?.match_status === 'MATCHED' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
              <span>{multimodalResult?.match_status}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>
                <span style={{ color: 'var(--text-muted)' }}>Extracted UTR:</span>
                <strong style={{ fontFamily: "'SF Mono', monospace", color: 'var(--text)' }}>
                  {multimodalResult?.extracted_utr}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>
                <span style={{ color: 'var(--text-muted)' }}>Extracted Amount:</span>
                <strong style={{ color: '#10B981' }}>
                  ₹{multimodalResult?.extracted_amount_inr?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>
                <span style={{ color: 'var(--text-muted)' }}>Merchant Entity:</span>
                <strong style={{ color: 'var(--text)' }}>{multimodalResult?.extracted_merchant}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>
                <span style={{ color: 'var(--text-muted)' }}>Matched DB Record:</span>
                <strong style={{ color: '#38BDF8' }}>{multimodalResult?.ledger_comparison.matched_record_id}</strong>
              </div>
            </div>

            <div style={{ background: 'var(--bg)', padding: '12px 14px', borderRadius: 8, fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
              💡 {multimodalResult?.ledger_comparison.forensic_status}
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* TAB 5: LIVE CONSENSUS DEBATE ARENA                                       */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'debate' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Agent Radar Grid */}
          <div className="brutal-card" style={{ padding: '22px 26px' }}>
            <div style={{ fontSize: '0.76rem', fontWeight: 800, fontFamily: "'SF Mono', monospace", color: '#FE4A23', marginBottom: 14 }}>
              REALTIME 8-AGENT VERIFICATION FLEET TELEMETRY
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
              {agents.map((ag) => (
                <div
                  key={ag.agent_id}
                  style={{
                    background: 'var(--bg)',
                    border: '1.5px solid #0D0D11',
                    borderRadius: 10,
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.84rem', color: 'var(--text)' }}>{ag.name}</span>
                    <span style={{ fontSize: '0.68rem', color: '#10B981', fontWeight: 800 }}>● {ag.latency_ms}ms</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{ag.role}</div>
                  <div style={{ fontSize: '0.7rem', color: '#38BDF8', fontFamily: "'SF Mono', monospace", marginTop: 4 }}>
                    Action: {ag.current_action}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Consensus Debate Transcript */}
          {debate && (
            <div className="brutal-card" style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 14 }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 900, margin: 0, color: 'var(--text)' }}>
                    Live Consensus Debate: Record {debate.record_id}
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                    Hostile Challenger vs. Defender with Bayesian Arbiter Verdict
                  </p>
                </div>
                <span className="brutal-badge" style={{ color: '#10B981', borderColor: '#10B981' }}>
                  CONFIDENCE: {debate.arbiter_confidence_pct}%
                </span>
              </div>

              {/* Belief Meter */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ background: 'var(--bg)', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', marginBottom: 6 }}>
                    <span style={{ fontWeight: 800, color: '#EF4444' }}>Challenger Belief (Discrepancy)</span>
                    <strong>{debate.challenger_belief_pct}%</strong>
                  </div>
                  <div style={{ height: 6, background: 'rgba(239,68,68,0.2)', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${debate.challenger_belief_pct}%`, background: '#EF4444' }} />
                  </div>
                </div>

                <div style={{ background: 'var(--bg)', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', marginBottom: 6 }}>
                    <span style={{ fontWeight: 800, color: '#10B981' }}>Defender Belief (Match Valid)</span>
                    <strong>{debate.defender_belief_pct}%</strong>
                  </div>
                  <div style={{ height: 6, background: 'rgba(16,185,129,0.2)', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${debate.defender_belief_pct}%`, background: '#10B981' }} />
                  </div>
                </div>
              </div>

              {/* Debate Rounds */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {debate.rounds.map((rd) => (
                  <div
                    key={rd.round}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 8,
                      border: '1px solid var(--border)',
                      background: rd.speaker.includes('Challenger') ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12
                    }}
                  >
                    <span style={{ fontSize: '0.72rem', fontFamily: "'SF Mono', monospace", fontWeight: 800, color: 'var(--text-muted)' }}>
                      R{rd.round}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 800, color: rd.speaker.includes('Challenger') ? '#EF4444' : '#10B981' }}>
                        {rd.speaker} ({rd.confidence}% Confidence)
                      </div>
                      <div style={{ fontSize: '0.84rem', color: 'var(--text)', marginTop: 2 }}>
                        {rd.claim}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Arbiter Verdict Box */}
              <div
                style={{
                  background: 'rgba(255, 208, 40, 0.1)',
                  border: '2px solid #FFD028',
                  borderRadius: 10,
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12
                }}
              >
                <Scale size={24} color="#FFD028" style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.74rem', fontFamily: "'SF Mono', monospace", color: '#FFD028', fontWeight: 900 }}>
                    ARBITER CONSENSUS VERDICT (BAYESIAN INVARIANT SATISFIED)
                  </div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text)', marginTop: 2 }}>
                    {debate.arbiter_verdict}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
