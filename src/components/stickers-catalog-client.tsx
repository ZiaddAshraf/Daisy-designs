"use client";

import { useState, useMemo, useEffect, useRef, useCallback, type ChangeEvent, type FormEvent } from "react";
import SiteImage from "@/components/site-image";
import {
  Search,
  Heart,
  ChevronDown,
  X,
  Layers,
  Tag,
  Check,
  ShoppingBag,
  Minus,
  Plus,
  ChevronLeft,
  ChevronRight,
  User,
  Phone,
  School,
  GraduationCap,
  Hash,
  Palette,
  Camera,
  Trash2,
  ShieldCheck,
} from "lucide-react";
import { TinyDaisyDoodle } from "@/components/decorative-marks";
import { useWishlist, useCart } from "@/components/storefront";
import { formatPrice } from "@/lib/products";
import { validateEgyptianPhone } from "@/lib/customization-validation";
import stickersData from "@/data/stickers-product.json";
import type { Locale } from "@/lib/locale";

type StickersCatalogClientProps = {
  locale: Locale;
};

// Design badges for the bottom-left arched cutout tab
const DESIGN_BADGES: Record<number, { en: string; ar: string }> = {
  0: { en: "Custom", ar: "مخصص" },
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

type StickerDesign = (typeof stickersData.product.designs)[0];

export function StickersCatalogClient({
  locale,
}: StickersCatalogClientProps) {
  const isAr = locale === "ar";
  const { product } = stickersData;
  const { toggle, has } = useWishlist();
  const { add } = useCart();

  // Search, Filter, Sort
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTheme, setSelectedTheme] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  // Inline Customization Modal State
  const [customizingDesign, setCustomizingDesign] = useState<StickerDesign | null>(null);
  const [childName, setChildName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [grade, setGrade] = useState("");
  const [className, setClassName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [customDesignText, setCustomDesignText] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Validation States
  const [nameError, setNameError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [customTextError, setCustomTextError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success Confirmation Pill
  const [successToast, setSuccessToast] = useState<{
    designName: string;
    quantity: number;
  } | null>(null);

  const customizeCloseBtnRef = useRef<HTMLButtonElement | null>(null);

  // Accessibility: manage body scroll & focus trap when modal is open
  useEffect(() => {
    if (customizingDesign !== null) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => customizeCloseBtnRef.current?.focus());
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [customizingDesign]);

  // Keyboard navigation for Modal (Esc to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && customizingDesign !== null) {
        setCustomizingDesign(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [customizingDesign]);

  // Dismiss toast after 4s
  useEffect(() => {
    if (!successToast) return;
    const timer = setTimeout(() => setSuccessToast(null), 4000);
    return () => clearTimeout(timer);
  }, [successToast]);

  // Mobile theme quick-filter pills
  const themes = useMemo(
    () => [
      { id: "all", label: isAr ? "الكل (٢٥)" : "All (25)" },
      { id: "custom", label: isAr ? "صمّم بنفسك" : "Custom Design" },
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

  // Open inline customization for a selected design
  const handleOpenCustomize = useCallback((design: StickerDesign) => {
    setCustomizingDesign(design);
    setChildName("");
    setSchoolName("");
    setGrade("");
    setClassName("");
    setParentPhone("");
    setCustomDesignText("");
    setPhotoFile(null);
    setPhotoPreview(null);
    setPhotoUrl(null);
    setQuantity(1);
    setNameError(false);
    setPhoneError(false);
    setCustomTextError(false);
  }, []);

  // Handle Photo File Upload
  const handlePhotoChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert(isAr ? "حجم الصورة يجب ألا يتجاوز 5 ميجابايت." : "Photo size must be under 5MB.");
      return;
    }

    setPhotoFile(file);
    const localUrl = URL.createObjectURL(file);
    setPhotoPreview(localUrl);

    setIsUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/uploads/customization", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setPhotoUrl(data.url);
      } else {
        console.error("Photo upload failed");
      }
    } catch (err) {
      console.error("Photo upload error:", err);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setPhotoUrl(null);
  };

  // Add to cart with full validation
  const handleAddToCart = (e: FormEvent) => {
    e.preventDefault();
    if (!customizingDesign) return;

    // 1. Validate Child's Name (Required & Preserves Exact Case)
    const trimmedName = childName.trim();
    if (!trimmedName) {
      setNameError(true);
      return;
    }
    setNameError(false);

    // 2. Validate Parent's Egyptian Phone (Required per specification)
    const trimmedPhone = parentPhone.trim();
    if (!trimmedPhone || !validateEgyptianPhone(trimmedPhone)) {
      setPhoneError(true);
      return;
    }
    setPhoneError(false);

    // 3. Validate Custom Design Description (Required for ID 0)
    if (customizingDesign.id === 0 && !customDesignText.trim()) {
      setCustomTextError(true);
      return;
    }
    setCustomTextError(false);

    setIsSubmitting(true);

    const customizationPayload: Record<string, string> = {
      design_theme: customizingDesign.slug,
      child_name: trimmedName, // Preserves exact case (e.g. Malak Khaled)
      parent_phone: trimmedPhone,
    };

    if (customizingDesign.id === 0 && customDesignText.trim()) {
      customizationPayload.custom_design_text = customDesignText.trim();
    }

    if (schoolName.trim()) customizationPayload.school_name = schoolName.trim();
    if (grade.trim()) customizationPayload.grade = grade.trim();
    if (className.trim()) customizationPayload.class_name = className.trim();
    if (photoUrl) customizationPayload.child_photo = photoUrl;

    add(
      {
        slug: product.slug, // "custom-waterproof-stickers"
        name: isAr ? product.arabicName : product.name,
        category: isAr ? stickersData.category.arabicName : stickersData.category.name,
        price: product.price, // 50
        image: customizingDesign.url,
        description: isAr ? product.arabicDescription : product.description,
        customizable: true,
        hasVariants: false,
      },
      customizationPayload,
      undefined,
      quantity
    );

    setIsSubmitting(false);
    setSuccessToast({
      designName: isAr ? customizingDesign.arabicTitle : customizingDesign.title,
      quantity,
    });
    setCustomizingDesign(null);
  };

  return (
    <div className="w-full" data-scroll-reveal suppressHydrationWarning>
      {/* 1. Category Header - Clean & Minimal */}
      <section className="mb-6 pb-6 border-b border-[var(--border)] flex flex-col md:flex-row md:items-end justify-between gap-4 text-start">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 dark:text-teal-400 mb-1.5">
            <TinyDaisyDoodle size={13} className="text-teal-600 dark:text-teal-400" />
            <span>DAISY DESIGNS / {isAr ? "استيكرات مدرسية" : "CUSTOM STICKERS"}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[var(--foreground)]">
            {isAr ? "استيكرات مدرسية مخصصة" : "Personalized School Stickers"}
          </h1>

          <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1.5 max-w-xl">
            {isAr
              ? "فينيل أصلي مقاوم للماء والحرارة، مخصص باسم طفلك ومدرسته."
              : "Waterproof vinyl stickers customized with your child's name and school."}
          </p>
        </div>

        {/* Price & Quality Badge */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="inline-flex items-center gap-2 rounded-xl bg-teal-600 dark:bg-teal-500 text-white px-3.5 py-2 text-xs sm:text-sm font-extrabold shadow-xs">
            <Tag size={14} className="shrink-0" />
            <strong className="text-sm sm:text-base">{formatPrice(product.price, locale)}</strong>
            <span className="font-normal text-teal-100 text-[11px] sm:text-xs">
              {isAr ? "للشيت" : "/ sheet"}
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 px-3 py-2 rounded-xl">
            <ShieldCheck size={14} className="shrink-0" />
            <span>{isAr ? "مقاوم للماء ١٠٠%" : "100% Waterproof"}</span>
          </div>
        </div>
      </section>

      {/* 2. Top Filter & Search Bar */}
      <div className="mb-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:max-w-lg">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isAr ? "...ابحث عن شخصية أو استيكر" : "Search characters or stickers..."}
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

        {/* Sort Dropdown */}
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

      {/* Horizontal Theme Filter Pills */}
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
        /* 3-Column Luxury Product Cards Grid with INLINE CUSTOMIZATION */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7 lg:gap-8">
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

            return (
              <article
                key={design.id}
                className="catalog-card group relative flex flex-col justify-between overflow-hidden rounded-[26px] border border-[var(--border)] bg-[var(--card)] shadow-[0_2px_14px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.45)] hover:shadow-[0_14px_34px_rgba(0,0,0,0.09)] dark:hover:shadow-[0_14px_36px_rgba(0,0,0,0.65)] hover:border-teal-600/50 dark:hover:border-teal-400/50 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Wishlist Heart Button - Top Start */}
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
                  className="catalog-card__heart absolute top-3.5 start-3.5 z-30 flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full shadow-sm transition-all duration-200 hover:scale-110 active:scale-90 cursor-pointer"
                >
                  <Heart
                    size={19}
                    strokeWidth={1.8}
                    className={
                      isFavorite
                        ? "fill-rose-500 text-rose-500"
                        : "text-[var(--muted-foreground)] hover:text-rose-500 dark:hover:text-rose-400"
                    }
                  />
                </button>

                {/* Custom Sticker Highlight Badge */}
                {design.id === 0 && (
                  <span className="absolute top-3.5 end-3.5 z-20 pointer-events-none inline-flex items-center gap-1 rounded-full bg-teal-600 dark:bg-teal-500 text-white text-[11px] font-extrabold px-3 py-1 shadow-sm">
                    {isAr ? "صمّم بنفسك" : "Custom"}
                  </span>
                )}

                {/* Card Top & Media - Interactive trigger opening customization */}
                <div
                  className="cursor-pointer"
                  onClick={() => handleOpenCustomize(design)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleOpenCustomize(design)}
                  aria-label={`${isAr ? "تخصيص" : "Customize"} ${titleLabel}`}
                >
                  {/* Sticker Image Frame - Portrait aspect ratio matching sheets, zero cropping */}
                  <div className="catalog-card__frame relative aspect-[3/4] w-full overflow-hidden p-1 sm:p-1.5 flex items-center justify-center transition-colors bg-white dark:bg-neutral-900">
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

                    {/* Arched Bottom Cutout Tab (Variant/Design Badge) */}
                    <div className="catalog-card__tab absolute bottom-0 left-5 sm:left-6 z-10 flex items-center justify-center rounded-t-xl border-t border-x px-3 sm:px-3.5 py-0.5 shadow-xs transition-colors">
                      <span className="text-[11px] font-bold tracking-tight">
                        {tagLabel}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 sm:p-5 text-start">
                    {/* Line 1: Teal Category Subtitle */}
                    <span className="catalog-card__category text-xs sm:text-[13px] font-bold block mb-1.5 transition-colors">
                      {categoryLabel}
                    </span>

                    {/* Line 2: Product Name (Title) */}
                    <h2 className="catalog-card__title text-base sm:text-lg font-extrabold line-clamp-1 mb-1.5 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                      {titleLabel}
                    </h2>

                    {/* Line 3: Short Description */}
                    <p className="catalog-card__desc text-xs sm:text-[13px] line-clamp-1 leading-relaxed">
                      {design.id === 0
                        ? isAr
                          ? "صمم استيكرك الخاص بفكرتك وبيانات طفلك"
                          : "Design your custom sticker with your idea"
                        : isAr
                        ? "فينيل مقاوم للماء باسم طفلك ومدرسته"
                        : "Waterproof vinyl with child's name"}
                    </p>
                  </div>
                </div>

                {/* Card Action & Price Footer */}
                <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-2 border-t border-[var(--border)]/70 flex items-center justify-between gap-3">
                  {/* Price: 50.00 EGP */}
                  <div className="text-start">
                    <span className="text-[11px] text-[var(--muted-foreground)] block">
                      {isAr ? "سعر الشيت" : "Sheet Price"}
                    </span>
                    <strong className="text-base sm:text-lg font-black text-teal-700 dark:text-teal-400">
                      {formatPrice(product.price, locale)}
                    </strong>
                  </div>

                  {/* Primary CTA: "خصص الآن" (Customize Now) */}
                  <button
                    type="button"
                    onClick={() => handleOpenCustomize(design)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-900 hover:bg-teal-700 text-white dark:bg-white dark:text-neutral-950 dark:hover:bg-teal-400 px-4 py-2.5 text-xs sm:text-sm font-extrabold shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer min-h-[42px]"
                  >
                    <span>{isAr ? "خصص الآن" : "Customize Now"}</span>
                    {isAr ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* 3. Inline Customization Modal on the Same Page */}
      {customizingDesign && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
          onClick={() => setCustomizingDesign(null)}
          role="dialog"
          aria-modal="true"
          aria-label={isAr ? `تخصيص ${customizingDesign.arabicTitle}` : `Customize ${customizingDesign.title}`}
        >
          <div
            className="relative max-w-4xl w-full bg-[var(--card)] rounded-3xl overflow-hidden shadow-2xl border border-[var(--border)] flex flex-col my-auto max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[var(--border)] flex items-center justify-between gap-3 bg-[var(--surface-soft)] sticky top-0 z-20">
              <div className="flex items-center gap-3 text-start">
                <div className="relative w-12 h-12 rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--background)] shrink-0">
                  <SiteImage
                    src={customizingDesign.url}
                    alt={isAr ? customizingDesign.arabicTitle : customizingDesign.title}
                    fill
                    className="object-contain p-1"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400">
                      {isAr ? customizingDesign.arabicThemeGroup : customizingDesign.themeGroup}
                    </span>
                    {customizingDesign.id === 0 && (
                      <span className="text-[10px] font-bold bg-teal-600 text-white px-2 py-0.5 rounded-full">
                        {isAr ? "تصميم مخصص" : "Custom"}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-[var(--foreground)] line-clamp-1">
                    {isAr ? customizingDesign.arabicTitle : customizingDesign.title}
                  </h3>
                </div>
              </div>

              <button
                ref={customizeCloseBtnRef}
                type="button"
                onClick={() => setCustomizingDesign(null)}
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full border border-[var(--border)] hover:bg-[var(--surface-hover)] flex items-center justify-center text-[var(--foreground)] transition-colors cursor-pointer"
                aria-label={isAr ? "إغلاق" : "Close"}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Scrollable Content: 2 Columns on Desktop */}
            <div className="overflow-y-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-[1fr_1.35fr] gap-6 lg:gap-8 text-start">
              {/* Left Column: Visual Sheet Preview & Quality Pillars */}
              <div className="flex flex-col gap-4">
                <div className="relative aspect-[3/4] max-h-[460px] rounded-2xl overflow-hidden border border-[var(--border)] bg-white dark:bg-neutral-900 p-2 flex items-center justify-center">
                  <SiteImage
                    src={customizingDesign.url}
                    alt={isAr ? customizingDesign.arabicTitle : customizingDesign.title}
                    fill
                    className="object-contain p-1"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-[var(--surface-soft)] border border-[var(--border)] space-y-2.5 text-xs">
                  <div className="flex items-center gap-2 text-teal-800 dark:text-teal-300 font-bold">
                    <ShieldCheck size={16} className="text-teal-600 dark:text-teal-400 shrink-0" />
                    <span>{isAr ? "مواصفات الشيت المعتمدة:" : "Sticker Specifications:"}</span>
                  </div>
                  <ul className="space-y-1.5 text-[var(--muted-foreground)] ps-6 list-disc">
                    <li>{isAr ? "فينيل أصلي مقاوم للماء والحرارة والغسيل" : "100% Waterproof and dishwasher-safe vinyl"}</li>
                    <li>{isAr ? "ملصقات كبيرة للدفاتر + ملصقات نحيفة للزجاجات والمقالم" : "Dual-size: Notebook labels + slim bottle strips"}</li>
                    <li>{isAr ? "ألوان زاهية ثابتة تدوم طوال العام الدراسي" : "Vivid fade-resistant UV print"}</li>
                  </ul>
                </div>
              </div>

              {/* Right Column: Interactive Customization Form */}
              <form onSubmit={handleAddToCart} className="space-y-4">
                {/* 1. Custom Design Idea Description (Required for Design ID 0) */}
                {customizingDesign.id === 0 && (
                  <div className="p-3.5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/50 space-y-2">
                    <label htmlFor="customDesignTextInput" className="block text-xs font-bold text-teal-900 dark:text-teal-200">
                      {isAr ? "فكرة أو وصف التصميم المطلوب" : "Custom Design Description"}{" "}
                      <span className="text-rose-500 font-black">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="customDesignTextInput"
                        type="text"
                        required
                        value={customDesignText}
                        onChange={(e) => {
                          setCustomDesignText(e.target.value);
                          if (customTextError) setCustomTextError(false);
                        }}
                        placeholder={isAr ? "مثال: شخصية سونيك، روبلوكس، حكاية لعبة وودي..." : "e.g. Sonic, Roblox, Toy Story Woody..."}
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-base sm:text-sm bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-teal-500 transition font-medium ${
                          customTextError ? "border-rose-500 ring-1 ring-rose-500" : "border-teal-300 dark:border-teal-700"
                        }`}
                      />
                      <Palette size={16} className="absolute end-3.5 top-3 text-teal-600 dark:text-teal-400 pointer-events-none" />
                    </div>
                    {customTextError && (
                      <p className="text-[11px] text-rose-500 font-semibold">
                        {isAr ? "يرجى كتابة فكرة أو وصف الاستيكر المطلوب." : "Please enter your custom sticker idea."}
                      </p>
                    )}
                    <p className="text-[11px] text-teal-800 dark:text-teal-300 font-medium">
                      {isAr
                        ? "صمم الاستيكر اللي أنت عايزه: اكتب أي شخصية كرتونية تحبها وسيقوم فريق Daisy Designs بتصميم الشيت بالكامل وفق طلبك."
                        : "Create any sticker you want: describe any character, and we'll craft the sheet for you."}
                    </p>
                  </div>
                )}

                {/* 2. Child Name (Required & Exact Case Preserved) */}
                <div>
                  <label htmlFor="childNameInput" className="block text-xs font-bold text-[var(--foreground)] mb-1">
                    {isAr ? "اسم الطفل المطبوع" : "Child's Printed Name"}{" "}
                    <span className="text-rose-500 font-black">*</span>
                    <span className="text-[var(--muted-foreground)] font-normal text-[11px] ms-1">
                      {isAr ? "(يدعم العربية والإنجليزية مع الحفاظ على حالة الأحرف)" : "(Exact letter case preserved)"}
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      id="childNameInput"
                      type="text"
                      required
                      value={childName}
                      onChange={(e) => {
                        setChildName(e.target.value);
                        if (nameError) setNameError(false);
                      }}
                      placeholder={isAr ? "مثال: Younis Mohamed أو يونس محمد" : "e.g. Younis Mohamed"}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-base sm:text-sm bg-transparent text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition ${
                        nameError ? "border-rose-500 ring-1 ring-rose-500" : "border-[var(--border)]"
                      }`}
                    />
                    <User size={15} className="absolute end-3.5 top-3 text-[var(--muted-foreground)] pointer-events-none" />
                  </div>
                  {nameError && (
                    <p className="text-[11px] text-rose-500 mt-1 font-semibold">
                      {isAr ? "يرجى إدخال اسم الطفل المطبوع." : "Please enter the child's printed name."}
                    </p>
                  )}
                </div>

                {/* 3. School Name & Grade (Two columns) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label htmlFor="schoolNameInput" className="block text-xs font-bold text-[var(--foreground)] mb-1">
                      {isAr ? "اسم المدرسة" : "School Name"}{" "}
                      <span className="text-[var(--muted-foreground)] font-normal text-[11px]">{isAr ? "(اختياري)" : "(Optional)"}</span>
                    </label>
                    <div className="relative">
                      <input
                        id="schoolNameInput"
                        type="text"
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        placeholder={isAr ? "مثال: St. Joseph أو مدرسة النيل" : "e.g. Nile School"}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] text-base sm:text-sm bg-transparent text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition"
                      />
                      <School size={15} className="absolute end-3.5 top-3 text-[var(--muted-foreground)] pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="gradeInput" className="block text-xs font-bold text-[var(--foreground)] mb-1">
                      {isAr ? "الصف الدراسي" : "Grade / Year"}{" "}
                      <span className="text-[var(--muted-foreground)] font-normal text-[11px]">{isAr ? "(اختياري)" : "(Optional)"}</span>
                    </label>
                    <div className="relative">
                      <input
                        id="gradeInput"
                        type="text"
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        placeholder={isAr ? "مثال: Year FS2 أو Grade 2" : "e.g. Grade 2"}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] text-base sm:text-sm bg-transparent text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition"
                      />
                      <GraduationCap size={15} className="absolute end-3.5 top-3 text-[var(--muted-foreground)] pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* 4. Class & Parent Mobile Phone (Two columns) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label htmlFor="classNameInput" className="block text-xs font-bold text-[var(--foreground)] mb-1">
                      {isAr ? "الفصل / المجموعة" : "Class / Section"}{" "}
                      <span className="text-[var(--muted-foreground)] font-normal text-[11px]">{isAr ? "(اختياري)" : "(Optional)"}</span>
                    </label>
                    <div className="relative">
                      <input
                        id="classNameInput"
                        type="text"
                        value={className}
                        onChange={(e) => setClassName(e.target.value)}
                        placeholder={isAr ? "مثال: 1B أو فصل الزهور" : "e.g. 1B"}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] text-base sm:text-sm bg-transparent text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition"
                      />
                      <Hash size={15} className="absolute end-3.5 top-3 text-[var(--muted-foreground)] pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="parentPhoneInput" className="block text-xs font-bold text-[var(--foreground)] mb-1">
                      {isAr ? "موبايل ولي الأمر" : "Parent's Phone"}{" "}
                      <span className="text-rose-500 font-black">*</span>
                      <span className="text-[var(--muted-foreground)] font-normal text-[11px] ms-1">
                        {isAr ? "(مصر: 01X)" : "(Egypt: 01X)"}
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        id="parentPhoneInput"
                        type="tel"
                        inputMode="tel"
                        required
                        dir="ltr"
                        value={parentPhone}
                        onChange={(e) => {
                          setParentPhone(e.target.value);
                          if (phoneError) setPhoneError(false);
                        }}
                        placeholder="01012345678"
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-base sm:text-sm bg-transparent text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition ${
                          phoneError ? "border-rose-500 ring-1 ring-rose-500" : "border-[var(--border)]"
                        }`}
                      />
                      <Phone size={15} className="absolute end-3.5 top-3 text-[var(--muted-foreground)] pointer-events-none" />
                    </div>
                    {phoneError && (
                      <p className="text-[11px] text-rose-500 mt-1 font-semibold">
                        {isAr
                          ? "يرجى إدخال رقم موبايل مصري صحيح مكون من 11 رقماً يبدأ بـ 010 أو 011 أو 012 أو 015."
                          : "Please enter a valid 11-digit Egyptian phone starting with 010, 011, 012, or 015."}
                      </p>
                    )}
                  </div>
                </div>

                {/* 5. Optional Child Photo or Design Reference Upload */}
                <div>
                  <label className="block text-xs font-bold text-[var(--foreground)] mb-1">
                    {customizingDesign.id === 0
                      ? isAr
                        ? "صورة التصميم أو صورة الطفل"
                        : "Design Artwork or Child's Photo"
                      : isAr
                      ? "صورة الطفل"
                      : "Child's Photo"}{" "}
                    <span className="text-[var(--muted-foreground)] font-normal text-[11px]">
                      {isAr ? "(اختياري - يمكنك رفع رسمة أو صورة خاصة)" : "(Optional - Upload reference or photo)"}
                    </span>
                  </label>

                  {photoPreview ? (
                    <div className="flex items-center gap-3 p-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)]">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-[var(--border)] shrink-0">
                        <SiteImage src={photoPreview} alt="Preview" fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-[var(--foreground)] truncate">
                          {photoFile?.name || "photo.jpg"}
                        </p>
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <Check size={12} />
                          {isUploadingPhoto
                            ? isAr ? "جاري الرفع..." : "Uploading..."
                            : isAr ? "تم الرفع بنجاح" : "Uploaded"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        aria-label={isAr ? "حذف الصورة" : "Remove photo"}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-[var(--border)] hover:border-teal-500 bg-[var(--surface-soft)] cursor-pointer transition-colors group">
                      <Camera size={16} className="text-[var(--muted-foreground)] group-hover:text-teal-600 transition-colors" />
                      <span className="text-xs font-semibold text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]">
                        {isAr ? "اضغط هنا لرفع صورة (PNG أو JPG بحد أقصى 5 ميجا)" : "Click to upload image (max 5MB)"}
                      </span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* 6 & 7. Sticky Purchase Footer on Mobile */}
                <div className="sticky bottom-0 bg-[var(--card)]/95 backdrop-blur-md -mx-4 -mb-4 sm:mx-0 sm:mb-0 p-4 sm:p-0 border-t sm:border-t-0 border-[var(--border)] space-y-3 z-10 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] sm:shadow-none">
                  {/* Quantity Stepper & Price Calculation */}
                  <div className="p-3 sm:p-4 rounded-2xl bg-[var(--surface-soft)] border border-[var(--border)] flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-[var(--foreground)]">
                        {isAr ? "عدد الشيتات:" : "Sheets:"}
                      </span>
                      <div className="flex items-center border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--card)] shadow-xs">
                        <button
                          type="button"
                          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                          className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-[var(--foreground)] hover:bg-[var(--surface-hover)] active:scale-90 text-sm font-bold transition-all cursor-pointer"
                          aria-label={isAr ? "تقليل الكمية" : "Decrease quantity"}
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-3 py-1 text-sm font-extrabold min-w-[36px] text-center text-[var(--foreground)]">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuantity((q) => Math.min(50, q + 1))}
                          className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-[var(--foreground)] hover:bg-[var(--surface-hover)] active:scale-90 text-sm font-bold transition-all cursor-pointer"
                          aria-label={isAr ? "زيادة الكمية" : "Increase quantity"}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="text-end">
                      <span className="text-[11px] text-[var(--muted-foreground)] block">
                        {isAr ? "الإجمالي لهذا الشيت" : "Line Total"}
                      </span>
                      <strong className="text-lg sm:text-xl font-black text-teal-700 dark:text-teal-400">
                        {formatPrice(product.price * quantity, locale)}
                      </strong>
                    </div>
                  </div>

                  {/* Primary Action Button: "أضف للسلة" */}
                  <button
                    type="submit"
                    disabled={isSubmitting || isUploadingPhoto}
                    className="w-full py-3.5 px-6 rounded-2xl bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white font-extrabold text-sm sm:text-base shadow-md hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer min-h-[48px]"
                  >
                    <ShoppingBag size={18} />
                    <span>
                      {isAr
                        ? `أضيفي للسلة — ${formatPrice(product.price * quantity, locale)}`
                        : `Add to Cart — ${formatPrice(product.price * quantity, locale)}`}
                    </span>
                    {isAr ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 4. Success Feedback Pill */}
      {successToast && (
        <div
          className="fixed bottom-6 end-6 z-50 bg-neutral-950 dark:bg-neutral-800 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300"
          role="status"
        >
          <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <Check size={16} />
          </div>
          <div className="text-xs text-start">
            <p className="font-bold">
              {isAr
                ? `تمت إضافة شيت "${successToast.designName}" بنجاح إلى سلتك!`
                : `Added "${successToast.designName}" to cart!`}
            </p>
            <p className="text-[11px] text-neutral-300">
              {isAr ? `الكمية: ${successToast.quantity} شيت` : `Qty: ${successToast.quantity}`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
