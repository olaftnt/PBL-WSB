import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type SearchResult = {
  id: string;
  type: 'ticket' | 'customer' | 'device' | 'quote' | 'part';
  title: string;
  subtitle: string;
  href: string;
};

type ScoredSearchResult = SearchResult & {
  score: number;
};

const normalize = (value: string | null | undefined) =>
  String(value ?? '').trim().toLowerCase();

const scoreTextMatch = (
  value: string | null | undefined,
  query: string,
  exactScore: number,
  startsWithScore: number,
  containsScore: number,
) => {
  const normalizedValue = normalize(value);

  if (!normalizedValue) return 0;
  if (normalizedValue === query) return exactScore;
  if (normalizedValue.startsWith(query)) return startsWithScore;
  if (normalizedValue.includes(query)) return containsScore;

  return 0;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q')?.trim();

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const normalizedQuery = normalize(query);
  const contains = {
    contains: query,
    mode: 'insensitive' as const,
  };

  const [tickets, customers, devices, quotes, parts] = await Promise.all([
    prisma.ticket.findMany({
      where: {
        OR: [
          { number: contains },
          { title: contains },
          { description: contains },
          { customer: { name: contains } },
          { customer: { email: contains } },
          { customer: { phone: contains } },
          { device: { name: contains } },
          { device: { model: contains } },
          { device: { serial: contains } },
        ],
      },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        number: true,
        title: true,
        customer: { select: { name: true, phone: true } },
        device: { select: { name: true, model: true, serial: true } },
      },
      take: 5,
    }),
    prisma.customer.findMany({
      where: {
        OR: [{ name: contains }, { email: contains }, { phone: contains }],
      },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
      take: 5,
    }),
    prisma.device.findMany({
      where: {
        OR: [
          { name: contains },
          { model: contains },
          { serial: contains },
          { notes: contains },
          { customer: { name: contains } },
        ],
      },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        model: true,
        serial: true,
        customer: { select: { name: true } },
      },
      take: 5,
    }),
    prisma.quote.findMany({
      where: {
        OR: [
          { number: contains },
          { notes: contains },
          { ticket: { number: contains } },
          { customer: { name: contains } },
          { device: { name: contains } },
          { device: { model: contains } },
          { device: { serial: contains } },
        ],
      },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        number: true,
        status: true,
        totalGross: true,
        ticket: { select: { number: true } },
        customer: { select: { name: true } },
      },
      take: 5,
    }),
    prisma.part.findMany({
      where: {
        OR: [{ name: contains }, { sku: contains }],
      },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        sku: true,
        name: true,
        quantity: true,
        reserved: true,
        price: true,
      },
      take: 5,
    }),
  ]);

  const results: SearchResult[] = [
    ...tickets.map((ticket): ScoredSearchResult => ({
      id: ticket.id,
      type: 'ticket' as const,
      title: `${ticket.number} · ${ticket.title}`,
      subtitle: [
        ticket.customer?.name,
        ticket.customer?.phone,
        ticket.device?.name ?? ticket.device?.model,
        ticket.device?.serial ? `SN: ${ticket.device.serial}` : null,
      ]
        .filter(Boolean)
        .join(' · '),
      href: `/tickets/${ticket.id}`,
      score: Math.max(
        scoreTextMatch(ticket.number, normalizedQuery, 850, 760, 650),
        scoreTextMatch(ticket.title, normalizedQuery, 620, 520, 420),
        scoreTextMatch(ticket.customer?.name, normalizedQuery, 500, 420, 320),
        scoreTextMatch(ticket.customer?.phone, normalizedQuery, 560, 500, 450),
        scoreTextMatch(ticket.device?.serial, normalizedQuery, 700, 620, 520),
        scoreTextMatch(ticket.device?.name, normalizedQuery, 480, 380, 280),
        scoreTextMatch(ticket.device?.model, normalizedQuery, 450, 350, 250),
      ),
    })),
    ...customers.map((customer): ScoredSearchResult => ({
      id: customer.id,
      type: 'customer' as const,
      title: customer.name,
      subtitle: [customer.phone, customer.email].filter(Boolean).join(' · '),
      href: `/customers/${customer.id}`,
      score: Math.max(
        scoreTextMatch(customer.name, normalizedQuery, 1200, 1050, 900),
        scoreTextMatch(customer.phone, normalizedQuery, 980, 920, 860),
        scoreTextMatch(customer.email, normalizedQuery, 950, 880, 820),
      ),
    })),
    ...devices.map((device): ScoredSearchResult => ({
      id: device.id,
      type: 'device' as const,
      title: device.name,
      subtitle: [
        device.model,
        device.serial ? `SN: ${device.serial}` : null,
        device.customer?.name,
      ]
        .filter(Boolean)
        .join(' · '),
      href: `/devices/${device.id}`,
      score: Math.max(
        scoreTextMatch(device.serial, normalizedQuery, 1100, 980, 870),
        scoreTextMatch(device.name, normalizedQuery, 900, 790, 680),
        scoreTextMatch(device.model, normalizedQuery, 840, 720, 610),
        scoreTextMatch(device.customer?.name, normalizedQuery, 520, 430, 330),
      ),
    })),
    ...quotes.map((quote): ScoredSearchResult => ({
      id: quote.id,
      type: 'quote' as const,
      title: `Kosztorys ${quote.number}`,
      subtitle: [
        quote.customer?.name,
        quote.ticket?.number,
        quote.status,
        `${Number(quote.totalGross ?? 0).toFixed(2)} zł`,
      ]
        .filter(Boolean)
        .join(' · '),
      href: `/quotes/${quote.id}`,
      score: Math.max(
        scoreTextMatch(quote.number, normalizedQuery, 860, 760, 650),
        scoreTextMatch(quote.ticket?.number, normalizedQuery, 620, 540, 440),
        scoreTextMatch(quote.customer?.name, normalizedQuery, 480, 390, 290),
      ),
    })),
    ...parts.map((part): ScoredSearchResult => ({
      id: part.id,
      type: 'part' as const,
      title: `${part.sku} · ${part.name}`,
      subtitle: [
        `Dostępne: ${part.quantity - part.reserved} szt.`,
        `${Number(part.price ?? 0).toFixed(2)} zł`,
      ].join(' · '),
      href: '/inventory',
      score: Math.max(
        scoreTextMatch(part.sku, normalizedQuery, 420, 350, 260),
        scoreTextMatch(part.name, normalizedQuery, 360, 290, 200),
      ),
    })),
  ]
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map(({ score: _score, ...result }) => result);

  return NextResponse.json({ results });
}
