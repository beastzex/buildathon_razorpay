import { type RecordStatus } from '@/lib/mock-data';

interface StatusDotProps {
  status: RecordStatus;
  showLabel?: boolean;
}

const STATUS_CONFIG = {
  matched: { color: 'var(--success)', label: 'Matched' },
  flagged: { color: 'var(--warning)', label: 'Flagged' },
  mismatched: { color: 'var(--critical)', label: 'Mismatched' },
};

export function StatusDot({ status, showLabel = false }: StatusDotProps) {
  const { color, label } = STATUS_CONFIG[status];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span
        style={{
          display: 'inline-block',
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: color,
          flexShrink: 0,
        }}
      />
      {showLabel && (
        <span
          style={{
            fontSize: '0.8125rem',
            fontWeight: 500,
            color,
          }}
        >
          {label}
        </span>
      )}
    </span>
  );
}
