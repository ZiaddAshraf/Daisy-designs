"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import SiteImage from "@/components/site-image";
import type { Locale } from "@/lib/locale";
import storyProductData from "@/data/story-product.json";
import { TinyDaisyDoodle } from "@/components/decorative-marks";
import { useCart, useWishlist } from "@/components/storefront";
import { formatPrice } from "@/lib/products";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Heart,
  Sparkles,
  ShieldCheck,
  BookOpen,
  Lock,
  Upload,
  Clock,
  Truck,
  Plus,
  Minus,
  Check,
  AlertCircle,
  ShoppingBag,
  RefreshCw,
} from "lucide-react";

type StoryBookPreviewProps = {
  locale: Locale;
  inStock?: boolean;
};

// Sequence of 10 pages: 0 = Front Cover, 1..8 = Story Pages, 9 = Back Cover
const ALL_PAGE_INDEXES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

export function StoryBookPreview({ locale, inStock = true }: StoryBookPreviewProps) {
  const isAr = locale === "ar";
  const { add } = useCart();

  const product = storyProductData.product;
  const productName = isAr ? product.arabicName : product.name;
  const productDescription = isAr ? product.arabicDescription : product.description;
  const allPages = [
    {
      position: 0,
      pageNumber: 0,
      url: product.primaryImage.url,
      title: product.primaryImage.alt,
      arabicTitle: product.primaryImage.arabicAlt,
      text: isAr
        ? "عز وأول سنة في المدرسة — أصدقاء جدد، مغامرات، تعلم، وثقة بالنفس"
        : "First Year at School — New friends, adventures, learning, and self-confidence",
      dimensions: product.primaryImage.dimensions,
    },
    ...product.gallery,
  ];

  // Active page preview in the hero flipbook (0 to 9)
  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const [modalPageIndex, setModalPageIndex] = useState<number | null>(null);

  // Photo upload state
  const [childPhotoFile, setChildPhotoFile] = useState<File | null>(null);
  const [childPhotoPreviewUrl, setChildPhotoPreviewUrl] = useState<string | null>(null);
  const [childPhotoStorageKey, setChildPhotoStorageKey] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Commerce controls
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const { toggle: toggleStoreWishlist, has: inStoreWishlist } = useWishlist();
  const isWishlisted = inStoreWishlist("first-year-at-school");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbsContainerRef = useRef<HTMLDivElement>(null);
  const heroTouchStartXRef = useRef<number | null>(null);

  // Auto-scroll active thumbnail into view
  useEffect(() => {
    if (!thumbsContainerRef.current) return;
    const targetThumb = thumbsContainerRef.current.children[activePageIndex] as HTMLElement | undefined;
    if (targetThumb) {
      targetThumb.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [activePageIndex]);

  // Clean up client blob preview URL when component unmounts or changes
  useEffect(() => {
    return () => {
      if (childPhotoPreviewUrl && childPhotoPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(childPhotoPreviewUrl);
      }
    };
  }, [childPhotoPreviewUrl]);

  // Flash added to cart state
  useEffect(() => {
    if (!addedToCart) return;
    const timer = setTimeout(() => setAddedToCart(false), 4500);
    return () => clearTimeout(timer);
  }, [addedToCart]);

  const toggleWishlist = () => {
    toggleStoreWishlist({
      slug: "first-year-at-school",
      name: productName,
      category: isAr ? "قصص مخصصة" : "Customized Stories",
      price: product.price ?? 200,
      image: product.primaryImage.url,
      description: productDescription,
      customizable: true,
    });
  };

  // Flipbook navigation
  const handlePrevPage = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActivePageIndex((curr) => (curr - 1 + ALL_PAGE_INDEXES.length) % ALL_PAGE_INDEXES.length);
  }, []);

  const handleNextPage = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActivePageIndex((curr) => (curr + 1) % ALL_PAGE_INDEXES.length);
  }, []);

  // Touch swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    heroTouchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (heroTouchStartXRef.current === null) return;
    const deltaX = e.changedTouches[0].clientX - heroTouchStartXRef.current;
    heroTouchStartXRef.current = null;
    if (Math.abs(deltaX) > 40) {
      if (deltaX > 0) {
        if (isAr) handlePrevPage();
        else handlePrevPage();
      } else {
        if (isAr) handleNextPage();
        else handleNextPage();
      }
    }
  };

  // Handle Photo Selection & Secure Upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    // Client-side quick validations
    if (file.size > 10 * 1024 * 1024) {
      setUploadError(
        isAr
          ? "حجم الصورة يتجاوز الحد الأقصى المسموح (١٠ ميجابايت)"
          : "Photo size exceeds maximum 10MB limit"
      );
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setUploadError(
        isAr
          ? "يُسمح فقط بصور بصيغة JPEG أو PNG أو WebP"
          : "Only JPEG, PNG, or WebP images are permitted"
      );
      return;
    }

    setChildPhotoFile(file);
    const localBlob = URL.createObjectURL(file);
    setChildPhotoPreviewUrl(localBlob);

    // Upload to server private storage
    setIsUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/uploads/story-child-photo", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || "Upload failed");
      }

      setChildPhotoStorageKey(data.key);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload error";
      setUploadError(msg);
      setChildPhotoStorageKey(null);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = () => {
    if (childPhotoPreviewUrl && childPhotoPreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(childPhotoPreviewUrl);
    }
    setChildPhotoFile(null);
    setChildPhotoPreviewUrl(null);
    setChildPhotoStorageKey(null);
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Add to Cart
  const handleAddToCart = () => {
    if (!inStock || !childPhotoStorageKey) return;

    add(
      {
        slug: product.slug,
        name: isAr ? product.arabicName : product.name,
        category: isAr ? "قصص مخصصة" : "Customized Stories",
        price: product.price ?? 200,
        image: product.primaryImage.url,
        description: isAr ? product.arabicDescription : product.description,
        customizable: true,
        hasVariants: false,
      },
      {
        child_photo: childPhotoStorageKey,
      },
      undefined,
      quantity
    );

    setAddedToCart(true);
  };

  const activePage = allPages[activePageIndex];
  const modalPage = modalPageIndex !== null ? allPages[modalPageIndex] : null;

  return (
    <div className="sb-product-layout">
      {/* 1. Hero: Two-column editorial presentation */}
      <section className="sb-hero" aria-labelledby="sb-hero-heading">
        {/* Media Column (Left) */}
        <div className="sb-hero__media">
          <div
            className="sb-hero__media-frame"
            role="button"
            tabIndex={0}
            onClick={() => setModalPageIndex(activePageIndex)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                setModalPageIndex(activePageIndex);
              } else if (e.key === "ArrowLeft") {
                e.preventDefault();
                if (isAr) handleNextPage();
                else handlePrevPage();
              } else if (e.key === "ArrowRight") {
                e.preventDefault();
                if (isAr) handlePrevPage();
                else handleNextPage();
              }
            }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            title={isAr ? "انقر لتكبير ومعاينة الصفحة بالحجم الكامل" : "Click to view full-size"}
            aria-label={isAr ? activePage.arabicTitle : activePage.title}
          >
            {/* Left navigation arrow button */}
            <button
              type="button"
              className="rc-hero__arrow rc-hero__arrow--left"
              onClick={isAr ? handleNextPage : handlePrevPage}
              aria-label={isAr ? "الصفحة التالية" : "Previous page"}
              title={isAr ? "التالي" : "Previous"}
            >
              <ChevronLeft size={20} />
            </button>

            {/* Right navigation arrow button */}
            <button
              type="button"
              className="rc-hero__arrow rc-hero__arrow--right"
              onClick={isAr ? handlePrevPage : handleNextPage}
              aria-label={isAr ? "الصفحة السابقة" : "Next page"}
              title={isAr ? "السابق" : "Next"}
            >
              <ChevronRight size={20} />
            </button>

            {/* Current page sequence counter badge */}
            <span className="rc-hero__counter-badge" aria-hidden="true">
              {isAr
                ? `${(activePageIndex + 1).toLocaleString("ar-EG")} / ${ALL_PAGE_INDEXES.length.toLocaleString("ar-EG")}`
                : `${activePageIndex + 1} / ${ALL_PAGE_INDEXES.length}`}
            </span>

            <SiteImage
              key={activePage.url}
              src={activePage.url}
              alt={isAr ? activePage.arabicTitle : activePage.title}
              width={activePage.dimensions.width}
              height={activePage.dimensions.height}
              priority
              sizes="(max-width: 960px) 100vw, 55vw"
              className="sb-hero__media-img"
            />
          </div>

          {/* Sequential Thumbnails Grid */}
          <div
            ref={thumbsContainerRef}
            className="sb-hero__thumbs"
            role="region"
            aria-label={isAr ? "صفحات وغلاف القصة" : "Story pages and cover thumbnails"}
          >
            {allPages.map((page, idx) => {
              const isActive = activePageIndex === idx;
              const pageLabel =
                idx === 0
                  ? isAr
                    ? "الغلاف"
                    : "Cover"
                  : idx === 9
                  ? isAr
                    ? "الختام"
                    : "Back"
                  : isAr
                  ? `ص ${idx.toLocaleString("ar-EG")}`
                  : `P.${idx}`;

              return (
                <button
                  key={page.url}
                  type="button"
                  className={`sb-hero__thumb ${isActive ? "sb-hero__thumb--active" : ""}`}
                  onClick={() => setActivePageIndex(idx)}
                  aria-label={isAr ? page.arabicTitle : page.title}
                  aria-current={isActive ? "true" : undefined}
                  title={isAr ? page.arabicTitle : page.title}
                >
                  <SiteImage
                    src={page.url}
                    alt={isAr ? page.arabicTitle : page.title}
                    width={72}
                    height={102}
                    className="sb-hero__thumb-img"
                  />
                  <span className="sb-hero__thumb-badge">{pageLabel}</span>
                </button>
              );
            })}
          </div>

          <p className="sb-hero__caption" aria-live="polite">
            {isAr ? activePage.arabicTitle : activePage.title}
          </p>

          {/* Prominent Physical Product Notice */}
          <div className="sb-badge-banner sb-badge-banner--physical">
            <BookOpen size={18} className="sb-badge-banner__icon" />
            <div>
              <strong>{isAr ? "كتاب ورقي مطبوع فاخر" : "Physical Hardcopy Printed Book"}</strong>
              <p>
                {isAr
                  ? "يُشحن مباشرة إلى باب منزلك، وليس ملف PDF أو منتجاً رقمياً للتحميل."
                  : "Shipped directly to your doorstep as a physical printed keepsake book (not a PDF or digital download)."}
              </p>
            </div>
          </div>

          {/* Description */}
          <p className="sb-hero__description">
            {isAr ? product.arabicDescription : product.description}
          </p>

          {/* Key Facts & Target Prep Time */}
          <div className="sb-facts">
            <div className="sb-fact">
              <span className="sb-fact__label">{isAr ? "طبيعة المنتج" : "Format"}</span>
              <span className="sb-fact__detail">
                {isAr ? "كتاب ورقي مطبوع ومغلف فيزيائياً" : "Physical printed paper storybook"}
              </span>
            </div>

            <div className="sb-fact">
              <span className="sb-fact__label">{isAr ? "مدة التجهيز" : "Prep Time"}</span>
              <span className="sb-fact__detail">
                <Clock size={13} style={{ display: "inline", verticalAlign: "middle", marginInlineEnd: 4 }} />
                {isAr ? "يوم عمل واحد للتجهيز والطباعة (قبل الشحن)" : "1 business day prep & print (before shipping)"}
              </span>
            </div>

            <div className="sb-fact">
              <span className="sb-fact__label">{isAr ? "المقاس والغلاف" : "Specs"}</span>
              <span className="sb-fact__detail">
                {isAr ? "مقاس A4 مع غلاف مرن (قيد تأكيد المطبعة)" : "A4 softcover (pending print-shop confirmation)"}
              </span>
            </div>

            <div className="sb-fact">
              <span className="sb-fact__label">{isAr ? "عدد الصفحات" : "Pages"}</span>
              <span className="sb-fact__detail">
                {isAr ? "١٠ صفحات ملونة كاملة (غلاف + ٨ صفحات + غلاف خلفي)" : "10 full-color pages (cover, 8 pages, back cover)"}
              </span>
            </div>
          </div>
        </div>

        {/* Product Details & Purchase Column (Right) */}
        <div className="sb-hero__content">
          <div className="sb-hero__eyebrow">
            <span className="sb-hero__eyebrow-text">
              DAISY DESIGNS / {isAr ? "قصص مخصصة" : "CUSTOMIZED STORIES"}
            </span>
            <TinyDaisyDoodle size={14} className="sb-hero__eyebrow-icon" />
          </div>

          <h1 id="sb-hero-heading" className="sb-hero__title">
            {isAr ? product.arabicName : product.name}
          </h1>

          <p className="sb-hero__subtitle">
            {isAr ? product.name : product.arabicName}
          </p>

          {/* Price & Availability */}
          <div className="sb-purchase-card">
            <div className="sb-purchase-card__price-row">
              <div>
                <span className="sb-purchase-card__price">
                  {formatPrice(product.price ?? 200, locale)}
                </span>
                <span className="sb-purchase-card__price-note">
                  {isAr ? "للكتاب الورقي المطبوع كاملاً" : "per complete printed storybook"}
                </span>
              </div>
              <span className={`sb-stock-badge ${inStock ? "sb-stock-badge--in" : "sb-stock-badge--out"}`}>
                {inStock
                  ? isAr
                    ? "متوفر للطباعة الفورية"
                    : "Available for Print"
                  : isAr
                  ? "غير متوفر مؤقتاً"
                  : "Temporarily Unavailable"}
              </span>
            </div>

            {/* Child Photo Upload Zone */}
            <div className="sb-upload-box">
              <div className="sb-upload-box__header">
                <div className="sb-upload-box__title">
                  <Upload size={16} />
                  <span>{isAr ? "صورة طفل/طفلة القصة (إجباري)" : "Child's Photo (Required)"}</span>
                </div>
                <span className="sb-upload-box__privacy-pill">
                  <Lock size={12} />
                  <span>{isAr ? "تخزين مشفر ومحمي" : "Secure Private Storage"}</span>
                </span>
              </div>

              <p className="sb-upload-box__hint">
                {isAr
                  ? "ارفع صورة واضحة ومحببة لطفلك لدمجها كبطل للقصة في النسخة المطبوعة. محتوى ونصوص القصة ثابتة ومؤلفة مسبقاً ولا يمكن تعديلها."
                  : "Upload a clear photograph of your child to star as the storybook's hero in print. Story narrative text is fixed and non-editable."}
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sb-upload-box__input-hidden"
                id="child-photo-file-input"
                onChange={handleFileChange}
              />

              {!childPhotoPreviewUrl ? (
                <label
                  htmlFor="child-photo-file-input"
                  className="sb-upload-dropzone"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
                  }}
                >
                  <Upload size={24} className="sb-upload-dropzone__icon" />
                  <span className="sb-upload-dropzone__cta">
                    {isAr ? "انقر لاختيار صورة طفلك" : "Click to select your child's photo"}
                  </span>
                  <span className="sb-upload-dropzone__subtext">
                    {isAr ? "صيغ JPEG أو PNG أو WebP (بحد أقصى ١٠ ميجابايت)" : "JPEG, PNG, or WebP up to 10MB"}
                  </span>
                </label>
              ) : (
                <div className="sb-photo-card">
                  <div className="sb-photo-card__preview">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={childPhotoPreviewUrl}
                      alt={isAr ? "معاينة صورة الطفل المرفوعة" : "Uploaded child photo preview"}
                      className="sb-photo-card__img"
                    />
                  </div>
                  <div className="sb-photo-card__meta">
                    <div className="sb-photo-card__status">
                      {isUploadingPhoto ? (
                        <span className="sb-photo-card__status-uploading">
                          <RefreshCw size={13} className="sb-spin" />
                          <span>{isAr ? "جاري الرفع والتأمين المشفر..." : "Uploading & securing..."}</span>
                        </span>
                      ) : childPhotoStorageKey ? (
                        <span className="sb-photo-card__status-success">
                          <Check size={14} />
                          <span>{isAr ? "تم حفظ الصورة وتأمينها بنجاح" : "Photo verified & secured"}</span>
                        </span>
                      ) : null}
                    </div>
                    <span className="sb-photo-card__filename">{childPhotoFile?.name}</span>
                    <button
                      type="button"
                      className="sb-photo-card__remove-btn"
                      onClick={handleRemovePhoto}
                    >
                      <X size={13} />
                      <span>{isAr ? "تغيير أو حذف الصورة" : "Change or remove photo"}</span>
                    </button>
                  </div>
                </div>
              )}

              {uploadError && (
                <div className="sb-upload-box__error" role="alert">
                  <AlertCircle size={15} />
                  <span>{uploadError}</span>
                </div>
              )}
            </div>

            {/* Quantity & Add to Cart Controls */}
            <div className="sb-purchase-controls">
              <div className="sb-quantity" role="group" aria-label={isAr ? "الكمية" : "Quantity"}>
                <button
                  type="button"
                  className="sb-quantity__btn"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  aria-label={isAr ? "تقليل الكمية" : "Decrease quantity"}
                >
                  <Minus size={15} />
                </button>
                <span className="sb-quantity__value" aria-live="polite">
                  {quantity.toLocaleString(isAr ? "ar-EG" : "en-US")}
                </span>
                <button
                  type="button"
                  className="sb-quantity__btn"
                  onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                  disabled={quantity >= 10}
                  aria-label={isAr ? "زيادة الكمية" : "Increase quantity"}
                >
                  <Plus size={15} />
                </button>
              </div>

              <button
                type="button"
                className={`daisy-button daisy-button--dark sb-add-btn cursor-pointer active:scale-[0.98] ${
                  addedToCart ? "sb-add-btn--added" : ""
                }`}
                onClick={handleAddToCart}
                disabled={!inStock || !childPhotoStorageKey || isUploadingPhoto}
                title={
                  !childPhotoStorageKey
                    ? isAr
                      ? "يرجى رفع صورة الطفل أولاً لإتمام الطلب"
                      : "Please upload your child's photo first"
                    : undefined
                }
              >
                {addedToCart ? (
                  <>
                    <Check size={18} />
                    <span>{isAr ? "تمت الإضافة للسلة!" : "Added to Cart!"}</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={18} />
                    <span>
                      {!childPhotoStorageKey
                        ? isAr
                          ? "ارفع صورة الطفل للإضافة"
                          : "Upload photo to add"
                        : isAr
                        ? "أضف القصة إلى السلة"
                        : "Add Story to Cart"}
                    </span>
                  </>
                )}
              </button>

              <button
                type="button"
                className={`sb-wishlist-btn cursor-pointer active:scale-90 transition-transform ${isWishlisted ? "sb-wishlist-btn--active" : ""}`}
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
                title={isAr ? "حفظ في المفضلة" : "Save to Wishlist"}
              >
                <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
                <span className="sr-only">{isAr ? "المفضلة" : "Wishlist"}</span>
              </button>
            </div>

            {/* Added to Cart Success Banner */}
            {addedToCart && (
              <div className="sb-cart-notification" role="status">
                <Check size={16} />
                <span>
                  {isAr
                    ? "تمت إضافة قصة أول سنة في المدرسة بصورة طفلك إلى السلة بنجاح!"
                    : "First Year at School storybook with your child's photo was added to your cart!"}
                </span>
                <Link href="/cart" className="sb-cart-notification__link">
                  {isAr ? "عرض السلة" : "View Cart"}
                </Link>
              </div>
            )}

            {/* Delivery & Assurance Guarantees */}
            <div className="sb-assurances">
              <div className="sb-assurance-item">
                <ShieldCheck size={16} />
                <span>{isAr ? "الدفع عند الاستلام (COD)" : "Cash on Delivery"}</span>
              </div>
              <div className="sb-assurance-item">
                <Truck size={16} />
                <span>{isAr ? "شحن لجميع المحافظات" : "Nationwide Delivery"}</span>
              </div>
              <div className="sb-assurance-item">
                <Lock size={16} />
                <span>{isAr ? "خصوصية تامة لصور الأطفال" : "Child Photo Privacy"}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Story Highlights & Educational Narrative */}
      <section className="sb-milestones-section">
        <div className="sb-section-header">
          <p className="sb-section-header__eyebrow">
            {isAr ? "رحلة بطل القصة خطوة بخطوة" : "The Storybook Journey"}
          </p>
          <h2 className="sb-section-header__title">
            {isAr ? "محطات دافئة تبني ثقة طفلك في مدرسته" : "Memorable Moments Celebrating Their First School Year"}
          </h2>
          <p className="sb-section-header__lead">
            {isAr
              ? "مغامرة متكاملة تعيش مع طفلك تفاصيل يومه المدرسي، وتزرع في قلبه الشجاعة وحب التعلم وصنع الصداقات."
              : "A heartwarming narrative celebrating their school routine, encouraging courage, friendship, and positive self-esteem."}
          </p>
        </div>

        <div className="sb-milestones-grid">
          <div className="sb-milestone-card">
            <span className="sb-milestone-card__step">01</span>
            <h3 className="sb-milestone-card__title">
              {isAr ? "حماس الصباح والبداية" : "Morning Excitement"}
            </h3>
            <p className="sb-milestone-card__text">
              {isAr
                ? "الاستيقاظ في الغرفة وتجهيز الحقيبة المدرسية بمشاعر الفرح والشغف لليوم الأول."
                : "Waking up energized, packing the backpack, and greeting the first school morning with joy."}
            </p>
          </div>

          <div className="sb-milestone-card">
            <span className="sb-milestone-card__step">02</span>
            <h3 className="sb-milestone-card__title">
              {isAr ? "شجاعة الباص واستقبال المعلمة" : "Courage & Warm Welcome"}
            </h3>
            <p className="sb-milestone-card__text">
              {isAr
                ? "توديع الوالدين بروح واثقة، ومقابلة المعلمة بابتسامة تمنح الأمان والانتماء."
                : "Waving goodbye confidently, boarding the school bus, and receiving a reassuring welcome from the teacher."}
            </p>
          </div>

          <div className="sb-milestone-card">
            <span className="sb-milestone-card__step">03</span>
            <h3 className="sb-milestone-card__title">
              {isAr ? "أنشطة الفصل والفسحة" : "Creativity, Recess & Lunch"}
            </h3>
            <p className="sb-milestone-card__text">
              {isAr
                ? "الرسم والتلوين، ومشاركة اللعب بالكرة مع الأصدقاء الجدد، وتناول وجبة اللانش بوكس الصحية."
                : "Coloring fun rocket drawings, bonding on the soccer field, and opening mama's special lunchbox surprise."}
            </p>
          </div>

          <div className="sb-milestone-card">
            <span className="sb-milestone-card__step">04</span>
            <h3 className="sb-milestone-card__title">
              {isAr ? "توكيدات الثقة والاعتزاز" : "Positive Affirmations"}
            </h3>
            <p className="sb-milestone-card__text">
              {isAr
                ? "صفحة ختامية تلهم طفلك: 'أنا شجاع، أنا قادر، وأنا دائمًا أستطيع أن أتعلم شيئًا جديدًا!'."
                : "Inspiring affirmations empowering your child: 'I am brave, I am capable, and I can always learn new things!'."}
            </p>
          </div>
        </div>
      </section>

      {/* 3. Physical Craftsmanship Details */}
      <section className="sb-craftsmanship-section">
        <div className="sb-craftsmanship-card">
          <div className="sb-craftsmanship-card__content">
            <div className="sb-craftsmanship-card__badge">
              <Sparkles size={14} />
              <span>{isAr ? "جودة Daisy Designs" : "Daisy Designs Craftsmanship"}</span>
            </div>
            <h2>
              {isAr ? "كتاب ورقي تذكاري يعيش معهم طويلاً" : "A Printed Keepsake to Cherish as They Grow"}
            </h2>
            <p>
              {isAr
                ? "صُممت قصة أول سنة في المدرسة لتكون ذكرى مادية ملموسة تُقرأ كل ليلة قبل النوم، وتُحفظ في مكتبة طفلك لسنوات قادمة. ألوان زاهية، ورق عالي الجودة، وتغليف فاخر يليق ببطل حكايتنا الصغير."
                : "Crafted as a tactile printed paper storybook to read every bedtime and treasure on their bookshelf for years to come. Vibrant full-color printing, premium paper, and caring gift presentation."}
            </p>
            <div className="sb-craftsmanship-pills">
              <span className="sb-craftsmanship-pill">
                <Check size={14} />
                <span>{isAr ? "١٠ صفحات ملونة بالكامل" : "10 Full-color pages"}</span>
              </span>
              <span className="sb-craftsmanship-pill">
                <Check size={14} />
                <span>{isAr ? "طباعة مادية ورقية متينة" : "Durable physical paper"}</span>
              </span>
              <span className="sb-craftsmanship-pill">
                <Check size={14} />
                <span>{isAr ? "تجهيز خلال يوم عمل واحد" : "1 Business day preparation"}</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Fullscreen Modal Lightbox */}
      {modalPageIndex !== null && modalPage && (
        <div
          className="rc-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={isAr ? modalPage.arabicTitle : modalPage.title}
          onClick={() => setModalPageIndex(null)}
        >
          <div
            className="rc-modal-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="rc-modal__header">
              <span className="rc-modal__badge">
                {modalPageIndex === 0
                  ? isAr
                    ? "الغلاف الأمامي"
                    : "Front Cover"
                  : modalPageIndex === 9
                  ? isAr
                    ? "الغلاف الخلفي"
                    : "Back Cover"
                  : isAr
                  ? `صفحة ${modalPageIndex.toLocaleString("ar-EG")} من ٨`
                  : `Page ${modalPageIndex} of 8`}
              </span>
              <button
                type="button"
                className="rc-modal__close"
                onClick={() => setModalPageIndex(null)}
                aria-label={isAr ? "إغلاق المعاينة" : "Close preview"}
              >
                <X size={18} />
              </button>
            </div>

            <div className="rc-modal__body">
              <div className="rc-modal__visual">
                <SiteImage
                  src={modalPage.url}
                  alt={isAr ? modalPage.arabicTitle : modalPage.title}
                  width={modalPage.dimensions.width}
                  height={modalPage.dimensions.height}
                  className="rc-modal__img"
                />
              </div>

              <div className="rc-modal__info">
                <h3 className="rc-modal__title">
                  {isAr ? modalPage.arabicTitle : modalPage.title}
                </h3>

                <p className="rc-modal__desc">
                  &ldquo;{modalPage.text}&rdquo;
                </p>

                <div className="rc-modal__nav">
                  <button
                    type="button"
                    className="rc-modal__nav-btn"
                    onClick={() =>
                      setModalPageIndex(
                        (curr) => ((curr ?? 0) - 1 + ALL_PAGE_INDEXES.length) % ALL_PAGE_INDEXES.length
                      )
                    }
                  >
                    <ChevronRight size={16} />
                    <span>{isAr ? "السابق" : "Previous"}</span>
                  </button>

                  <span className="rc-modal__counter">
                    {modalPageIndex + 1} / {ALL_PAGE_INDEXES.length}
                  </span>

                  <button
                    type="button"
                    className="rc-modal__nav-btn"
                    onClick={() =>
                      setModalPageIndex(
                        (curr) => ((curr ?? 0) + 1) % ALL_PAGE_INDEXES.length
                      )
                    }
                  >
                    <span>{isAr ? "التالي" : "Next"}</span>
                    <ChevronLeft size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
