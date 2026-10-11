import Link from "next/link";
import { notFound } from "next/navigation";
import { CatalogControls, CatalogPagination } from "@/components/catalog-controls";
import { ProductCard } from "@/components/storefront";
import { DatabaseUnavailable } from "@/components/database-state";
import { getCatalogCategories, getCatalogCollection, getCatalogPage, toStorefrontProduct } from "@/lib/catalog";
import { isDatabaseUnavailable } from "@/lib/prisma";

type SearchFilters = { category?: string; min?: string; max?: string; availability?: string; customizable?: string; sort?: string; page?: string };
function normalizeFilters(params: SearchFilters) {
  const numeric = (value?: string) => value && /^\d{1,8}$/.test(value) ? value : undefined;
  return { category: params.category?.slice(0, 80), min: numeric(params.min), max: numeric(params.max), availability: params.availability === "in-stock" ? params.availability : undefined, customizable: params.customizable === "true" ? params.customizable : undefined, sort: ["price-asc", "price-desc", "best-selling", "newest"].includes(params.sort ?? "") ? params.sort : "newest", page: numeric(params.page), limit: "12" };
}

export const dynamic = "force-dynamic";
export default async function CollectionPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<SearchFilters> }) {
  const { slug } = await params;
  const filters = normalizeFilters(await searchParams);
  let collection: { name: string; slug: string; description: string | null } | null = null;
  let result: Awaited<ReturnType<typeof getCatalogPage>> | null = null;
  let categories: { slug: string; arabicName: string }[] = [];
  let unavailable = false;
  try { collection = await getCatalogCollection(slug); }
  catch (error) { if (isDatabaseUnavailable(error)) unavailable = true; else throw error; }
  if (unavailable) return <main className="catalog-page"><DatabaseUnavailable message="لا يمكن تحميل هذه المجموعة الآن" /></main>;
  if (!collection) notFound();
  try {
    [result, categories] = await Promise.all([
      getCatalogPage({ ...filters, collection: slug }),
      getCatalogCategories(),
    ]);
  } catch (error) { if (isDatabaseUnavailable(error)) unavailable = true; else throw error; }
  if (unavailable || !result) return <main className="catalog-page"><DatabaseUnavailable message="لا يمكن تحميل منتجات هذه المجموعة الآن" /></main>;
  const pageFilters = { ...filters, collection: slug, page: String(result.page) };
  return <main className="catalog-page">
      <nav className="catalog-breadcrumb" aria-label="مسار التنقل"><Link href="/">الرئيسية</Link><span>/</span><Link href="/collections">المجموعات</Link><span>/</span><span>{collection.name}</span></nav>
      <header className="catalog-page__heading"><div><p className="eyebrow">DAISY DESIGNS / مجموعة</p><h1>{collection.name}</h1>{collection.description && <p>{collection.description}</p>}</div><Link href="/search" className="catalog-search-link">ابحثي عن منتج</Link></header>
      <div className="catalog-result-line"><span>{result.total} منتج</span></div>
      <CatalogControls action={`/collections/${slug}`} filters={filters} fixedCollection={slug} categories={categories.map(item => ({ slug: item.slug, label: item.arabicName }))} />
      {result.items.length ? <div className="catalog-product-grid">{result.items.map(product => <ProductCard key={product.id} product={toStorefrontProduct(product)} />)}</div> : <section className="catalog-empty"><h2>هذه المجموعة لا تحتوي على منتجات حاليًا</h2><p>تصفحي بقية مجموعات دايزي.</p><Link href="/collections" className="daisy-button daisy-button--dark">كل المجموعات</Link></section>}
      <CatalogPagination path={`/collections/${slug}`} filters={pageFilters} page={result.page} totalPages={result.totalPages} />
    </main>;
}
