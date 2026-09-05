// lib/mock-data.ts
// Synthetic reconciliation batch — one batch with 20 transaction records.
// Replace fetch calls here when connecting to the FastAPI backend.

export type RecordStatus = 'matched' | 'flagged' | 'mismatched';

export interface DebateTranscript {
  resolved: boolean;
  verdict: string;
  rounds: number;
  disagreement_summary: string;
  opinion_for: string;
  opinion_against: string;
  resolver_reasoning?: string;
  fallback_used?: boolean;
}

export interface TransactionRecord {
  id: string;
  sourceA: {
    id: string;
    amount: number;
    date: string;
    description: string;
    reference: string;
  };
  sourceB: {
    id: string;
    amount: number;
    date: string;
    description: string;
    reference: string;
  };
  confidence: number; // 0–100
  status: RecordStatus;
  explanation?: string; // AI-generated, only for flagged/mismatched
  suggested_resolution?: string;
  explanation_status?: string;
  debate_transcript?: DebateTranscript;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  type: 'ingestion' | 'match' | 'escalation' | 'resolution' | 'export';
  description: string;
  hash: string;
  actor: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: string[]; // transaction IDs referenced
  timestamp: string;
}

export interface NightShiftRun {
  id: string;
  batch_id: string;
  total_records: number;
  auto_matched: number;
  debated_and_resolved: number;
  escalated_to_human: number;
  processing_time_seconds: number;
  top_anomalies: string[];
  created_at: string;
  digest_text?: string;
  notification_sent?: boolean;
}

export interface AgentResultEvent {
  agent_name: string;
  input_summary: string;
  output_summary: string;
  output_data?: any;
  duration_ms: number;
  status: 'ok' | 'flagged' | 'failed' | 'escalated' | 'disagreement';
  record_id?: string;
  batch_id?: string;
  timestamp: string;
}

export interface BatchSummary {
  id: string;
  label: string;
  runAt: string;
  matchRate: number;
  totalRecords: number;
  matchedCount: number;
  flaggedCount: number;
  mismatchedCount: number;
  avgResolutionMs: number;
}

// ── Mock batch ───────────────────────────────────────────────────────────────
export const CURRENT_BATCH: BatchSummary = {
  id: 'batch-214',
  label: 'Batch #214 — Sep 01, 2026',
  runAt: '2026-09-01T23:45:00Z',
  matchRate: 97.4,
  totalRecords: 20,
  matchedCount: 15,
  flaggedCount: 3,
  mismatchedCount: 2,
  avgResolutionMs: 1800,
};

