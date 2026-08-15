import { Users } from 'lucide-react';
import { LayoutWrapper } from '@/components/dashboard/layout-wrapper';

export default function UsersPage() {
  return <LayoutWrapper><section className="mx-auto max-w-3xl rounded-2xl border border-violet-200 bg-violet-50 p-6 text-violet-950"><Users className="h-7 w-7" /><h1 className="mt-4 text-2xl font-bold">Managed identity directory required</h1><p className="mt-2 text-sm">User accounts are not created or edited in local browser state. Connect the approved identity provider and governed role-administration API before enabling this screen.</p></section></LayoutWrapper>;
}
