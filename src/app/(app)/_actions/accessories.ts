'use server';

import { prisma } from '@/lib/prisma';

const normalizeAccessoryName = (value: string) =>
  value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('pl-PL');

const cleanAccessoryName = (value: string) => value.trim().replace(/\s+/g, ' ');

export async function recordTicketAccessoryUsage(input: { name: string }) {
  const name = cleanAccessoryName(input.name ?? '');
  const normalizedName = normalizeAccessoryName(name);

  if (!name) {
    throw new Error('Nazwa akcesorium jest wymagana');
  }

  return prisma.ticketAccessoryOption.upsert({
    where: { normalizedName },
    create: {
      name,
      normalizedName,
      popularity: 1,
    },
    update: {
      popularity: { increment: 1 },
      name,
      isDeleted: false,
    },
  });
}

export async function hideTicketAccessoryOption(input: { id: string }) {
  if (!input.id) {
    throw new Error('ID akcesorium jest wymagane');
  }

  return prisma.ticketAccessoryOption.update({
    where: { id: input.id },
    data: { isDeleted: true },
  });
}
