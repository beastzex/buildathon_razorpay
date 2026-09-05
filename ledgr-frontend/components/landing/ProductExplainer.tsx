'use client';

import React from 'react';
import Link from 'next/link';
import {
  Zap,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  BrainCircuit,
  MessageSquare,
  Search,
  Scale,
  ArrowUpRight,
  BarChart3,
  CheckCircle2
} from 'lucide-react';

export function ProductExplainer() {
  return (
    <section
      id="features"
      style={{
        padding: '90px 24px 100px',
        maxWidth: 1240,
        margin: '0 auto',
        position: 'relative'
      }}
      aria-label="Features & Capabilities"
    >
      {/* Top Headline with Ramos-style circular badges */}
      <div style={{ marginBottom: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#FE4A23',
              boxShadow: '0 4px 12px rgba(254,74,35,0.4)'
            }}
          >
            <Zap size={16} color="#FFFFFF" fill="#FFFFFF" />
          </span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#FFD028',
              boxShadow: '0 4px 12px rgba(255,208,40,0.4)'
            }}
          >
            <Sparkles size={16} color="#0D0D11" />
          </span>
          <span
            style={{
              fontSize: '0.84rem',
              fontWeight: 800,
              color: '#FE4A23',
              letterSpacing: '0.04em',
              textTransform: 'uppercase'
            }}
          >
            ACTIONABLE RECONCILIATION INTELLIGENCE
          </span>
        </div>

        <h2
          style={{
            fontFamily: "'Urbanist', sans-serif",
            fontSize: 'clamp(2.4rem, 4.5vw, 3.8rem)',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            color: '#0D0D11',
            lineHeight: 1.08,
            maxWidth: 820
          }}
        >
          Maximize efficiency with our autonomous AI relay
        </h2>
      </div>

      {/* 3-Card Bento Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 24
        }}
      >
        {/* Bento 1: 8-Agent Relay & Consensus */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 24,
            padding: 32,
            border: '1px solid rgba(0, 0, 0, 0.06)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: 'rgba(254, 74, 35, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20
              }}
            >
              <BrainCircuit size={22} color="#FE4A23" />
            </div>
            <h3 style={{ fontFamily: "'Urbanist', sans-serif", fontSize: '1.35rem', fontWeight: 800, color: '#0D0D11', marginBottom: 10 }}>
              8-Agent Relay Pipeline
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#6B7280', lineHeight: 1.5 }}>
              Ingestion, Normalization, Neural Matcher, Rule Verifier, Detective, Debate, Explainer, and Auditor execute in visible synchronized sequence.
            </p>
          </div>

          <div style={{ marginTop: 24, padding: 16, background: '#F6F6F9', borderRadius: 16 }}>
            <div style={{ fontSize: '0.74rem', color: '#9CA3AF', fontWeight: 700, marginBottom: 8 }}>RELAY STAGES</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {['Ingest', 'Normalize', 'Match', 'Verify', 'Detective', 'Debate', 'Explain', 'Audit'].map((agent, i) => (
                <span
                  key={agent}
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 6,
                    background: i < 4 ? '#0D0D11' : '#FE4A23',
                    color: '#FFFFFF'
                  }}
                >
                  {agent}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bento 2: 2-Round Multi-Agent Debate */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 24,
            padding: 32,
            border: '1px solid rgba(0, 0, 0, 0.06)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: 'rgba(255, 208, 40, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20
              }}
            >
              <Scale size={22} color="#D97706" />
            </div>
            <h3 style={{ fontFamily: "'Urbanist', sans-serif", fontSize: '1.35rem', fontWeight: 800, color: '#0D0D11', marginBottom: 10 }}>
              Debate & Consensus Engine
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#6B7280', lineHeight: 1.5 }}>
              When rule verifiers and vector matchers disagree, two specialized agents argue evidence over two rounds until reaching mathematical consensus.
            </p>
          </div>

          <div style={{ marginTop: 24, padding: 16, background: '#F6F6F9', borderRadius: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: '0.74rem', color: '#6B7280' }}>Dispute Resolution Rate</span>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#10B981' }}>94.2%</span>
            </div>
            <div style={{ width: '100%', height: 6, background: 'rgba(0,0,0,0.06)', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ width: '94.2%', height: '100%', background: '#10B981', borderRadius: 999 }} />
            </div>
          </div>
        </div>

        {/* Bento 3: Meta Prophet Forecasting */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 24,
            padding: 32,
            border: '1px solid rgba(0, 0, 0, 0.06)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: 'rgba(16, 185, 129, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20
              }}
            >
              <TrendingUp size={22} color="#10B981" />
            </div>
            <h3 style={{ fontFamily: "'Urbanist', sans-serif", fontSize: '1.35rem', fontWeight: 800, color: '#0D0D11', marginBottom: 10 }}>
              Prophet Cash-Flow Engine
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#6B7280', lineHeight: 1.5 }}>
              7/30-day forward projections with 90% confidence uncertainty bounds grounded in scheduled payrolls, tax sweeps, and settlement dips.
            </p>
          </div>

          <div style={{ marginTop: 24, padding: 16, background: '#F6F6F9', borderRadius: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.74rem', color: '#6B7280' }}>Horizon Confidence</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0D0D11' }}>90% Lower/Upper</div>
              </div>
              <Link
                href="/dashboard/overview"
                style={{
                  textDecoration: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#FE4A23',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3
                }}
              >
                <span>Forecasts</span>
                <ArrowUpRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
