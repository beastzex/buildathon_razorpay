'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export function ControlSection() {
  return (
    <section
      id="architecture"
      style={{
        padding: '80px 24px 110px',
        maxWidth: 1240,
        margin: '0 auto',
        position: 'relative'
      }}
      aria-label="Control Over Your Data"
    >
      {/* Top Headline */}
      <div style={{ textAlign: 'center', marginBottom: 54 }}>
        <h2
          style={{
            fontFamily: "'Urbanist', sans-serif",
            fontSize: 'clamp(2.4rem, 4.6vw, 4.2rem)',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            color: '#0D0D11',
            lineHeight: 1.08,
            margin: '0 auto 16px',
            maxWidth: 720
          }}
        >
          Institutional Architecture & Cryptographic Control
        </h2>
        <p style={{ fontSize: '1.05rem', color: '#6B7280', maxWidth: 620, margin: '0 auto' }}>
          End-to-end reconciliation across 10,000 real-time records with sub-second neural matching and zero financial leakage.
        </p>
      </div>

      {/* Dual Bento Cards (from Ramos video 00:39 & 00:48) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 32,
          alignItems: 'stretch'
        }}
      >
        {/* Card 1: Conversion rate & Sales revenue */}
        <div>
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 28,
              padding: '36px 36px 32px',
              border: '1px solid rgba(0, 0, 0, 0.06)',
              boxShadow: '0 10px 36px rgba(0, 0, 0, 0.04)',
              minHeight: 330,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              marginBottom: 18
            }}
          >
            <div>
              {/* Yellow Pill: 0 Paisa Tolerance */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{ background: '#FFD028', color: '#0D0D11', padding: '6px 14px', borderRadius: 999, fontSize: '0.86rem', fontWeight: 800 }}>
                  0 Paisa
                </div>
                <div style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 600 }}>
                  Zero Tolerance for Unauthorized Leakage
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>Reconciled Pipeline Volume</div>
                <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#0D0D11', fontFamily: "'Urbanist', sans-serif", letterSpacing: '-0.03em', margin: '4px 0 20px' }}>
                  ₹14.28 Cr
                </div>
              </div>

              {/* Rails breakdown bars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, background: '#F6F6F9', borderRadius: 18, padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <span style={{ color: '#6B7280' }}>Razorpay MDR Drift</span>
                  <span style={{ fontWeight: 800, color: '#0D0D11' }}>0.00% (Flags {'>'}0.4%)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <span style={{ color: '#6B7280' }}>Settlement Lag Window</span>
                  <span style={{ fontWeight: 800, color: '#0D0D11' }}>T+0 to T+2 Days</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', paddingTop: 8, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                  <span style={{ color: '#6B7280' }}>Cryptographic Hash Chain</span>
                  <span style={{ fontWeight: 800, color: '#10B981' }}>SHA-256 Verified</span>
                </div>
              </div>
            </div>
          </div>

          {/* Subtext below Card 1 */}
          <div style={{ padding: '0 8px' }}>
            <h4 style={{ fontFamily: "'Urbanist', sans-serif", fontSize: '1.2rem', fontWeight: 800, color: '#0D0D11', margin: '0 0 6px' }}>
              Two-Stage Hybrid Machine Learning Gate
            </h4>
            <p style={{ fontSize: '0.88rem', color: '#6B7280', lineHeight: 1.5, margin: 0 }}>
              Stage 1 executes fine-tuned BGE-small LoRA embeddings on CUDA GPU. Stage 2 enforces deterministic mathematical rules for date lag, reference token containment, and gateway fees.
            </p>
          </div>
        </div>

        {/* Card 2: Multi-Agent Consensus & RAG */}
        <div>
          <div
            style={{
              position: 'relative',
              minHeight: 330,
              marginBottom: 18
            }}
          >
            {/* Top sliding tab */}
            <div
              style={{
                position: 'absolute',
                top: -12,
                left: 24,
                right: 24,
                height: 50,
                background: '#F0F0F4',
                borderRadius: 20,
                padding: '8px 20px',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#6B7280',
                border: '1px solid rgba(0,0,0,0.04)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                zIndex: 1
              }}
            >
              <span>⚡ Multi-Agent Consensus Relay</span>
            </div>

            {/* Main Foreground Card */}
            <div
              style={{
                position: 'relative',
                background: '#FFFFFF',
                borderRadius: 28,
                padding: '36px 36px 32px',
                border: '1px solid rgba(0, 0, 0, 0.06)',
                boxShadow: '0 10px 36px rgba(0, 0, 0, 0.04)',
                minHeight: 330,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                zIndex: 2
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: '0.78rem', color: '#6B7280', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FE4A23' }} />
                      Consensus Mesh
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#6B7280', marginTop: 8 }}>Agreement Rate</div>
                    <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#0D0D11', fontFamily: "'Urbanist', sans-serif", letterSpacing: '-0.03em' }}>
                      96.8%
                    </div>
                  </div>

                  {/* Yellow pill: GPT-OSS-120B */}
                  <span style={{ background: '#FFD028', color: '#0D0D11', padding: '6px 14px', borderRadius: 999, fontSize: '0.76rem', fontWeight: 800 }}>
                    GPT-OSS-120B
                  </span>
                </div>

                {/* Rail agreement bars */}
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 110, padding: '0 12px 10px' }}>
                  {[
                    { rail: 'UPI', h: 98 },
                    { rail: 'Cards', h: 94 },
                    { rail: 'Netbank', h: 96 },
                    { rail: 'IMPS', h: 99 },
                    { rail: 'RTGS', h: 100 }
                  ].map((bar) => (
                    <div key={bar.rail} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
                      <div
                        style={{
                          width: 28,
                          height: `${bar.h}%`,
                          background: '#FFD028',
                          borderRadius: 6
                        }}
                      />
                      <span style={{ fontSize: '0.68rem', color: '#9CA3AF' }}>{bar.rail}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Subtext below Card 2 */}
          <div style={{ padding: '0 8px' }}>
            <h4 style={{ fontFamily: "'Urbanist', sans-serif", fontSize: '1.2rem', fontWeight: 800, color: '#0D0D11', margin: '0 0 6px' }}>
              Adversarial Consensus & Root-Cause Investigator
            </h4>
            <p style={{ fontSize: '0.88rem', color: '#6B7280', lineHeight: 1.5, margin: 0 }}>
              Advocate FOR and Advocate AGAINST debate ambiguous discrepancies before an Arbiter issues a legally grounded verdict with citation honesty validation.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
