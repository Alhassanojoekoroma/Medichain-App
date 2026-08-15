import type { Metadata } from 'next';
import './globals.css';
import { AuthGuard } from '@/components/AuthGuard';
import { AuthProvider } from '@/hooks/useAuth';
import { SessionExpiryGuard } from '@palmchain/web-client';

export const metadata: Metadata = {
  title: 'MediChain SL | Doctor Portal',
  description: 'MediChain SL — Blockchain-secured medical records for Sierra Leone. Doctor Web Portal for clinical record management.',
  keywords: 'MediChain, Sierra Leone, health records, blockchain, doctor portal',
  authors: [{ name: 'MediChain SL' }],
  generator: 'MediChain SL',
  themeColor: '#0D9426',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png',  media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg',             type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <a className="skip-link" href="#main-content">Skip to main content</a>
        <AuthProvider>
          <SessionExpiryGuard />
          <AuthGuard>
            <div id="main-content" tabIndex={-1}>
              {children}
            </div>
          </AuthGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
