import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import { AnalyticsWrapper } from '@/components/analytics-wrapper'
import './globals.css'

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
    <html lang="en" className="bg-[#EAEEF2]">
      <body className={`${poppins.variable} font-sans antialiased`}>
        {children}
        <AnalyticsWrapper />
      </body>
    </html>
  )
}
