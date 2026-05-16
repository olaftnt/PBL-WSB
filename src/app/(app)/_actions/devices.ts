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
  if (!input.customerId) throw new Error('ID klienta jest wymagane');
  if (!name) throw new Error('Nazwa urządzenia jest wymagana');

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

export async function updateDevice(input: {
  id: string;
  name?: string;
  model?: string | null;
  serial?: string | null;
  notes?: string | null;
}) {
  const { id } = input;
  if (!id) throw new Error('ID urządzenia jest wymagane');

  const name = input.name?.trim();
  const model = input.model?.trim() ?? null;
  const serial = input.serial?.trim() ?? null;
  const notes = input.notes?.trim() ?? null;

  if (!name) throw new Error('Nazwa urządzenia jest wymagana');

  const updated = await prisma.device.update({
    where: { id },
    data: { name, model, serial, notes },
  });

  return updated;
}

export async function setDeviceDeleted(input: {
  id: string;
  isDeleted: boolean;
}) {
  if (!input.id) throw new Error('ID urządzenia jest wymagane');

  const updated = await prisma.device.update({
    where: { id: input.id },
    data: { isDeleted: input.isDeleted },
  });

  return updated;
}

export async function transferDeviceCustomer(input: {
  id: string;
  customerId: string;
}) {
  if (!input.id) throw new Error('ID urządzenia jest wymagane');
  if (!input.customerId) throw new Error('ID nowego klienta jest wymagane');

  const customer = await prisma.customer.findUnique({
    where: { id: input.customerId },
    select: { id: true },
  });

  if (!customer) {
    throw new Error('Wybrany klient nie istnieje');
  }

  const updated = await prisma.device.update({
    where: { id: input.id },
    data: { customerId: input.customerId },
  });

  return updated;
}
