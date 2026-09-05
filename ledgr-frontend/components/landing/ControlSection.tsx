'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export function ControlSection() {
  return (
    <section
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
          We give you full control over your data
        </h2>
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
              {/* Yellow Pill: Conversion rate 2,3% */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{ background: '#FFD028', color: '#0D0D11', padding: '6px 14px', borderRadius: 999, fontSize: '0.86rem', fontWeight: 800 }}>
                  2,3%
                </div>
                <div style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 600 }}>
                  Percentage of reconciliation certainty
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>Sales revenue</div>
                <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#0D0D11', fontFamily: "'Urbanist', sans-serif", letterSpacing: '-0.03em', margin: '4px 0 20px' }}>
                  $ 131.2K
                </div>
              </div>

              {/* Price bars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, background: '#F6F6F9', borderRadius: 18, padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <span style={{ color: '#6B7280' }}>Min. price</span>
                  <span style={{ fontWeight: 800, color: '#0D0D11' }}>1.200 $</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <span style={{ color: '#6B7280' }}>Max. price</span>
                  <span style={{ fontWeight: 800, color: '#0D0D11' }}>2.320 $</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', paddingTop: 8, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                  <span style={{ color: '#6B7280' }}>Engagement rate</span>
                  <span style={{ fontWeight: 800, color: '#10B981' }}>47.84%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Subtext below Card 1 */}
          <div style={{ padding: '0 8px' }}>
            <h4 style={{ fontFamily: "'Urbanist', sans-serif", fontSize: '1.2rem', fontWeight: 800, color: '#0D0D11', margin: '0 0 6px' }}>
              Improved customer service
            </h4>
            <p style={{ fontSize: '0.88rem', color: '#6B7280', lineHeight: 1.5, margin: 0 }}>
              Analytics helps optimize service processes by providing information on how to interact with external banking statements and payout records.
            </p>
          </div>
        </div>

        {/* Card 2: Layered Cards Sliding Out with Yellow Bar Chart */}
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
              <span>📊 Finance reports</span>
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
                      Insights
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#6B7280', marginTop: 8 }}>Total profit</div>
                    <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#0D0D11', fontFamily: "'Urbanist', sans-serif", letterSpacing: '-0.03em' }}>
                      $ 264.2K
                    </div>
                  </div>

                  {/* Yellow pill: Data visualization */}
                  <span style={{ background: '#FFD028', color: '#0D0D11', padding: '6px 14px', borderRadius: 999, fontSize: '0.76rem', fontWeight: 800 }}>
                    Data visualization
                  </span>
                </div>

                {/* Golden Yellow Bar Chart with 5 Years (from Ramos video 00:40) */}
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 110, padding: '0 12px 10px' }}>
                  {[
                    { year: '2018', h: 45 },
                    { year: '2019', h: 65 },
                    { year: '2020', h: 80 },
                    { year: '2021', h: 60 },
                    { year: '2022', h: 95 }
                  ].map((bar) => (
                    <div key={bar.year} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
                      <div
                        style={{
                          width: 28,
                          height: `${bar.h}%`,
                          background: '#FFD028',
                          borderRadius: 6
                        }}
                      />
                      <span style={{ fontSize: '0.68rem', color: '#9CA3AF' }}>{bar.year}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Subtext below Card 2 */}
          <div style={{ padding: '0 8px' }}>
            <h4 style={{ fontFamily: "'Urbanist', sans-serif", fontSize: '1.2rem', fontWeight: 800, color: '#0D0D11', margin: '0 0 6px' }}>
              Monitoring key indicators
            </h4>
            <p style={{ fontSize: '0.88rem', color: '#6B7280', lineHeight: 1.5, margin: 0 }}>
              Analytics platforms allow businesses to track KPIs, an important tool for measuring success and achieving strategic financial targets.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
