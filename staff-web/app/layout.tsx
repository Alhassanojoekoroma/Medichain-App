import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
import { AuthGuard } from '@/components/AuthGuard'
import { AuthProvider } from '@/hooks/useAuth'
import { SessionExpiryGuard } from '@palmchain/web-client'

const poppins = Poppins({ weight: ['300', '400', '500', '600', '700', '800'], subsets: ["latin"], variable: '--font-poppins' });

export const metadata: Metadata = {
  title: 'MediChain SL | Doctor Portal',
  description: 'MediChain SL — Blockchain-secured medical records for Sierra Leone. Doctor Web Portal.',
  generator: 'MediChain SL',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-[var(--primary-50)]">
      <body className={`${poppins.variable} font-sans antialiased`}>
        <a className="skip-link" href="#main-content">Skip to main content</a>
        <AuthProvider>
          <SessionExpiryGuard />
          <AuthGuard><div id="main-content" tabIndex={-1}>{children}</div></AuthGuard>
        </AuthProvider>
      </body>
    </html>
  )
}
