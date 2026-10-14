import Image from "@/components/site-image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpLeft, ArrowUpRight } from "lucide-react";
import { HeroTextReveal, SectionReveal } from "@/components/home-motion";
import { getTranslation, type TranslationKey } from "@/lib/i18n/messages";
import { getRequestLocale } from "@/lib/locale-server";
import { formatLocaleNumber } from "@/lib/locale";
import {
  getStoreCategories,
  categoryNameForLocale,
  categoryTaglineForLocale,
  categoryDescriptionForLocale,
} from "@/lib/store-categories";

export const dynamic = "force-dynamic";

const editorialHeroImage = "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=1800&q=90";
const editorialStoryImage = "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1400&q=90";

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
          <p className="eyebrow">DAISY DESIGNS <span> / </span> {t("homeBrandMadePersonal")}</p>
          <h1 id="hero-title">{t("homeHeroTitle")}<br /><em>{t("homeHeroTitleSecond")}</em></h1>
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
        <div className="daisy-hero__image" data-scroll-reveal suppressHydrationWarning>
          <Image
            src={editorialHeroImage}
            alt={t("homeHeroImageAlt")}
            fill
            priority
            sizes="(max-width: 760px) 100vw, 60vw"
            className="daisy-image daisy-editorial-photo"
          />
          <span className="daisy-image-caption">{t("homeHeroCaption")}</span>
        </div>
      </section>

      <SectionReveal className="daisy-intro" labelledBy="intro-title">
        <div className="daisy-intro__heading">
          <p className="eyebrow">{t("homeIntroEyebrow")}</p>
          <h2 id="intro-title">{t("homeIntroTitle")}<br /><em>{t("homeIntroTitleSecond")}</em></h2>
        </div>
        <div className="daisy-intro__brand-mark" aria-hidden="true">
          <span>D.</span>
          <small>DAISY DESIGNS</small>
        </div>
        <div className="daisy-intro__body">
          <p>{t("homeIntroBody")}</p>
          <Link href="/about" className="daisy-text-link">
            {t("homeIntroAboutCta")} <UpArrow size={16} />
          </Link>
        </div>
      </SectionReveal>

      <section className="daisy-categories" aria-labelledby="categories-title" data-scroll-reveal suppressHydrationWarning>
        <header className="daisy-section-heading">
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

        <div className="store-category-grid" data-scroll-reveal-stagger>
          {storeCategories.map((category) => {
            const name = categoryNameForLocale(category, locale);
            const tagline = categoryTaglineForLocale(category, locale);
            const description = categoryDescriptionForLocale(category, locale);

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
                  <p className="store-category-card__description">{description}</p>
                  <div className="store-category-card__action">
                    <span>{t("exploreCategory")}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="daisy-personalization" aria-labelledby="personal-title" data-scroll-reveal suppressHydrationWarning>
        <div className="daisy-personalization__visual">
          <div className="daisy-personalization__brand-card" aria-hidden="true">
            <span className="daisy-personalization__letter">D.</span>
            <span className="daisy-personalization__brand-name">DAISY DESIGNS</span>
          </div>
          <span className="daisy-personalization__stamp">
            {t("homePersonalStampFirst")}<br />{t("homePersonalStampSecond")}
          </span>
        </div>
        <div className="daisy-personalization__copy">
          <p className="eyebrow">{t("homePersonalEyebrow")}</p>
          <h2 id="personal-title">{t("homePersonalTitle")}<br /><em>{t("homePersonalTitleSecond")}</em></h2>
          <p className="daisy-personalization__description">{t("homePersonalDescription")}</p>
          <ol className="daisy-steps">
            <li>
              <span>{formatLocaleNumber(locale, 1).padStart(2, "0")}</span>
              <span>{t("homePersonalStepOne")}</span>
            </li>
            <li>
              <span>{formatLocaleNumber(locale, 2).padStart(2, "0")}</span>
              <span>{t("homePersonalStepTwo")}</span>
            </li>
            <li>
              <span>{formatLocaleNumber(locale, 3).padStart(2, "0")}</span>
              <span>{t("homePersonalStepThree")}</span>
            </li>
          </ol>
          <Link href="/categories" className="daisy-text-link">
            {t("exploreCategories")} <Arrow size={16} />
          </Link>
        </div>
      </section>

      <SectionReveal className="daisy-story" labelledBy="story-title">
        <div className="daisy-story__image">
          <Image
            src={editorialStoryImage}
            alt={t("homeStoryImageAlt")}
            fill
            sizes="(max-width: 760px) 100vw, 56vw"
            className="daisy-image daisy-editorial-photo"
          />
        </div>
        <div className="daisy-story__copy">
          <p className="eyebrow">{t("homeStoryEyebrow")}</p>
          <h2 id="story-title">{t("homeStoryTitle")}<br />{t("homeStoryTitleSecond")}</h2>
          <p>{t("homeStoryBody")}</p>
          <Link href="/about" className="daisy-text-link">
            {t("homeStoryAboutCta")} <Arrow size={16} />
          </Link>
        </div>
      </SectionReveal>

      <section className="daisy-cta" data-scroll-reveal suppressHydrationWarning>
        <p className="eyebrow">DAISY DESIGNS <span> / </span> {t("homeBrandPersonalized")}</p>
        <div className="daisy-cta__row">
          <h2>{t("homeFinalTitle")}<br /><em>{t("homeFinalTitleSecond")}</em></h2>
          <Link href="/categories" className="daisy-button daisy-button--light">
            {t("exploreCategories")} <Arrow size={16} />
          </Link>
        </div>
        <span className="daisy-cta__mark" aria-hidden="true">D.</span>
      </section>
    </main>
  );
}
