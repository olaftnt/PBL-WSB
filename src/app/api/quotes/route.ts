import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type QuoteItemInput = {
  partId?: string | null;
  name: string;
  sku?: string | null;
  quantity: number;
  price: number;
};

type QuoteInput = {
  ticketId?: string | null;
  customerName: string;
  customerEmail?: string | null;
  customerPhone?: string | null;
  laborHours: number;
  laborRate: number;
  vatRate: number;
  notes?: string | null;
  status?: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED';
  items: QuoteItemInput[];
};

const computeTotals = (payload: QuoteInput) => {
  const labor = payload.laborHours * payload.laborRate;
  const parts = payload.items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0,
  );
  const net = labor + parts;
  const vat = net * (payload.vatRate / 100);
  const gross = net + vat;
  return { labor, parts, net, vat, gross };
};

const mapQuote = (quote: any) => {
  const laborHours = Number(quote.laborHours ?? 0);
  const laborRate = Number(quote.laborRate ?? 0);
  const vatRate = Number(quote.vatRate ?? 0);
  const items = (quote.items ?? []).map((i: any) => ({
    partId: i.partId,
    name: i.name,
    sku: i.sku,
    quantity: Number(i.quantity ?? 0),
    price: Number(i.price ?? 0),
  }));

  const { labor, parts, net, vat, gross } = computeTotals({
    customerName: quote.customerName,
    customerEmail: quote.customerEmail,
    customerPhone: quote.customerPhone,
    ticketId: quote.ticketId,
    laborHours,
    laborRate,
    vatRate,
    notes: quote.notes,
    status: quote.status,
    items,
  });

  return {
    id: quote.id,
    number: quote.number,
    status: quote.status,
    ticketNumber: quote.ticket?.number ?? null,
    customerName: quote.customerName,
    totals: { labor, parts, net, vat, gross },
    createdAt: quote.createdAt?.toISOString?.() ?? quote.createdAt,
    items,
  };
};

export async function GET() {
  try {
    const quotes = await prisma.quote.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        ticket: { select: { number: true } },
      },
      take: 50,
    });

    return NextResponse.json(quotes.map(mapQuote));
  } catch (error) {
    console.error('Failed to list quotes', error);
    return NextResponse.json(
      { error: 'Nie udało się pobrać kosztorysów' },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as QuoteInput;

    if (!payload.customerName) {
      return NextResponse.json({ error: 'Brak nazwy klienta' }, { status: 400 });
    }

    const safeItems = payload.items?.length ? payload.items : [];
    const year = new Date().getFullYear();
    const number = `QT-${year}-${Date.now().toString().slice(-6)}`;

    const created = await prisma.quote.create({
      data: {
        number,
        ticketId: payload.ticketId ?? null,
        customerName: payload.customerName,
        customerEmail: payload.customerEmail ?? null,
        customerPhone: payload.customerPhone ?? null,
        status: payload.status ?? 'DRAFT',
        laborHours: payload.laborHours ?? 0,
        laborRate: payload.laborRate ?? 0,
        vatRate: payload.vatRate ?? 23,
        notes: payload.notes ?? null,
        items: {
          create: safeItems.map((item) => ({
            partId: item.partId ?? null,
            name: item.name,
            sku: item.sku ?? null,
            quantity: Number(item.quantity ?? 0),
            price: Number(item.price ?? 0),
          })),
        },
      },
      include: {
        items: true,
        ticket: { select: { number: true } },
      },
    });

    return NextResponse.json(mapQuote(created), { status: 201 });
  } catch (error) {
    console.error('Failed to create quote', error);
    return NextResponse.json(
      { error: 'Nie udało się utworzyć kosztorysu' },
      { status: 500 },
    );
  }
}

