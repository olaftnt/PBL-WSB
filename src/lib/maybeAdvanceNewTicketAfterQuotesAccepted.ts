import {
  QuoteStatus,
  TicketEventType,
  TicketStatus,
  type Prisma,
} from '@prisma/client';

const SINGLETON_ID = 'singleton';

/**
 * Jeśli w ustawieniach aplikacji włączono opcję: zlecenie w statusie Nowe
 * przechodzi na W trakcie, gdy każdy kosztorys tego zlecenia ma status ACCEPTED.
 * Wywołuj wyłącznie po realnej lub potencjalnej akceptacji kosztorysu (w tej samej transakcji).
 */
export async function maybeAdvanceNewTicketAfterQuotesAccepted(
  tx: Prisma.TransactionClient,
  ticketId: string,
) {
  const settings = await tx.appSettings.findUnique({
    where: { id: SINGLETON_ID },
    select: { autoAdvanceNewTicketWhenAllQuotesAccepted: true },
  });
  if (!settings?.autoAdvanceNewTicketWhenAllQuotesAccepted) {
    return;
  }

  const ticket = await tx.ticket.findUnique({
    where: { id: ticketId },
    select: {
      status: true,
      quotes: { select: { status: true } },
    },
  });

  if (!ticket || ticket.status !== TicketStatus.NEW) return;
  if (ticket.quotes.length === 0) return;
  if (!ticket.quotes.every((q) => q.status === QuoteStatus.ACCEPTED)) {
    return;
  }

  await tx.ticket.update({
    where: { id: ticketId },
    data: { status: TicketStatus.IN_PROGRESS },
  });

  await tx.ticketEvent.create({
    data: {
      ticketId,
      type: TicketEventType.STATUS,
      message:
        'Automatycznie zmieniono status zlecenia z „Nowe” na „W trakcie” po akceptacji wszystkich kosztorysów.',
      author: 'system',
    },
  });
}
