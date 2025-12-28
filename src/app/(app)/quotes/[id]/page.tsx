import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { QuoteDetail } from '@/components/Quotes/QuoteDetail';
import type { PartOption, TicketOption, CustomerOption } from '@/types/quote';
import type { QuoteStatus } from '@prisma/client';

export default async function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const parts = await prisma.part.findMany({
    orderBy: { name: 'asc' },
  });

  const tickets = await prisma.ticket.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, number: true, customerId: true, customer: { select: { name: true } } },
    take: 100,
  });

  const customers = await prisma.customer.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  });

  const partOptions: PartOption[] = parts.map((p) => ({
    id: p.id,
    sku: p.sku,
    name: p.name,
    price: Number(p.price),
    quantity: p.quantity,
    reserved: p.reserved,
  }));

  const ticketOptions: TicketOption[] = tickets.map((t) => ({
    id: t.id,
    number: t.number,
    customerId: t.customerId,
    customerName: t.customer?.name ?? null,
  }));
  const customerOptions: CustomerOption[] = customers.map((c) => ({ id: c.id, name: c.name }));

  if (id === 'new') {
    return (
      <QuoteDetail
        initialQuote={{
          id: 'new',
          number: 'NEW',
          status: 'DRAFT' as QuoteStatus,
          ticketId: '',
          ticketNumber: '',
          customerId: '',
          customerName: '',
          deviceId: null,
          deviceName: null,
          laborHours: 0,
          laborRate: 0,
          vatRate: 23,
          notes: '',
          items: [],
          totals: { labor: 0, parts: 0, net: 0, vat: 0, gross: 0 },
        }}
        parts={partOptions}
        tickets={ticketOptions}
        customers={customerOptions}
      />
    );
  }

  const quote = await prisma.quote.findUnique({
    where: { id },
    include: {
      ticket: true,
      customer: true,
      device: true,
      items: true,
    },
  });

  if (!quote) return notFound();

  const laborHours = Number(quote.laborHours ?? 0);
  const laborRate = Number(quote.laborRate ?? 0);
  const vatRate = Number(quote.vatRate ?? 0);
  const partsTotal = quote.items.reduce((acc, it) => acc + it.quantity * Number(it.unitPrice ?? 0), 0);

  const serializedQuote = {
    id: quote.id,
    number: quote.number,
    status: quote.status,
    ticketId: quote.ticketId ?? '',
    ticketNumber: quote.ticket.number,
    customerId: quote.customerId ?? '',
    customerName: quote.customer.name ?? '',
    deviceId: quote.deviceId ?? null,
    deviceName: quote.device?.name ?? quote.device?.model ?? null,
    laborHours,
    laborRate,
    vatRate,
    notes: quote.notes ?? '',
    items: quote.items.map((it) => ({
      id: it.id,
      partId: it.partId,
      description: it.description,
      quantity: it.quantity,
      unitPrice: Number(it.unitPrice ?? 0),
    })),
    totals: {
      labor: laborHours * laborRate,
      parts: partsTotal,
      net: Number(quote.totalNet ?? 0),
      vat: Number(quote.totalVat ?? 0),
      gross: Number(quote.totalGross ?? 0),
    },
  };

  return (
    <QuoteDetail
      initialQuote={serializedQuote}
      parts={partOptions}
      tickets={ticketOptions}
      customers={customerOptions}
    />
  );
}
