'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, Minus, Search, ArrowUpRight } from 'lucide-react';

export function WordmarkSection() {
  const [openAccordion, setOpenAccordion] = useState<number | null>(0);

  const accordions = [
    {
      title: 'A/B Testing & Neural Matcher',
      detail: 'Dual-phase embedding distance with LoRA adapter and Shannon entropy feature extraction.'
    },
    {
      title: 'Trend Analysis & Prophet Forecasting',
      detail: 'Additive daily cash-flow forecasting with 90% confidence uncertainty intervals.'
    },
    {
      title: 'User Segmentation & Multi-Merchant Fleet',
      detail: 'Fleet-wide Z-score outlier detection identifying merchant anomalies beyond |z| >= 1.8.'
    }
  ];

  return (
    <section
      id="tools"
      style={{
        padding: '90px 24px 130px',
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
          fontSize: 'clamp(9rem, 26vw, 24rem)',
          fontWeight: 900,
          color: '#FE4A23',
          letterSpacing: '-0.06em',
          userSelect: 'none',
          pointerEvents: 'none',
          zIndex: 1,
          lineHeight: 0.85
        }}
      >
        Ledgr
      </div>

      <div style={{ position: 'relative', zIndex: 5 }}>
        {/* Top Headline */}
        <div style={{ marginBottom: 48 }}>
          <h2
            style={{
              fontFamily: "'Urbanist', sans-serif",
              fontSize: 'clamp(2.4rem, 4.8vw, 4.2rem)',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              color: '#0D0D11',
              lineHeight: 1.06,
              maxWidth: 750
            }}
          >
            Turning data into real actions and ideas
          </h2>
        </div>

        {/* 3-Column Layout: Accordion on Left, iPhone & Laptop Mockups on Right */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.6fr',
            gap: 40,
            alignItems: 'center'
          }}
        >
          {/* Left Column: Accordion Items (from video 00:34) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {accordions.map((item, idx) => {
              const isOpen = openAccordion === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setOpenAccordion(isOpen ? null : idx)}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: 18,
                    padding: '20px 24px',
                    border: '1px solid rgba(0,0,0,0.06)',
                    boxShadow: '0 4px 18px rgba(0,0,0,0.03)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0D0D11' }}>
                      {item.title}
                    </span>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: '#F6F6F9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#0D0D11'
                      }}
                    >
                      {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                    </div>
                  </div>

                  {isOpen && (
                    <p style={{ fontSize: '0.86rem', color: '#6B7280', marginTop: 12, margin: '12px 0 0', lineHeight: 1.5 }}>
                      {item.detail}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Column: Layered iPhone & Laptop Frames (from video 00:35) */}
          <div style={{ position: 'relative', minHeight: 460 }}>
            {/* Laptop Frame (Behind) */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '82%',
                background: '#FFFFFF',
                borderRadius: 24,
                padding: '20px 24px',
                border: '1px solid rgba(0,0,0,0.08)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
                zIndex: 6
              }}
            >
              {/* Laptop Header Bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#FE4A23', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '0.65rem', color: '#FFFFFF', fontWeight: 900 }}>L</span>
                  </div>
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0D0D11' }}>ledgr</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#F6F6F9', padding: '4px 12px', borderRadius: 999, fontSize: '0.74rem', color: '#9CA3AF' }}>
                  <Search size={12} />
                  <span>Search</span>
                </div>
              </div>

              {/* Laptop Metric & Mountain Chart */}
              <div>
                <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>Revenue amount</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0D0D11', fontFamily: "'Urbanist', sans-serif" }}>$ 1 342,567</span>
                  <span style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: 800, background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: 999 }}>+2.1%</span>
                </div>
              </div>

              {/* Red Jagged Mountain Chart */}
              <div style={{ height: 90, margin: '10px 0' }}>
                <svg width="100%" height="100%" viewBox="0 0 300 90" preserveAspectRatio="none">
                  <path
                    d="M 0,75 L 20,60 L 40,70 L 60,45 L 80,60 L 100,35 L 120,50 L 140,25 L 160,40 L 180,18 L 200,35 L 220,12 L 240,28 L 260,8 L 280,22 L 300,10 L 300,90 L 0,90 Z"
                    fill="#FE4A23"
                  />
                </svg>
              </div>

              {/* Metric Widgets (Daily statistics, Average order) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, paddingTop: 12, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#6B7280' }}>Daily statistics</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0D0D11' }}>$ 132.4K</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#6B7280' }}>Average order</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0D0D11' }}>$ 1,090</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#6B7280' }}>Visit statistics</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#10B981' }}>+58%</div>
                </div>
              </div>
            </div>

            {/* iPhone Frame (In Front, overlapping left) */}
            <div
              style={{
                position: 'absolute',
                top: 40,
                left: 0,
                width: '58%',
                background: '#FFFFFF',
                borderRadius: 32,
                padding: '16px',
                boxShadow: '0 24px 70px rgba(0,0,0,0.18)',
                border: '4px solid #0D0D11',
                zIndex: 10
              }}
            >
              {/* Dynamic Island */}
              <div style={{ width: 60, height: 14, background: '#0D0D11', borderRadius: 999, margin: '0 auto 12px' }} />

              <div style={{ fontSize: '0.66rem', color: '#6B7280' }}>Revenue amount</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0D0D11' }}>$1 342,567</span>
                <span style={{ fontSize: '0.64rem', color: '#10B981', fontWeight: 800 }}>+2.1%</span>
              </div>

              {/* Red Mountain Wave */}
              <div style={{ height: 60, margin: '6px 0' }}>
                <svg width="100%" height="100%" viewBox="0 0 200 60" preserveAspectRatio="none">
                  <path
                    d="M 0,50 L 20,38 L 40,46 L 60,30 L 80,42 L 100,22 L 120,34 L 140,16 L 160,28 L 180,10 L 200,20 L 200,60 L 0,60 Z"
                    fill="#FE4A23"
                  />
                </svg>
              </div>

              {/* Data report row */}
              <div style={{ background: '#F6F6F9', borderRadius: 12, padding: '8px 10px', display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: '0.62rem', color: '#6B7280' }}>Total profit</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0D0D11' }}>$ 264.2K</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.62rem', color: '#6B7280' }}>Revenue</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0D0D11' }}>$ 132.4K</div>
                </div>
              </div>

              {/* Colorful Mini Bars */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 45 }}>
                {[30, 65, 45, 90, 55, 80, 40].map((h, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: `${h}%`,
                      borderRadius: 2,
                      background: i % 2 === 0 ? '#FE4A23' : '#FFD028'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
