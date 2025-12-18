'use client';

import { useRouter } from 'next/navigation';
import { viewToPath } from '@/lib/viewRouter';
import { TicketDetail } from '@/components/TicketManagement/TicketDetail';

export default function TicketDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const onNavigate = (view: any, id?: string) => router.push(viewToPath(view, id));

  return <TicketDetail ticketId={params.id} onNavigate={onNavigate} />;
}
