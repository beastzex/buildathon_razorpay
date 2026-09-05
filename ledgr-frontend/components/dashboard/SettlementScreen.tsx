'use client';

import { useState, useRef, useEffect } from 'react';
import { SEED_CHAT, type ChatMessage } from '@/lib/mock-data';
import { ChatBubble } from '@/components/shared/ChatBubble';

const SAMPLE_RESPONSES: Record<string, { content: string; citations?: string[] }> = {
  default: {
    content:
      "I can answer questions about the transactions in Batch #214. Try asking about a specific transaction ID, an amount discrepancy, or a settlement timing issue.",
  },
  txn4019: {
    content:
      "TXN-4019 is a confirmed mismatch. The bank shows a full vendor payment of ₹9,900 to a software vendor, but the gateway only processed ₹5,500 — a gap of ₹4,400. No split-payment record, partial settlement note, or chargeback entry explains the difference. This needs manual investigation, possibly a direct call with the vendor.",
    citations: ['TXN-4019'],
  },
};

function getResponse(input: string): { content: string; citations?: string[] } {
  const lower = input.toLowerCase();
  if (lower.includes('txn-4019') || lower.includes('txn4019') || lower.includes('9900') || lower.includes('vendor')) {
    return SAMPLE_RESPONSES.txn4019;
  }
  if (lower.includes('txn-4003') || lower.includes('txn4003') || lower.includes('9320') || lower.includes('gateway fee')) {
    return {
      content:
        "TXN-4003 has a ₹12 difference between bank (₹9,320) and gateway (₹9,308). This matches the gateway processing fee deducted at source. The settlement also arrived 1 day late. Confidence is 71%. You can verify the ₹12 fee in your gateway statement and then confirm the match.",
      citations: ['TXN-4003'],
    };
  }
  if (lower.includes('txn-4006') || lower.includes('txn4006') || lower.includes('1700') || lower.includes('merchant 014')) {
    return {
      content:
        "TXN-4006 is a confirmed mismatch. The bank recorded ₹11,500 for Merchant 014 but the gateway only shows ₹9,800 — a gap of ₹1,700. No gateway log entry explains this, so it's been escalated for manual reconciliation with Merchant 014.",
      citations: ['TXN-4006'],
    };
  }
  if (lower.includes('match rate') || lower.includes('how many')) {
    return {
      content:
        "Batch #214 has a 97.4% match rate. Of 20 records: 15 matched automatically, 3 were flagged for review (confidence below 85%), and 2 are confirmed mismatches requiring manual action.",
    };
  }
  return SAMPLE_RESPONSES.default;
}

export function SettlementScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>(SEED_CHAT);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-u`,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const { askSettlementQuestion } = await import('@/lib/api');
      const response = await askSettlementQuestion(trimmed, 'batch-214');
      const aiMsg: ChatMessage = {
        id: `msg-${Date.now()}-a`,
        role: 'assistant',
        content: response.answer,
        citations: response.citations,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      const response = getResponse(trimmed);
      const aiMsg: ChatMessage = {
        id: `msg-${Date.now()}-a`,
        role: 'assistant',
        content: response.content,
        citations: response.citations,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <p className="font-display-md" style={{ fontSize: '1rem', color: 'var(--text)', marginBottom: 2 }}>
          Settlement Q&A
        </p>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          Answers grounded strictly in Batch #214 data. Click a citation chip to jump to that record.
        </p>
      </div>

      {/* Chat area */}
      <div
        className="card"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        {/* Messages */}
        <div
          id="chat-messages"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          {messages.map(msg => (
            <ChatBubble key={msg.id} message={msg} />
          ))}

          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div
                style={{
                  padding: '10px 14px',
                  background: 'var(--surface-hover)',
                  borderRadius: '16px 16px 16px 4px',
                  display: 'flex',
                  gap: 4,
                  alignItems: 'center',
                }}
              >
                {[0, 1, 2].map(i => (
                  <span
                    key={i}
                    style={{
                      display: 'block',
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
                      background: 'var(--text-muted)',
                      animation: `pulse-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div
          style={{
            borderTop: '1px solid var(--border)',
            padding: '12px 16px',
            display: 'flex',
            gap: 10,
          }}
        >
          <textarea
            id="settlement-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            rows={2}
            placeholder="Ask about any transaction — English ya Hindi mein poochh sakte hain."
            style={{
              flex: 1,
              resize: 'none',
              background: 'var(--bg)',
              border: '1px solid var(--border-strong)',
              borderRadius: 10,
              padding: '9px 12px',
              color: 'var(--text)',
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.875rem',
              lineHeight: 1.5,
              outline: 'none',
              transition: 'border-color 0.15s ease',
            }}
            onFocus={e => { e.target.style.borderColor = 'var(--brand)'; }}
            onBlur={e => { e.target.style.borderColor = 'var(--border-strong)'; }}
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            id="settlement-send"
            aria-label="Send message"
            className="btn-primary"
            style={{
              alignSelf: 'flex-end',
              padding: '9px 18px',
              fontSize: '0.875rem',
              opacity: (!input.trim() || loading) ? 0.4 : 1,
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