export const TRANSACTIONS: TransactionRecord[] = [
  {
    id: 'TXN-4001',
    sourceA: { id: 'BNK-8812', amount: 42500.00, date: '2026-09-01', description: 'Transfer — HDFC Settlement', reference: 'REF-91822A' },
    sourceB: { id: 'GW-1021', amount: 42500.00, date: '2026-09-01', description: 'Razorpay payout', reference: 'PO-991882' },
    confidence: 98,
    status: 'matched',
  },
  {
    id: 'TXN-4002',
    sourceA: { id: 'BNK-8813', amount: 18750.00, date: '2026-09-01', description: 'Transfer — ICICI Payout', reference: 'REF-91823B' },
    sourceB: { id: 'GW-1022', amount: 18750.00, date: '2026-09-01', description: 'Gateway settlement batch', reference: 'PO-991883' },
    confidence: 97,
    status: 'matched',
  },
  {
    id: 'TXN-4003',
    sourceA: { id: 'BNK-8814', amount: 9320.00, date: '2026-09-01', description: 'Inward credit', reference: 'REF-91824C' },
    sourceB: { id: 'GW-1023', amount: 9308.00, date: '2026-09-02', description: 'Late settlement — 1 day', reference: 'PO-991884' },
    confidence: 71,
    status: 'flagged',
    explanation: 'Amount differs by ₹12.00 — likely a gateway processing fee deducted at source. Settlement date is 1 day late. Confidence 71%, below the auto-match threshold of 85%. Flagged for review.',
  },
  {
    id: 'TXN-4004',
    sourceA: { id: 'BNK-8815', amount: 67200.00, date: '2026-09-01', description: 'Bulk payout — Vendor A', reference: 'REF-91825D' },
    sourceB: { id: 'GW-1024', amount: 67200.00, date: '2026-09-01', description: 'Vendor disbursement', reference: 'PO-991885' },
    confidence: 99,
    status: 'matched',
  },
  {
    id: 'TXN-4005',
    sourceA: { id: 'BNK-8816', amount: 3450.00, date: '2026-09-01', description: 'Refund credit', reference: 'REF-91826E' },
    sourceB: { id: 'GW-1025', amount: 3450.00, date: '2026-09-01', description: 'Customer refund processed', reference: 'PO-991886' },
    confidence: 95,
    status: 'matched',
  },
  {
    id: 'TXN-4006',
    sourceA: { id: 'BNK-8817', amount: 11500.00, date: '2026-09-01', description: 'Settlement — Merchant 014', reference: 'REF-91827F' },
    sourceB: { id: 'GW-1026', amount: 9800.00, date: '2026-09-01', description: 'Partial settlement — Merchant 014', reference: 'PO-991887' },
    confidence: 48,
    status: 'mismatched',
    explanation: 'Amount mismatch of ₹1,700.00 — source A shows full settlement of ₹11,500 while gateway records only ₹9,800. No fee deduction or charge-back in the gateway logs explains this gap. Confirmed mismatch. Escalated for manual reconciliation.',
  },
  {
    id: 'TXN-4007',
    sourceA: { id: 'BNK-8818', amount: 28900.00, date: '2026-09-01', description: 'Transfer — SBI Settlement', reference: 'REF-91828G' },
    sourceB: { id: 'GW-1027', amount: 28900.00, date: '2026-09-01', description: 'SBI bank transfer', reference: 'PO-991888' },
    confidence: 96,
    status: 'matched',
  },
  {
    id: 'TXN-4008',
    sourceA: { id: 'BNK-8819', amount: 5600.00, date: '2026-09-01', description: 'Subscription renewal', reference: 'REF-91829H' },
    sourceB: { id: 'GW-1028', amount: 5600.00, date: '2026-09-01', description: 'Recurring charge — plan B', reference: 'PO-991889' },
    confidence: 94,
    status: 'matched',
  },
  {
    id: 'TXN-4009',
    sourceA: { id: 'BNK-8820', amount: 14200.00, date: '2026-09-01', description: 'Invoice payment — Corp X', reference: 'REF-91830I' },
    sourceB: { id: 'GW-1029', amount: 14188.00, date: '2026-09-02', description: 'Corp X payment — 2 day lag', reference: 'PO-991890' },
    confidence: 73,
    status: 'flagged',
    explanation: 'Amount differs by ₹12.00 — pattern consistent with gateway fee structure. Settlement arrived 2 days after bank recording. Confidence 73%. Recommend confirming with gateway fee schedule before resolving.',
  },
  {
    id: 'TXN-4010',
    sourceA: { id: 'BNK-8821', amount: 89000.00, date: '2026-09-01', description: 'Large transfer — Enterprise', reference: 'REF-91831J' },
    sourceB: { id: 'GW-1030', amount: 89000.00, date: '2026-09-01', description: 'Enterprise settlement', reference: 'PO-991891' },
    confidence: 99,
    status: 'matched',
  },
  {
    id: 'TXN-4011',
    sourceA: { id: 'BNK-8822', amount: 4100.00, date: '2026-09-01', description: 'Small merchant payout', reference: 'REF-91832K' },
    sourceB: { id: 'GW-1031', amount: 4100.00, date: '2026-09-01', description: 'Merchant A payout', reference: 'PO-991892' },
    confidence: 92,
    status: 'matched',
  },
  {
    id: 'TXN-4012',
    sourceA: { id: 'BNK-8823', amount: 22300.00, date: '2026-09-01', description: 'Bulk refund batch', reference: 'REF-91833L' },
    sourceB: { id: 'GW-1032', amount: 22300.00, date: '2026-09-01', description: 'Refund batch — 14 transactions', reference: 'PO-991893' },
    confidence: 97,
    status: 'matched',
  },
  {
    id: 'TXN-4013',
    sourceA: { id: 'BNK-8824', amount: 6750.00, date: '2026-09-01', description: 'Platform fee credit', reference: 'REF-91834M' },
    sourceB: { id: 'GW-1033', amount: 6750.00, date: '2026-09-01', description: 'Platform service fee', reference: 'PO-991894' },
    confidence: 91,
    status: 'matched',
  },
  {
    id: 'TXN-4014',
    sourceA: { id: 'BNK-8825', amount: 31000.00, date: '2026-09-01', description: 'Settlement — Axis bank', reference: 'REF-91835N' },
    sourceB: { id: 'GW-1034', amount: 31000.00, date: '2026-09-01', description: 'Axis settlement confirmed', reference: 'PO-991895' },
    confidence: 98,
    status: 'matched',
  },
  {
    id: 'TXN-4015',
    sourceA: { id: 'BNK-8826', amount: 7200.00, date: '2026-09-01', description: 'Chargeback reversal', reference: 'REF-91836O' },
    sourceB: { id: 'GW-1035', amount: 7200.00, date: '2026-09-01', description: 'CB reversal processed', reference: 'PO-991896' },
    confidence: 93,
    status: 'matched',
  },
  {
    id: 'TXN-4016',
    sourceA: { id: 'BNK-8827', amount: 51800.00, date: '2026-09-01', description: 'Monthly settlement — Partner B', reference: 'REF-91837P' },
    sourceB: { id: 'GW-1036', amount: 51800.00, date: '2026-09-01', description: 'Partner B monthly', reference: 'PO-991897' },
    confidence: 96,
    status: 'matched',
  },
  {
    id: 'TXN-4017',
    sourceA: { id: 'BNK-8828', amount: 2300.00, date: '2026-09-01', description: 'Micro-payment batch', reference: 'REF-91838Q' },
    sourceB: { id: 'GW-1037', amount: 2300.00, date: '2026-09-01', description: 'Micro-payment sweep', reference: 'PO-991898' },
    confidence: 90,
    status: 'matched',
  },
  {
    id: 'TXN-4018',
    sourceA: { id: 'BNK-8829', amount: 16400.00, date: '2026-09-01', description: 'Inter-bank transfer', reference: 'REF-91839R' },
    sourceB: { id: 'GW-1038', amount: 16400.00, date: '2026-09-01', description: 'IB settlement confirmed', reference: 'PO-991899' },
    confidence: 95,
    status: 'matched',
  },
  {
    id: 'TXN-4019',
    sourceA: { id: 'BNK-8830', amount: 9900.00, date: '2026-09-01', description: 'Vendor payment — Software', reference: 'REF-91840S' },
    sourceB: { id: 'GW-1039', amount: 5500.00, date: '2026-09-01', description: 'Partial vendor payment', reference: 'PO-991900' },
    confidence: 32,
    status: 'mismatched',
    explanation: 'Significant amount mismatch of ₹4,400.00. Source A records full vendor payment while gateway shows only ₹5,500 processed. No corresponding split-payment record found in either source. This requires manual investigation and potential vendor contact.',
  },
  {
    id: 'TXN-4020',
    sourceA: { id: 'BNK-8831', amount: 13600.00, date: '2026-09-01', description: 'Final batch settlement', reference: 'REF-91841T' },
    sourceB: { id: 'GW-1040', amount: 13600.00, date: '2026-09-01', description: 'EOD settlement sweep', reference: 'PO-991901' },
    confidence: 97,
    status: 'matched',
  },
];

