'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const user = typeof window !== 'undefined' ? sessionStorage.getItem('mc_user') : null;
    if (user) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[var(--primary-50)] flex items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 text-[var(--ink-700)] animate-spin" />
        <span className="text-sm text-[var(--gray-500)] font-medium">Redirecting...</span>
      </div>
    </div>
  );
}
