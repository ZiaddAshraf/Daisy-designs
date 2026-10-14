import Link from "next/link";
import Image from "@/components/site-image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogControls, CatalogPagination } from "@/components/catalog-controls";
import { ProductCard } from "@/components/storefront";
import { DatabaseUnavailable } from "@/components/database-state";
import { PRODUCT_IMAGE_PLACEHOLDER, getProductImageUrl } from "@/lib/product-image";
import { collectionTextForLocale, getCatalogCategories, getCatalogCollection, getCatalogPage, selectLocalizedText, toStorefrontProduct } from "@/lib/catalog";
import { formatMessage, getTranslation, type TranslationKey } from "@/lib/i18n/messages";
import { getRequestLocale } from "@/lib/locale-server";
import { formatLocaleNumber } from "@/lib/locale";
import { isDatabaseUnavailable } from "@/lib/prisma";

type SearchFilters = { category?: string; min?: string; max?: string; availability?: string; customizable?: string; sort?: string; page?: string };
function normalizeFilters(params: SearchFilters) {
  const numeric = (value?: string) => value && /^\d{1,8}$/.test(value) ? value : undefined;
  return { category: params.category?.slice(0, 80), min: numeric(params.min), max: numeric(params.max), availability: params.availability === "in-stock" ? params.availability : undefined, customizable: params.customizable === "true" ? params.customizable : undefined, sort: ["price-asc", "price-desc", "best-selling", "newest"].includes(params.sort ?? "") ? params.sort : "newest", page: numeric(params.page), limit: "12" };
}

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const [{ slug }, locale] = await Promise.all([params, getRequestLocale()]);
  try {
    const collection = await getCatalogCollection(slug);
    if (collection) return { title: `${collectionTextForLocale(collection.name, locale)} | Daisy Designs`, description: collectionTextForLocale(collection.description, locale) ?? getTranslation(locale, "collectionProductsMetadata") };
  } catch (error) { if (!isDatabaseUnavailable(error)) throw error; }
  return { title: getTranslation(locale, "collectionLabel"), description: getTranslation(locale, "collectionProductsMetadata") };
}

export default async function CollectionPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<SearchFilters> }) {
  const locale = await getRequestLocale();
  const t = (key: TranslationKey) => getTranslation(locale, key);
  const { slug } = await params;
  const filters = normalizeFilters(await searchParams);
  let collection: { name: string; slug: string; description: string | null; image: string | null } | null = null;
  let result: Awaited<ReturnType<typeof getCatalogPage>> | null = null;
  let categories: { slug: string; name: string; arabicName: string }[] = [];
  let unavailable = false;
  try { collection = await getCatalogCollection(slug); }
  catch (error) { if (isDatabaseUnavailable(error)) unavailable = true; else throw error; }
  if (unavailable) return <main className="catalog-page"><DatabaseUnavailable messageKey="collectionUnavailable" /></main>;
  if (!collection) notFound();
  try {
    [result, categories] = await Promise.all([
      getCatalogPage({ ...filters, collection: slug }),
      getCatalogCategories(),
    ]);
  } catch (error) { if (isDatabaseUnavailable(error)) unavailable = true; else throw error; }
  if (unavailable || !result) return <main className="catalog-page"><DatabaseUnavailable messageKey="collectionProductsUnavailable" /></main>;
  const collectionName = collectionTextForLocale(collection.name, locale) ?? collection.name;
  const collectionImage = getProductImageUrl(collection.image);
  const isBrandCover = collectionImage === PRODUCT_IMAGE_PLACEHOLDER;
  const pageFilters = { ...filters, collection: slug, page: String(result.page) };
  return <main className="catalog-page collections-page collection-detail-page">
      <nav className="catalog-breadcrumb" aria-label={t("breadcrumb")}><Link href="/">{t("home")}</Link><span>/</span><Link href="/collections">{t("collectionsHeading")}</Link><span>/</span><span>{collectionName}</span></nav>
      <header className="collection-detail-hero" data-scroll-reveal suppressHydrationWarning>
        <div className="collection-detail-hero__copy"><p className="eyebrow">DAISY DESIGNS / {t("collectionLabel")}</p><h1>{collectionName}</h1>{collection.description && <p>{collectionTextForLocale(collection.description, locale)}</p>}<div className="collection-detail-hero__links"><span>{formatMessage(t("productCount"), { count: formatLocaleNumber(locale, result.total) })}</span><Link href="/search" className="catalog-search-link">{t("searchForProduct")}</Link></div></div>
        <div className={`collection-detail-hero__image${isBrandCover ? " collection-detail-hero__image--brand" : ""}`}><Image src={collectionImage} alt="" fill sizes="(max-width: 760px) 100vw, 45vw" className="daisy-image" />{isBrandCover && <span className="collection-cover-mark" aria-hidden="true"><span>{collectionName.trim().slice(0, 1).toLocaleUpperCase(locale)}</span><small>DAISY DESIGNS / {t("collectionLabel")}</small></span>}</div>
      </header>
      <CatalogControls action={`/collections/${slug}`} filters={filters} locale={locale} fixedCollection={slug} categories={categories.map(item => ({ slug: item.slug, label: selectLocalizedText(locale, item.name, item.arabicName) }))} />
      {result.items.length ? <div className="catalog-product-grid" data-scroll-reveal-stagger>{result.items.map(product => <ProductCard key={product.id} product={toStorefrontProduct(product, locale)} />)}</div> : filters.category || filters.min || filters.max || filters.availability || filters.customizable ? <section className="catalog-empty" data-scroll-reveal suppressHydrationWarning><h2>{t("noMatchingProducts")}</h2><p>{t("changeFilters")}</p><Link href={`/collections/${slug}`} className="daisy-button daisy-button--dark">{t("clearFilters")}</Link></section> : <section className="catalog-empty" data-scroll-reveal suppressHydrationWarning><h2>{t("noCollectionProducts")}</h2><p>{t("exploreOtherCollections")}</p><Link href="/collections" className="daisy-button daisy-button--dark">{t("allCollectionsLink")}</Link></section>}
      <CatalogPagination path={`/collections/${slug}`} filters={pageFilters} page={result.page} totalPages={result.totalPages} locale={locale} />
    </main>;
}
