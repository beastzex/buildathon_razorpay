'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Activity, ArrowRight, CheckCircle2, Zap, ArrowUpRight } from 'lucide-react';

export function ProductExplainer() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section
      id="solutions"
      style={{
        padding: '70px 24px 110px',
        maxWidth: 1240,
        margin: '0 auto',
        position: 'relative'
      }}
      aria-label="Maximize Efficiency"
    >
      {/* Massive Ramos Headline (from video 00:27) */}
      <div style={{ marginBottom: 40 }}>
        <h2
          style={{
            fontFamily: "'Urbanist', sans-serif",
            fontSize: 'clamp(2.8rem, 6.2vw, 5.6rem)',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            color: '#0D0D11',
            lineHeight: 1.02,
            margin: 0
          }}
        >
          Maximize efficiency
        </h2>
        <h2
          style={{
            fontFamily: "'Urbanist', sans-serif",
            fontSize: 'clamp(2.8rem, 6.2vw, 5.6rem)',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            color: '#0D0D11',
            lineHeight: 1.02,
            margin: 0
          }}
        >
          with our intuitive
        </h2>
      </div>

      {/* Signature Ramos Animated Badge Row (from video 00:28 - 00:30) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 32,
          flexWrap: 'wrap',
          marginBottom: 60
        }}
      >
        {/* Left: Yellow Circular Badge with +30% */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            background: '#FFFFFF',
            padding: '12px 24px 12px 14px',
            borderRadius: 999,
            border: '1px solid rgba(0,0,0,0.06)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.03)'
          }}
        >
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: '50%',
              background: '#FFEBE7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 10px rgba(254,74,35,0.2)'
            }}
          >
            <Activity size={26} color="#FE4A23" />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0D0D11', fontFamily: "'Urbanist', sans-serif", lineHeight: 1 }}>
              +30%
            </div>
            <div style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: 2 }}>
              Speed up your productivity
            </div>
          </div>
        </div>

        {/* Center/Right: Giant Dual-Colored Oval Pill (Red/Yellow from video) */}
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            borderRadius: 999,
            overflow: 'hidden',
            boxShadow: '0 12px 36px rgba(254,74,35,0.25)',
            transform: isHovered ? 'scale(1.02)' : 'scale(1)',
            transition: 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
            cursor: 'pointer'
          }}
        >
          {/* Red-Orange Half */}
          <div
            style={{
              background: '#FE4A23',
              color: '#FFFFFF',
              padding: '24px 38px',
              fontFamily: "'Urbanist', sans-serif",
              fontSize: 'clamp(1.6rem, 3.2vw, 2.6rem)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}
          >
            <span>service and</span>
          </div>

          {/* Yellow Half */}
          <div
            style={{
              background: '#FFD028',
              color: '#0D0D11',
              padding: '24px 44px',
              fontFamily: "'Urbanist', sans-serif",
              fontSize: 'clamp(1.6rem, 3.2vw, 2.6rem)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}
          >
            <span>AI analytics</span>
          </div>
        </div>
      </div>

      {/* Description & Dual Action Buttons (from video 00:30) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 32,
          paddingTop: 36,
          borderTop: '1px solid rgba(0, 0, 0, 0.08)'
        }}
      >
        <p style={{ fontSize: '1.05rem', color: '#6B7280', maxWidth: 620, margin: 0, lineHeight: 1.55 }}>
          Explore multi-source statements, gateway fees, settlement lag, and root causes to gain deep financial certainty. With Ledgr, your treasury doesn&apos;t just adapt — it evolves.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* White Pill Button: Request a demo */}
          <Link
            href="/portal"
            style={{
              textDecoration: 'none',
              background: '#FFFFFF',
              color: '#0D0D11',
              border: '1px solid rgba(0,0,0,0.12)',
              borderRadius: 999,
              padding: '14px 28px',
              fontSize: '0.92rem',
              fontWeight: 700,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              transition: 'background 0.15s ease'
            }}
          >
            Request a demo
          </Link>

          {/* Red-Orange Pill Button: Start for free */}
          <Link
            href="/dashboard/reconciliation"
            style={{
              textDecoration: 'none',
              background: '#FE4A23',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 999,
              padding: '14px 34px',
              fontSize: '0.92rem',
              fontWeight: 700,
              boxShadow: '0 6px 20px rgba(254,74,35,0.35)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              transition: 'transform 0.15s ease'
            }}
          >
            <span>Start for free</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
