import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Sora } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "@/components/layout-wrapper";

const plusJakartaSans = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
});

const sora = Sora({ 
  subsets: ["latin"],
  variable: "--font-sora",
});

export const metadata: Metadata = {
  title: "MediChain SL | Ministry of Health Portal",
  description: "National Health Dashboard for Sierra Leone Ministry of Health",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${plusJakartaSans.variable} ${sora.variable} antialiased`}>
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}
