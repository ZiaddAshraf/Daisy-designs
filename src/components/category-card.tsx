import Image from "@/components/site-image";
import Link from "next/link";
import type { StoreCategory } from "@/lib/store-categories";
import {
  categoryNameForLocale,
  categoryTaglineForLocale,
} from "@/lib/store-categories";
import type { Locale } from "@/lib/locale";
import { ArrowLeft, ArrowRight } from "lucide-react";

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

const SHORT_SUBTITLES: Record<string, { ar: string; en: string }> = {
  "stickers": {
    ar: "استيكرات وميداليات مقاومة للماء",
    en: "Waterproof labels & keychains",
  },
  "reward-cards": {
    ar: "١٠ كروت تحفيزية بعلبة أنيقة",
    en: "10 positive affirmation cards",
  },
  "customized-stories": {
    ar: "قصص مطبوعة باسم وصورة طفلك",
    en: "Personalized storybooks for kids",
  },
  "printed-t-shirts": {
    ar: "قطن مصري ١٠٠٪ مخصص بالطباعة",
    en: "100% Egyptian custom cotton tees",
  },
};

export function CategoryCard({
  category,
  locale,
  headingTag = "h3",
}: CategoryCardProps) {
  const isAr = locale === "ar";
  const name = categoryNameForLocale(category, locale);
  const fallbackTagline = categoryTaglineForLocale(category, locale);
  const subtitle = SHORT_SUBTITLES[category.slug]?.[isAr ? "ar" : "en"] || fallbackTagline;
  const Heading = headingTag;
  const categoryImage = CATEGORY_IMAGES[category.slug];
  const Arrow = isAr ? ArrowLeft : ArrowRight;
  const actionLabel = isAr ? "تصفحي القسم" : "Explore";

  return (
    <Link
      href={`/categories/${category.slug}`}
      className="store-category-card group"
      data-scroll-reveal
      suppressHydrationWarning
      aria-label={`${name} — ${actionLabel}`}
    >
      {/* Cover Image */}
      <div className="store-category-card__cover">
        {categoryImage ? (
          <Image
            src={categoryImage}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1040px) 50vw, 25vw"
            className="store-category-card__cover-image"
          />
        ) : null}
      </div>

      {/* Clean, Non-Cluttered Details */}
      <div className="store-category-card__content">
        <div className="store-category-card__info">
          <Heading className="store-category-card__name">{name}</Heading>
          {subtitle && <p className="store-category-card__sub">{subtitle}</p>}
        </div>

        <div className="store-category-card__action !bg-zinc-900 !text-white hover:!bg-zinc-800 transition-colors">
          <span className="!text-white font-bold">{actionLabel}</span>
          <Arrow size={14} className="store-category-card__action-icon shrink-0 !text-white" />
        </div>
      </div>
    </Link>
  );
}
