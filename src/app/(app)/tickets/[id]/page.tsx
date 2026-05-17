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
      checklist: {
        orderBy: {
          createdAt: 'asc',
        },
      },
      events: {
        orderBy: {
          createdAt: 'desc',
        },
      },
      repairProtocol: true,
      partReservations: {
        include: {
          part: {
            select: {
              id: true,
              sku: true,
              name: true,
              quantity: true,
              reserved: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
      quotes: {
        orderBy: {
          updatedAt: 'desc',
        },
        include: {
          items: {
            select: {
              id: true,
              partId: true,
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

  const previousRepairs = ticket.deviceId
    ? await prisma.ticket.findMany({
        where: {
          deviceId: ticket.deviceId,
          id: {
            not: ticket.id,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          number: true,
          title: true,
          status: true,
          createdAt: true,
          repairProtocol: {
            select: {
              repairCost: true,
            },
          },
        },
      })
    : [];

  const deadline = calculateDeadline(ticket.createdAt, ticket.slaType);
  const acceptedQuotePartIds = new Set(
    ticket.quotes
      .filter((quote) => quote.status === 'ACCEPTED')
      .flatMap((quote) => quote.items.map((item) => item.partId).filter(Boolean) as string[]),
  );
  const reservedPartsById = new Map<
    string,
    {
      partId: string;
      sku: string;
      name: string;
      quantity: number;
      stockQuantity: number;
      stockReserved: number;
    }
  >();

  for (const reservation of ticket.partReservations) {
    if (!acceptedQuotePartIds.has(reservation.partId)) {
      continue;
    }

    const existing = reservedPartsById.get(reservation.partId);

    reservedPartsById.set(reservation.partId, {
      partId: reservation.partId,
      sku: reservation.part.sku,
      name: reservation.part.name,
      quantity: (existing?.quantity ?? 0) + reservation.quantity,
      stockQuantity: reservation.part.quantity,
      stockReserved: reservation.part.reserved,
    });
  }

  const serializedTicket = {
    ...ticket,

    createdAt: ticket.createdAt.toISOString(),
    updatedAt: ticket.updatedAt.toISOString(),
    partReservations: [],

    events: ticket.events.map((event) => ({
      ...event,
      createdAt: event.createdAt.toISOString(),
    })),

    checklist: ticket.checklist.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
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

    reservedParts: Array.from(reservedPartsById.values()),

    previousRepairs: previousRepairs.map((repair) => ({
      ...repair,
      createdAt: repair.createdAt.toISOString(),
      repairProtocol: repair.repairProtocol
        ? {
            repairCost: repair.repairProtocol.repairCost.toString(),
          }
        : null,
    })),
  };

  return (
    <TicketDetailClient
      ticket={serializedTicket}
      deadline={deadline.toISOString()}
    />
  );
}