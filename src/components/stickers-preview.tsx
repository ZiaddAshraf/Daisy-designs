"use client";

import { useState, useEffect, useCallback, useRef, type ChangeEvent, type FormEvent } from "react";
import SiteImage from "@/components/site-image";
import type { Locale } from "@/lib/locale";
import stickersData from "@/data/stickers-product.json";
import {
  TinyDaisyDoodle,
  SparkleStar,
} from "@/components/decorative-marks";
import { useCart } from "@/components/storefront";
import { formatPrice } from "@/lib/products";
import { validateEgyptianPhone } from "@/lib/customization-validation";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Maximize2,
  Heart,
  Sparkles,
  ShieldCheck,
  Layers,
  ShoppingBag,
  Check,
  Truck,
  Plus,
  Minus,
  Camera,
  Trash2,
  Palette,
  Phone,
  User,
  GraduationCap,
  School,
  Hash,
} from "lucide-react";

type StickersPreviewProps = {
  locale: Locale;
  inStock?: boolean;
};

type ThemeFilter =
  | "all"
  | "custom"
  | "superheroes"
  | "girls"
  | "gaming"
  | "cartoons"
  | "educational"
  | "sports"
  | "anime";

// Distinct tab filters
const FILTER_TABS: { id: ThemeFilter; labelAr: string; labelEn: string }[] = [
  { id: "all", labelAr: "الكل (٢٥ تصميم)", labelEn: "All (25 Designs)" },
  { id: "custom", labelAr: "تصميم مخصص", labelEn: "Custom Design" },
  { id: "superheroes", labelAr: "أبطال وخوارق", labelEn: "Superheroes" },
  { id: "girls", labelAr: "شخصيات وبنات", labelEn: "Girls & Princesses" },
  { id: "gaming", labelAr: "جيمنج وألعاب", labelEn: "Gaming" },
  { id: "cartoons", labelAr: "كرتون ومرح", labelEn: "Cartoons" },
  { id: "educational", labelAr: "تعليمي ومكعبات", labelEn: "Educational" },
  { id: "anime", labelAr: "أنمي وموسيقى", labelEn: "Anime & Music" },
  { id: "sports", labelAr: "رياضة وكرة قدم", labelEn: "Sports" },
];

const CRAFTSMANSHIP = [
  {
    icon: Layers,
    titleAr: "فينيل ألماني مقاوم للماء 100%",
    titleEn: "100% Waterproof Heavy-Duty Vinyl",
    descAr: "خامة فينيل معالجة ضد الرطوبة وغسيل زجاجات المياه دون تقشر أو بهتان.",
    descEn: "Tear-resistant, water-sealed premium vinyl safe for bottles and daily wash.",
  },
  {
    icon: ShieldCheck,
    titleAr: "قص إلكتروني دقيق بحواف ناعمة",
    titleEn: "Precision Die-Cut Contours",
    descAr: "سهلة النزع واللصق ومصممة بزوايا منحنية آمنة للاستخدام المدرسي.",
    descEn: "Pre-cut, easy-peel labels with smooth child-safe rounded corners.",
  },
  {
    icon: Sparkles,
    titleAr: "ألوان مبهجة وطباعة عالية الوضوح",
    titleEn: "Vibrant High-Definition Inks",
    descAr: "ألوان ساطعة تحافظ على بهجتها ولمعانها طوال العام الدراسي.",
    descEn: "High-resolution, fade-proof vivid inks designed for lasting vibrancy.",
  },
  {
    icon: Palette,
    titleAr: "شيت متكامل (تيكت + شريط نحيف)",
    titleEn: "Complete Two-in-One Sheet",
    descAr: "يحتوي كل شيت على ملصق كبير للدفاتر والكتب + شريط نحيف للأقلام والزجاجات.",
    descEn: "Includes generous notebook cover labels plus slim strips for stationery and bottles.",
  },
];

