// components/shared/LedgrLogo.tsx
// Inline SVG — ledger page outline with a checkmark.
// Used in navbar, preloader, sidebar.

interface LedgrLogoProps {
  size?: number;
  showWordmark?: boolean;
  className?: string;
}

export function LedgrLogo({ size = 28, showWordmark = true, className = '' }: LedgrLogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`} style={{ userSelect: 'none' }}>
      {/* Icon: ledger page + checkmark */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Page body */}
        <rect
          x="4" y="2"
          width="20" height="24"
          rx="3"
          fill="var(--brand)"
          opacity="0.15"
        />
        <rect
          x="4" y="2"
          width="20" height="24"
          rx="3"
          stroke="var(--brand)"
          strokeWidth="1.5"
          fill="none"
        />
        {/* Lines (ledger rows) */}
        <line x1="8" y1="9" x2="20" y2="9" stroke="var(--brand)" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
        <line x1="8" y1="13" x2="16" y2="13" stroke="var(--brand)" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
        {/* Checkmark */}
        <polyline
          points="8.5,18.5 11.5,21.5 19.5,15.5"
          stroke="var(--brand)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>

      {showWordmark && (
        <span
          style={{
            fontFamily: "'DM Sans', 'Inter', sans-serif",
            fontWeight: 800,
            fontSize: size * 0.72,
            letterSpacing: '-0.03em',
            color: 'var(--text)',
            lineHeight: 1,
          }}
        >
          Ledgr
        </span>
      )}
    </div>
  );
}
