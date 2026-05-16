import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { DeviceDetail } from '@/components/Devices/DeviceDetail';

export default async function DeviceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const device = await prisma.device.findUnique({
    where: { id },
    include: {
      customer: true,
      tickets: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          number: true,
          status: true,
          createdAt: true,
        },
      },
      _count: { select: { tickets: true } },
    },
  });

  if (!device) return notFound();

  const tickets = device.tickets.map((t) => ({
    id: t.id,
    number: t.number,
    status: t.status,
    createdAt: t.createdAt.toISOString(),
  }));

  return (
    <DeviceDetail
      device={{
        id: device.id,
        name: device.name,
        model: device.model,
        serial: device.serial,
        notes: device.notes,
        isDeleted: device.isDeleted,
        customer: {
          id: device.customer.id,
          name: device.customer.name,
          email: device.customer.email,
        },
        ticketsCount: device._count.tickets,
      }}
      tickets={tickets}
    />
  );
}
