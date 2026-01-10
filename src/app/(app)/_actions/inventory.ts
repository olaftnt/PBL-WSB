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

  if (!sku) throw new Error('SKU jest wymagane');
  if (!name) throw new Error('Nazwa jest wymagana');
  if (Number.isNaN(quantity) || quantity < 0) throw new Error('Ilość musi być większa lub równa 0');
  if (Number.isNaN(minQuantity) || minQuantity < 0) throw new Error('Minimalna ilość musi być większa lub równa 0');
  if (Number.isNaN(price) || price < 0) throw new Error('Cena musi być większa lub równa 0');

  const created = await prisma.part.create({ data: { sku, name, quantity, minQuantity, price } });
  return {
    id: created.id,
    sku: created.sku,
    name: created.name,
    quantity: created.quantity,
    minQuantity: created.minQuantity,
    price: Number(created.price ?? 0),
    reserved: created.reserved,
    createdAt: created.createdAt?.toISOString?.(),
  };
}

export async function updatePart(id: string, input: Partial<PartInput>) {
  if (!id) throw new Error('ID części jest wymagane');
  const data: any = {};

  if (input.sku !== undefined) {
    const sku = input.sku?.trim();
    if (!sku) throw new Error('SKU jest wymagane');
    data.sku = sku;
  }
  if (input.name !== undefined) {
    const name = input.name?.trim();
    if (!name) throw new Error('Nazwa jest wymagana');
    data.name = name;
  }
  if (input.quantity !== undefined) {
    const q = Number(input.quantity);
    if (Number.isNaN(q) || q < 0) throw new Error('Ilość musi być większa lub równa 0');
    data.quantity = q;
  }
  if (input.minQuantity !== undefined) {
    const q = Number(input.minQuantity);
    if (Number.isNaN(q) || q < 0) throw new Error('Minimalna ilość musi być większa lub równa 0');
    data.minQuantity = q;
  }
  if (input.price !== undefined) {
    const p = Number(input.price);
    if (Number.isNaN(p) || p < 0) throw new Error('Cena musi być większa lub równa 0');
    data.price = p;
  }

  const updated = await prisma.part.update({ where: { id }, data });
  return {
    id: updated.id,
    sku: updated.sku,
    name: updated.name,
    quantity: updated.quantity,
    minQuantity: updated.minQuantity,
    price: Number(updated.price ?? 0),
    reserved: updated.reserved,
    createdAt: updated.createdAt?.toISOString?.(),
  };
}

export async function reservePart(partId: string, ticketId: string, quantity: number) {
  if (!partId) throw new Error('ID części jest wymagane');
  if (!ticketId) throw new Error('ID zgłoszenia jest wymagane');
  const qty = Number(quantity);
  if (Number.isNaN(qty) || qty <= 0) throw new Error('Ilość musi być większa od 0');

  return prisma.$transaction(async (tx) => {
    const part = await tx.part.findUnique({ where: { id: partId } });
    if (!part) throw new Error('Część nie została znaleziona');

    const available = part.quantity - part.reserved;
    if (available < qty) throw new Error('Brak wystarczającej ilości w magazynie do rezerwacji');

    await tx.partReservation.create({
      data: { partId, ticketId, quantity: qty },
    });

    const updated = await tx.part.update({
      where: { id: partId },
      data: { reserved: part.reserved + qty },
    });
    return {
      id: updated.id,
      sku: updated.sku,
      name: updated.name,
      quantity: updated.quantity,
      minQuantity: updated.minQuantity,
      price: Number(updated.price ?? 0),
      reserved: updated.reserved,
      createdAt: updated.createdAt?.toISOString?.(),
    };
  });
}

export async function consumePart(partId: string, quantity: number) {
  if (!partId) throw new Error('ID części jest wymagane');
  const qty = Number(quantity);
  if (Number.isNaN(qty) || qty <= 0) throw new Error('Ilość musi być większa od 0');

  return prisma.$transaction(async (tx) => {
    const part = await tx.part.findUnique({ where: { id: partId } });
    if (!part) throw new Error('Część nie została znaleziona');

    if (part.quantity < qty) throw new Error('Brak wystarczającej ilości w magazynie');

    const newReserved = Math.max(0, part.reserved - qty);

    const updated = await tx.part.update({
      where: { id: partId },
      data: {
        quantity: part.quantity - qty,
        reserved: newReserved,
      },
    });
    return {
      id: updated.id,
      sku: updated.sku,
      name: updated.name,
      quantity: updated.quantity,
      minQuantity: updated.minQuantity,
      price: Number(updated.price ?? 0),
      reserved: updated.reserved,
      createdAt: updated.createdAt?.toISOString?.(),
    };
  });
}
