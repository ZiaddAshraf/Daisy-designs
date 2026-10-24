"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SiteImage from "@/components/site-image";
import type { Locale } from "@/lib/locale";
import storyProductData from "@/data/story-product.json";
import { TinyDaisyDoodle } from "@/components/decorative-marks";
import { useCart, useWishlist } from "@/components/storefront";
import { formatPrice } from "@/lib/products";
import {
  X,
  Heart,
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
  MessageCircle,
  PenTool,
  Maximize2,
  Sparkles,
  Zap,
} from "lucide-react";

type StoryBookPreviewProps = {
  locale: Locale;
  inStock?: boolean;
  initialStoryId?: string;
};

export type StoryItem = {
  id: string;
  slug: string;
  titleAr: string;
  titleEn: string;
  badgeAr: string;
  badgeEn: string;
  descriptionAr: string;
  descriptionEn: string;
  coverUrl: string;
  sampleHero: string;
  dimensions: { width: number; height: number };
};

export type UploadedStoryPhoto = {
  id: string;
  file: File;
  previewUrl: string;
  storageKey: string;
};

// Story Themes removed per user request (delete هم اللي يختاروا)

export const AVAILABLE_STORIES: StoryItem[] = [
  {
    id: "first-year-at-school",
    slug: "first-year-at-school",
    titleAr: "قصة أول سنة في المدرسة",
    titleEn: "First Year at School",
    badgeAr: "أول سنة مدرسة",
    badgeEn: "First Year School",
    descriptionAr: "قصة ملهمة ومشوقة عن اليوم الأول في المدرسة، وتكوين صداقات جديدة والشجاعة وحب التعلم وبناء الثقة بالنفس.",
    descriptionEn: "A heartwarming keepsake celebrating their first school day, new friendships, courage, and self-confidence.",
    coverUrl: "/products/customized-stories/first-year-at-school/cover.jpeg",
    sampleHero: "عز",
    dimensions: { width: 902, height: 1280 },
  },
  {
    id: "yahya-red-ball",
    slug: "yahya-red-ball",
    titleAr: "قصة يحيى والكرة الحمراء",
    titleEn: "The Red Ball Adventure",
    badgeAr: "للأطفال الصغار",
    badgeEn: "Toddler & Play",
    descriptionAr: "قصة مبهجة ولطيفة للأطفال الصغار عن اللعب والمرح واكتشاف الألوان والأنشطة والابتسامة الحلوة بالكرة الحمراء.",
    descriptionEn: "A joyful and colorful story for little ones celebrating playtime, smiles, and playful discovery with the red ball.",
    coverUrl: "/products/customized-stories/story-02-red-ball.jpeg",
    sampleHero: "يحيى",
    dimensions: { width: 1128, height: 1600 },
  },
  {
    id: "cats-friends",
    slug: "cats-friends",
    titleAr: "قصة يحيى وأصدقائه الميااو (لولو وتوتو)",
    titleEn: "The Meow Friends: Lulu & Toto",
    badgeAr: "مغامرة القطط",
    badgeEn: "Meow Friends",
    descriptionAr: "مغامرة لطيفة ودافئة عن حب الحيوانات الأليفة والرفق بها ومواقف مضحكة ومحببة مع القطط الصغيرة لولو وتوتو.",
    descriptionEn: "A gentle and adorable story nurturing kindness to animals and playful fun with sweet kittens Lulu and Toto.",
    coverUrl: "/products/customized-stories/story-03-cats-friends.jpeg",
    sampleHero: "يحيى",
    dimensions: { width: 1128, height: 1600 },
  },
  {
    id: "minecraft-adventure",
    slug: "minecraft-adventure",
    titleAr: "قصة مغامرة علي في عالم Minecraft",
    titleEn: "Minecraft World Adventure",
    badgeAr: "ماينكرافت وألعاب",
    badgeEn: "Minecraft Gaming",
    descriptionAr: "مغامرة حماسية مليئة بالإبداع والذكاء والتحدي والبناء والتعاون داخل عالم ماينكرافت المحبوب لكل الأطفال.",
    descriptionEn: "An exciting gaming adventure filled with creativity, crafting, building, and courage in the beloved Minecraft world.",
    coverUrl: "/products/customized-stories/story-04-minecraft.jpeg",
    sampleHero: "علي",
    dimensions: { width: 1127, height: 1600 },
  },
];

