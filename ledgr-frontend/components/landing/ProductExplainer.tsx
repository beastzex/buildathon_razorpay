'use client';

import { useEffect, useRef } from 'react';

export function ProductExplainer() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const supportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const run = async () => {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      if (!prefersReduced) {
        // Scroll-scrubbed pill sliding in from left
        gsap.set(pillRef.current, { x: -180, opacity: 0 });

        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top 70%',
          end: 'top 20%',
          scrub: 1,
          onUpdate: self => {
            if (pillRef.current) {
              const p = self.progress;
              pillRef.current.style.transform = `translateX(${-180 * (1 - p)}px)`;
              pillRef.current.style.opacity = String(Math.min(p * 2, 1));
            }
          },
        });

        // Regular reveals
        gsap.set([textRef.current, supportRef.current], { y: 40, opacity: 0 });
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top 75%',
          onEnter: () => {
            gsap.to([textRef.current, supportRef.current], {
              y: 0,
              opacity: 1,
              duration: 0.7,
              stagger: 0.15,
              ease: 'power3.out',
            });
          },
          once: true,
        });
      }
    };

    run();
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        padding: '100px 5%',
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}
      aria-label="How matching works"
    >
      <div style={{ maxWidth: 840, margin: '0 auto' }}>
        <div ref={textRef}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.6 }}>
            Matching that understands{' '}
            <span style={{ color: 'var(--brand)', fontWeight: 600 }}>messy data</span>
          </p>

          <h2
            className="font-display"
            style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', color: 'var(--text)', marginBottom: 28, lineHeight: 1.1 }}
          >
            Every match passes through our{' '}
            <span
              ref={pillRef}
              style={{
                display: 'inline-block',
                background: 'var(--warning-dim)',
                color: 'var(--warning)',
                border: '1px solid var(--warning)',
                borderRadius: 100,
                padding: '2px 14px',
                fontSize: '0.7em',
                fontWeight: 700,
                verticalAlign: 'middle',
                letterSpacing: '0.01em',
                whiteSpace: 'nowrap',
              }}
            >
              two-stage confidence gate
            </span>{' '}
            before it is trusted.
          </h2>
        </div>

        <div ref={supportRef} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 8 }}>
          <div
            style={{
              padding: '24px',
              background: 'var(--bg)',
              borderRadius: 12,
              border: '1px solid var(--border)',
            }}
          >
            <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
              Stage 1 — semantic similarity
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.65 }}>
              An embedding model checks whether two records describe the same economic event — regardless of how each source phrases it.
            </p>
          </div>
          <div
            style={{
              padding: '24px',
              background: 'var(--bg)',
              borderRadius: 12,
              border: '1px solid var(--border)',
            }}
          >
            <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
              Stage 2 — deterministic rules
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.65 }}>
              Amount tolerance, date window, reference prefix matching. Both stages must agree before a record is auto-resolved.
            </p>
          </div>
        </div>

        <p
          style={{
            marginTop: 28,
            fontSize: '1rem',
            color: 'var(--text-muted)',
            lineHeight: 1.75,
            maxWidth: 680,
          }}
        >
          Anything that falls below the confidence threshold goes to a human-readable explanation — not a black box error code.
        </p>
      </div>
    </section>
  );
}
