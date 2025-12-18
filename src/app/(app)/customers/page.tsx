'use client';

import { useRouter } from 'next/navigation';
import { viewToPath } from '@/lib/viewRouter';
import { CustomerList } from '@/components/Customers/CustomerList';

export default function Page() {
  const router = useRouter();

  const onNavigate = (view: any, id?: string) => {
    router.push(viewToPath(view, id));
  };

  return <CustomerList onNavigate={onNavigate} />;
}
