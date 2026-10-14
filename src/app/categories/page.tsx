import Link from "next/link";
import type { Metadata } from "next";
import { getTranslation, type TranslationKey } from "@/lib/i18n/messages";
import { getRequestLocale } from "@/lib/locale-server";
import {
  getStoreCategories,
  categoryNameForLocale,
  categoryTaglineForLocale,
  categoryDescriptionForLocale,
  categoryNoticeForLocale,
} from "@/lib/store-categories";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return {
    title: getTranslation(locale, "categoriesHeading"),
    description: getTranslation(locale, "categoriesMetadata"),
  };
}

export default async function CategoriesPage() {
  const locale = await getRequestLocale();
  const t = (key: TranslationKey) => getTranslation(locale, key);
  const categories = getStoreCategories();

  return (
    <main className="catalog-page">
      <nav className="catalog-breadcrumb" aria-label={t("breadcrumb")}>
        <Link href="/">{t("home")}</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{t("categories")}</span>
      </nav>

      <header className="catalog-page__heading" data-scroll-reveal suppressHydrationWarning>
        <div>
          <p className="eyebrow">DAISY DESIGNS / {t("categories")}</p>
          <h1>{t("categoriesHeading")}</h1>
          <p>{t("categoriesIntro")}</p>
        </div>
      </header>

      <div className="store-category-grid" data-scroll-reveal-stagger>
        {categories.map((category) => {
          const name = categoryNameForLocale(category, locale);
          const tagline = categoryTaglineForLocale(category, locale);
          const description = categoryDescriptionForLocale(category, locale);
          const notice = categoryNoticeForLocale(category, locale);

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
                  <h2>{name}</h2>
                  <span className="store-category-card__arrow" aria-hidden="true">↗</span>
                </div>
                <p className="store-category-card__tagline">{tagline}</p>
                <p className="store-category-card__description">{description}</p>
                {notice && <span className="store-category-card__notice">{notice}</span>}
                <div className="store-category-card__action">
                  <span>{t("exploreCategory")}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
