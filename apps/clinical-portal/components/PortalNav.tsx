'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const isCurrent = (pathname: string, href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href);

export function PortalNav({ canSearch, canUpload }: { canSearch: boolean; canUpload: boolean }) {
  const pathname = usePathname();
  const items = [
    { href: '/', label: 'Home', visible: true },
    { href: '/find-patient', label: 'Find Patient', visible: canSearch },
    { href: '/upload', label: 'Upload or Add Record', visible: canUpload },
  ];

  return <nav className="mc-nav-pills" aria-label="Clinical portal">{items.filter(item => item.visible).map(item => {
    const active = isCurrent(pathname, item.href) || (item.href === '/find-patient' && pathname.startsWith('/patients/'));
    return <Link className={`mc-nav-pill${active ? ' active' : ''}`} aria-current={active ? 'page' : undefined} href={item.href} key={item.href} prefetch={false}>{item.label}</Link>;
  })}</nav>;
}
