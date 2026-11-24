"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/locale";
import { useCart, useWishlist } from "@/components/storefront";
import { formatPrice } from "@/lib/products";
import { useImageUpload } from "@/hooks/use-image-upload";
import { UploadFeedback } from "@/components/upload-feedback";
import toppersData from "@/data/toppers-product.json";
import {
  Upload,
  Heart,
  Plus,
  Minus,
  Check,
  ShoppingBag,
  Sparkles,
  X,
  Package,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";

type ToppersPreviewProps = {
  locale: Locale;
  price?: number;
  inStock?: boolean;
};

export function ToppersPreview({
  locale,
  price = 200,
  inStock = true,
}: ToppersPreviewProps) {
  const router = useRouter();
  const isAr = locale === "ar";
  const Arrow = isAr ? ArrowLeft : ArrowRight;
  const { add } = useCart();
  const { has, toggle } = useWishlist();

  const product = toppersData.product;
  const isWishlisted = has(product.slug);

  // Gallery view state
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const activeImage = product.gallery[activeImageIndex]?.url ?? product.primaryImage.url;

  // Customization Form State
  const [childName, setChildName] = useState("");
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
    category: isAr ? "بانرز وتوبرز" : "Banners & Toppers",
    price: price,
    image: product.primaryImage.url,
    description: isAr ? product.arabicDescription : product.description,
    customizable: true,
    hasVariants: false,
    subtitle: isAr ? "باكدج 32 صورة • فوم جليتر وأعواد ولزق" : "32 Photo Pack • Glitter Foam & Sticks",
    customizationTag: isAr ? "باكدج 32 صورة" : "32 Photo Pack",
  };

  const toggleWishlist = () => {
    toggle(productObj);
  };

  const handleRemovePhoto = () => {
    clearPhoto();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validateForm = (): boolean => {
    if (!photoStorageKey && !photoPreviewUrl) {
      setValidationError(
        isAr
          ? "يرجى رفع صورة الطفل لتفريغها وطباعة الـ 32 صورة للتوبرز"
          : "Please upload your child's photo for the 32 topper cutouts"
      );
      return false;
    }
    setValidationError(null);
    return true;
  };

  const handleAddToCart = (openDrawer = true) => {
    if (!validateForm()) return;

    const customization: Record<string, string> = {
      topper_package: isAr
        ? "32 صورة مطبوعة + شمعة لزق + 3 فوم جليتر + 5 أعواد ملونة + كيس أعواد خشبية"
        : "32 photos + glue stick + 3 glitter foam + 5 colored sticks + wooden sticks",
    };

    if (childName.trim()) customization.child_name = childName.trim();
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
      {/* Sibling Link Banner: Discover the Matching Wall Banner */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200/70 bg-gradient-to-r from-amber-50/80 via-white to-amber-50/60 p-4 text-start dark:border-amber-900/40 dark:from-neutral-900 dark:to-neutral-900/70">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm">
            <Sparkles size={20} />
          </div>
          <div>
            <p className="text-sm font-extrabold text-neutral-900 dark:text-neutral-100">
              {isAr ? "عايزة تكملي ديكور الحفلة بالكامل؟" : "Want to complete your celebration setup?"}
            </p>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              {isAr
                ? "شوفي بانر الاحتفالات المخصص مقاس 1.5*1.5 متر بصورة الطفل والـ Theme المفضل!"
                : "Check out the 1.5x1.5m matching celebration wall banner!"}
            </p>
          </div>
        </div>
        <Link
          href="/categories/banners/wall-banners"
          className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-neutral-800 dark:bg-amber-500 dark:text-neutral-950 dark:hover:bg-amber-400"
        >
          <span>{isAr ? "شوفي بانر الحائط (1.5*1.5 متر)" : "Explore Wall Banner"}</span>
          <Arrow size={14} />
        </Link>
      </div>

      {/* Two-Column Studio Layout */}
      <div className="product-detail-layout entry-layout min-w-0">
        {/* Left Column: Visual Gallery & Photography */}
        <div className="flex flex-col gap-4 min-w-0">
          <div className="relative aspect-square w-full overflow-hidden rounded-[28px] border border-slate-200/90 bg-gradient-to-b from-amber-50/40 via-white to-slate-100/60 p-4 shadow-sm dark:border-neutral-800 dark:from-neutral-900/60 dark:to-neutral-900/30">
            {/* Wishlist Button */}
            <button
              type="button"
              onClick={toggleWishlist}
              aria-label={isWishlisted ? "إزالة من المفضلة" : "إضافة للمفضلة"}
              className={`absolute top-5 ${
                isAr ? "left-5" : "right-5"
              } z-10 flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200/80 bg-white/90 shadow-sm backdrop-blur-md transition-all hover:scale-110 active:scale-95 dark:border-neutral-700 dark:bg-neutral-800/90`}
            >
              <Heart
                size={20}
                className={
                  isWishlisted
                    ? "fill-red-500 text-red-500"
                    : "text-neutral-500 dark:text-neutral-400"
                }
              />
            </button>

            {/* Badge */}
            <div
              className={`absolute top-5 ${
                isAr ? "right-5" : "left-5"
              } z-10 flex items-center gap-1.5 rounded-full bg-amber-500/90 px-3.5 py-1 text-xs font-bold text-white shadow-sm backdrop-blur-md`}
            >
              <Package size={13} />
              <span>{isAr ? "باكدج ٣٢ صورة كامل" : "32 Pieces Kit"}</span>
            </div>

            {/* Main Stage Image */}
            <div className="relative h-full w-full overflow-hidden rounded-2xl bg-white/60 dark:bg-neutral-800/60">
              <Image
                src={activeImage}
                alt={isAr ? product.arabicName : product.name}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain p-2 transition-transform duration-500 hover:scale-105"
              />
            </div>
          </div>

          {/* Thumbnails Row */}
          <div className="flex gap-2.5 overflow-x-auto pb-1">
            {product.gallery.map((img, index) => {
              const isSelected = index === activeImageIndex;
              return (
                <button
                  key={img.url}
                  type="button"
                  onClick={() => setActiveImageIndex(index)}
                  className={`group relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 transition-all ${
                    isSelected
                      ? "border-amber-500 ring-2 ring-amber-500/20 shadow-md scale-105"
                      : "border-slate-200 opacity-70 hover:opacity-100 dark:border-neutral-800"
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={isAr ? img.arabicAlt : img.alt}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </button>
              );
            })}
          </div>

          {/* Package Contents Breakdown Cards */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/60 text-start">
            <div className="flex items-center gap-2 mb-3">
              <Package className="text-amber-500" size={18} />
              <h3 className="text-base font-extrabold text-neutral-900 dark:text-neutral-100">
                {isAr ? "محتويات باكدج التوبرز (200 ج)" : "Package Contents (200 EGP)"}
              </h3>
            </div>
            <ul className="space-y-2.5 text-xs text-neutral-700 dark:text-neutral-300">
              <li className="flex items-start gap-2.5 rounded-xl bg-amber-50/60 p-2.5 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white font-black text-[10px]">
                  32
                </span>
                <span>
                  {isAr
                    ? "32 صورة مطبوعة للطفل على شيت (يتم تفريغ الصور من قبل العميل)"
                    : "32 printed photos of child on a sheet (cut out by customer)"}
                </span>
              </li>
              <li className="flex items-center gap-2.5 rounded-xl bg-slate-50 p-2.5 dark:bg-neutral-800/40 border border-slate-100 dark:border-neutral-800">
                <Check className="text-emerald-500 shrink-0" size={16} />
                <span>{isAr ? "شمعة لزق للتثبيت" : "Adhesive glue stick"}</span>
              </li>
              <li className="flex items-center gap-2.5 rounded-xl bg-slate-50 p-2.5 dark:bg-neutral-800/40 border border-slate-100 dark:border-neutral-800">
                <Check className="text-emerald-500 shrink-0" size={16} />
                <span>
                  {isAr
                    ? "3 ورقات فوم جليتر ملون (لعمل طراطير الاحتفال الصغيرة للصور)"
                    : "3 sheets of colored glitter foam (for mini party hats)"}
                </span>
              </li>
              <li className="flex items-center gap-2.5 rounded-xl bg-slate-50 p-2.5 dark:bg-neutral-800/40 border border-slate-100 dark:border-neutral-800">
                <Check className="text-emerald-500 shrink-0" size={16} />
                <span>{isAr ? "5 أعواد ملونة" : "5 colored sticks"}</span>
              </li>
              <li className="flex items-center gap-2.5 rounded-xl bg-slate-50 p-2.5 dark:bg-neutral-800/40 border border-slate-100 dark:border-neutral-800">
                <Check className="text-emerald-500 shrink-0" size={16} />
                <span>{isAr ? "كيس أعواد خشبية لتثبيت التوبرز في الكب كيك" : "Bag of wooden sticks for cupcakes"}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Customization Studio Form */}
        <div className="flex flex-col gap-5 text-start min-w-0">
          {/* Header & Pricing */}
          <div className="space-y-2 border-b border-slate-200 pb-5 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                {isAr ? "باكدج توبرز كب كيك" : "Cupcake Toppers Kit"}
              </span>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                inStock
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                  : "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300"
              }`}>
                {inStock ? (isAr ? "متوفر للطلب" : "In Stock") : (isAr ? "غير متوفر حالياً" : "Out of Stock")}
              </span>
            </div>

            <h1 className="text-2xl font-black text-neutral-900 md:text-3xl dark:text-neutral-50">
              {isAr ? product.arabicName : product.name}
            </h1>

            <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              {isAr ? product.arabicDescription : product.description}
            </p>

            {/* Price Tag */}
            <div className="flex items-baseline gap-3 pt-2">
              <span className="text-3xl font-black text-neutral-900 dark:text-neutral-100">
                {formatPrice(unitPrice)}
              </span>
              <span className="text-xs text-neutral-500">
                {isAr ? "للباكدج الكامل (32 توبرز + الخامات)" : "per complete package (32 toppers + materials)"}
              </span>
            </div>
          </div>

          {/* Upload Child Photo (Core Customization) */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/60">
            <div className="flex items-center justify-between gap-2 mb-2">
              <label className="text-sm font-extrabold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <Upload size={16} className="text-amber-500" />
                <span>{isAr ? "ارفعي صورة الطفل (مطلوبة للطباعة) *" : "Upload Child's Photo (Required) *"}</span>
              </label>
              {photoPreviewUrl && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1"
                >
                  <X size={14} />
                  <span>{isAr ? "حذف الصورة" : "Remove"}</span>
                </button>
              )}
            </div>
            <p className="text-xs text-neutral-500 mb-4">
              {isAr
                ? "ارفعي صورة واضحة لوجه طفلك، وهنجهز شيت الـ 32 صورة مخصص بجودة عالية لتفريغها وتثبيتها."
                : "Upload a clear photo of your child's face for the high-res 32-topper print sheet."}
            </p>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFileChange(f);
              }}
              className="hidden"
              id="topper-photo-upload"
            />

            {!photoPreviewUrl ? (
              <label
                htmlFor="topper-photo-upload"
                className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/30 p-6 text-center transition-all hover:border-amber-500 hover:bg-amber-50/60 dark:border-amber-900/40 dark:bg-amber-950/10"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-sm mb-3">
                  <Upload size={22} />
                </div>
                <span className="text-sm font-extrabold text-neutral-900 dark:text-neutral-100">
                  {isAr ? "اضغطي هنا لاختيار صورة طفلك" : "Click here to choose child's photo"}
                </span>
                <span className="text-xs text-neutral-500 mt-1">
                  {isAr ? "JPG, PNG, WebP (حتى 4 ميجابايت)" : "JPG, PNG, WebP (up to 4MB)"}
                </span>
              </label>
            ) : (
              <div className="flex items-center gap-4 rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 dark:border-emerald-900/30 dark:bg-emerald-950/20">
                <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-emerald-300 bg-white">
                  <Image
                    src={photoPreviewUrl}
                    alt="Uploaded child face"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <Check size={14} />
                    <span>{isAr ? "تم اختيار الصورة بنجاح!" : "Photo selected successfully!"}</span>
                  </p>
                  <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                    {photoFile?.name || (isAr ? "صورة مخصصة للتوبرز" : "Custom photo for toppers")}
                  </p>
                </div>
              </div>
            )}

            <UploadFeedback
              isAr={isAr}
              busy={isUploading}
              uploaded={Boolean(photoStorageKey)}
              error={uploadError}
              retry={() => {
                if (fileInputRef.current?.files?.[0]) {
                  handleFileChange(fileInputRef.current.files[0]);
                }
              }}
              remove={handleRemovePhoto}
            />
          </div>

          {/* Child Name & Notes Inputs */}
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/60">
            <div>
              <label
                htmlFor="child-name-input"
                className="text-xs font-extrabold text-neutral-900 dark:text-neutral-100 block mb-1"
              >
                {isAr ? "اسم الطفل (اختياري للتدوين في الطلب)" : "Child's Name (Optional)"}
              </label>
              <input
                id="child-name-input"
                type="text"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                placeholder={isAr ? "مثال: يحيى" : "e.g., Yehia"}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-neutral-900 outline-none transition-all focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>

            <div>
              <label
                htmlFor="custom-notes-input"
                className="text-xs font-extrabold text-neutral-900 dark:text-neutral-100 block mb-1"
              >
                {isAr ? "ملاحظات إضافية (اختياري)" : "Additional Notes (Optional)"}
              </label>
              <textarea
                id="custom-notes-input"
                rows={2}
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder={isAr ? "أي تفاصيل أو ملاحظات تحبي تضيفيها..." : "Any special requests or instructions..."}
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm font-medium text-neutral-900 outline-none transition-all focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>
          </div>

          {/* Validation Warning */}
          {validationError && (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-300">
              <AlertCircle size={16} className="shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Quantity Selector & Price Summary */}
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/60">
            <span className="text-sm font-extrabold text-neutral-900 dark:text-neutral-100">
              {isAr ? "عدد الباكدجات:" : "Package Quantity:"}
            </span>
            <div className="flex items-center gap-3">
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-neutral-700 dark:bg-neutral-800">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-700 transition-colors hover:bg-white disabled:opacity-30 dark:text-neutral-300 dark:hover:bg-neutral-700"
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span className="w-8 text-center text-sm font-black text-neutral-900 dark:text-neutral-100">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-700 transition-colors hover:bg-white dark:text-neutral-300 dark:hover:bg-neutral-700"
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>
              <span className="text-base font-black text-neutral-900 dark:text-neutral-100">
                {formatPrice(totalPrice)}
              </span>
            </div>
          </div>

          {/* Action CTA Buttons */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => handleAddToCart(true)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 py-3.5 text-base font-black text-white shadow-md transition-all hover:bg-amber-600 active:scale-[0.99]"
            >
              <ShoppingBag size={18} />
              <span>{addedToCart ? (isAr ? "تمت الإضافة للسلة ✨" : "Added to Cart ✨") : (isAr ? "أضيفي باكدج التوبرز للسلة" : "Add Toppers Kit to Cart")}</span>
            </button>

            <button
              type="button"
              onClick={handleDirectBuy}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-neutral-900 bg-neutral-900 py-3.5 text-base font-black text-white transition-all hover:bg-neutral-800 active:scale-[0.99] dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
            >
              <span>{isAr ? "اشتري الآن (دفع عند الاستلام)" : "Buy Now (Cash on Delivery)"}</span>
              <Arrow size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Sticky Mobile Bottom Bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-3 backdrop-blur-md md:hidden dark:border-neutral-800 dark:bg-neutral-900/95">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
          <div>
            <p className="text-[11px] text-neutral-500">
              {isAr ? "الإجمالي:" : "Total:"}
            </p>
            <p className="text-base font-black text-neutral-900 dark:text-neutral-100">
              {formatPrice(totalPrice)}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleAddToCart(true)}
              className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-black text-white shadow-sm active:scale-95"
            >
              <ShoppingBag size={15} />
              <span>{isAr ? "أضيفي للسلة" : "Add to Cart"}</span>
            </button>
            <button
              type="button"
              onClick={handleDirectBuy}
              className="flex items-center gap-1.5 rounded-xl bg-neutral-900 px-4 py-2.5 text-xs font-black text-white active:scale-95 dark:bg-neutral-100 dark:text-neutral-900"
            >
              <span>{isAr ? "اشتري الآن" : "Buy Now"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
