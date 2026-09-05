'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LedgrLogo } from '@/components/shared/LedgrLogo';

const NAV_ITEMS = [
  {
    href: '/dashboard/overview',
    label: 'Overview',
    icon: (active: boolean) => (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="1" y="1" width="6" height="6" rx="1.5" stroke={active ? 'var(--brand)' : 'currentColor'} strokeWidth="1.5" />
        <rect x="9" y="1" width="6" height="6" rx="1.5" stroke={active ? 'var(--brand)' : 'currentColor'} strokeWidth="1.5" />
        <rect x="1" y="9" width="6" height="6" rx="1.5" stroke={active ? 'var(--brand)' : 'currentColor'} strokeWidth="1.5" />
        <rect x="9" y="9" width="6" height="6" rx="1.5" stroke={active ? 'var(--brand)' : 'currentColor'} strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    href: '/dashboard/reconciliation',
    label: 'Reconciliation',
    icon: (active: boolean) => (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M2 4h12M2 8h8M2 12h10" stroke={active ? 'var(--brand)' : 'currentColor'} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/dashboard/exceptions',
    label: 'Exceptions',
    icon: (active: boolean) => (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M8 1L15 14H1L8 1z" stroke={active ? 'var(--brand)' : 'currentColor'} strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M8 6v4" stroke={active ? 'var(--brand)' : 'currentColor'} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="8" cy="12" r="0.75" fill={active ? 'var(--brand)' : 'currentColor'} />
      </svg>
    ),
  },
  {
    href: '/dashboard/settlement',
    label: 'Settlement Q&A',
    icon: (active: boolean) => (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M13 2H3a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h3l2 3 2-3h3a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z" stroke={active ? 'var(--brand)' : 'currentColor'} strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: '/dashboard/portfolio',
    label: 'Platform View',
    icon: (active: boolean) => (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="6.5" stroke={active ? 'var(--brand)' : 'currentColor'} strokeWidth="1.5" />
        <path d="M1.5 8h13M8 1.5c2 2 3 4.5 3 6.5s-1 4.5-3 6.5c-2-2-3-4.5-3-6.5s1-4.5 3-6.5z" stroke={active ? 'var(--brand)' : 'currentColor'} strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    href: '/dashboard/audit',
    label: 'Audit Trail',
    icon: (active: boolean) => (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="3" cy="4" r="1.5" stroke={active ? 'var(--brand)' : 'currentColor'} strokeWidth="1.5" />
        <circle cx="3" cy="8" r="1.5" stroke={active ? 'var(--brand)' : 'currentColor'} strokeWidth="1.5" />
        <circle cx="3" cy="12" r="1.5" stroke={active ? 'var(--brand)' : 'currentColor'} strokeWidth="1.5" />
        <line x1="6" y1="4" x2="14" y2="4" stroke={active ? 'var(--brand)' : 'currentColor'} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="6" y1="8" x2="12" y2="8" stroke={active ? 'var(--brand)' : 'currentColor'} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="6" y1="12" x2="13" y2="12" stroke={active ? 'var(--brand)' : 'currentColor'} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/dashboard/settings',
    label: 'Settings',
    icon: (active: boolean) => (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="2.5" stroke={active ? 'var(--brand)' : 'currentColor'} strokeWidth="1.5" />
        <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06M12.95 3.05l-1.06 1.06M4.11 11.89l-1.06 1.06" stroke={active ? 'var(--brand)' : 'currentColor'} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar" aria-label="Main navigation">
      {/* Logo */}
      <div style={{ padding: '20px 20px 16px' }}>
        <LedgrLogo size={26} showWordmark={true} />
      </div>

      <div style={{ height: 1, background: 'var(--border)', margin: '0 16px 12px' }} />

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0 0 16px' }}>
        {NAV_ITEMS.map(({ href, label, icon }) => {
          const isActive = pathname === href || pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {icon(isActive)}
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)' }}>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>
          Ledgr v0.1.0 — preview
        </p>
      </div>
    </aside>
  );
}
