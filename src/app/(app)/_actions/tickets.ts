'use server';

import { prisma } from '@/lib/prisma';
import { generateTicketNumber } from '@/lib/ticketNumber';
import { revalidatePath } from 'next/cache';
import type { TicketPriority, SLATYPE } from '@prisma/client';

export async function createTicket(input: {
  customerId: string;
  deviceId?: string | null;

  title: string;
  description?: string | null;

  priority: TicketPriority;
  slaType: SLATYPE;

  physicalCondition?: string | null;
  accessories: string[];
}) {
  const number = await generateTicketNumber();

  const ticket = await prisma.ticket.create({
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

      status: 'NEW',
    },
    select: { id: true, number: true },
  });

  revalidatePath('/tickets');
  return ticket;
}
