import { type AuditEvent } from '@/lib/mock-data';

interface AuditTimelineEntryProps {
  event: AuditEvent;
  isLast: boolean;
}

const EVENT_COLORS: Record<AuditEvent['type'], string> = {
  ingestion: 'var(--data)',
  match: 'var(--success)',
  escalation: 'var(--warning)',
  resolution: 'var(--brand)',
  export: 'var(--text-muted)',
};

const EVENT_LABELS: Record<AuditEvent['type'], string> = {
  ingestion: 'Ingestion',
  match: 'Match',
  escalation: 'Escalation',
  resolution: 'Resolution',
  export: 'Export',
};

export function AuditTimelineEntry({ event, isLast }: AuditTimelineEntryProps) {
  const color = EVENT_COLORS[event.type];
  const ts = new Date(event.timestamp).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return (
    <div style={{ display: 'flex', gap: 16, position: 'relative', paddingBottom: isLast ? 0 : 24 }}>
      {/* Vertical line + dot */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: color,
            border: `2px solid var(--surface)`,
            flexShrink: 0,
            marginTop: 4,
            boxShadow: `0 0 0 3px ${color}22`,
          }}
        />
        {!isLast && (
          <div
            style={{
              width: 1,
              flex: 1,
              background: 'var(--border)',
              marginTop: 6,
            }}
          />
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, paddingBottom: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              color,
              background: `${color}18`,
              padding: '2px 8px',
              borderRadius: 100,
            }}
          >
            {EVENT_LABELS[event.type]}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ts}</span>
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--text)', lineHeight: 1.5, marginBottom: 6 }}>
          {event.description}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Hash chain link icon */}
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path
              d="M4 6a2 2 0 0 0 2.83 0l1.5-1.5a2 2 0 1 0-2.83-2.83l-.75.75"
              stroke="var(--text-faint)"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <path
              d="M8 6a2 2 0 0 1-2.83 0L3.67 7.5A2 2 0 1 0 6.5 10.33l.75-.75"
              stroke="var(--text-faint)"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
          <span className="font-mono-id" style={{ fontSize: '0.7rem', color: 'var(--text-faint)' }}>
            {event.hash}
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-faint)' }}>
            by {event.actor}
          </span>
        </div>
      </div>
    </div>
  );
}
