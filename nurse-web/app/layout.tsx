import type { Metadata } from 'next'
import './globals.css'
import { AuthGuard } from '@/components/AuthGuard'
import { AuthProvider } from '@/hooks/useAuth'
import { SessionExpiryGuard } from '@palmchain/web-client'

export const metadata: Metadata = {
  title: 'MediChain SL | Nurse Portal',
  description: 'MediChain SL — Blockchain-secured medical records for Sierra Leone. Nurse/Triage Web Portal.',
  generator: 'MediChain SL',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-[var(--primary-50)]">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Sora:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className={`font-sans antialiased`}>
        <a className="skip-link" href="#main-content">Skip to main content</a>
        <AuthProvider>
          <SessionExpiryGuard />
          <AuthGuard><div id="main-content" tabIndex={-1}>{children}</div></AuthGuard>
        </AuthProvider>
      </body>
    </html>
  )
}
