export type CatalogFilterState = Record<string, string | undefined>;

/** Build a same-route URL that removes one selected filter and resets pagination. */
export function getFilterRemovalHref(path: string, filters: CatalogFilterState, removedKey: string) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value && key !== removedKey && key !== "page" && key !== "limit") params.set(key, value);
  }
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}
