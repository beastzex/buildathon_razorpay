'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Activity,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';

export function ControlSection() {
  return (
    <section
      id="forecasting"
      style={{
        padding: '90px 24px 100px',
        maxWidth: 1240,
        margin: '0 auto',
        position: 'relative'
      }}
      aria-label="Root Cause and Health Intelligence"
    >
      <div style={{ textAlign: 'center', marginBottom: 54 }}>
        <h2
          style={{
            fontFamily: "'Urbanist', sans-serif",
            fontSize: 'clamp(2.2rem, 4.2vw, 3.5rem)',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            color: '#0D0D11',
            lineHeight: 1.1,
            margin: '0 auto 14px'
          }}
        >
          We give you actionable financial intelligence
        </h2>
        <p style={{ fontSize: '1.05rem', color: '#6B7280', maxWidth: 640, margin: '0 auto', lineHeight: 1.5 }}>
          Investigate systemic anomalies with multi-hop forensic reasoning and track your overall ledger integrity with real-time composite health scoring.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: 24,
          alignItems: 'stretch'
        }}
      >
        {/* Card 1: Multi-Hop Root Cause Forensic Agent */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 28,
            padding: 36,
            border: '1px solid rgba(0, 0, 0, 0.06)',
            boxShadow: '0 10px 36px rgba(0, 0, 0, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: '#FE4A23', background: 'rgba(254,74,35,0.1)', padding: '3px 10px', borderRadius: 999 }}>
                MULTI-HOP FORENSIC REASONING
              </span>
            </div>
            <h3 style={{ fontFamily: "'Urbanist', sans-serif", fontSize: '1.6rem', fontWeight: 800, color: '#0D0D11', letterSpacing: '-0.03em', marginBottom: 10 }}>
              Root-Cause Chain Agent
            </h3>
            <p style={{ fontSize: '0.92rem', color: '#6B7280', lineHeight: 1.5, marginBottom: 20 }}>
              Instead of flagging anomalies in isolation, Ledgr traverses related counterparties, fees, and timestamps across 4 iterations to isolate the underlying systemic flaw.
            </p>

            {/* Forensic investigation preview */}
            <div style={{ background: '#F6F6F9', borderRadius: 16, padding: 18, border: '1px solid rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#FE4A23' }} />
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0D0D11' }}>PATTERN RC-7001: 2.0% GATEWAY INTERCHANGE DRIFT</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#4B5563', margin: '0 0 10px', lineHeight: 1.4 }}>
                15 transactions affected (Dunzo & Cleartrip). Root cause: Payment gateway adjusted fee tier from 1.8% to 2.0% without ERP synchronization.
              </p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 4, background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)', fontWeight: 600 }}>
                  15/15 Precision Recall
                </span>
                <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 4, background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)', fontWeight: 600 }}>
                  0 Hallucinated IDs
                </span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>1-Click Bulk Exception Resolution</span>
            <Link
              href="/dashboard/exceptions"
              style={{
                textDecoration: 'none',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#FE4A23',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <span>View Exception Chains</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>

        {/* Card 2: Financial Health Score Composite Metric */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 28,
            padding: 36,
            border: '1px solid rgba(0, 0, 0, 0.06)',
            boxShadow: '0 10px 36px rgba(0, 0, 0, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: '#10B981', background: 'rgba(16,185,129,0.1)', padding: '3px 10px', borderRadius: 999 }}>
                COMPOSITE LEDGER INTEGRITY
              </span>
            </div>
            <h3 style={{ fontFamily: "'Urbanist', sans-serif", fontSize: '1.6rem', fontWeight: 800, color: '#0D0D11', letterSpacing: '-0.03em', marginBottom: 10 }}>
              Financial Health Score
            </h3>
            <p style={{ fontSize: '0.92rem', color: '#6B7280', lineHeight: 1.5, marginBottom: 20 }}>
              Transparent mathematical combination of match rate (35%), amount accuracy (30%), aging velocity (20%), and fee tolerance (15%).
            </p>

            {/* Health Score Radial Gauge Simulation */}
            <div style={{ background: '#F6F6F9', borderRadius: 16, padding: 20, textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
                <div style={{ position: 'relative', width: 84, height: 84 }}>
                  <svg width="84" height="84" viewBox="0 0 84 84">
                    <circle cx="42" cy="42" r="34" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="8" />
                    <circle
                      cx="42"
                      cy="42"
                      r="34"
                      fill="none"
                      stroke="#FE4A23"
                      strokeWidth="8"
                      strokeDasharray="213.6"
                      strokeDashoffset="17"
                      strokeLinecap="round"
                      transform="rotate(-90 42 42)"
                    />
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 900, color: '#0D0D11' }}>
                    92
                  </div>
                </div>

                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0D0D11' }}>Grade A+ (Optimal)</div>
                  <div style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 700 }}>+4 pts historical trend</div>
                  <div style={{ fontSize: '0.72rem', color: '#6B7280', marginTop: 2 }}>Sub-second audit verification</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>Platform Multi-Merchant View</span>
            <Link
              href="/dashboard/portfolio"
              style={{
                textDecoration: 'none',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#FE4A23',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <span>10-Merchant Fleet</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
