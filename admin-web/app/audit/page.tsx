import { Activity } from 'lucide-react';
import { LayoutWrapper } from '@/components/dashboard/layout-wrapper';

export default function AuditPage() {
  return <LayoutWrapper><section className="mx-auto max-w-3xl rounded-2xl border border-violet-200 bg-violet-50 p-6 text-violet-950"><Activity className="h-7 w-7" /><h1 className="mt-4 text-2xl font-bold">Governed audit feed required</h1><p className="mt-2 text-sm">No synthetic audit events are shown. Connect the approved, privacy-minimized audit service before this screen is used for oversight.</p></section></LayoutWrapper>;
}
