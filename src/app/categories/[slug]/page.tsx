import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { CatalogControls, CatalogPagination } from "@/components/catalog-controls";
import { ProductCard } from "@/components/storefront";
import { DatabaseUnavailable } from "@/components/database-state";
import { getCatalogCategory, getCatalogCollectionOptions, getCatalogPage, selectLocalizedText, toStorefrontProduct } from "@/lib/catalog";
import { formatMessage, getTranslation, type TranslationKey } from "@/lib/i18n/messages";
import { getRequestLocale } from "@/lib/locale-server";
import { formatLocaleNumber } from "@/lib/locale";
import { isDatabaseUnavailable } from "@/lib/prisma";
import {
  getStoreCategory,
  categoryNameForLocale,
  categoryTaglineForLocale,
  categoryDescriptionForLocale,
  categoryNoticeForLocale,
} from "@/lib/store-categories";
import { SparkleStar } from "@/components/decorative-marks";

type SearchFilters = { collection?: string; min?: string; max?: string; availability?: string; customizable?: string; sort?: string; page?: string };
function normalizeFilters(params: SearchFilters) { const numeric = (value?: string) => value && /^\d{1,8}$/.test(value) ? value : undefined; return { collection: params.collection?.slice(0, 80), min: numeric(params.min), max: numeric(params.max), availability: params.availability === "in-stock" ? params.availability : undefined, customizable: params.customizable === "true" ? params.customizable : undefined, sort: ["price-asc", "price-desc", "best-selling", "newest"].includes(params.sort ?? "") ? params.sort : "newest", page: numeric(params.page), limit: "12" }; }
type CategoryData = { id: string; slug: string; name: string; arabicName: string; description: string | null };

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const [{ slug }, locale] = await Promise.all([params, getRequestLocale()]);
  const storeCat = getStoreCategory(slug);
  if (storeCat) {
    const title = `${categoryNameForLocale(storeCat, locale)} | Daisy Designs`;
    const description = categoryDescriptionForLocale(storeCat, locale);
    return { title, description };
  }
  try {
    const category = await getCatalogCategory(slug);
    if (category) return { title: `${selectLocalizedText(locale, category.name, category.arabicName)} | Daisy Designs`, description: category.description ?? getTranslation(locale, "categoryProductsMetadata") };
  } catch (error) { if (!isDatabaseUnavailable(error)) throw error; }
  return { title: getTranslation(locale, "categoryLabel"), description: getTranslation(locale, "categoryProductsMetadata") };
}

export default async function CategoryPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<SearchFilters> }) {
  const locale = await getRequestLocale();
  const t = (key: TranslationKey) => getTranslation(locale, key);
  const isRtl = locale === "ar";
  const Arrow = isRtl ? ArrowLeft : ArrowRight;
  const { slug } = await params;
  const filters = normalizeFilters(await searchParams);
  const storeCat = getStoreCategory(slug);

  let category: CategoryData | null = null;
  let result: Awaited<ReturnType<typeof getCatalogPage>> | null = null;
  let collections: { slug: string; name: string }[] = [];
  let unavailable = false;

  try {
    category = await getCatalogCategory(slug);
  } catch (error) {
    if (isDatabaseUnavailable(error)) unavailable = true;
    else throw error;
  }

  // If DB unavailable or no DB record, fallback to confirmed store category
  if (!category && storeCat) {
    category = {
      id: storeCat.id,
      slug: storeCat.slug,
      name: storeCat.name,
      arabicName: storeCat.arabicName,
      description: categoryDescriptionForLocale(storeCat, locale),
    };
    unavailable = false;
  }

  if (unavailable) return <main className="catalog-page"><DatabaseUnavailable messageKey="categoryUnavailable" /></main>;
  if (!category) notFound();

  try {
    [result, collections] = await Promise.all([
      getCatalogPage({ ...filters, category: slug }),
      getCatalogCollectionOptions(),
    ]);
  } catch (error) {
    if (isDatabaseUnavailable(error)) unavailable = true;
    else throw error;
  }

  const categoryName = storeCat ? categoryNameForLocale(storeCat, locale) : selectLocalizedText(locale, category.name, category.arabicName);
  const categoryTagline = storeCat ? categoryTaglineForLocale(storeCat, locale) : null;
  const categoryDescription = storeCat ? categoryDescriptionForLocale(storeCat, locale) : category.description;
  const categoryNotice = storeCat ? categoryNoticeForLocale(storeCat, locale) : null;

  const pageFilters = { ...filters, category: slug, page: String(result?.page ?? 1) };
  const hasProducts = Boolean(result && result.items.length > 0);

  return (
    <main className="catalog-page">
      <nav className="catalog-breadcrumb" aria-label={t("breadcrumb")}>
        <Link href="/">{t("home")}</Link>
        <span>/</span>
        <Link href="/categories">{t("categoriesHeading")}</Link>
        <span>/</span>
        <span>{categoryName}</span>
      </nav>

      <header className="catalog-page__heading" data-scroll-reveal suppressHydrationWarning>
        <div>
          <p className="eyebrow">DAISY DESIGNS / {t("categoryLabel")}</p>
          <h1>{categoryName}</h1>
          {categoryTagline && <p className="category-detail-tagline">{categoryTagline}</p>}
          {categoryDescription && <p>{categoryDescription}</p>}
          {categoryNotice && (
            <div className="category-surface-notice">
              <SparkleStar size={13} className="category-surface-notice__star" />
              <span>{categoryNotice}</span>
            </div>
          )}
        </div>
      </header>

      {hasProducts ? (
        <>
          <div className="catalog-result-line" data-scroll-reveal suppressHydrationWarning>
            <span>{formatMessage(t("productCount"), { count: formatLocaleNumber(locale, result!.total) })}</span>
          </div>
          <CatalogControls action={`/categories/${slug}`} filters={filters} locale={locale} fixedCategory={slug} collections={collections.map(item => ({ slug: item.slug, label: item.name }))} />
          <div className="catalog-product-grid" data-scroll-reveal-stagger>
            {result!.items.map(product => <ProductCard key={product.id} product={toStorefrontProduct(product, locale)} />)}
          </div>
          <CatalogPagination path={`/categories/${slug}`} filters={pageFilters} page={result!.page} totalPages={result!.totalPages} locale={locale} />
        </>
      ) : (
        <section className="catalog-empty catalog-empty--coming-soon" data-scroll-reveal suppressHydrationWarning>
          <div className="catalog-empty__insignia" aria-hidden="true">
            <span className="daisy-brand-badge">DAISY DESIGNS</span>
          </div>
          <h2>{t("categoryComingSoonTitle")}</h2>
          <p className="catalog-empty__lead">{t("categoryComingSoonDescription")}</p>
          <Link href="/categories" className="daisy-button daisy-button--dark">
            {t("allCategoriesLink")} <Arrow size={16} />
          </Link>
        </section>
      )}
    </main>
  );
}
