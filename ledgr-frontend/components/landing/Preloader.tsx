'use client';

import { useEffect, useRef } from 'react';
import { LedgrLogo } from '@/components/shared/LedgrLogo';

interface PreloaderProps {
  onComplete: () => void;
}

export function Preloader({ onComplete }: PreloaderProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    // Only run on first session load
    const hasLoaded = sessionStorage.getItem('ledgr-loaded');
    if (hasLoaded) {
      onComplete();
      return;
    }

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      sessionStorage.setItem('ledgr-loaded', '1');
      onComplete();
      return;
    }

    // Animate: hold for 600ms, then slide up
    const hold = setTimeout(async () => {
      const { gsap } = await import('gsap');
      gsap.to(overlayRef.current, {
        yPercent: -100,
        duration: 0.85,
        ease: 'expo.inOut',
        onComplete: () => {
          sessionStorage.setItem('ledgr-loaded', '1');
          onComplete();
        },
      });
    }, 700);

    return () => clearTimeout(hold);
  }, [onComplete]);

  return (
    <div
      ref={overlayRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'var(--brand)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
      }}
    >
      {/* Animated ledger check icon */}
      <svg
        ref={iconRef}
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        aria-hidden="true"
        style={{ animation: 'preloader-pulse 1.2s ease-in-out infinite' }}
      >
        <style>{`
          @keyframes preloader-pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(0.92); }
          }
        `}</style>
        <rect x="6" y="4" width="36" height="40" rx="5" fill="rgba(255,255,255,0.15)" stroke="white" strokeWidth="2" />
        <line x1="13" y1="16" x2="35" y2="16" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        <line x1="13" y1="23" x2="28" y2="23" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        <polyline points="14,31 20,37 34,26" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>

      <span
        style={{
          fontFamily: "'DM Sans', 'Inter', sans-serif",
          fontWeight: 800,
          fontSize: '1.75rem',
          letterSpacing: '-0.03em',
          color: '#fff',
        }}
      >
        Ledgr
      </span>
    </div>
  );
}
