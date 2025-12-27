import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { TicketStatus } from '@prisma/client';
import { CustomerDetail } from '@/components/Customers/CustomerDetail';

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      devices: true,
      tickets: {
        include: { device: true },
        orderBy: { createdAt: 'desc' },
      },
      _count: { select: { tickets: true, devices: true } },
    },
  });

  if (!customer) return notFound();

  const activeStatuses = [TicketStatus.NEW, TicketStatus.IN_PROGRESS, TicketStatus.WAITING];

  const devices = customer.devices.map((d) => ({
    id: d.id,
    name: d.name,
    model: d.model,
    serial: d.serial,
    type: 'device',
  }));

  const tickets = customer.tickets.map((t) => ({
    id: t.id,
    number: t.number,
    status: t.status,
    priority: t.priority,
    createdAt: t.createdAt.toISOString(),
    device: t.device?.name ?? t.device?.model ?? null,
  }));

  return (
    <CustomerDetail
      customer={{
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        joined: customer.createdAt.toISOString(),
        totalTickets: customer._count.tickets,
        activeTickets: customer.tickets.filter((t) => activeStatuses.includes(t.status)).length,
        devicesCount: customer._count.devices,
      }}
      tickets={tickets}
      devices={devices}
    />
  );
}
