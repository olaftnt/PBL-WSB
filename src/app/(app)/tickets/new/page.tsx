import { prisma } from '@/lib/prisma';
import NewTicketClient from 'src/app/(app)/tickets/new/NewTicketClient';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ customerId?: string; deviceId?: string }>;
}) {
  const { customerId, deviceId } = await searchParams;
  const customers = await prisma.customer.findMany({ orderBy: { name: 'asc' } });
  const devices = await prisma.device.findMany({
    where: deviceId
      ? {
          OR: [
            { isDeleted: false },
            { id: deviceId },
          ],
        }
      : { isDeleted: false },
    orderBy: { name: 'asc' },
  });

  return (
    <NewTicketClient
      customers={customers}
      devices={devices}
      initialCustomerId={customerId}
      initialDeviceId={deviceId}
    />
  );
}
