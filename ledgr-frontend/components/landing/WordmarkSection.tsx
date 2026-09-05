'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, Minus, Search, ArrowUpRight, Menu, Bell, SlidersHorizontal } from 'lucide-react';

export function WordmarkSection() {
  const [openAccordion, setOpenAccordion] = useState<number | null>(0);

  const accordions = [
    {
      title: 'BGE-small LoRA Neural Matcher & Rules',
      detail: 'Dual-phase embedding distance with fine-tuned LoRA adapter accelerated on CUDA, coupled with exact paisa balance verifiers and token containment.'
    },
    {
      title: 'Multi-Agent Consensus Debate (GPT-OSS-120B)',
      detail: 'Adversarial Advocate FOR vs Advocate AGAINST debate with an automated Consensus Arbiter resolving ambiguous fee drifts and settlement variances.'
    },
    {
      title: 'Real-Time Cash Flow Prophet Forecasting',
      detail: 'Additive daily cash-flow forecasting with 90% confidence uncertainty intervals, weekend liquidity dip prediction, and Monte Carlo stress testing for 10k–100k records.'
    },
    {
      title: 'Multi-Modal Slip OCR & Cryptographic Audit',
      detail: 'Cross-references physical deposit slips, invoices, and bank statements with SHA-256 genesis-to-leaf tamper-evident cryptographic chaining.'
    }
  ];

  return (
    <section
      id="tools"
      style={{
        padding: '90px 24px 100px',
        maxWidth: 1260,
        margin: '0 auto',
        position: 'relative'
      }}
      aria-label="Turning Data into Real Actions"
    >
      <div>
        {/* Top Headline */}
        <div style={{ marginBottom: 48 }}>
          <h2
            style={{
              fontFamily: "'Urbanist', sans-serif",
              fontSize: 'clamp(2.4rem, 5vw, 4.2rem)',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              color: '#0D0D11',
              lineHeight: 1.05,
              maxWidth: 780,
              margin: 0
            }}
          >
            Architected for enterprise payment rails & zero-leakage treasury
          </h2>
        </div>

        {/* 2-Column Responsive Layout: Pill Accordion on Left, Layered iPad & iPhone Mockups on Right */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: 40,
            alignItems: 'center'
          }}
        >
          {/* Left Column: Interactive White Pill Accordion (from video Frame 018) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {accordions.map((item, idx) => {
              const isOpen = openAccordion === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setOpenAccordion(isOpen ? null : idx)}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: 24,
                    padding: '24px 28px',
                    border: isOpen ? '2px solid #0D0D11' : '1px solid rgba(0,0,0,0.08)',
                    boxShadow: isOpen
                      ? '4px 4px 0px #0D0D11'
                      : '0 4px 18px rgba(0,0,0,0.03)',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <span
                      style={{
                        fontSize: '1.08rem',
                        fontWeight: 800,
                        color: '#0D0D11',
                        letterSpacing: '-0.02em'
                      }}
                    >
                      {item.title}
                    </span>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: isOpen ? '#0D0D11' : '#F6F6F9',
                        color: isOpen ? '#FFFFFF' : '#0D0D11',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                    </div>
                  </div>

                  {isOpen && (
                    <p
                      style={{
                        fontSize: '0.9rem',
                        color: '#6B7280',
                        marginTop: 14,
                        lineHeight: 1.55,
                        margin: '14px 0 0'
                      }}
                    >
                      {item.detail}
                    </p>
                  )}
                </div>
              );
            })}

            {/* Quick Action to Dashboard */}
            <div style={{ marginTop: 8 }}>
              <Link
                href="/dashboard/reconciliation"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  color: '#FE4A23',
                  textDecoration: 'none',
                  padding: '8px 0'
                }}
              >
                <span>Open Full Neural Matcher in Dashboard</span>
                <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>

          {/* Right Column: Layered Hardware Mockups (iPad Pro behind, iPhone 16 Pro in front) */}
          <div style={{ position: 'relative', minHeight: 460, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            {/* iPad Pro Tablet Screen (Behind, matching Ramos Frame 018) */}
            <div
              style={{
                width: '92%',
                background: '#FFFFFF',
                borderRadius: 32,
                border: '10px solid #1C1C1E',
                boxShadow: '0 25px 60px rgba(0,0,0,0.12)',
                overflow: 'hidden',
                position: 'relative',
                zIndex: 2
              }}
            >
              {/* Dark iPad Top Bar */}
              <div style={{ background: '#141416', padding: '10px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#FE4A23', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '0.65rem', color: '#FFFFFF', fontWeight: 900 }}>L</span>
                  </div>
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#FFFFFF' }}>ledgr</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: 999, fontSize: '0.72rem', color: '#9CA3AF' }}>
                  <Search size={12} color="#9CA3AF" />
                  <span>Search</span>
                </div>
              </div>

              {/* iPad Body Content */}
              <div style={{ padding: '20px 22px' }}>
                <div style={{ fontSize: '0.74rem', color: '#6B7280' }}>Revenue amount</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: '1.9rem', fontWeight: 900, color: '#0D0D11', fontFamily: "'Urbanist', sans-serif" }}>
                    $1 342,567
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 800, background: 'rgba(16,185,129,0.12)', padding: '3px 9px', borderRadius: 999 }}>
                    +21%
                  </span>
                </div>

                {/* Stepped red mountain chart */}
                <div style={{ height: 85, margin: '14px 0 16px' }}>
                  <svg width="100%" height="100%" viewBox="0 0 300 85" preserveAspectRatio="none">
                    <path
                      d="M 0,70 L 25,55 L 50,65 L 75,40 L 100,55 L 125,30 L 150,45 L 175,20 L 200,38 L 225,12 L 250,28 L 275,10 L 300,18 L 300,85 L 0,85 Z"
                      fill="#FE4A23"
                    />
                  </svg>
                </div>

                {/* Tab Navigation Pill Bar (from Ramos Frame 018) */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 14, overflowX: 'auto', paddingBottom: 4 }}>
                  {['Dashboard', 'Reports', 'Documents', 'History', 'Settings'].map((tab, i) => (
                    <span
                      key={tab}
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: 6,
                        background: i === 0 ? '#0D0D11' : '#F6F6F9',
                        color: i === 0 ? '#FFFFFF' : '#6B7280'
                      }}
                    >
                      {tab}
                    </span>
                  ))}
                </div>

                {/* Sub Bento Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, paddingTop: 12, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: '#6B7280' }}>Sales revenue</div>
                    <div style={{ fontSize: '0.96rem', fontWeight: 900, color: '#0D0D11' }}>$ 132.4K</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: '#6B7280' }}>Average bill</div>
                    <div style={{ fontSize: '0.96rem', fontWeight: 900, color: '#0D0D11' }}>$ 1,090</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: '#6B7280' }}>Visit statistics</div>
                    <div style={{ fontSize: '0.96rem', fontWeight: 900, color: '#10B981' }}>+58%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* High-Fidelity iPhone 16 Pro Mockup (In Front, matching Ramos video Frame 018) */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '2%',
                transform: 'translateY(-50%)',
                width: 260,
                background: '#FFFFFF',
                borderRadius: 42,
                padding: '10px 12px 16px',
                border: '9px solid #1C1C1E',
                boxShadow: '0 30px 80px rgba(0,0,0,0.28), 0 4px 14px rgba(0,0,0,0.15)',
                zIndex: 8
              }}
            >
              {/* iPhone Dynamic Island */}
              <div
                style={{
                  width: 90,
                  height: 22,
                  background: '#0D0D11',
                  borderRadius: 999,
                  margin: '2px auto 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  paddingRight: 8
                }}
              >
                {/* Front camera lens reflection */}
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#1F2937' }} />
              </div>

              {/* iPhone Screen Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, padding: '0 4px' }}>
                <Menu size={15} color="#0D0D11" />
                <Bell size={14} color="#0D0D11" />
              </div>

              {/* Revenue Header Inside iPhone */}
              <div style={{ padding: '0 4px' }}>
                <div style={{ fontSize: '0.66rem', color: '#6B7280' }}>Revenue amount</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                  <span style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0D0D11', fontFamily: "'Urbanist', sans-serif" }}>
                    $1 342,567
                  </span>
                  <span style={{ fontSize: '0.62rem', color: '#10B981', fontWeight: 800, background: 'rgba(16,185,129,0.12)', padding: '2px 6px', borderRadius: 999 }}>
                    +21%
                  </span>
                </div>
              </div>

              {/* Red Stepped Mountain Wave Inside iPhone */}
              <div style={{ height: 55, margin: '8px 0' }}>
                <svg width="100%" height="100%" viewBox="0 0 200 55" preserveAspectRatio="none">
                  <path
                    d="M 0,45 L 18,32 L 36,40 L 54,24 L 72,36 L 90,18 L 108,30 L 126,14 L 144,26 L 162,8 L 180,20 L 200,6 L 200,55 L 0,55 Z"
                    fill="#FE4A23"
                  />
                </svg>
              </div>

              {/* Data report row with Filter */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2px 4px', marginBottom: 8 }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0D0D11' }}>Data report</span>
                <span style={{ fontSize: '0.62rem', color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span>Filter</span>
                  <SlidersHorizontal size={10} />
                </span>
              </div>

              {/* Mini Bento Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 8 }}>
                <div style={{ background: '#F6F6F9', borderRadius: 10, padding: '6px 8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#FE4A23' }} />
                    <span style={{ fontSize: '0.6rem', color: '#6B7280' }}>Total profit</span>
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0D0D11' }}>$ 264.2K</div>
                </div>

                <div style={{ background: '#F6F6F9', borderRadius: 10, padding: '6px 8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#FFD028' }} />
                    <span style={{ fontSize: '0.6rem', color: '#6B7280' }}>Sales revenue</span>
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0D0D11' }}>$ 132.4K</div>
                </div>
              </div>

              {/* Sales statistic colorful bar chart inside iPhone */}
              <div style={{ background: '#FFFFFF', borderRadius: 10, border: '1px solid rgba(0,0,0,0.06)', padding: '6px 8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: '0.64rem', fontWeight: 800, color: '#0D0D11' }}>Sales statistic</span>
                  <span style={{ fontSize: '0.58rem', color: '#10B981', fontWeight: 700 }}>+40%</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 38 }}>
                  {[35, 75, 45, 90, 60, 80, 50].map((val, i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: `${val}%`,
                        borderRadius: 3,
                        background: i % 2 === 0 ? '#6366F1' : '#FFD028'
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* iPhone Home Indicator Bar */}
              <div
                style={{
                  width: 90,
                  height: 4,
                  background: '#0D0D11',
                  borderRadius: 999,
                  margin: '12px auto 2px'
                }}
              />
            </div>
          </div>
        </div>

        {/* Giant Red Brand Wordmark Transition (from video Frame 019-020, with clean spacing) */}
        <div
          style={{
            marginTop: 80,
            textAlign: 'center',
            userSelect: 'none',
            pointerEvents: 'none',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              fontFamily: "'Urbanist', sans-serif",
              fontSize: 'clamp(8rem, 24vw, 21rem)',
              fontWeight: 900,
              color: '#FE4A23',
              letterSpacing: '-0.06em',
              lineHeight: 0.82,
              margin: '0 auto',
              display: 'inline-block'
            }}
          >
            Ledgr
          </div>
        </div>
      </div>
    </section>
  );
}

