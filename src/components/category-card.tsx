import Image from "@/components/site-image";
import Link from "next/link";
import type { StoreCategory } from "@/lib/store-categories";
import {
  categoryNameForLocale,
  categoryTaglineForLocale,
  categoryDescriptionForLocale,
  categoryNoticeForLocale,
} from "@/lib/store-categories";
import { getTranslation, type TranslationKey } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/locale";
import { DaisyFlower, SparkleStar, StorybookIcon } from "@/components/decorative-marks";

type CategoryCardProps = {
  category: StoreCategory;
  locale: Locale;
  index?: number;
  showNotice?: boolean;
  showDescription?: boolean;
  headingTag?: "h2" | "h3";
};

const CATEGORY_IMAGES: Record<string, string> = {
  "stickers": "/products/stickers/sticker-01-kpop-demon-hunters.jpeg",
  "reward-cards": "/products/reward-cards/reward-cards-box-set.jpeg",
  "customized-stories": "/products/customized-stories/first-year-at-school/cover.jpeg",
  "printed-t-shirts": "/products/t-shirts/white-tshirt.svg",
};

const LIVE_CATEGORY_SLUGS = new Set(["stickers", "reward-cards", "customized-stories", "printed-t-shirts"]);

export function CategoryCard({
  category,
  locale,
  index = 0,
  showNotice = false,
  showDescription = true,
  headingTag = "h3",
}: CategoryCardProps) {
  const name = categoryNameForLocale(category, locale);
  const tagline = categoryTaglineForLocale(category, locale);
  const description = categoryDescriptionForLocale(category, locale);
  const notice = categoryNoticeForLocale(category, locale);
  const t = (key: TranslationKey) => getTranslation(locale, key);
  const indexStr = String(index + 1);
  const Heading = headingTag;
  const isLive = LIVE_CATEGORY_SLUGS.has(category.slug);
  const categoryImage = CATEGORY_IMAGES[category.slug];

  return (
    <Link
      href={`/categories/${category.slug}`}
      className="store-category-card group"
      data-scroll-reveal
      suppressHydrationWarning
    >
      <div className="store-category-card__cover">
        {categoryImage ? (
          <>
            <Image
              src={categoryImage}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="store-category-card__cover-image"
            />
            <div className="store-category-card__cover-overlay" aria-hidden="true" />
          </>
        ) : (
          <div className="store-category-card__mark" aria-hidden="true">
            <div className="store-category-card__letter-wrap">
              <span className="store-category-card__letter">{category.letter}</span>
              {category.slug === "customized-stories" && (
                <span className="store-category-card__floating-icon">
                  <StorybookIcon size={18} />
                </span>
              )}
              {category.slug === "printed-t-shirts" && (
                <span className="store-category-card__floating-icon">
                  <SparkleStar size={15} />
                </span>
              )}
            </div>
            <small>DAISY DESIGNS / {t("categoryLabel")}</small>
          </div>
        )}

        <div className={`store-category-card__index ${categoryImage ? "store-category-card__index--on-image" : ""}`} aria-hidden="true">
          <span>{indexStr}</span>
          <span className="store-category-card__index-rule" />
          <span className="store-category-card__flower-badge">
            <DaisyFlower size={13} />
          </span>
        </div>

        <span className={`store-category-card__badge ${isLive ? "store-category-card__badge--live" : "store-category-card__badge--soon"}`}>
          {isLive ? (locale === "ar" ? "متاح للطلب" : "Available Now") : t("comingSoonBadge")}
        </span>

        <div className="store-category-card__corner store-category-card__corner--tl" aria-hidden="true" />
        <div className="store-category-card__corner store-category-card__corner--tr" aria-hidden="true" />
        <div className="store-category-card__corner store-category-card__corner--bl" aria-hidden="true" />
        <div className="store-category-card__corner store-category-card__corner--br" aria-hidden="true" />
      </div>

      <div className="store-category-card__content">
        <div className="store-category-card__title">
          <Heading>{name}</Heading>
          <span className="store-category-card__arrow" aria-hidden="true">↗</span>
        </div>
        <p className="store-category-card__tagline">{tagline}</p>
        {showDescription && <p className="store-category-card__description">{description}</p>}
        {showNotice && notice && <span className="store-category-card__notice">{notice}</span>}
        <div className="store-category-card__action">
          <span>{t("exploreCategory")}</span>
          <span className="store-category-card__action-arrow" aria-hidden="true">
            {locale === "ar" ? "←" : "→"}
          </span>
        </div>
      </div>
    </Link>
  );
}
