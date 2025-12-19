import { prisma } from '@/lib/prisma';
import TicketDetailClient from './TicketDetailClient';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      customer: true,
      device: true,
      events: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!ticket) {
    return (
      <div className="p-6 text-white">
        Nie znaleziono zgłoszenia.
      </div>
    );
  }

  return <TicketDetailClient ticket={ticket} />;
}
