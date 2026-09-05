'use client';

import { useState, useEffect, useCallback } from 'react';
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
  const [lenisReady, setLenisReady] = useState(false);

  const handlePreloaderComplete = useCallback(() => {
    setPreloaderDone(true);
  }, []);

  // Init Lenis smooth scroll after preloader completes
  useEffect(() => {
    if (!preloaderDone) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    let lenis: { destroy: () => void } | null = null;
    let rafId: number;

    const init = async () => {
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

      setLenisReady(true);
    };

    init();

    return () => {
      if (lenis) lenis.destroy();
    };
  }, [preloaderDone]);

  return (
    <>
      {!preloaderDone && <Preloader onComplete={handlePreloaderComplete} />}

      <div
        style={{
          opacity: preloaderDone ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      >
        <LandingNav />
        <main id="main-content" style={{ paddingTop: 60 }}>
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
