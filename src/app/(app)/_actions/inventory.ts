'use server';

import { prisma } from '@/lib/prisma';

export type PartInput = {
  sku: string;
  name: string;
  quantity: number;
  minQuantity: number;
  price: number;
};

export async function createPart(input: PartInput) {
  const sku = input.sku?.trim();
  const name = input.name?.trim();
  const quantity = Number(input.quantity ?? 0);
  const minQuantity = Number(input.minQuantity ?? 0);
  const price = Number(input.price ?? 0);

  if (!sku) throw new Error('SKU is required');
  if (!name) throw new Error('Name is required');
  if (Number.isNaN(quantity) || quantity < 0) throw new Error('Quantity must be >= 0');
  if (Number.isNaN(minQuantity) || minQuantity < 0) throw new Error('Min quantity must be >= 0');
  if (Number.isNaN(price) || price < 0) throw new Error('Price must be >= 0');

  return prisma.part.create({
    data: { sku, name, quantity, minQuantity, price },
  });
}

export async function updatePart(id: string, input: Partial<PartInput>) {
  if (!id) throw new Error('Part id is required');
  const data: any = {};

  if (input.sku !== undefined) {
    const sku = input.sku?.trim();
    if (!sku) throw new Error('SKU is required');
    data.sku = sku;
  }
  if (input.name !== undefined) {
    const name = input.name?.trim();
    if (!name) throw new Error('Name is required');
    data.name = name;
  }
  if (input.quantity !== undefined) {
    const q = Number(input.quantity);
    if (Number.isNaN(q) || q < 0) throw new Error('Quantity must be >= 0');
    data.quantity = q;
  }
  if (input.minQuantity !== undefined) {
    const q = Number(input.minQuantity);
    if (Number.isNaN(q) || q < 0) throw new Error('Min quantity must be >= 0');
    data.minQuantity = q;
  }
  if (input.price !== undefined) {
    const p = Number(input.price);
    if (Number.isNaN(p) || p < 0) throw new Error('Price must be >= 0');
    data.price = p;
  }

  return prisma.part.update({ where: { id }, data });
}

export async function reservePart(partId: string, ticketId: string, quantity: number) {
  if (!partId) throw new Error('partId is required');
  if (!ticketId) throw new Error('ticketId is required');
  const qty = Number(quantity);
  if (Number.isNaN(qty) || qty <= 0) throw new Error('Quantity must be > 0');

  return prisma.$transaction(async (tx) => {
    const part = await tx.part.findUnique({ where: { id: partId } });
    if (!part) throw new Error('Part not found');

    const available = part.quantity - part.reserved;
    if (available < qty) throw new Error('Not enough available stock to reserve');

    await tx.partReservation.create({
      data: { partId, ticketId, quantity: qty },
    });

    return tx.part.update({
      where: { id: partId },
      data: { reserved: part.reserved + qty },
    });
  });
}

export async function consumePart(partId: string, quantity: number) {
  if (!partId) throw new Error('partId is required');
  const qty = Number(quantity);
  if (Number.isNaN(qty) || qty <= 0) throw new Error('Quantity must be > 0');

  return prisma.$transaction(async (tx) => {
    const part = await tx.part.findUnique({ where: { id: partId } });
    if (!part) throw new Error('Part not found');

    if (part.quantity < qty) throw new Error('Not enough stock to consume');

    const newReserved = Math.max(0, part.reserved - qty);

    return tx.part.update({
      where: { id: partId },
      data: {
        quantity: part.quantity - qty,
        reserved: newReserved,
      },
    });
  });
}

