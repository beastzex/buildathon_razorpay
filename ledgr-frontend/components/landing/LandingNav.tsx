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
    { label: 'Dashboard', href: '/dashboard/reconciliation', highlight: true },
    { label: '10K Portal', href: '/portal', highlight: true },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: 'flex',
        justifyContent: 'center',
        padding: '16px 24px',
        pointerEvents: 'none',
        background: 'linear-gradient(to bottom, rgba(246, 246, 249, 0.9) 0%, rgba(246, 246, 249, 0.6) 70%, transparent 100%)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)'
      }}
    >
      <div
        style={{
          pointerEvents: 'auto',
          maxWidth: 1240,
          width: '100%',
          background: '#0D0D11',
          borderRadius: 999,
          padding: '8px 12px 8px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.32)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
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
                  color: link.highlight ? (link.label === 'Dashboard' ? '#FFD028' : '#FE4A23') : (isSelected ? '#FFFFFF' : '#9CA3AF'),
                  padding: '7px 16px',
                  borderRadius: 999,
                  background: link.highlight
                    ? (link.label === 'Dashboard' ? 'rgba(255, 208, 40, 0.15)' : 'rgba(254, 74, 35, 0.15)')
                    : (isSelected ? 'rgba(255,255,255,0.08)' : 'transparent'),
                  transition: 'all 0.15s ease'
                }}
              >
                {link.label}
              </a>
            );
          })}
        </nav>

        {/* Right: Actions (Dashboard Launch & Sign Up) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link
            href="/dashboard/reconciliation"
            style={{
              textDecoration: 'none',
              background: '#FE4A23',
              color: '#FFFFFF',
              borderRadius: 999,
              padding: '9px 20px',
              fontSize: '0.84rem',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 4px 14px rgba(254,74,35,0.4)',
              transition: 'transform 0.15s ease'
            }}
          >
            <span>Dashboard</span>
            <ArrowUpRight size={14} />
          </Link>

          <Link
            href="/dashboard/overview"
            style={{
              textDecoration: 'none',
              background: '#FFFFFF',
              color: '#0D0D11',
              borderRadius: 999,
              padding: '9px 20px',
              fontSize: '0.84rem',
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
