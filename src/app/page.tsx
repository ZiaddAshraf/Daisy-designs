import Image from "@/components/site-image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpLeft, ArrowUpRight } from "lucide-react";
import { HeroTextReveal, SectionReveal, StorybookReveal, InteractiveMark, StaggerCategoryGrid } from "@/components/home-motion";
import { getTranslation, type TranslationKey } from "@/lib/i18n/messages";
import { getRequestLocale } from "@/lib/locale-server";
import {
  getStoreCategories,
} from "@/lib/store-categories";
import { CategoryCard } from "@/components/category-card";
import { DaisyFlower, SparkleStar, StorybookIcon, TinyDaisyDoodle, PlayfulWiggle } from "@/components/decorative-marks";
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
      <section className="daisy-hero" aria-labelledby="hero-title">
        <HeroTextReveal className="daisy-hero__copy">
          <p className="eyebrow">
            DAISY DESIGNS <span> / </span> {t("homeBrandMadePersonal")}
            <InteractiveMark className="daisy-hero__flower-mark">
              <DaisyFlower size={15} />
            </InteractiveMark>
          </p>
          <h1 id="hero-title">
            {t("homeHeroTitle")}<br />
            <em>{t("homeHeroTitleSecond")}</em>
            <PlayfulWiggle className="daisy-hero__title-wiggle" />
          </h1>
          <p className="daisy-hero__intro">{t("homeHeroIntro")}</p>
          <div className="daisy-hero__actions">
            <Link href="/categories" className="daisy-button daisy-button--dark">
              {t("exploreCategories")} <Arrow size={16} />
            </Link>
            <Link href="/products" className="daisy-text-link">
              {t("homeHeroProductsCta")} <UpArrow size={16} />
            </Link>
          </div>
          <span className="daisy-hero__index">{t("homeHeroIndex")}</span>
        </HeroTextReveal>
        <div className="daisy-hero__image daisy-hero__brand-showcase" data-scroll-reveal suppressHydrationWarning>
          <div className="daisy-hero__brand-backdrop" aria-hidden="true" />
          <BrandLogo
            variant="hero"
            priority
            className="daisy-hero__brand-logo"
            altText="Daisy Designs | Where Ideas Bloom"
          />
          <span className="daisy-image-caption">{t("homeHeroCaption")}</span>
        </div>
      </section>

      <SectionReveal className="daisy-intro" labelledBy="intro-title">
        <div className="daisy-intro__heading">
          <p className="eyebrow">
            {t("homeIntroEyebrow")}
            <TinyDaisyDoodle size={15} />
          </p>
          <h2 id="intro-title">{t("homeIntroTitle")}<br /><em>{t("homeIntroTitleSecond")}</em></h2>
        </div>
        <div className="daisy-intro__brand-mark" aria-hidden="true">
          <span className="daisy-intro__flower-orbit">
            <DaisyFlower size={20} />
          </span>
          <BrandLogo variant="monogram" className="daisy-intro__monogram" altText="Daisy Designs" />
        </div>
        <div className="daisy-intro__body">
          <p>{t("homeIntroBody")}</p>
          <Link href="/about" className="daisy-text-link">
            {t("homeIntroAboutCta")} <UpArrow size={16} />
          </Link>
        </div>
      </SectionReveal>

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
          <SparkleStar size={12} className="daisy-cta__inline-sparkle" />
        </p>
        <div className="daisy-cta__row">
          <h2>{t("homeFinalTitle")}<br /><em>{t("homeFinalTitleSecond")}</em></h2>
          <Link href="/categories" className="daisy-button daisy-button--light">
            {t("exploreCategories")} <Arrow size={16} />
          </Link>
        </div>
        <div className="daisy-cta__monogram-watermark" aria-hidden="true">
          <BrandLogo variant="monogram" altText="" />
          <SparkleStar size={32} className="daisy-cta__sparkle daisy-cta__sparkle--1" />
          <SparkleStar size={20} className="daisy-cta__sparkle daisy-cta__sparkle--2" />
        </div>
      </section>
    </main>
  );
}
