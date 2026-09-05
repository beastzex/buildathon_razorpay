'use client';

import { useEffect, useRef } from 'react';

const STATS = [
  { value: '97.4%', label: 'match rate', sub: 'across all batch runs in production.' },
  { value: '1.8s', label: 'avg resolution', sub: 'per exception, including AI explanation time.' },
  { value: '312', label: 'exceptions auto-explained', sub: 'in the last 30 days, zero manual writeups.' },
];

export function StatCardsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const run = async () => {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      gsap.set(cardsRef.current, { y: 60, opacity: 0 });

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 80%',
        onEnter: () => {
          gsap.to(cardsRef.current, {
            y: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.15,
            ease: 'power3.out',
          });

          // Center card slight parallax
          ScrollTrigger.create({
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
            onUpdate: self => {
              const progress = self.progress;
              const offset = (progress - 0.5) * 40;
              if (cardsRef.current[1]) {
                cardsRef.current[1]!.style.transform = `translateY(${offset}px)`;
              }
            },
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
      style={{ padding: '80px 5%', background: 'var(--bg)' }}
      aria-label="Key metrics"
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 20,
        }}
      >
        {STATS.map((stat, i) => (
          <div
            key={stat.value}
            ref={el => { cardsRef.current[i] = el; }}
            className="card"
            style={{ padding: '32px 28px' }}
          >
            <p
              className="font-display"
              style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', color: 'var(--brand)', marginBottom: 6 }}
            >
              {stat.value}
            </p>
            <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>
              {stat.label}
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              {stat.sub}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
