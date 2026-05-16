import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { maybeAdvanceNewTicketAfterQuotesAccepted } from '@/lib/maybeAdvanceNewTicketAfterQuotesAccepted';
import { reserveQuoteParts } from '@/lib/quoteReservations';


const SLA_START_MODE: 'CREATED' | 'IN_PROGRESS' = 'CREATED';

const HOLIDAYS_PL = [
  '01-01',
  '01-06',
  '05-01',
  '05-03',
  '08-15',
  '11-01',
  '11-11',
  '12-24',
  '12-25',
  '12-26',
];


const isBusinessDay = (date: Date) => {
  const day = date.getDay();
  if (day === 0 || day === 6) return false;

  const md = date.toISOString().slice(5, 10);
  return !HOLIDAYS_PL.includes(md);
};

const addBusinessTime = (startDate: Date, days = 0, hours = 0) => {
  const date = new Date(startDate);
  let remainingDays = days;
  let remainingHours = hours;

  while (remainingDays > 0 || remainingHours > 0) {
    date.setHours(date.getHours() + 1);

    if (!isBusinessDay(date)) continue;

    if (remainingHours > 0) {
      remainingHours--;
    } else if (remainingDays > 0 && date.getHours() === 12) {
      remainingDays--;
    }
  }

  return date;
};

const calculateEstimatedCompletion = (startDate: Date, slaType: string) => {
  switch (slaType) {
    case 'STANDARD':
      return addBusinessTime(startDate, 5, 0);
    case 'EXPRESS':
      return addBusinessTime(startDate, 0, 24);
    case 'VIP':
      return addBusinessTime(startDate, 0, 12);
    case 'WARRANTY':
      return addBusinessTime(startDate, 7, 0);
    default:
      return null;
  }
};

const formatPickupDate = (date: Date | null) => {
  if (!date) return null;

  return date.toLocaleDateString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });
};


const formatDisplayDate = (date: Date | null) => {
  if (!date) return null;

  return date.toLocaleString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Warsaw', 
  });
};

const formatCurrencyPLN = (value: number | null) => {
  if (value === null) return null;
  return value.toLocaleString('pl-PL', {
    style: 'currency',
    currency: 'PLN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const serializeQuote = (quote: any) => ({
  id: quote.id,
  number: quote.number,
  status: quote.status,
  publicAccess: quote.publicAccess,
  notes: quote.notes,
  totalNet: formatCurrencyPLN(Number(quote.totalNet ?? 0)),
  totalVat: formatCurrencyPLN(Number(quote.totalVat ?? 0)),
  totalGross: formatCurrencyPLN(Number(quote.totalGross ?? 0)),
  canAccept: quote.publicAccess === 'PUBLIC' && quote.status !== 'ACCEPTED',
  items: (quote.items ?? []).map((item: any) => ({
    id: item.id,
    description: item.description,
    quantity: item.quantity,
    unitPrice: formatCurrencyPLN(Number(item.unitPrice ?? 0)),
    total: formatCurrencyPLN(Number(item.total ?? 0)),
  })),
});

async function findPublicTicket(ticketNumber: string, contactInfo: string) {
  return prisma.ticket.findFirst({
    where: {
      number: ticketNumber,
      customer: {
        OR: [{ email: contactInfo }, { phone: contactInfo }],
      },
    },
    include: {
      device: true,
      events: { orderBy: { createdAt: 'asc' } },
      quotes: {
        where: {
          publicAccess: {
            in: ['PUBLIC', 'VIEW_ONLY'],
          },
        },
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
        },
      },
    },
  });
}

