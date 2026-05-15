import { prisma } from '@/lib/prisma';
import TicketsClient from './TicketsClient';
import { addHours, addDays } from 'date-fns';
import { SLATYPE } from '@prisma/client';

// Konfiguracja czasów
const SLA_CONFIG = {
  VIP: { hours: 12 },
  EXPRESS: { hours: 24 },
  STANDARD: { days: 5 },
  WARRANTY: { days: 7 },
};

// Funkcja obliczająca datę
function calculateDeadline(createdAt: Date, type: SLATYPE) {
  const config = SLA_CONFIG[type] || SLA_CONFIG.STANDARD;
  if ('hours' in config) {
    return addHours(createdAt, config.hours);
  } else {
    return addDays(createdAt, config.days!);
  }
}

export default async function Page() {
  // Pobieramy zgłoszenia
  const tickets = await prisma.ticket.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      customer: true,
      device: true,
      quotes: {
        select: {
          id: true,
          status: true,
          publicAccess: true,
        },
      },
    },
  });

  // termin do każdego zgłoszenia
  const ticketsWithDeadline = tickets.map((ticket) => ({
    ...ticket,
    deadline: calculateDeadline(ticket.createdAt, ticket.slaType).toISOString(),
  }));

  // Wysyłamy przetworzone dane (z terminami) do klienta
  return <TicketsClient initialTickets={ticketsWithDeadline} />;
}