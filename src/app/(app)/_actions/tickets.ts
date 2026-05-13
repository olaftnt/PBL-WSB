'use server';

import { prisma } from '@/lib/prisma';
import { TicketPriority, TicketStatus, SLATYPE, TicketEventType } from '@prisma/client';
import { generateTicketNumber } from '@/lib/ticketNumber';
import { sendStatusEmail } from '@/lib/send-status-email';

export type CreateTicketInput = {
  customerId: string;
  deviceId?: string | null;
  title: string;
  description?: string | null;
  priority: TicketPriority;
  slaType: SLATYPE;
  physicalCondition?: string | null;
  accessories: string[];
};

export async function createTicket(input: CreateTicketInput) {
  if (!input.customerId) throw new Error('ID klienta jest wymagane');
  if (!input.title?.trim()) throw new Error('Tytuł jest wymagany');

  const number = await generateTicketNumber();

  const created = await prisma.ticket.create({
    data: {
      number,
      customerId: input.customerId,
      deviceId: input.deviceId ?? null,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      priority: input.priority,
      slaType: input.slaType,
      physicalCondition: input.physicalCondition?.trim() || null,
      accessories: input.accessories ?? [],
      events: {
        create: {
          type: TicketEventType.CREATED,
          message: `Utworzono zgłoszenie ${number}`,
          author: 'system',
        },
      },
    },
  });

  const customer = await prisma.customer.findUnique({
    where: { id: input.customerId },
  });

  if (customer?.email) {
    await sendStatusEmail({
      email: "pblwsb@o2.pl",
      ticketNumber: created.number,
      status: 'CREATED',
      device: null,
    });
  }

  return created;
}

export async function updateTicketStatus(input: {
  id: string;
  status: TicketStatus;
  author?: string;
}) {
  if (!input.id) throw new Error('ID jest wymagane');

  const oldTicket = await prisma.ticket.findUnique({
    where: { id: input.id },
  });

  const updated = await prisma.ticket.update({
    where: {
      id: input.id,
    },
    data: {
      status: input.status,
      events: {
        create: {
          type: TicketEventType.STATUS,
          message: `Zmieniono status na ${input.status}`,
          author: input.author ?? 'system',
        },
      },
    },

    include: {
      customer: true,
      device: true,
    },
  });

  if (
    oldTicket?.status !== input.status &&
    updated.customer?.email
  ) {
    await sendStatusEmail({
      email: "pblwsb@o2.pl",
      ticketNumber: updated.number,
      status: updated.status,
      device: updated.device?.name,
    });
  }

  return updated;
}

export async function addTicketNote(input: {
  ticketId: string;
  message: string;
  author?: string;
}) {
  const msg = input.message?.trim();

  if (!input.ticketId) throw new Error('ID zgłoszenia jest wymagane');
  if (!msg) throw new Error('Wiadomość jest wymagana');

  const created = await prisma.ticketEvent.create({
    data: {
      ticketId: input.ticketId,
      type: TicketEventType.NOTE,
      message: msg,
      author: input.author ?? 'user',
    },
  });

  return created;
}

export type UpdateTicketInput = {
  id: string;
  title?: string;
  description?: string | null;
  priority?: TicketPriority;
  slaType?: SLATYPE;
  physicalCondition?: string | null;
  accessories?: string[];
  deviceId?: string | null;
};

export async function updateTicket(input: UpdateTicketInput) {
  if (!input.id) throw new Error('ID jest wymagane');

  const data: any = {};

  if (typeof input.title === 'string') data.title = input.title.trim();
  if ('description' in input) data.description = input.description?.trim() || null;
  if (input.priority) data.priority = input.priority;
  if (input.slaType) data.slaType = input.slaType;

  if ('physicalCondition' in input) {
    data.physicalCondition = input.physicalCondition?.trim() || null;
  }

  if (Array.isArray(input.accessories)) data.accessories = input.accessories;
  if ('deviceId' in input) data.deviceId = input.deviceId ?? null;

  const updated = await prisma.ticket.update({
    where: {
      id: input.id,
    },
    data: {
      ...data,
      events: {
        create: {
          type: TicketEventType.NOTE,
          message: 'Zaktualizowano dane zgłoszenia',
          author: 'user',
        },
      },
    },

    include: {
      customer: true,
      device: true,
    },
  });

  return updated;
}

export type CompleteTicketWithProtocolInput = {
  ticketId: string;
  performedWork: string;
  servicePerson?: string | null;
};

export async function completeTicketWithProtocol(input: CompleteTicketWithProtocolInput) {
  const performedWork = input.performedWork?.trim();
  const servicePerson = input.servicePerson?.trim() || null;

  if (!input.ticketId) {
    throw new Error('ID zgłoszenia jest wymagane');
  }

  if (!performedWork) {
    throw new Error('Opis wykonanych prac jest wymagany');
  }

  const result = await prisma.$transaction(async (tx) => {
    const quote = await tx.quote.findFirst({
      where: {
        ticketId: input.ticketId,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      select: {
        id: true,
        number: true,
        totalGross: true,
      },
    });

    if (!quote) {
      throw new Error(
        'Nie można wygenerować protokołu. Najpierw utwórz kosztorys dla tego zgłoszenia.'
      );
    }

    const repairCost = quote.totalGross;

    if (repairCost.lte(0)) {
      throw new Error(
        'Nie można wygenerować protokołu. Kwota brutto kosztorysu musi być większa niż 0 zł.'
      );
    }

    const protocol = await tx.repairProtocol.upsert({
      where: {
        ticketId: input.ticketId,
      },
      create: {
        ticketId: input.ticketId,
        performedWork,
        repairCost,
        servicePerson,
      },
      update: {
        performedWork,
        repairCost,
        servicePerson,
      },
      select: {
        id: true,
      },
    });

    const updatedTicket = await tx.ticket.update({
      where: {
        id: input.ticketId,
      },
      data: {
        status: TicketStatus.DONE,
      },
      select: {
        id: true,
      },
    });

    await tx.ticketEvent.create({
      data: {
        ticketId: input.ticketId,
        type: TicketEventType.NOTE,
        message:
          `Wygenerowano protokół naprawy.\n\n` +
          `Kosztorys: ${quote.number}\n\n` +
          `Wykonane czynności:\n${performedWork}\n\n` +
          `Kwota naprawy brutto: ${repairCost.toFixed(2)} zł\n\n` +
          `Serwisant: ${servicePerson || '—'}`,
        author: servicePerson || 'system',
      },
    });

    await tx.ticketEvent.create({
      data: {
        ticketId: input.ticketId,
        type: TicketEventType.STATUS,
        message: 'Zmieniono status na DONE',
        author: servicePerson || 'system',
      },
    });

    return {
      ok: true,
      ticketId: updatedTicket.id,
      protocolId: protocol.id,
      quoteId: quote.id,
      quoteNumber: quote.number,
      repairCost: repairCost.toFixed(2),
    };
  });

  return result;
}

export async function deleteTicket(input: { id: string }) {
  if (!input.id) throw new Error('ID jest wymagane');

  await prisma.ticket.delete({
    where: {
      id: input.id,
    },
  });

  return { ok: true };
}