import type { Metadata } from 'next'
import { Sora, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { AuthGuard } from '@/components/AuthGuard'
import { AuthProvider } from '@/hooks/useAuth'
import { SessionExpiryGuard } from '@palmchain/web-client'

const sora = Sora({ subsets: ['latin'], variable: '--font-sora' });
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta' });

export const metadata: Metadata = {
  title: 'MediChain SL | Laboratory Portal',
  description: 'MediChain SL — Blockchain-secured medical records for Sierra Leone. Laboratory Web Portal.',
  generator: 'MediChain SL',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-[var(--primary-50)]">
      <body className={`${sora.variable} ${jakarta.variable} font-sans antialiased`}>
        <a className="skip-link" href="#main-content">Skip to main content</a>
        <AuthProvider>
          <SessionExpiryGuard />
          <AuthGuard><div id="main-content" tabIndex={-1}>{children}</div></AuthGuard>
        </AuthProvider>
      </body>
    </html>
  )
}
