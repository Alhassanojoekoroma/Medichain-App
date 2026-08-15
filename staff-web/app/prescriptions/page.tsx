import { ClipboardList } from 'lucide-react';
import { LayoutWrapper } from '@/components/dashboard/layout-wrapper';

export default function PrescriptionsPage() {
  return <LayoutWrapper><section className="mx-auto max-w-3xl rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-950"><ClipboardList className="h-7 w-7" /><h1 className="mt-4 text-2xl font-bold">Prescription service not connected</h1><p className="mt-2 text-sm">No prescriptions are displayed or changed locally. Connect the approved pharmacy API, with role checks and an auditable dispense operation, before using this workflow.</p></section></LayoutWrapper>;
}
