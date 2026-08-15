import { FileSpreadsheet } from 'lucide-react';
import { LayoutWrapper } from '@/components/dashboard/layout-wrapper';

export default function ReportsPage() {
  return <LayoutWrapper><section className="mx-auto max-w-3xl rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-950"><FileSpreadsheet className="h-7 w-7" /><h1 className="mt-4 text-2xl font-bold">Approved reporting feed required</h1><p className="mt-2 text-sm">Reports cannot be generated until the governed, de-identified aggregate feed is connected. No demonstration figures are available for export.</p></section></LayoutWrapper>;
}
