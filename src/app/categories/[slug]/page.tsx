import Link from "next/link";
import { notFound } from "next/navigation";
import { CatalogControls, CatalogPagination } from "@/components/catalog-controls";
import { ProductCard } from "@/components/storefront";
import { DatabaseUnavailable } from "@/components/database-state";
import { getCatalogCategory, getCatalogCollectionOptions, getCatalogPage, toStorefrontProduct } from "@/lib/catalog";
import { isDatabaseUnavailable } from "@/lib/prisma";

type SearchFilters = { collection?: string; min?: string; max?: string; availability?: string; customizable?: string; sort?: string; page?: string };
function normalizeFilters(params: SearchFilters) { const numeric = (value?: string) => value && /^\d{1,8}$/.test(value) ? value : undefined; return { collection: params.collection?.slice(0, 80), min: numeric(params.min), max: numeric(params.max), availability: params.availability === "in-stock" ? params.availability : undefined, customizable: params.customizable === "true" ? params.customizable : undefined, sort: ["price-asc", "price-desc", "best-selling", "newest"].includes(params.sort ?? "") ? params.sort : "newest", page: numeric(params.page), limit: "12" }; }
type CategoryData = { id: string; slug: string; name: string; arabicName: string; description: string | null };

export const dynamic = "force-dynamic";
export default async function CategoryPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<SearchFilters> }) {
  const { slug } = await params;
  const filters = normalizeFilters(await searchParams);
  let category: CategoryData | null = null;
  let result: Awaited<ReturnType<typeof getCatalogPage>> | null = null;
  let collections: { slug: string; name: string }[] = [];
  let unavailable = false;
  try { category = await getCatalogCategory(slug); }
  catch (error) { if (isDatabaseUnavailable(error)) unavailable = true; else throw error; }
  if (unavailable) return <main className="catalog-page"><DatabaseUnavailable message="لا يمكن تحميل هذا القسم الآن" /></main>;
  if (!category) notFound();
  try {
    [result, collections] = await Promise.all([
      getCatalogPage({ ...filters, category: slug }),
      getCatalogCollectionOptions(),
    ]);
  } catch (error) { if (isDatabaseUnavailable(error)) unavailable = true; else throw error; }
  if (unavailable || !result) return <main className="catalog-page"><DatabaseUnavailable message="لا يمكن تحميل منتجات هذا القسم الآن" /></main>;
  const pageFilters = { ...filters, category: slug, page: String(result.page) };
  return <main className="catalog-page">
    <nav className="catalog-breadcrumb" aria-label="مسار التنقل"><Link href="/">الرئيسية</Link><span>/</span><Link href="/categories">الأقسام</Link><span>/</span><span>{category.arabicName}</span></nav>
    <header className="catalog-page__heading"><div><p className="eyebrow">DAISY DESIGNS / قسم</p><h1>{category.arabicName}</h1>{category.description && <p>{category.description}</p>}</div><Link href="/search" className="catalog-search-link">ابحثي عن منتج</Link></header>
    <div className="catalog-result-line"><span>{result.total} منتج</span></div>
    <CatalogControls action={`/categories/${slug}`} filters={filters} fixedCategory={slug} collections={collections.map(item => ({ slug: item.slug, label: item.name }))} />
    {result.items.length ? <div className="catalog-product-grid">{result.items.map(product => <ProductCard key={product.id} product={toStorefrontProduct(product)} />)}</div> : <section className="catalog-empty"><h2>لا توجد منتجات في هذا القسم حاليًا</h2><p>اكتشفي أقسامًا أخرى من منتجات دايزي.</p><Link href="/categories" className="daisy-button daisy-button--dark">كل الأقسام</Link></section>}
    <CatalogPagination path={`/categories/${slug}`} filters={pageFilters} page={result.page} totalPages={result.totalPages} />
  </main>;
}