// ── Audit trail ──────────────────────────────────────────────────────────────
export const AUDIT_EVENTS: AuditEvent[] = [
  {
    id: 'AE-001',
    timestamp: '2026-09-01T22:00:00Z',
    type: 'ingestion',
    description: 'Bank statement ingested — 20 records from HDFC Bank API.',
    hash: 'a4f8c2e1b9d3f6a7',
    actor: 'system',
  },
  {
    id: 'AE-002',
    timestamp: '2026-09-01T22:00:08Z',
    type: 'ingestion',
    description: 'Gateway records ingested — 20 records from Razorpay settlement API.',
    hash: '7d1e9b3c5a2f8d4e',
    actor: 'system',
  },
  {
    id: 'AE-003',
    timestamp: '2026-09-01T23:45:00Z',
    type: 'match',
    description: 'Two-stage matching complete. 15 matched, 3 flagged, 2 mismatched.',
    hash: 'c3b7e4a1f9d2c8b5',
    actor: 'ledgr-engine',
  },
  {
    id: 'AE-004',
    timestamp: '2026-09-01T23:45:12Z',
    type: 'escalation',
    description: 'TXN-4003 escalated — confidence 71%, below threshold.',
    hash: '2e6f1d8c4b3a9e7f',
    actor: 'ledgr-engine',
  },
  {
    id: 'AE-005',
    timestamp: '2026-09-01T23:45:14Z',
    type: 'escalation',
    description: 'TXN-4006 escalated — confirmed mismatch, ₹1,700 discrepancy.',
    hash: 'f5a3d9e2c7b1f4a8',
    actor: 'ledgr-engine',
  },
  {
    id: 'AE-006',
    timestamp: '2026-09-01T23:45:16Z',
    type: 'escalation',
    description: 'TXN-4009 escalated — confidence 73%, amount delta ₹12.',
    hash: '8b2f7c4e1a9d3f6b',
    actor: 'ledgr-engine',
  },
  {
    id: 'AE-007',
    timestamp: '2026-09-01T23:45:18Z',
    type: 'escalation',
    description: 'TXN-4019 escalated — confirmed mismatch, ₹4,400 discrepancy.',
    hash: 'd4e8a2c6f1b9e3d7',
    actor: 'ledgr-engine',
  },
];

