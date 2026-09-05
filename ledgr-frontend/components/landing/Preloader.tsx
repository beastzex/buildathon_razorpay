'use client';

import React, { useEffect, useRef, useState } from 'react';

interface PreloaderProps {
  onComplete: () => void;
}

export function Preloader({ onComplete }: PreloaderProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    // Only run on first session load
    const hasLoaded = sessionStorage.getItem('ledgr-loaded');
    if (hasLoaded) {
      onComplete();
      return;
    }

    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 95) {
          clearInterval(interval);
          return 100;
        }
        return p + 25;
      });
    }, 180);

    const hold = setTimeout(async () => {
      const { gsap } = await import('gsap');
      if (overlayRef.current) {
        gsap.to(overlayRef.current, {
          yPercent: -100,
          duration: 0.75,
          ease: 'expo.inOut',
          onComplete: () => {
            sessionStorage.setItem('ledgr-loaded', '1');
            onComplete();
          }
        });
      }
    }, 900);

    return () => {
      clearInterval(interval);
      clearTimeout(hold);
    };
  }, [onComplete]);

  return (
    <div
      ref={overlayRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: '#0D0D11',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#FFFFFF'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="2" width="9" height="9" rx="3" fill="#FE4A23" />
            <rect x="13" y="2" width="9" height="9" rx="3" fill="#FFFFFF" />
            <rect x="2" y="13" width="9" height="9" rx="3" fill="#FFFFFF" />
            <rect x="13" y="13" width="9" height="9" rx="3" fill="#FFD028" />
          </svg>
        </div>
        <div style={{ fontFamily: "'Urbanist', sans-serif", fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.04em' }}>
          Ledgr<span style={{ color: '#FE4A23', fontSize: '0.6em' }}>®</span>
        </div>
      </div>

      <div style={{ width: 220 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: '#9CA3AF', marginBottom: 6 }}>
          <span>Data Ingestion Engine</span>
          <span style={{ color: '#FE4A23', fontWeight: 700 }}>{progress}%</span>
        </div>
        <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 999, overflow: 'hidden' }}>
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              background: '#FE4A23',
              borderRadius: 999,
              transition: 'width 0.25s ease'
            }}
          />
        </div>
      </div>
    </div>
  );
}
