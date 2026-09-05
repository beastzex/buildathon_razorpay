import { Sidebar } from '@/components/dashboard/Sidebar';
import { Topbar } from '@/components/dashboard/Topbar';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard/overview': 'Overview',
  '/dashboard/reconciliation': 'Reconciliation',
  '/dashboard/exceptions': 'Exceptions',
  '/dashboard/settlement': 'Settlement Q&A',
  '/dashboard/portfolio': 'Platform Portfolio View',
  '/dashboard/audit': 'Audit Trail',
  '/dashboard/settings': 'Settings',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        background: 'var(--bg)',
      }}
    >
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopbarWrapper />
        <main
          style={{ flex: 1, overflowY: 'auto' }}
          id="main-content"
        >
          {children}
        </main>
      </div>
    </div>
  );
}

// Server component can't use usePathname, so we keep Topbar client-side
// and pass a static prop; actual title resolution happens in Topbar via client.
function TopbarWrapper() {
  return <Topbar title="Ledgr" />;
}
