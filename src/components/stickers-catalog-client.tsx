"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import SiteImage from "@/components/site-image";
import { Search, Heart, ChevronDown, X, Layers } from "lucide-react";
import { useWishlist } from "@/components/storefront";
import stickersData from "@/data/stickers-product.json";
import type { Locale } from "@/lib/locale";

type StickersCatalogClientProps = {
  locale: Locale;
};

// Design badges for the bottom-left arched cutout tab
const DESIGN_BADGES: Record<number, { en: string; ar: string }> = {
  1: { en: "K-Pop", ar: "K-Pop" },
  2: { en: "Dino", ar: "داينو" },
  3: { en: "Kuromi", ar: "كورومي" },
  4: { en: "Superman", ar: "سوبرمان" },
  5: { en: "Princess", ar: "أميرات" },
  6: { en: "Safari", ar: "سفاري" },
  7: { en: "Stitch", ar: "ستيتش" },
  8: { en: "Game On", ar: "جيمنج" },
  9: { en: "Numberblocks", ar: "نامبر بلوكس" },
  10: { en: "Monsters, Inc.", ar: "المرعبين" },
  11: { en: "Barbie", ar: "باربي" },
  12: { en: "Spider-Man", ar: "سبايدرمان" },
  13: { en: "Pink Bow", ar: "فيونكة" },
  14: { en: "Powerpuff", ar: "فتيات القوة" },
  15: { en: "Barça 19", ar: "برشلونة" },
  16: { en: "Sonic", ar: "سونيك" },
  17: { en: "Naruto", ar: "ناروتو" },
  18: { en: "Brawl Stars", ar: "برول ستارز" },
  19: { en: "Super Mario", ar: "ماريو" },
  20: { en: "Frozen Elsa", ar: "فروزن" },
  21: { en: "Spider-Man Web", ar: "سبايدرمان" },
  22: { en: "Barbie Style", ar: "باربي" },
  23: { en: "Lego Bricks", ar: "مكعبات ليجو" },
  24: { en: "Superman City", ar: "سوبرمان" },
};

type SortOption = "newest" | "price-asc" | "price-desc" | "alpha";

