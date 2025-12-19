'use server';

import { prisma } from '@/lib/prisma';
import { generateTicketNumber } from '@/lib/ticketNumber';
import { TicketPriority, TicketStatus, SLATYPE } from '@prisma/client';

export type CreateTicketInput = {
  customerId: string;
  deviceId?: string | null;
  title: string;
  description?: string | null;
  priority: TicketPriority;
  slaType: SLATYPE;
  physicalCondition?: string | null;
  accessories: string[];
};

/* =======================
   CREATE TICKET
======================= */
export async function createTicket(input: CreateTicketInput) {
  const number = await generateTicketNumber();

  return prisma.ticket.create({
    data: {
      number,
      customerId: input.customerId,
      deviceId: input.deviceId ?? null,
      title: input.title,
      description: input.description ?? null,
      priority: input.priority,
      slaType: input.slaType,
      physicalCondition: input.physicalCondition ?? null,
      accessories: input.accessories,
      status: TicketStatus.NEW,
    },
    include: {
      customer: true,
      device: true,
    },
  });
}

/* =======================
   UPDATE STATUS
======================= */
export async function updateTicketStatus(input: {
  id: string;
  status: TicketStatus;
}) {
  return prisma.ticket.update({
    where: { id: input.id },
    data: {
      status: input.status,
      updatedAt: new Date(),
    },
  });
}
