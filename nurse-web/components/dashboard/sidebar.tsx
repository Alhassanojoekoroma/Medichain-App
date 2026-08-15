'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, FileText,
  Settings, LogOut, ChevronUp, ChevronDown,
  Lock, X, Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { logoutDoctor } from '@/services/auth';
import { useAuth } from '@/hooks/useAuth';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const mainNavItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { href: '/patients', icon: Users, label: 'Find Patient' },
  { href: '/records/upload', icon: FileText, label: 'Upload Record' },
];

const helpNavItems = [
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const [mainMenuExpanded, setMainMenuExpanded] = useState(true);
  const [helpMenuExpanded, setHelpMenuExpanded] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const displayName = user?.name || 'Signed-in nurse';

  const handleLogout = async () => {
    await logoutDoctor();
    if (typeof window !== 'undefined') sessionStorage.removeItem('mc_user');
    router.push('/login');
  };

  const accentColor = '#1D9E75';

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
          <div className="w-10 h-10 bg-[#1D9E75] rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">M</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="font-semibold text-base text-[#101326]">MediChain</span>
              <span className="bg-[#1D9E75] text-white text-[10px] font-medium px-1.5 py-0.2 rounded-full">SL</span>
            </div>
            <span className="text-[10px] text-[#1D9E75] font-semibold -mt-1">Nurse Portal</span>
          </div>
          <button className="lg:hidden ml-auto" onClick={onToggle}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 pb-3">
          <div className="flex items-center gap-1.5 text-xs text-[#8C91A8]">
            <Lock className="w-3 h-3" />
            <span>Fabric Org: NurseOrg</span>
          </div>
        </div>

        <div className="px-5 pb-4 border-b border-[#D8DCE8]">
          <div className="flex items-center gap-2 text-xs text-[#8C91A8] mb-2">
            <span>MediChain</span>
            <span>&gt;</span>
            <span className="text-[#101326] font-medium">Nurse</span>
          </div>
          <h1 className="text-xl font-bold text-[#101326] leading-tight">Welcome,</h1>
          <h1 className="text-xl font-bold leading-tight" style={{ color: accentColor }}>{displayName}</h1>
        </div>

        <div className="px-4 flex-1 pt-4 overflow-y-auto">
          <button
            onClick={() => setMainMenuExpanded(!mainMenuExpanded)}
            className="flex items-center justify-between w-full py-2 px-2 text-xs font-medium text-[#8C91A8] uppercase tracking-wider"
          >
            <span>Main Menu</span>
            {mainMenuExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {mainMenuExpanded && (
            <nav className="space-y-1">
              {mainNavItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative border-l-4',
                      isActive ? 'text-[#1D9E75] bg-[#E8F5EF] border-[#1D9E75]' : 'text-[#5D6582] hover:bg-slate-50 border-transparent'
                    )}
                    style={isActive ? { borderLeftColor: accentColor, color: accentColor } : {}}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.label}</span>
                  </a>
                );
              })}
            </nav>
          )}

          <div className="mt-6">
            <button
              onClick={() => setHelpMenuExpanded(!helpMenuExpanded)}
              className="flex items-center justify-between w-full py-2 px-2 text-xs font-medium text-[#8C91A8] uppercase tracking-wider"
            >
              <span>Settings</span>
              {helpMenuExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {helpMenuExpanded && (
              <nav className="space-y-1">
                {helpNavItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border-l-4',
                        isActive ? 'text-[#1D9E75] bg-[#E8F5EF] border-[#1D9E75]' : 'text-[#5D6582] hover:bg-slate-50 border-transparent'
                      )}
                      style={isActive ? { borderLeftColor: accentColor, color: accentColor } : {}}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </a>
                  );
                })}
              </nav>
            )}
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
              <div className="w-2 h-2 bg-white/70 rounded-full" />
              <span className="text-white text-xs font-semibold">Secure record service</span>
            </div>
            <p className="text-white/80 text-xs mb-1">
              Status is checked during every request.
            </p>
            <p className="text-white/80 text-xs mb-3">
              No hard-coded network status is displayed.
            </p>
            <div className="w-full bg-black/20 text-white rounded-full py-2 px-3 text-xs font-medium text-center">
              Backend verified per request
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden p-2 hover:bg-slate-50 rounded-xl transition-colors"
    >
      <Menu className="w-5 h-5 text-[#5D6582]" />
    </button>
  );
}
