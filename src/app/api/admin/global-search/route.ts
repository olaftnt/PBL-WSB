import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getGlobalSearchSettingsResolved } from '@/lib/globalSearchSettings';
import {
  GLOBAL_SEARCH_CATEGORY_KEYS,
  defaultGlobalSearchCategories,
  type GlobalSearchCategories,
} from '@/types/global-search-settings';

const SINGLETON_ID = 'singleton';

export async function GET() {
  const resolved = await getGlobalSearchSettingsResolved();
  return NextResponse.json({
    globalSearchEnabled: resolved.globalSearchEnabled,
    categories: resolved.categories,
  });
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

  if (typeof payload.globalSearchEnabled !== 'boolean') {
    return NextResponse.json({ error: 'globalSearchEnabled (boolean) jest wymagane' }, { status: 400 });
  }

  const rawCats = payload.categories;
  if (!rawCats || typeof rawCats !== 'object' || rawCats === null) {
    return NextResponse.json({ error: 'categories (obiekt) jest wymagane' }, { status: 400 });
  }

  const categories: GlobalSearchCategories = { ...defaultGlobalSearchCategories() };
  const source = rawCats as Record<string, unknown>;
  for (const key of GLOBAL_SEARCH_CATEGORY_KEYS) {
    if (typeof source[key] !== 'boolean') {
      return NextResponse.json({ error: `categories.${key} musi być boolean` }, { status: 400 });
    }
    categories[key] = source[key] as boolean;
  }

  await prisma.appSettings.upsert({
    where: { id: SINGLETON_ID },
    create: {
      id: SINGLETON_ID,
      globalSearchEnabled: payload.globalSearchEnabled,
      globalSearchCategories: categories,
    },
    update: {
      globalSearchEnabled: payload.globalSearchEnabled,
      globalSearchCategories: categories,
    },
  });

  const resolved = await getGlobalSearchSettingsResolved();

  return NextResponse.json({
    globalSearchEnabled: resolved.globalSearchEnabled,
    categories: resolved.categories,
  });
}
