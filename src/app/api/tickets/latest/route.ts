import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const latestTicket = await prisma.ticket.findFirst({
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        number: true,
        title: true,
        createdAt: true,
        status: true,
        priority: true,
      },
    });

    if (!latestTicket) {
      return NextResponse.json({
        latestTicketId: null,
        latestTicketNumber: null,
        latestTicketTitle: null,
        latestTicketCreatedAt: null,
        latestTicketStatus: null,
        latestTicketPriority: null,
      });
    }

    return NextResponse.json({
      latestTicketId: latestTicket.id,
      latestTicketNumber: latestTicket.number,
      latestTicketTitle: latestTicket.title,
      latestTicketCreatedAt: latestTicket.createdAt.toISOString(),
      latestTicketStatus: latestTicket.status,
      latestTicketPriority: latestTicket.priority,
    });
  } catch (error) {
    console.error('Błąd pobierania ostatniego zgłoszenia:', error);

    return NextResponse.json(
      {
        error: 'Nie udało się pobrać ostatniego zgłoszenia',
      },
      {
        status: 500,
      },
    );
  }
}