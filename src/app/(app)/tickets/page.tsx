import { prisma } from '@/lib/prisma';
import TicketsClient from '@/app/(app)/tickets/TicketsClient';

export default async function Page() {
  const tickets = await prisma.ticket.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      number: true,        // ✅ INCxxxx
      title: true,
      status: true,
      priority: true,
      createdAt: true,
      customer: { select: { name: true } },
      device: { select: { name: true } },
    },
  });

  return <TicketsClient initialTickets={tickets} />;
}
