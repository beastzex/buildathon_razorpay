'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Play, Pause, ArrowUpRight } from 'lucide-react';

export function HeroSection() {
  const [activeCardView, setActiveCardView] = useState<0 | 1 | 2>(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Auto cycle card views when playing
  React.useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setActiveCardView((prev) => ((prev + 1) % 3) as 0 | 1 | 2);
    }, 3200);
    return () => clearInterval(timer);
  }, [isPlaying]);

  return (
    <section
      style={{
        padding: '130px 24px 80px',
        maxWidth: 1240,
        margin: '0 auto',
        position: 'relative'
      }}
      aria-label="Hero Section"
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.25fr 0.95fr',
          gap: 40,
          alignItems: 'center'
        }}
      >
        {/* Left: EXACT Ramos Headline */}
        <div>
          <div
            style={{
              fontFamily: "'Urbanist', sans-serif",
              fontSize: 'clamp(3.2rem, 5.8vw, 5.4rem)',
              fontWeight: 800,
              lineHeight: 1.04,
              letterSpacing: '-0.04em',
              color: '#0D0D11'
            }}
          >
            {/* Line 1: [⚡ in coral circle] [📈 in red circle overlapping] Analytics */}
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'nowrap', gap: 0, marginBottom: '0.04em' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', position: 'relative', marginRight: '0.2em' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '0.86em',
                    height: '0.86em',
                    borderRadius: '50%',
                    background: '#FFEBE7',
                    boxShadow: '0 2px 10px rgba(254,74,35,0.2)',
                    zIndex: 1
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="#FE4A23" />
                  </svg>
                </span>

                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '0.86em',
                    height: '0.86em',
                    borderRadius: '50%',
                    background: '#FE4A23',
                    marginLeft: '-0.24em',
                    boxShadow: '0 4px 14px rgba(254,74,35,0.4)',
                    zIndex: 2
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M3 17L9 11L13 15L21 7" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="21" cy="7" r="2.2" fill="#FFFFFF" />
                  </svg>
                </span>
              </div>

              <span>Analytics</span>
            </div>

            {/* Line 2: that [helps in soft elegant light gray] you */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.24em', marginBottom: '0.04em' }}>
              <span>that</span>
              <span
                style={{
                  fontWeight: 400,
                  color: '#B0B0BD',
                  padding: '0 0.04em'
                }}
              >
                helps
              </span>
              <span>you</span>
            </div>

            {/* Line 3: shape [🟡 yellow circle with 3 equalizer bars] the future */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.24em' }}>
              <span>shape</span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '0.84em',
                  height: '0.84em',
                  borderRadius: '50%',
                  background: '#FFD028',
                  verticalAlign: 'middle',
                  boxShadow: '0 4px 14px rgba(255,208,40,0.45)',
                  gap: 3.5,
                  padding: '0 4px'
                }}
              >
                <span style={{ width: 3, height: 10, background: '#0D0D11', borderRadius: 999 }} />
                <span style={{ width: 3, height: 16, background: '#0D0D11', borderRadius: 999 }} />
                <span style={{ width: 3, height: 12, background: '#0D0D11', borderRadius: 999 }} />
              </span>
              <span>the future</span>
            </div>
          </div>

          {/* Direct Navigation & Quick Action Buttons (Tactile Neo-Brutalist) */}
          <div style={{ marginTop: 38, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <Link
              href="/dashboard/reconciliation"
              style={{
                textDecoration: 'none',
                background: '#FE4A23',
                color: '#FFFFFF',
                borderRadius: 14,
                border: '2px solid #0D0D11',
                padding: '14px 28px',
                fontSize: '0.94rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '4px 4px 0px #0D0D11',
                transition: 'all 0.12s ease'
              }}
              className="hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[2px] active:translate-y-[2px]"
            >
              <span>Launch Live AI Dashboard</span>
              <ArrowUpRight size={17} />
            </Link>

            <Link
              href="/portal"
              style={{
                textDecoration: 'none',
                background: '#FFFFFF',
                color: '#0D0D11',
                border: '2px solid #0D0D11',
                borderRadius: 14,
                padding: '14px 26px',
                fontSize: '0.92rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '4px 4px 0px #0D0D11',
                transition: 'all 0.12s ease'
              }}
              className="hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[2px] active:translate-y-[2px]"
            >
              <span>10,000 Data Portal</span>
              <ArrowUpRight size={16} color="#FE4A23" />
            </Link>
          </div>

          {/* Micro Telemetry Bar */}
          <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 18, fontSize: '0.78rem', color: '#6B7280' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 8px #10B981' }} />
              <span style={{ fontWeight: 700, color: '#0D0D11' }}>8-Agent Relay Mesh</span>
            </div>
            <span>•</span>
            <span>Sub-second Forensic Audit</span>
            <span>•</span>
            <span>Razorpay / UPI / Cards Rails</span>
          </div>
        </div>

        {/* Right: EXACT Ramos Floating Interactive Preview Card */}
        <div style={{ position: 'relative' }}>
          {/* Floating red Play/Pause button on top-left of card */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              position: 'absolute',
              top: -18,
              left: 20,
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: '#FE4A23',
              border: '3px solid #FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 6px 18px rgba(254,74,35,0.45)',
              zIndex: 20
            }}
            aria-label="Toggle preview animation"
          >
            {isPlaying ? (
              <Pause size={16} color="#FFFFFF" fill="#FFFFFF" />
            ) : (
              <Play size={16} color="#FFFFFF" fill="#FFFFFF" style={{ marginLeft: 2 }} />
            )}
          </button>

          {/* Main Card */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 28,
              padding: '30px 28px 24px',
              boxShadow: '0 16px 45px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.03)',
              border: '1px solid rgba(0, 0, 0, 0.06)',
              position: 'relative',
              overflow: 'hidden',
              minHeight: 280,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            {/* View 0: Ramos Red Mountain Wave View */}
            {activeCardView === 0 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FE4A23' }} />
                      Transactions
                    </div>
                    <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#0D0D11', fontFamily: "'Urbanist', sans-serif", letterSpacing: '-0.03em', marginTop: 2 }}>
                      $1 317.571
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', fontSize: '0.78rem', color: '#9CA3AF' }}>
                    <div style={{ color: '#0D0D11', fontWeight: 700 }}>12 895.48</div>
                    <div style={{ color: '#FE4A23', fontWeight: 700 }}>1 272.14</div>
                  </div>
                </div>

                {/* Fiery Red Mountain Area Graph with Jagged Peaks (from Ramos video) */}
                <div style={{ height: 130, position: 'relative', margin: '14px 0 6px' }}>
                  <svg width="100%" height="100%" viewBox="0 0 320 120" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="ramosMountain" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#FE4A23" stopOpacity="0.95" />
                        <stop offset="100%" stopColor="#FE4A23" stopOpacity="0.8" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 0,95 L 20,80 L 40,90 L 60,65 L 80,75 L 100,50 L 120,68 L 140,40 L 160,55 L 180,30 L 200,45 L 220,20 L 240,35 L 260,15 L 280,30 L 300,10 L 320,25 L 320,120 L 0,120 Z"
                      fill="url(#ramosMountain)"
                    />
                  </svg>
                </div>
              </div>
            )}

            {/* View 1: Ramos Sales Report with Bar Chart (from video 00:16) */}
            {activeCardView === 1 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0D0D11' }}>Sales statistic</span>
                  <span style={{ fontSize: '0.74rem', background: '#F6F6F9', padding: '3px 8px', borderRadius: 6, color: '#6B7280' }}>Weekly report</span>
                </div>

                <div style={{ display: 'flex', gap: 18, alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>Total profit</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0D0D11' }}>$ 264.2K</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>Visitors</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0D0D11' }}>56K</div>
                  </div>
                  <div style={{ marginLeft: 'auto', background: '#FE4A23', color: '#FFFFFF', fontSize: '0.72rem', fontWeight: 800, padding: '4px 10px', borderRadius: 999 }}>
                    Rate +58%
                  </div>
                </div>

                {/* Staggered colorful bar chart */}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 90, padding: '0 10px' }}>
                  {[40, 75, 55, 95, 60, 85, 45, 90].map((h, idx) => (
                    <div
                      key={idx}
                      style={{
                        flex: 1,
                        height: `${h}%`,
                        borderRadius: 4,
                        background: idx % 2 === 0 ? '#FE4A23' : '#FFD028'
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* View 2: Ramos Share of Sales 48% (from video 00:14) */}
            {activeCardView === 2 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0D0D11' }}>Share of sales</span>
                  <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 700 }}>+14.2% YoY</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 16 }}>
                  <div style={{ fontSize: '3rem', fontWeight: 900, color: '#0D0D11', fontFamily: "'Urbanist', sans-serif" }}>
                    53<span style={{ fontSize: '0.6em', color: '#FE4A23' }}>%</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#6B7280', lineHeight: 1.4 }}>
                    Clear status indicators with sub-millisecond AI consensus verification
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ flex: 1, background: '#F6F6F9', padding: 10, borderRadius: 10, textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: '#6B7280' }}>Desktop</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0D0D11' }}>34,078</div>
                  </div>
                  <div style={{ flex: 1, background: '#F6F6F9', padding: 10, borderRadius: 10, textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: '#6B7280' }}>Mobile</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0D0D11' }}>28,412</div>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Card Navigation Dots */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid rgba(0,0,0,0.05)', marginTop: 8 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {[0, 1, 2].map((i) => (
                  <button
                    key={i}
                    onClick={() => setActiveCardView(i as 0 | 1 | 2)}
                    style={{
                      width: activeCardView === i ? 22 : 8,
                      height: 8,
                      borderRadius: 999,
                      background: activeCardView === i ? '#FE4A23' : '#E5E7EB',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  />
                ))}
              </div>

              <Link
                href="/dashboard/reconciliation"
                style={{
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  color: '#FE4A23',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <span>Live Analytics</span>
                <ArrowUpRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
