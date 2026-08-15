import { Package } from 'lucide-react';
import { LayoutWrapper } from '@/components/dashboard/layout-wrapper';

export default function InventoryPage() {
  return <LayoutWrapper><section className="mx-auto max-w-3xl rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-950"><Package className="h-7 w-7" /><h1 className="mt-4 text-2xl font-bold">Medicine stock service not connected</h1><p className="mt-2 text-sm">No stock quantities are being invented or stored only in this browser. Connect the approved inventory service before using stock decisions operationally.</p></section></LayoutWrapper>;
}
