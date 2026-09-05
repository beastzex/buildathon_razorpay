'use client';

import React from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { RECENT_BATCHES } from '@/lib/mock-data';
import { Zap, Database, ArrowUpRight } from 'lucide-react';

interface TopbarProps {
  title: string;
}

export function Topbar({ title }: TopbarProps) {
  return (
    <header
      style={{
        height: 60,
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <h1
          className="font-display-md"
          style={{ fontSize: '1.05rem', color: 'var(--text)', letterSpacing: '-0.02em', margin: 0 }}
        >
          {title}
        </h1>

        <span
          style={{
            fontSize: '0.72rem',
            fontWeight: 800,
            padding: '3px 9px',
            borderRadius: 999,
            background: 'rgba(254,74,35,0.1)',
            color: '#FE4A23',
            border: '1px solid rgba(254,74,35,0.2)'
          }}
        >
          LIVE RELAY ACTIVE
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Link to 10K External Portal */}
        <Link
          href="/portal"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 999,
            background: 'rgba(254,74,35,0.08)',
            border: '1px solid rgba(254,74,35,0.2)',
            color: '#FE4A23',
            fontSize: '0.78rem',
            fontWeight: 700,
            textDecoration: 'none'
          }}
        >
          <Database size={13} />
          <span>FinStream 10K Portal</span>
          <ArrowUpRight size={12} />
        </Link>

        {/* Batch selector */}
        <select
          id="batch-selector"
          className="input-field"
          style={{
            width: 'auto',
            fontSize: '0.8125rem',
            padding: '6px 12px',
            borderRadius: 8,
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            color: 'var(--text)'
          }}
          defaultValue="batch-214"
          aria-label="Select reconciliation batch"
        >
          <option value="batch-external-stream">Batch #STREAM (10,000 External Records)</option>
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
            background: '#FE4A23',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '0.8rem',
            fontWeight: 800,
            boxShadow: '0 2px 8px rgba(254,74,35,0.3)'
          }}
        >
          AI
        </div>
      </div>
    </header>
  );
}
