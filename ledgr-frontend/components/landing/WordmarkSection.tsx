'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Shield,
  Zap,
  Activity,
  CheckCircle2,
  TrendingUp,
  Cpu,
  ArrowRight,
  Database,
  Search,
  Sparkles
} from 'lucide-react';

export function WordmarkSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'stream' | 'debate' | 'audit'>('stream');

  return (
    <section
      ref={sectionRef}
      id="architecture"
      style={{
        padding: '100px 24px 120px',
        position: 'relative',
        overflow: 'hidden',
        background: '#F6F6F9'
      }}
      aria-label="Device Mockup & Brand Watermark"
    >
      {/* Massive Ramos-Style Brand Watermark running behind cards */}
      <div
        style={{
          position: 'absolute',
          bottom: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: 'clamp(8rem, 24vw, 22rem)',
          fontWeight: 900,
          fontFamily: "'Urbanist', sans-serif",
          color: 'rgba(254, 74, 35, 0.08)',
          letterSpacing: '-0.06em',
          userSelect: 'none',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          zIndex: 1
        }}
      >
        Ledgr
      </div>

      <div style={{ maxWidth: 1240, margin: '0 auto', position: 'relative', zIndex: 2 }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#FFFFFF', padding: '6px 16px', borderRadius: 999, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', marginBottom: 16 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#FE4A23' }} />
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0D0D11', letterSpacing: '0.04em' }}>
              AUTONOMOUS LEDGER ARCHITECTURE
            </span>
          </div>

          <h2
            style={{
              fontFamily: "'Urbanist', sans-serif",
              fontSize: 'clamp(2.2rem, 4.2vw, 3.6rem)',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              color: '#0D0D11',
              lineHeight: 1.1,
              maxWidth: 750,
              margin: '0 auto 16px'
            }}
          >
            Full control over every rupee with multi-agent consensus
          </h2>
          <p style={{ fontSize: '1.05rem', color: '#6B7280', maxWidth: 620, margin: '0 auto', lineHeight: 1.5 }}>
            From ingestion of 10,000 raw bank lines to dual-agent consensus debate and cryptographically sealed audit blocks.
          </p>
        </div>

        {/* Side-by-side Device Frame Mockups (Laptop Frame + Phone Frame) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.6fr 0.9fr',
            gap: 32,
            alignItems: 'center'
          }}
        >
          {/* Laptop Device Frame */}
          <div
            style={{
              background: '#0D0D11',
              borderRadius: 28,
              padding: '16px 16px 24px',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.25), 0 4px 12px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              position: 'relative'
            }}
          >
            {/* Laptop Camera Notch / Dots */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, paddingLeft: 8 }}>
              <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#EF4444' }} />
              <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#F59E0B' }} />
              <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#10B981' }} />
              <span style={{ fontSize: '0.72rem', color: '#6B7280', marginLeft: 10, fontFamily: 'monospace' }}>
                ledgr.internal / live-reconciliation-mesh
              </span>
            </div>

            {/* Mock Screen Content */}
            <div
              style={{
                background: '#14151B',
                borderRadius: 18,
                padding: 22,
                color: '#FFFFFF'
              }}
            >
              {/* Screen Top Bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: '#FE4A23', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Cpu size={16} color="#FFFFFF" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 800 }}>8-Agent Relay • Active Consensus</div>
                    <div style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>Batch #214 & Stream Engine</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 6 }}>
                  {(['stream', 'debate', 'audit'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setActiveTab(t)}
                      style={{
                        padding: '4px 12px',
                        borderRadius: 999,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        background: activeTab === t ? '#FE4A23' : 'rgba(255,255,255,0.06)',
                        color: activeTab === t ? '#FFFFFF' : '#9CA3AF'
                      }}
                    >
                      {t.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Real-time Ticker Simulation Window */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16 }}>
                <div>
                  <div style={{ fontSize: '0.74rem', color: '#9CA3AF', marginBottom: 8 }}>RECONCILIATION RADAR</div>
                  <div style={{ background: '#0D0D11', borderRadius: 14, padding: 14, border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.75rem' }}>
                      <span style={{ color: '#D1D5DB' }}>TXN-4001 HDFC ↔ Razorpay</span>
                      <span style={{ color: '#10B981', fontWeight: 700 }}>98% MATCH</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.75rem' }}>
                      <span style={{ color: '#D1D5DB' }}>TXN-4003 ICICI ↔ Razorpay (Fee)</span>
                      <span style={{ color: '#F59E0B', fontWeight: 700 }}>71% FLAGGED</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                      <span style={{ color: '#D1D5DB' }}>TXN-4006 Axis ↔ Razorpay (₹1,700)</span>
                      <span style={{ color: '#EF4444', fontWeight: 700 }}>48% MISMATCH</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.74rem', color: '#9CA3AF', marginBottom: 8 }}>HEALTH SCORE METER</div>
                  <div style={{ background: '#0D0D11', borderRadius: 14, padding: 14, border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                    <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#FE4A23', lineHeight: 1 }}>92</div>
                    <div style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 700, marginTop: 4 }}>GRADE A (OPTIMAL)</div>
                    <div style={{ fontSize: '0.68rem', color: '#6B7280', marginTop: 2 }}>Sub-second resolution velocity</div>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Controls */}
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <Link
                  href="/dashboard/reconciliation"
                  style={{
                    flex: 1,
                    textDecoration: 'none',
                    background: '#FE4A23',
                    color: '#FFFFFF',
                    padding: '9px',
                    borderRadius: 10,
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    textAlign: 'center'
                  }}
                >
                  Inspect Live Ticker
                </Link>
                <Link
                  href="/portal"
                  style={{
                    flex: 1,
                    textDecoration: 'none',
                    background: 'rgba(255,255,255,0.06)',
                    color: '#FFFFFF',
                    padding: '9px',
                    borderRadius: 10,
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    textAlign: 'center'
                  }}
                >
                  Stream 10K Rows
                </Link>
              </div>
            </div>
          </div>

          {/* Mobile Phone Mockup Frame */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 36,
              padding: '18px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
              border: '6px solid #0D0D11',
              maxWidth: 320,
              margin: '0 auto'
            }}
          >
            {/* Phone Dynamic Island */}
            <div style={{ width: 80, height: 18, background: '#0D0D11', borderRadius: 999, margin: '0 auto 18px' }} />

            <div style={{ padding: '0 6px' }}>
              <div style={{ fontSize: '0.74rem', color: '#6B7280', fontWeight: 700 }}>CASHFLOW FORECAST</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0D0D11', marginTop: 2 }}>
                ₹8,42,510
              </div>
              <div style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 700, marginBottom: 14 }}>
                +14.2% projected (90% Conf.)
              </div>

              {/* Mini Prophet bars */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 75, marginBottom: 16 }}>
                {[35, 55, 42, 70, 85, 60, 92].map((val, idx) => (
                  <div
                    key={idx}
                    style={{
                      flex: 1,
                      height: `${val}%`,
                      borderRadius: 4,
                      background: idx === 6 ? '#FE4A23' : '#FFD028'
                    }}
                  />
                ))}
              </div>

              <div style={{ background: '#F6F6F9', borderRadius: 14, padding: 12, marginBottom: 12 }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0D0D11' }}>Night-Shift Autonomous</div>
                <div style={{ fontSize: '0.66rem', color: '#6B7280', marginTop: 2 }}>02:00 AM IST scheduled run</div>
              </div>

              <Link
                href="/dashboard/overview"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  textDecoration: 'none',
                  background: '#0D0D11',
                  color: '#FFFFFF',
                  padding: '9px',
                  borderRadius: 999,
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}
              >
                <span>Open Controller</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
