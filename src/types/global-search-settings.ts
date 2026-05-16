/** Zgodne z `type` w wyniku `/api/search` */
export const GLOBAL_SEARCH_CATEGORY_KEYS = [
  'ticket',
  'customer',
  'device',
  'quote',
  'part',
] as const;

export type GlobalSearchCategoryKey = (typeof GLOBAL_SEARCH_CATEGORY_KEYS)[number];

export type GlobalSearchCategories = Record<GlobalSearchCategoryKey, boolean>;

/** Odpowiedź GET ustawień (UI + frontend) */
export type GlobalSearchSettingsDto = {
  globalSearchEnabled: boolean;
  categories: GlobalSearchCategories;
};

export function defaultGlobalSearchCategories(): GlobalSearchCategories {
  return GLOBAL_SEARCH_CATEGORY_KEYS.reduce((acc, key) => {
    acc[key] = true;
    return acc;
  }, {} as GlobalSearchCategories);
}

export function parseGlobalSearchCategoriesJson(raw: unknown): GlobalSearchCategories {
  const defs = defaultGlobalSearchCategories();
  if (raw === null || raw === undefined) return defs;
  if (typeof raw !== 'object') return defs;
  const o = raw as Record<string, unknown>;
  const out = { ...defs };
  for (const k of GLOBAL_SEARCH_CATEGORY_KEYS) {
    if (typeof o[k] === 'boolean') {
      out[k] = o[k];
    }
  }
  return out;
}
