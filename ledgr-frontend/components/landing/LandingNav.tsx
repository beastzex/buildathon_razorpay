'use client';

import Link from 'next/link';
import { LedgrLogo } from '@/components/shared/LedgrLogo';
import { ThemeToggle } from '@/components/shared/ThemeToggle';

export function LandingNav() {
  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: '0 5%',
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border)',
        background: 'rgba(var(--bg-rgb, 10,14,26), 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <Link href="/" style={{ textDecoration: 'none' }}>
        <LedgrLogo size={24} showWordmark={true} />
      </Link>

      <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
        <Link href="/dashboard" className="nav-link" style={{ fontSize: '0.9rem' }}>
          Dashboard
        </Link>
        <a href="#architecture" className="nav-link" style={{ fontSize: '0.9rem' }}>
          Architecture
        </a>
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <ThemeToggle />
        <Link href="/dashboard" className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.875rem' }}>
          Open app
        </Link>
      </div>
    </header>
  );
}
