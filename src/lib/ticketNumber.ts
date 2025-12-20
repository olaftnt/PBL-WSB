import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

type DbClient = Prisma.TransactionClient;

export async function generateTicketNumber(db: DbClient = prisma) {
  const rows = await db.$queryRaw<Array<{ nextval: bigint }>>`
    SELECT nextval('ticket_number_seq') as nextval;
  `;

  const n = Number(rows[0]?.nextval ?? 0);
  return `INC${String(n).padStart(6, '0')}`;
}
