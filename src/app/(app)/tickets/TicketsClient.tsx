'use client';

import { useRouter } from 'next/navigation';
import { TicketList } from '@/components/TicketManagement/TicketList'; 

export default function TicketsClient({ initialTickets }: { initialTickets: any[] }) {
  const router = useRouter();

  const onNavigate = (view: any, id?: string) => {
    if (view === 'ticket-detail') router.push(`/tickets/${id}`);
    else if (view === 'new-ticket') router.push('/tickets/new');
    else router.push('/tickets');
  };

  return <TicketList onNavigate={onNavigate} tickets={initialTickets} />;
}