import { prisma } from '@/lib/prisma';
import TicketsClient from '@/app/(app)/tickets/TicketsClient';

export default async function Page() {
  const tickets = await prisma.ticket.findMany({
    orderBy: { createdAt: 'desc' },
    include: { customer: true, device: true },
  });

  return <TicketsClient initialTickets={tickets} />;
}
