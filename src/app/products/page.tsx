import Link from "next/link";
import { CatalogControls, CatalogPagination } from "@/components/catalog-controls";
import { DatabaseUnavailable } from "@/components/database-state";
import { ProductCard } from "@/components/storefront";
import { getCatalogCategories, getCatalogCollectionOptions, getCatalogPage, toStorefrontProduct } from "@/lib/catalog";
import { isDatabaseUnavailable } from "@/lib/prisma";

type SearchFilters = { category?: string; collection?: string; min?: string; max?: string; availability?: string; customizable?: string; sort?: string; page?: string; limit?: string };
const sortValues = new Set(["newest", "price-asc", "price-desc", "best-selling"]);
function normalizeFilters(params: SearchFilters): SearchFilters { const numeric = (value?: string) => value && /^\d{1,8}$/.test(value) ? value : undefined; return { category: params.category?.slice(0, 80), collection: params.collection?.slice(0, 80), min: numeric(params.min), max: numeric(params.max), availability: params.availability === "in-stock" ? params.availability : undefined, customizable: params.customizable === "true" ? params.customizable : undefined, sort: params.sort && sortValues.has(params.sort) ? params.sort : "newest", page: numeric(params.page), limit: "12" }; }

export const dynamic = "force-dynamic";
export default async function ProductsPage({ searchParams }: { searchParams: Promise<SearchFilters> }) {
  const filters = normalizeFilters(await searchParams);
  let result: Awaited<ReturnType<typeof getCatalogPage>> | null = null;
  let categories: { slug: string; arabicName: string }[] = [];
  let collections: { slug: string; name: string }[] = [];
  let unavailable = false;
  try {
    [result, categories, collections] = await Promise.all([
      getCatalogPage(filters),
      getCatalogCategories(),
      getCatalogCollectionOptions(),
    ]);
  } catch (error) {
    if (isDatabaseUnavailable(error)) unavailable = true;
    else throw error;
  }
  if (unavailable || !result) return <main className="catalog-page"><DatabaseUnavailable message="لا يمكن تحميل المنتجات الآن" /></main>;

  const activeFilters = Boolean(filters.category || filters.collection || filters.min || filters.max || filters.availability || filters.customizable);
  const pageFilters = { ...filters, page: String(result.page) };
  return <main className="catalog-page">
    <header className="catalog-page__heading"><div><p className="eyebrow">DAISY DESIGNS / المتجر</p><h1>منتجات صنعت لتشبههم</h1><p>تفاصيل يومهم، بلمسة تخصهم.</p></div><Link href="/search" className="catalog-search-link">ابحثي عن منتج</Link></header>
    <div className="catalog-result-line"><span>{result.total} منتج</span>{activeFilters && <span>نتائج مطابقة لاختياراتك</span>}</div>
    <CatalogControls filters={filters} categories={categories.map(item => ({ slug: item.slug, label: item.arabicName }))} collections={collections.map(item => ({ slug: item.slug, label: item.name }))} />
    {result.items.length ? <div className="catalog-product-grid">{result.items.map(product => <ProductCard key={product.id} product={toStorefrontProduct(product)} />)}</div> : <section className="catalog-empty"><h2>لم نجد منتجات بهذه المواصفات</h2><p>غيّري الفلاتر أو ابدئي من جديد.</p><Link href="/products" className="daisy-button daisy-button--dark">مسح الفلاتر</Link></section>}
    <CatalogPagination path="/products" filters={pageFilters} page={result.page} totalPages={result.totalPages} />
  </main>;
}
