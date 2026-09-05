interface ConfidenceBarProps {
  value: number; // 0–100
  showValue?: boolean;
}

function getColor(v: number): string {
  if (v >= 85) return 'var(--success)';
  if (v >= 60) return 'var(--warning)';
  return 'var(--critical)';
}

export function ConfidenceBar({ value, showValue = true }: ConfidenceBarProps) {
  const color = getColor(value);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <span className="confidence-bar-track">
        <span
          className="confidence-bar-fill"
          style={{ width: `${value}%`, background: color }}
        />
      </span>
      {showValue && (
        <span
          style={{
            fontSize: '0.8125rem',
            fontWeight: 600,
            color,
            minWidth: 30,
            textAlign: 'right',
          }}
        >
          {value}%
        </span>
      )}
    </span>
  );
}
