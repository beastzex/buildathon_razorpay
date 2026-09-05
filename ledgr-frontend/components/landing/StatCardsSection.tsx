'use client';

import React from 'react';
import Link from 'next/link';
import { Layers, ArrowUpRight } from 'lucide-react';

export function StatCardsSection() {
  return (
    <section
      id="features"
      style={{
        padding: '20px 24px 100px',
        maxWidth: 1240,
        margin: '0 auto'
      }}
      aria-label="Strategic Success & Statistics"
    >
      {/* Top Header Block */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 0.8fr',
          gap: 40,
          alignItems: 'flex-start',
          marginBottom: 48
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: "'Urbanist', sans-serif",
              fontSize: 'clamp(2.4rem, 4.4vw, 3.8rem)',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              color: '#0D0D11',
              lineHeight: 1.08,
              margin: '0 0 20px'
            }}
          >
            Your key to autonomous ledger integrity & zero leakage
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span
              style={{
                fontSize: '0.82rem',
                fontWeight: 700,
                background: '#FFFFFF',
                border: '1px solid rgba(0,0,0,0.1)',
                padding: '7px 18px',
                borderRadius: 999,
                color: '#0D0D11',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
              }}
            >
              Autonomous Night-Shift
            </span>
            <p style={{ fontSize: '0.92rem', color: '#6B7280', margin: 0, lineHeight: 1.5, maxWidth: 360 }}>
              Continuous unattended reconciliation across Razorpay, UPI, IMPS, Cards, and Netbanking rails.
            </p>
          </div>
        </div>

        <div style={{ paddingTop: 12 }}>
          <p style={{ fontSize: '1.2rem', fontWeight: 600, color: '#0D0D11', lineHeight: 1.45, letterSpacing: '-0.02em' }}>
            Zero manual spreadsheets. Instant two-stage neural verification in real time.
          </p>
        </div>
      </div>

      {/* Dual Bento Cards (from Ramos video 00:24) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.25fr 1fr',
          gap: 24,
          alignItems: 'stretch'
        }}
      >
        {/* Card A: White Card with Reconciled Volume & Health Score */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 28,
            padding: '36px 36px 30px',
            border: '1px solid rgba(0, 0, 0, 0.06)',
            boxShadow: '0 10px 36px rgba(0, 0, 0, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0D0D11', marginBottom: 20 }}>
              Reconciliation Efficiency & Health
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 28, flexWrap: 'wrap' }}>
              {/* Reconciled Volume */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#FE4A23', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontWeight: 800, fontSize: '0.9rem' }}>
                  ₹
                </div>
                <div>
                  <div style={{ fontSize: '0.74rem', color: '#6B7280' }}>Reconciled Volume</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0D0D11', letterSpacing: '-0.03em' }}>
                    ₹14.28 Cr
                  </div>
                </div>
              </div>

              {/* Match Rate */}
              <div style={{ background: '#F6F6F9', borderRadius: 16, padding: '8px 18px' }}>
                <div style={{ fontSize: '0.74rem', color: '#6B7280' }}>Auto-Matched</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0D0D11' }}>96.8%</span>
                  <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 700 }}>+28.4%</span>
                </div>
              </div>
            </div>

            {/* Health Score sub-card with yellow line graph */}
            <div
              style={{
                background: '#F6F6F9',
                borderRadius: 20,
                padding: '20px 24px',
                border: '1px solid rgba(0,0,0,0.03)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0D0D11' }}>Treasury Fleet Health Score</span>
                <span style={{ background: '#FE4A23', color: '#FFFFFF', fontSize: '0.74rem', fontWeight: 800, padding: '4px 12px', borderRadius: 999 }}>
                  94 / 100
                </span>
              </div>

              {/* Yellow line graph */}
              <div style={{ height: 60, position: 'relative' }}>
                <svg width="100%" height="100%" viewBox="0 0 280 60" preserveAspectRatio="none">
                  <path
                    d="M 0,45 Q 40,50 80,35 T 160,20 T 240,10 T 280,15"
                    fill="none"
                    stroke="#FFD028"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <circle cx="280" cy="15" r="4" fill="#FFD028" />
                </svg>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
            <span style={{ fontSize: '0.82rem', color: '#6B7280' }}>CUDA-Accelerated LoRA Embedding Verification</span>
            <Link
              href="/dashboard/reconciliation"
              style={{
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#FE4A23',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <span>Explore Engine</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>

        {/* Card B: Deep Black #0D0D11 Card with 10K Stream Pipeline */}
        <div
          style={{
            background: '#0D0D11',
            borderRadius: 28,
            padding: '36px 36px 30px',
            color: '#FFFFFF',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div>
            {/* Top gold icon + 10K */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
              {/* Overlapping gold squares icon */}
              <div style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
                  <rect x="5" y="2" width="14" height="6" rx="2" stroke="#FFD028" strokeWidth="2" />
                  <rect x="3" y="9" width="18" height="6" rx="2" stroke="#FFD028" strokeWidth="2" />
                  <rect x="5" y="16" width="14" height="6" rx="2" stroke="#FFD028" strokeWidth="2" />
                </svg>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', padding: '2px 8px', borderRadius: 999, fontSize: '0.72rem', fontWeight: 800, marginBottom: 4 }}>
                  <span>1,250 rps</span>
                </div>
                <div style={{ fontSize: '0.76rem', color: '#9CA3AF' }}>Pipeline Stream</div>
              </div>
            </div>

            <div
              style={{
                fontFamily: "'Urbanist', sans-serif",
                fontSize: '4.2rem',
                fontWeight: 900,
                letterSpacing: '-0.04em',
                lineHeight: 0.95,
                color: '#FFFFFF',
                marginBottom: 24
              }}
            >
              10K+
            </div>
          </div>

          <div style={{ paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: '0.94rem', fontWeight: 800, color: '#FFFFFF', marginBottom: 6 }}>
              Zero Paisa Tolerance
            </div>
            <p style={{ fontSize: '0.86rem', color: '#9CA3AF', lineHeight: 1.45, margin: 0 }}>
              Deterministic MDR fee gates and cryptographic SHA-256 hash chaining prevent silent fee drift and unauthorized leakage.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
