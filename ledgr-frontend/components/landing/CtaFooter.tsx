'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { LedgrLogo } from '@/components/shared/LedgrLogo';

export function CtaFooter() {
  const iconRef = useRef<SVGSVGElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const footerNavRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const run = async () => {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      gsap.set(iconRef.current, { scale: 0, opacity: 0 });
      gsap.set(ctaRef.current, { y: 30, opacity: 0 });

      ScrollTrigger.create({
        trigger: ctaRef.current,
        start: 'top 80%',
        onEnter: () => {
          // Elastic pop for the icon — the one place we use back.out
          gsap.to(iconRef.current, {
            scale: 1,
            opacity: 1,
            duration: 0.7,
            ease: 'back.out(1.7)',
          });
          gsap.to(ctaRef.current, {
            y: 0,
            opacity: 1,
            duration: 0.65,
            ease: 'power3.out',
            delay: 0.15,
          });
        },
        once: true,
      });
    };

    run();
  }, []);

  return (
    <footer style={{ background: 'var(--bg)' }} id="architecture">
      {/* CTA block */}
      <div
        style={{
          padding: '100px 5% 60px',
          textAlign: 'center',
          borderTop: '1px solid var(--border)',
        }}
      >
        {/* Icon */}
        <svg
          ref={iconRef}
          width="52"
          height="52"
          viewBox="0 0 52 52"
          fill="none"
          style={{ margin: '0 auto 24px', display: 'block' }}
          aria-hidden="true"
        >
          <rect x="8" y="6" width="36" height="40" rx="5" fill="var(--brand-dim)" stroke="var(--brand)" strokeWidth="1.75" />
          <line x1="16" y1="18" x2="36" y2="18" stroke="var(--brand)" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
          <line x1="16" y1="24" x2="28" y2="24" stroke="var(--brand)" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
          <polyline points="15,34 21,40 37,28" stroke="var(--brand)" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>

        <div ref={ctaRef}>
          <h2
            className="font-display"
            style={{
              fontSize: 'clamp(2rem, 4vw, 3.25rem)',
              color: 'var(--text)',
              marginBottom: 16,
            }}
          >
            See your numbers agree.
          </h2>
          <p style={{ fontSize: '1.0625rem', color: 'var(--text-muted)', maxWidth: 480, margin: '0 auto 36px', lineHeight: 1.7 }}>
            Connect a sample dataset and watch Ledgr reconcile it in real time.
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/dashboard" className="btn-primary" id="footer-cta-primary">
              Try the live demo
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline"
              id="footer-cta-secondary"
            >
              View the repo
            </a>
          </div>
        </div>
      </div>

      {/* Footer nav */}
      <div
        ref={footerNavRef}
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '32px 5%',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 20,
        }}
      >
        <LedgrLogo size={22} showWordmark={true} />

        <nav style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
          {[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Reconciliation', href: '/dashboard/reconciliation' },
            { label: 'Exceptions', href: '/dashboard/exceptions' },
            { label: 'Audit Trail', href: '/dashboard/audit' },
          ].map(link => (
            <Link key={link.href} href={link.href} className="nav-link">
              {link.label}
            </Link>
          ))}
          <a href="mailto:hello@ledgr.app" className="nav-link">
            hello@ledgr.app
          </a>
        </nav>

        <p style={{ fontSize: '0.8125rem', color: 'var(--text-faint)' }}>
          Ledgr — built at Razorpay Buildathon 2026
        </p>
      </div>
    </footer>
  );
}
