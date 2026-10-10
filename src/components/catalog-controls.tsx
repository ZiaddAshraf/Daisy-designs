import Link from "next/link";

type Option = { slug: string; label: string };
type Filters = Record<string, string | undefined>;

export function CatalogControls({
  action = "/products",
  filters,
  categories = [],
  collections = [],
  fixedCategory,
  fixedCollection,
}: {
  action?: string;
  filters: Filters;
  categories?: Option[];
  collections?: Option[];
  fixedCategory?: string;
  fixedCollection?: string;
}) {
  const active = Boolean(filters.category || filters.collection || filters.min || filters.max || filters.availability || filters.customizable === "true" || (filters.sort && filters.sort !== "newest"));
  const resetQuery = new URLSearchParams();
  if (filters.q) resetQuery.set("q", filters.q);
  const resetHref = resetQuery.size ? `${action}?${resetQuery.toString()}` : action;
  return <div className="catalog-tools">
    <form action={action} className="catalog-filters">
      {filters.q && <input type="hidden" name="q" value={filters.q} />}
      {fixedCategory ? <input type="hidden" name="category" value={fixedCategory} /> : categories.length > 0 && <label><span>القسم</span><select name="category" defaultValue={filters.category ?? ""}><option value="">كل الأقسام</option>{categories.map(option => <option key={option.slug} value={option.slug}>{option.label}</option>)}</select></label>}
      {fixedCollection ? <input type="hidden" name="collection" value={fixedCollection} /> : collections.length > 0 && <label><span>المجموعة</span><select name="collection" defaultValue={filters.collection ?? ""}><option value="">كل المجموعات</option>{collections.map(option => <option key={option.slug} value={option.slug}>{option.label}</option>)}</select></label>}
      <label><span>من سعر</span><input name="min" type="number" min="0" inputMode="numeric" defaultValue={filters.min} placeholder="٠" /></label>
      <label><span>إلى سعر</span><input name="max" type="number" min="0" inputMode="numeric" defaultValue={filters.max} placeholder="—" /></label>
      <label><span>التوفر</span><select name="availability" defaultValue={filters.availability ?? ""}><option value="">الكل</option><option value="in-stock">متوفر</option></select></label>
      <label><span>الترتيب</span><select name="sort" defaultValue={filters.sort ?? "newest"}><option value="newest">الأحدث</option><option value="price-asc">السعر: الأقل أولًا</option><option value="price-desc">السعر: الأعلى أولًا</option><option value="best-selling">الأكثر مبيعًا</option></select></label>
      <label className="catalog-checkbox"><input type="checkbox" name="customizable" value="true" defaultChecked={filters.customizable === "true"} /><span>قابل للتخصيص</span></label>
      <button type="submit" className="catalog-apply">تطبيق</button>
      {active && <Link className="catalog-reset" href={resetHref}>مسح الفلاتر</Link>}
    </form>
  </div>;
}

export function CatalogPagination({ path, filters, page, totalPages }: { path: string; filters: Filters; page: number; totalPages: number }) {
  if (totalPages < 2) return null;
  const hrefFor = (nextPage: number) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) if (value && key !== "page") params.set(key, value);
    params.set("page", String(nextPage));
    return `${path}?${params.toString()}`;
  };
  return <nav className="catalog-pagination" aria-label="صفحات المنتجات">
    {page > 1 ? <Link href={hrefFor(page - 1)} rel="prev">السابق</Link> : <span aria-disabled="true">السابق</span>}
    <span aria-current="page">صفحة {page} من {totalPages}</span>
    {page < totalPages ? <Link href={hrefFor(page + 1)} rel="next">التالي</Link> : <span aria-disabled="true">التالي</span>}
  </nav>;
}
