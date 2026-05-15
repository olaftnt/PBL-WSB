import type { QuoteItemInput } from '@/types/quote';

type ReservationTx = {
  partReservation: {
    findMany: (args: any) => Promise<Array<{ id?: string; partId: string; quantity: number }>>;
    create: (args: any) => Promise<any>;
    deleteMany: (args: any) => Promise<any>;
    delete: (args: any) => Promise<any>;
    update: (args: any) => Promise<any>;
  };
  ticketEvent: {
    findFirst: (args: any) => Promise<{ id: string } | null>;
    create: (args: any) => Promise<any>;
  };
  part: {
    findUnique: (args: any) => Promise<{ id: string; quantity: number; reserved: number } | null>;
    update: (args: any) => Promise<any>;
  };
};

type ReservableQuoteItem = Pick<QuoteItemInput, 'partId' | 'quantity'>;

function collectRequiredParts(items: ReservableQuoteItem[]) {
  const requiredByPart = new Map<string, number>();

  for (const item of items) {
    if (!item.partId) continue;

    const quantity = Number(item.quantity);
    if (Number.isNaN(quantity) || quantity <= 0) continue;

    requiredByPart.set(item.partId, (requiredByPart.get(item.partId) ?? 0) + quantity);
  }

  return requiredByPart;
}

export async function reserveQuoteParts(
  tx: ReservationTx,
  ticketId: string,
  items: ReservableQuoteItem[],
) {
  const requiredByPart = collectRequiredParts(items);

  if (!requiredByPart.size) {
    return [];
  }

  const existingReservations = await tx.partReservation.findMany({
    where: {
      ticketId,
      partId: {
        in: Array.from(requiredByPart.keys()),
      },
    },
    select: {
      partId: true,
      quantity: true,
    },
  });

  const existingByPart = new Map<string, number>();

  for (const reservation of existingReservations) {
    existingByPart.set(
      reservation.partId,
      (existingByPart.get(reservation.partId) ?? 0) + reservation.quantity,
    );
  }

  const reservedParts: Array<{ partId: string; quantity: number }> = [];

  for (const [partId, requiredQuantity] of requiredByPart) {
    const alreadyReserved = existingByPart.get(partId) ?? 0;
    const quantityToReserve = requiredQuantity - alreadyReserved;

    if (quantityToReserve <= 0) continue;

    const part = await tx.part.findUnique({
      where: { id: partId },
      select: {
        id: true,
        quantity: true,
        reserved: true,
      },
    });

    if (!part) {
      throw new Error('Część z kosztorysu nie została znaleziona w magazynie');
    }

    const available = part.quantity - part.reserved;

    if (available < quantityToReserve) {
      throw new Error('Brak wystarczającej ilości w magazynie do automatycznej rezerwacji części');
    }

    await tx.partReservation.create({
      data: {
        partId,
        ticketId,
        quantity: quantityToReserve,
      },
    });

    await tx.part.update({
      where: { id: partId },
      data: {
        reserved: part.reserved + quantityToReserve,
      },
    });

    reservedParts.push({ partId, quantity: quantityToReserve });
  }

  return reservedParts;
}

export async function consumeAcceptedQuoteParts(
  tx: ReservationTx,
  ticketId: string,
  quoteNumber: string,
  items: ReservableQuoteItem[],
) {
  const markerMessage = `Rozchodowano części z zaakceptowanego kosztorysu ${quoteNumber}.`;
  const alreadyConsumed = await tx.ticketEvent.findFirst({
    where: {
      ticketId,
      message: markerMessage,
    },
    select: {
      id: true,
    },
  });

  if (alreadyConsumed) {
    return [];
  }

  const requiredByPart = collectRequiredParts(items);

  if (!requiredByPart.size) {
    return [];
  }

  const existingReservations = await tx.partReservation.findMany({
    where: {
      ticketId,
      partId: {
        in: Array.from(requiredByPart.keys()),
      },
    },
    select: {
      partId: true,
      quantity: true,
    },
  });

  const existingByPart = new Map<string, number>();

  for (const reservation of existingReservations) {
    existingByPart.set(
      reservation.partId,
      (existingByPart.get(reservation.partId) ?? 0) + reservation.quantity,
    );
  }

  const consumedParts: Array<{ partId: string; quantity: number }> = [];

  for (const [partId, requiredQuantity] of requiredByPart) {
    const quantityToConsume = requiredQuantity;

    if (quantityToConsume <= 0) continue;

    const part = await tx.part.findUnique({
      where: { id: partId },
      select: {
        id: true,
        quantity: true,
        reserved: true,
      },
    });

    if (!part) {
      throw new Error('Część z kosztorysu nie została znaleziona w magazynie');
    }

    if (part.quantity < quantityToConsume) {
      throw new Error('Brak wystarczającej ilości w magazynie do automatycznego rozchodowania części');
    }

    const alreadyReserved = existingByPart.get(partId) ?? 0;
    const quantityToMark = Math.max(0, requiredQuantity - alreadyReserved);

    if (quantityToMark > 0) {
      await tx.partReservation.create({
        data: {
          partId,
          ticketId,
          quantity: quantityToMark,
        },
      });
    }

    await tx.part.update({
      where: { id: partId },
      data: {
        quantity: part.quantity - quantityToConsume,
        reserved: Math.max(0, part.reserved - quantityToConsume),
      },
    });

    consumedParts.push({ partId, quantity: quantityToConsume });
  }

  if (consumedParts.length) {
    await tx.partReservation.deleteMany({
      where: {
        ticketId,
        partId: {
          in: consumedParts.map((part) => part.partId),
        },
      },
    });

    await tx.ticketEvent.create({
      data: {
        ticketId,
        type: 'NOTE',
        message: markerMessage,
        author: 'system',
      },
    });
  }

  return consumedParts;
}

export async function releaseQuotePartReservations(
  tx: ReservationTx,
  ticketId: string,
  items: ReservableQuoteItem[],
) {
  const requiredByPart = collectRequiredParts(items);
  const releasedParts: Array<{ partId: string; quantity: number }> = [];

  for (const [partId, requiredQuantity] of requiredByPart) {
    let quantityToRelease = requiredQuantity;

    const reservations = await tx.partReservation.findMany({
      where: {
        ticketId,
        partId,
      },
      select: {
        id: true,
        partId: true,
        quantity: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    let releasedQuantity = 0;

    for (const reservation of reservations) {
      if (quantityToRelease <= 0) break;
      if (!reservation.id) continue;

      const releaseFromReservation = Math.min(reservation.quantity, quantityToRelease);
      const remainingReservationQuantity = reservation.quantity - releaseFromReservation;

      if (remainingReservationQuantity > 0) {
        await tx.partReservation.update({
          where: { id: reservation.id },
          data: { quantity: remainingReservationQuantity },
        });
      } else {
        await tx.partReservation.delete({
          where: { id: reservation.id },
        });
      }

      quantityToRelease -= releaseFromReservation;
      releasedQuantity += releaseFromReservation;
    }

    if (releasedQuantity > 0) {
      const part = await tx.part.findUnique({
        where: { id: partId },
        select: {
          id: true,
          quantity: true,
          reserved: true,
        },
      });

      if (part) {
        await tx.part.update({
          where: { id: partId },
          data: {
            reserved: Math.max(0, part.reserved - releasedQuantity),
          },
        });
      }

      releasedParts.push({ partId, quantity: releasedQuantity });
    }
  }

  return releasedParts;
}
