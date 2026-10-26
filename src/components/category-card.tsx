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
import { StorybookIcon } from "@/components/decorative-marks";
import { Shirt } from "lucide-react";

type CategoryCardProps = {
  category: StoreCategory;
  locale: Locale;
  index?: number;
  showNotice?: boolean;
  showDescription?: boolean;
  headingTag?: "h2" | "h3";
  clearPhotography?: boolean;
};

const CATEGORY_IMAGES: Record<string, string> = {
  "stickers": "/products/stickers/tickets-labels-studio.jpeg",
  "reward-cards": "/products/reward-cards/reward-cards-box-set.jpeg",
  "customized-stories": "/products/customized-stories/first-year-at-school/cover.jpeg",
  "printed-t-shirts": "/products/t-shirts/kids-tshirt-studio.jpeg",
};

const SHORT_TAGLINES: Record<string, { ar: string; en: string }> = {
  "stickers": {
    ar: "استيكرات مقاومة للماء، ليبل ملابس، وميداليات أكريليك مخصصة بالاسم للمدرسة",
    en: "Waterproof vinyl labels, clothing tags & personalized acrylic keychains",
  },
  "reward-cards": {
    ar: "١٠ كروت تشجيع إيجابية في علبة هدايا حصرية وأنيقة",
    en: "10 uplifting affirmation cards in a keepsake box",
  },
  "customized-stories": {
    ar: "كتب ورقية مصورة ومطبوعة بطلها طفلك بصورته واسمه",
    en: "Personalized printed books starring your child with their photo",
  },
  "printed-t-shirts": {
    ar: "قطن مصري ١٠٠٪ مريح وناعم بطباعة تدوم للكبار والأطفال",
    en: "100% Egyptian combed cotton customized for kids and adults",
  },
};

const LIVE_CATEGORY_SLUGS = new Set(["stickers", "reward-cards", "customized-stories", "printed-t-shirts"]);

export function CategoryCard({
  category,
  locale,
  showNotice = false,
  showDescription = true,
  headingTag = "h3",
  clearPhotography = false,
}: CategoryCardProps) {
  const name = categoryNameForLocale(category, locale);
  const tagline = categoryTaglineForLocale(category, locale);
  const shortTag = SHORT_TAGLINES[category.slug]?.[locale === "ar" ? "ar" : "en"];
  const displayTagline = shortTag || tagline;
  const description = categoryDescriptionForLocale(category, locale);
  const notice = categoryNoticeForLocale(category, locale);
  const t = (key: TranslationKey) => getTranslation(locale, key);
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
            {!clearPhotography && <div className="store-category-card__cover-overlay" aria-hidden="true" />}
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
                  <Shirt size={15} />
                </span>
              )}
            </div>
            <small>DAISY DESIGNS / {t("categoryLabel")}</small>
          </div>
        )}

        {!clearPhotography && <span className={`store-category-card__badge ${isLive ? "store-category-card__badge--live" : "store-category-card__badge--soon"}`}>
          {isLive ? (locale === "ar" ? "متاح للطلب" : "Available Now") : t("comingSoonBadge")}
        </span>}

        {!clearPhotography && <><div className="store-category-card__corner store-category-card__corner--tl" aria-hidden="true" />
        <div className="store-category-card__corner store-category-card__corner--tr" aria-hidden="true" />
        <div className="store-category-card__corner store-category-card__corner--bl" aria-hidden="true" />
        <div className="store-category-card__corner store-category-card__corner--br" aria-hidden="true" /></>}
      </div>

      <div className="store-category-card__content">
        {clearPhotography && <span className="home-category-availability">{isLive ? (locale === "ar" ? "متاح للطلب" : "Available now") : t("comingSoonBadge")}</span>}
        <div className="store-category-card__title">
          <Heading>{name}</Heading>
        </div>
        <p className="store-category-card__tagline">{displayTagline}</p>
        {showDescription && <p className="store-category-card__description">{description}</p>}
        {showNotice && notice && <span className="store-category-card__notice">{notice}</span>}
        <div className="store-category-card__action">
          <span>{t("exploreCategory")}</span>
        </div>
      </div>
    </Link>
  );
}
