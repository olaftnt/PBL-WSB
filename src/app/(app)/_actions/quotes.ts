'use server';

import { prisma } from '@/lib/prisma';
import { QuoteStatus, TicketEventType } from '@prisma/client';
import type { QuoteItemInput } from '@/types/quote';
import { releaseQuotePartReservations, reserveQuoteParts } from '@/lib/quoteReservations';

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
  publicAccess?: 'PUBLIC' | 'VIEW_ONLY' | 'HIDDEN';
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
    publicAccess = 'HIDDEN',
  } = input;

  if (!ticketId) throw new Error('ID zgłoszenia jest wymagane');
  if (!customerId) throw new Error('ID klienta jest wymagane');
  if (!Array.isArray(items)) throw new Error('Pozycje muszą być tablicą');

  const normalizedItems = (items ?? []).map((item) => {
    const quantity = Number(item.quantity);
    const unitPrice = Number(item.unitPrice);
    if (Number.isNaN(quantity) || quantity <= 0) throw new Error('Ilość musi być większa od 0');
    if (Number.isNaN(unitPrice) || unitPrice < 0) throw new Error('Cena musi być większa lub równa 0');
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
      const existingQuote = await tx.quote.findUnique({
        where: { id },
        select: {
          status: true,
        },
      });

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
          publicAccess,
          totalNet: totals.net,
          totalVat: totals.vat,
          totalGross: totals.gross,
        },
        include: { items: true },
      });

      if (status === QuoteStatus.ACCEPTED) {
        await reserveQuoteParts(tx, updated.ticketId, updated.items);
      }

      if (status === QuoteStatus.ACCEPTED && existingQuote?.status !== QuoteStatus.ACCEPTED) {
        await tx.ticketEvent.create({
          data: {
            ticketId: updated.ticketId,
            type: TicketEventType.NOTE,
            message: `Zaakceptowano kosztorys ${updated.number} na kwotę brutto ${Number(updated.totalGross ?? 0).toFixed(2)} zł`,
            author: 'user',
          },
        });
      }

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
        publicAccess,
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

    await tx.ticketEvent.create({
      data: {
        ticketId,
        type: TicketEventType.NOTE,
        message: `Utworzono kosztorys ${number} na kwotę brutto ${totals.gross.toFixed(2)} zł`,
        author: 'user',
      },
    });

    if (status === QuoteStatus.ACCEPTED) {
      await reserveQuoteParts(tx, ticketId, normalizedItems);
    }

    if (status === QuoteStatus.ACCEPTED) {
      await tx.ticketEvent.create({
        data: {
          ticketId,
          type: TicketEventType.NOTE,
          message: `Zaakceptowano kosztorys ${number} na kwotę brutto ${totals.gross.toFixed(2)} zł`,
          author: 'user',
        },
      });
    }

    return { id: quote.id, status: quote.status };
  });
}

export async function updateQuoteStatus(id: string, status: QuoteStatus) {
  if (!id) throw new Error('ID kosztorysu jest wymagane');
  const updated = await prisma.$transaction(async (tx) => {
    const existingQuote = await tx.quote.findUnique({
      where: { id },
      select: {
        status: true,
      },
    });

    const quote = await tx.quote.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        number: true,
        status: true,
        ticketId: true,
        totalGross: true,
        items: {
          select: {
            partId: true,
            quantity: true,
          },
        },
      },
    });

    if (status === QuoteStatus.ACCEPTED && existingQuote?.status !== QuoteStatus.ACCEPTED) {
      await reserveQuoteParts(tx, quote.ticketId, quote.items);

      await tx.ticketEvent.create({
        data: {
          ticketId: quote.ticketId,
          type: TicketEventType.NOTE,
          message: `Zaakceptowano kosztorys ${quote.number} na kwotę brutto ${Number(quote.totalGross ?? 0).toFixed(2)} zł`,
          author: 'user',
        },
      });
    }

    return {
      id: quote.id,
      status: quote.status,
    };
  });
  return updated;
}

export async function deleteAllQuotes() {
  const deletedItems = await prisma.quoteItem.deleteMany({});
  const deletedQuotes = await prisma.quote.deleteMany({});
  return { deletedQuotes: deletedQuotes.count, deletedItems: deletedItems.count };
}

export async function deleteQuote(id: string) {
  if (!id) throw new Error('ID kosztorysu jest wymagane');

  return prisma.$transaction(async (tx) => {
    const quote = await tx.quote.findUnique({
      where: { id },
      select: {
        id: true,
        number: true,
        status: true,
        ticketId: true,
        items: {
          select: {
            partId: true,
            quantity: true,
          },
        },
      },
    });

    if (!quote) {
      throw new Error('Kosztorys nie został znaleziony');
    }

    if (quote.status === QuoteStatus.ACCEPTED) {
      await releaseQuotePartReservations(tx, quote.ticketId, quote.items);
    }

    const deletedItems = await tx.quoteItem.deleteMany({ where: { quoteId: id } });
    const deletedQuote = await tx.quote.delete({ where: { id } });

    if (quote.status === QuoteStatus.ACCEPTED) {
      await tx.ticketEvent.create({
        data: {
          ticketId: quote.ticketId,
          type: TicketEventType.NOTE,
          message: `Usunięto zaakceptowany kosztorys ${quote.number} i zwolniono niewydane rezerwacje części.`,
          author: 'user',
        },
      });
    }

    return { deletedQuoteId: deletedQuote.id, deletedItems: deletedItems.count };
  });
}
