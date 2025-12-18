import { prisma } from '@/lib/prisma';
import NewTicketClient from 'src/app/(app)/tickets/new/NewTicketClient';

export default async function Page() {
  const customers = await prisma.customer.findMany({ orderBy: { name: 'asc' } });
  const devices = await prisma.device.findMany({ orderBy: { name: 'asc' } });

  return <NewTicketClient customers={customers} devices={devices} />;
}
