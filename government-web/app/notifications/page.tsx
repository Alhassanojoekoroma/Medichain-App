'use client';

import { useState, useEffect } from 'react';
import { LayoutWrapper } from '@/components/dashboard/layout-wrapper';
import { MOCK_NOTIFICATIONS } from '@/data/mockData';
import { useAuth } from '@/hooks/useAuth';
import { 
  Bell, CheckCircle2, AlertTriangle, Info, ShieldAlert,
  Trash2, MailOpen, Circle, Search, ArrowRight 
} from 'lucide-react';
import type { Notification, NotificationType } from '@/types';
import Link from 'next/link';

export default function NotificationsPage() {
  useAuth(); // Require authentication

  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [filterType, setFilterType] = useState<string>('all');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-emerald-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'danger':
        return <ShieldAlert className="h-5 w-5 text-rose-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getTypeBg = (type: NotificationType, read: boolean) => {
    if (read) return 'bg-white hover:bg-slate-50/50';
    switch (type) {
      case 'success':
        return 'bg-emerald-50/40 hover:bg-emerald-50/65 border-l-4 border-l-emerald-500';
      case 'warning':
        return 'bg-amber-50/40 hover:bg-amber-50/65 border-l-4 border-l-amber-500';
      case 'danger':
        return 'bg-rose-50/40 hover:bg-rose-50/65 border-l-4 border-l-rose-500';
      case 'info':
        return 'bg-blue-50/40 hover:bg-blue-50/65 border-l-4 border-l-blue-500';
    }
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const handleClearNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const formatRelativeTime = (isoString: string) => {
    if (!mounted) return '...';
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const filteredNotifs = notifications.filter(notif => {
    if (filterType === 'all') return true;
    if (filterType === 'unread') return !notif.read;
    return notif.type === filterType;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <LayoutWrapper title="System Alerts &amp; Notifications">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Summary */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-display">Alert Center</h1>
            <p className="text-sm text-slate-500">
              System alerts, emergency case updates, drug interaction detection reports, and blockchain transaction summaries
            </p>
          </div>
          {notifications.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={handleMarkAllRead}
                disabled={unreadCount === 0}
                className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition disabled:opacity-50"
              >
                <MailOpen className="h-3.5 w-3.5" />
                Mark all read
              </button>
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1.5 px-3 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold rounded-lg transition"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Tab Filters */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-4 overflow-x-auto">
          <div className="flex gap-1.5">
            {[
              { id: 'all', label: 'All Alerts' },
              { id: 'unread', label: `Unread (${unreadCount})` },
              { id: 'danger', label: 'Critical' },
              { id: 'warning', label: 'Drug Alerts' },
              { id: 'success', label: 'Sync Log' },
              { id: 'info', label: 'Appointments' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
                  filterType === tab.id
                    ? 'bg-brand-light text-brand'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications Listing */}
        {filteredNotifs.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-16 text-center shadow-sm">
            <Bell className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">Clear notification log</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              There are no alerts matching this filter category right now. All clear!
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
            {filteredNotifs.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleMarkAsRead(notif.id)}
                className={`p-5 flex gap-4 transition-colors relative cursor-pointer ${getTypeBg(notif.type, notif.read)}`}
              >
                {/* Icon box */}
                <div className="shrink-0 mt-0.5">
                  {getIcon(notif.type)}
                </div>

                {/* Body Content */}
                <div className="flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className={`text-sm ${notif.read ? 'text-slate-800 font-semibold' : 'text-slate-950 font-bold'}`}>
                      {notif.title}
                    </h3>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap font-medium font-sans">
                      {formatRelativeTime(notif.timestamp)}
                    </span>
                  </div>
                  
                  <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
                    {notif.message}
                  </p>

                  <div className="flex items-center gap-3 pt-1">
                    {notif.link && (
                      <Link
                        href={notif.link}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-brand hover:text-brand-dark transition"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Launch Target Dashboard
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    )}
                    {!notif.read && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600">
                        <Circle className="h-1.5 w-1.5 fill-amber-500 stroke-none" />
                        Unread Alert
                      </span>
                    )}
                  </div>
                </div>

                {/* Dismiss button */}
                <button
                  onClick={(e) => handleClearNotification(notif.id, e)}
                  className="shrink-0 p-1 text-slate-300 hover:text-slate-500 transition hover:bg-slate-100 rounded-full h-fit mt-1 self-start"
                  title="Dismiss notification"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </LayoutWrapper>
  );
}