export async function POST(req: Request) {
  try {
    const { ticketNumber, contactInfo } = await req.json();

    if (!ticketNumber || !contactInfo) {
      return NextResponse.json({ error: 'Brak danych' }, { status: 400 });
    }

    const ticket = await findPublicTicket(ticketNumber, contactInfo);

    if (!ticket) {
      return NextResponse.json(
        { error: 'Nie znaleziono zgłoszenia' },
        { status: 404 }
      );
    }

    
    const statusLabels: Record<string, string> = {
      CREATED: 'Utworzenie zgłoszenia',
      IN_PROGRESS: 'Sprzęt w trakcie naprawy',
      DONE: 'Naprawa zakończona. Sprzęt gotowy do odbioru',
      WAITING: 'Oczekiwanie na części',
      CANCELED: 'Anulowanie zgłoszenia',
      NEW: 'Przyjęcie sprzętu na serwis',
    };

    const allowedStatuses = Object.keys(statusLabels);

    const extractStatusFromMessage = (message?: string) => {
      if (!message) return null;
      for (const s of allowedStatuses) {
        if (message.toUpperCase().includes(s)) return s;
      }
      return null;
    };

    const events = ticket.events
      .map(e => {
        let newStatus: string | null = null;

        if (e.type === 'STATUS') {
          newStatus = extractStatusFromMessage(e.message);
        }

        if (e.type === 'CREATED') {
          newStatus = 'CREATED';
        }

        if (!newStatus) return null;

        return {
          id: e.id,
          type: e.type,
          createdAt: formatDisplayDate(e.createdAt),
          newStatus,
          statusMessage: statusLabels[newStatus],
        };
      })
      .filter((event): event is NonNullable<typeof event> => event !== null);


    const slaDisabled = ['DONE', 'CANCELED'].includes(ticket.status);

    let slaStartDate: Date | null = null;

    if (!slaDisabled) {
      if (SLA_START_MODE === 'IN_PROGRESS') {
        const firstInProgress = events.find(
          e => e.newStatus === 'IN_PROGRESS'
        );
        slaStartDate = firstInProgress?.createdAt
          ? new Date(firstInProgress.createdAt)
          : ticket.createdAt;
      } else {
        slaStartDate = ticket.createdAt;
      }
    }

    const estimatedDate =
      slaStartDate && !slaDisabled
        ? calculateEstimatedCompletion(slaStartDate, ticket.slaType)
        : null;

    let estimatedCompletion: string | null = null;

    if (estimatedDate) {
      estimatedCompletion = `${formatPickupDate(estimatedDate)}`;

      if (ticket.status === 'WAITING') {
        estimatedCompletion +=
          ' oczekiwanie na części - czas realizacji może się wydłużyć';
      }
    }

    const quote = ticket.quotes[0];

    const estimatedCost = quote ? formatCurrencyPLN(Number(quote.totalGross)) : null;    

    return NextResponse.json({
      number: ticket.number,
      status: ticket.status,
      device: ticket.device?.name ?? null,
      createdAt: formatDisplayDate(ticket.createdAt), 
      events,
      estimatedCompletion,
      estimatedCost,
      quotes: ticket.quotes.map(serializeQuote),
      notes: ticket.description,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { ticketNumber, contactInfo, quoteId } = await req.json();

    if (!ticketNumber || !contactInfo || !quoteId) {
      return NextResponse.json({ error: 'Brak danych' }, { status: 400 });
    }

    const ticket = await findPublicTicket(ticketNumber, contactInfo);

    if (!ticket) {
      return NextResponse.json(
        { error: 'Nie znaleziono zgłoszenia' },
        { status: 404 }
      );
    }

    const quote = ticket.quotes.find((item) => item.id === quoteId);

    if (!quote || quote.publicAccess !== 'PUBLIC') {
      return NextResponse.json(
        { error: 'Ten kosztorys nie może zostać zaakceptowany publicznie' },
        { status: 403 }
      );
    }

    if (quote.status !== 'ACCEPTED') {
      await prisma.$transaction(async (tx) => {
        const updatedQuote = await tx.quote.update({
          where: { id: quote.id },
          data: { status: 'ACCEPTED' },
          include: {
            items: {
              select: {
                partId: true,
                quantity: true,
              },
            },
          },
        });

        await reserveQuoteParts(tx, ticket.id, updatedQuote.items);

        await tx.ticketEvent.create({
          data: {
            ticketId: ticket.id,
            type: 'NOTE',
            message: `Klient zaakceptował kosztorys ${quote.number} przez status publiczny.`,
            author: 'klient',
          },
        });

        await maybeAdvanceNewTicketAfterQuotesAccepted(tx, ticket.id);
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}
