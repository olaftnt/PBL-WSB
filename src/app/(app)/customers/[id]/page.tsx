'use client';

import { useRouter } from 'next/navigation';
import { viewToPath } from '@/lib/viewRouter';
import { CustomerDetail } from '@/components/Customers/CustomerDetail';

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const onNavigate = (view: any, id?: string) => router.push(viewToPath(view, id));

  return <CustomerDetail customerId={params.id} onNavigate={onNavigate} />;
}
