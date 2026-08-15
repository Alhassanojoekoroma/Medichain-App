'use client';
import { Settings } from 'lucide-react';
import LayoutWrapper from '@/components/dashboard/layout-wrapper';
import { useAuth } from '@/hooks/useAuth';
export default function SettingsPage() { const { user } = useAuth(); return <LayoutWrapper><section className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6"><Settings className="h-7 w-7 text-slate-700" /><h1 className="mt-4 text-2xl font-bold text-slate-950">Account</h1><p className="mt-3 font-semibold text-slate-800">{user?.name || 'Signed-in nurse'}</p><p className="text-sm text-slate-500">{user?.email || 'Email unavailable'}</p><p className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">Profile changes require the approved identity administration service. No local save is simulated.</p></section></LayoutWrapper>; }

