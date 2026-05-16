import { prisma } from '@/lib/prisma';
import { QuotePublicAccess } from '@prisma/client';
import {
  defaultGlobalSearchCategories,
  parseGlobalSearchCategoriesJson,
  type GlobalSearchCategories,
  type GlobalSearchCategoryKey,
} from '@/types/global-search-settings';

const SINGLETON_ID = 'singleton';

async function ensureAppSettingsSingleton() {
  let row = await prisma.appSettings.findUnique({ where: { id: SINGLETON_ID } });
  if (!row) {
    row = await prisma.appSettings.create({
      data: {
        id: SINGLETON_ID,
        globalSearchEnabled: true,
        globalSearchCategories: defaultGlobalSearchCategories(),
        defaultQuotePublicAccess: QuotePublicAccess.HIDDEN,
        autoAdvanceNewTicketWhenAllQuotesAccepted: false,
      },
    });
  }
  return row;
}

export async function getGlobalSearchSettingsResolved(): Promise<{
  globalSearchEnabled: boolean;
  categories: GlobalSearchCategories;
}> {
  const row = await ensureAppSettingsSingleton();
  const categories = parseGlobalSearchCategoriesJson(row.globalSearchCategories);

  return {
    globalSearchEnabled: row.globalSearchEnabled,
    categories,
  };
}

/** Domyślna widoczność dla nowego kosztorysu (status publiczny). */
export async function getDefaultQuotePublicAccess(): Promise<QuotePublicAccess> {
  const row = await ensureAppSettingsSingleton();
  return row.defaultQuotePublicAccess;
}

export async function getAutoAdvanceNewTicketWhenAllQuotesAccepted(): Promise<boolean> {
  const row = await ensureAppSettingsSingleton();
  return row.autoAdvanceNewTicketWhenAllQuotesAccepted;
}

/** Czy uwzględniać typ przy zapytaniu Global Search */
export function categoryIncluded(
  cats: GlobalSearchCategories,
  key: GlobalSearchCategoryKey,
): boolean {
  return cats[key] !== false;
}
