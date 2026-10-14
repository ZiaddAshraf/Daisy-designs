import Link from "next/link";
import { X } from "lucide-react";
import { formatMessage, getTranslation, type TranslationKey } from "@/lib/i18n/messages";
import { formatLocaleNumber, type Locale } from "@/lib/locale";
import { formatPrice } from "@/lib/products";
import { getFilterRemovalHref } from "@/lib/catalog-filters";

type Option = { slug: string; label: string };
type Filters = Record<string, string | undefined>;

export function CatalogControls({
  action = "/products",
  filters,
  categories = [],
  collections = [],
  fixedCategory,
  fixedCollection,
  locale = "ar",
}: {
  action?: string;
  filters: Filters;
  categories?: Option[];
  collections?: Option[];
  fixedCategory?: string;
  fixedCollection?: string;
  locale?: Locale;
}) {
  const t = (key: TranslationKey) => getTranslation(locale, key);
  const active = Boolean(filters.category || filters.collection || filters.min || filters.max || filters.availability || filters.customizable === "true" || (filters.sort && filters.sort !== "newest"));
  const resetQuery = new URLSearchParams();
  if (filters.q) resetQuery.set("q", filters.q);
  const resetHref = resetQuery.size ? `${action}?${resetQuery.toString()}` : action;
  const selectedFilters: { key: string; label: string }[] = [];
  if (filters.category && !fixedCategory) selectedFilters.push({ key: "category", label: `${t("categoryFilter")}: ${categories.find(option => option.slug === filters.category)?.label ?? filters.category}` });
  if (filters.collection && !fixedCollection) selectedFilters.push({ key: "collection", label: `${t("collectionFilter")}: ${collections.find(option => option.slug === filters.collection)?.label ?? filters.collection}` });
  if (filters.min) selectedFilters.push({ key: "min", label: `${t("minPrice")}: ${formatPrice(Number(filters.min), locale)}` });
  if (filters.max) selectedFilters.push({ key: "max", label: `${t("maxPrice")}: ${formatPrice(Number(filters.max), locale)}` });
  if (filters.availability === "in-stock") selectedFilters.push({ key: "availability", label: t("inStock") });
  if (filters.customizable === "true") selectedFilters.push({ key: "customizable", label: t("customizable") });
  const sortLabels: Record<string, TranslationKey> = { newest: "newest", "price-asc": "priceLowToHigh", "price-desc": "priceHighToLow", "best-selling": "bestSelling" };
  if (filters.sort && filters.sort !== "newest" && sortLabels[filters.sort]) selectedFilters.push({ key: "sort", label: `${t("sortOrder")}: ${t(sortLabels[filters.sort])}` });
  return <div className="catalog-tools" data-scroll-reveal suppressHydrationWarning>
    <form action={action} className="catalog-filters">
      {filters.q && <input type="hidden" name="q" value={filters.q} />}
      {fixedCategory ? <input type="hidden" name="category" value={fixedCategory} /> : categories.length > 0 && <label><span>{t("categoryFilter")}</span><select key={filters.category ?? ""} name="category" defaultValue={filters.category ?? ""}><option value="">{t("allCategories")}</option>{categories.map(option => <option key={option.slug} value={option.slug}>{option.label}</option>)}</select></label>}
      {fixedCollection ? <input type="hidden" name="collection" value={fixedCollection} /> : collections.length > 0 && <label><span>{t("collectionFilter")}</span><select key={filters.collection ?? ""} name="collection" defaultValue={filters.collection ?? ""}><option value="">{t("allCollections")}</option>{collections.map(option => <option key={option.slug} value={option.slug}>{option.label}</option>)}</select></label>}
      <label><span>{t("minPrice")}</span><input key={filters.min ?? ""} name="min" type="number" min="0" inputMode="numeric" defaultValue={filters.min} placeholder={locale === "ar" ? "٠" : "0"} /></label>
      <label><span>{t("maxPrice")}</span><input key={filters.max ?? ""} name="max" type="number" min="0" inputMode="numeric" defaultValue={filters.max} placeholder="—" /></label>
      <label><span>{t("availability")}</span><select key={filters.availability ?? ""} name="availability" defaultValue={filters.availability ?? ""}><option value="">{t("allOption")}</option><option value="in-stock">{t("inStock")}</option></select></label>
      <label><span>{t("sortOrder")}</span><select key={filters.sort ?? "newest"} name="sort" defaultValue={filters.sort ?? "newest"}><option value="newest">{t("newest")}</option><option value="price-asc">{t("priceLowToHigh")}</option><option value="price-desc">{t("priceHighToLow")}</option><option value="best-selling">{t("bestSelling")}</option></select></label>
      <label className="catalog-checkbox"><input key={filters.customizable ?? ""} type="checkbox" name="customizable" value="true" defaultChecked={filters.customizable === "true"} /><span>{t("customizable")}</span></label>
      <button type="submit" className="catalog-apply">{t("applyFilters")}</button>
    </form>
    {active && <div className="catalog-active-filters" aria-label={t("activeFilters")}>
      <span className="catalog-active-filters__heading">{t("activeFilters")}</span>
      {selectedFilters.length > 0 && <ul>{selectedFilters.map(filter => <li key={filter.key}><Link className="catalog-filter-chip" href={getFilterRemovalHref(action, filters, filter.key)} aria-label={`${t("removeFilter")}: ${filter.label}`}><span>{filter.label}</span><X size={13} aria-hidden="true" /></Link></li>)}</ul>}
      <Link className="catalog-reset" href={resetHref}>{t("clearFilters")}</Link>
    </div>}
  </div>;
}

export function CatalogPagination({ path, filters, page, totalPages, locale = "ar" }: { path: string; filters: Filters; page: number; totalPages: number; locale?: Locale }) {
  if (totalPages < 2) return null;
  const hrefFor = (nextPage: number) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) if (value && key !== "page") params.set(key, value);
    params.set("page", String(nextPage));
    return `${path}?${params.toString()}`;
  };
  const t = (key: TranslationKey) => getTranslation(locale, key);
  const pageLabel = formatMessage(t("pageOf"), { page: formatLocaleNumber(locale, page), total: formatLocaleNumber(locale, totalPages) });
  return <nav className="catalog-pagination" aria-label={t("paginationLabel")} data-scroll-reveal suppressHydrationWarning>
    {page > 1 ? <Link href={hrefFor(page - 1)} rel="prev">{t("previousPage")}</Link> : <span aria-disabled="true">{t("previousPage")}</span>}
    <span aria-current="page">{pageLabel}</span>
    {page < totalPages ? <Link href={hrefFor(page + 1)} rel="next">{t("nextPage")}</Link> : <span aria-disabled="true">{t("nextPage")}</span>}
  </nav>;
}
