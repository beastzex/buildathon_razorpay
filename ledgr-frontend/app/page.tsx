'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Preloader } from '@/components/landing/Preloader';
import { LandingNav } from '@/components/landing/LandingNav';
import { HeroSection } from '@/components/landing/HeroSection';
import { StatCardsSection } from '@/components/landing/StatCardsSection';
import { ProductExplainer } from '@/components/landing/ProductExplainer';
import { WordmarkSection } from '@/components/landing/WordmarkSection';
import { ControlSection } from '@/components/landing/ControlSection';
import { CtaFooter } from '@/components/landing/CtaFooter';

export default function LandingPage() {
  const [preloaderDone, setPreloaderDone] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);

  const handlePreloaderComplete = useCallback(() => {
    setPreloaderDone(true);
  }, []);

  // Ramos Custom Red Trailing Cursor
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = `${e.clientX}px`;
        cursorRef.current.style.top = `${e.clientY}px`;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Init Lenis smooth scroll after preloader completes
  useEffect(() => {
    if (!preloaderDone) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    let lenis: { destroy: () => void } | null = null;

    const init = async () => {
      try {
        const Lenis = (await import('lenis')).default;
        const { gsap } = await import('gsap');
        const { ScrollTrigger } = await import('gsap/ScrollTrigger');
        gsap.registerPlugin(ScrollTrigger);

        lenis = new Lenis({
          duration: 1.2,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
        });

        // Sync Lenis with GSAP ticker
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        gsap.ticker.add((time) => { (lenis as any).raf(time * 1000); });
        gsap.ticker.lagSmoothing(0);

        // Sync Lenis with ScrollTrigger
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (lenis as any).on('scroll', ScrollTrigger.update);
      } catch (e) {
        console.warn('Smooth scroll init error:', e);
      }
    };

    init();

    return () => {
      if (lenis) lenis.destroy();
    };
  }, [preloaderDone]);

  return (
    <>
      {/* Ramos Animated Red Dot Cursor */}
      <div ref={cursorRef} className="cursor-dot" />

      {!preloaderDone && <Preloader onComplete={handlePreloaderComplete} />}

      <div
        style={{
          opacity: preloaderDone ? 1 : 0,
          transition: 'opacity 0.4s ease',
          background: '#F6F6F9',
          minHeight: '100vh',
          color: '#0D0D11'
        }}
      >
        <LandingNav />
        <main id="main-content">
          <HeroSection />
          <StatCardsSection />
          <ProductExplainer />
          <WordmarkSection />
          <ControlSection />
          <CtaFooter />
        </main>
      </div>
    </>
  );
}
