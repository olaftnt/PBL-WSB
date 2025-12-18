'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createTicket(input: {
  customerId: string;
  deviceId?: string | null;
  title: string;
  description?: string | null;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  slaType: 'STANDARD' | 'EXPRESS' | 'VIP' | 'WARRANTY';
  physicalCondition?: string | null;
  accessories: string[];
}) {
  const ticket = await prisma.ticket.create({
    data: {
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
  });

  revalidatePath('/tickets');
  return ticket;
}
