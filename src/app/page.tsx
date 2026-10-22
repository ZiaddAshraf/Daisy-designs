import Image from "@/components/site-image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpLeft, ArrowUpRight } from "lucide-react";
import { StorybookReveal, StaggerCategoryGrid } from "@/components/home-motion";
import { getTranslation, type TranslationKey } from "@/lib/i18n/messages";
import { getRequestLocale } from "@/lib/locale-server";
import {
  getStoreCategories,
} from "@/lib/store-categories";
import { CategoryCard } from "@/components/category-card";
import { DaisyFlower, StorybookIcon } from "@/components/decorative-marks";
import { BrandLogo } from "@/components/brand-logo";

export const dynamic = "force-dynamic";

const editorialStoryImage = "/products/customized-stories/first-year-at-school/cover.jpeg";

export default async function Home() {
  const locale = await getRequestLocale();
  const isRtl = locale === "ar";
  const Arrow = isRtl ? ArrowLeft : ArrowRight;
  const UpArrow = isRtl ? ArrowUpLeft : ArrowUpRight;
  const t = (key: TranslationKey) => getTranslation(locale, key);
  const storeCategories = getStoreCategories();

  return (
    <main className="daisy-home">
      <section className="daisy-hero daisy-hero--banner" aria-label="Daisy Designs | Where Ideas Bloom">
        <h1 className="sr-only">Daisy Designs | Where Ideas Bloom</h1>
        <div className="daisy-hero__banner-frame">
          <Image
            src="/hero.jpeg"
            alt="Daisy Designs | Where Ideas Bloom"
            width={1600}
            height={533}
            priority
            quality={95}
            sizes="(max-width: 1400px) 100vw, 1400px"
            className="daisy-hero__banner-img"
          />
        </div>
      </section>

      <section className="daisy-categories" aria-labelledby="categories-title">
        <header className="daisy-section-heading" data-scroll-reveal suppressHydrationWarning>
          <div>
            <p className="eyebrow">{t("homeCategoriesEyebrow")}</p>
            <h2 id="categories-title">{t("homeCategoriesTitle")}</h2>
          </div>
          <div className="daisy-section-heading__aside">
            <p>{t("homeCategoriesIntro")}</p>
            <Link href="/categories" aria-label={t("homeAllCategories")} className="daisy-round-link">
              <UpArrow size={19} />
            </Link>
          </div>
        </header>

        <StaggerCategoryGrid className="store-category-grid" data-scroll-reveal-stagger>
          {storeCategories.map((category, index) => (
            <CategoryCard
              key={category.id}
              category={category}
              locale={locale}
              index={index}
              showDescription={true}
              headingTag="h3"
            />
          ))}
        </StaggerCategoryGrid>
      </section>

      <section className="daisy-personalization" aria-labelledby="personal-title" data-scroll-reveal suppressHydrationWarning>
        <div className="daisy-personalization__visual">
          <div className="daisy-personalization__brand-card" aria-hidden="true">
            <BrandLogo variant="lockup" altText="Daisy Designs" />
          </div>
          <span className="daisy-personalization__stamp">
            <DaisyFlower size={14} className="daisy-personalization__stamp-flower" />
            <span>{t("homePersonalStampFirst")}<br />{t("homePersonalStampSecond")}</span>
          </span>
        </div>
        <div className="daisy-personalization__copy">
          <p className="eyebrow">{t("homePersonalEyebrow")}</p>
          <h2 id="personal-title">{t("homePersonalTitle")}<br /><em>{t("homePersonalTitleSecond")}</em></h2>
          <p className="daisy-personalization__description">{t("homePersonalDescription")}</p>
          <ol className="daisy-steps">
            <li>
              <span>1</span>
              <span>{t("homePersonalStepOne")}</span>
            </li>
            <li>
              <span>2</span>
              <span>{t("homePersonalStepTwo")}</span>
            </li>
            <li>
              <span>3</span>
              <span>{t("homePersonalStepThree")}</span>
            </li>
          </ol>
          <Link href="/categories" className="daisy-text-link">
            {t("exploreCategories")} <Arrow size={16} />
          </Link>
        </div>
      </section>

      <StorybookReveal className="daisy-story" labelledBy="story-title">
        <div className="daisy-story__image">
          <Image
            src={editorialStoryImage}
            alt={t("homeStoryImageAlt")}
            fill
            sizes="(max-width: 760px) 100vw, 56vw"
            className="daisy-image daisy-editorial-photo"
          />
          <span className="daisy-story__badge" aria-hidden="true">
            <StorybookIcon size={18} />
          </span>
        </div>
        <div className="daisy-story__copy">
          <p className="eyebrow daisy-story__eyebrow">
            <StorybookIcon size={14} className="daisy-story__eyebrow-icon" />
            <span>{t("homeStoryEyebrow")}</span>
          </p>
          <h2 id="story-title">{t("homeStoryTitle")}<br />{t("homeStoryTitleSecond")}</h2>
          <p>{t("homeStoryBody")}</p>
          <Link href="/about" className="daisy-text-link">
            {t("homeStoryAboutCta")} <Arrow size={16} />
          </Link>
        </div>
      </StorybookReveal>

      <section className="daisy-cta" data-scroll-reveal suppressHydrationWarning>
        <p className="eyebrow">
          DAISY DESIGNS <span> / </span> {t("homeBrandPersonalized")}
        </p>
        <div className="daisy-cta__row">
          <h2>{t("homeFinalTitle")}<br /><em>{t("homeFinalTitleSecond")}</em></h2>
          <Link href="/categories" className="daisy-button daisy-button--light">
            {t("exploreCategories")} <Arrow size={16} />
          </Link>
        </div>
        <div className="daisy-cta__monogram-watermark" aria-hidden="true">
          <BrandLogo variant="monogram" altText="" />
        </div>
      </section>
    </main>
  );
}