// ── Seed chat messages ────────────────────────────────────────────────────────
export const SEED_CHAT: ChatMessage[] = [
  {
    id: 'msg-1',
    role: 'user',
    content: 'Why is TXN-4003 flagged?',
    timestamp: '2026-09-02T09:00:00Z',
  },
  {
    id: 'msg-2',
    role: 'assistant',
    content: 'TXN-4003 is flagged because of two issues: the bank (BNK-8814) recorded ₹9,320 while the gateway (GW-1023) settled ₹9,308 — a difference of ₹12. That difference matches the typical Razorpay gateway processing fee deducted at source. Additionally, the settlement date on the gateway side is one day later than the bank record. Confidence is 71%, which is below the 85% auto-match threshold. You can confirm the ₹12 fee in your gateway fee schedule and then approve the match.',
    citations: ['TXN-4003'],
    timestamp: '2026-09-02T09:00:02Z',
  },
  {
    id: 'msg-3',
    role: 'user',
    content: 'TXN-4006 mein kya problem hai?',
    timestamp: '2026-09-02T09:01:00Z',
  },
  {
    id: 'msg-4',
    role: 'assistant',
    content: 'TXN-4006 mein ₹1,700 ka bada discrepancy hai. Bank statement (BNK-8817) mein ₹11,500 dikhta hai, lekin gateway record (GW-1026) sirf ₹9,800 show karta hai. Gateway logs mein koi fee deduction ya chargeback entry nahi mili jo is gap ko explain kare. Isliye system ne ise confirmed mismatch mark kiya hai aur manual reconciliation ke liye escalate kiya hai. Merchant 014 ke saath verify karna hoga.',
    citations: ['TXN-4006'],
    timestamp: '2026-09-02T09:01:02Z',
  },
];

// ── Recent activity (for Overview screen) ────────────────────────────────────
export const RECENT_BATCHES: BatchSummary[] = [
  { id: 'batch-214', label: 'Batch #214', runAt: '2026-09-01T23:45:00Z', matchRate: 97.4, totalRecords: 20, matchedCount: 15, flaggedCount: 3, mismatchedCount: 2, avgResolutionMs: 1800 },
  { id: 'batch-213', label: 'Batch #213', runAt: '2026-08-31T23:40:00Z', matchRate: 99.1, totalRecords: 18, matchedCount: 18, flaggedCount: 0, mismatchedCount: 0, avgResolutionMs: 1600 },
  { id: 'batch-212', label: 'Batch #212', runAt: '2026-08-30T23:50:00Z', matchRate: 95.2, totalRecords: 21, matchedCount: 19, flaggedCount: 1, mismatchedCount: 1, avgResolutionMs: 2100 },
  { id: 'batch-211', label: 'Batch #211', runAt: '2026-08-29T23:38:00Z', matchRate: 98.5, totalRecords: 22, matchedCount: 21, flaggedCount: 1, mismatchedCount: 0, avgResolutionMs: 1750 },
  { id: 'batch-210', label: 'Batch #210', runAt: '2026-08-28T23:55:00Z', matchRate: 94.0, totalRecords: 17, matchedCount: 15, flaggedCount: 1, mismatchedCount: 1, avgResolutionMs: 2300 },
  { id: 'batch-209', label: 'Batch #209', runAt: '2026-08-27T23:42:00Z', matchRate: 96.8, totalRecords: 19, matchedCount: 18, flaggedCount: 0, mismatchedCount: 1, avgResolutionMs: 1900 },
];

// ── Match-rate chart data (last 14 batches) ──────────────────────────────────
export const MATCH_RATE_TREND = [
  { batch: '#201', rate: 93.2 },
  { batch: '#202', rate: 95.8 },
  { batch: '#203', rate: 94.1 },
  { batch: '#204', rate: 97.0 },
  { batch: '#205', rate: 96.3 },
  { batch: '#206', rate: 98.5 },
  { batch: '#207', rate: 95.9 },
  { batch: '#208', rate: 97.2 },
  { batch: '#209', rate: 96.8 },
  { batch: '#210', rate: 94.0 },
  { batch: '#211', rate: 98.5 },
  { batch: '#212', rate: 95.2 },
  { batch: '#213', rate: 99.1 },
  { batch: '#214', rate: 97.4 },
];
