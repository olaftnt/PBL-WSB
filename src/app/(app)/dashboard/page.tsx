'use client';

import { useRouter } from 'next/navigation';
import { viewToPath } from '@/lib/viewRouter';
import { Dashboard } from '@/components/Dashboard';

export default function Page() {
  const router = useRouter();

  const onNavigate = (view: any, id?: string) => {
    router.push(viewToPath(view, id));
  };

  return <Dashboard onNavigate={onNavigate} />;
}
