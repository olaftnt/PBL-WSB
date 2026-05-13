import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import TicketDetailClient from './TicketDetailClient';

function calculateDeadline(createdAt: Date, slaType: string) {
  const deadline = new Date(createdAt);

  switch (slaType) {
    case 'VIP':
      deadline.setHours(deadline.getHours() + 24);
      break;
    case 'EXPRESS':
      deadline.setHours(deadline.getHours() + 48);
      break;
    case 'WARRANTY':
      deadline.setDate(deadline.getDate() + 14);
      break;
    case 'STANDARD':
    default:
      deadline.setDate(deadline.getDate() + 7);
      break;
  }

  return deadline;
}

export default async function TicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const ticket = await prisma.ticket.findUnique({
    where: {
      id,
    },
    include: {
      customer: true,
      device: true,
      events: {
        orderBy: {
          createdAt: 'desc',
        },
      },
      repairProtocol: true,
      quotes: {
        orderBy: {
          updatedAt: 'desc',
        },
        include: {
          items: {
            select: {
              id: true,
              description: true,
              quantity: true,
              unitPrice: true,
              total: true,
            },
          },
        },
      },
    },
  });

  if (!ticket) {
    notFound();
  }

  const deadline = calculateDeadline(ticket.createdAt, ticket.slaType);

  const serializedTicket = {
    ...ticket,

    createdAt: ticket.createdAt.toISOString(),
    updatedAt: ticket.updatedAt.toISOString(),

    events: ticket.events.map((event) => ({
      ...event,
      createdAt: event.createdAt.toISOString(),
    })),

    repairProtocol: ticket.repairProtocol
      ? {
          ...ticket.repairProtocol,
          repairCost: ticket.repairProtocol.repairCost.toString(),
          createdAt: ticket.repairProtocol.createdAt.toISOString(),
          updatedAt: ticket.repairProtocol.updatedAt.toISOString(),
        }
      : null,

    quotes: ticket.quotes.map((quote) => ({
      ...quote,

      laborHours: quote.laborHours.toString(),
      laborRate: quote.laborRate.toString(),
      vatRate: quote.vatRate.toString(),
      totalNet: quote.totalNet.toString(),
      totalVat: quote.totalVat.toString(),
      totalGross: quote.totalGross.toString(),

      createdAt: quote.createdAt.toISOString(),
      updatedAt: quote.updatedAt.toISOString(),

      items: quote.items.map((item) => ({
        ...item,
        unitPrice: item.unitPrice.toString(),
        total: item.total.toString(),
      })),
    })),
  };

  return (
    <TicketDetailClient
      ticket={serializedTicket}
      deadline={deadline.toISOString()}
    />
  );
}