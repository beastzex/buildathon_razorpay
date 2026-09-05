'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Link2, Zap, Database, ArrowRight } from 'lucide-react';

export function CtaFooter() {
  const [isCtaHovered, setIsCtaHovered] = useState(false);

  return (
    <footer style={{ background: '#0D0D11', color: '#FFFFFF', position: 'relative', overflow: 'hidden' }}>
      {/* Big Ramos-Style CTA Section */}
      <div
        style={{
          padding: '120px 24px 100px',
          maxWidth: 960,
          margin: '0 auto',
          textAlign: 'center',
          position: 'relative',
          zIndex: 2
        }}
      >
        {/* Connected Circular Orange Icon */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: '#FE4A23',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(254,74,35,0.4)'
            }}
          >
            <Link2 size={26} color="#FFFFFF" />
          </div>
        </div>

        <h2
          style={{
            fontFamily: "'Urbanist', sans-serif",
            fontSize: 'clamp(2.8rem, 5.5vw, 4.6rem)',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 1.05,
            marginBottom: 20
          }}
        >
          Get started with Ledgr today
        </h2>

        <p style={{ fontSize: '1.15rem', color: '#9CA3AF', maxWidth: 580, margin: '0 auto 40px', lineHeight: 1.5 }}>
          Turn fragmented multi-source statements into verified cryptographic truth with autonomous multi-agent consensus.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
          <Link
            href="/dashboard/reconciliation"
            onMouseEnter={() => setIsCtaHovered(true)}
            onMouseLeave={() => setIsCtaHovered(false)}
            style={{
              textDecoration: 'none',
              background: '#FE4A23',
              color: '#FFFFFF',
              borderRadius: 999,
              padding: '14px 34px',
              fontSize: '1rem',
              fontWeight: 800,
              boxShadow: '0 8px 24px rgba(254,74,35,0.4)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              transform: isCtaHovered ? 'scale(1.03)' : 'scale(1)',
              transition: 'transform 0.2s ease, background 0.2s ease'
            }}
          >
            <span>Launch Platform</span>
            <ArrowUpRight size={18} />
          </Link>

          <Link
            href="/portal"
            style={{
              textDecoration: 'none',
              background: 'rgba(255,255,255,0.08)',
              color: '#FFFFFF',
              borderRadius: 999,
              padding: '14px 28px',
              fontSize: '1rem',
              fontWeight: 700,
              border: '1px solid rgba(255,255,255,0.12)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              transition: 'background 0.2s ease'
            }}
          >
            <Database size={16} color="#FFD028" />
            <span>FinStream 10K Portal</span>
          </Link>
        </div>
      </div>

      {/* Dark Footer Navigation & Giant Wordmark Signature */}
      <div
        style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          padding: '60px 40px 40px',
          maxWidth: 1300,
          margin: '0 auto',
          position: 'relative',
          zIndex: 2
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 32, marginBottom: 60 }}>
          {/* Navigation Links */}
          <div style={{ display: 'flex', gap: 36, flexWrap: 'wrap' }}>
            <Link href="/dashboard/overview" style={{ textDecoration: 'none', color: '#9CA3AF', fontSize: '0.9rem', fontWeight: 600 }}>Overview</Link>
            <Link href="/dashboard/reconciliation" style={{ textDecoration: 'none', color: '#9CA3AF', fontSize: '0.9rem', fontWeight: 600 }}>Reconciliation</Link>
            <Link href="/dashboard/exceptions" style={{ textDecoration: 'none', color: '#9CA3AF', fontSize: '0.9rem', fontWeight: 600 }}>Exceptions</Link>
            <Link href="/dashboard/portfolio" style={{ textDecoration: 'none', color: '#9CA3AF', fontSize: '0.9rem', fontWeight: 600 }}>Portfolio</Link>
            <Link href="/dashboard/audit" style={{ textDecoration: 'none', color: '#9CA3AF', fontSize: '0.9rem', fontWeight: 600 }}>Audit Trail</Link>
            <Link href="/portal" style={{ textDecoration: 'none', color: '#FE4A23', fontSize: '0.9rem', fontWeight: 700 }}>10K Stream Portal</Link>
          </div>

          {/* Contact mail */}
          <div>
            <a
              href="mailto:hello@ledgr.finance"
              style={{
                fontSize: '1.4rem',
                fontWeight: 800,
                color: '#FFFFFF',
                textDecoration: 'none',
                fontFamily: "'Urbanist', sans-serif",
                letterSpacing: '-0.02em'
              }}
            >
              hello@ledgr.finance
            </a>
          </div>
        </div>

        {/* Giant Bottom Ramos Wordmark: Ledgr ® with right link pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            paddingTop: 40,
            borderTop: '1px solid rgba(255,255,255,0.06)'
          }}
        >
          <div
            style={{
              fontFamily: "'Urbanist', sans-serif",
              fontSize: 'clamp(4rem, 12vw, 10rem)',
              fontWeight: 900,
              letterSpacing: '-0.05em',
              lineHeight: 0.85,
              color: '#FFFFFF'
            }}
          >
            Ledgr<span style={{ fontSize: '0.4em', color: '#FE4A23', verticalAlign: 'top', marginLeft: 6 }}>®</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: '0.78rem', color: '#6B7280' }}>Autonomous Financial Controller © 2026</span>
            <Link
              href="/dashboard/reconciliation"
              style={{
                width: 46,
                height: 46,
                borderRadius: 14,
                background: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(255,255,255,0.2)'
              }}
            >
              <ArrowUpRight size={20} color="#0D0D11" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
