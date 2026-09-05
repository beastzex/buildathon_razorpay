'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Database, Zap } from 'lucide-react';
import { ThemeToggle } from '@/components/shared/ThemeToggle';

export function LandingNav() {
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  const [activeLink, setActiveLink] = useState('features');

  const navLinks = [
    { id: 'features', label: 'Key Features', href: '#features' },
    { id: 'relay', label: '8-Agent Relay', href: '#relay' },
    { id: 'forecasting', label: 'Forecasting', href: '#forecasting' },
    { id: 'audit', label: 'Audit Trail', href: '#audit' },
    { id: 'portal', label: '10K Data Portal', href: '/portal', highlight: true }
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
        padding: '0 20px',
        pointerEvents: 'none'
      }}
    >
      <div
        style={{
          pointerEvents: 'auto',
          maxWidth: 1180,
          width: '100%',
          background: 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          borderRadius: 999,
          padding: '8px 12px 8px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
          transition: 'all 0.3s ease'
        }}
      >
        {/* Logo with Ramos-style rotating geometric glyph */}
        <Link
          href="/"
          onMouseEnter={() => setIsLogoHovered(true)}
          onMouseLeave={() => setIsLogoHovered(false)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            textDecoration: 'none',
            color: '#0D0D11'
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.7s cubic-bezier(0.68, -0.55, 0.27, 1.55)',
              transform: isLogoHovered ? 'rotate(180deg)' : 'rotate(0deg)'
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="2" width="9" height="9" rx="3" fill="#FE4A23" />
              <rect x="13" y="2" width="9" height="9" rx="3" fill="#0D0D11" />
              <rect x="2" y="13" width="9" height="9" rx="3" fill="#0D0D11" />
              <rect x="13" y="13" width="9" height="9" rx="3" fill="#FFD028" />
            </svg>
          </div>
          <span
            style={{
              fontFamily: "'Urbanist', sans-serif",
              fontSize: '1.35rem',
              fontWeight: 900,
              letterSpacing: '-0.04em',
              color: '#0D0D11'
            }}
          >
            Ledgr<span style={{ color: '#FE4A23', fontSize: '0.85em' }}>®</span>
          </span>
        </Link>

        {/* Floating Center Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {navLinks.map((link) => {
            const isSelected = activeLink === link.id;
            return (
              <a
                key={link.id}
                href={link.href}
                onClick={() => setActiveLink(link.id)}
                style={{
                  textDecoration: 'none',
                  fontSize: '0.86rem',
                  fontWeight: link.highlight ? 700 : 600,
                  color: link.highlight ? '#FE4A23' : (isSelected ? '#0D0D11' : '#6B7280'),
                  padding: '7px 16px',
                  borderRadius: 999,
                  background: link.highlight
                    ? 'rgba(254, 74, 35, 0.09)'
                    : (isSelected ? 'rgba(0,0,0,0.05)' : 'transparent'),
                  border: link.highlight ? '1px solid rgba(254, 74, 35, 0.25)' : 'none',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5
                }}
              >
                {link.highlight && <Database size={13} color="#FE4A23" />}
                <span>{link.label}</span>
              </a>
            );
          })}
        </nav>

        {/* Right CTA Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ThemeToggle />

          <Link
            href="/dashboard/reconciliation"
            style={{
              textDecoration: 'none',
              background: '#0D0D11',
              color: '#FFFFFF',
              borderRadius: 999,
              padding: '6px 6px 6px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: '0.86rem',
              fontWeight: 700,
              boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
              transition: 'transform 0.15s, background 0.15s'
            }}
          >
            <span>Launch Platform</span>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 999,
                background: '#FE4A23',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(254,74,35,0.4)'
              }}
            >
              <ArrowUpRight size={16} color="#FFFFFF" />
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
