'use client';

import { useRouter } from 'next/navigation';
import type { TicketStatus, TicketPriority, SLATYPE } from '@prisma/client';
import {
  updateTicketStatus,
  addTicketNote,
  updateTicket,
  deleteTicket,
  completeTicketWithProtocol,
} from '@/app/(app)/_actions/tickets';
import { TicketDetail } from '@/components/TicketManagement/TicketDetail';

export default function TicketDetailClient({
  ticket,
  deadline,
}: {
  ticket: any;
  deadline: string;
}) {
  const router = useRouter();

  return (
    <TicketDetail
      ticket={ticket}
      deadline={deadline}
      onBack={() => router.push('/tickets')}
      onUpdateStatus={async (status: TicketStatus) => {
        await updateTicketStatus({
          id: ticket.id,
          status,
          author: 'user',
        });

        router.refresh();
      }}
      onAddNote={async (message: string) => {
        await addTicketNote({
          ticketId: ticket.id,
          message,
          author: 'user',
        });

        router.refresh();
      }}
      onEdit={async (payload: {
        title: string;
        description: string | null;
        priority: TicketPriority;
        slaType: SLATYPE;
        physicalCondition: string | null;
        accessories: string[];
      }) => {
        await updateTicket({
          id: ticket.id,
          title: payload.title,
          description: payload.description,
          priority: payload.priority,
          slaType: payload.slaType,
          physicalCondition: payload.physicalCondition,
          accessories: payload.accessories,
        });

        router.refresh();
      }}
      onDelete={async () => {
        await deleteTicket({
          id: ticket.id,
        });

        router.push('/tickets');
      }}
      onCompleteWithProtocol={async (payload: {
        ticketId: string;
        performedWork: string;
        repairCost: string;
        servicePerson: string | null;
      }) => {
        await completeTicketWithProtocol(payload);

        router.refresh();
      }}
    />
  );
}