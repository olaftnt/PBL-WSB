'use server';

import { prisma } from '@/lib/prisma';

export async function createDevice(input: {
  customerId: string;
  name: string;
  model?: string | null;
  serial?: string | null;
  notes?: string | null;
}) {
  const name = input.name?.trim();
  if (!input.customerId) throw new Error('customerId is required');
  if (!name) throw new Error('Device name is required');

  const created = await prisma.device.create({
    data: {
      customerId: input.customerId,
      name,
      model: input.model?.trim() || null,
      serial: input.serial?.trim() || null,
      notes: input.notes?.trim() || null,
    },
  });

  return created;
}
