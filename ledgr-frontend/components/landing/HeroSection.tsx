'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Zap,
  ArrowUpRight,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Play,
  Layers,
  Activity,
  CheckCircle2
} from 'lucide-react';

export function HeroSection() {
  const [isPlaying, setIsPlaying] = useState(true);

  return (
    <section
      style={{
        padding: '120px 24px 70px',
        maxWidth: 1240,
        margin: '0 auto',
        position: 'relative'
      }}
      aria-label="Hero Section"
    >
      {/* Top Headline Block with Embedded Badges & Right Live Chart Preview */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.4fr 0.9fr',
          gap: 40,
          alignItems: 'center',
          marginBottom: 60
        }}
      >
        {/* Left: Punchy Ramos-style embedded headline */}
        <div>
          <div
            style={{
              fontFamily: "'Urbanist', sans-serif",
              fontSize: 'clamp(2.8rem, 5.2vw, 4.8rem)',
              fontWeight: 800,
              lineHeight: 1.04,
              letterSpacing: '-0.04em',
              color: '#0D0D11'
            }}
          >
            {/* Headline Row 1 */}
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.25em' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '0.85em',
                  height: '0.85em',
                  borderRadius: '0.35em',
                  background: '#FE4A23',
                  boxShadow: '0 4px 14px rgba(254,74,35,0.4)',
                  verticalAlign: 'middle'
                }}
              >
                <Zap size={22} color="#FFFFFF" fill="#FFFFFF" />
              </span>

              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '0.85em',
                  height: '0.85em',
                  borderRadius: '999px',
                  background: '#FFD028',
                  boxShadow: '0 4px 12px rgba(255,208,40,0.4)',
                  verticalAlign: 'middle',
                  fontSize: '0.5em',
                  fontWeight: 900,
                  color: '#0D0D11'
                }}
              >
                AI
              </span>

              <span>Analytics</span>
            </div>

            {/* Headline Row 2 */}
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.25em' }}>
              <span>that</span>
              <span
                style={{
                  fontStyle: 'italic',
                  fontWeight: 400,
                  color: '#6B7280',
                  padding: '0 0.1em'
                }}
              >
                helps
              </span>
              <span>you</span>
            </div>

            {/* Headline Row 3 */}
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.25em' }}>
              <span>shape</span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '0.8em',
                  height: '0.8em',
                  borderRadius: '999px',
                  background: '#FFD028',
                  boxShadow: '0 4px 14px rgba(255,208,40,0.4)',
                  verticalAlign: 'middle'
                }}
              >
                <Sparkles size={18} color="#0D0D11" />
              </span>
              <span>the future</span>
            </div>
          </div>
        </div>

        {/* Right: Floating live preview card with waveform & play button */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 24,
            padding: 24,
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.06), 0 2px 6px rgba(0,0,0,0.02)',
            border: '1px solid rgba(0, 0, 0, 0.06)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: '#FE4A23',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(254,74,35,0.4)'
                }}
                onClick={() => setIsPlaying(!isPlaying)}
              >
                <Play size={14} color="#FFFFFF" fill="#FFFFFF" style={{ marginLeft: 2 }} />
              </div>
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0D0D11' }}>Live Reconciliation Telemetry</div>
                <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>8-Agent Relay • Active Stream</div>
              </div>
            </div>

            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#10B981',
                background: 'rgba(16, 185, 129, 0.1)',
                padding: '3px 9px',
                borderRadius: 999,
                display: 'flex',
                alignItems: 'center',
                gap: 5
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} />
              99.8% ACCURACY
            </span>
          </div>

          {/* SVG waveform */}
          <div style={{ height: 110, position: 'relative', margin: '10px 0' }}>
            <svg width="100%" height="100%" viewBox="0 0 320 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="heroWave" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FE4A23" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#FE4A23" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 0,70 Q 40,25 80,65 T 160,30 T 240,55 T 320,15 L 320,100 L 0,100 Z"
                fill="url(#heroWave)"
              />
              <path
                d="M 0,70 Q 40,25 80,65 T 160,30 T 240,55 T 320,15"
                fill="none"
                stroke="#FE4A23"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>Settlement Throughput</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0D0D11' }}>2,450 records/sec</div>
            </div>
            <Link
              href="/portal"
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#FE4A23',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <span>10K Partner Feed</span>
              <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>
      </div>

      {/* Dual Signature Bento Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.3fr 1fr',
          gap: 24,
          alignItems: 'stretch'
        }}
      >
        {/* Card 1: Warm off-white card */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 28,
            padding: '36px 36px 32px',
            border: '1px solid rgba(0, 0, 0, 0.06)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#FE4A23',
                  background: 'rgba(254,74,35,0.1)',
                  padding: '3px 10px',
                  borderRadius: 999
                }}
              >
                AUTONOMOUS MATCHING
              </span>
            </div>
            <h3
              style={{
                fontFamily: "'Urbanist', sans-serif",
                fontSize: '1.75rem',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                color: '#0D0D11',
                lineHeight: 1.15,
                marginBottom: 10
              }}
            >
              Your key to strategic financial control
            </h3>
            <p style={{ fontSize: '0.92rem', color: '#6B7280', lineHeight: 1.5, maxWidth: 440 }}>
              Ledgr normalizes bank statements, gateway payouts, and ERP records into unified cryptographic ledger blocks with sub-second resolution.
            </p>
          </div>

          <div
            style={{
              background: '#F6F6F9',
              borderRadius: 20,
              padding: '20px 24px',
              marginTop: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ fontSize: '0.74rem', color: '#6B7280', fontWeight: 600 }}>Total Reconciled Volume</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0D0D11', marginTop: 2 }}>
                ₹1,31,424.00
              </div>
              <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 700 }}>+131.2% vs previous period</span>
            </div>

            <Link
              href="/dashboard/reconciliation"
              style={{
                textDecoration: 'none',
                background: '#FE4A23',
                color: '#FFFFFF',
                padding: '10px 22px',
                borderRadius: 999,
                fontSize: '0.86rem',
                fontWeight: 700,
                boxShadow: '0 4px 14px rgba(254,74,35,0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <span>Analyze</span>
              <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>

        {/* Card 2: Deep black #0D0D11 card */}
        <div
          style={{
            background: '#0D0D11',
            color: '#FFFFFF',
            borderRadius: 28,
            padding: '36px 32px 32px',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Subtle amber gradient glow */}
          <div
            style={{
              position: 'absolute',
              top: '-20%',
              right: '-20%',
              width: 250,
              height: 250,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(254,74,35,0.25) 0%, transparent 70%)',
              pointerEvents: 'none'
            }}
          />

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
              {/* Dual Avatars */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #FE4A23, #FF8C00)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #0D0D11',
                    fontSize: '0.8rem',
                    fontWeight: 800
                  }}
                >
                  AI
                </div>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #3B82F6, #10B981)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #0D0D11',
                    marginLeft: -14,
                    fontSize: '0.8rem',
                    fontWeight: 800
                  }}
                >
                  SEC
                </div>
              </div>

              <div>
                <div style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1 }}>
                  43K<span style={{ color: '#FE4A23', fontSize: '0.8em' }}>+</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#9CA3AF', fontWeight: 600 }}>Transactions cleared</div>
              </div>
            </div>

            <p style={{ fontSize: '0.94rem', color: '#D1D5DB', lineHeight: 1.5, margin: '0 0 24px' }}>
              Transactions cleared automatically with 100% cryptographic ledger sealing and real-time SHA-256 audit trails.
            </p>
          </div>

          <div
            style={{
              paddingTop: 20,
              borderTop: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldCheck size={18} color="#10B981" />
              <span style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>Zero-Knowledge Ledger Proofs</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#FFD028', fontWeight: 700 }}>TIER 1+2+3 ACTIVE</span>
          </div>
        </div>
      </div>
    </section>
  );
}
