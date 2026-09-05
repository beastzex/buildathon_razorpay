'use client';

import { useState, useEffect, useRef } from 'react';
import { AgentResultEvent, DebateTranscript } from '@/lib/mock-data';
import { getBatchStreamUrl, runReconciliation } from '@/lib/api';

const AGENT_COLORS: Record<string, { badge: string; text: string; bg: string; border: string }> = {
  'Ingestion Agent': { badge: '#06b6d4', text: '#22d3ee', bg: 'rgba(6, 182, 212, 0.12)', border: 'rgba(6, 182, 212, 0.3)' },
  'Normalizer Agent': { badge: '#6366f1', text: '#818cf8', bg: 'rgba(99, 102, 241, 0.12)', border: 'rgba(99, 102, 241, 0.3)' },
  'Matcher Agent': { badge: '#10b981', text: '#34d399', bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.3)' },
  'Detective Agent': { badge: '#f59e0b', text: '#fbbf24', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.3)' },
  'Debate Agent': { badge: '#f43f5e', text: '#fb7185', bg: 'rgba(244, 63, 94, 0.15)', border: 'rgba(244, 63, 94, 0.35)' },
  'Explainer Agent': { badge: '#8b5cf6', text: '#a78bfa', bg: 'rgba(139, 92, 246, 0.12)', border: 'rgba(139, 92, 246, 0.3)' },
  'Auditor Agent': { badge: '#14b8a6', text: '#2dd4bf', bg: 'rgba(20, 184, 166, 0.12)', border: 'rgba(20, 184, 166, 0.3)' },
  'Pipeline Router': { badge: '#94a3b8', text: '#cbd5e1', bg: 'rgba(148, 163, 184, 0.1)', border: 'rgba(148, 163, 184, 0.25)' },
};

const AGENTS_LIST = [
  'Ingestion Agent',
  'Normalizer Agent',
  'Matcher Agent',
  'Detective Agent',
  'Debate Agent',
  'Explainer Agent',
  'Auditor Agent',
];

interface LiveTickerProps {
  batchId?: string;
}

