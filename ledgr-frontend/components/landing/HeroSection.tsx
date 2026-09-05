'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';

export function HeroSection() {
  const headlineRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const floatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      [headlineRef, subRef, ctaRef, cardRef].forEach(r => {
        if (r.current) { r.current.style.opacity = '1'; r.current.style.transform = 'none'; }
      });
      return;
    }

    let floatTween: { kill: () => void } | null = null;

    const run = async () => {
      const { gsap } = await import('gsap');

      // Set initial states
      const lines = headlineRef.current?.querySelectorAll('.mask-inner');
      if (lines) {
        gsap.set(lines, { yPercent: 110 });
      }
      gsap.set([subRef.current, ctaRef.current], { opacity: 0, y: 20 });
      gsap.set(cardRef.current, { opacity: 0, x: 40, y: -30 });

      const tl = gsap.timeline({ delay: 0.1 });

      if (lines && lines.length) {
        tl.to(lines, {
          yPercent: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: 'power3.out',
        });
      }

      tl.to(subRef.current, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.4')
        .to(ctaRef.current, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.35')
        .to(cardRef.current, { opacity: 1, x: 0, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.5');

      // Continuous float on the hero card
      if (floatRef.current) {
        floatTween = gsap.to(floatRef.current, {
          y: 10,
          duration: 3,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        }) as unknown as { kill: () => void };
      }
    };

    run();
    return () => { if (floatTween) floatTween.kill(); };
  }, []);

  return (
    <section
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        padding: '120px 5% 80px',
        position: 'relative',
        overflow: 'hidden',
      }}
      aria-label="Hero"
    >
      {/* Background gradient */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 70% 60% at 60% 40%, rgba(79,94,255,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          maxWidth: 1200,
          width: '100%',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 60,
          alignItems: 'center',
        }}
      >
        {/* Left — copy */}
        <div>
          <div ref={headlineRef}>
            {['Reconciliation', 'that finally', 'keeps up.'].map(line => (
              <span key={line} className="mask-line" style={{ display: 'block' }}>
                <span
                  className="mask-inner font-display"
                  style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', color: 'var(--text)', display: 'block' }}
                >
                  {line}
                </span>
              </span>
            ))}
          </div>

          <p
            ref={subRef}
            style={{
              marginTop: 24,
              fontSize: 'clamp(1rem, 1.8vw, 1.175rem)',
              color: 'var(--text-muted)',
              lineHeight: 1.7,
              maxWidth: 480,
            }}
          >
            Ledgr matches your bank, gateway, and ledger records automatically — and explains every exception in plain language.
          </p>

          <div
            ref={ctaRef}
            style={{ display: 'flex', gap: 12, marginTop: 36, flexWrap: 'wrap' }}
          >
            <Link href="/dashboard" className="btn-primary" id="hero-cta-primary">
              See it live
            </Link>
            <a href="#architecture" className="btn-outline" id="hero-cta-secondary">
              Read the architecture
            </a>
          </div>
        </div>

        {/* Right — floating stat card */}
        <div ref={floatRef} style={{ display: 'flex', justifyContent: 'center' }}>
          <div ref={cardRef}>
            <div
              className="card"
              style={{
                padding: '28px 32px',
                maxWidth: 320,
                width: '100%',
                backdropFilter: 'blur(12px)',
              }}
            >
              {/* Live indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <span
                  className="status-dot-live"
                  style={{
                    display: 'inline-block',
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: 'var(--success)',
                  }}
                />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                  Live — Batch #214
                </span>
              </div>

              {/* Match rate */}
              <p
                className="font-display"
                style={{ fontSize: '3rem', color: 'var(--text)', marginBottom: 4, lineHeight: 1 }}
              >
                97.4%
              </p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 24 }}>
                match rate across 20 records
              </p>

              {/* Mini sparkline bars */}
              <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 40, marginBottom: 20 }}>
                {[65, 80, 70, 90, 75, 95, 85, 92, 88, 97].map((h, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: `${h}%`,
                      background: i === 9 ? 'var(--brand)' : 'var(--brand-dim)',
                      borderRadius: 3,
                      transition: 'height 0.3s ease',
                    }}
                  />
                ))}
              </div>

              {/* Bottom stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { label: 'Matched', value: '15', color: 'var(--success)' },
                  { label: 'Exceptions', value: '5', color: 'var(--warning)' },
                ].map(s => (
                  <div key={s.label}>
                    <p style={{ fontSize: '1.25rem', fontWeight: 800, color: s.color, fontFamily: "'DM Sans', sans-serif", letterSpacing: '-0.02em' }}>
                      {s.value}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
