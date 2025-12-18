'use client';

import { useRouter } from 'next/navigation';
import { viewToPath } from '@/lib/viewRouter';
import { DeviceList } from '@/components/Devices/DeviceList';

export default function Page() {
  const router = useRouter();

  const onNavigate = (view: any, id?: string) => {
    router.push(viewToPath(view, id));
  };

  return <DeviceList onNavigate={onNavigate} />;
}
