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
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        background: 'var(--surface)',
        borderBottom: '2px solid var(--border-strong)',
        flexShrink: 0,
        gap: 16,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <h1
          className="font-display-md"
          style={{ fontSize: '1.1rem', color: 'var(--text)', letterSpacing: '-0.02em', margin: 0, fontWeight: 900 }}
        >
          {title}
        </h1>

        <span
          className="brutal-badge"
          style={{
            background: 'rgba(254,74,35,0.12)',
            color: '#FE4A23',
            borderColor: '#FE4A23',
            fontSize: '0.68rem',
            padding: '3px 8px'
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FE4A23' }} />
          RELAY ONLINE
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Link to 10K External Portal */}
        <Link
          href="/portal"
          className="brutal-btn"
          style={{
            padding: '7px 14px',
            fontSize: '0.76rem',
            background: '#FE4A23',
            color: '#FFFFFF',
            borderColor: '#0D0D11',
            boxShadow: '2px 2px 0px #0D0D11'
          }}
        >
          <Database size={13} />
          <span>Stream 10K Portal</span>
          <ArrowUpRight size={13} />
        </Link>

        {/* Batch selector */}
        <select
          id="batch-selector"
          className="input-field"
          style={{
            width: 'auto',
            fontFamily: "'SF Mono', monospace",
            fontSize: '0.78rem',
            fontWeight: 700,
            padding: '7px 12px',
            borderRadius: 8,
            border: '2px solid var(--border-strong)',
            background: 'var(--surface)',
            color: 'var(--text)',
            boxShadow: '2px 2px 0px rgba(0,0,0,0.15)'
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
            width: 34,
            height: 34,
            borderRadius: 8,
            background: '#FFD028',
            border: '2px solid #0D0D11',
            boxShadow: '2px 2px 0px #0D0D11',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0D0D11',
            fontSize: '0.78rem',
            fontWeight: 900,
            fontFamily: "'SF Mono', monospace"
          }}
        >
          AI
        </div>
      </div>
    </header>
  );
}
