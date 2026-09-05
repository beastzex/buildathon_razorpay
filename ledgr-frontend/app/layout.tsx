import type { Metadata } from 'next';
import { ThemeProvider } from '@/lib/theme';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ledgr — Reconciliation that finally keeps up.',
  description:
    'Ledgr is an AI Finance Controller that matches your bank, gateway, and ledger records automatically, explains every exception in plain language, and answers your settlement questions instantly.',
  keywords: ['reconciliation', 'finance', 'AI', 'fintech', 'settlement', 'ledger'],
  openGraph: {
    title: 'Ledgr — Reconciliation that finally keeps up.',
    description: 'AI-powered reconciliation for finance teams.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('ledgr-theme') || 'dark';
                  document.documentElement.setAttribute('data-theme', theme);
                } catch(e) {
                  document.documentElement.setAttribute('data-theme', 'dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
