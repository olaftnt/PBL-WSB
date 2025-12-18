'use client';

import { useRouter } from 'next/navigation';
import { viewToPath } from '@/lib/viewRouter';
import { SLADashboard } from '@/components/SLA/SLADashboard';

export default function Page() {
  const router = useRouter();

  const onNavigate = (view: any, id?: string) => {
    router.push(viewToPath(view, id));
  };

  return <SLADashboard onNavigate={onNavigate} />;
}
