import { SettlementScreen } from '@/components/dashboard/SettlementScreen';

export const metadata = { title: 'Settlement Q&A — Ledgr' };

export default function SettlementPage() {
  return (
    <div style={{ height: 'calc(100vh - 56px)', display: 'flex', flexDirection: 'column' }}>
      <SettlementScreen />
    </div>
  );
}
