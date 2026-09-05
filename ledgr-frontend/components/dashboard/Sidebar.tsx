'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Layers,
  AlertTriangle,
  MessageSquare,
  Globe2,
  ShieldCheck,
  Settings,
  Database,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard/overview', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/reconciliation', label: 'Reconciliation', icon: Layers },
  { href: '/dashboard/simulation', label: 'Simulation & Wealth', icon: Sparkles, badge: 'AI' },
  { href: '/dashboard/exceptions', label: 'Exceptions', icon: AlertTriangle },
  { href: '/dashboard/settlement', label: 'Settlement Q&A', icon: MessageSquare },
  { href: '/dashboard/portfolio', label: 'Platform Portfolio', icon: Globe2 },
  { href: '/dashboard/audit', label: 'Audit Trail', icon: ShieldCheck },
  { href: '/portal', label: '10K Data Portal', icon: Database, badge: '10K', external: true },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isLogoHovered, setIsLogoHovered] = useState(false);

  return (
    <aside
      style={{
        width: 250,
        height: '100vh',
        background: '#0D0D11',
        borderRight: '2px solid #1E1E26',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px 16px',
        flexShrink: 0
      }}
      aria-label="Dashboard Sidebar Navigation"
    >
      <div>
        {/* Brand Header with Rotating Geometric Glyph */}
        <Link
          href="/"
          onMouseEnter={() => setIsLogoHovered(true)}
          onMouseLeave={() => setIsLogoHovered(false)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            textDecoration: 'none',
            padding: '4px 8px 24px',
            borderBottom: '2px solid #1E1E26',
            marginBottom: 16
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
              <rect x="13" y="2" width="9" height="9" rx="3" fill="#FFFFFF" />
              <rect x="2" y="13" width="9" height="9" rx="3" fill="#FFFFFF" />
              <rect x="13" y="13" width="9" height="9" rx="3" fill="#FFD028" />
            </svg>
          </div>
          <span
            style={{
              fontFamily: "'Urbanist', sans-serif",
              fontSize: '1.35rem',
              fontWeight: 900,
              letterSpacing: '-0.04em',
              color: '#FFFFFF'
            }}
          >
            Ledgr<span style={{ color: '#FE4A23', fontSize: '0.85em' }}>®</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: 10,
                  textDecoration: 'none',
                  fontSize: '0.86rem',
                  fontWeight: isActive ? 800 : 600,
                  color: isActive ? '#FFFFFF' : '#9CA3AF',
                  background: isActive ? '#FE4A23' : 'transparent',
                  border: isActive ? '2px solid #000000' : '1px solid transparent',
                  boxShadow: isActive ? '3px 3px 0px #FFD028' : 'none',
                  transition: 'all 0.12s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Icon size={17} color={isActive ? '#FFFFFF' : (item.badge ? '#FE4A23' : '#9CA3AF')} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    style={{
                      fontFamily: "'SF Mono', monospace",
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      padding: '2px 7px',
                      borderRadius: 4,
                      border: '1px solid currentColor',
                      background: isActive ? '#0D0D11' : 'rgba(254,74,35,0.15)',
                      color: isActive ? '#FFD028' : '#FE4A23'
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Live System Indicator */}
      <div
        style={{
          background: '#14151B',
          borderRadius: 12,
          padding: '14px',
          border: '2px solid #1E1E26',
          boxShadow: '3px 3px 0px #000000'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 10px #10B981' }} />
          <span style={{ fontFamily: "'SF Mono', monospace", fontSize: '0.74rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.04em' }}>
            AI RELAY ACTIVE
          </span>
        </div>
        <div style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>
          8 Agents Synchronized • Sub-sec Audit
        </div>
      </div>
    </aside>
  );
}
