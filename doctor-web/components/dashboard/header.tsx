'use client';

import { Search, Bell, Sparkles, ChevronDown } from 'lucide-react';
import { LOGGED_IN_DOCTOR, MOCK_NOTIFICATIONS } from '@/data/mockData';
import { useRouter } from 'next/navigation';

export function Header() {
  const router = useRouter();
  const unreadCount = MOCK_NOTIFICATIONS.filter(n => !n.read).length;

  return (
    <header className="flex items-center justify-between gap-2 sm:gap-4 py-3 sm:py-4">
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C91A8]" />
          <input
            type="text"
            placeholder="Search patients, records..."
            className="w-full bg-white border border-[#D8DCE8] rounded-xl pl-10 pr-14 py-2 sm:py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 text-xs text-[#8C91A8] bg-[#EAEEF2] px-1.5 py-0.5 rounded">
            <span>⌘</span>
            <span>S</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button className="hidden sm:flex items-center gap-2 bg-brand text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-brand-dark transition-colors">
          <Sparkles className="w-4 h-4" />
          <span>AI Assist</span>
        </button>

        <button
          className="relative p-2 sm:p-2.5 hover:bg-brand-light rounded-xl transition-colors"
          onClick={() => router.push('/notifications')}
        >
          <Bell className="w-5 h-5 text-[#5D6582]" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#E53E3E] rounded-full" />
          )}
        </button>

        <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-[#D8DCE8]">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-brand flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">{LOGGED_IN_DOCTOR.initials}</span>
          </div>
          <div className="hidden md:block">
            <div className="text-sm font-semibold text-[#101326]">{LOGGED_IN_DOCTOR.name}</div>
            <div className="text-xs text-[#8C91A8]">{LOGGED_IN_DOCTOR.email}</div>
          </div>
          <ChevronDown className="w-4 h-4 text-[#8C91A8] hidden md:block" />
        </div>
      </div>
    </header>
  );
}
