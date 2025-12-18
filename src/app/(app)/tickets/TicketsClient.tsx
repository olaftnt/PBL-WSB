'use client';

import { useRouter } from 'next/navigation';
import { viewToPath } from '@/lib/viewRouter';
import { TicketList } from '@/components/TicketManagement/TicketList';

export default function TicketsClient({ initialTickets }: { initialTickets: any[] }) {
  const router = useRouter();

  const onNavigate = (view: any, id?: string) => {
    router.push(viewToPath(view, id));
  };

  // Minimalna zmiana: TicketList musi przyjąć tickets jako props
  return <TicketList onNavigate={onNavigate} tickets={initialTickets} />;
}
