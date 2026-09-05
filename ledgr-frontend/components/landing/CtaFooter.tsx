'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export function CtaFooter() {
  return (
    <footer style={{ background: '#0D0D11', color: '#FFFFFF', position: 'relative', overflow: 'hidden' }}>
      {/* Big Ramos "Get Started" Section (from video 00:41 - 00:46) */}
      <div
        id="contact"
        style={{
          background: '#FFFFFF',
          color: '#0D0D11',
          padding: '110px 24px 90px',
          textAlign: 'center',
          position: 'relative'
        }}
      >
        {/* Floating Red Rounded-Square Badge with White Link Icon */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: 20,
              background: '#FE4A23',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(254,74,35,0.4)'
            }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path
                d="M10 13C10.4295 13.5741 10.9774 14.0491 11.6066 14.3929C12.2357 14.7367 12.9315 14.9411 13.6467 14.9923C14.3618 15.0435 15.0796 14.9403 15.7513 14.6897C16.4231 14.4392 17.0331 14.0471 17.54 13.54L20.54 10.54C21.4508 9.59695 21.9548 8.3339 21.9443 7.02261C21.9338 5.71131 21.4095 4.4566 20.4837 3.52841C19.5579 2.60021 18.3045 2.07347 16.9932 2.06043C15.682 2.04739 14.4179 2.54897 13.47 3.46L11.75 5.18"
                stroke="#FFFFFF"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14 11C13.5705 10.4259 13.0226 9.95088 12.3934 9.60706C11.7643 9.26325 11.0685 9.05886 10.3533 9.00767C9.63821 8.95648 8.92039 9.05966 8.24867 9.31024C7.57695 9.56081 6.96694 9.95293 6.46 10.46L3.46 13.46C2.54919 14.403 2.04523 15.6661 2.05574 16.9774C2.06625 18.2887 2.59051 19.5434 3.51631 20.4716C4.44211 21.3998 5.69552 21.9265 7.00679 21.9396C8.31805 21.9526 9.58212 21.451 10.53 20.54L12.25 18.82"
                stroke="#FFFFFF"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        <h2
          style={{
            fontFamily: "'Urbanist', sans-serif",
            fontSize: 'clamp(3.2rem, 6.2vw, 5.6rem)',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            color: '#0D0D11',
            margin: '0 0 16px',
            lineHeight: 1.02
          }}
        >
          Get Started
        </h2>

        <p style={{ fontSize: '1.1rem', color: '#6B7280', maxWidth: 540, margin: '0 auto 36px', lineHeight: 1.5 }}>
          Turn information into advantage! Start using Ledgr today. Sign up for a free trial.
        </p>

        {/* Dual buttons (from video 00:42) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
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
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}
          >
            Request a demo
          </Link>

          <Link
            href="/dashboard/reconciliation"
            style={{
              textDecoration: 'none',
              background: '#FE4A23',
              color: '#FFFFFF',
              borderRadius: 999,
              padding: '14px 34px',
              fontSize: '0.92rem',
              fontWeight: 700,
              boxShadow: '0 6px 20px rgba(254,74,35,0.35)'
            }}
          >
            Start for free
          </Link>
        </div>
      </div>

      {/* Dark Footer (from video 00:43 - 00:46) */}
      <div style={{ padding: '60px 48px 48px', maxWidth: 1300, margin: '0 auto' }}>
        {/* Top Footer Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24, marginBottom: 50 }}>
          <div style={{ display: 'flex', gap: 32 }}>
            <a href="#features" style={{ textDecoration: 'none', color: '#9CA3AF', fontSize: '0.92rem', fontWeight: 600 }}>Key Features</a>
            <a href="#architecture" style={{ textDecoration: 'none', color: '#9CA3AF', fontSize: '0.92rem', fontWeight: 600 }}>Explore</a>
            <a href="#solutions" style={{ textDecoration: 'none', color: '#9CA3AF', fontSize: '0.92rem', fontWeight: 600 }}>Solutions</a>
            <a href="#tools" style={{ textDecoration: 'none', color: '#9CA3AF', fontSize: '0.92rem', fontWeight: 600 }}>Tools</a>
            <Link href="/portal" style={{ textDecoration: 'none', color: '#FE4A23', fontSize: '0.92rem', fontWeight: 700 }}>10K Stream Portal</Link>
          </div>

          <a
            href="mailto:hello@ledgr.finance"
            style={{
              fontFamily: "'Urbanist', sans-serif",
              fontSize: '2rem',
              fontWeight: 800,
              color: '#FFFFFF',
              textDecoration: 'none',
              letterSpacing: '-0.02em'
            }}
          >
            hello@ledgr.finance
          </a>
        </div>

        {/* Locations Row */}
        <div style={{ display: 'flex', gap: 60, marginBottom: 60, fontSize: '0.84rem', color: '#9CA3AF' }}>
          <div>
            <div style={{ fontWeight: 700, color: '#FFFFFF', marginBottom: 4 }}>Bangalore</div>
            <div>Indiranagar 100ft Road, Bangalore, KA 560038</div>
          </div>
          <div>
            <div style={{ fontWeight: 700, color: '#FFFFFF', marginBottom: 4 }}>Mumbai</div>
            <div>Bandra Kurla Complex, Mumbai, MH 400051</div>
          </div>
        </div>

        {/* Bottom Wordmark Row: Giant Ledgr ® + Link Button */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            paddingTop: 36,
            borderTop: '1px solid rgba(255,255,255,0.08)'
          }}
        >
          <div
            style={{
              fontFamily: "'Urbanist', sans-serif",
              fontSize: 'clamp(4.5rem, 15vw, 13rem)',
              fontWeight: 900,
              letterSpacing: '-0.05em',
              lineHeight: 0.85,
              color: '#FFFFFF'
            }}
          >
            Ledgr<span style={{ fontSize: '0.35em', color: '#FE4A23', verticalAlign: 'top', marginLeft: 8 }}>®</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: '0.82rem', color: '#6B7280' }}>Autonomous Financial Controller</span>
            <Link
              href="/dashboard/reconciliation"
              style={{
                width: 52,
                height: 52,
                borderRadius: 18,
                background: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                boxShadow: '0 4px 16px rgba(255,255,255,0.2)'
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M10 13C10.4295 13.5741 10.9774 14.0491 11.6066 14.3929C12.2357 14.7367 12.9315 14.9411 13.6467 14.9923C14.3618 15.0435 15.0796 14.9403 15.7513 14.6897C16.4231 14.4392 17.0331 14.0471 17.54 13.54L20.54 10.54C21.4508 9.59695 21.9548 8.3339 21.9443 7.02261C21.9338 5.71131 21.4095 4.4566 20.4837 3.52841C19.5579 2.60021 18.3045 2.07347 16.9932 2.06043C15.682 2.04739 14.4179 2.54897 13.47 3.46L11.75 5.18" stroke="#0D0D11" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M14 11C13.5705 10.4259 13.0226 9.95088 12.3934 9.60706C11.7643 9.26325 11.0685 9.05886 10.3533 9.00767C9.63821 8.95648 8.92039 9.05966 8.24867 9.31024C7.57695 9.56081 6.96694 9.95293 6.46 10.46L3.46 13.46C2.54919 14.403 2.04523 15.6661 2.05574 16.9774C2.06625 18.2887 2.59051 19.5434 3.51631 20.4716C4.44211 21.3998 5.69552 21.9265 7.00679 21.9396C8.31805 21.9526 9.58212 21.451 10.53 20.54L12.25 18.82" stroke="#0D0D11" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
