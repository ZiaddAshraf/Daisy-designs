"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/locale";
import tshirtProductData from "@/data/tshirt-product.json";
import { TinyDaisyDoodle } from "@/components/decorative-marks";
import { useCart, useWishlist } from "@/components/storefront";
import { formatPrice } from "@/lib/products";
import { TShirtSizeGuideModal } from "@/components/tshirt-size-guide-modal";
import {
  Upload,
  Ruler,
  Clock,
  ShieldCheck,
  Check,
  ShoppingBag,
  Heart,
  AlertCircle,
  X,
  Plus,
  Minus,
  Palette,
  MessageCircle,
  Zap,
} from "lucide-react";

type TShirtPreviewProps = {
  locale: Locale;
  inStock?: boolean;
};

type GarmentColor = "white" | "black" | "gray";

export function TShirtPreview({ locale, inStock = true }: TShirtPreviewProps) {
  const router = useRouter();
  const isAr = locale === "ar";
  const { add } = useCart();
  const { has, toggle } = useWishlist();

  const product = tshirtProductData.product;
  const isWishlisted = has(product.slug);

  // Active color object
  const [selectedColor, setSelectedColor] = useState<GarmentColor>("white");
  const [selectedSize, setSelectedSize] = useState<string>("6");
  const [sizeCategory, setSizeCategory] = useState<"adults" | "children">("children");
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  const activeColorObj =
    product.colors.find((c) => c.id === selectedColor) ?? product.colors[0];

  const productObj = {
    slug: product.slug,
    name: isAr ? product.arabicName : product.name,
    category: isAr ? "تيشيرتات مطبوعة" : "Printed T-Shirts",
    price: product.price ?? 500,
    image: activeColorObj.image,
    description: isAr ? product.arabicDescription : product.description,
    customizable: true,
    hasVariants: false,
  };

  const toggleWishlist = () => {
    toggle(productObj);
  };

  // Artwork Upload state
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [artworkPreviewUrl, setArtworkPreviewUrl] = useState<string | null>(null);
  const [artworkStorageKey, setArtworkStorageKey] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Written Design Description state
  const [designText, setDesignText] = useState("");

  // Quantity & Submission state
  const [quantity, setQuantity] = useState(1);
  const unitPrice = product.price ?? 500;
  const totalPrice = unitPrice * quantity;
  const [addedToCart, setAddedToCart] = useState(false);

  // Validation Gate: Logical OR rule (has valid upload OR non-empty text >= 3 chars)
  const hasValidArtwork = Boolean(artworkStorageKey);
  const hasValidText = designText.trim().length >= 3;
  const canAddToCart = (hasValidArtwork || hasValidText) && inStock && !isUploading;

  // Handle file selection and upload
  const handleFileChange = useCallback(
    async (file: File) => {
      setUploadError(null);

      // Client-side quick check
      if (file.size > 10 * 1024 * 1024) {
        setUploadError(
          isAr
            ? "حجم الملف يتجاوز الحد الأقصى المسموح به (١٠ ميجابايت)"
            : "File size exceeds the 10MB limit"
        );
        return;
      }

      const validMimes = ["image/jpeg", "image/png", "image/webp"];
      if (!validMimes.includes(file.type)) {
        setUploadError(
          isAr
            ? "صيغة الملف غير مدعومة. يُرجى اختيار صورة بصيغة PNG أو JPG أو WebP"
            : "Unsupported file format. Please upload a PNG, JPG, or WebP image"
        );
        return;
      }

      setArtworkFile(file);
      const localUrl = URL.createObjectURL(file);
      setArtworkPreviewUrl(localUrl);
      setIsUploading(true);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/uploads/tshirt-artwork", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || data.error || "Upload failed");
        }

        setArtworkStorageKey(data.storageKey);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Upload error";
        setUploadError(message);
        setArtworkStorageKey(null);
      } finally {
        setIsUploading(false);
      }
    },
    [isAr]
  );

  const handleRemoveArtwork = () => {
    if (artworkPreviewUrl && artworkPreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(artworkPreviewUrl);
    }
    setArtworkFile(null);
    setArtworkPreviewUrl(null);
    setArtworkStorageKey(null);
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Add to Cart handler
  const handleAddToCart = () => {
    if (!canAddToCart) return;

    const customization: Record<string, string> = {
      garment_color: selectedColor,
      garment_size: selectedSize,
      print_placement: "center_chest",
    };

    if (artworkStorageKey) {
      customization.custom_design_file = artworkStorageKey;
      customization.custom_design_filename = artworkFile?.name || "artwork.png";
    }

    if (designText.trim()) {
      customization.custom_design_text = designText.trim();
    }

    add(
      productObj,
      customization,
      undefined,
      quantity
    );

    setAddedToCart(true);
  };

  const handleDirectBuy = () => {
    if (!canAddToCart) {
      const el = document.getElementById("tshirt-artwork-section") || document.getElementById("tshirt-design-text");
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      setUploadError(
        isAr
          ? "يرجى رفع تصميم أو كتابة وصف للطلب للمتابعة"
          : "Please upload artwork or enter a design description"
      );
      return;
    }
    handleAddToCart();
    router.push("/checkout");
  };

  return (
    <div className="w-full min-w-0 pb-20 md:pb-0">
      {/* Main Studio Two-Column Grid */}
      <div className="grid gap-8 lg:grid-cols-12 lg:items-start min-w-0">
        {/* Left Column: Interactive Garment Mockup & Chest Overlay */}
        <div className="lg:col-span-7 flex flex-col gap-4 min-w-0">
          <div className="relative aspect-square w-full overflow-hidden rounded-[32px] border border-slate-200/80 bg-gradient-to-b from-slate-50/80 to-slate-100/50 p-6 shadow-sm dark:border-neutral-800 dark:from-neutral-900/60 dark:to-neutral-900/30">
            {/* Top-Start Wishlist Floating Heart Button */}
            <button
              type="button"
              onClick={toggleWishlist}
              aria-label={
                isWishlisted
                  ? isAr
                    ? "إزالة من قائمة الرغبات"
                    : "Remove from wishlist"
                  : isAr
                  ? "حفظ في قائمة الرغبات"
                  : "Add to wishlist"
              }
              className={`absolute top-5 start-5 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-xs transition-all hover:scale-105 active:scale-95 dark:bg-neutral-800/90 ${
                isWishlisted
                  ? "text-rose-500 hover:text-rose-600"
                  : "text-slate-400 hover:text-rose-500 dark:text-neutral-400"
              }`}
            >
              <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
            </button>

            {/* Print Placement Tag Top End */}
            <span className="absolute top-5 end-5 z-20 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3.5 py-1 text-xs font-semibold text-teal-700 shadow-xs backdrop-blur-xs border border-teal-100 dark:bg-neutral-800/90 dark:text-teal-300 dark:border-teal-900/50">
              <Palette size={13} className="text-teal-600 dark:text-teal-400" />
              <span>{isAr ? "طباعة منتصف الصدر" : "Center Chest Print"}</span>
            </span>

            {/* Base T-Shirt Garment Mockup Image */}
            <div className="relative flex h-full w-full items-center justify-center">
              <Image
                src={activeColorObj.image}
                alt={isAr ? activeColorObj.arabicName : activeColorObj.name}
                width={800}
                height={800}
                priority
                className="h-full w-full object-contain transition-all duration-300 select-none"
              />

              {/* Dynamic Live Center Chest Artwork Overlay */}
              {artworkPreviewUrl ? (
                <div
                  className="absolute z-10 flex items-center justify-center pointer-events-none transition-all duration-300"
                  style={{
                    top: "34%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "22%",
                    height: "25%",
                  }}
                >
                  <div className="relative h-full w-full flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={artworkPreviewUrl}
                      alt="Customer Artwork Preview"
                      className="max-h-full max-w-full object-contain drop-shadow-sm rounded-xs"
                    />
                  </div>
                </div>
              ) : (
                /* Subtle, professional print area guide overlay (only visible before upload) */
                <div
                  className="absolute z-10 flex flex-col items-center justify-center pointer-events-none rounded-xl border border-dashed border-slate-400/25 dark:border-neutral-500/25 bg-slate-500/[0.02] transition-opacity duration-300 px-2"
                  style={{
                    top: "34%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "22%",
                    height: "25%",
                  }}
                  aria-hidden="true"
                >
                  <span className="text-[10px] font-semibold tracking-wider text-slate-400/75 dark:text-neutral-400/75">
                    {isAr ? "منطقة الطباعة" : "Print Area"}
                  </span>
                  <span className="text-[9px] text-slate-400/55 dark:text-neutral-500/55 mt-0.5">
                    {isAr ? "منتصف الصدر" : "Center Chest"}
                  </span>
                </div>
              )}
            </div>

            {/* Bottom Disclaimer */}
            <div className="absolute bottom-4 inset-x-4 z-20 text-center">
              <span className="inline-block rounded-full bg-white/85 px-4 py-1 text-[11px] font-medium text-slate-500 shadow-2xs backdrop-blur-xs border border-slate-200/50 dark:bg-neutral-900/85 dark:text-neutral-400 dark:border-neutral-800">
                {isAr
                  ? "معاينة تقريبية على منتصف الصدر — التصميم النهائي يخضع لتنسيق فريق العمل"
                  : "Approximate preview on center chest — final proof confirmed with our team"}
              </span>
            </div>
          </div>

          {/* Color Switcher Quick Row Under Mockup */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-2xs dark:border-neutral-800/80 dark:bg-neutral-900">
            <span className="text-xs font-semibold text-slate-600 dark:text-neutral-300">
              {isAr ? "ألوان التيشيرت السادة المتاحة:" : "Available plain garment colors:"}
            </span>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {product.colors.map((c) => {
                const isActive = selectedColor === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedColor(c.id as GarmentColor)}
                    className={`group flex min-h-[40px] items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? "bg-slate-900 text-white shadow-xs dark:bg-white dark:text-neutral-950 ring-2 ring-teal-500/50"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-neutral-800 dark:text-neutral-300"
                    }`}
                  >
                    <span
                      className="h-3.5 w-3.5 rounded-full border border-slate-300 shadow-2xs dark:border-neutral-700"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span>{isAr ? c.arabicName : c.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Customizer Studio & Purchase Controls */}
        <div className="lg:col-span-5 flex flex-col gap-6 min-w-0">
          {/* Header Info */}
          <div>
            <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 text-xs font-bold tracking-wider uppercase mb-1">
              <span>DAISY DESIGNS / {isAr ? "تيشيرتات كبار وأطفال" : "ADULT & KIDS APPAREL"}</span>
              <TinyDaisyDoodle size={13} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-neutral-100 tracking-tight">
              {isAr ? product.arabicName : product.name}
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-neutral-400 leading-relaxed">
              {isAr ? product.arabicDescription : product.description}
            </p>
          </div>

          {/* Pricing & Prep SLA Card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-baseline justify-between gap-4">
              <div>
                <span className="text-3xl font-black text-teal-600 dark:text-teal-400">
                  {formatPrice(totalPrice, locale)}
                </span>
                <span className="block text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">
                  {quantity > 1
                    ? isAr
                      ? `إجمالي ${quantity} تيشيرتات (${formatPrice(unitPrice, locale)} للتيشيرت)`
                      : `Total for ${quantity} shirts (${formatPrice(unitPrice, locale)} each)`
                    : isAr
                    ? "للتيشيرت الواحد شامل الطباعة على الصدر"
                    : "per shirt including center chest printing"}
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border border-teal-200/50 dark:border-teal-800/50">
                <Clock size={13} />
                <span>{isAr ? "تجهيز ٢ - ٣ أيام" : "2–3 days prep"}</span>
              </span>
            </div>
          </div>

          {/* Size Selector with Inline Size Guide Link */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-neutral-100">
                {isAr ? "اختيار المقاس (كبار وأطفال):" : "Select Size (Adults & Kids):"}
              </span>
              <button
                type="button"
                onClick={() => setIsSizeGuideOpen(true)}
                className="inline-flex min-h-[44px] items-center gap-1.5 px-2 text-xs font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 transition-colors cursor-pointer"
              >
                <Ruler size={14} />
                <span>{isAr ? "دليل المقاسات" : "Size Guide"}</span>
              </button>
            </div>

            {/* Segmented Category Buttons (Adults vs Kids) */}
            <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-neutral-800/80 border border-slate-200/50 dark:border-neutral-700/50">
              <button
                type="button"
                onClick={() => {
                  setSizeCategory("adults");
                  if (!["S", "M", "L", "XL", "XXL"].includes(selectedSize)) {
                    setSelectedSize("L");
                  }
                }}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  sizeCategory === "adults"
                    ? "bg-white text-teal-700 shadow-xs dark:bg-neutral-900 dark:text-teal-300 ring-1 ring-slate-200/80 dark:ring-neutral-700"
                    : "text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-neutral-200"
                }`}
              >
                {isAr ? "مقاسات الكبار (S - XXL)" : "Adult Sizes (S - XXL)"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSizeCategory("children");
                  if (["S", "M", "L", "XL", "XXL"].includes(selectedSize)) {
                    setSelectedSize("6");
                  }
                }}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  sizeCategory === "children"
                    ? "bg-white text-teal-700 shadow-xs dark:bg-neutral-900 dark:text-teal-300 ring-1 ring-slate-200/80 dark:ring-neutral-700"
                    : "text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-neutral-200"
                }`}
              >
                {isAr ? "مقاسات الأطفال (سن ٢ - ١٦)" : "Kids Sizes (2 - 16)"}
              </button>
            </div>

            {/* Size Pills for Active Category */}
            <div className={`grid gap-2 ${sizeCategory === "adults" ? "grid-cols-5" : "grid-cols-4 sm:grid-cols-8"}`}>
              {product.sizes
                .filter((s) => ((s as { group?: string }).group ?? "children") === sizeCategory)
                .map((s) => {
                  const isSelected = selectedSize === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedSize(s.id)}
                      className={`flex h-12 flex-col items-center justify-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? "bg-teal-600 text-white shadow-xs scale-102 ring-2 ring-teal-500/50"
                          : "bg-slate-50 text-slate-700 hover:bg-slate-100 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700/60 border border-slate-200/60 dark:border-neutral-700/40"
                      }`}
                    >
                      <span className="font-extrabold">{s.label}</span>
                      <span className="text-[10px] font-normal opacity-80">{s.widthCm} سم</span>
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Customization Studio (Upload & Description Zone) */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 space-y-4">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-neutral-100 flex items-center justify-between">
              <span>{isAr ? "تخصيص التصميم المطلوب" : "Custom Artwork & Description"}</span>
              <span className="text-[11px] font-normal text-slate-400">
                {isAr ? "(صورة، وصف، أو كلاهما)" : "(Image, text, or both)"}
              </span>
            </h3>

            {/* Option A: Artwork Upload Zone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1.5">
                {isAr ? "١. رفع صورة التصميم أو الفكرة المرجعية:" : "1. Upload design or reference image:"}
              </label>

              {!artworkStorageKey ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 p-5 text-center transition-colors hover:border-teal-400 hover:bg-teal-50/20 cursor-pointer dark:border-neutral-700 dark:bg-neutral-800/40 dark:hover:border-teal-500/50"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileChange(file);
                    }}
                  />
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-500 shadow-2xs dark:bg-neutral-700 dark:text-neutral-300 mb-2">
                    <Upload size={18} />
                  </div>
                  <p className="text-xs font-semibold text-slate-700 dark:text-neutral-200">
                    {isUploading
                      ? isAr
                        ? "جارٍ رفع وفحص الصورة..."
                        : "Uploading and validating..."
                      : isAr
                      ? "اضغط لاختيار صورة، أو اسحب وأفلت الملف هنا"
                      : "Click to browse, or drag & drop file here"}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-neutral-500 mt-0.5">
                    PNG, JPG, WebP ({isAr ? "بحد أقصى ١٠ ميجابايت" : "up to 10MB"})
                  </p>
                </div>
              ) : (
                /* Uploaded Artwork Preview Card */
                <div className="flex items-center justify-between rounded-xl border border-teal-200 bg-teal-50/50 p-3.5 dark:border-teal-900/50 dark:bg-teal-950/30">
                  <div className="flex items-center gap-3 min-w-0">
                    {artworkPreviewUrl && (
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-teal-200 dark:border-teal-800 bg-white">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={artworkPreviewUrl}
                          alt="Uploaded artwork"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-teal-800 dark:text-teal-200">
                        <Check size={14} className="text-teal-600 dark:text-teal-400 shrink-0" />
                        <span className="truncate">{artworkFile?.name ?? "artwork"}</span>
                      </div>
                      <span className="text-[11px] text-teal-600 dark:text-teal-400">
                        {isAr ? "تم حفظ الصورة وتأمينها بنجاح للطباعة" : "Secured for printing"}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveArtwork}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-white hover:text-slate-700 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                    aria-label={isAr ? "حذف الملف" : "Remove file"}
                  >
                    <X size={15} />
                  </button>
                </div>
              )}

              {uploadError && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400">
                  <AlertCircle size={14} />
                  <span>{uploadError}</span>
                </div>
              )}
            </div>

            {/* Option B: Design Description Field */}
            <div>
              <label
                htmlFor="tshirt-design-text"
                className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1.5"
              >
                {isAr ? "٢. وصف فكرة التصميم أو تفاصيل إضافية:" : "2. Design description or additional notes:"}
              </label>
              <textarea
                id="tshirt-design-text"
                rows={3}
                value={designText}
                maxLength={500}
                onChange={(e) => setDesignText(e.target.value)}
                placeholder={
                  isAr
                    ? "اكتب فكرة التصميم، أي عبارات أو أسماء ترغب بكتابتها، أو ألوان مفضلة وملاحظات خاصة بالطباعة..."
                    : "Describe your desired design, any names or words to print, preferred colors, or notes..."
                }
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-base sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500 transition-all resize-none"
              />
              <div className="mt-1 flex justify-end">
                <span className="text-[10px] text-slate-400 dark:text-neutral-500">
                  {designText.length} / 500
                </span>
              </div>
            </div>

            {/* Manual Review & WhatsApp Communication Banner */}
            <div className="flex items-start gap-2.5 rounded-xl border border-teal-100 bg-teal-50/60 p-3 text-xs leading-relaxed text-teal-900 dark:border-teal-900/40 dark:bg-teal-950/30 dark:text-teal-200">
              <MessageCircle size={16} className="text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
              <p>
                {isAr
                  ? "ملاحظة هامة وتأكيد الطلب: طلبات الطباعة المخصصة لا تتم برمجتها آلياً. يقوم فريق المتجر بمراجعة كل طلب بدقة للتأكد من جودة الصورة، وسنتواصل معكم هاتفياً أو عبر الواتساب لتأكيد الشكل النهائي قبل بدء الطباعة."
                  : "Important Notice: Custom print orders are not automatically converted. Our team manually reviews every request for print viability and contacts you via WhatsApp to confirm the final proof before printing."}
              </p>
            </div>
          </div>

          {/* Quantity & Add to Cart Controls */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              {/* Stepper */}
              <div
                className="flex items-center justify-between sm:justify-start rounded-full border border-slate-200 bg-white p-1 dark:border-neutral-800 dark:bg-neutral-900 shadow-2xs"
                role="group"
                aria-label={isAr ? "الكمية" : "Quantity"}
              >
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="flex h-11 w-11 min-w-[44px] min-h-[44px] items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 disabled:opacity-40 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                  aria-label={isAr ? "تقليل الكمية" : "Decrease quantity"}
                >
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center font-bold text-sm text-slate-900 dark:text-neutral-100">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                  disabled={quantity >= 10}
                  className="flex h-11 w-11 min-w-[44px] min-h-[44px] items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 disabled:opacity-40 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                  aria-label={isAr ? "زيادة الكمية" : "Increase quantity"}
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Add to Cart CTA */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!canAddToCart}
                className={`w-full sm:flex-1 min-h-[48px] flex items-center justify-center gap-2 rounded-full py-3.5 px-6 font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer active:scale-[0.98] ${
                  addedToCart
                    ? "bg-teal-600 text-white"
                    : canAddToCart
                    ? "bg-slate-900 text-white hover:bg-slate-800 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-white"
                    : "bg-slate-200 text-slate-400 dark:bg-neutral-800 dark:text-neutral-600 cursor-not-allowed"
                }`}
              >
                {addedToCart ? (
                  <>
                    <Check size={18} />
                    <span>{isAr ? "تمت الإضافة إلى السلة!" : "Added to Cart!"}</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={18} />
                    <span>
                      {!hasValidArtwork && !hasValidText
                        ? isAr
                          ? "أرفق تصميماً أو اكتب وصفاً للإضافة"
                          : "Add image or text to order"
                        : isAr
                        ? `أضف إلى السلة — ${formatPrice(totalPrice, locale)}`
                        : `Add to Cart — ${formatPrice(totalPrice, locale)}`}
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Direct Buy CTA */}
            <button
              type="button"
              onClick={handleDirectBuy}
              className="w-full min-h-[48px] flex items-center justify-center gap-2 rounded-full py-3.5 px-6 font-extrabold text-xs sm:text-sm bg-amber-500 hover:bg-amber-600 text-white shadow-md transition-all cursor-pointer active:scale-[0.98]"
            >
              <Zap size={16} className="fill-current text-amber-200" />
              <span>
                {isAr
                  ? `اشتري الآن (دفع عند الاستلام) — ${formatPrice(totalPrice, locale)}`
                  : `Buy Now (Cash on Delivery) — ${formatPrice(totalPrice, locale)}`}
              </span>
            </button>

            {/* Validation helper when button is disabled */}
            {!hasValidArtwork && !hasValidText && (
              <p className="text-center text-[11px] text-slate-400 dark:text-neutral-500">
                {isAr
                  ? "يلزم تقديم صورة تصميم أو كتابة وصف مختصر للطلب لتفعيل الإضافة للسلة."
                  : "Upload an artwork file or enter a brief description to enable Add to Cart."}
              </p>
            )}

            {/* Added to Cart Success Banner */}
            {addedToCart && (
              <div className="flex items-center justify-between rounded-xl border border-teal-200 bg-teal-50 p-3.5 text-xs text-teal-900 dark:border-teal-900 dark:bg-teal-950/50 dark:text-teal-200 animate-in fade-in duration-200">
                <div className="flex items-center gap-2">
                  <Check size={16} className="text-teal-600 dark:text-teal-400" />
                  <span>
                    {isAr
                      ? "تمت إضافة التيشيرت المخصص إلى سلتك بنجاح!"
                      : "Custom T-shirt was successfully added to your cart!"}
                  </span>
                </div>
                <Link
                  href="/cart"
                  className="font-bold underline text-teal-700 hover:text-teal-800 dark:text-teal-300"
                >
                  {isAr ? "عرض السلة" : "View Cart"}
                </Link>
              </div>
            )}
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-slate-600 dark:text-neutral-400">
            <div className="flex items-center gap-2">
              <ShieldCheck size={15} className="text-teal-600 dark:text-teal-400 shrink-0" />
              <span>{isAr ? "قطن مصري ناعم ومريح للكبار والأطفال" : "Soft 100% Egyptian Cotton"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Palette size={15} className="text-teal-600 dark:text-teal-400 shrink-0" />
              <span>{isAr ? "طباعة مخصصة بألوان زاهية" : "Vibrant Custom Print"}</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle size={15} className="text-teal-600 dark:text-teal-400 shrink-0" />
              <span>{isAr ? "معاينة وتأكيد التصميم على واتساب" : "WhatsApp Confirmation"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={15} className="text-teal-600 dark:text-teal-400 shrink-0" />
              <span>{isAr ? "كاش عند الاستلام بعد المعاينة" : "Cash on Delivery"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Accessible Size Guide Modal */}
      <TShirtSizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        locale={locale}
        activeSize={selectedSize}
      />

      {/* Mobile Sticky Quick-Purchase Bar */}
      <aside
        aria-label={isAr ? "شريط الشراء السريع" : "Quick purchase bar"}
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 px-3.5 py-2.5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
      >
        <div className="flex items-center justify-between gap-2.5 max-w-[500px] mx-auto">
          <div className="flex items-center gap-2 min-w-0">
            <div className="relative w-11 h-11 rounded-md overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200 dark:border-zinc-700">
              <Image
                src={activeColorObj.image}
                alt={isAr ? activeColorObj.arabicName : activeColorObj.name}
                width={44}
                height={44}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                {isAr ? product.arabicName : product.name} ({activeColorObj.arabicName} - {selectedSize})
              </p>
              <p className="text-xs font-black text-amber-600 dark:text-amber-400 mt-0.5">{formatPrice(totalPrice, locale)}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleAddToCart}
              className="h-11 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-bold border border-zinc-300 dark:border-zinc-700 flex items-center gap-1 active:scale-95 transition-transform cursor-pointer"
              title={isAr ? "أضيفي إلى السلة" : "Add to Cart"}
            >
              <ShoppingBag size={15} />
              <span className="hidden xs:inline">{isAr ? "السلة" : "Cart"}</span>
            </button>

            <button
              type="button"
              onClick={handleDirectBuy}
              className="h-11 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Zap size={14} className="fill-current text-amber-100" />
              <span>{isAr ? "اشتري الآن" : "Buy Now"}</span>
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}