export function StoryBookPreview({ locale, inStock = true, initialStoryId }: StoryBookPreviewProps) {
  const isAr = locale === "ar";
  const { add } = useCart();

  const product = storyProductData.product;

  // Mode switcher: Ready-made 4 stories VS Bespoke Custom Story (خصص قصتك)
  const [isCustomMode, setIsCustomMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        const sp = new URLSearchParams(window.location.search);
        if (sp.get("mode") === "custom" || sp.get("collection") === "custom-story" || sp.get("custom") === "true") {
          return true;
        }
      } catch {
        // ignore
      }
    }
    return (
      initialStoryId === "story-design-your-own" ||
      initialStoryId === "custom-story" ||
      initialStoryId === "design-your-own"
    );
  });

  // Selected story from the 4 available titles
  const [selectedStoryId, setSelectedStoryId] = useState<string>(
    initialStoryId && AVAILABLE_STORIES.some((s) => s.id === initialStoryId)
      ? initialStoryId
      : "first-year-at-school"
  );

  const activeStory = AVAILABLE_STORIES.find((s) => s.id === selectedStoryId) ?? AVAILABLE_STORIES[0];

  // Custom Story State
  const [customIdeaText, setCustomIdeaText] = useState<string>("");
  const [dedicationText, setDedicationText] = useState<string>("");

  // Cover zoom lightbox state
  const [isCoverZoomed, setIsCoverZoomed] = useState(false);

  // Child Name
  const [childName, setChildName] = useState("");

  // Multiple photos upload state (up to 5 photos)
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedStoryPhoto[]>([]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Commerce controls
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const unitPrice = product.price ?? 200;
  const totalPrice = unitPrice * quantity;
  const [addedToCart, setAddedToCart] = useState(false);
  const { toggle: toggleStoreWishlist, has: inStoreWishlist } = useWishlist();
  const isWishlisted = inStoreWishlist("first-year-at-school");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoSectionRef = useRef<HTMLDivElement>(null);
  const [highlightDropzone, setHighlightDropzone] = useState(false);

  const scrollToPhotoUpload = () => {
    if (photoSectionRef.current) {
      photoSectionRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightDropzone(true);
      setTimeout(() => setHighlightDropzone(false), 2500);
    } else if (fileInputRef.current) {
      fileInputRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    setUploadError(
      isAr
        ? "يا ريت تختاري صورة أو أكثر لطفلك أولاً عشان نجهز القصة باسمه وصورته"
        : "Please select your child's photo(s) first"
    );
  };

  const handleDirectBuy = () => {
    if (uploadedPhotos.length === 0) {
      scrollToPhotoUpload();
      return;
    }
    handleAddToCart();
    router.push("/checkout");
  };

  // Clean up blob URLs when component unmounts or photos change
  useEffect(() => {
    return () => {
      uploadedPhotos.forEach((p) => {
        if (p.previewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(p.previewUrl);
        }
      });
    };
  }, [uploadedPhotos]);

  // Flash added to cart state
  useEffect(() => {
    if (!addedToCart) return;
    const timer = setTimeout(() => setAddedToCart(false), 4500);
    return () => clearTimeout(timer);
  }, [addedToCart]);

  const toggleWishlist = () => {
    toggleStoreWishlist({
      slug: "first-year-at-school",
      name: isCustomMode
        ? isAr
          ? "صمم قصتك لطفلك ✨"
          : "Design Your Story ✨"
        : isAr
        ? activeStory.titleAr
        : activeStory.titleEn,
      category: isAr ? "قصص مخصصة" : "Customized Stories",
      price: unitPrice,
      image: isCustomMode
        ? "/products/customized-stories/first-year-at-school/cover.jpeg"
        : activeStory.coverUrl,
      description: isCustomMode
        ? isAr
          ? "قصة ورقية مطبوعة فاخرة نؤلفها ونرسمها خصيصاً لطفلك بفكرته الخاصة."
          : "Bespoke printed storybook authored and illustrated around your child."
        : isAr
        ? activeStory.descriptionAr
        : activeStory.descriptionEn,
      customizable: true,
    });
  };

  // Handle Photo Selection & Secure Upload (Supports Multiple Files up to 5)
  const handleFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFiles = Array.from(e.target.files ?? []);
    if (rawFiles.length === 0) return;

    const remainingSlots = 5 - uploadedPhotos.length;
    if (remainingSlots <= 0) {
      setUploadError(
        isAr
          ? "الحد الأقصى هو ٥ صور للقصة الواحدة"
          : "Maximum 5 photos allowed per story"
      );
      return;
    }

    const filesToUpload = rawFiles.slice(0, remainingSlots);
    setUploadError(null);
    setIsUploadingPhoto(true);

    try {
      const newUploads: UploadedStoryPhoto[] = [];

      for (const file of filesToUpload) {
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(
            isAr
              ? `حجم الصورة ${file.name} يتجاوز الحد الأقصى (١٠ ميجابايت)`
              : `Photo ${file.name} exceeds 10MB limit`
          );
        }

        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
          throw new Error(
            isAr
              ? `الملف ${file.name} ليس صورة صالحة (JPEG أو PNG أو WebP)`
              : `File ${file.name} is not a valid JPEG/PNG/WebP image`
          );
        }

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

        const localBlob = URL.createObjectURL(file);
        newUploads.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          file,
          previewUrl: localBlob,
          storageKey: data.key,
        });
      }

      setUploadedPhotos((prev) => [...prev, ...newUploads]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload error";
      setUploadError(msg);
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemovePhoto = (id: string) => {
    setUploadedPhotos((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target && target.previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((p) => p.id !== id);
    });
  };

  // Add to Cart
  const handleAddToCart = () => {
    if (!inStock) return;
    if (uploadedPhotos.length === 0) {
      scrollToPhotoUpload();
      return;
    }

    const summaryParts: string[] = [];
    if (childName.trim()) {
      summaryParts.push(`اسم بطل القصة: ${childName.trim()}`);
    }

    if (isCustomMode) {
      summaryParts.push(`نوع القصة: صمم قصتك (فكرة خاصة)`);
      if (customIdeaText.trim()) {
        summaryParts.push(`تفاصيل وفكرة القصة: ${customIdeaText.trim()}`);
      }
      if (dedicationText.trim()) {
        summaryParts.push(`إهداء خاص: ${dedicationText.trim()}`);
      }
    } else {
      summaryParts.push(`القصة المختارة: ${isAr ? activeStory.titleAr : activeStory.titleEn}`);
    }

    summaryParts.push(`عدد الصور المرفقة: ${uploadedPhotos.length}`);

    const customText = summaryParts.join(" | ");

    const lineProductName = isCustomMode
      ? isAr
        ? childName.trim()
          ? `صمم قصتك لطفلك (${childName.trim()})`
          : "صمم قصتك لطفلك ✨"
        : childName.trim()
        ? `Design Your Story (${childName.trim()})`
        : "Design Your Story ✨"
      : isAr
      ? childName.trim()
        ? `${activeStory.titleAr} (${childName.trim()})`
        : activeStory.titleAr
      : childName.trim()
      ? `${activeStory.titleEn} (${childName.trim()})`
      : activeStory.titleEn;

    const aggregateStorageKey = uploadedPhotos.map((p) => p.storageKey).join(",");

    add(
      {
        slug: product.slug,
        name: lineProductName,
        category: isAr ? "قصص مخصصة" : "Customized Stories",
        price: unitPrice,
        image: isCustomMode
          ? "/products/customized-stories/first-year-at-school/cover.jpeg"
          : activeStory.coverUrl,
        description: isCustomMode
          ? isAr
            ? "قصة ورقية مطبوعة فاخرة نؤلفها ونرسمها خصيصاً لطفلك بفكرته الخاصة."
            : "Bespoke printed storybook authored and illustrated around your child."
          : isAr
          ? activeStory.descriptionAr
          : activeStory.descriptionEn,
        customizable: true,
        hasVariants: false,
      },
      {
        child_photo: aggregateStorageKey,
        custom_design_text: customText,
      },
      undefined,
      quantity
    );

    setAddedToCart(true);
  };

  // Direct WhatsApp contact URL
  const whatsappUrl = `https://wa.me/201012345678?text=${encodeURIComponent(
    isAr
      ? `أهلاً Daisy Designs! عايزة أطلب ${
          isCustomMode ? "قصة مصممة خاصة بالكامل لطفلي ✨" : activeStory.titleAr
        }${childName.trim() ? ` (باسم: ${childName.trim()})` : ""}${
          uploadedPhotos.length > 0 ? ` مع ${uploadedPhotos.length} صور مرفقة` : ""
        }`
      : `Hello Daisy Designs! I'd like to order ${
          isCustomMode ? "a custom bespoke storybook ✨" : activeStory.titleEn
        } for my child${childName.trim() ? ` (${childName.trim()})` : ""}`
  )}`;

  const displayedTitle = isCustomMode
    ? isAr
      ? "صمم قصتك لطفلك ✨"
      : "Design Your Story ✨"
    : isAr
    ? activeStory.titleAr
    : activeStory.titleEn;

  const displayedBadge = isCustomMode
    ? isAr
      ? "صمم قصتك بالكامل"
      : "Bespoke Story"
    : isAr
    ? activeStory.badgeAr
    : activeStory.badgeEn;

  const displayedDescription = isCustomMode
    ? isAr
      ? "عايزة قصة بفكرة وموضوع من اختيارك؟ نؤلف ونرسم ونطبع كتاب ورقي مخصص بالكامل لطفلك باسمه وصوره وأحلى مغامرة بيحبها."
      : "A bespoke physical printed storybook authored, illustrated, and printed around your child's name, photos, and favorite theme."
    : isAr
    ? activeStory.descriptionAr
    : activeStory.descriptionEn;

  const displayedCoverUrl = isCustomMode
    ? "/products/customized-stories/first-year-at-school/cover.jpeg"
    : activeStory.coverUrl;

  return (
    <div className="sb-product-layout pb-20 md:pb-0">
      {/* 1. Hero: Two-column editorial presentation */}
      <section className="sb-hero" aria-labelledby="sb-hero-heading">
        {/* Media Column (Left) - COVER ONLY PROTECTED VIEW */}
        <div className="sb-hero__media">
          <div
            className="sb-hero__media-frame sb-hero__media-frame--cover-only relative overflow-hidden"
            role="button"
            tabIndex={0}
            onClick={() => setIsCoverZoomed(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setIsCoverZoomed(true);
            }}
            title={isAr ? "انقري لتكبير ومعاينة الغلاف بجودة عالية" : "Click to view full cover"}
            aria-label={displayedTitle}
          >
            {/* Zoom Icon Pill */}
            <span className="sb-hero__zoom-pill" aria-hidden="true">
              <Maximize2 size={13} />
              <span>{isAr ? "معاينة الغلاف" : "View Cover"}</span>
            </span>

            {/* Story Format Badge */}
            <span className="sb-hero__format-pill">
              <BookOpen size={12} />
              <span>{displayedBadge}</span>
            </span>

            {/* Story Cover Image (Selected Cover Only) */}
            <SiteImage
              key={displayedCoverUrl}
              src={displayedCoverUrl}
              alt={displayedTitle}
              width={activeStory.dimensions.width}
              height={activeStory.dimensions.height}
              priority
              sizes="(max-width: 960px) 100vw, 55vw"
              className="sb-hero__media-img sb-hero__media-img--cover"
            />

            {/* Dynamic Hero Child Name Badge overlay (in custom story mode) */}
            {isCustomMode && (
              <div className="absolute inset-x-4 bottom-5 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md py-2.5 px-4 rounded-xl border border-amber-500/40 shadow-lg text-center z-20 pointer-events-none">
                <span className="block text-[11px] font-bold text-amber-600 dark:text-amber-400">
                  {isAr ? "بطولة بطل حكايتنا:" : "Starring Our Hero:"}
                </span>
                <span className="block text-base sm:text-lg font-extrabold text-zinc-900 dark:text-zinc-100 truncate">
                  {childName.trim() || (isAr ? "اسم طفلك" : "Your Child's Name")}
                </span>
              </div>
            )}
          </div>

          {/* Copyright Protection Notice */}
          <div className="sb-copyright-card mt-3.5">
            <div className="sb-copyright-card__icon">
              <Lock size={16} />
            </div>
            <div className="sb-copyright-card__text">
              <strong>
                {isAr
                  ? "محتوى ورسومات القصة محمية بحقوق النشر لـ Daisy Designs ©"
                  : "Story artwork & narrative protected by copyright © Daisy Designs"}
              </strong>
              <p>
                {isAr
                  ? "تُطبع صفحات القصة الورقية بالكامل وتُسلّم لكم كنسخة مادية تذكارية بطلها طفلكم باسمه وصوره، وتُحفظ رسومات وصفحات القصة كمفاجأة مبهجة عند استلام الشحنة."
                  : "Storybook is printed in full 10-page physical paper format starring your child with their photos and name, preserved as a delightful tactile surprise upon arrival."}
              </p>
            </div>
          </div>

          {/* Key Physical Craftsmanship Facts */}
          <div className="sb-facts">
            <div className="sb-fact">
              <span className="sb-fact__label">{isAr ? "طبيعة المنتج" : "Format"}</span>
              <span className="sb-fact__detail">
                {isAr ? "كتاب ورقي مطبوع ومغلف فيزيائياً" : "Physical printed paper book"}
              </span>
            </div>

            <div className="sb-fact">
              <span className="sb-fact__label">{isAr ? "مدة التجهيز" : "Prep Time"}</span>
              <span className="sb-fact__detail">
                <Clock size={13} style={{ display: "inline", verticalAlign: "middle", marginInlineEnd: 4 }} />
                {isAr ? "يوم عمل واحد للتجهيز والطباعة" : "1 business day prep & print"}
              </span>
            </div>

            <div className="sb-fact">
              <span className="sb-fact__label">{isAr ? "المقاس والغلاف" : "Specs"}</span>
              <span className="sb-fact__detail">
                {isAr ? "مقاس A4 فاخر مع غلاف متين وطباعة كوشيه" : "A4 softcover with premium print"}
              </span>
            </div>

            <div className="sb-fact">
              <span className="sb-fact__label">{isAr ? "عدد الصفحات" : "Pages"}</span>
              <span className="sb-fact__detail">
                {isAr ? "١٠ صفحات ملونة كاملة بالألوان" : "10 full-color illustrated pages"}
              </span>
            </div>
          </div>
        </div>

        {/* Product Details & Selection Column (Right) */}
        <div className="sb-hero__content">
          <div className="sb-hero__eyebrow">
            <span className="sb-hero__eyebrow-text">
              DAISY DESIGNS / {isAr ? "قصص مخصصة للأطفال" : "CUSTOMIZED STORIES"}
            </span>
            <TinyDaisyDoodle size={14} className="sb-hero__eyebrow-icon" />
          </div>

          <h1 id="sb-hero-heading" className="sb-hero__title">
            {displayedTitle}
          </h1>

          <p className="sb-hero__subtitle">
            {displayedDescription}
          </p>

          {/* Price & Availability Card */}
          <div className="sb-purchase-card">
            <div className="sb-purchase-card__price-row">
              <div>
                <span className="sb-purchase-card__price">
                  {formatPrice(totalPrice, locale)}
                </span>
                <span className="sb-purchase-card__price-note">
                  {quantity > 1
                    ? isAr
                      ? `إجمالي ${quantity} قصص (${formatPrice(unitPrice, locale)} للقصة المطبوعة)`
                      : `Total for ${quantity} books (${formatPrice(unitPrice, locale)} each)`
                    : isAr
                    ? "للكتاب الورقي المطبوع كاملاً والتغليف الفاخر"
                    : "per complete physical printed storybook"}
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

            {/* Mode Switcher: 4 Ready Stories vs Bespoke Custom Story */}
            <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 mb-5">
              <button
                type="button"
                onClick={() => setIsCustomMode(false)}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  !isCustomMode
                    ? "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 shadow-sm border border-zinc-200/80 dark:border-zinc-700"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                }`}
              >
                <BookOpen size={15} className="text-amber-500" />
                <span>{isAr ? "القصص الجاهزة (٤ قصص)" : "Ready Stories (4 Titles)"}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsCustomMode(true)}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isCustomMode
                    ? "bg-amber-500 text-white shadow-sm font-extrabold"
                    : "text-amber-700 dark:text-amber-400 hover:text-amber-800"
                }`}
              >
                <Sparkles size={15} />
                <span>{isAr ? "خصص وصمم قصتك ✨" : "Design Your Story ✨"}</span>
              </button>
            </div>

            {/* If Ready Stories: 4 Story Cards (هم اللي يختاروا وبس) */}
            {!isCustomMode ? (
              <div className="sb-input-group">
                <label className="sb-input-label text-zinc-900 dark:text-zinc-100">
                  <BookOpen size={15} className="text-amber-500" />
                  <span>{isAr ? "اختاري القصة المطلوبة (٤ قصص متاحة):" : "Select Story Title:"}</span>
                </label>

                <div className="grid grid-cols-2 gap-2.5" role="radiogroup" aria-label={isAr ? "اختيار القصة" : "Select Story"}>
                  {AVAILABLE_STORIES.map((story) => {
                    const isSelected = selectedStoryId === story.id;
                    return (
                      <button
                        key={story.id}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => setSelectedStoryId(story.id)}
                        className={`relative flex items-center gap-2.5 p-2.5 rounded-xl border text-start transition-all cursor-pointer ${
                          isSelected
                            ? "bg-amber-500/10 dark:bg-amber-500/20 border-amber-500 shadow-sm ring-2 ring-amber-500/30"
                            : "bg-zinc-50 dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700/80 hover:bg-zinc-100 dark:hover:bg-zinc-700/60"
                        }`}
                      >
                        <div className="w-11 h-15 rounded-md overflow-hidden shrink-0 border border-black/10 bg-zinc-200">
                          <SiteImage
                            src={story.coverUrl}
                            alt={isAr ? story.titleAr : story.titleEn}
                            width={44}
                            height={60}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <span className="block text-[11px] font-bold text-amber-600 dark:text-amber-400">
                            {isAr ? story.badgeAr : story.badgeEn}
                          </span>
                          <span className="block text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-tight line-clamp-2 mt-0.5">
                            {isAr ? story.titleAr : story.titleEn}
                          </span>
                        </div>

                        {isSelected && (
                          <span className="absolute top-2 inset-inline-end-2 w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs shadow-sm">
                            <Check size={12} strokeWidth={3} />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Custom Story Mode: Idea / Plot Details + Dedication */
              <div className="space-y-3.5 mb-2">
                {/* Freeform Details Textarea */}
                <div className="sb-input-group">
                  <label htmlFor="sb-custom-idea-input" className="sb-input-label text-zinc-900 dark:text-zinc-100">
                    <Sparkles size={15} className="text-amber-500" />
                    <span>
                      {isAr ? "فكرة وتفاصيل القصة اللي تحبي نكتب عنها:" : "Custom Story Idea & Details:"}
                      <span className="text-xs text-[var(--muted-foreground)] font-normal"> ({isAr ? "اختياري" : "Optional"})</span>
                    </span>
                  </label>
                  <textarea
                    id="sb-custom-idea-input"
                    rows={3}
                    maxLength={500}
                    value={customIdeaText}
                    onChange={(e) => setCustomIdeaText(e.target.value)}
                    placeholder={
                      isAr
                        ? "احكي لنا الفكرة اللي حابة تكون عليها القصة أو أي تفاصيل ومواقف حابة نركز عليها مع طفلك..."
                        : "Describe the story idea or any special events you'd like us to include..."
                    }
                    className="w-full p-2.5 rounded-xl text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-800/90 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 placeholder:text-zinc-400 focus:border-amber-500 outline-none"
                  />
                </div>

                {/* Dedication Text Input */}
                <div className="sb-input-group">
                  <label htmlFor="sb-dedication-input" className="sb-input-label text-zinc-900 dark:text-zinc-100">
                    <Heart size={14} className="text-rose-500" />
                    <span>
                      {isAr ? "إهداء خاص يُطبع داخل القصة" : "Printed Dedication"}
                      <span className="text-xs text-[var(--muted-foreground)] font-normal"> ({isAr ? "اختياري" : "Optional"})</span>
                    </span>
                  </label>
                  <input
                    id="sb-dedication-input"
                    type="text"
                    maxLength={100}
                    value={dedicationText}
                    onChange={(e) => setDedicationText(e.target.value)}
                    placeholder={
                      isAr
                        ? "مثلاً: إلى بطلنا الغالي، فخورين بيك دايماً وبنحبك أوي — ماما وبابا"
                        : "e.g. To our brave champion, we love you always — Mom & Dad"
                    }
                    className="w-full p-2.5 rounded-xl text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-800/90 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 placeholder:text-zinc-400 focus:border-amber-500 outline-none"
                  />
                </div>
              </div>
            )}

            {/* Child's Name Input */}
            <div className="sb-input-group mt-1">
              <label htmlFor="sb-child-name-input" className="sb-input-label text-zinc-900 dark:text-zinc-100">
                <PenTool size={14} />
                <span>
                  {isAr ? "اسم بطل أو بطلة القصة" : "Child's Name"}
                  <span className="text-xs text-[var(--muted-foreground)] font-normal">
                    {" "}
                    ({isAr ? "يُطبع على الغلاف ومقدمة القصة" : "printed on cover & intro"})
                  </span>
                </span>
              </label>
              <input
                id="sb-child-name-input"
                type="text"
                maxLength={60}
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                placeholder={isAr ? `مثال: ${activeStory.sampleHero}، فريدة، ليلى...` : `e.g. ${activeStory.sampleHero}, Layla...`}
                className="sb-text-input bg-zinc-50 dark:bg-zinc-800/90 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-700 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-amber-500"
              />
            </div>

            {/* Multi-Photo Upload Zone (Supports 1 to 5 photos) */}
            <div
              ref={photoSectionRef}
              id="story-photo-section"
              className={`sb-upload-box transition-all duration-300 ${
                highlightDropzone ? "ring-4 ring-amber-500 shadow-xl scale-[1.01]" : ""
              }`}
            >
              <div className="sb-upload-box__header">
                <div className="sb-upload-box__title">
                  <Upload size={16} />
                  <span>
                    {isAr ? "صور بطل القصة (صورة أو أكثر - حتى ٥ صور)" : "Child's Photos (1 to 5 Photos)"}
                  </span>
                </div>
                <span className="sb-upload-box__privacy-pill">
                  <Lock size={12} />
                  <span>{isAr ? "تخزين مشفر ومحمي" : "Secure Private Storage"}</span>
                </span>
              </div>

              <p className="sb-upload-box__hint">
                {isAr
                  ? "تقدري تختاري صورة واحدة أو كذا صورة لطفلك، وفريقنا بيختار أفضل زاوية مناسبة للغلاف وصفحات القصة."
                  : "Upload one or several clear photos of your child. Our team will select the best angle for the cover and scenes."}
              </p>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                className="sb-upload-box__input-hidden"
                id="child-photo-file-input"
                onChange={handleFilesChange}
                disabled={isUploadingPhoto || uploadedPhotos.length >= 5}
              />

              {uploadedPhotos.length === 0 ? (
                <label
                  htmlFor="child-photo-file-input"
                  className="sb-upload-dropzone cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
                  }}
                >
                  <Upload size={24} className="sb-upload-dropzone__icon" />
                  <span className="sb-upload-dropzone__cta">
                    {isAr ? "انقري لاختيار صورة أو أكثر لطفلك" : "Click to select child photos"}
                  </span>
                  <span className="sb-upload-dropzone__subtext">
                    {isAr ? "يمكنكِ اختيار حتى ٥ صور (JPEG / PNG / WebP)" : "Select up to 5 photos (JPEG, PNG, or WebP)"}
                  </span>
                </label>
              ) : (
                <div className="space-y-3">
                  {/* Photo Gallery Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {uploadedPhotos.map((photo, idx) => (
                      <div
                        key={photo.id}
                        className="relative group rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 p-1.5 flex flex-col items-center"
                      >
                        <div className="relative w-full aspect-3/4 rounded-lg overflow-hidden bg-zinc-200 dark:bg-zinc-900">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={photo.previewUrl}
                            alt={photo.file.name}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-1.5 inset-inline-start-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-black/75 text-white backdrop-blur-xs">
                            {idx === 0
                              ? isAr
                                ? "🌟 الرئيسية"
                                : "🌟 Primary"
                              : isAr
                              ? `#${idx + 1}`
                              : `#${idx + 1}`}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(photo.id)}
                            title={isAr ? "حذف الصورة" : "Remove photo"}
                            aria-label={isAr ? "حذف الصورة" : "Remove photo"}
                            className="absolute top-1.5 inset-inline-end-1.5 w-6 h-6 rounded-full bg-red-600/90 hover:bg-red-600 text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
                          >
                            <X size={13} strokeWidth={2.5} />
                          </button>
                        </div>
                        <span className="text-[11px] text-zinc-600 dark:text-zinc-400 truncate max-w-full mt-1 px-1">
                          {photo.file.name}
                        </span>
                      </div>
                    ))}

                    {/* Add More Photos Card if < 5 */}
                    {uploadedPhotos.length < 5 && (
                      <label
                        htmlFor="child-photo-file-input"
                        className="border-2 border-dashed border-amber-500/40 hover:border-amber-500 bg-amber-500/5 hover:bg-amber-500/10 rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all aspect-3/4 text-center"
                      >
                        <Plus size={20} className="text-amber-600 dark:text-amber-400" />
                        <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
                          {isAr ? "إضافة صورة كمان" : "Add Another"}
                        </span>
                        <span className="text-[10px] text-zinc-500">
                          {isAr
                            ? `(متبقي ${5 - uploadedPhotos.length})`
                            : `(${5 - uploadedPhotos.length} left)`}
                        </span>
                      </label>
                    )}
                  </div>

                  {/* Status Banner */}
                  <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 rounded-lg px-3 py-2 border border-emerald-500/20">
                    <span className="flex items-center gap-1.5 font-bold">
                      <Check size={14} />
                      <span>
                        {isAr
                          ? `تم حفظ وتأمين ${uploadedPhotos.length} ${
                              uploadedPhotos.length === 1 ? "صورة" : "صور"
                            } بنجاح`
                          : `${uploadedPhotos.length} photo(s) secured`}
                      </span>
                    </span>
                    <span className="text-[11px] text-zinc-500">
                      {isAr ? "تخزين مشفر" : "Encrypted"}
                    </span>
                  </div>
                </div>
              )}

              {isUploadingPhoto && (
                <div className="flex items-center gap-2 mt-2 text-xs text-amber-600 dark:text-amber-400">
                  <RefreshCw size={14} className="sb-spin" />
                  <span>{isAr ? "جاري رفع وتأمين الصور المشفرة..." : "Uploading & securing photos..."}</span>
                </div>
              )}

              {uploadError && (
                <div className="sb-upload-box__error mt-2" role="alert">
                  <AlertCircle size={15} />
                  <span>{uploadError}</span>
                </div>
              )}
            </div>

            {/* Quantity & Add to Cart Controls */}
            <div className="sb-purchase-controls flex flex-col gap-2.5">
              <div className="flex items-center gap-2.5 w-full">
                <div className="sb-quantity shrink-0" role="group" aria-label={isAr ? "الكمية" : "Quantity"}>
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
                  className={`daisy-button daisy-button--dark sb-add-btn flex-1 cursor-pointer active:scale-[0.98] ${
                    addedToCart ? "sb-add-btn--added" : ""
                  }`}
                  onClick={handleAddToCart}
                  disabled={!inStock || isUploadingPhoto}
                  title={
                    uploadedPhotos.length === 0
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
                        {uploadedPhotos.length === 0
                          ? isAr
                            ? "ارفعي صورة الطفل للإضافة"
                            : "Upload photo to add"
                          : isAr
                          ? "أضيفي القصة للسلة"
                          : "Add Story to Cart"}
                      </span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className={`sb-wishlist-btn shrink-0 cursor-pointer active:scale-90 transition-transform ${
                    isWishlisted ? "sb-wishlist-btn--active" : ""
                  }`}
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

              {/* Direct Buy Button (1-Click Instant Checkout) */}
              <button
                type="button"
                onClick={handleDirectBuy}
                disabled={!inStock || isUploadingPhoto}
                className="w-full min-h-12 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white text-xs sm:text-sm font-extrabold shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Zap size={16} className="fill-current text-amber-200" />
                <span>
                  {isAr
                    ? `اشتري الآن (دفع عند الاستلام) — ${formatPrice(totalPrice, locale)}`
                    : `Buy Now (Cash on Delivery) — ${formatPrice(totalPrice, locale)}`}
                </span>
              </button>
            </div>

            {/* Added to Cart Success Banner */}
            {addedToCart && (
              <div className="sb-cart-notification" role="status">
                <Check size={16} />
                <span>
                  {isAr
                    ? `تمت إضافة ${displayedTitle}${childName.trim() ? ` لبطلنا ${childName.trim()}` : ""} بنجاح لسلتك! ✨`
                    : `${displayedTitle} was successfully added to your cart!`}
                </span>
                <Link href="/cart" className="sb-cart-notification__link">
                  {isAr ? "شوفي السلة" : "View Cart"}
                </Link>
              </div>
            )}

            {/* WhatsApp Consultation Action for Inquiries */}
            <div className="sb-whatsapp-callout">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="sb-whatsapp-btn"
              >
                <MessageCircle size={17} className="text-emerald-500" />
                <span>
                  {isAr
                    ? `عايزة تستفسري عن ${displayedTitle}؟ كلمينا على الواتساب 💬`
                    : `Have questions about ${displayedTitle}? Chat with us on WhatsApp 💬`}
                </span>
              </a>
            </div>

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

      {/* 2. Educational & Emotional Values Section */}
      <section className="sb-milestones-section">
        <div className="sb-section-header">
          <p className="sb-section-header__eyebrow">
            {isAr ? "أثر القصة المخصصة على طفلك" : "The Magic of Personalized Storytelling"}
          </p>
          <h2 className="sb-section-header__title">
            {isAr ? "ليه القصة المطبوعة بالاسم والصورة بتفرق جداً مع الأطفال؟" : "Why Personalized Stories Build Unshakeable Confidence"}
          </h2>
          <p className="sb-section-header__lead">
            {isAr
              ? "لما طفلك يشوف اسمه وصوره بطل للحكاية في كتاب ورقي حقيقي، بتتغير نظرته للقراءة ويتعلم الشجاعة والثقة بالنفس."
              : "Seeing themselves as the protagonist in a physical printed book inspires self-worth, positive habits, and a genuine love for reading."}
          </p>
        </div>

        <div className="sb-milestones-grid">
          <div className="sb-milestone-card">
            <span className="sb-milestone-card__step">01</span>
            <h3 className="sb-milestone-card__title">
              {isAr ? "طفلك هو البطل الحقيقي" : "Child as the Hero"}
            </h3>
            <p className="sb-milestone-card__text">
              {isAr
                ? "رؤية الطفل لصورته واسمه في قلب الأحداث بتبني عنده ثقة عميقة بنفسه وشعور بالفخر والتميز."
                : "Seeing their own face and name embedded in the plot nurtures high self-esteem and healthy pride."}
            </p>
          </div>

          <div className="sb-milestone-card">
            <span className="sb-milestone-card__step">02</span>
            <h3 className="sb-milestone-card__title">
              {isAr ? "عشق القراءة والكتب الورقية" : "Inspiring a Love for Books"}
            </h3>
            <p className="sb-milestone-card__text">
              {isAr
                ? "بدل شاشات الموبايل، الكتاب الورقي المخصص بيتحول لأكتر كتاب بيطلبه طفلك كل ليلة قبل النوم."
                : "A tactile printed keepsake pulls kids away from digital screens and makes bedtime reading a joyful habit."}
            </p>
          </div>

          <div className="sb-milestone-card">
            <span className="sb-milestone-card__step">03</span>
            <h3 className="sb-milestone-card__title">
              {isAr ? "قيم تربوية ومشاعر إيجابية" : "Uplifting Life Lessons"}
            </h3>
            <p className="sb-milestone-card__text">
              {isAr
                ? "القصص بتغرس الشجاعة وحب المدرسة وتكوين الصداقات ومشاعر الأمان والاطمئنان في مواقف الحياة الجديدة."
                : "Encouraging themes of courage, empathy, school friendship, and emotional security in everyday transitions."}
            </p>
          </div>

          <div className="sb-milestone-card">
            <span className="sb-milestone-card__step">04</span>
            <h3 className="sb-milestone-card__title">
              {isAr ? "ذكرى أسرية تعيش طويلاً" : "A Lifelong Keepsake"}
            </h3>
            <p className="sb-milestone-card__text">
              {isAr
                ? "كتاب ورقي فاخر بأعلى جودة طباعة، بيفضل ذكرى جميلة وملموسة يحتفظ بيها طفلك في مكتبته لما يكبر."
                : "Durable high-quality print keepsake to cherish across childhood milestones and look back upon with fondness."}
            </p>
          </div>
        </div>
      </section>

      {/* 3. Physical Craftsmanship Details */}
      <section className="sb-craftsmanship-section">
        <div className="sb-craftsmanship-card">
          <div className="sb-craftsmanship-card__content">
            <div className="sb-craftsmanship-card__badge">
              <BookOpen size={14} />
              <span>{isAr ? "جودة Daisy Designs" : "Daisy Designs Craftsmanship"}</span>
            </div>
            <h2>
              {isAr ? "كتاب ورقي تذكاري مصنوع بحب في مصر 🇪🇬" : "A Tactile Keepsake Crafted with Love in Egypt 🇪🇬"}
            </h2>
            <p>
              {isAr
                ? "صُممت كل قصة لتكون ذكرى مادية ملموسة تُقرأ كل ليلة قبل النوم، وتُحفظ في مكتبة طفلك لسنوات قادمة. ألوان زاهية ثابتة، ورق سميك ممتاز، وتغليف فاخر يليق ببطل حكايتنا الصغير."
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

      {/* 4. Clean Cover-Only Lightbox Zoom Dialog */}
      {isCoverZoomed && (
        <div
          className="rc-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={displayedTitle}
          onClick={() => setIsCoverZoomed(false)}
        >
          <div className="rc-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="rc-modal__header">
              <span className="rc-modal__badge">
                {isAr ? `غلاف: ${displayedTitle}` : `Cover: ${displayedTitle}`}
              </span>
              <button
                type="button"
                className="rc-modal__close"
                onClick={() => setIsCoverZoomed(false)}
                aria-label={isAr ? "إغلاق المعاينة" : "Close preview"}
              >
                <X size={18} />
              </button>
            </div>

            <div className="rc-modal__body">
              <div className="rc-modal__visual">
                <SiteImage
                  src={displayedCoverUrl}
                  alt={displayedTitle}
                  width={activeStory.dimensions.width}
                  height={activeStory.dimensions.height}
                  className="rc-modal__img"
                />
              </div>

              <div className="rc-modal__info">
                <h3 className="rc-modal__title">
                  {displayedTitle}
                </h3>

                <p className="rc-modal__desc">
                  {displayedDescription}
                </p>

                <p className="mt-2 text-xs text-[var(--muted-foreground)] leading-relaxed">
                  {isAr
                    ? "كتاب ورقي مطبوع فاخر بطلها طفلك بصوره واسمه. لحماية الملكية الفكرية ورسومات Daisy Designs، تُطبع صفحات القصة وتُسلّم لكم كنسخة ورقية خاصة ومفاجأة مبهجة لطفلك."
                    : "Luxury printed paper storybook personalized with your child's name and photos. To safeguard intellectual property, interior pages are printed directly for your child and delivered as a delightful keepsake surprise."}
                </p>

                <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--muted-foreground)]">
                  <span>{isAr ? "طباعة ورقية فاخرة A4" : "A4 Premium Print"}</span>
                  <span>{isAr ? "١٠ صفحات ملونة كاملة" : "10 Color Pages"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sticky Quick-Purchase Bar */}
      <aside
        aria-label={isAr ? "شريط الشراء السريع" : "Quick purchase bar"}
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 px-3.5 py-2.5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
      >
        <div className="flex items-center justify-between gap-2.5 max-w-[500px] mx-auto">
          <div className="flex items-center gap-2 min-w-0">
            <div className="relative w-10 h-13 rounded-md overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200 dark:border-zinc-700">
              <SiteImage
                src={displayedCoverUrl}
                alt={displayedTitle}
                width={40}
                height={52}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">{displayedTitle}</p>
              <p className="text-xs font-black text-amber-600 dark:text-amber-400 mt-0.5">{formatPrice(totalPrice, locale)}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isUploadingPhoto}
              className="h-11 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-bold border border-zinc-300 dark:border-zinc-700 flex items-center gap-1 active:scale-95 transition-transform cursor-pointer"
              title={isAr ? "أضيفي إلى السلة" : "Add to Cart"}
            >
              <ShoppingBag size={15} />
              <span className="hidden xs:inline">{isAr ? "السلة" : "Cart"}</span>
            </button>

            <button
              type="button"
              onClick={handleDirectBuy}
              disabled={isUploadingPhoto}
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
