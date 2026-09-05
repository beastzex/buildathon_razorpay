'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, Minus, Search, ArrowUpRight, Menu, Bell, SlidersHorizontal } from 'lucide-react';

export function WordmarkSection() {
  const [openAccordion, setOpenAccordion] = useState<number | null>(0);

  const accordions = [
    {
      title: 'A/B Testing & Neural Matcher',
      detail: 'Dual-phase embedding distance with fine-tuned LoRA adapter and Shannon entropy feature extraction for sub-second reconciliation.'
    },
    {
      title: 'Trend Analysis & Prophet Forecasting',
      detail: 'Additive daily cash-flow forecasting with 90% confidence uncertainty intervals and seasonal trend decomposition.'
    },
    {
      title: 'User Segmentation & Multi-Merchant Fleet',
      detail: 'Fleet-wide Z-score outlier detection identifying merchant fee drift and settlement lag beyond |z| >= 1.8.'
    }
  ];

  return (
    <section
      id="tools"
      style={{
        padding: '100px 24px 140px',
        maxWidth: 1260,
        margin: '0 auto',
        position: 'relative',
        overflow: 'hidden'
      }}
      aria-label="Turning Data into Real Actions"
    >
      {/* Giant Red Brand Wordmark in Background (from video 00:36) */}
      <div
        style={{
          position: 'absolute',
          bottom: '2%',
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: "'Urbanist', sans-serif",
          fontSize: 'clamp(9rem, 25vw, 22rem)',
          fontWeight: 900,
          color: '#FE4A23',
          letterSpacing: '-0.06em',
          userSelect: 'none',
          pointerEvents: 'none',
          zIndex: 1,
          lineHeight: 0.85,
          opacity: 0.95
        }}
      >
        Ledgr
      </div>

      <div style={{ position: 'relative', zIndex: 5 }}>
        {/* Top Headline */}
        <div style={{ marginBottom: 54 }}>
          <h2
            style={{
              fontFamily: "'Urbanist', sans-serif",
              fontSize: 'clamp(2.5rem, 5.2vw, 4.4rem)',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              color: '#0D0D11',
              lineHeight: 1.05,
              maxWidth: 780
            }}
          >
            Turning data into real actions and ideas
          </h2>
        </div>

        {/* 2-Column Responsive Layout: Accordion on Left, Layered Desktop & iPhone Mockups on Right */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: 48,
            alignItems: 'start'
          }}
        >
          {/* Left Column: Interactive Accordion (from video 00:34) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {accordions.map((item, idx) => {
              const isOpen = openAccordion === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setOpenAccordion(isOpen ? null : idx)}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: 22,
                    padding: '24px 28px',
                    border: isOpen ? '1.5px solid #0D0D11' : '1px solid rgba(0,0,0,0.08)',
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
                        width: 34,
                        height: 34,
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
            <div style={{ marginTop: 12 }}>
              <Link
                href="/dashboard/reconciliation"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: '0.9rem',
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

          {/* Right Column: High-Fidelity Layered Mockups (Desktop behind, iPhone in front) */}
          <div style={{ position: 'relative', minHeight: 520, display: 'flex', justifyContent: 'center' }}>
            {/* Desktop / Laptop Dashboard Screen (Behind) */}
            <div
              style={{
                position: 'absolute',
                top: 10,
                right: 0,
                width: '88%',
                background: '#FFFFFF',
                borderRadius: 26,
                padding: '22px 24px',
                border: '1px solid rgba(0,0,0,0.1)',
                boxShadow: '0 25px 60px rgba(0,0,0,0.09)',
                zIndex: 3
              }}
            >
              {/* Header Bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#FE4A23', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '0.7rem', color: '#FFFFFF', fontWeight: 900 }}>L</span>
                  </div>
                  <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0D0D11' }}>ledgr</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#F6F6F9', padding: '5px 14px', borderRadius: 999, fontSize: '0.76rem', color: '#9CA3AF' }}>
                  <Search size={13} />
                  <span>Search</span>
                </div>
              </div>

              {/* Metric & Mountain Graph */}
              <div>
                <div style={{ fontSize: '0.74rem', color: '#6B7280' }}>Revenue amount</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: '1.9rem', fontWeight: 900, color: '#0D0D11', fontFamily: "'Urbanist', sans-serif" }}>
                    $1 342,567
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 800, background: 'rgba(16,185,129,0.12)', padding: '3px 9px', borderRadius: 999 }}>
                    +2.1%
                  </span>
                </div>
              </div>

              {/* Red Stepped Mountain Wave */}
              <div style={{ height: 85, margin: '12px 0' }}>
                <svg width="100%" height="100%" viewBox="0 0 300 85" preserveAspectRatio="none">
                  <path
                    d="M 0,70 L 25,55 L 50,65 L 75,40 L 100,55 L 125,30 L 150,45 L 175,20 L 200,38 L 225,12 L 250,28 L 275,10 L 300,18 L 300,85 L 0,85 Z"
                    fill="#FE4A23"
                  />
                </svg>
              </div>

              {/* Sub Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, paddingTop: 14, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#6B7280' }}>Sales revenue</div>
                  <div style={{ fontSize: '1rem', fontWeight: 900, color: '#0D0D11' }}>$ 132.4K</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#6B7280' }}>Average bill</div>
                  <div style={{ fontSize: '1rem', fontWeight: 900, color: '#0D0D11' }}>$ 1,090</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#6B7280' }}>Visit statistics</div>
                  <div style={{ fontSize: '1rem', fontWeight: 900, color: '#10B981' }}>+58%</div>
                </div>
              </div>
            </div>

            {/* High-Fidelity iPhone 16 Pro Mockup (In Front, matching Ramos video 00:35) */}
            <div
              style={{
                position: 'relative',
                top: 45,
                left: -35,
                width: 275,
                background: '#FFFFFF',
                borderRadius: 44,
                padding: '12px 14px 18px',
                border: '9px solid #1C1C1E',
                boxShadow: '0 30px 80px rgba(0,0,0,0.25), 0 4px 14px rgba(0,0,0,0.12)',
                zIndex: 8
              }}
            >
              {/* iPhone Dynamic Island */}
              <div
                style={{
                  width: 96,
                  height: 22,
                  background: '#0D0D11',
                  borderRadius: 999,
                  margin: '2px auto 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  paddingRight: 8
                }}
              >
                {/* Front camera lens reflection */}
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#1F2937' }} />
              </div>

              {/* iPhone Screen Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, padding: '0 4px' }}>
                <Menu size={16} color="#0D0D11" />
                <Bell size={15} color="#0D0D11" />
              </div>

              {/* Revenue Header Inside iPhone */}
              <div style={{ padding: '0 4px' }}>
                <div style={{ fontSize: '0.68rem', color: '#6B7280' }}>Revenue amount</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                  <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0D0D11', fontFamily: "'Urbanist', sans-serif" }}>
                    $1 342,567
                  </span>
                  <span style={{ fontSize: '0.64rem', color: '#10B981', fontWeight: 800, background: 'rgba(16,185,129,0.12)', padding: '2px 6px', borderRadius: 999 }}>
                    +21%
                  </span>
                </div>
              </div>

              {/* Red Stepped Mountain Wave Inside iPhone */}
              <div style={{ height: 60, margin: '8px 0' }}>
                <svg width="100%" height="100%" viewBox="0 0 200 60" preserveAspectRatio="none">
                  <path
                    d="M 0,50 L 18,36 L 36,44 L 54,28 L 72,40 L 90,20 L 108,32 L 126,16 L 144,28 L 162,10 L 180,22 L 200,8 L 200,60 L 0,60 Z"
                    fill="#FE4A23"
                  />
                </svg>
              </div>

              {/* Data report row with Filter */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px', marginBottom: 8 }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0D0D11' }}>Data report</span>
                <span style={{ fontSize: '0.64rem', color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span>Filter</span>
                  <SlidersHorizontal size={10} />
                </span>
              </div>

              {/* Mini Bento Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 10 }}>
                <div style={{ background: '#F6F6F9', borderRadius: 12, padding: '8px 10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#FE4A23' }} />
                    <span style={{ fontSize: '0.62rem', color: '#6B7280' }}>Total profit</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0D0D11' }}>$ 264.2K</div>
                </div>

                <div style={{ background: '#F6F6F9', borderRadius: 12, padding: '8px 10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#FFD028' }} />
                    <span style={{ fontSize: '0.62rem', color: '#6B7280' }}>Sales revenue</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0D0D11' }}>$ 132.4K</div>
                </div>
              </div>

              {/* Sales statistic colorful bar chart inside iPhone */}
              <div style={{ background: '#FFFFFF', borderRadius: 12, border: '1px solid rgba(0,0,0,0.06)', padding: '8px 10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: '0.66rem', fontWeight: 800, color: '#0D0D11' }}>Sales statistic</span>
                  <span style={{ fontSize: '0.6rem', color: '#10B981', fontWeight: 700 }}>+40%</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 42 }}>
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
                  width: 100,
                  height: 4,
                  background: '#0D0D11',
                  borderRadius: 999,
                  margin: '14px auto 2px'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
