import { prisma } from '@/lib/prisma';

export async function generateTicketNumber() {
  const last = await prisma.ticket.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { number: true },
  });

  if (!last?.number) {
    return 'INC000001';
  }

  const match = last.number.match(/^INC(\d+)$/);
  const next = match ? Number(match[1]) + 1 : 1;

  return `INC${String(next).padStart(6, '0')}`;
}