export function StickersCatalogClient({
  locale,
}: StickersCatalogClientProps) {
  const isAr = locale === "ar";
  const { product } = stickersData;
  const { toggle, has } = useWishlist();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTheme, setSelectedTheme] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  // Mobile theme quick-filter pills
  const themes = useMemo(
    () => [
      { id: "all", label: isAr ? "الكل" : "All" },
      { id: "girls", label: isAr ? "أناقة وبنات" : "Girls & Style" },
      { id: "cartoons", label: isAr ? "كرتون وشخصيات" : "Cartoons" },
      { id: "superheroes", label: isAr ? "أبطال وخوارق" : "Superheroes" },
      { id: "gaming", label: isAr ? "ألعاب وشخصيات" : "Gaming" },
      { id: "anime", label: isAr ? "أنمي ومغامرات" : "Anime" },
      { id: "educational", label: isAr ? "تعليمي ومكعبات" : "Educational" },
      { id: "sports", label: isAr ? "كرة قدم ورياضة" : "Sports" },
    ],
    [isAr]
  );

  // Filter & Sort designs
  const processedDesigns = useMemo(() => {
    let list = [...product.designs];

    // Theme filter
    if (selectedTheme !== "all") {
      list = list.filter((item) => item.themeGroup === selectedTheme);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((item) => {
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesArabicTitle = item.arabicTitle.toLowerCase().includes(q);
        const matchesTheme = item.themeGroup.toLowerCase().includes(q);
        const matchesArabicTheme = item.arabicThemeGroup.toLowerCase().includes(q);
        const matchesSample = item.sampleName ? item.sampleName.toLowerCase().includes(q) : false;
        return (
          matchesTitle ||
          matchesArabicTitle ||
          matchesTheme ||
          matchesArabicTheme ||
          matchesSample
        );
      });
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === "alpha") {
        const nameA = isAr ? a.arabicTitle : a.title;
        const nameB = isAr ? b.arabicTitle : b.title;
        return nameA.localeCompare(nameB, isAr ? "ar" : "en");
      }
      if (sortBy === "newest") {
        return a.id - b.id;
      }
      return 0;
    });

    return list;
  }, [product.designs, selectedTheme, searchQuery, sortBy, isAr]);

  return (
    <div className="w-full" data-scroll-reveal suppressHydrationWarning>
      {/* Top Filter & Search Bar - Exactly Matching Reference Design media_1792256601127_ff2bfb58.png */}
      <div className="mb-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search Input - on RIGHT in RTL (First child in flex row) */}
        <div className="relative w-full sm:max-w-lg">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isAr ? "...ابحث عن منتج" : "Search stickers..."}
            className="w-full rounded-2xl border border-[var(--border)] bg-[var(--card)] py-3 text-xs sm:text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-teal-600 dark:focus:border-teal-400 focus:outline-none transition-colors shadow-xs"
            style={{ paddingInlineStart: "2.75rem", paddingInlineEnd: "2.5rem" }}
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className={`absolute top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] p-1 transition-colors ${
                isAr ? "left-3" : "right-3"
              }`}
              aria-label={isAr ? "مسح البحث" : "Clear search"}
            >
              <X size={15} />
            </button>
          ) : (
            <Search
              size={18}
              className={`absolute top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] pointer-events-none ${
                isAr ? "right-3.5" : "left-3.5"
              }`}
            />
          )}
        </div>

        {/* Sort Dropdown - on LEFT in RTL (Second child in flex row) */}
        <div className="relative w-full sm:w-56 shrink-0">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="w-full appearance-none rounded-2xl border border-[var(--border)] bg-[var(--card)] py-3 px-4 text-xs sm:text-sm font-semibold text-[var(--foreground)] cursor-pointer focus:border-teal-600 dark:focus:border-teal-400 focus:outline-none transition-colors shadow-xs"
            style={{ paddingInlineStart: isAr ? "2.5rem" : "1rem", paddingInlineEnd: isAr ? "1rem" : "2.5rem" }}
            aria-label={isAr ? "ترتيب حسب" : "Sort by"}
          >
            <option value="newest">{isAr ? "الأحدث" : "Newest"}</option>
            <option value="price-asc">{isAr ? "الأقل سعراً" : "Price: Low to High"}</option>
            <option value="price-desc">{isAr ? "الأعلى سعراً" : "Price: High to Low"}</option>
            <option value="alpha">{isAr ? "الاسم: أ - ي" : "Name: A to Z"}</option>
          </select>
          <ChevronDown
            size={16}
            className={`absolute top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] pointer-events-none ${
              isAr ? "left-3.5" : "right-3.5"
            }`}
          />
        </div>
      </div>

      {/* Horizontal Theme Filter Pills - Mobile Touch-Friendly Swipeable Strip */}
      <div
        className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 max-w-full touch-pan-x mb-6"
        role="tablist"
        aria-label={isAr ? "تصنيفات الاستيكرات" : "Sticker Themes"}
      >
        {themes.map((theme) => {
          const isActive = selectedTheme === theme.id;
          return (
            <button
              key={theme.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setSelectedTheme(theme.id)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold transition-all min-h-[40px] select-none cursor-pointer active:scale-95 ${
                isActive
                  ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 shadow-sm"
                  : "border border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:border-[var(--foreground)]/40 hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
              }`}
            >
              <span>{theme.label}</span>
            </button>
          );
        })}
      </div>

      {/* Empty State */}
      {processedDesigns.length === 0 ? (
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-12 text-center my-10">
          <Layers size={36} className="mx-auto text-[var(--muted-foreground)] mb-3 opacity-60" />
          <h3 className="text-base font-bold text-[var(--foreground)]">
            {isAr ? "لم نجد أي تصميم مطابق" : "No matching designs found"}
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-[var(--muted-foreground)]">
            {isAr ? "جرب البحث بكلمة أخرى أو اختيار تصنيف مختلف." : "Try adjusting your search or selecting a different theme."}
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedTheme("all");
              setSortBy("newest");
            }}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 text-xs sm:text-sm font-semibold transition-all shadow-sm min-h-[44px] cursor-pointer active:scale-95 hover:-translate-y-0.5 hover:shadow-md"
          >
            {isAr ? "إعادة تعيين البحث" : "Reset Search"}
          </button>
        </div>
      ) : (
        /* 3-Column Luxury Product Cards Grid - Matching Reference Design */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-7 lg:gap-8">
          {processedDesigns.map((design, idx) => {
            const wishlistSlug = `sticker-${design.id}-${design.slug}`;
            const isFavorite = has(wishlistSlug);

            const handleToggleWishlist = (e: React.MouseEvent) => {
              e.preventDefault();
              e.stopPropagation();
              toggle({
                slug: wishlistSlug,
                name: isAr ? design.arabicTitle : design.title,
                category: isAr ? design.arabicThemeGroup : design.themeGroup,
                price: product.price,
                image: design.url,
                description: isAr ? product.arabicDescription : product.description,
                customizable: true,
              });
            };

            const badge = DESIGN_BADGES[design.id] || { en: design.title.split(" ")[0], ar: design.title.split(" ")[0] };
            const tagLabel = badge.en;
            const categoryLabel = isAr ? design.arabicThemeGroup : design.themeGroup;
            const titleLabel = isAr ? design.arabicTitle : design.title;
            const customizerHref = `/products/custom-waterproof-stickers?design=${design.id}`;

            return (
              <article
                key={design.id}
                className="catalog-card group relative flex flex-col justify-between overflow-hidden rounded-[26px] border border-[var(--border)] bg-[var(--card)] shadow-[0_2px_14px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.45)] hover:shadow-[0_14px_34px_rgba(0,0,0,0.09)] dark:hover:shadow-[0_14px_36px_rgba(0,0,0,0.65)] hover:border-teal-600/50 dark:hover:border-teal-400/50 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Wishlist Heart Button - Top Left */}
                <button
                  type="button"
                  onClick={handleToggleWishlist}
                  aria-label={
                    isFavorite
                      ? isAr
                        ? "إزالة من قائمة الرغبات"
                        : "Remove from wishlist"
                      : isAr
                      ? "إضافة لقائمة الرغبات"
                      : "Add to wishlist"
                  }
                  className="catalog-card__heart absolute top-3.5 left-3.5 z-20 flex h-9 w-9 items-center justify-center rounded-full shadow-sm transition-all duration-200 hover:scale-110 active:scale-90 cursor-pointer"
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
                <Link href={customizerHref} className="flex flex-col flex-1 justify-between">
                  <div>
                    {/* Pastel Image Container with Arched Tab */}
                    <div className="catalog-card__frame relative aspect-[4/3] w-full overflow-hidden p-3.5 sm:p-5 flex items-center justify-center transition-colors">
                      <div className="relative h-full w-full">
                        <SiteImage
                          src={design.url}
                          alt={isAr ? design.arabicTitle : design.title}
                          fill
                          priority={idx < 6}
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-contain transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>

                      {/* Arched Bottom Cutout Tab (Variant/Design Badge) - on Left matching Reference */}
                      <div className="catalog-card__tab absolute bottom-0 left-5 sm:left-6 z-10 flex items-center justify-center rounded-t-xl border-t border-x px-3 sm:px-3.5 py-0.5 shadow-xs transition-colors">
                        <span className="text-[11px] font-bold tracking-tight">
                          {tagLabel}
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 sm:p-6 text-start">
                      {/* Line 1: Teal Category Subtitle */}
                      <span className="catalog-card__category text-xs sm:text-[13px] font-bold block mb-1.5 transition-colors">
                        {categoryLabel}
                      </span>

                      {/* Line 2: Product Name (Title) */}
                      <h2 className="catalog-card__title text-base sm:text-lg font-extrabold line-clamp-1 mb-1.5 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                        {titleLabel}
                      </h2>

                      {/* Line 3: Short Description (Truncated single line) */}
                      <p className="catalog-card__desc text-xs sm:text-[13px] line-clamp-1 leading-relaxed">
                        {isAr
                          ? "مجموعة ملصقات لاصقة مقاومة للماء باسم طفلك ومدرسته وفصله"
                          : "Personalized waterproof school sticker sheet for notebooks and bottles"}
                      </p>
                    </div>
                  </div>

                  {/* Line 4: Price at bottom - "يبدأ من 50.00 ج.م" */}
                  <div className="px-4 pb-5 sm:px-6 sm:pb-6 pt-1 text-start">
                    <div className="flex items-baseline justify-start gap-1.5">
                      <span className="catalog-card__price text-sm sm:text-base font-bold transition-colors">
                        {isAr ? "يبدأ من" : "Starts from"}
                      </span>
                      <span className="catalog-card__price text-xl sm:text-2xl font-black transition-colors">
                        {product.price.toFixed(2)}
                      </span>
                      <span className="catalog-card__price text-sm sm:text-base font-bold opacity-80 transition-colors">
                        {isAr ? "ج.م" : "EGP"}
                      </span>
                    </div>
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
