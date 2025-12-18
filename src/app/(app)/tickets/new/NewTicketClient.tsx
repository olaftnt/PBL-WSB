'use client';

import { useRouter } from 'next/navigation';
import { createTicket } from '../../_actions/tickets';
import { NewTicket } from '@/components/TicketManagement/NewTicket';

export default function NewTicketClient({ customers, devices }: { customers: any[]; devices: any[] }) {
  const router = useRouter();

  return (
    <NewTicket
      customers={customers}
      devices={devices}
      onCancel={() => router.push('/tickets')}
      onCreated={() => router.push('/tickets')}
      onCreate={async (payload) => {
        const ticket = await createTicket(payload);
        router.push(`/tickets/${ticket.id}`); // albo router.push('/tickets')
      }}
    />
  );
}