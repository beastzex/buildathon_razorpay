'use client';

import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { RECENT_BATCHES } from '@/lib/mock-data';

interface TopbarProps {
  title: string;
}

export function Topbar({ title }: TopbarProps) {
  return (
    <header
      style={{
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
        gap: 16,
      }}
    >
      <h1
        className="font-display-md"
        style={{ fontSize: '1rem', color: 'var(--text)', letterSpacing: '-0.01em' }}
      >
        {title}
      </h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Batch selector */}
        <select
          id="batch-selector"
          className="input-field"
          style={{ width: 'auto', fontSize: '0.8125rem', padding: '6px 10px' }}
          defaultValue="batch-214"
          aria-label="Select reconciliation batch"
        >
          {RECENT_BATCHES.map(b => (
            <option key={b.id} value={b.id}>
              {b.label}
            </option>
          ))}
        </select>

        <ThemeToggle />

        {/* Avatar */}
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'var(--brand)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '0.8125rem',
            fontWeight: 700,
            flexShrink: 0,
            cursor: 'pointer',
          }}
          title="User menu"
          aria-label="User menu"
        >
          A
        </div>
      </div>
    </header>
  );
}
