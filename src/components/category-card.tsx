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

  return (
    <Link
      href={`/categories/${category.slug}`}
      className="store-category-card"
      data-scroll-reveal
      suppressHydrationWarning
    >
      <div className="store-category-card__cover">
        <div className="store-category-card__index" aria-hidden="true">
          <span>{indexStr}</span>
          <span className="store-category-card__index-rule" />
          <span className="store-category-card__flower-badge">
            <DaisyFlower size={13} />
          </span>
        </div>
        <div className="store-category-card__mark" aria-hidden="true">
          <div className="store-category-card__letter-wrap">
            <span className="store-category-card__letter">{category.letter}</span>
            {category.slug === "stickers" && (
              <span className="store-category-card__floating-icon">
                <SparkleStar size={14} />
              </span>
            )}
            {category.slug === "reward-cards" && (
              <span className="store-category-card__floating-icon">
                <SparkleStar size={16} />
              </span>
            )}
            {category.slug === "customized-stories" && (
              <span className="store-category-card__floating-icon">
                <StorybookIcon size={18} />
              </span>
            )}
          </div>
          <small>DAISY DESIGNS / {t("categoryLabel")}</small>
        </div>
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
