import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { QuotePublicAccess } from '@prisma/client';
import {
  getAutoAdvanceNewTicketWhenAllQuotesAccepted,
  getDefaultQuotePublicAccess,
} from '@/lib/globalSearchSettings';
import { defaultGlobalSearchCategories } from '@/types/global-search-settings';

const SINGLETON_ID = 'singleton';

function dbHelpMessage() {
  return 'Błąd bazy danych. Zastosuj migracje (np. npx prisma migrate deploy) i zrestartuj serwer deweloperski.';
}

export async function GET() {
  try {
    const defaultQuotePublicAccess = await getDefaultQuotePublicAccess();
    const autoAdvanceNewTicketWhenAllQuotesAccepted =
      await getAutoAdvanceNewTicketWhenAllQuotesAccepted();

    return NextResponse.json({
      defaultQuotePublicAccess,
      autoAdvanceNewTicketWhenAllQuotesAccepted,
    });
  } catch (e) {
    console.error('[GET /api/admin/quote-settings]', e);
    return NextResponse.json({ error: dbHelpMessage() }, { status: 503 });
  }
}

export async function PUT(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Niepoprawny JSON' }, { status: 400 });
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Pusty obiekt' }, { status: 400 });
  }

  const payload = body as Record<string, unknown>;

  try {
    const existing = await prisma.appSettings.findUnique({
      where: { id: SINGLETON_ID },
      select: {
        defaultQuotePublicAccess: true,
        autoAdvanceNewTicketWhenAllQuotesAccepted: true,
      },
    });

    let defaultQuotePublicAccess: QuotePublicAccess =
      existing?.defaultQuotePublicAccess ?? QuotePublicAccess.HIDDEN;

    if ('defaultQuotePublicAccess' in payload) {
      const raw = payload.defaultQuotePublicAccess;
      if (typeof raw !== 'string') {
        return NextResponse.json(
          { error: 'defaultQuotePublicAccess musi być tekstem (enum)' },
          { status: 400 },
        );
      }
      if (raw !== 'PUBLIC' && raw !== 'VIEW_ONLY' && raw !== 'HIDDEN') {
        return NextResponse.json({ error: 'Nieznana wartość widoczności kosztorysu' }, { status: 400 });
      }
      defaultQuotePublicAccess = raw as QuotePublicAccess;
    }

    let autoAdvanceNewTicketWhenAllQuotesAccepted =
      existing?.autoAdvanceNewTicketWhenAllQuotesAccepted ?? false;

    if ('autoAdvanceNewTicketWhenAllQuotesAccepted' in payload) {
      const raw = payload.autoAdvanceNewTicketWhenAllQuotesAccepted;
      if (typeof raw !== 'boolean') {
        return NextResponse.json(
          { error: 'autoAdvanceNewTicketWhenAllQuotesAccepted musi być wartością true/false' },
          { status: 400 },
        );
      }
      autoAdvanceNewTicketWhenAllQuotesAccepted = raw;
    }

    await prisma.appSettings.upsert({
      where: { id: SINGLETON_ID },
      create: {
        id: SINGLETON_ID,
        globalSearchEnabled: true,
        globalSearchCategories: defaultGlobalSearchCategories(),
        defaultQuotePublicAccess,
        autoAdvanceNewTicketWhenAllQuotesAccepted,
      },
      update: {
        defaultQuotePublicAccess,
        autoAdvanceNewTicketWhenAllQuotesAccepted,
      },
    });

    const nextAccess = await getDefaultQuotePublicAccess();
    const nextAuto = await getAutoAdvanceNewTicketWhenAllQuotesAccepted();

    return NextResponse.json({
      defaultQuotePublicAccess: nextAccess,
      autoAdvanceNewTicketWhenAllQuotesAccepted: nextAuto,
    });
  } catch (e) {
    console.error('[PUT /api/admin/quote-settings]', e);
    return NextResponse.json({ error: dbHelpMessage() }, { status: 503 });
  }
}
