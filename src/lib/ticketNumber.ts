import { prisma } from '@/lib/prisma';

export async function generateTicketNumber() {
  const res = await prisma.$queryRaw<{ nextval: bigint }[]>
    `select nextval('ticket_number_seq')`;

  return `INC${String(res[0].nextval).padStart(5, '0')}`;
}