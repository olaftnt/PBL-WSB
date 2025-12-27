import { prisma } from '@/lib/prisma';
import CustomersClient from './CustomersClient';
import { TicketStatus } from '@prisma/client';
import type { CustomerListItem } from '@/types/customer';

export default async function Page() {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { tickets: true } },
      tickets: {
        where: { status: { in: [TicketStatus.NEW, TicketStatus.IN_PROGRESS, TicketStatus.WAITING] } },
        select: { id: true },
      },
    },
  });

  const listItems: CustomerListItem[] = customers.map((customer) => ({
    id: customer.id,
    name: customer.name,
    email: customer.email ?? null,
    phone: customer.phone ?? null,
    joined: customer.createdAt.toISOString(),
    tickets: customer._count.tickets,
    activeTickets: customer.tickets.length,
  }));

  return <CustomersClient initialCustomers={listItems} />;
}
