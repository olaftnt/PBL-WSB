'use server';

import { prisma } from '@/lib/prisma';
import { TicketPriority, TicketStatus, SLATYPE, TicketEventType } from '@prisma/client';
import { generateTicketNumber } from '@/lib/ticketNumber';

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

  return created;
}

export async function updateTicketStatus(input: { id: string; status: TicketStatus; author?: string }) {
  if (!input.id) throw new Error('ID jest wymagane');

  const updated = await prisma.ticket.update({
    where: { id: input.id },
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
  });

  return updated;
}

export async function addTicketNote(input: { ticketId: string; message: string; author?: string }) {
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
  if ('physicalCondition' in input) data.physicalCondition = input.physicalCondition?.trim() || null;
  if (Array.isArray(input.accessories)) data.accessories = input.accessories;
  if ('deviceId' in input) data.deviceId = input.deviceId ?? null;

  const updated = await prisma.ticket.update({
    where: { id: input.id },
    data: {
      ...data,
      events: {
        create: {
          type: TicketEventType.NOTE,
          message: `Zaktualizowano dane zgłoszenia`,
          author: 'user',
        },
      },
    },
  });

  return updated;
}

export async function deleteTicket(input: { id: string }) {
  if (!input.id) throw new Error('ID jest wymagane');

  
  await prisma.ticket.delete({ where: { id: input.id } });

  return { ok: true };
}
