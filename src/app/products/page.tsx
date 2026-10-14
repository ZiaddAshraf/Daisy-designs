import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight } from "lucide-react";
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
        <div className="catalog-empty__insignia" aria-hidden="true">
          <span className="daisy-brand-badge">DAISY DESIGNS</span>
        </div>
        <h2>{t("productsComingSoonTitle")}</h2>
        <p className="catalog-empty__lead">{t("productsComingSoonDescription")}</p>
        <div className="catalog-empty__pillars" aria-hidden="true">
          <div className="catalog-empty__pillar">
            <span className="catalog-empty__pillar-num">1</span>
            <span className="catalog-empty__pillar-label">{locale === "ar" ? "تخصيص كامل بالاسم والتفاصيل" : "Personalized with name & details"}</span>
          </div>
          <div className="catalog-empty__pillar">
            <span className="catalog-empty__pillar-num">2</span>
            <span className="catalog-empty__pillar-label">{locale === "ar" ? "خامات متينة ومقاومة للماء" : "Durable waterproof materials"}</span>
          </div>
          <div className="catalog-empty__pillar">
            <span className="catalog-empty__pillar-num">3</span>
            <span className="catalog-empty__pillar-label">{locale === "ar" ? "صُنع وشُحن بكل حب في مصر" : "Handcrafted with love in Egypt"}</span>
          </div>
        </div>
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
          {storeCategories.map((category, index) => (
            <CategoryCard
              key={category.id}
              category={category}
              locale={locale}
              index={index}
              showDescription={false}
              headingTag="h3"
            />
          ))}
        </div>
      </section>
    </main>
  );
}