export function LiveTickerScreen({ batchId = 'batch-214' }: LiveTickerProps) {
  const [events, setEvents] = useState<AgentResultEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isReconciling, setIsReconciling] = useState(false);
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [filterAgent, setFilterAgent] = useState<string>('all');
  const [autoScroll, setAutoScroll] = useState(true);
  const [expandedIndices, setExpandedIndices] = useState<Record<number, boolean>>({});

  const terminalRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Connect to SSE stream
  useEffect(() => {
    let sse: EventSource | null = null;
    const streamUrl = getBatchStreamUrl(batchId);

    try {
      sse = new EventSource(streamUrl);
      eventSourceRef.current = sse;

      sse.onopen = () => {
        setIsConnected(true);
      };

      sse.onmessage = (event) => {
        if (!event.data || event.data.trim() === '') return;
        try {
          const parsed = JSON.parse(event.data);
          if (parsed && parsed.agent_name) {
            const agentEvt: AgentResultEvent = {
              agent_name: parsed.agent_name,
              input_summary: parsed.input_summary || '',
              output_summary: parsed.output_summary || '',
              output_data: parsed.output_data,
              duration_ms: parsed.duration_ms || 0,
              status: parsed.status || 'ok',
              record_id: parsed.record_id,
              batch_id: parsed.batch_id || batchId,
              timestamp: parsed.timestamp || new Date().toISOString(),
            };

            setActiveAgent(parsed.agent_name);
            setEvents((prev) => [...prev, agentEvt]);
          }
        } catch {
          // ignore keep-alive pings or non-json lines
        }
      };

      sse.onerror = () => {
        setIsConnected(false);
      };
    } catch {
      setIsConnected(false);
    }

    return () => {
      if (sse) {
        sse.close();
      }
    };
  }, [batchId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScroll && terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [events, autoScroll]);

  // Trigger live batch reconciliation
  const handleTriggerRun = async () => {
    setIsReconciling(true);
    try {
      await runReconciliation(batchId);
    } catch {
      // Stream will capture output
    } finally {
      setIsReconciling(false);
    }
  };

  // Interactive Simulation: Debate & Consensus
  const handleSimulateDebate = () => {
    const timestamp = new Date().toISOString();
    const debateEvt: AgentResultEvent = {
      agent_name: 'Debate Agent',
      record_id: 'TXN_GATEWAY_FEE_DRIFT_089',
      batch_id: batchId,
      timestamp,
      duration_ms: 184,
      status: 'ok',
      input_summary: 'Evaluating ambiguous variance on Razorpay fee drift (₹42,500 gross vs ₹41,862.50 settlement)',
      output_summary: 'ARBITER REACHED CONSENSUS: MATCH (Confidence 96.4%). Merchant promotional tier discount was applied at source.',
      output_data: {
        debate_result: {
          record_id: 'TXN_GATEWAY_FEE_DRIFT_089',
          rounds: 2,
          challenger_opinion: 'Discrepancy of ₹637.50 exceeds standard 1.5% gateway ceiling. Potential fee leakage.',
          defender_opinion: 'Merchant volume tier code PROMO_Q3 was verified in Razorpay metadata. Net settlement matches exactly.',
          arbiter_notes: 'Evidence verified: Razorpay API fee schedule matches tier rebate. Safe to reconcile automatically.',
          verdict: 'match',
          consensus_confidence: 0.964
        }
      }
    };
    setActiveAgent('Debate Agent');
    setEvents((prev) => [...prev, debateEvt]);
  };

  // Interactive Simulation: Root-Cause Forensic Agent
  const handleSimulateRootCause = () => {
    const timestamp = new Date().toISOString();
    const rootCauseEvt: AgentResultEvent = {
      agent_name: 'Detective Agent',
      record_id: 'TXN_MULTI_HOP_ROOT_CAUSE',
      batch_id: batchId,
      timestamp,
      duration_ms: 245,
      status: 'ok',
      input_summary: 'Investigating cluster of 14 delayed UPI transactions across 3 merchant fleets',
      output_summary: 'ROOT-CAUSE DISCOVERED: Razorpay Webhook Retry Delay (+184ms) triggered duplicate auth retry on ICICI UPI switch. Systemic cause isolated to Gateway Ingress lag. All 14 records linked and auto-resolved.',
      output_data: {
        root_cause_analysis: {
          cluster_size: 14,
          primary_cause: 'Gateway Webhook Latency Spike (+184ms)',
          affected_rails: ['Razorpay', 'ICICI UPI Switch'],
          confidence: 0.982,
          recommendation: 'Auto-link secondary trace IDs; suppress duplicate alert notifications.'
        }
      }
    };
    setActiveAgent('Detective Agent');
    setEvents((prev) => [...prev, rootCauseEvt]);
  };

  // Interactive Simulation: 02:00 AM Night-Shift Runner
  const handleSimulateNightShift = () => {
    const timestamp = new Date().toISOString();
    const nightShiftEvt: AgentResultEvent = {
      agent_name: 'Auditor Agent',
      record_id: 'NIGHT_SHIFT_SWEEP',
      batch_id: batchId,
      timestamp,
      duration_ms: 312,
      status: 'ok',
      input_summary: '02:00 AM Daily Autonomous Night-Shift Run initiated across un-reconciled queue (47 items)',
      output_summary: 'NIGHT-SHIFT COMPLETE: 46 of 47 un-reconciled items auto-resolved via T+1 bank settlement feed. 1 transaction scheduled for operator verification. Zero false positives.',
      output_data: {
        night_shift_summary: {
          total_scanned: 47,
          auto_cleared: 46,
          escalated: 1,
          duration_sec: 1.42,
          status: 'SUCCESS'
        }
      }
    };
    setActiveAgent('Auditor Agent');
    setEvents((prev) => [...prev, nightShiftEvt]);
  };

  const toggleExpand = (idx: number) => {
    setExpandedIndices((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const filteredEvents = events.filter((e) =>
    filterAgent === 'all' ? true : e.agent_name === filterAgent
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
      {/* Top Controller Bar */}
      <div
        className="brutal-card"
        style={{
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 14,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <div
            className="brutal-badge"
            style={{
              background: isConnected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              borderColor: isConnected ? '#10b981' : '#ef4444',
              color: isConnected ? '#10b981' : '#ef4444',
              padding: '4px 10px'
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: isConnected ? '#10b981' : '#ef4444',
                boxShadow: isConnected ? '0 0 8px #10b981' : 'none',
              }}
            />
            <span>{isConnected ? 'LIVE RELAY ACTIVE' : 'STREAM CONNECTING'}</span>
          </div>

          <span className="brutal-badge" style={{ background: 'var(--surface)', borderColor: 'var(--border-strong)', color: 'var(--text)' }}>
            BATCH: <strong style={{ color: '#FE4A23', marginLeft: 4 }}>#{batchId}</strong>
          </span>

          <span className="brutal-badge" style={{ background: 'var(--surface)', borderColor: 'var(--border-strong)', color: 'var(--text)' }}>
            EVENTS: <strong style={{ color: '#FFD028', marginLeft: 4 }}>{events.length}</strong>
          </span>
        </div>

        {/* Brutalist Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {/* Filter dropdown */}
          <select
            value={filterAgent}
            onChange={(e) => setFilterAgent(e.target.value)}
            style={{
              padding: '7px 12px',
              borderRadius: 8,
              background: 'var(--surface)',
              color: 'var(--text)',
              border: '2px solid var(--border-strong)',
              fontFamily: "'SF Mono', monospace",
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <option value="all">ALL AGENTS</option>
            {AGENTS_LIST.map((ag) => (
              <option key={ag} value={ag}>
                {ag.toUpperCase()}
              </option>
            ))}
          </select>

          {/* Autoscroll toggle */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className="brutal-btn"
            style={{
              padding: '6px 12px',
              fontSize: '0.72rem',
              background: autoScroll ? 'rgba(254,74,35,0.1)' : 'var(--surface)',
              color: autoScroll ? '#FE4A23' : 'var(--text)',
              borderColor: autoScroll ? '#FE4A23' : 'var(--border-strong)'
            }}
          >
            {autoScroll ? 'SCROLL: ON' : 'SCROLL: OFF'}
          </button>

          {/* AI Simulation Triggers */}
          <button
            onClick={handleSimulateDebate}
            className="brutal-btn"
            style={{
              padding: '6px 12px',
              fontSize: '0.72rem',
              background: 'rgba(244,63,94,0.12)',
              color: '#fb7185',
              borderColor: '#f43f5e',
              boxShadow: '2px 2px 0px #0D0D11'
            }}
            title="Simulate Challenger vs Defender Consensus Debate"
          >
            ⚖️ DEBATE
          </button>

          <button
            onClick={handleSimulateRootCause}
            className="brutal-btn"
            style={{
              padding: '6px 12px',
              fontSize: '0.72rem',
              background: 'rgba(245,158,11,0.12)',
              color: '#f59e0b',
              borderColor: '#f59e0b',
              boxShadow: '2px 2px 0px #0D0D11'
            }}
            title="Simulate Multi-Hop Root-Cause Investigation"
          >
            🔍 ROOT-CAUSE
          </button>

          <button
            onClick={handleSimulateNightShift}
            className="brutal-btn"
            style={{
              padding: '6px 12px',
              fontSize: '0.72rem',
              background: 'rgba(139,92,246,0.12)',
              color: '#a78bfa',
              borderColor: '#8b5cf6',
              boxShadow: '2px 2px 0px #0D0D11'
            }}
            title="Trigger 02:00 AM Autonomous Night-Shift Sweep"
          >
            🌙 NIGHT-SHIFT
          </button>

          {/* Run Reconciliation Trigger */}
          <button
            onClick={handleTriggerRun}
            disabled={isReconciling}
            className="brutal-btn brutal-btn-brand"
            style={{
              padding: '7px 16px',
              fontSize: '0.75rem',
            }}
          >
            {isReconciling ? (
              <>
                <span className="spinner" style={{ width: 12, height: 12 }} />
                RELAYING...
              </>
            ) : (
              <>▶ RUN RELAY</>
            )}
          </button>
        </div>
      </div>

      {/* 6-Agent Active Relay Visualizer */}
      <div
        className="brutal-card"
        style={{
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          overflowX: 'auto',
          gap: 8,
          borderColor: '#0D0D11',
          boxShadow: '3px 3px 0px #0D0D11'
        }}
      >
        {AGENTS_LIST.map((name, i) => {
          const isActive = activeAgent === name;
          const styling = AGENT_COLORS[name] || AGENT_COLORS['Pipeline Router'];
          return (
            <div
              key={name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: `2px solid ${isActive ? '#FE4A23' : '#0D0D11'}`,
                  background: isActive ? styling.bg : 'var(--surface)',
                  boxShadow: isActive ? '3px 3px 0px #FE4A23' : '1px 1px 0px rgba(0,0,0,0.1)',
                  transition: 'all 0.15s ease',
                  fontFamily: "'SF Mono', monospace"
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: styling.badge,
                    boxShadow: isActive ? `0 0 8px ${styling.badge}` : 'none',
                  }}
                />
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    color: isActive ? styling.text : 'var(--text)',
                  }}
                >
                  {name.replace(' Agent', '').toUpperCase()}
                </span>
              </div>
              {i < AGENTS_LIST.length - 1 && (
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 900, userSelect: 'none' }}>
                  →
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Terminal Live Stream Window */}
      <div
        ref={terminalRef}
        style={{
          flex: 1,
          minHeight: 450,
          maxHeight: 'calc(100vh - 310px)',
          overflowY: 'auto',
          background: '#090b10',
          border: '2px solid #0D0D11',
          borderRadius: 12,
          boxShadow: '4px 4px 0px #0D0D11',
          padding: 16,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          fontSize: '0.8125rem',
          lineHeight: '1.6',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {filteredEvents.length === 0 ? (
          <div
            style={{
              margin: 'auto',
              textAlign: 'center',
              color: '#4b5563',
              padding: 40,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <div style={{ fontSize: '1.25rem' }}>⚡ Waiting for Agent Relay events...</div>
            <div style={{ fontSize: '0.75rem' }}>
              Click <strong>&quot;Run Relay Cycle&quot;</strong> above to trigger multi-agent reconciliation on batch #{batchId}.
            </div>
          </div>
        ) : (
          filteredEvents.map((evt, idx) => {
            const agentStyle = AGENT_COLORS[evt.agent_name] || AGENT_COLORS['Pipeline Router'];
            const isDebate = evt.agent_name === 'Debate Agent' || evt.output_data?.debate_result;
            const debateData: DebateTranscript | undefined = evt.output_data?.debate_result;
            const isExpanded = expandedIndices[idx];

            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  padding: '8px 12px',
                  borderRadius: 6,
                  background: isDebate ? 'rgba(244, 63, 94, 0.05)' : 'rgba(255, 255, 255, 0.015)',
                  border: `1px solid ${isDebate ? 'rgba(244, 63, 94, 0.25)' : 'rgba(255, 255, 255, 0.04)'}`,
                  transition: 'background 0.15s ease',
                }}
              >
                {/* Event Row Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  {/* Timestamp */}
                  <span style={{ color: '#64748b', fontSize: '0.75rem', minWidth: 72 }}>
                    {evt.timestamp.split('T')[1]?.split('Z')[0] || evt.timestamp}
                  </span>

                  {/* Agent Tag */}
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      background: agentStyle.bg,
                      color: agentStyle.text,
                      border: `1px solid ${agentStyle.border}`,
                    }}
                  >
                    {evt.agent_name}
                  </span>

                  {/* Record ID if present */}
                  {evt.record_id && (
                    <span
                      style={{
                        padding: '1px 6px',
                        borderRadius: 3,
                        fontSize: '0.7rem',
                        background: '#1e293b',
                        color: '#94a3b8',
                        border: '1px solid #334155',
                      }}
                    >
                      {evt.record_id}
                    </span>
                  )}

                  {/* Latency */}
                  {evt.duration_ms > 0 && (
                    <span style={{ color: '#475569', fontSize: '0.7rem' }}>
                      +{evt.duration_ms}ms
                    </span>
                  )}

                  {/* Status Indicator */}
                  {evt.status === 'disagreement' && (
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: 3,
                        background: 'rgba(245, 158, 11, 0.15)',
                        color: '#fbbf24',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                      }}
                    >
                      DISAGREEMENT DETECTED
                    </span>
                  )}

                  {/* Expand payload toggle */}
                  {evt.output_data && (
                    <button
                      onClick={() => toggleExpand(idx)}
                      style={{
                        marginLeft: 'auto',
                        background: 'transparent',
                        border: 'none',
                        color: '#64748b',
                        fontSize: '0.7rem',
                        cursor: 'pointer',
                        padding: '2px 6px',
                      }}
                    >
                      {isExpanded ? '▲ Hide Payload' : '▼ Inspect JSON'}
                    </button>
                  )}
                </div>

                {/* Main Summary Message */}
                <div style={{ color: '#e2e8f0', paddingLeft: 82, fontSize: '0.8rem' }}>
                  {evt.output_summary}
                </div>

                {/* SPECIAL TIER 2: Visual "VS" Debate Card */}
                {isDebate && debateData && (
                  <div
                    style={{
                      margin: '10px 0 6px 82px',
                      padding: 16,
                      borderRadius: 8,
                      background: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid rgba(244, 63, 94, 0.35)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fb7185', letterSpacing: '0.05em' }}>
                        ⚖ AI DEBATE ROUND {debateData.rounds} OF 2
                      </span>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '3px 10px',
                          borderRadius: 100,
                          background:
                            debateData.verdict === 'match'
                              ? 'rgba(16, 185, 129, 0.2)'
                              : debateData.verdict === 'mismatch'
                              ? 'rgba(239, 68, 68, 0.2)'
                              : 'rgba(245, 158, 11, 0.2)',
                          color:
                            debateData.verdict === 'match'
                              ? '#34d399'
                              : debateData.verdict === 'mismatch'
                              ? '#f87171'
                              : '#fbbf24',
                          border: `1px solid ${
                            debateData.verdict === 'match'
                              ? 'rgba(16, 185, 129, 0.4)'
                              : debateData.verdict === 'mismatch'
                              ? 'rgba(239, 68, 68, 0.4)'
                              : 'rgba(245, 158, 11, 0.4)'
                          }`,
                        }}
                      >
                        ARBITER CONSENSUS: {debateData.verdict.toUpperCase()}
                      </span>
                    </div>

                    {/* Side-by-side opinions with VS Badge */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr auto 1fr',
                        gap: 16,
                        alignItems: 'center',
                      }}
                    >
                      {/* FOR Advocate */}
                      <div
                        style={{
                          padding: 12,
                          borderRadius: 6,
                          background: 'rgba(16, 185, 129, 0.06)',
                          border: '1px solid rgba(16, 185, 129, 0.2)',
                        }}
                      >
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399', marginBottom: 6 }}>
                          ✓ Advocate FOR Match
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#cbd5e1', whiteSpace: 'pre-line' }}>
                          {debateData.opinion_for}
                        </div>
                      </div>

                      {/* Center VS Badge */}
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: '50%',
                          background: '#1e293b',
                          border: '2px solid rgba(244, 63, 94, 0.6)',
                          color: '#fb7185',
                          fontWeight: 900,
                          fontSize: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 0 10px rgba(244, 63, 94, 0.3)',
                          userSelect: 'none',
                        }}
                      >
                        VS
                      </div>

                      {/* AGAINST Advocate */}
                      <div
                        style={{
                          padding: 12,
                          borderRadius: 6,
                          background: 'rgba(244, 63, 94, 0.06)',
                          border: '1px solid rgba(244, 63, 94, 0.2)',
                        }}
                      >
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fb7185', marginBottom: 6 }}>
                          ✗ Advocate AGAINST Match
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#cbd5e1', whiteSpace: 'pre-line' }}>
                          {debateData.opinion_against}
                        </div>
                      </div>
                    </div>

                    {/* Arbiter reasoning footer */}
                    {debateData.resolver_reasoning && (
                      <div
                        style={{
                          padding: '8px 12px',
                          borderRadius: 4,
                          background: 'rgba(255, 255, 255, 0.03)',
                          borderLeft: '3px solid #818cf8',
                          fontSize: '0.75rem',
                          color: '#94a3b8',
                        }}
                      >
                        <strong style={{ color: '#e2e8f0' }}>Arbiter Reasoning:</strong>{' '}
                        {debateData.resolver_reasoning}
                      </div>
                    )}
                  </div>
                )}

                {/* Inspect JSON Output Data */}
                {isExpanded && evt.output_data && (
                  <pre
                    style={{
                      margin: '6px 0 0 82px',
                      padding: 10,
                      borderRadius: 4,
                      background: '#040508',
                      border: '1px solid #1e293b',
                      color: '#94a3b8',
                      fontSize: '0.7rem',
                      overflowX: 'auto',
                    }}
                  >
                    {JSON.stringify(evt.output_data, null, 2)}
                  </pre>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
