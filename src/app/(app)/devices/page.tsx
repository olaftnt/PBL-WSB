import { prisma } from '@/lib/prisma';
import DevicesClient from './DevicesClient';
import type { DeviceListItem } from '@/types/device';

export default async function Page() {
  const devices = await prisma.device.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      customer: true,
      _count: { select: { tickets: true } },
    },
  });

  const customers = await prisma.customer.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, phone: true },
  });

  const mappedDevices: DeviceListItem[] = devices.map((d) => ({
    id: d.id,
    name: d.name,
    model: d.model,
    serial: d.serial,
    customerId: d.customerId,
    customerName: d.customer?.name ?? '—',
    tickets: d._count.tickets,
    createdAt: d.createdAt.toISOString(),
  }));

  return <DevicesClient devices={mappedDevices} customers={customers} />;
}
