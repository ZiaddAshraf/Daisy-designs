import Link from "next/link";
import type { Metadata } from "next";
import { Search } from "lucide-react";
import { CatalogControls, CatalogPagination } from "@/components/catalog-controls";
import { DatabaseUnavailable } from "@/components/database-state";
import { ProductCard } from "@/components/storefront";
import { formatMessage, getTranslation, type TranslationKey } from "@/lib/i18n/messages";
import { selectLocalizedText } from "@/lib/catalog";
import { getRequestLocale } from "@/lib/locale-server";
import { formatLocaleNumber } from "@/lib/locale";
import { getCatalogCategories, getCatalogCollectionOptions, isDemoMode, toStorefrontProduct } from "@/lib/catalog";
import { getDemoCatalogPage } from "@/lib/demo-catalog-data";
import { isDatabaseUnavailable, prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

type SearchParams = { q?: string; category?: string; collection?: string; min?: string; max?: string; availability?: string; customizable?: string; sort?: string; page?: string };
type SearchProduct = Parameters<typeof toStorefrontProduct>[0] & { id: string };
const allowedSorts = new Set(["newest", "price-asc", "price-desc", "best-selling"]);
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return { title: getTranslation(locale, "searchPageTitle"), description: getTranslation(locale, "searchPageIntro") };
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const locale = await getRequestLocale();
  const t = (key: TranslationKey) => getTranslation(locale, key);
  const params = await searchParams;
  const query = (params.q ?? "").trim().slice(0, 80);
  const page = params.page && /^\d{1,5}$/.test(params.page) ? Math.max(1, Number(params.page)) : 1;
  const min = params.min && /^\d{1,8}$/.test(params.min) ? Number(params.min) : undefined;
  const max = params.max && /^\d{1,8}$/.test(params.max) ? Number(params.max) : undefined;
  const filters: SearchParams = {
    q: query,
    category: params.category?.slice(0, 80),
    collection: params.collection?.slice(0, 80),
    min: min?.toString(),
    max: max?.toString(),
    availability: params.availability === "in-stock" ? params.availability : undefined,
    customizable: params.customizable === "true" ? params.customizable : undefined,
    sort: params.sort && allowedSorts.has(params.sort) ? params.sort : "newest",
    page: String(page),
  };

  let categories: { slug: string; name: string; arabicName: string }[] = [];
  let collections: { slug: string; name: string }[] = [];
  let products: SearchProduct[] = [];
  let total = 0;
  let unavailable = false;

  try {
    categories = await getCatalogCategories();
    collections = await getCatalogCollectionOptions();
    if (query) {
      if (isDemoMode()) {
        const result = getDemoCatalogPage({ ...filters, limit: "12" }, query);
        products = result.items;
        total = result.total;
      } else {
      const where: Prisma.ProductWhereInput = {
        published: true,
        ...(filters.category ? { category: { slug: filters.category } } : {}),
        ...(filters.collection ? { collection: { slug: filters.collection } } : {}),
        ...(min !== undefined || max !== undefined ? { price: { ...(min !== undefined ? { gte: min } : {}), ...(max !== undefined ? { lte: max } : {}) } } : {}),
        ...(filters.availability === "in-stock" ? { stock: { gt: 0 } } : {}),
        ...(filters.customizable === "true" ? { customizable: true } : {}),
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { arabicName: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { sku: { contains: query, mode: "insensitive" } },
          { tags: { has: query } },
          { category: { arabicName: { contains: query, mode: "insensitive" } } },
        ],
      };
      const orderBy: Prisma.ProductOrderByWithRelationInput = filters.sort === "price-asc" ? { price: "asc" } : filters.sort === "price-desc" ? { price: "desc" } : filters.sort === "best-selling" ? { bestSeller: "desc" } : { createdAt: "desc" };
      const [rows, count] = await prisma.$transaction([
        prisma.product.findMany({ where, include: { images: { orderBy: { position: "asc" }, take: 1 }, category: true, variants: { select: { id: true }, take: 1 } }, orderBy, skip: (page - 1) * 12, take: 12 }),
        prisma.product.count({ where }),
      ]);
      products = rows;
      total = count;
      }
    }
  } catch (error) {
    if (isDatabaseUnavailable(error)) unavailable = true;
    else throw error;
  }

  if (unavailable) return <main className="catalog-page"><DatabaseUnavailable messageKey="searchUnavailable" /></main>;
  const totalPages = Math.ceil(total / 12);
  const productViews = products.map(product => toStorefrontProduct(product, locale));

  return <main className="catalog-page">
    <header className="catalog-page__heading" data-scroll-reveal suppressHydrationWarning><div><p className="eyebrow">DAISY DESIGNS / {t("search")}</p><h1>{t("searchPageTitle")}</h1><p>{t("searchPageIntro")}</p></div></header>
    <form action="/search" className="catalog-search-form" role="search"><input name="q" type="search" defaultValue={query} maxLength={80} placeholder={t("searchPlaceholder")} aria-label={t("searchProduct")} /><button aria-label={t("submitSearch")}><Search size={18} /></button></form>
    {query && <div className="catalog-result-line" data-scroll-reveal suppressHydrationWarning><span>{formatMessage(t("searchResultQuery"), { query })}</span><span>{formatMessage(t("searchResultCount"), { count: formatLocaleNumber(locale, total) })}</span></div>}
    {query && <CatalogControls action="/search" filters={filters} locale={locale} categories={categories.map(item => ({ slug: item.slug, label: selectLocalizedText(locale, item.name, item.arabicName) }))} collections={collections.map(item => ({ slug: item.slug, label: item.name }))} />}
    {!query ? <section className="catalog-empty" data-scroll-reveal suppressHydrationWarning><h2>{t("startSearchTitle")}</h2><Link href="/products" className="daisy-button daisy-button--dark">{t("browseProducts")}</Link></section> : productViews.length ? <div className="catalog-product-grid" data-scroll-reveal-stagger>{productViews.map(product => <ProductCard key={product.slug} product={product} />)}</div> : <section className="catalog-empty" data-scroll-reveal suppressHydrationWarning><h2>{t("noSearchResultsTitle")}</h2><p>{t("noSearchResultsDescription")}</p><Link href="/products" className="daisy-button daisy-button--dark">{t("browseAllProducts")}</Link></section>}
    <CatalogPagination path="/search" filters={filters} page={page} totalPages={totalPages} locale={locale} />
  </main>;
}
