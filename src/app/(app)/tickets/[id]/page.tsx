import { prisma } from '@/lib/prisma';
import TicketDetailClient from './TicketDetailClient';
import { notFound } from "next/navigation";
import { addHours, addDays } from "date-fns";
import { SLATYPE } from "@prisma/client";

// --- LOGIKA OBLICZANIA SLA ---
const SLA_CONFIG = {
  VIP: { hours: 12 },
  EXPRESS: { hours: 24 },
  STANDARD: { days: 5 },
  WARRANTY: { days: 7 },
};

function calculateDeadline(createdAt: Date, type: SLATYPE) {
  const config = SLA_CONFIG[type] || SLA_CONFIG.STANDARD;
  if ('hours' in config) {
    return addHours(createdAt, config.hours);
  } else {
    return addDays(createdAt, config.days!);
  }
}

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      customer: true,
      device: true,
      events: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!ticket) {
    return (
      <div className="p-6 text-white">Nie znaleziono zgłoszenia.</div>
    );
  }

  // deadline
  const deadlineDate = calculateDeadline(ticket.createdAt, ticket.slaType);

  const deadlineString = deadlineDate.toISOString();

  return <TicketDetailClient ticket={ticket} deadline={deadlineString} />;
}