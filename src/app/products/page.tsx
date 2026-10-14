import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getTranslation, type TranslationKey } from "@/lib/i18n/messages";
import { getRequestLocale } from "@/lib/locale-server";
import {
  getStoreCategories,
  categoryNameForLocale,
  categoryTaglineForLocale,
} from "@/lib/store-categories";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return {
    title: getTranslation(locale, "catalogTitle"),
    description: getTranslation(locale, "productsMetadata"),
  };
}

export default async function ProductsPage() {
  const locale = await getRequestLocale();
  const t = (key: TranslationKey) => getTranslation(locale, key);
  const isRtl = locale === "ar";
  const Arrow = isRtl ? ArrowLeft : ArrowRight;
  const storeCategories = getStoreCategories();

  return (
    <main className="catalog-page">
      <nav className="catalog-breadcrumb" aria-label={t("breadcrumb")}>
        <Link href="/">{t("home")}</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{t("products")}</span>
      </nav>

      <header className="catalog-page__heading" data-scroll-reveal suppressHydrationWarning>
        <div>
          <p className="eyebrow">DAISY DESIGNS / {t("catalogTitle")}</p>
          <h1>{t("catalogHeading")}</h1>
          <p>{t("catalogIntro")}</p>
        </div>
      </header>

      <section className="catalog-empty catalog-empty--coming-soon" data-scroll-reveal suppressHydrationWarning>
        <span className="daisy-brand-badge">DAISY DESIGNS</span>
        <h2>{t("productsComingSoonTitle")}</h2>
        <p>{t("productsComingSoonDescription")}</p>
        <Link href="/categories" className="daisy-button daisy-button--dark">
          {t("exploreCategories")} <Arrow size={16} />
        </Link>
      </section>

      <section className="catalog-categories-preview" aria-labelledby="products-categories-title" data-scroll-reveal suppressHydrationWarning>
        <div className="catalog-page__heading">
          <div>
            <p className="eyebrow">DAISY DESIGNS / {t("categories")}</p>
            <h2 id="products-categories-title">{t("categoriesHeading")}</h2>
            <p>{t("categoriesIntro")}</p>
          </div>
        </div>

        <div className="store-category-grid" data-scroll-reveal-stagger>
          {storeCategories.map((category) => {
            const name = categoryNameForLocale(category, locale);
            const tagline = categoryTaglineForLocale(category, locale);
            return (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="store-category-card"
                data-scroll-reveal
                suppressHydrationWarning
              >
                <div className="store-category-card__cover">
                  <span className="store-category-card__mark" aria-hidden="true">
                    <span>{category.letter}</span>
                    <small>DAISY DESIGNS / {t("categoryLabel")}</small>
                  </span>
                </div>
                <div className="store-category-card__content">
                  <div className="store-category-card__title">
                    <h3>{name}</h3>
                    <span className="store-category-card__arrow" aria-hidden="true">↗</span>
                  </div>
                  <p className="store-category-card__tagline">{tagline}</p>
                  <div className="store-category-card__action">
                    <span>{t("exploreCategory")}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
