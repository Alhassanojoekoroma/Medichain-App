'use client';
import { useState } from 'react';
import { Sidebar, MobileMenuButton } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';

interface LayoutWrapperProps {
  children: React.ReactNode;
  title?: string;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#EAEEF2]">
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(false)} />
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
