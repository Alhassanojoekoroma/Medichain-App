'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, Calendar, FileText,
  QrCode, BarChart2, Bell, ShieldCheck,
  Settings, LogOut, ChevronUp, ChevronDown,
  Lock, Menu, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LOGGED_IN_DOCTOR, MOCK_BLOCKCHAIN_STATUS, MOCK_NOTIFICATIONS } from '@/data/mockData';
import { logoutDoctor } from '@/services/auth';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const mainNavItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/patients', icon: Users, label: 'Patients' },
  { href: '/appointments', icon: Calendar, label: 'Appointments' },
  { href: '/records', icon: FileText, label: 'Records' },
  { href: '/scan', icon: QrCode, label: 'Scan QR Code' },
  { href: '/analytics', icon: BarChart2, label: 'Analytics' },
  { href: '/notifications', icon: Bell, label: 'Notifications' },
  { href: '/access-log', icon: ShieldCheck, label: 'Access Log' },
];

const helpNavItems = [
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const [mainMenuExpanded, setMainMenuExpanded] = useState(true);
  const [helpMenuExpanded, setHelpMenuExpanded] = useState(true);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const unreadCount = MOCK_NOTIFICATIONS.filter(n => !n.read).length;
  const lastSyncDate = MOCK_BLOCKCHAIN_STATUS.lastSync
    ? new Date(MOCK_BLOCKCHAIN_STATUS.lastSync)
    : null;
  const minutesAgo = mounted && lastSyncDate
    ? Math.floor((Date.now() - lastSyncDate.getTime()) / 60000)
    : null;

  const handleLogout = async () => {
    await logoutDoctor();
    if (typeof window !== 'undefined') sessionStorage.removeItem('mc_user');
    router.push('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-[260px] bg-white flex flex-col h-screen transition-transform duration-300 border-r border-border',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="p-5 flex items-center gap-2">
          <div className="w-10 h-10 bg-brand rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">M</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg text-[#101326]">MediChain</span>
            <span className="bg-[#8F76FF] text-white text-xs font-medium px-2 py-0.5 rounded-full">SL</span>
          </div>
          <button className="lg:hidden ml-auto" onClick={onToggle}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 pb-3">
          <div className="flex items-center gap-1.5 text-xs text-[#8C91A8]">
            <Lock className="w-3 h-3" />
            <span>Hyperledger Fabric</span>
          </div>
        </div>

        {/* Welcome section */}
        <div className="px-5 pb-4 border-b border-[#D8DCE8]">
          <div className="flex items-center gap-2 text-xs text-[#8C91A8] mb-2">
            <span>MediChain</span>
            <span>&gt;</span>
            <span className="text-[#101326] font-medium">Dashboard</span>
          </div>
          <h1 className="text-xl font-bold text-[#101326] leading-tight">Welcome Back,</h1>
          <h1 className="text-xl font-bold text-brand leading-tight">{LOGGED_IN_DOCTOR.name}</h1>
        </div>

        {/* Main Menu */}
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
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors relative',
                      isActive
                        ? 'bg-brand-light text-brand border-l-4 border-brand'
                        : 'text-[#5D6582] hover:bg-brand-light border-l-4 border-transparent'
                    )}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.label}</span>
                    {item.label === 'Notifications' && unreadCount > 0 && (
                      <span className="ml-auto bg-[#E53E3E] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </a>
                );
              })}
            </nav>
          )}

          {/* Help & Settings */}
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
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors border-l-4',
                        isActive
                          ? 'bg-brand-light text-brand border-brand'
                          : 'text-[#5D6582] hover:bg-brand-light border-transparent'
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </a>
                  );
                })}
              </nav>
            )}
          </div>
        </div>

        {/* Logout + Blockchain Widget */}
        <div className="p-4 mt-auto space-y-2">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full text-red-500 hover:bg-red-50 rounded-xl text-sm font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>

          <div className="bg-brand rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-white text-xs font-semibold">Fabric Network</span>
            </div>
            <p className="text-brand-tint text-xs mb-1">
              {MOCK_BLOCKCHAIN_STATUS.network} • {MOCK_BLOCKCHAIN_STATUS.totalRecords} records
            </p>
            <p className="text-brand-tint text-xs mb-3">
              Last sync: {minutesAgo !== null ? `${minutesAgo} min ago` : 'unknown'}
            </p>
            <div className="w-full bg-brand-dark text-white rounded-full py-2 px-3 text-xs font-medium text-center">
              ✓ Connected to Fabric CA
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
      className="lg:hidden p-2 hover:bg-brand-light rounded-xl transition-colors"
    >
      <Menu className="w-5 h-5 text-[#5D6582]" />
    </button>
  );
}
