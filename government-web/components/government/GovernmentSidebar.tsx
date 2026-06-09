'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, MapPin, Pill, Activity, FileText,
  LogOut, Lock, X, Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LOGGED_IN_DOCTOR, MOCK_BLOCKCHAIN_STATUS } from '@/data/mockData';
import { logoutDoctor } from '@/services/auth';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const navItems = [
  { href: '/government/dashboard', icon: LayoutDashboard, label: 'National Overview' },
  { href: '/government/regional', icon: MapPin, label: 'Regional Stats' },
  { href: '/government/drugs', icon: Pill, label: 'Drug Distribution' },
  { href: '/government/disease-map', icon: Activity, label: 'Disease Trends' },
  { href: '/government/reports', icon: FileText, label: 'Reports' },
];

const helpNavItems = [
  { href: '/government/settings', icon: Settings, label: 'Settings' },
];

export default function GovernmentSidebar({ isOpen, onToggle }: SidebarProps) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const u = sessionStorage.getItem('mc_user');
      if (u) { try { setCurrentUser(JSON.parse(u)); } catch {} }
    }
  }, []);

  const displayName = currentUser?.name || LOGGED_IN_DOCTOR.name;

  const handleLogout = async () => {
    await logoutDoctor();
    if (typeof window !== 'undefined') sessionStorage.removeItem('mc_user');
    router.push('/login');
  };

  const accentColor = '#2563EB';

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-[260px] bg-white flex flex-col h-screen transition-transform duration-300 border-r border-border',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="p-5 flex items-center gap-2">
          <div className="w-10 h-10 bg-[#2563EB] rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">M</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="font-semibold text-base text-[#101326]">MediChain</span>
              <span className="bg-[#2563EB] text-white text-[10px] font-medium px-1.5 py-0.2 rounded-full">SL</span>
            </div>
            <span className="text-[10px] text-[#2563EB] font-semibold -mt-1">Ministry Portal</span>
          </div>
          <button className="lg:hidden ml-auto" onClick={onToggle}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 pb-3">
          <div className="flex items-center gap-1.5 text-xs text-[#8C91A8]">
            <Lock className="w-3 h-3" />
            <span>Fabric Org: GovernmentOrg</span>
          </div>
        </div>

        <div className="px-5 pb-4 border-b border-[#D8DCE8]">
          <div className="flex items-center gap-2 text-xs text-[#8C91A8] mb-2">
            <span>MediChain</span>
            <span>&gt;</span>
            <span className="text-[#101326] font-medium">MOHS</span>
          </div>
          <h1 className="text-xl font-bold text-[#101326] leading-tight">Welcome,</h1>
          <h1 className="text-xl font-bold leading-tight" style={{ color: accentColor }}>{displayName}</h1>
        </div>

        <div className="px-4 flex-1 pt-4 overflow-y-auto">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/government/dashboard' && pathname.startsWith(item.href));
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative border-l-4',
                    isActive ? 'text-[#2563EB] bg-[#EFF6FF] border-[#2563EB]' : 'text-[#5D6582] hover:bg-slate-50 border-transparent'
                  )}
                  style={isActive ? { borderLeftColor: accentColor, color: accentColor } : {}}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </nav>

          <div className="mt-6">
            <nav className="space-y-1">
              {helpNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border-l-4',
                      isActive ? 'text-[#2563EB] bg-[#EFF6FF] border-[#2563EB]' : 'text-[#5D6582] hover:bg-slate-50 border-transparent'
                    )}
                    style={isActive ? { borderLeftColor: accentColor, color: accentColor } : {}}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </a>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="p-4 mt-auto space-y-2">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full text-red-500 hover:bg-red-50 rounded-xl text-sm font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>

          <div className="rounded-2xl p-4 text-white" style={{ backgroundColor: accentColor }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-white text-xs font-semibold">Fabric Network</span>
            </div>
            <p className="text-white/80 text-xs mb-1">
              {MOCK_BLOCKCHAIN_STATUS.network}
            </p>
            <p className="text-white/80 text-xs mb-3">
              Channel: analytics-channel
            </p>
            <div className="w-full bg-black/20 text-white rounded-full py-2 px-3 text-xs font-medium text-center">
              ✓ CA Read-Only Enrolled
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
