'use client';

import { useState } from 'react';
import { Sidebar, MobileMenuButton } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { AnalyticView } from '@/components/dashboard/analytic-view';
import { OverviewCards } from '@/components/dashboard/overview-cards';
import { BottomSection } from '@/components/dashboard/bottom-section';
import { Calendar } from '@/components/dashboard/calendar';
import { Schedule } from '@/components/dashboard/schedule';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
  useAuth(); // Require authentication
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  return (
    <div className="min-h-screen bg-[#EAEEF2]">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(false)} />

        {/* Main Content */}
        <div className="flex-1 min-w-0 lg:pl-[260px]">
          <div className="px-3 sm:px-4 lg:px-6 max-w-[1600px] mx-auto">
            {/* Header with mobile menu button */}
            <div className="flex items-center gap-2 sm:gap-4">
              <MobileMenuButton onClick={() => setSidebarOpen(true)} />
              <div className="flex-1">
                <Header />
              </div>
            </div>

            {/* Main Grid */}
            <div className="flex flex-col xl:flex-row gap-4 sm:gap-6 pb-6 sm:pb-8">
              {/* Left Column - Main Content */}
              <div className="flex-1 min-w-0 space-y-4 sm:space-y-6">
                <StatsCards />
                <AnalyticView />
                <OverviewCards />
                <BottomSection />
              </div>

              {/* Right Column - Calendar & Schedule */}
              <div className="xl:w-[340px] space-y-4 sm:space-y-6 flex-shrink-0">
                <Calendar onDateSelect={setSelectedDate} />
                <Schedule selectedDate={selectedDate} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
