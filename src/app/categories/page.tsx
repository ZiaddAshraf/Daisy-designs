import Link from "next/link";
import "./categories.css";
import type { Metadata } from "next";
import { getTranslation, type TranslationKey } from "@/lib/i18n/messages";
import { getRequestLocale } from "@/lib/locale-server";
import {
  getStoreCategories,
} from "@/lib/store-categories";
import { CategoryCard } from "@/components/category-card";

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
    <main className="catalog-page category-directory">
      <nav className="catalog-breadcrumb" aria-label={t("breadcrumb")}>
        <Link href="/">{t("home")}</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{t("categories")}</span>
      </nav>

      <header className="catalog-page__heading" data-scroll-reveal suppressHydrationWarning>
        <h1>{t("categoriesHeading")}</h1>
      </header>

      <div className="store-category-grid" data-scroll-reveal-stagger>
        {categories.map((category, index) => (
          <CategoryCard
            key={category.id}
            category={category}
            locale={locale}
            index={index}
            showNotice={false}
            showDescription={false}
            clearPhotography={true}
            headingTag="h2"
          />
        ))}
      </div>
    </main>
  );
}
