'use client';

import React, { useEffect, useRef } from 'react';

const STATS = [
  { value: '97.4%', label: 'Autonomous Match Rate', sub: 'Across 10,000+ multi-rail payments cleared.' },
  { value: '2,450', unit: 'tx/s', label: 'Real-Time Ingestion Velocity', sub: 'Sub-millisecond vectorized neural matching.' },
  { value: '100%', label: 'Cryptographic Sealing', sub: 'SHA-256 tamper-evident hash chain verification.' }
];

export function StatCardsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  return (
    <section
      ref={sectionRef}
      style={{
        padding: '0 24px 80px',
        maxWidth: 1240,
        margin: '0 auto'
      }}
      aria-label="Key Performance Statistics"
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 20
        }}
      >
        {STATS.map((s, idx) => (
          <div
            key={idx}
            style={{
              background: '#FFFFFF',
              borderRadius: 22,
              padding: '28px 30px',
              border: '1px solid rgba(0, 0, 0, 0.06)',
              boxShadow: '0 6px 24px rgba(0, 0, 0, 0.03)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <div
                style={{
                  fontFamily: "'Urbanist', sans-serif",
                  fontSize: '3rem',
                  fontWeight: 900,
                  letterSpacing: '-0.04em',
                  color: '#0D0D11',
                  lineHeight: 1
                }}
              >
                {s.value}
              </div>
              {s.unit && (
                <span style={{ fontSize: '1rem', fontWeight: 800, color: '#FE4A23' }}>{s.unit}</span>
              )}
            </div>

            <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0D0D11', marginTop: 10, marginBottom: 4 }}>
              {s.label}
            </div>
            <p style={{ fontSize: '0.84rem', color: '#6B7280', margin: 0, lineHeight: 1.4 }}>
              {s.sub}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
