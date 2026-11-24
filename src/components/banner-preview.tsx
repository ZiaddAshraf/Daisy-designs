"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/locale";
import { useCart, useWishlist } from "@/components/storefront";
import { formatPrice } from "@/lib/products";
import { useImageUpload } from "@/hooks/use-image-upload";
import { UploadFeedback } from "@/components/upload-feedback";
import bannerData from "@/data/banners-product.json";
import {
  Upload,
  Heart,
  Plus,
  Minus,
  Check,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  X,
  Maximize2,
  Palette,
  AlertCircle,
} from "lucide-react";

type BannerPreviewProps = {
  locale: Locale;
  price?: number;
  inStock?: boolean;
};

const POPULAR_THEMES = [
  { id: "tom-and-jerry", ar: "توم وجيري (مثل المعاينة)", en: "Tom & Jerry" },
  { id: "mickey-mouse", ar: "ميكي ماوس", en: "Mickey Mouse" },
  { id: "spiderman", ar: "سبايدرمان", en: "Spiderman" },
  { id: "princess", ar: "ديزني برنسيس", en: "Disney Princess" },
  { id: "safari-animals", ar: "سفاري وحيوانات الغابة", en: "Safari Animals" },
  { id: "barbie", ar: "باربي", en: "Barbie" },
  { id: "space-astronaut", ar: "الفضاء ورائد الفضاء", en: "Space Astronaut" },
  { id: "unicorn", ar: "يونيكورن وقوس قزح", en: "Unicorn" },
  { id: "football", ar: "أبطال كرة القدم", en: "Football Champions" },
  { id: "cars-lightning", ar: "سيارات سباق", en: "Racing Cars" },
];

