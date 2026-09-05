'use client';

import React, { useEffect, useRef, useState } from 'react';

interface PreloaderProps {
  onComplete: () => void;
}

export function Preloader({ onComplete }: PreloaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const curtainRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [lineWidth, setLineWidth] = useState(0);

  useEffect(() => {
    // Quick session check
    const hasLoaded = sessionStorage.getItem('ledgr-preloaded');
    if (hasLoaded) {
      onComplete();
      return;
    }

    // Step 1: Progress line expand
    const lineTimer = setTimeout(() => {
      setLineWidth(100);
    }, 100);

    // Step 2: Animate curtain columns up staggered
    const curtainTimer = setTimeout(async () => {
      const { gsap } = await import('gsap');
      if (curtainRefs.current.length > 0) {
        gsap.to(curtainRefs.current, {
          height: '0%',
          duration: 0.7,
          stagger: 0.08,
          ease: 'power4.inOut',
          onComplete: () => {
            sessionStorage.setItem('ledgr-preloaded', '1');
            onComplete();
          }
        });
      } else {
        onComplete();
      }
    }, 1100);

    return () => {
      clearTimeout(lineTimer);
      clearTimeout(curtainTimer);
    };
  }, [onComplete]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        pointerEvents: 'none',
        display: 'flex',
        overflow: 'hidden'
      }}
    >
      {/* 6 Stepped Red-Orange Curtain Columns */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          ref={(el) => { curtainRefs.current[i] = el; }}
          style={{
            flex: 1,
            height: '100%',
            background: '#FE4A23',
            transformOrigin: 'top'
          }}
        />
      ))}

      {/* Center Content Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '48px 60px',
          color: '#FFFFFF',
          zIndex: 10
        }}
      >
        {/* Top Left: Data Processing Label */}
        <div style={{ fontSize: '1rem', fontWeight: 600, letterSpacing: '0.02em', opacity: 0.9 }}>
          Data Processing
        </div>

        {/* Center: Massive Wordmark & Animated Line with Circular Badges */}
        <div style={{ width: '100%', maxWidth: 1100, margin: '0 auto' }}>
          <div
            style={{
              fontFamily: "'Urbanist', sans-serif",
              fontSize: 'clamp(4.5rem, 14vw, 11rem)',
              fontWeight: 900,
              letterSpacing: '-0.05em',
              lineHeight: 0.9,
              marginBottom: 40
            }}
          >
            Ledgr<span style={{ fontSize: '0.4em', verticalAlign: 'top', marginLeft: 8 }}>®</span>
          </div>

          {/* Animated Progress Line with 3 Floating White Circles */}
          <div style={{ position: 'relative', width: '100%', height: 2, background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                width: `${lineWidth}%`,
                height: '100%',
                background: '#FFFFFF',
                transition: 'width 0.9s cubic-bezier(0.25, 1, 0.5, 1)'
              }}
            />

            {/* 3 Circular Badges (Lightning, Line Chart, Bar Chart) */}
            <div style={{ position: 'absolute', left: '25%', transform: 'translateX(-50%)', width: 44, height: 44, borderRadius: '50%', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="#FE4A23" />
              </svg>
            </div>

            <div style={{ position: 'absolute', left: '60%', transform: 'translateX(-50%)', width: 44, height: 44, borderRadius: '50%', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M3 17L9 11L13 15L21 7" stroke="#FE4A23" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="21" cy="7" r="2.5" fill="#FE4A23" />
              </svg>
            </div>

            <div style={{ position: 'absolute', left: '90%', transform: 'translateX(-50%)', width: 44, height: 44, borderRadius: '50%', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="10" width="3" height="10" rx="1.5" fill="#FE4A23" />
                <rect x="10" y="4" width="3" height="16" rx="1.5" fill="#FE4A23" />
                <rect x="16" y="13" width="3" height="7" rx="1.5" fill="#FE4A23" />
              </svg>
            </div>
          </div>
        </div>

        {/* Bottom space */}
        <div style={{ height: 20 }} />
      </div>
    </div>
  );
}
