'use client';
import { useState } from 'react';
import StaffSidebar from '@/components/staff/StaffSidebar';
import { MobileMenuButton } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#EAEEF2] staff-portal">
      <div className="flex">
        <StaffSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(false)} />
        <div className="flex-1 min-w-0 lg:pl-[260px]">
          <div className="px-3 sm:px-4 lg:px-6 max-w-[1600px] mx-auto">
            <div className="flex items-center gap-2 sm:gap-4">
              <MobileMenuButton onClick={() => setSidebarOpen(true)} />
              <div className="flex-1">
                <Header />
              </div>
            </div>
            <main className="pb-6 sm:pb-8">
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
