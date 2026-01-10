'use server';

import { prisma } from '@/lib/prisma';
import { QuoteStatus } from '@prisma/client';
import type { QuoteItemInput } from '@/types/quote';

const computeTotals = (laborHours: number, laborRate: number, vatRate: number, items: QuoteItemInput[]) => {
  const labor = laborHours * laborRate;
  const parts = items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
  const net = labor + parts;
  const vat = net * (vatRate / 100);
  const gross = net + vat;
  return { labor, parts, net, vat, gross };
};

const generateQuoteNumberWithTx = async (tx: any) => {
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const prefix = `QT-${yyyy}${mm}${dd}`;

  // Szukamy najwyższego numeru z dzisiaj zamiast liczyć (count),
  // aby uniknąć problemów po usunięciu kosztorysów.
  const lastQuote = await tx.quote.findFirst({
    where: {
      number: {
        startsWith: prefix,
      },
    },
    orderBy: {
      number: 'desc',
    },
    select: {
      number: true,
    },
  });

  let nextSeq = 1;
  if (lastQuote) {
    const parts = lastQuote.number.split('-');
    const lastSeq = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastSeq)) {
      nextSeq = lastSeq + 1;
    }
  }

  const seq = String(nextSeq).padStart(3, '0');
  return `${prefix}-${seq}`;
};

type SaveQuoteInput = {
  id?: string;
  ticketId: string;
  customerId: string;
  deviceId?: string | null;
  laborHours: number;
  laborRate: number;
  vatRate: number;
  notes?: string | null;
  items: QuoteItemInput[];
  status?: QuoteStatus;
};

export async function saveQuote(input: SaveQuoteInput) {
  const {
    id,
    ticketId,
    customerId,
    deviceId,
    laborHours,
    laborRate,
    vatRate,
    notes,
    items,
    status = QuoteStatus.DRAFT,
  } = input;

  if (!ticketId) throw new Error('ticketId is required');
  if (!customerId) throw new Error('customerId is required');
  if (!Array.isArray(items)) throw new Error('items must be an array');

  const normalizedItems = (items ?? []).map((item) => {
    const quantity = Number(item.quantity);
    const unitPrice = Number(item.unitPrice);
    if (Number.isNaN(quantity) || quantity <= 0) throw new Error('Quantity must be > 0');
    if (Number.isNaN(unitPrice) || unitPrice < 0) throw new Error('Price must be >= 0');
    return {
      id: item.id,
      partId: item.partId || null,
      description: item.description?.trim() || 'Pozycja',
      quantity,
      unitPrice,
      total: quantity * unitPrice,
    };
  });

  const totals = computeTotals(Number(laborHours) || 0, Number(laborRate) || 0, Number(vatRate) || 0, normalizedItems);

  if (id) {
    // update
    return prisma.$transaction(async (tx) => {
      // Upsert items: delete removed, update existing, create new
      const existingItems = await tx.quoteItem.findMany({ where: { quoteId: id } });
      const incomingIds = new Set(normalizedItems.map((i) => i.id).filter(Boolean) as string[]);
      const toDelete = existingItems.filter((i) => !incomingIds.has(i.id));
      if (toDelete.length) {
        await tx.quoteItem.deleteMany({ where: { id: { in: toDelete.map((d) => d.id) } } });
      }

      for (const item of normalizedItems) {
        if (item.id) {
          await tx.quoteItem.update({
            where: { id: item.id },
            data: {
              partId: item.partId,
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.total,
            },
          });
        } else {
          await tx.quoteItem.create({
            data: {
              quoteId: id,
              partId: item.partId,
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.total,
            },
          });
        }
      }

      const updated = await tx.quote.update({
        where: { id },
        data: {
          ticketId,
          customerId,
          deviceId: deviceId || null,
          laborHours,
          laborRate,
          vatRate,
          notes: notes || null,
          status,
          totalNet: totals.net,
          totalVat: totals.vat,
          totalGross: totals.gross,
        },
        include: { items: true },
      });

      return {
        id: updated.id,
        status: updated.status,
        ticketId: updated.ticketId,
        customerId: updated.customerId,
        deviceId: updated.deviceId,
        laborHours: Number(updated.laborHours ?? 0),
        laborRate: Number(updated.laborRate ?? 0),
        vatRate: Number(updated.vatRate ?? 0),
        notes: updated.notes ?? null,
        totalNet: Number(updated.totalNet ?? 0),
        totalVat: Number(updated.totalVat ?? 0),
        totalGross: Number(updated.totalGross ?? 0),
        items: (updated.items ?? []).map((it) => ({
          id: it.id,
          partId: it.partId,
          description: it.description,
          quantity: it.quantity,
          unitPrice: Number(it.unitPrice ?? 0),
        })),
      };
    });
  }

  // create
  return prisma.$transaction(async (tx) => {
    const number = await generateQuoteNumberWithTx(tx);
    const quote = await tx.quote.create({
      data: {
        number,
        ticketId,
        customerId,
        deviceId: deviceId || null,
        laborHours,
        laborRate,
        vatRate,
        notes: notes || null,
        status,
        totalNet: totals.net,
        totalVat: totals.vat,
        totalGross: totals.gross,
      },
    });

    for (const item of normalizedItems) {
      await tx.quoteItem.create({
        data: {
          quoteId: quote.id,
          partId: item.partId,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
        },
      });
    }

    return { id: quote.id, status: quote.status };
  });
}

export async function updateQuoteStatus(id: string, status: QuoteStatus) {
  if (!id) throw new Error('Quote id is required');
  const updated = await prisma.quote.update({
    where: { id },
    data: { status },
    select: { id: true, status: true },
  });
  return updated;
}

export async function deleteAllQuotes() {
  const deletedItems = await prisma.quoteItem.deleteMany({});
  const deletedQuotes = await prisma.quote.deleteMany({});
  return { deletedQuotes: deletedQuotes.count, deletedItems: deletedItems.count };
}

export async function deleteQuote(id: string) {
  if (!id) throw new Error('Quote id is required');
  const deletedItems = await prisma.quoteItem.deleteMany({ where: { quoteId: id } });
  const deletedQuote = await prisma.quote.delete({ where: { id } });
  return { deletedQuoteId: deletedQuote.id, deletedItems: deletedItems.count };
}
