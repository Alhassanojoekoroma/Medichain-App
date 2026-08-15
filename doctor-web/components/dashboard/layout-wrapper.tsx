'use client';

import { useEffect } from 'react';
import type { ReactNode } from 'react';

/**
 * LayoutWrapper — wraps all doctor-web pages.
 * Used by page.tsx files that need the app shell without the root layout.
 * Root layout already provides AuthGuard + AuthProvider.
 * This wrapper provides the page shell chrome (offline banners, etc.).
 */
export function LayoutWrapper({ children, title }: { children: ReactNode; title?: string }) {
  useEffect(() => {
    const hideBanner = () => {
      document.querySelector('.mc-offline-bar')?.setAttribute('style', 'display:none');
    };
    const showBanner = () => {
      document.querySelector('.mc-offline-bar')?.removeAttribute('style');
    };

    window.addEventListener('online', hideBanner);
    window.addEventListener('offline', showBanner);

    return () => {
      window.removeEventListener('online', hideBanner);
      window.removeEventListener('offline', showBanner);
    };
  }, []);

  return (
    <div className="page-shell">
      {children}
    </div>
  );
}
