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
      onCreated={() => router.push('/tickets')}
      onCancel={() => router.push('/tickets')}
      onCreate={async (payload) => {
        await createTicket(payload);
      }}
    />
  );
}
