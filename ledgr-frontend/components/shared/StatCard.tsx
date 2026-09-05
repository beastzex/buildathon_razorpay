interface StatCardProps {
  label: string;
  value: string;
  subtext?: string;
  trend?: number; // positive = up, negative = down
  sparkline?: number[]; // array of values for mini sparkline
  accentColor?: string;
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 80;
  const height = 28;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  });
  const pathD = `M${points.join(' L')}`;
  const areaD = `${pathD} L${width},${height} L0,${height} Z`;

  return (
    <svg width={width} height={height} aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`sg-${color.replace(/[^a-z0-9]/gi, '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#sg-${color.replace(/[^a-z0-9]/gi, '')})`} />
      <path d={pathD} stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function StatCard({ label, value, subtext, trend, sparkline, accentColor = 'var(--brand)' }: StatCardProps) {
  return (
    <div
      className="card"
      style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: 6 }}>
            {label}
          </p>
          <p
            className="font-display-md"
            style={{ fontSize: '2rem', color: 'var(--text)', lineHeight: 1 }}
          >
            {value}
          </p>
          {subtext && (
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 6 }}>
              {subtext}
            </p>
          )}
          {trend !== undefined && (
            <p
              style={{
                fontSize: '0.8125rem',
                marginTop: 6,
                color: trend >= 0 ? 'var(--success)' : 'var(--critical)',
                fontWeight: 600,
              }}
            >
              {trend >= 0 ? '+' : ''}{trend.toFixed(1)}% vs prev batch
            </p>
          )}
        </div>
        {sparkline && sparkline.length > 1 && (
          <div style={{ paddingTop: 4 }}>
            <Sparkline data={sparkline} color={accentColor} />
          </div>
        )}
      </div>
    </div>
  );
}
