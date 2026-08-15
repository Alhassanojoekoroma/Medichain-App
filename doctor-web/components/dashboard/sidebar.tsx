'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, FileText,
  Settings, LogOut, ChevronUp, ChevronDown,
  Lock, Menu, X,
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
  const displayName = user?.name || 'Signed-in clinician';

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
              <span className="font-semibold text-lg text-[var(--ink-900)]">MediChain</span>
              <span className="bg-[var(--primary-100)] text-[var(--primary-700)] text-xs font-medium px-2 py-0.5 rounded-full">SL</span>
            </div>
            <button className="lg:hidden ml-auto" onClick={onToggle}>
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-5 pb-3">
            <div className="flex items-center gap-1.5 text-xs text-[var(--gray-500)]">
              <Lock className="w-3 h-3" />
              <span>Hyperledger Fabric</span>
            </div>
          </div>

          {/* Welcome section */}
          <div className="px-5 pb-4 border-b border-[var(--gray-200)]">
            <div className="flex items-center gap-2 text-xs text-[var(--gray-500)] mb-2">
              <span>MediChain</span>
              <span>&gt;</span>
              <span className="text-[var(--ink-900)] font-medium">Dashboard</span>
            </div>
            <h1 className="text-xl font-bold text-[var(--ink-900)] leading-tight">Welcome Back,</h1>
          <button
            onClick={() => setMainMenuExpanded(!mainMenuExpanded)}
            className="flex items-center justify-between w-full py-2 px-2 text-xs font-medium text-[var(--gray-500)] uppercase tracking-wider"
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
                        : 'text-[var(--gray-500)] hover:bg-brand-light border-l-4 border-transparent'
                    )}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.label}</span>
                  </a>
                );
              })}
            </nav>
          )}

          {/* Help & Settings */}
          <div className="mt-6">
            <button
              onClick={() => setHelpMenuExpanded(!helpMenuExpanded)}
              className="flex items-center justify-between w-full py-2 px-2 text-xs font-medium text-[var(--gray-500)] uppercase tracking-wider"
            >
              <span>Help menu</span>
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
                          : 'text-[var(--gray-600)] hover:bg-brand-light border-transparent'
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
              <div className="w-2 h-2 bg-white/70 rounded-full" />
              <span className="text-white text-xs font-semibold">Secure record service</span>
            </div>
            <p className="text-brand-tint text-xs mb-1">
              Status is checked during every record action.
            </p>
            <p className="text-brand-tint text-xs mb-3">
              No hard-coded network status is displayed.
            </p>
            <div className="w-full bg-brand-dark text-white rounded-full py-2 px-3 text-xs font-medium text-center">
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
      className="lg:hidden p-2 hover:bg-brand-light rounded-xl transition-colors"
    >
      <Menu className="w-5 h-5 text-[var(--gray-500)]" />
    </button>
  );
}
