'use client';

import { useRouter } from 'next/navigation';
import type { TicketStatus } from '@prisma/client';
import { updateTicketStatus } from '@/app/(app)/_actions/tickets';
import { TicketDetail } from '@/components/TicketManagement/TicketDetail';

export default function TicketDetailClient({ ticket }: { ticket: any }) {
  const router = useRouter();

  return (
    <TicketDetail
      ticket={ticket}
      onBack={() => router.push('/tickets')}
      onUpdateStatus={async (status: TicketStatus) => {
        await updateTicketStatus({ id: ticket.id, status });
        router.refresh(); // odświeża dane server componentu
      }}
    />
  );
}
