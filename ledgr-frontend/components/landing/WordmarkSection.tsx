'use client';

import { useEffect, useRef } from 'react';

const CHART_BARS = [
  { label: 'Mon', value: 8 },
  { label: 'Tue', value: 3 },
  { label: 'Wed', value: 12 },
  { label: 'Thu', value: 5 },
  { label: 'Fri', value: 9 },
  { label: 'Sat', value: 2 },
  { label: 'Sun', value: 6 },
];
const MAX_VAL = Math.max(...CHART_BARS.map(b => b.value));

export function WordmarkSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const wordmarkRef = useRef<HTMLDivElement>(null);
  const laptopRef = useRef<HTMLDivElement>(null);
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      barsRef.current.forEach(b => { if (b) b.style.transform = 'scaleY(1)'; });
      return;
    }

    const run = async () => {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      // Background wordmark parallax (0.5x scroll speed)
      gsap.to(wordmarkRef.current, {
        y: '20%',
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });

      // Laptop slides up on enter
      gsap.set(laptopRef.current, { y: 60, opacity: 0 });
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 70%',
        onEnter: () => {
          gsap.to(laptopRef.current, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' });

          // Staggered bar chart grow
          gsap.set(barsRef.current, { scaleY: 0, transformOrigin: 'bottom' });
          gsap.to(barsRef.current, {
            scaleY: 1,
            duration: 0.5,
            stagger: 0.08,
            ease: 'power2.out',
            delay: 0.3,
          });
        },
        once: true,
      });
    };

    run();
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        padding: '120px 5%',
        background: 'var(--bg)',
        overflow: 'hidden',
        position: 'relative',
      }}
      aria-label="Product capabilities"
    >
      {/* Background wordmark */}
      <div
        ref={wordmarkRef}
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: 'clamp(8rem, 18vw, 16rem)',
          fontFamily: "'DM Sans', 'Inter', sans-serif",
          fontWeight: 900,
          letterSpacing: '-0.05em',
          color: 'var(--border)',
          userSelect: 'none',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          zIndex: 0,
        }}
      >
        LEDGR
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <h2
            className="font-display"
            style={{
              fontSize: 'clamp(2rem, 3.5vw, 3rem)',
              color: 'var(--text)',
              marginBottom: 16,
            }}
          >
            Full view. Both sources. One truth.
          </h2>
          <p style={{ fontSize: '1.0625rem', color: 'var(--text-muted)', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
            The reconciliation console and the settlement agent work from the same grounded dataset — no hallucinated answers.
          </p>
        </div>

        {/* Device mockups */}
        <div
          ref={laptopRef}
          style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24, alignItems: 'start' }}
        >
          {/* Laptop mockup — Reconciliation */}
          <div
            className="card"
            style={{ padding: 0, overflow: 'hidden' }}
          >
            {/* Browser chrome */}
            <div
              style={{
                background: 'var(--surface-hover)',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                borderBottom: '1px solid var(--border)',
              }}
            >
              {['#F0555A', '#F5A623', '#34d399'].map((c, i) => (
                <span key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.7 }} />
              ))}
              <span
                style={{
                  flex: 1,
                  background: 'var(--border)',
                  height: 20,
                  borderRadius: 4,
                  marginLeft: 8,
                  fontSize: '0.7rem',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: 8,
                }}
              >
                ledgr.app/dashboard/reconciliation
              </span>
            </div>

            {/* Screen content */}
            <div style={{ padding: '16px' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12 }}>
                Exception volume — last 7 days
              </p>

              {/* Animated bar chart */}
              <div
                style={{
                  display: 'flex',
                  gap: 6,
                  alignItems: 'flex-end',
                  height: 72,
                  marginBottom: 16,
                }}
              >
                {CHART_BARS.map((bar, i) => (
                  <div key={bar.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
                    <div
                      ref={el => { barsRef.current[i] = el; }}
                      style={{
                        width: '100%',
                        height: `${(bar.value / MAX_VAL) * 100}%`,
                        background: `var(--brand)`,
                        opacity: 0.7 + (bar.value / MAX_VAL) * 0.3,
                        borderRadius: '3px 3px 0 0',
                        transformOrigin: 'bottom',
                      }}
                    />
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-faint)' }}>{bar.label}</span>
                  </div>
                ))}
              </div>

              {/* Fake table rows */}
              {[
                { id: 'TXN-4003', status: 'flagged', conf: 71 },
                { id: 'TXN-4006', status: 'mismatched', conf: 48 },
                { id: 'TXN-4001', status: 'matched', conf: 98 },
              ].map(row => (
                <div
                  key={row.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '7px 8px',
                    borderRadius: 6,
                    background: 'var(--bg)',
                    marginBottom: 4,
                    gap: 10,
                  }}
                >
                  <span className="font-mono-id" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{row.id}</span>
                  <div
                    style={{
                      height: 4,
                      flex: 1,
                      background: 'var(--border-strong)',
                      borderRadius: 100,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${row.conf}%`,
                        background: row.conf >= 85 ? 'var(--success)' : row.conf >= 60 ? 'var(--warning)' : 'var(--critical)',
                        borderRadius: 100,
                      }}
                    />
                  </div>
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      background: row.status === 'matched' ? 'var(--success)' : row.status === 'flagged' ? 'var(--warning)' : 'var(--critical)',
                      flexShrink: 0,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Phone mockup — Settlement Q&A */}
          <div
            className="card"
            style={{ padding: '16px', maxWidth: 280, margin: '0 auto', width: '100%' }}
          >
            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12 }}>
              Settlement Q&A
            </p>

            {/* Chat messages */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div
                style={{
                  background: 'var(--brand)',
                  color: '#fff',
                  borderRadius: '12px 12px 4px 12px',
                  padding: '8px 10px',
                  fontSize: '0.75rem',
                  lineHeight: 1.5,
                  alignSelf: 'flex-end',
                  maxWidth: '85%',
                }}
              >
                Why is this settlement short by ₹60?
              </div>
              <div
                style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px 12px 12px 4px',
                  padding: '8px 10px',
                  fontSize: '0.75rem',
                  lineHeight: 1.55,
                  color: 'var(--text)',
                  maxWidth: '90%',
                }}
              >
                The ₹60 difference matches two gateway processing fees (₹12 each) plus a ₹36 late settlement surcharge. Confidence 88%.
                <div style={{ marginTop: 6, display: 'flex', gap: 4 }}>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      background: 'var(--brand-dim)',
                      color: 'var(--brand)',
                      border: '1px solid var(--brand)',
                      borderRadius: 100,
                      padding: '1px 6px',
                      fontFamily: 'monospace',
                    }}
                  >
                    TXN-4009
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