export function BannerPreview({
  locale,
  price = 600,
  inStock = true,
}: BannerPreviewProps) {
  const router = useRouter();
  const isAr = locale === "ar";
  const { add } = useCart();
  const { has, toggle } = useWishlist();

  const product = bannerData.product;
  const isWishlisted = has(product.slug);

  // Gallery view state (0 = banner close-up, 1 = party table setup)
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const activeImage = product.gallery[activeImageIndex]?.url ?? product.primaryImage.url;

  // Customization Form State
  const [childName, setChildName] = useState("");
  const [designTheme, setDesignTheme] = useState("توم وجيري");
  const [childAge, setChildAge] = useState("");
  const [customNotes, setCustomNotes] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Child Photo Upload
  const photoUpload = useImageUpload("/api/uploads/customization", "storageKey", 4, isAr);
  const {
    file: photoFile,
    preview: photoPreviewUrl,
    key: photoStorageKey,
    busy: isUploading,
    error: uploadError,
    clear: clearPhoto,
    choose: handleFileChange,
  } = photoUpload;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const productObj = {
    slug: product.slug,
    name: isAr ? product.arabicName : product.name,
    category: isAr ? "بانرز" : "Banners",
    price: price,
    image: product.primaryImage.url,
    description: isAr ? product.arabicDescription : product.description,
    customizable: true,
    hasVariants: false,
    subtitle: isAr ? "مقاس 1.5*1.5 متر • بصورة الطفل والـ Theme" : "1.5x1.5m • Child's Photo & Theme",
    customizationTag: isAr ? "مقاس 1.5*1.5 متر" : "1.5x1.5m",
  };

  const toggleWishlist = () => {
    toggle(productObj);
  };

  const handleRemovePhoto = () => {
    clearPhoto();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validateForm = (): boolean => {
    if (!childName.trim() && !designTheme.trim() && !photoStorageKey) {
      setValidationError(
        isAr
          ? "يرجى كتابة اسم الطفل واختيار الـ Theme المفضل لمتابعة الطلب"
          : "Please provide your child's name and favorite theme"
      );
      return false;
    }
    setValidationError(null);
    return true;
  };

  const handleAddToCart = (openDrawer = true) => {
    if (!validateForm()) return;

    const customization: Record<string, string> = {
      banner_size: isAr ? "1.5 × 1.5 متر (150×150 سم)" : "1.5 x 1.5 meters",
    };

    if (childName.trim()) customization.child_name = childName.trim();
    if (designTheme.trim()) customization.design_theme = designTheme.trim();
    if (childAge.trim()) customization.child_age = childAge.trim();
    if (customNotes.trim()) customization.custom_notes = customNotes.trim();

    if (photoStorageKey) {
      customization.child_photo = photoStorageKey;
    }

    add(productObj, customization, undefined, quantity, openDrawer);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  const handleDirectBuy = () => {
    if (!validateForm()) return;
    handleAddToCart(false);
    router.push("/checkout");
  };

  const unitPrice = price;
  const totalPrice = unitPrice * quantity;

  return (
    <div className="w-full min-w-0 pb-20 md:pb-8">
      {/* Two-Column Studio Layout */}
      <div className="product-detail-layout entry-layout min-w-0">
        {/* Left Column: Visual Gallery & Banner Preview */}
        <div className="flex flex-col gap-4 min-w-0">
          <div className="relative aspect-square w-full overflow-hidden rounded-[28px] border border-slate-200/90 bg-gradient-to-b from-amber-50/40 via-white to-slate-100/60 p-4 shadow-sm dark:border-neutral-800 dark:from-neutral-900/60 dark:to-neutral-900/30">
            {/* Wishlist Button */}
            <button
              type="button"
              onClick={toggleWishlist}
              aria-label={
                isWishlisted
                  ? isAr ? "إزالة من قائمة الرغبات" : "Remove from wishlist"
                  : isAr ? "حفظ في قائمة الرغبات" : "Add to wishlist"
              }
              className={`absolute top-4 start-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-xs transition-all hover:scale-105 active:scale-95 dark:bg-neutral-800/90 ${
                isWishlisted ? "text-rose-500 hover:text-rose-600" : "text-slate-400 hover:text-rose-500 dark:text-neutral-400"
              }`}
            >
              <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
            </button>

            {/* Size & Spec Badge */}
            <span className="absolute top-4 end-4 z-20 inline-flex items-center gap-1.5 rounded-full bg-amber-500/95 text-white px-3.5 py-1 text-xs font-bold shadow-sm backdrop-blur-xs">
              <Maximize2 size={13} className="shrink-0" />
              <span>{isAr ? "مقاس 1.5 × 1.5 متر" : "1.5 × 1.5 Meters"}</span>
            </span>

            {/* Main Interactive Banner Media */}
            <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl">
              <Image
                src={activeImage}
                alt={isAr ? product.arabicName : product.name}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover rounded-2xl transition-all duration-300"
              />
            </div>
          </div>

          {/* Gallery Thumbnails */}
          <div className="grid grid-cols-2 gap-3" role="group" aria-label={isAr ? "صور البانر" : "Banner views"}>
            {product.gallery.map((item, idx) => {
              const isSelected = activeImageIndex === idx;
              return (
                <button
                  key={item.url}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`group relative flex items-center gap-3 rounded-2xl border p-2 text-start transition-all cursor-pointer ${
                    isSelected
                      ? "border-amber-500 bg-amber-50/60 dark:bg-amber-950/20 shadow-xs"
                      : "border-slate-200 bg-white hover:border-slate-300 dark:border-neutral-800 dark:bg-neutral-900"
                  }`}
                  aria-pressed={isSelected}
                >
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                    <Image
                      src={item.url}
                      alt=""
                      fill
                      sizes="56px"
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[var(--foreground)] truncate">
                      {idx === 0
                        ? isAr ? "معاينة البانر" : "Banner View"
                        : isAr ? "تنسيق الحفلة كاملة" : "Party Setup"}
                    </p>
                    <p className="text-[11px] text-[var(--muted-foreground)] truncate">
                      {idx === 0
                        ? isAr ? "ألوان وتفاصيل التصميم" : "Design Details"
                        : isAr ? "على الحائط مع الكيك" : "On wall with cake"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quality Features List */}
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-neutral-800 dark:bg-neutral-900/40">
            <h4 className="text-xs font-bold text-[var(--foreground)] mb-2.5 flex items-center gap-1.5">
              <ShieldCheck size={15} className="text-teal-600 dark:text-teal-400" />
              <span>{isAr ? "مواصفات وخامات بانر Daisy Designs" : "Daisy Designs Banner Quality"}</span>
            </h4>
            <ul className="text-xs text-[var(--muted-foreground)] space-y-1.5 ps-1">
              <li className="flex items-center gap-2">
                <Check size={13} className="text-teal-600 dark:text-teal-400 shrink-0" />
                <span>{isAr ? "مقاس مربع مثالي: 1.5 × 1.5 متر (150 سم × 150 سم)" : "Perfect square 1.5 × 1.5 m (150 × 150 cm)"}</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={13} className="text-teal-600 dark:text-teal-400 shrink-0" />
                <span>{isAr ? "خامة متينة ممتازة مقاومة للمياه والتمزق وسهلة التعليق" : "Durable, tear-resistant & waterproof material"}</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={13} className="text-teal-600 dark:text-teal-400 shrink-0" />
                <span>{isAr ? "ألوان طباعة زاهية وواضحة جداً في التصوير والإضاءة" : "Vibrant HD colors optimized for photography & lighting"}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Customization Studio Form */}
        <div className="flex flex-col gap-6 min-w-0" data-scroll-reveal>
          {/* Header & Pricing */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-400 border border-amber-500/20">
                <Sparkles size={12} />
                {isAr ? "بانرز أعياد ميلاد واحتفالات" : "Birthday & Party Banners"}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-700 dark:text-teal-400 border border-teal-500/20">
                {isAr ? "مخصص بالكامل" : "Fully Custom"}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)] tracking-tight">
              {isAr ? product.arabicName : product.name}
            </h1>

            {/* Price Row */}
            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-teal-700 dark:text-teal-400">
                {formatPrice(unitPrice, locale)}
              </span>
              <span className="text-xs text-[var(--muted-foreground)]">
                {isAr ? "(شامل التصميم والطباعة بمقاس 1.5*1.5 متر)" : "(Includes design & 1.5x1.5m printing)"}
              </span>
            </div>
          </div>

          {/* Inspirational Prompt Banner */}
          <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-500/10 via-amber-100/40 to-yellow-500/10 p-4 dark:border-amber-900/50 dark:from-amber-950/30 dark:to-yellow-950/20 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm">
                <Sparkles size={18} />
              </div>
              <div className="text-xs leading-relaxed">
                <p className="font-extrabold text-amber-900 dark:text-amber-300 text-sm">
                  {isAr
                    ? "ابعتيلنا صورة الطفل والـ theme المفضل وهنعملك أجمل بانر! ✨"
                    : "Send us the child's photo and favorite theme, and we'll craft the most beautiful banner!"}
                </p>
                <p className="text-amber-800/80 dark:text-amber-400/80 mt-1">
                  {isAr
                    ? "اختاري التصميم أو الثيم واكتبي اسم طفلك، وهنعملك أجمل بانر مناسب لاحتفالك."
                    : "Pick your theme or character and provide your child's name to craft your perfect banner."}
                </p>
              </div>
            </div>
          </div>

          {/* Customization Form */}
          <div className="space-y-5 rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
            {/* Step 1: Child Photo Upload */}
            <div>
              <label className="block text-xs font-bold text-[var(--foreground)] mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Upload size={14} className="text-teal-600 dark:text-teal-400" />
                  <span>{isAr ? "١. صورة الطفل المطبوعة على البانر (موصى بها)" : "1. Child's Photo (Recommended)"}</span>
                </span>
              </label>

              {photoPreviewUrl ? (
                <div className="flex items-center justify-between rounded-2xl border border-teal-200 bg-teal-50/50 p-3 dark:border-teal-900/60 dark:bg-teal-950/20">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-teal-300 bg-white shadow-xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photoPreviewUrl}
                        alt="Child Preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-teal-800 dark:text-teal-300">
                        <Check size={14} />
                        <span>{isAr ? "تم إرفاق صورة الطفل بنجاح" : "Photo uploaded successfully"}</span>
                      </div>
                      <p className="text-[11px] text-teal-700/80 dark:text-teal-400/80 truncate">
                        {photoFile?.name || (isAr ? "صورة مخصصة للبانر" : "Custom banner photo")}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white hover:text-rose-500 transition-colors dark:hover:bg-neutral-800"
                    title={isAr ? "حذف الصورة" : "Remove photo"}
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 p-5 text-center transition-all hover:border-amber-500 hover:bg-amber-50/30 cursor-pointer dark:border-neutral-700 dark:hover:border-amber-500 dark:hover:bg-amber-950/10"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileChange(file);
                    }}
                    disabled={isUploading}
                  />
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-2">
                    <Upload size={20} />
                  </div>
                  <p className="text-xs font-bold text-[var(--foreground)]">
                    {isUploading
                      ? (isAr ? "جارٍ رفع الصورة..." : "Uploading...")
                      : (isAr ? "اضغطي هنا لاختيار صورة طفلك" : "Click to select your child's photo")}
                  </p>
                  <p className="text-[11px] text-[var(--muted-foreground)] mt-1">
                    {isAr
                      ? "JPG أو PNG أو WebP (يُفضل صورة واضحة ومضيئة)"
                      : "JPG, PNG or WebP (Clear & bright photo recommended)"}
                  </p>
                </div>
              )}

              {photoFile && (
                <UploadFeedback
                  isAr={isAr}
                  busy={isUploading}
                  uploaded={Boolean(photoStorageKey)}
                  error={uploadError}
                  retry={photoUpload.retry}
                  remove={handleRemovePhoto}
                />
              )}
            </div>

            {/* Step 2: Theme / Character */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="banner-theme" className="text-xs font-bold text-[var(--foreground)] flex items-center gap-1.5">
                  <Palette size={14} className="text-amber-600 dark:text-amber-400" />
                  <span>{isAr ? "٢. الـ Theme المفضل أو شخصية الاحتفال *" : "2. Favorite Theme or Character *"}</span>
                </label>
                <span className="text-[11px] text-[var(--muted-foreground)]">
                  {isAr ? "اختاري أو اكتبي ثيم طفلك" : "Pick or write your theme"}
                </span>
              </div>

              <input
                id="banner-theme"
                type="text"
                value={designTheme}
                onChange={(e) => setDesignTheme(e.target.value)}
                placeholder={isAr ? "مثال: توم وجيري، ميكي ماوس، ديزني برنسيس، سبايدرمان..." : "e.g. Tom & Jerry, Mickey Mouse, Princess..."}
                maxLength={120}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs sm:text-sm font-medium focus:border-amber-500 focus:bg-white focus:outline-hidden dark:border-neutral-800 dark:bg-neutral-900/80 dark:focus:border-amber-500"
              />

              {/* Theme Quick Chips */}
              <div className="mt-2.5 flex flex-wrap gap-1.5" role="group" aria-label={isAr ? "اقتراحات الثيمات" : "Theme suggestions"}>
                {POPULAR_THEMES.map((theme) => {
                  const label = isAr ? theme.ar : theme.en;
                  const isSelected = designTheme === label;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setDesignTheme(label)}
                      className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? "bg-amber-500 text-white shadow-xs"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Child's Name */}
            <div>
              <label htmlFor="child-name" className="block text-xs font-bold text-[var(--foreground)] mb-1.5">
                <span>{isAr ? "٣. اسم الطفل المكتوب على البانر *" : "3. Child's Name on Banner *"}</span>
              </label>
              <input
                id="child-name"
                type="text"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                placeholder={isAr ? "مثال: يحيى / Yehia" : "e.g. Yehia / Noah"}
                maxLength={80}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs sm:text-sm font-medium focus:border-amber-500 focus:bg-white focus:outline-hidden dark:border-neutral-800 dark:bg-neutral-900/80 dark:focus:border-amber-500"
              />
            </div>

            {/* Step 4: Child's Age / Milestone (Optional) */}
            <div>
              <label htmlFor="child-age" className="block text-xs font-bold text-[var(--foreground)] mb-1.5">
                <span>{isAr ? "٤. عمر الطفل أو رقم العيد ميلاد (اختياري)" : "4. Child's Age / Birthday Number (Optional)"}</span>
              </label>
              <input
                id="child-age"
                type="text"
                value={childAge}
                onChange={(e) => setChildAge(e.target.value)}
                placeholder={isAr ? "مثال: سنة واحدة (1) أو 5 سنوات..." : "e.g. 1st Birthday / 5 Years"}
                maxLength={40}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs sm:text-sm font-medium focus:border-amber-500 focus:bg-white focus:outline-hidden dark:border-neutral-800 dark:bg-neutral-900/80 dark:focus:border-amber-500"
              />
            </div>

            {/* Step 5: Special Notes (Optional) */}
            <div>
              <label htmlFor="custom-notes" className="block text-xs font-bold text-[var(--foreground)] mb-1.5">
                <span>{isAr ? "٥. ملاحظات إضافية أو عبارة خاصة للتصميم (اختياري)" : "5. Additional Notes or Custom Phrase (Optional)"}</span>
              </label>
              <textarea
                id="custom-notes"
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                rows={2}
                placeholder={isAr ? "اكتبي أي عبارة خاصة تحبي نكتبها (Happy Birthday Yehia)، أو درجات الألوان المفضلة..." : "Any special phrase or color requests..."}
                maxLength={300}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs sm:text-sm font-medium focus:border-amber-500 focus:bg-white focus:outline-hidden dark:border-neutral-800 dark:bg-neutral-900/80 dark:focus:border-amber-500"
              />
            </div>

            {/* Validation Message */}
            {validationError && (
              <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/60 dark:text-rose-400">
                <AlertCircle size={15} className="shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Quantity and Actions */}
            <div className="pt-3 border-t border-slate-100 dark:border-neutral-800">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-[var(--foreground)]">
                  {isAr ? "الكمية:" : "Quantity:"}
                </span>
                <div className="flex items-center gap-3">
                  <div className="product-quantity flex items-center border border-slate-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 p-1">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-700 disabled:opacity-40 transition-colors"
                      aria-label={isAr ? "تقليل الكمية" : "Decrease quantity"}
                    >
                      <Minus size={14} />
                    </button>
                    <output className="w-9 text-center font-bold text-sm">
                      {quantity}
                    </output>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-700 transition-colors"
                      aria-label={isAr ? "زيادة الكمية" : "Increase quantity"}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <span className="text-lg font-extrabold text-teal-700 dark:text-teal-400">
                    {formatPrice(totalPrice, locale)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleAddToCart(true)}
                  disabled={!inStock}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 px-5 py-3.5 text-sm font-bold shadow-md hover:opacity-95 active:scale-98 transition-all cursor-pointer"
                >
                  <ShoppingBag size={17} />
                  <span>{isAr ? "إضافة إلى السلة" : "Add to Cart"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDirectBuy}
                  disabled={!inStock}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-amber-500 text-white px-5 py-3.5 text-sm font-bold shadow-md hover:bg-amber-600 active:scale-98 transition-all cursor-pointer"
                >
                  <Sparkles size={17} />
                  <span>{isAr ? "شراء الآن" : "Buy Now"}</span>
                </button>
              </div>

              {addedToCart && (
                <div className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-teal-50 border border-teal-200 py-2.5 text-xs font-bold text-teal-800 dark:bg-teal-950/30 dark:border-teal-900/60 dark:text-teal-300">
                  <Check size={15} />
                  <span>{isAr ? "تمت إضافة البانر المخصص إلى سلتك بنجاح!" : "Banner added to cart successfully!"}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
