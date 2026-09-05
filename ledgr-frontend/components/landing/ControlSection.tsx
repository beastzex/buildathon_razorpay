'use client';

import { useEffect, useRef } from 'react';

const FEATURES = [
  {
    title: 'Explainable exceptions',
    description:
      'Every flagged record comes with a plain-language reason — amount difference, date lag, fee deduction — so your team knows exactly what to check. No black boxes.',
    detail: (
      <div
        style={{
          marginTop: 16,
          padding: '12px 14px',
          background: 'var(--bg)',
          borderRadius: 8,
          borderLeft: '3px solid var(--warning)',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          lineHeight: 1.6,
        }}
      >
        &ldquo;Amount differs by ₹12.00 — likely a gateway processing fee. Confidence 71%, below auto-match threshold.&rdquo;
      </div>
    ),
  },
  {
    title: 'Hash-chained audit trail',
    description:
      'Every ingestion, match, escalation, and resolution is written to an append-only, hash-chained log. Tamper-evident by design. One click to export for compliance.',
    detail: (
      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {['AE-003', 'AE-004', 'AE-005'].map((id, i) => (
          <div
            key={id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '7px 10px',
              background: 'var(--bg)',
              borderRadius: 6,
              border: '1px solid var(--border)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--brand)', flexShrink: 0 }} />
              {i < 2 && <div style={{ width: 1, height: 12, background: 'var(--border)', marginTop: 2 }} />}
            </div>
            <span className="font-mono-id" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {id}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-faint)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {id === 'AE-003' ? 'Match complete — 97.4%' : id === 'AE-004' ? 'TXN-4003 escalated' : 'TXN-4006 confirmed mismatch'}
            </span>
          </div>
        ))}
      </div>
    ),
  },
];

export function ControlSection() {
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const run = async () => {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      gsap.set(cardsRef.current, { y: 50, opacity: 0 });
      ScrollTrigger.create({
        trigger: cardsRef.current[0],
        start: 'top 80%',
        onEnter: () => {
          gsap.to(cardsRef.current, {
            y: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.15,
            ease: 'power3.out',
          });
        },
        once: true,
      });
    };

    run();
  }, []);

  return (
    <section
      style={{
        padding: '100px 5%',
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}
      aria-label="Product features"
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: 48, maxWidth: 560 }}>
          <h2
            className="font-display"
            style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', color: 'var(--text)', marginBottom: 14 }}
          >
            Full control over your data.
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
            Reconciliation that holds up to audit. Every decision is explainable and every record is traceable.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {FEATURES.map((feature, i) => (
            <div
              key={feature.title}
              ref={el => { cardsRef.current[i] = el; }}
              className="card"
              style={{ padding: '28px 28px' }}
            >
              <h3
                className="font-display-md"
                style={{ fontSize: '1.1875rem', color: 'var(--text)', marginBottom: 10 }}
              >
                {feature.title}
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                {feature.description}
              </p>
              {feature.detail}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
