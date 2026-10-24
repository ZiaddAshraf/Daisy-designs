"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "@/components/site-image";
import { Search, Layers, X, Heart, ArrowLeft, ArrowRight } from "lucide-react";
import { useWishlist } from "@/components/storefront";
import { getProductImageUrl } from "@/lib/product-image";
import type { Locale } from "@/lib/locale";

export type CatalogProductItem = {
  id: string;
  slug: string;
  href: string;
  title: string;
  subtitle: string;
  category: string;
  categoryId: "stickers" | "reward-cards" | "customized-stories" | "printed-t-shirts";
  price: number;
  priceUnit: string;
  badge: string;
  image: string;
  description: string;
  features: string[];
  ctaText: string;
  themeGroup?: string;
};

type ProductsCatalogClientProps = {
  initialProducts: CatalogProductItem[];
  locale: Locale;
  translations: {
    catalogHeading: string;
    catalogTitle: string;
    home: string;
    products: string;
    searchPlaceholder: string;
    allFilter: string;
    stickersFilter: string;
    storiesFilter: string;
    cardsFilter: string;
    tshirtsFilter?: string;
    noResultsTitle: string;
    noResultsHint: string;
    resetFilters: string;
    showingCount: string;
  };
};

export function ProductsCatalogClient({
  initialProducts,
  locale,
  translations,
}: ProductsCatalogClientProps) {
  const isRtl = locale === "ar";
  const { toggle, has } = useWishlist();

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Category counts
  const counts = useMemo(() => {
    return {
      all: initialProducts.length,
      "customized-stories": initialProducts.filter((p) => p.categoryId === "customized-stories").length,
      "reward-cards": initialProducts.filter((p) => p.categoryId === "reward-cards").length,
      stickers: initialProducts.filter((p) => p.categoryId === "stickers").length,
      "printed-t-shirts": initialProducts.filter((p) => p.categoryId === "printed-t-shirts").length,
    };
  }, [initialProducts]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return initialProducts.filter((item) => {
      // Category filter
      if (activeCategory !== "all" && item.categoryId !== activeCategory) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesSubtitle = item.subtitle.toLowerCase().includes(q);
        const matchesCategory = item.category.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesTheme = item.themeGroup ? item.themeGroup.toLowerCase().includes(q) : false;
        return matchesTitle || matchesSubtitle || matchesCategory || matchesDesc || matchesTheme;
      }
      return true;
    });
  }, [initialProducts, activeCategory, searchQuery]);

  const categories = [
    { id: "all", label: translations.allFilter, count: counts.all },
    { id: "customized-stories", label: translations.storiesFilter, count: counts["customized-stories"] },
    { id: "reward-cards", label: translations.cardsFilter, count: counts["reward-cards"] },
    { id: "stickers", label: translations.stickersFilter, count: counts.stickers },
    { id: "printed-t-shirts", label: translations.tshirtsFilter || (isRtl ? "تيشيرتات" : "T-Shirts"), count: counts["printed-t-shirts"] },
  ];

  return (
    <div className="w-full">
      {/* Filter and Search Bar */}
      <div className="mb-8 flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--border)] pb-5">
        {/* Category Pills - Smooth horizontal swipeable strip on mobile */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 max-w-full touch-pan-x" role="tablist" aria-label="Product Categories">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveCategory(cat.id)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold transition-all min-h-[40px] select-none cursor-pointer active:scale-95 ${
                  isActive
                    ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 shadow-sm"
                    : "border border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:border-[var(--foreground)]/40 hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold ${
                    isActive
                      ? "bg-white/20 text-white dark:bg-neutral-950/20 dark:text-neutral-950"
                      : "bg-[var(--surface-soft)] text-[var(--muted-foreground)]"
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64 sm:shrink-0">
          <Search size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={translations.searchPlaceholder}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] py-2 ps-8 pe-7 text-xs sm:text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-teal-600 dark:focus:border-teal-400 focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute end-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              aria-label="Clear search"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Results Header */}
      <div className="mb-6 flex items-center justify-between text-xs text-[var(--muted-foreground)]">
        <span>
          {translations.showingCount.replace("{count}", String(filteredProducts.length))}
        </span>
        {(activeCategory !== "all" || searchQuery) && (
          <button
            type="button"
            onClick={() => {
              setActiveCategory("all");
              setSearchQuery("");
            }}
            className="text-teal-700 dark:text-teal-400 hover:underline font-semibold"
          >
            {translations.resetFilters}
          </button>
        )}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 ? (
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-12 text-center my-10">
          <Layers size={32} className="mx-auto text-[var(--muted-foreground)] mb-3 opacity-60" />
          <h3 className="text-base font-bold text-[var(--foreground)]">{translations.noResultsTitle}</h3>
          <p className="mt-1 text-xs sm:text-sm text-[var(--muted-foreground)]">{translations.noResultsHint}</p>
          <button
            type="button"
            onClick={() => {
              setActiveCategory("all");
              setSearchQuery("");
            }}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 text-xs sm:text-sm font-semibold transition-colors"
          >
            {translations.resetFilters}
          </button>
        </div>
      ) : (
        /* Reference-Matching 3-Column Luxury Product Cards Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-7 lg:gap-8">
          {filteredProducts.map((prod, idx) => {
            const isFavorite = has(prod.slug);

            const handleToggleWishlist = (e: React.MouseEvent) => {
              e.preventDefault();
              e.stopPropagation();
              toggle({
                slug: prod.slug,
                name: prod.title,
                category: prod.category,
                price: prod.price,
                image: getProductImageUrl(prod.image),
                description: prod.description,
                customizable: true,
              });
            };

            const tagLabel = prod.badge || prod.themeGroup || (isRtl ? "مخصص" : "Custom");

            return (
              <article
                key={prod.id}
                className="catalog-card group relative flex flex-col justify-between overflow-hidden rounded-[26px] border shadow-[0_2px_14px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.45)] hover:shadow-[0_14px_34px_rgba(0,0,0,0.09)] dark:hover:shadow-[0_14px_36px_rgba(0,0,0,0.65)] hover:border-teal-600/50 dark:hover:border-teal-400/50 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Wishlist Heart Button - Top Start */}
                <button
                  type="button"
                  onClick={handleToggleWishlist}
                  aria-label={
                    isFavorite
                      ? isRtl ? "إزالة من قائمة الرغبات" : "Remove from wishlist"
                      : isRtl ? "إضافة لقائمة الرغبات" : "Add to wishlist"
                  }
                  className="catalog-card__heart absolute top-3.5 start-3.5 z-30 flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full shadow-sm transition-all duration-200 hover:scale-110 active:scale-90 cursor-pointer"
                >
                  <Heart
                    size={18}
                    strokeWidth={1.8}
                    className={
                      isFavorite
                        ? "fill-rose-500 text-rose-500"
                        : "text-[var(--muted-foreground)] hover:text-rose-500 dark:hover:text-rose-400"
                    }
                  />
                </button>

                {/* Whole Card Link */}
                <Link href={prod.href} className="flex flex-col flex-1 justify-between">
                  <div>
                    {/* Image Container with Arched Tab */}
                    <div className="catalog-card__frame relative aspect-[4/3] p-2 sm:p-3 w-full overflow-hidden flex items-center justify-center transition-colors">
                      <div className="relative h-full w-full">
                        <Image
                          src={prod.image}
                          alt={prod.title}
                          fill
                          priority={idx < 6}
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-contain transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>

                      {/* Arched Bottom Cutout Tab (Variant/Design Badge) */}
                      <div className="catalog-card__tab absolute bottom-0 start-5 sm:start-6 z-10 flex items-center justify-center rounded-t-xl border-t border-x px-3 sm:px-3.5 py-0.5 shadow-xs transition-colors">
                        <span className="text-[11px] font-bold tracking-tight">
                          {tagLabel}
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 sm:p-6 text-start">
                      {/* Line 1: Teal Category Subtitle */}
                      <span className="catalog-card__category text-xs sm:text-[13px] font-bold block mb-1.5 transition-colors">
                        {prod.category}
                      </span>

                      {/* Line 2: Product Name (Title) */}
                      <h2 className="catalog-card__title text-base sm:text-lg font-extrabold line-clamp-1 mb-1.5 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                        {prod.title}
                      </h2>

                      {/* Line 3: Short Description (Truncated single line) */}
                      <p className="catalog-card__desc text-xs sm:text-[13px] line-clamp-1 leading-relaxed">
                        {prod.description}
                      </p>
                    </div>
                  </div>

                  {/* Line 4: Price & Clear Direct CTA Button */}
                  <div className="px-4 pb-5 sm:px-6 sm:pb-6 pt-2 border-t border-[var(--border)]/50 flex items-center justify-between gap-2">
                    <div className="flex items-baseline gap-1">
                      <span className="catalog-card__price text-xl sm:text-2xl font-black transition-colors">
                        {prod.price.toFixed(0)}
                      </span>
                      <span className="catalog-card__price text-xs sm:text-sm font-bold opacity-80 transition-colors">
                        {isRtl ? "ج.م" : "EGP"}
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 group-hover:bg-amber-600 dark:group-hover:bg-amber-400 dark:group-hover:text-black transition-all shadow-xs">
                      <span>{prod.ctaText || (isRtl ? (prod.categoryId === "reward-cards" ? "أضيفي للسلة" : "صممي واشتري") : "Customize")}</span>
                      {isRtl ? <ArrowLeft size={13} /> : <ArrowRight size={13} />}
                    </span>
                  </div>
                </Link>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
