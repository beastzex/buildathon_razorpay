import { type ChatMessage } from '@/lib/mock-data';

interface ChatBubbleProps {
  message: ChatMessage;
  onCitationClick?: (txnId: string) => void;
}

export function CitationChip({ txnId, onClick }: { txnId: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 8px',
        background: 'var(--brand-dim)',
        border: '1px solid var(--brand)',
        borderRadius: 100,
        color: 'var(--brand)',
        fontSize: '0.75rem',
        fontWeight: 600,
        cursor: onClick ? 'pointer' : 'default',
        fontFamily: "'SF Mono', 'Cascadia Code', Consolas, monospace",
        letterSpacing: '0.01em',
        transition: 'background 0.15s ease',
      }}
    >
      {txnId}
    </button>
  );
}

export function ChatBubble({ message, onCitationClick }: ChatBubbleProps) {
  const isUser = message.role === 'user';
  const ts = new Date(message.timestamp).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isUser ? 'flex-end' : 'flex-start',
        gap: 6,
        maxWidth: '100%',
      }}
    >
      <div
        className={isUser ? 'chat-bubble-user' : 'chat-bubble-ai'}
        style={{ maxWidth: '80%' }}
      >
        {message.content}
        {!isUser && message.citations && message.citations.length > 0 && (
          <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {message.citations.map(id => (
              <CitationChip
                key={id}
                txnId={id}
                onClick={onCitationClick ? () => onCitationClick(id) : undefined}
              />
            ))}
          </div>
        )}
      </div>
      <span style={{ fontSize: '0.7rem', color: 'var(--text-faint)' }}>{ts}</span>
    </div>
  );
}
