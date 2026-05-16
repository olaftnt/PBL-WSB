'use server';

import { prisma } from '@/lib/prisma';

export type PartInput = {
  sku: string;
  name: string;
  warehouseLocation?: string | null;
  quantity: number;
  minQuantity: number;
  price: number;
};

function normalizeWarehouseLocation(raw: unknown) {
  if (raw === undefined || raw === null) return null;
  const t = String(raw).trim();
  return t === '' ? null : t;
}

export async function createPart(input: PartInput) {
  const sku = input.sku?.trim();
  const name = input.name?.trim();
  const warehouseLocation = normalizeWarehouseLocation(input.warehouseLocation ?? null);
  const quantity = Number(input.quantity ?? 0);
  const minQuantity = Number(input.minQuantity ?? 0);
  const price = Number(input.price ?? 0);

  if (!sku) throw new Error('SKU jest wymagane');
  if (!name) throw new Error('Nazwa jest wymagana');
  if (Number.isNaN(quantity) || quantity < 0) throw new Error('Ilość musi być większa lub równa 0');
  if (Number.isNaN(minQuantity) || minQuantity < 0) throw new Error('Minimalna ilość musi być większa lub równa 0');
  if (Number.isNaN(price) || price < 0) throw new Error('Cena musi być większa lub równa 0');

  const created = await prisma.part.create({
    data: { sku, name, warehouseLocation, quantity, minQuantity, price },
  });
  return {
    id: created.id,
    sku: created.sku,
    name: created.name,
    warehouseLocation: created.warehouseLocation,
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
  if (input.warehouseLocation !== undefined) {
    data.warehouseLocation = normalizeWarehouseLocation(input.warehouseLocation);
  }

  const updated = await prisma.part.update({ where: { id }, data });
  return {
    id: updated.id,
    sku: updated.sku,
    name: updated.name,
    warehouseLocation: updated.warehouseLocation,
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
      warehouseLocation: updated.warehouseLocation,
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
      warehouseLocation: updated.warehouseLocation,
      quantity: updated.quantity,
      minQuantity: updated.minQuantity,
      price: Number(updated.price ?? 0),
      reserved: updated.reserved,
      createdAt: updated.createdAt?.toISOString?.(),
    };
  });
}

export async function consumeReservedPartForTicket(input: {
  ticketId: string;
  partId: string;
}) {
  if (!input.ticketId) throw new Error('ID zgłoszenia jest wymagane');
  if (!input.partId) throw new Error('ID części jest wymagane');

  return prisma.$transaction(async (tx) => {
    const reservations = await tx.partReservation.findMany({
      where: {
        ticketId: input.ticketId,
        partId: input.partId,
      },
      include: {
        part: {
          select: {
            id: true,
            sku: true,
            name: true,
            quantity: true,
            reserved: true,
          },
        },
      },
    });

    if (!reservations.length) {
      throw new Error('Brak rezerwacji tej części dla zgłoszenia');
    }

    const quantityToConsume = reservations.reduce(
      (sum, reservation) => sum + reservation.quantity,
      0,
    );
    const part = reservations[0].part;

    if (part.quantity < quantityToConsume) {
      throw new Error('Brak wystarczającej ilości w magazynie');
    }

    await tx.partReservation.deleteMany({
      where: {
        ticketId: input.ticketId,
        partId: input.partId,
      },
    });

    await tx.part.update({
      where: { id: input.partId },
      data: {
        quantity: part.quantity - quantityToConsume,
        reserved: Math.max(0, part.reserved - quantityToConsume),
      },
    });

    await tx.ticketEvent.create({
      data: {
        ticketId: input.ticketId,
        type: 'NOTE',
        message: `Wydano z magazynu ${quantityToConsume} szt. części ${part.sku} · ${part.name} i usunięto rezerwację.`,
        author: 'user',
      },
    });

    return {
      partId: input.partId,
      quantity: quantityToConsume,
    };
  });
}
