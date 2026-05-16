import { prisma } from '@/lib/prisma';
import {
  defaultGlobalSearchCategories,
  parseGlobalSearchCategoriesJson,
  type GlobalSearchCategories,
  type GlobalSearchCategoryKey,
} from '@/types/global-search-settings';

const SINGLETON_ID = 'singleton';

/** Pojedynczy wiersz ustawień aplikacji; tworzy domyślny przy pierwszym odczycie. */
export async function getGlobalSearchSettingsResolved(): Promise<{
  globalSearchEnabled: boolean;
  categories: GlobalSearchCategories;
}> {
  let row = await prisma.appSettings.findUnique({ where: { id: SINGLETON_ID } });

  if (!row) {
    row = await prisma.appSettings.create({
      data: {
        id: SINGLETON_ID,
        globalSearchEnabled: true,
        globalSearchCategories: defaultGlobalSearchCategories(),
      },
    });
  }

  const categories = parseGlobalSearchCategoriesJson(row.globalSearchCategories);

  return {
    globalSearchEnabled: row.globalSearchEnabled,
    categories,
  };
}

/** Czy uwzględniać typ przy zapytaniu Global Search */
export function categoryIncluded(
  cats: GlobalSearchCategories,
  key: GlobalSearchCategoryKey,
): boolean {
  return cats[key] !== false;
}