export function StickersPreview({ locale, inStock: inStockProp }: StickersPreviewProps) {
  const isAr = locale === "ar";
  const { product } = stickersData;
  const inStock = inStockProp ?? (product.stock !== null ? product.stock > 0 : true);
  const { add } = useCart();

  // State
  const [activeTab, setActiveTab] = useState<ThemeFilter>("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [customizingIndex, setCustomizingIndex] = useState<number | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [added, setAdded] = useState(false);

  // Customization Form State
  const [customDesignText, setCustomDesignText] = useState("");
  const [childName, setChildName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [grade, setGrade] = useState("");
  const [className, setClassName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [phoneError, setPhoneError] = useState(false);
  const [nameError, setNameError] = useState(false);

  // Load wishlist from localStorage
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("daisy_wishlist_stickers");
        if (saved === "true") {
          requestAnimationFrame(() => {
            setIsWishlisted(true);
          });
        }
      }
    } catch {
      // Ignore
    }
  }, []);

  // Check URL query param for ?design=ID to auto-open customization
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const designParam = params.get("design");
        if (designParam) {
          if (designParam === "custom" || designParam === "custom-design") {
            const foundIdx = product.designs.findIndex((d) => d.slug === "custom-design" || d.id === 0);
            if (foundIdx !== -1) {
              requestAnimationFrame(() => {
                setCustomizingIndex(foundIdx);
              });
            }
          } else {
            const designId = parseInt(designParam, 10);
            const foundIdx = product.designs.findIndex((d) => d.id === designId || d.slug === designParam);
            if (foundIdx !== -1) {
              requestAnimationFrame(() => {
                setCustomizingIndex(foundIdx);
              });
            }
          }
        }
      }
    } catch {
      // Ignore
    }
  }, [product.designs]);

  const handleToggleWishlist = () => {
    const next = !isWishlisted;
    setIsWishlisted(next);
    try {
      localStorage.setItem("daisy_wishlist_stickers", String(next));
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    if (!added) return;
    const timer = setTimeout(() => setAdded(false), 4000);
    return () => clearTimeout(timer);
  }, [added]);

  // Filtered designs
  const filteredDesigns = product.designs.filter((design) => {
    if (activeTab === "all") return true;
    return design.themeGroup === activeTab;
  });

  // Modal accessibility
  const modalCloseBtnRef = useRef<HTMLButtonElement | null>(null);
  const customizeCloseBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (lightboxIndex !== null || customizingIndex !== null) {
      document.body.style.overflow = "hidden";
      if (lightboxIndex !== null) {
        requestAnimationFrame(() => modalCloseBtnRef.current?.focus());
      } else if (customizingIndex !== null) {
        requestAnimationFrame(() => customizeCloseBtnRef.current?.focus());
      }
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightboxIndex, customizingIndex]);

  // Keyboard navigation for Lightbox
  const handlePrevDesign = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev === null || prev === 0 ? product.designs.length - 1 : prev - 1));
  }, [lightboxIndex, product.designs.length]);

  const handleNextDesign = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev === null || prev === product.designs.length - 1 ? 0 : prev + 1));
  }, [lightboxIndex, product.designs.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxIndex(null);
        setCustomizingIndex(null);
      } else if (lightboxIndex !== null) {
        if (e.key === "ArrowLeft") {
          if (isAr) handleNextDesign();
          else handlePrevDesign();
        } else if (e.key === "ArrowRight") {
          if (isAr) handlePrevDesign();
          else handleNextDesign();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, isAr, handleNextDesign, handlePrevDesign]);

  // Handle Photo File Selection & Upload
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

    // Upload to secure endpoint
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

  // Open customization modal for a specific design
  const handleOpenCustomize = (index: number) => {
    setCustomizingIndex(index);
    setLightboxIndex(null);
    setCustomDesignText("");
    setQuantity(1);
    setNameError(false);
    setPhoneError(false);
  };

  // Add to cart with full validation
  const handleAddToCart = (e: FormEvent) => {
    e.preventDefault();
    if (!inStock || customizingIndex === null) return;

    const trimmedName = childName.trim();
    if (!trimmedName) {
      setNameError(true);
      return;
    }
    setNameError(false);

    if (!validateEgyptianPhone(parentPhone)) {
      setPhoneError(true);
      return;
    }
    setPhoneError(false);

    const chosenDesign = product.designs[customizingIndex];
    if (chosenDesign.id === 0 && !customDesignText.trim()) {
      return;
    }

    const customizationPayload: Record<string, string> = {
      design_theme: chosenDesign.slug,
      child_name: trimmedName, // Preserves exact case (e.g. Malak Khaled)
      parent_phone: parentPhone.trim(),
    };

    if (chosenDesign.id === 0 && customDesignText.trim()) {
      customizationPayload.custom_design_text = customDesignText.trim();
    }

    if (schoolName.trim()) customizationPayload.school_name = schoolName.trim();
    if (grade.trim()) customizationPayload.grade = grade.trim();
    if (className.trim()) customizationPayload.class_name = className.trim();
    if (photoUrl) customizationPayload.child_photo = photoUrl;

    add(
      {
        slug: product.slug,
        name: isAr ? product.arabicName : product.name,
        category: isAr ? stickersData.category.arabicName : stickersData.category.name,
        price: product.price,
        image: chosenDesign.url,
        description: isAr ? product.arabicDescription : product.description,
        customizable: true,
        hasVariants: false,
      },
      customizationPayload,
      undefined,
      quantity
    );

    setAdded(true);
    setCustomizingIndex(null);
  };

  const activeDesign = customizingIndex !== null ? product.designs[customizingIndex] : null;
  const currentLightboxDesign = lightboxIndex !== null ? product.designs[lightboxIndex] : null;

  return (
    <div className="daisy-stickers-container max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* 1. Hero Overview Section */}
      <section className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-8 lg:gap-14 items-center pb-12 md:pb-16 border-b border-[var(--border)]">
        {/* Media Column */}
        <div className="relative group">
          <div
            className="relative aspect-[16/11] rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--card)] shadow-sm cursor-pointer transition-transform duration-300 hover:shadow-md hover:-translate-y-1"
            onClick={() => setLightboxIndex(1)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setLightboxIndex(1)}
            title={isAr ? "معاينة تصميم الشيت بالتفصيل" : "Explore sticker sheet details"}
          >
            <SiteImage
              src={product.primaryImage.url}
              alt={isAr ? product.primaryImage.arabicAlt : product.primaryImage.alt}
              fill
              priority
              sizes="(max-width: 960px) 100vw, 50vw"
              className="object-contain p-2"
            />
            <div className="absolute inset-0 bg-neutral-900/30 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity flex items-center justify-center">
              <span className="inline-flex items-center gap-2 bg-white/95 dark:bg-neutral-900/95 text-neutral-900 dark:text-neutral-100 px-4 py-2 rounded-full text-xs font-bold shadow-lg">
                <Maximize2 size={14} />
                <span>{isAr ? "معاينة التصميم بالحجم الكامل" : "View High Resolution"}</span>
              </span>
            </div>
          </div>
          <p className="mt-2 text-xs text-[var(--muted-foreground)] text-start">
            {isAr
              ? "نموذج شيت الاستيكرات المتكامل: يشمل ملصق كبير للدفاتر والكتب + شريط اسم نحيف للأقلام والزجاجات."
              : "Authentic two-in-one sticker sheet featuring notebook label and pencil/bottle strip."}
          </p>
        </div>

        {/* Info Column */}
        <div className="flex flex-col text-start">
          <div className="inline-flex items-center gap-2 self-start bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 px-3 py-1 rounded-full text-xs font-semibold text-amber-800 dark:text-amber-300 mb-4">
            <TinyDaisyDoodle size={14} className="text-amber-500" />
            <span>DAISY DESIGNS / {isAr ? "استيكرات مدرسية مخصصة" : "CUSTOM STICKERS"}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--foreground)] mb-2">
            {isAr ? product.arabicName : product.name}
          </h1>
          <p className="text-sm italic text-[var(--muted-foreground)] mb-4" dir="ltr">
            {isAr ? product.name : product.arabicName}
          </p>

          <p className="text-sm sm:text-base leading-relaxed text-[var(--foreground)]/90 mb-6">
            {isAr ? product.arabicDescription : product.description}
          </p>

          {/* Pricing & Availability Card */}
          <div className="p-4 sm:p-5 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs text-[var(--muted-foreground)] block">
                {isAr ? "السعر المعتمد" : "Confirmed Price"}
              </span>
              <div className="flex items-baseline gap-2">
                <strong className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                  {formatPrice(product.price, locale)}
                </strong>
                <span className="text-xs font-medium text-[var(--muted-foreground)]">
                  {isAr ? "لكل شيت متكامل" : "per complete sheet"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  inStock
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-300/60"
                    : "bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-300/60"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-current" />
                {inStock
                  ? isAr
                    ? "متوفر الآن للطباعة"
                    : "Available / In Stock"
                  : isAr
                  ? "غير متوفر حالياً"
                  : "Out of Stock"}
              </span>

              <button
                type="button"
                onClick={handleToggleWishlist}
                className={`p-2.5 rounded-xl border border-[var(--border)] transition-colors ${
                  isWishlisted
                    ? "bg-rose-50 text-rose-600 border-rose-300 dark:bg-rose-950/30"
                    : "hover:bg-[var(--accent)] text-[var(--muted-foreground)]"
                }`}
                aria-label={isAr ? "إضافة للمفضلة" : "Add to wishlist"}
              >
                <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
              </button>
            </div>
          </div>

          {/* Service Notes & Surface Notice */}
          <div className="space-y-2.5 text-xs text-[var(--muted-foreground)]">
            <div className="flex items-center gap-2.5">
              <Truck size={15} className="text-amber-500 shrink-0" />
              <span>{isAr ? "شحن لجميع محافظات مصر والدفع عند الاستلام (COD)" : "Cash on Delivery across all Egypt governorates"}</span>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30 text-amber-900 dark:text-amber-300">
              <SparkleStar size={14} className="text-amber-500 shrink-0 mt-0.5" />
              <span>
                <strong>{isAr ? "تنبيه المتجر:" : "Store Notice:"}</strong>{" "}
                {isAr ? product.arabicSurfaceNotice : product.surfaceNotice}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Craftsmanship Pillars */}
      <section className="py-10 border-b border-[var(--border)]">
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] text-start mb-6">
          {isAr ? "مميزات ومواصفات خامة الاستيكر" : "Sticker Quality & Craftsmanship"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CRAFTSMANSHIP.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] flex flex-col text-start"
              >
                <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
                  <Icon size={18} />
                </div>
                <h3 className="text-sm font-bold text-[var(--foreground)] mb-1">
                  {isAr ? item.titleAr : item.titleEn}
                </h3>
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                  {isAr ? item.descAr : item.descEn}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. The 24-Design Visual Showcase */}
      <section className="pt-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 text-start">
          <div>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider block mb-1">
              {isAr ? "تصميمات حصرية ومحبوبة للأطفال" : "Exclusive Catalog"}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
              {isAr ? "اختر من بين ٢٤ تصميماً مبهراً" : "Explore All 24 Designs"}
            </h2>
          </div>
          <span className="text-xs text-[var(--muted-foreground)]">
            {isAr ? "اضغط على أي تصميم لتخصيصه باسم طفلك ومدرسته" : "Click any design to personalize with your child's details"}
          </span>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-thin">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer active:scale-95 ${
                activeTab === tab.id
                  ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 border-transparent shadow-sm"
                  : "bg-[var(--card)] text-[var(--muted-foreground)] border-[var(--border)] hover:bg-[var(--accent)] hover:text-[var(--foreground)] hover:border-[var(--foreground)]/30"
              }`}
            >
              {isAr ? tab.labelAr : tab.labelEn}
            </button>
          ))}
        </div>

        {/* Designs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredDesigns.map((design, displayIndex) => {
            const originalIndex = product.designs.findIndex((d) => d.id === design.id);
            return (
              <div
                key={design.id}
                className="group flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
              >
                {/* Image Container */}
                <div
                  className="relative aspect-[4/5] bg-neutral-50 dark:bg-neutral-900/50 cursor-pointer overflow-hidden p-2"
                  onClick={() => setLightboxIndex(originalIndex)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setLightboxIndex(originalIndex)}
                  title={isAr ? "معاينة مكبرة" : "Zoom design"}
                >
                  <SiteImage
                    src={design.url}
                    alt={isAr ? design.arabicTitle : design.title}
                    fill
                    priority={displayIndex < 4}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-3 end-3 bg-neutral-950/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-sm">
                    {design.id === 0 ? (isAr ? "✨ تصميم مخصص" : "✨ Custom") : `#${design.id}`}
                  </div>
                  <div className="absolute bottom-3 start-3 end-3 flex justify-center opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                    <span className="inline-flex items-center gap-1.5 bg-white/95 dark:bg-neutral-900/95 text-neutral-900 dark:text-neutral-100 text-[11px] font-bold px-3 py-1.5 rounded-full shadow-md">
                      <Maximize2 size={12} />
                      <span>{isAr ? "معاينة مكبرة" : "Zoom"}</span>
                    </span>
                  </div>
                </div>

                {/* Content & Actions */}
                <div className="p-4 flex flex-col flex-1 justify-between text-start border-t border-[var(--border)]">
                  <div>
                    <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 block mb-0.5">
                      {isAr ? design.arabicThemeGroup : design.themeGroup}
                    </span>
                    <h3 className="text-sm font-bold text-[var(--foreground)] line-clamp-1 mb-1">
                      {isAr ? design.arabicTitle : design.title}
                    </h3>
                    <p className="text-xs text-[var(--muted-foreground)] line-clamp-1 mb-3">
                      {design.sampleName ? `${isAr ? "نموذج:" : "Sample:"} ${design.sampleName}` : ""}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[var(--border)]/60 flex items-center justify-between gap-2">
                    <strong className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                      50 {isAr ? "ج.م" : "EGP"}
                    </strong>
                    <button
                      type="button"
                      onClick={() => handleOpenCustomize(originalIndex)}
                      className="px-3.5 py-1.5 rounded-xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold hover:opacity-95 hover:-translate-y-0.5 hover:shadow-md active:scale-95 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <span>{isAr ? "تخصيص وطلب" : "Personalize"}</span>
                      {isAr ? <ChevronLeft size={13} /> : <ChevronRight size={13} />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. High-Resolution Lightbox Modal */}
      {lightboxIndex !== null && currentLightboxDesign && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
          onClick={() => setLightboxIndex(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative max-w-2xl w-full bg-[var(--card)] rounded-2xl overflow-hidden shadow-2xl border border-[var(--border)] flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
              <div>
                <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold uppercase tracking-wider block">
                  {currentLightboxDesign.id === 0
                    ? isAr
                      ? "تصميم مخصص بالكامل"
                      : "Full Custom Design"
                    : `${isAr ? "تصميم رقم" : "Design #"} ${currentLightboxDesign.id} / 24`}
                </span>
                <h3 className="text-base font-bold text-[var(--foreground)]">
                  {isAr ? currentLightboxDesign.arabicTitle : currentLightboxDesign.title}
                </h3>
              </div>
              <button
                ref={modalCloseBtnRef}
                type="button"
                onClick={() => setLightboxIndex(null)}
                className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl hover:bg-[var(--accent)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                aria-label={isAr ? "إغلاق النافذة" : "Close modal"}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Image View */}
            <div className="relative flex-1 min-h-[380px] sm:min-h-[480px] bg-neutral-100 dark:bg-neutral-900/60 p-3 flex items-center justify-center overflow-auto">
              <SiteImage
                src={currentLightboxDesign.url}
                alt={isAr ? currentLightboxDesign.arabicTitle : currentLightboxDesign.title}
                width={currentLightboxDesign.dimensions.width}
                height={currentLightboxDesign.dimensions.height}
                priority
                className="max-h-[65vh] w-auto object-contain rounded-lg shadow-sm"
              />
            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 border-t border-[var(--border)] flex items-center justify-between gap-3 bg-[var(--card)]">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrevDesign}
                  className="p-2 rounded-xl border border-[var(--border)] hover:bg-[var(--accent)] text-xs font-bold transition flex items-center gap-1"
                  aria-label={isAr ? "التصميم السابق" : "Previous design"}
                >
                  {isAr ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                  <span>{isAr ? "السابق" : "Prev"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleNextDesign}
                  className="p-2 rounded-xl border border-[var(--border)] hover:bg-[var(--accent)] text-xs font-bold transition flex items-center gap-1"
                  aria-label={isAr ? "التصميم التالي" : "Next design"}
                >
                  <span>{isAr ? "التالي" : "Next"}</span>
                  {isAr ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                </button>
              </div>

              <div className="flex items-center gap-3">
                <strong className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                  50 {isAr ? "ج.م" : "EGP"}
                </strong>
                <button
                  type="button"
                  onClick={() => handleOpenCustomize(lightboxIndex)}
                  className="px-4 py-2 rounded-xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold hover:opacity-95 hover:-translate-y-0.5 hover:shadow-md active:scale-95 transition-all shadow cursor-pointer"
                >
                  {isAr ? "تخصيص هذا التصميم" : "Personalize This Design"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Pre-Cart Personalization Modal */}
      {customizingIndex !== null && activeDesign && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
          onClick={() => setCustomizingIndex(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative max-w-xl w-full bg-[var(--card)] rounded-2xl shadow-2xl border border-[var(--border)] overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[var(--border)]">
              <div className="flex items-center gap-3 text-start">
                <div className="relative w-12 h-14 rounded-lg overflow-hidden border border-[var(--border)] bg-neutral-100 dark:bg-neutral-800 shrink-0">
                  <SiteImage src={activeDesign.url} alt={activeDesign.title} fill sizes="48px" className="object-cover" />
                </div>
                <div>
                  <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider block">
                    {isAr ? "تخصيص شيت استيكر" : "Personalize Sticker Sheet"} (#{activeDesign.id})
                  </span>
                  <h3 className="text-sm sm:text-base font-extrabold text-[var(--foreground)] line-clamp-1">
                    {isAr ? activeDesign.arabicTitle : activeDesign.title}
                  </h3>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    50 {isAr ? "جنيه مصري للشيت" : "EGP per sheet"}
                  </span>
                </div>
              </div>

              <button
                ref={customizeCloseBtnRef}
                type="button"
                onClick={() => setCustomizingIndex(null)}
                className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl hover:bg-[var(--accent)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] active:scale-90 transition-all cursor-pointer"
                aria-label={isAr ? "إغلاق" : "Close"}
              >
                <X size={20} />
              </button>
            </div>

            {/* Customization Form */}
            <form onSubmit={handleAddToCart} className="p-4 sm:p-6 space-y-4 text-start">
              {/* Custom Design Idea / Character (Shown for Custom Sticker) */}
              {activeDesign.id === 0 && (
                <div className="p-4 rounded-2xl border-2 border-teal-500/40 bg-teal-50/60 dark:bg-teal-950/30 space-y-2">
                  <label htmlFor="customDesignTextInput" className="block text-xs font-black text-teal-900 dark:text-teal-200">
                    {isAr ? "فكرة أو شخصية التصميم المطلوب" : "Requested Design Theme or Character"}{" "}
                    <span className="text-rose-500 font-black">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="customDesignTextInput"
                      type="text"
                      required
                      value={customDesignText}
                      onChange={(e) => setCustomDesignText(e.target.value)}
                      placeholder={isAr ? "مثال: روبلوكس، حكاية لعبة وودي، باتمان، أو فكرة خاصة..." : "e.g. Roblox, Toy Story Woody, Batman, or your own idea..."}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-teal-300 dark:border-teal-700 text-sm bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-teal-500 transition font-medium"
                    />
                    <Palette size={16} className="absolute end-3.5 top-3 text-teal-600 dark:text-teal-400 pointer-events-none" />
                  </div>
                  <p className="text-[11px] text-teal-800 dark:text-teal-300 font-medium leading-relaxed">
                    {isAr
                      ? "💡 صمم الاستيكر اللي أنت عايزه: اكتب أي شخصية كرتونية أو رسمة تحبها وسيقوم فريق Daisy Designs بتصميم الشيت بالكامل وفق طلبك."
                      : "💡 Create any sticker you want: describe any character or artwork, and Daisy Designs will custom-craft the sheet for you."}
                  </p>
                </div>
              )}

              {/* Child Name (Required & Case Sensitive) */}
              <div>
                <label htmlFor="childNameInput" className="block text-xs font-bold text-[var(--foreground)] mb-1">
                  {isAr ? "اسم الطفل المطبوع" : "Child's Printed Name"}{" "}
                  <span className="text-rose-500 font-black">*</span>
                  <span className="text-[var(--muted-foreground)] font-normal text-[11px] ms-1">
                    {isAr
                      ? "(يدعم العربية والإنجليزية مع الحفاظ على حالة الأحرف)"
                      : "(Supports Arabic & English with exact case preservation)"}
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
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-transparent text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition ${
                      nameError ? "border-rose-500" : "border-[var(--border)]"
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

              {/* School & Grade (Two columns) */}
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
                      placeholder={isAr ? "مثال: St. Joseph أو مدرسة النيل" : "e.g. St. Joseph School"}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] text-sm bg-transparent text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition"
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
                      placeholder={isAr ? "مثال: Year FS2 أو الصف الثاني" : "e.g. Year FS2 / Grade 1"}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] text-sm bg-transparent text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition"
                    />
                    <GraduationCap size={15} className="absolute end-3.5 top-3 text-[var(--muted-foreground)] pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Class & Parent Mobile Phone (Two columns) */}
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
                      placeholder={isAr ? "مثال: 1B أو فصل الزهور" : "e.g. 1B / Rose"}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] text-sm bg-transparent text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition"
                    />
                    <Hash size={15} className="absolute end-3.5 top-3 text-[var(--muted-foreground)] pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label htmlFor="parentPhoneInput" className="block text-xs font-bold text-[var(--foreground)] mb-1">
                    {isAr ? "موبايل ولي الأمر" : "Parent's Phone"}{" "}
                    <span className="text-rose-500 font-black">*</span>
                    <span className="text-[var(--muted-foreground)] font-normal text-[11px] ms-1">
                      {isAr ? "(مصر: 01X)" : "(Egypt)"}
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      id="parentPhoneInput"
                      type="tel"
                      required
                      dir="ltr"
                      value={parentPhone}
                      onChange={(e) => {
                        setParentPhone(e.target.value);
                        if (phoneError) setPhoneError(false);
                      }}
                      placeholder="01012345678"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-transparent text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition ${
                        phoneError ? "border-rose-500" : "border-[var(--border)]"
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

              {/* Optional Child Photo / Artwork Upload */}
              <div>
                <label className="block text-xs font-bold text-[var(--foreground)] mb-1">
                  {activeDesign.id === 0
                    ? isAr
                      ? "صورة التصميم أو صورة الطفل"
                      : "Design Artwork or Child's Photo"
                    : isAr
                    ? "صورة الطفل"
                    : "Child's Photo"}{" "}
                  <span className="text-[var(--muted-foreground)] font-normal text-[11px]">
                    {activeDesign.id === 0
                      ? isAr
                        ? "(اختياري - يمكنك رفع رسمة أو فكرة أو صورة خاصة)"
                        : "(Optional - Upload artwork, reference, or child photo)"
                      : isAr
                      ? "(اختياري - متاح لجميع التصاميم)"
                      : "(Optional - Available for all designs)"}
                  </span>
                </label>

                {!photoPreview ? (
                  <div className="relative border-2 border-dashed border-[var(--border)] hover:border-amber-400 rounded-xl p-3.5 text-center transition cursor-pointer bg-neutral-50/60 dark:bg-neutral-900/40">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handlePhotoChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      aria-label={isAr ? "رفع صورة الطفل أو التصميم" : "Upload child photo or artwork"}
                    />
                    <div className="flex flex-col items-center justify-center">
                      <Camera size={20} className="text-amber-500 mb-1" />
                      <span className="text-xs font-bold text-[var(--foreground)]">
                        {activeDesign.id === 0
                          ? isAr
                            ? "انقر لاختيار رسمة التصميم أو صورة الطفل"
                            : "Click to upload design artwork or child's photo"
                          : isAr
                          ? "انقر لاختيار صورة طفلك"
                          : "Click to upload your child's photo"}
                      </span>
                      <span className="text-[11px] text-[var(--muted-foreground)]">
                        JPG / PNG / WEBP ({isAr ? "الحد الأقصى 5 ميجابايت" : "Max 5MB"})
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-[var(--border)] bg-neutral-50 dark:bg-neutral-900/50">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photoPreview} alt="Child preview" className="w-10 h-10 object-cover rounded-lg border border-[var(--border)]" />
                      <div>
                        <span className="text-xs font-bold text-[var(--foreground)] block truncate max-w-[200px]">
                          {photoFile?.name}
                        </span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          {isUploadingPhoto
                            ? isAr
                              ? "جارِ الرفع الآمن..."
                              : "Uploading securely..."
                            : isAr
                            ? "تم التحميل بنجاح"
                            : "Ready for printing"}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition"
                      aria-label={isAr ? "إزالة الصورة" : "Remove photo"}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* Quantity Selector & Live Total */}
              <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-[var(--foreground)]">
                    {isAr ? "عدد الشيتات:" : "Sheets:"}
                  </span>
                  <div className="flex items-center border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--background)]">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-[var(--foreground)] hover:bg-[var(--surface-hover)] active:scale-90 text-sm font-bold transition-all cursor-pointer"
                      aria-label={isAr ? "تقليل الكمية" : "Decrease quantity"}
                    >
                      <Minus size={13} />
                    </button>
                    <span className="px-3.5 py-1.5 text-sm font-extrabold min-w-[36px] text-center text-[var(--foreground)]">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(50, q + 1))}
                      className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-[var(--foreground)] hover:bg-[var(--surface-hover)] active:scale-90 text-sm font-bold transition-all cursor-pointer"
                      aria-label={isAr ? "زيادة الكمية" : "Increase quantity"}
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                </div>

                <div className="text-end">
                  <span className="text-[11px] text-[var(--muted-foreground)] block">
                    {isAr ? "الإجمالي لهذا الشيت" : "Line Total"}
                  </span>
                  <div className="flex items-baseline gap-1 justify-end">
                    <strong className="text-xl font-black text-[var(--foreground)]">
                      {formatPrice(product.price * quantity, locale)}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!inStock || isUploadingPhoto}
                className="w-full py-3.5 px-6 rounded-xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 font-extrabold text-sm shadow-md hover:opacity-95 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 cursor-pointer"
              >
                <ShoppingBag size={16} />
                <span>{isAr ? "إضافة إلى السلة" : "Add to Cart"}</span>
                {isAr ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 6. Success Notification Pill */}
      {added && (
        <div
          className="fixed bottom-6 end-6 z-50 bg-neutral-950 dark:bg-neutral-800 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce"
          role="status"
        >
          <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center">
            <Check size={14} />
          </div>
          <span className="text-xs font-bold">
            {isAr
              ? "تمت إضافة شيت الاستيكرات بنجاح إلى سلتك!"
              : "Sticker sheet added to cart successfully!"}
          </span>
        </div>
      )}
    </div>
  );
}

