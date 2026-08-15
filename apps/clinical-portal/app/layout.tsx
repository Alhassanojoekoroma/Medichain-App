import type { Metadata } from 'next';
import { BrandMark, StatusBadge } from '@medichain/design-system/web';
import { clinicalSession } from '@/lib/backend';
import { PortalNav } from '@/components/PortalNav';
import '../../../packages/design-system/src/tokens.css';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'MediChain SL Clinical Portal', template: '%s | MediChain SL' },
  description: 'Secure doctor and nurse access to verified patient records.',
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await clinicalSession();
  const canSearch = session?.actor.role === 'doctor';
  const canUpload = session?.actor.role === 'doctor';
  const hospitalName = process.env.HOSPITAL_DISPLAY_NAME?.trim() || 'MediChain SL';
  const displayName = session?.actor.fullName ?? (session?.actor.role === 'doctor' ? 'Doctor' : session?.actor.role === 'nurse' ? 'Nurse' : 'Secure user');
  const initials = displayName.split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase();

  return <html lang="en"><body className={`portal-${session?.actor.role ?? 'doctor'}`}>
    <a className="skip" href="#main">Skip to content</a>
    <div className="mc-app-frame">
      <header className="mc-navbar">
        <div className="mc-brand"><BrandMark /><span>{hospitalName}</span></div>
        <PortalNav canSearch={canSearch} canUpload={canUpload} />
        <div className="mc-nav-profile" aria-label={session ? `${displayName}, ${session.actor.role}` : 'Signed out'}>
          <span className="mc-avatar" aria-hidden="true">{initials}</span>
          <span className="mc-who"><strong>{displayName}</strong><small>{session ? session.actor.role : 'Sign-in required'}</small></span>
          {session ? <StatusBadge tone="success">MFA</StatusBadge> : null}
        </div>
      </header>
      <main id="main" className="mc-main">{children}</main>
    </div>
  </body></html>;
}
