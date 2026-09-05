'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Database } from 'lucide-react';

export function LandingNav() {
  const [activeLink, setActiveLink] = useState('Key Features');

  const links = [
    { label: 'Key Features', href: '#features' },
    { label: 'Explore', href: '#architecture' },
    { label: 'Solutions', href: '#solutions' },
    { label: 'Tools', href: '#tools' },
    { label: '10K Portal', href: '/portal', highlight: true },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <header
      style={{
        position: 'fixed',
        top: 20,
        left: 0,
        right: 0,
        zIndex: 100,
        display: 'flex',
        justifyContent: 'center',
        padding: '0 24px',
        pointerEvents: 'none'
      }}
    >
      <div
        style={{
          pointerEvents: 'auto',
          maxWidth: 1220,
          width: '100%',
          background: '#0D0D11',
          borderRadius: 999,
          padding: '8px 10px 8px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.28)',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        {/* Left: Ramos-style geometric glyph + lowercase ledgr */}
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            textDecoration: 'none',
            color: '#FFFFFF'
          }}
        >
          <div style={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="2" width="9" height="9" rx="3" fill="#FE4A23" />
              <rect x="13" y="2" width="9" height="9" rx="3" fill="#FFFFFF" />
              <rect x="2" y="13" width="9" height="9" rx="3" fill="#FFFFFF" />
              <rect x="13" y="13" width="9" height="9" rx="3" fill="#FFD028" />
            </svg>
          </div>
          <span
            style={{
              fontFamily: "'Urbanist', sans-serif",
              fontSize: '1.35rem',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              color: '#FFFFFF'
            }}
          >
            ledgr
          </span>
        </Link>

        {/* Center: Clean links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {links.map((link) => {
            const isSelected = activeLink === link.label;
            return (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setActiveLink(link.label)}
                style={{
                  textDecoration: 'none',
                  fontSize: '0.84rem',
                  fontWeight: link.highlight ? 700 : 500,
                  color: link.highlight ? '#FE4A23' : (isSelected ? '#FFFFFF' : '#9CA3AF'),
                  padding: '7px 16px',
                  borderRadius: 999,
                  background: link.highlight ? 'rgba(254, 74, 35, 0.15)' : (isSelected ? 'rgba(255,255,255,0.08)' : 'transparent'),
                  transition: 'all 0.15s ease'
                }}
              >
                {link.label}
              </a>
            );
          })}
        </nav>

        {/* Right: Pure white rounded button Sign Up / Launch */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link
            href="/dashboard/reconciliation"
            style={{
              textDecoration: 'none',
              background: '#FFFFFF',
              color: '#0D0D11',
              borderRadius: 999,
              padding: '10px 24px',
              fontSize: '0.86rem',
              fontWeight: 700,
              boxShadow: '0 2px 8px rgba(255,255,255,0.15)',
              transition: 'transform 0.15s ease'
            }}
          >
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  );
}
