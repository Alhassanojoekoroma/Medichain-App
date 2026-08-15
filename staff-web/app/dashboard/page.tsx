'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, CheckCircle2, ChevronRight, ClipboardList, Package } from 'lucide-react';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { Sidebar, MobileMenuButton } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { EMPTY_DRUG_INVENTORY, EMPTY_PRESCRIPTIONS } from '@/data/runtimeData';

export default function StaffDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pending = EMPTY_PRESCRIPTIONS.filter((item) => item.status === 'Pending');
  const dispensed = EMPTY_PRESCRIPTIONS.filter((item) => item.status === 'Dispensed');
  const stockAlerts = EMPTY_DRUG_INVENTORY.filter((item) => item.status !== 'In Stock');

  return (
    <ProtectedRoute allowedRoles={['staff']}>
      <div className="min-h-screen bg-[var(--primary-50)] staff-portal">
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(false)} />
        <div className="min-w-0 flex-1 lg:pl-[260px]">
          <div className="mx-auto max-w-[1500px] px-3 sm:px-5">
            <div className="flex items-center gap-2"><MobileMenuButton onClick={() => setSidebarOpen(true)} /><div className="flex-1"><Header /></div></div>
            <main className="space-y-6 pb-8">
              <section className="rounded-3xl bg-[var(--brand)] p-6 text-white sm:p-8">
                <p className="text-sm text-white/75">Hospital pharmacy</p>
                <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Dispense safely, then update stock</h1>
                <p className="mt-2 max-w-2xl text-sm text-white/75">The pharmacy workflow is limited to the tasks staff need today.</p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button type="button" onClick={() => router.push('/prescriptions')} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-bold text-[var(--brand)]"><ClipboardList className="h-5 w-5" /> Open prescriptions</button>
                  <button type="button" onClick={() => router.push('/inventory')} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[var(--brand-dark)] px-5 text-sm font-bold text-white"><Package className="h-5 w-5" /> Check medicine stock</button>
                </div>
              </section>

              <div role="status" className="rounded-2xl border border-[var(--amber-100)] bg-[var(--amber-100)] p-4 text-sm text-[var(--amber-700)]"><strong>Live pharmacy data is not connected.</strong> No demonstration prescriptions or stock figures are shown. Connect the approved pharmacy service before dispensing.</div>

              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {[
                  { label: 'Waiting', value: '—', icon: ClipboardList, colour: 'text-amber-700' },
                  { label: 'Dispensed', value: '—', icon: CheckCircle2, colour: 'text-emerald-700' },
                  { label: 'Stock alerts', value: '—', icon: AlertTriangle, colour: 'text-rose-700' },
                  { label: 'Medicines tracked', value: '—', icon: Package, colour: 'text-blue-700' },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <item.icon className={`h-5 w-5 ${item.colour}`} />
                    <p className="mt-4 text-2xl font-bold text-slate-950">{item.value}</p>
                    <p className="mt-1 text-xs font-medium text-slate-500">{item.label}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
                <section className="overflow-hidden rounded-2xl border border-[var(--gray-200)] bg-white" aria-labelledby="prescription-queue-title">
                  <div className="flex items-center justify-between border-b border-[var(--gray-100)] p-5">
                    <div><h2 id="prescription-queue-title" className="font-bold text-[var(--ink-900)]">Prescriptions waiting</h2><p className="text-xs text-[var(--gray-500)]">Open and dispense in two steps</p></div>
                    <button type="button" onClick={() => router.push('/prescriptions')} className="text-sm font-bold text-[var(--amber-600)]">View all</button>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {pending.map((item) => (
                      <button type="button" key={item.id} onClick={() => router.push('/prescriptions')} className="flex min-h-20 w-full items-center gap-3 p-4 text-left hover:bg-slate-50">
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700"><ClipboardList className="h-5 w-5" /></span>
                        <span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold text-slate-900">{item.drug}</span><span className="mt-1 block truncate text-xs text-slate-500">{item.dosage} · Qty {item.qty} · {item.id}</span></span>
                        <ChevronRight className="h-5 w-5 text-slate-300" />
                      </button>
                    ))}
                    {pending.length === 0 && <p className="p-5 text-sm text-slate-500">Prescription data source unavailable.</p>}
                  </div>
                </section>

                <section className="rounded-2xl border border-[var(--gray-200)] bg-white p-5" aria-labelledby="stock-alerts-title">
                  <h2 id="stock-alerts-title" className="font-bold text-[var(--ink-900)]">Stock needing attention</h2>
                  <p className="text-xs text-[var(--gray-500)]">Low and unavailable medicines</p>
                  <div className="mt-4 space-y-3">
                    {stockAlerts.map((item) => (
                      <button type="button" key={item.name} onClick={() => router.push('/inventory')} className="flex min-h-14 w-full items-center justify-between rounded-xl bg-slate-50 px-3 text-left">
                        <span><span className="block text-sm font-bold text-slate-900">{item.name}</span><span className="text-xs text-slate-500">{item.inStock} remaining</span></span>
                        <span className="rounded-full bg-rose-50 px-2 py-1 text-[10px] font-bold text-rose-700">{item.status}</span>
                      </button>
                    ))}
                    {stockAlerts.length === 0 && <p className="text-sm text-slate-500">Stock data source unavailable.</p>}
                  </div>
                </section>
              </div>
            </main>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
