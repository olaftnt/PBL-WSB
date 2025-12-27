import { prisma } from '@/lib/prisma';
import InventoryClient from './InventoryClient';
import type { PartListItem, TicketOption } from '@/types/inventory';

export default async function InventoryPage() {
  const parts = await prisma.part.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const tickets = await prisma.ticket.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, number: true, title: true },
    take: 50,
  });

  const mappedParts: PartListItem[] = parts.map((p) => {
    const status =
      p.quantity <= 0 ? 'critical' :
      p.quantity <= p.minQuantity ? 'low' : 'ok';

    return {
      id: p.id,
      sku: p.sku,
      name: p.name,
      quantity: p.quantity,
      minQuantity: p.minQuantity,
      price: Number(p.price),
      reserved: p.reserved,
      status,
      createdAt: p.createdAt.toISOString(),
    };
  });

  const ticketOptions: TicketOption[] = tickets.map((t) => ({
    id: t.id,
    number: t.number,
    title: t.title,
  }));

  return <InventoryClient parts={mappedParts} tickets={ticketOptions} />;
}
