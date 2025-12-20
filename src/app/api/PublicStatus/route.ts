import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { ticketNumber, contactInfo } = await req.json();

    if (!ticketNumber || !contactInfo) {
      return NextResponse.json({ error: 'Brak danych' }, { status: 400 });
    }

    const ticket = await prisma.ticket.findFirst({
      where: {
        number: ticketNumber,
        customer: {
          OR: [{ email: contactInfo }, { phone: contactInfo }],
        },
      },
      include: {
        device: true,
        events: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Nie znaleziono zgłoszenia' }, { status: 404 });
    }

    const statusLabels: Record<string, string> = {
      CREATED: 'Utworzenie zgłoszenia',
      IN_PROGRESS: 'Sprzęt w trakcie naprawy',
      DONE: 'Naprawa zakończona. Sprzęt gotowy do odbioru',
      WAITING: 'Oczekiwanie na części, sprzęt w trakcie naprawy',
      CANCELED: 'Anulowanie zgłoszenia',
      NEW: 'Przyjęcie sprzętu na serwis',
    };

    const allowedStatuses = ['NEW', 'CANCELED', 'CREATED', 'IN_PROGRESS', 'WAITING', 'DONE'];

    const extractStatusFromMessage = (message?: string) => {
      if (!message) return null;
      const match = message.match(/status na\s+([A-Z_]+)/i);
      return match ? match[1].toUpperCase() : null;
    };

    const events = ticket.events
      .map(e => {
        let newStatus: string | null = null;
        let statusMessage: string | null = null;

        if (e.type === 'STATUS') {
          // Wyciągamy status z message
          newStatus = extractStatusFromMessage(e.message);

          // Jeśli extractStatusFromMessage nie zadziałał, szukamy frazy w wiadomości
          if (!newStatus && e.message) {
            for (const s of allowedStatuses) {
              if (e.message.toUpperCase().includes(s)) {
                newStatus = s;
                break;
              }
            }
          }

          if (newStatus) {
            statusMessage = statusLabels[newStatus] ?? `Zmieniono status na ${newStatus}`;
          } else {
            statusMessage = 'Zmiana statusu';
          }
        }

        if (e.type === 'CREATED') {
          newStatus = 'CREATED';
          statusMessage = statusLabels.CREATED;
        }

        // Filtrujemy tylko dopuszczalne statusy
        if (!newStatus || !allowedStatuses.includes(newStatus)) return null;

        return {
          id: e.id,
          type: e.type,
          createdAt: e.createdAt,
          newStatus,
          statusMessage,
        };
      })
      .filter(Boolean);

    return NextResponse.json({
      number: ticket.number,
      status: ticket.status,
      device: ticket.device?.name ?? null,
      events,
      estimatedCompletion: 'Jak będzie gotowy przewidywany czas oczekiwania',
      estimatedCost: 'Jak będzie gotowy kosztorys',
      notes: ticket.description,
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}
