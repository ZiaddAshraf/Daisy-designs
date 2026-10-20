"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import SiteImage from "@/components/site-image";
import type { Locale } from "@/lib/locale";
import rewardCardsData from "@/data/reward-cards-product.json";
import {
  TinyDaisyDoodle,
  SparkleStar,
  PlayfulWiggle,
  DaisyFlower,
} from "@/components/decorative-marks";
import { useCart, useWishlist } from "@/components/storefront";
import { formatPrice } from "@/lib/products";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Maximize2,
  Heart,
  Sparkles,
  ShieldCheck,
  Layers,
  Sun,
  Moon,
  Gift,
  Award,
  HelpCircle,
  ShoppingBag,
  Check,
  Truck,
  Plus,
  Minus,
} from "lucide-react";

type RewardCardsPreviewProps = {
  locale: Locale;
  inStock?: boolean;
};

type CardTheme = "all" | "encouragement" | "joy" | "love" | "affirmations";

const CARD_THEMES: Record<number, CardTheme> = {
  1: "encouragement",
  2: "joy",
  3: "encouragement",
  4: "love",
  5: "love",
  6: "joy",
  7: "joy",
  8: "affirmations",
  9: "encouragement",
  10: "love",
};

const THEME_TABS: { id: CardTheme; labelAr: string; labelEn: string; count: number }[] = [
  { id: "all", labelAr: "الكل", labelEn: "All Cards", count: 10 },
  { id: "encouragement", labelAr: "تحفيز وعزيمة", labelEn: "Encouragement", count: 3 },
  { id: "joy", labelAr: "بهجة وابتسامة", labelEn: "Joy & Smiles", count: 3 },
  { id: "love", labelAr: "حب وحنان", labelEn: "Love & Warmth", count: 3 },
  { id: "affirmations", labelAr: "توكيدات إيجابية", labelEn: "Affirmations", count: 1 },
];

const CARD_IDEAS = [
  {
    ar: "فكرة لطيفة: ضعي هذا الكارت بجوار مقلمته أو كتاب الرياضيات في يوم الامتحان لتبثي في روحه الثقة واليقين بقدرته.",
    en: "A sweet idea: Tuck this note beside their pencil case on test day to fill their heart with confidence.",
  },
  {
    ar: "فكرة لطيفة: اتركي كارت النحلة الباسمة بجوار طبق الفطور الصباحي لتكون أول ما تقع عليه عيناه ابتسامة مبهجة.",
    en: "A sweet idea: Place this cheerful bumblebee note by their morning breakfast to start the day with pure joy.",
  },
  {
    ar: "فكرة لطيفة: قدمي كارت 'أنت نجم ساطع' بعد إنجاز عمل لطيف أو مساعدة أخوته كتقدير لروحه الجميلة.",
    en: "A sweet idea: Surprise them with this superstar note after a thoughtful deed or milestone.",
  },
  {
    ar: "فكرة لطيفة: كارت مرح يُعبّر عن الحب العفوي، رائع مع وجبة خفيفة مفضلة بعد يوم دراسي طويل.",
    en: "A sweet idea: A sweet, whimsical reminder that they add sweetness to your everyday life.",
  },
  {
    ar: "فكرة لطيفة: كارت دافئ مليء بالعاطفة يذكر طفلك بحبك اللامشروط في كل لحظة وبكل تفاصيل يومه.",
    en: "A sweet idea: A heartwarming reminder of your unconditional love anytime, anywhere.",
  },
  {
    ar: "فكرة لطيفة: بطاقة إيجابية مشرقة ترافق حقيبته المدرسية لتتمنى له يوماً مليئاً بالاكتشاف والأصدقاء.",
    en: "A sweet idea: Slip this colorful reminder into their school bag to wish them an adventurous day.",
  },
  {
    ar: "فكرة لطيفة: شخصية فرس النهر اللطيفة كفيلة بتحويل أي لحظة توتر أو حزن إلى ضحكة دافئة وعناق.",
    en: "A sweet idea: A jolly companion to turn frowns upside down with pure giggles.",
  },
  {
    ar: "فكرة لطيفة: اقرئي التوكيدات معه بصوت مسموع قبل الخروج من المنزل لبناء شخصية واثقة، طيبة وشجاعة.",
    en: "A sweet idea: Read these affirmations together before leaving the house to instill self-belief.",
  },
  {
    ar: "فكرة لطيفة: كارت العزيمة والإصرار عند تعلم مهارة جديدة كركوب الدراجة أو القراءة أو السباحة.",
    en: "A sweet idea: Give this encouraging boost when they're learning a new skill like biking or reading.",
  },
  {
    ar: "فكرة لطيفة: ثلاث كلمات بسيطة تصنع فارقاً أبدياً.. دسيها تحت وسادته لتبقى في قلبه طوال الليل.",
    en: "A sweet idea: Three simple, magical words placed under their pillow for peaceful dreams.",
  },
];

const MOMENTS = [
  {
    icon: Sun,
    badgeAr: "الصباح واللانش بوكس",
    badgeEn: "Lunchbox Surprise",
    titleAr: "مفاجأة تسعد يومه الدراسي",
    titleEn: "A Joyful Midday Surprise",
    descAr: "دَسّي كارت تشجيع سري بين شطيرة المدرسة أو المقلمة، ليرسم ابتسامة فخر واعتزاز وسط الحصص الدراسية.",
    descEn: "Tuck a secret encouragement note inside their lunchbox or pencil case to bring a proud smile in the middle of school.",
  },
  {
    icon: Award,
    badgeAr: "مكتب المذاكرة والواجبات",
    badgeEn: "Study Desk Inspiration",
    titleAr: "طاقة متجددة وثقة بالنفس",
    titleEn: "Focus & Self-Belief",
    descAr: "ضعي بطاقة 'أنت تستطيع' أو 'كن سعيداً' أمام عينيه على المكتب لتجديد طاقته وبث الحماس عند حل الواجبات.",
    descEn: "Prop up a cheerful card on their desk to replenish focus, positivity, and confidence during homework time.",
  },
  {
    icon: Moon,
    badgeAr: "مفاجأة قبل النوم",
    badgeEn: "Bedtime Love Note",
    titleAr: "رسالة حب دافئة تحت الوسادة",
    titleEn: "Comforting Goodnight Note",
    descAr: "اختاري كارت 'أحبك كثيراً' وضعيها تحت وسادته، ليختم يومه بشعور الأمان العميق والامتنان قبل النوم.",
    descEn: "Slip an 'I Love You' note under their pillow so they drift off to sleep surrounded by warmth, security, and love.",
  },
  {
    icon: Gift,
    badgeAr: "هدية تذكارية راقية",
    badgeEn: "Keepsake Box Memory",
    titleAr: "ذكريات جميلة تدوم للأبد",
    titleEn: "Cherished Childhood Keepsake",
    descAr: "علبة كرتونية صلبة وفاخرة تحفظ الكروت العشرة كذكرى طفولة نقية يعود إليها الطفل كلما احتاج ابتسامة.",
    descEn: "A sturdy, elegantly branded box designed to preserve these 10 cards as a treasured childhood keepsake.",
  },
];

const CRAFTSMANSHIP = [
  {
    icon: Layers,
    titleAr: "ورق مقوى صلب 350gsm",
    titleEn: "Heavyweight 350gsm Cardstock",
    descAr: "ورق سميك بلمس مخملي مطفأ يقاوم التجعد ويدوم طويلاً.",
    descEn: "Premium velvety matte cardstock resistant to everyday wear.",
  },
  {
    icon: ShieldCheck,
    titleAr: "حواف دائرية آمنة",
    titleEn: "Gentle Rounded Corners",
    descAr: "مصممة بزوايا ناعمة غير حادة لتناسب أيدي الأطفال الصغيرة بأمان تام.",
    descEn: "Child-friendly smooth rounded corners crafted for little hands.",
  },
  {
    icon: Sparkles,
    titleAr: "ألوان مبهجة عالية الثبات",
    titleEn: "Vibrant Eco-Friendly Inks",
    descAr: "طباعة احترافية بألوان ساطعة تحافظ على بهجتها ولمعانها.",
    descEn: "High-definition, fade-resistant prints with cheerful pastel tones.",
  },
  {
    icon: Gift,
    titleAr: "علبة هدايا تذكارية أنيقة",
    titleEn: "Keepsake Gift Packaging",
    descAr: "علبة مطبوعة من الأمام والخلف بشعار Daisy Designs لحفظ الكروت.",
    descEn: "Official branded Daisy Designs keepsake box designed for gifting.",
  },
];

// Array of all 11 preview indexes: -1 (Box) followed by 0..9 (Cards 1..10)
const ALL_PREVIEW_INDEXES = [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

export function RewardCardsPreview({ locale, inStock: inStockProp }: RewardCardsPreviewProps) {
  const isAr = locale === "ar";
  const { product } = rewardCardsData;
  const inStock = inStockProp ?? (product.stock !== null ? product.stock > 0 : true);
  const { add } = useCart();
  const { toggle: toggleStoreWishlist, has: inStoreWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const unitPrice = product.price ?? 200;
  const totalPrice = unitPrice * quantity;
  const [added, setAdded] = useState(false);
  // State
  const [activeTheme, setActiveTheme] = useState<CardTheme>("all");
  const [activePreviewIndex, setActivePreviewIndex] = useState<number>(-1);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  const isWishlisted = inStoreWishlist(product.slug);

  useEffect(() => {
    if (!added) return;
    const timer = setTimeout(() => setAdded(false), 4000);
    return () => clearTimeout(timer);
  }, [added]);

  const handleAddToCart = () => {
    if (!inStock) return;
    add(
      {
        slug: product.slug,
        name: productName,
        category: isAr ? "كروت التشجيع" : "Reward Cards",
        price: product.price ?? 200,
        image: product.primaryImage.url,
        description: productDescription,
        customizable: false,
        hasVariants: false,
      },
      undefined,
      undefined,
      quantity
    );
    setAdded(true);
  };

  const productName = isAr ? product.arabicName : product.name;
  const productSubName = isAr ? product.name : product.arabicName;
  const productDescription = isAr ? product.arabicDescription : product.description;
  const primaryImageAlt = isAr ? product.primaryImage.arabicAlt : product.primaryImage.alt;

  // Verified facts
  const productFacts = isAr
    ? [
        { label: "المحتويات", detail: "علبة كاملة تضم ١٠ كروت تشجيع مختلفة" },
        { label: "العلبة", detail: "علبة هدايا تذكارية أنيقة تحفظ الكروت" },
        { label: "الطباعة", detail: "كروت جاهزة ومطبوعة مسبقاً (غير مخصصة)" },
      ]
    : [
        { label: "Contents", detail: "Complete box set with 10 unique encouragement cards" },
        { label: "Packaging", detail: "Exclusive keepsake gift box designed for safekeeping" },
        { label: "Format", detail: "Pre-printed ready-made cards (non-personalized)" },
      ];

  // Filtered cards
  const filteredCards = product.gallery.filter((card) => {
    if (activeTheme === "all") return true;
    return CARD_THEMES[card.position] === activeTheme;
  });

  // Modal navigation handlers
  const handleCloseModal = useCallback(() => {
    if (selectedCardIndex !== null) {
      setActivePreviewIndex(selectedCardIndex);
    }
    setSelectedCardIndex(null);
  }, [selectedCardIndex]);

  const handlePrevCard = useCallback(() => {
    if (selectedCardIndex === null) return;
    if (selectedCardIndex === -1) {
      // From box to last card
      setSelectedCardIndex(product.gallery.length - 1);
    } else if (selectedCardIndex === 0) {
      setSelectedCardIndex(product.gallery.length - 1);
    } else {
      setSelectedCardIndex(selectedCardIndex - 1);
    }
  }, [selectedCardIndex, product.gallery.length]);

  const handleNextCard = useCallback(() => {
    if (selectedCardIndex === null) return;
    if (selectedCardIndex === -1) {
      // From box to first card
      setSelectedCardIndex(0);
    } else if (selectedCardIndex === product.gallery.length - 1) {
      setSelectedCardIndex(0);
    } else {
      setSelectedCardIndex(selectedCardIndex + 1);
    }
  }, [selectedCardIndex, product.gallery.length]);

  // Keyboard navigation
  useEffect(() => {
    if (selectedCardIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCloseModal();
      } else if (e.key === "ArrowLeft") {
        // In LTR: ArrowLeft = Prev. In RTL: ArrowLeft = Next (visual forward)
        if (isAr) handleNextCard();
        else handlePrevCard();
      } else if (e.key === "ArrowRight") {
        if (isAr) handlePrevCard();
        else handleNextCard();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedCardIndex, isAr, handleCloseModal, handlePrevCard, handleNextCard]);

  const previousActiveElementRef = useRef<HTMLElement | null>(null);
  const modalCloseBtnRef = useRef<HTMLButtonElement | null>(null);
  const touchStartXRef = useRef<number | null>(null);

  // Prevent background scroll and manage accessible focus
  useEffect(() => {
    if (selectedCardIndex !== null) {
      previousActiveElementRef.current = document.activeElement as HTMLElement | null;
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => {
        modalCloseBtnRef.current?.focus();
      });
    } else {
      document.body.style.overflow = "";
      if (previousActiveElementRef.current) {
        previousActiveElementRef.current.focus();
        previousActiveElementRef.current = null;
      }
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedCardIndex]);

  // Mobile touch swipe gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    touchStartXRef.current = null;
    if (Math.abs(deltaX) > 40) {
      if (deltaX > 0) {
        // Swiped right
        if (isAr) handleNextCard();
        else handlePrevCard();
      } else {
        // Swiped left
        if (isAr) handlePrevCard();
        else handleNextCard();
      }
    }
  };


  // Toggle Wishlist
  const handleToggleWishlist = () => {
    toggleStoreWishlist({
      slug: product.slug,
      name: productName,
      category: isAr ? "كروت التشجيع" : "Reward Cards",
      price: product.price ?? 200,
      image: product.primaryImage.url,
      description: productDescription,
      customizable: false,
      hasVariants: false,
    });
  };

  const thumbsContainerRef = useRef<HTMLDivElement>(null);
  const heroTouchStartXRef = useRef<number | null>(null);

  const currentSeqIndex = ALL_PREVIEW_INDEXES.indexOf(
    activePreviewIndex as (typeof ALL_PREVIEW_INDEXES)[number]
  );
  const safeSeqIndex = currentSeqIndex === -1 ? 0 : currentSeqIndex;

  const handlePrevPreview = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    const prevSeq = (safeSeqIndex - 1 + ALL_PREVIEW_INDEXES.length) % ALL_PREVIEW_INDEXES.length;
    setActivePreviewIndex(ALL_PREVIEW_INDEXES[prevSeq]);
  }, [safeSeqIndex]);

  const handleNextPreview = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    const nextSeq = (safeSeqIndex + 1) % ALL_PREVIEW_INDEXES.length;
    setActivePreviewIndex(ALL_PREVIEW_INDEXES[nextSeq]);
  }, [safeSeqIndex]);

  // Auto-scroll the corresponding thumbnail into view smoothly
  useEffect(() => {
    if (!thumbsContainerRef.current) return;
    const targetChildIndex = activePreviewIndex === -1 ? 0 : activePreviewIndex + 1;
    const targetThumb = thumbsContainerRef.current.children[targetChildIndex] as HTMLElement | undefined;
    if (targetThumb) {
      targetThumb.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [activePreviewIndex]);

  const handleHeroTouchStart = (e: React.TouchEvent) => {
    heroTouchStartXRef.current = e.touches[0].clientX;
  };

  const handleHeroTouchEnd = (e: React.TouchEvent) => {
    if (heroTouchStartXRef.current === null) return;
    const deltaX = e.changedTouches[0].clientX - heroTouchStartXRef.current;
    heroTouchStartXRef.current = null;
    if (Math.abs(deltaX) > 40) {
      if (deltaX > 0) {
        // Swiped rightward
        if (isAr) handlePrevPreview();
        else handlePrevPreview();
      } else {
        // Swiped leftward
        if (isAr) handleNextPreview();
        else handleNextPreview();
      }
    }
  };

  // Active preview item in hero
  const isBoxPreview = activePreviewIndex === -1;
  const activeCardPreview =
    !isBoxPreview && activePreviewIndex >= 0 && activePreviewIndex < product.gallery.length
      ? product.gallery[activePreviewIndex]
      : null;

  const previewImageUrl = isBoxPreview ? product.primaryImage.url : activeCardPreview!.url;
  const previewImageAlt = isBoxPreview
    ? primaryImageAlt
    : isAr
    ? activeCardPreview!.arabicTitle
    : activeCardPreview!.title;
  const previewWidth = isBoxPreview
    ? product.primaryImage.dimensions.width
    : activeCardPreview!.dimensions.width;
  const previewHeight = isBoxPreview
    ? product.primaryImage.dimensions.height
    : activeCardPreview!.dimensions.height;

  const previewZoomLabel = isBoxPreview
    ? isAr
      ? "معاينة العلبة الكاملة"
      : "Explore Box Packaging"
    : isAr
    ? `معاينة كارت ${activeCardPreview!.arabicTitle}`
    : `Explore ${activeCardPreview!.title} Card`;

  const previewCaption = isBoxPreview
    ? isAr
      ? "العلبة الأصلية من الأمام والخلف مع استعراض محتويات الكروت العشرة"
      : "Authentic keepsake box packaging (front & back) showcasing the 10 included cards"
    : isAr
    ? `كارت رقم ${activeCardPreview!.position} من ١٠: ${activeCardPreview!.arabicTitle} — ${activeCardPreview!.title}`
    : `Card ${activeCardPreview!.position} of 10: ${activeCardPreview!.title} — ${activeCardPreview!.arabicTitle}`;

  // Current modal card
  const isBoxModal = selectedCardIndex === -1;
  const currentCard =
    selectedCardIndex !== null && selectedCardIndex >= 0 && selectedCardIndex < product.gallery.length
      ? product.gallery[selectedCardIndex]
      : null;

  return (
    <div className="rc-product-layout">
      {/* 1. Hero: Balanced Two-Column Editorial Product Hero */}
      <section className="rc-hero" aria-labelledby="rc-hero-heading">
        {/* Visual Column */}
        <div className="rc-hero__media">
          <div
            className="rc-hero__media-frame"
            role="button"
            tabIndex={0}
            onClick={() => setSelectedCardIndex(activePreviewIndex)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                setSelectedCardIndex(activePreviewIndex);
              } else if (e.key === "ArrowLeft") {
                e.preventDefault();
                if (isAr) handleNextPreview();
                else handlePrevPreview();
              } else if (e.key === "ArrowRight") {
                e.preventDefault();
                if (isAr) handlePrevPreview();
                else handleNextPreview();
              }
            }}
            onTouchStart={handleHeroTouchStart}
            onTouchEnd={handleHeroTouchEnd}
            title={isAr ? "انقر لتكبير ومعاينة الصورة بالحجم الكامل" : "Click to view full-size"}
            aria-label={previewZoomLabel}
          >
            {/* Left navigation arrow button */}
            <button
              type="button"
              className="rc-hero__arrow rc-hero__arrow--left"
              onClick={isAr ? handleNextPreview : handlePrevPreview}
              aria-label={isAr ? "عرض الصورة التالية" : "Previous image"}
              title={isAr ? "التالي" : "Previous"}
            >
              <ChevronLeft size={20} />
            </button>

            {/* Right navigation arrow button */}
            <button
              type="button"
              className="rc-hero__arrow rc-hero__arrow--right"
              onClick={isAr ? handlePrevPreview : handleNextPreview}
              aria-label={isAr ? "عرض الصورة السابقة" : "Next image"}
              title={isAr ? "السابق" : "Next"}
            >
              <ChevronRight size={20} />
            </button>

            {/* Current sequence counter indicator badge */}
            <span className="rc-hero__counter-badge" aria-hidden="true">
              {isAr
                ? `${(safeSeqIndex + 1).toLocaleString("ar-EG")} / ${ALL_PREVIEW_INDEXES.length.toLocaleString("ar-EG")}`
                : `${safeSeqIndex + 1} / ${ALL_PREVIEW_INDEXES.length}`}
            </span>

            <SiteImage
              key={previewImageUrl}
              src={previewImageUrl}
              alt={previewImageAlt}
              width={previewWidth}
              height={previewHeight}
              priority
              sizes="(max-width: 960px) 100vw, 55vw"
              className={`rc-hero__media-img ${isBoxPreview ? "rc-hero__media-img--box" : "rc-hero__media-img--card"}`}
            />
          </div>

          {/* Compact Responsive Thumbnails Grid */}
          <div
            ref={thumbsContainerRef}
            className="rc-hero__thumbs"
            role="region"
            aria-label={isAr ? "معاينة كروت العلبة والتصميمات" : "Box set and card thumbnails"}
          >
            {/* Box Packaging Thumbnail */}
            <button
              type="button"
              className={`rc-hero__thumb ${isBoxPreview ? "rc-hero__thumb--active" : ""}`}
              onClick={() => setActivePreviewIndex(-1)}
              aria-label={isAr ? "معاينة علبة الهدايا الأصلية" : "Preview official gift box"}
              aria-current={isBoxPreview ? "true" : undefined}
              title={isAr ? "علبة الهدايا الأصلية" : "Official Gift Box"}
            >
              <SiteImage
                src={product.primaryImage.url}
                alt={isAr ? "علبة الهدايا الأصلية" : "Official Gift Box"}
                width={72}
                height={72}
                className="rc-hero__thumb-img rc-hero__thumb-img--box"
              />
              <span className="rc-hero__thumb-badge">{isAr ? "العلبة" : "Box"}</span>
            </button>

            {/* 10 Individual Reward Card Thumbnails */}
            {product.gallery.map((card, idx) => {
              const isSelected = activePreviewIndex === idx;
              const cardTitle = isAr ? card.arabicTitle : card.title;
              const cardNum = String(card.position).padStart(2, "0");

              return (
                <button
                  key={card.position}
                  type="button"
                  className={`rc-hero__thumb ${isSelected ? "rc-hero__thumb--active" : ""}`}
                  onClick={() => setActivePreviewIndex(idx)}
                  aria-label={isAr ? `معاينة كارت ${cardTitle}` : `Preview ${card.title} card`}
                  aria-current={isSelected ? "true" : undefined}
                  title={cardTitle}
                >
                  <SiteImage
                    src={card.url}
                    alt={cardTitle}
                    width={72}
                    height={72}
                    className="rc-hero__thumb-img"
                  />
                  <span className="rc-hero__thumb-badge">{cardNum}</span>
                </button>
              );
            })}
          </div>

          <span className="rc-hero__media-caption">
            {previewCaption}
          </span>
        </div>

        {/* Information Column */}
        <div className="rc-hero__info">
          <div className="rc-hero__brand-badge">
            <span className="daisy-brand-pill">
              <TinyDaisyDoodle size={14} className="rc-hero__brand-flower" />
              DAISY DESIGNS / {isAr ? "كروت التشجيع" : "REWARD CARDS"}
            </span>
          </div>

          <h1 id="rc-hero-heading" className="rc-hero__title">
            {productName}
          </h1>
          <p className="rc-hero__subtitle" dir="ltr">
            {productSubName}
          </p>

          <p className="rc-hero__description">{productDescription}</p>

          {/* Product Facts */}
          <div className="rc-facts">
            {productFacts.map((fact, index) => (
              <div key={index} className="rc-facts__item">
                <span className="rc-facts__label">{fact.label}</span>
                <span className="rc-facts__detail">{fact.detail}</span>
              </div>
            ))}
          </div>

          {/* Confirmed Price, Qualitative Availability & Purchase Actions */}
          <div className="rc-purchase-container">
            <div className="rc-price-header">
              <div className="rc-price-tag">
                <span className="rc-price-number">{formatPrice(totalPrice, locale)}</span>
                <span className="rc-price-unit">
                  {quantity > 1
                    ? isAr
                      ? `إجمالي ${quantity} علب (${formatPrice(unitPrice, locale)} للعلبة)`
                      : `Total for ${quantity} boxes (${formatPrice(unitPrice, locale)} each)`
                    : isAr
                    ? "للعلبة الكاملة (١٠ كروت)"
                    : "per complete box (10 cards)"}
                </span>
              </div>
              <div className="rc-availability-wrap">
                <span
                  className={`rc-availability-badge ${
                    inStock ? "rc-availability-badge--in-stock" : "rc-availability-badge--out"
                  }`}
                >
                  <span className="rc-availability-dot" />
                  <span>
                    {inStock
                      ? isAr
                        ? "متوفر"
                        : "Available"
                      : isAr
                      ? "غير متوفر حالياً"
                      : "Currently unavailable"}
                  </span>
                </span>
              </div>
            </div>

            {inStock ? (
              <div className="rc-purchase-actions">
                <div className="rc-purchase-row">
                  <div className="rc-qty-picker" aria-label={isAr ? "الكمية" : "Quantity"}>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      aria-label={isAr ? "تقليل الكمية" : "Decrease quantity"}
                      className="rc-qty-btn"
                    >
                      <Minus size={13} />
                    </button>
                    <output className="rc-qty-value">{quantity}</output>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      aria-label={isAr ? "زيادة الكمية" : "Increase quantity"}
                      className="rc-qty-btn"
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="rc-add-to-cart-btn daisy-button daisy-button--dark"
                  >
                    <ShoppingBag size={16} />
                    <span>
                      {added
                        ? isAr
                          ? "تمت الإضافة للسلة!"
                          : "Added to Cart!"
                        : quantity > 1
                        ? isAr
                          ? `أضف إلى السلة — ${formatPrice(totalPrice, locale)}`
                          : `Add to Cart — ${formatPrice(totalPrice, locale)}`
                        : isAr
                        ? "أضف إلى السلة"
                        : "Add to Cart"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleToggleWishlist}
                    className={`rc-wishlist-btn ${isWishlisted ? "rc-wishlist-btn--active" : ""}`}
                    aria-label={isWishlisted ? (isAr ? "محفوظ في مفضلة هذا المتصفح" : "Saved in browser wishlist") : (isAr ? "حفظ في المفضلة" : "Save to wishlist")}
                    title={isWishlisted ? (isAr ? "محفوظ محلياً في مفضلة هذا المتصفح" : "Saved locally to this browser") : (isAr ? "حفظ محلي في مفضلة هذا المتصفح" : "Save locally to this browser")}
                  >
                    <Heart size={15} fill={isWishlisted ? "currentColor" : "none"} />
                    <span>{isWishlisted ? (isAr ? "محفوظ" : "Saved") : (isAr ? "المفضلة" : "Wishlist")}</span>
                  </button>
                </div>

                {added && (
                  <div className="rc-added-alert" role="status" aria-live="polite">
                    <Check size={14} className="rc-added-icon" />
                    <span>
                      {isAr
                        ? "تمت إضافة علبة كروت التشجيع إلى سلتك بنجاح ✓"
                        : "Reward Cards Box Set added to your cart ✓"}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className="rc-status__notice">
                {isAr ? "هذا المنتج غير متوفر حالياً." : "This product is currently out of stock."}
              </p>
            )}

            {/* COD & Shipping Trust Points */}
            <div className="rc-trust-strip">
              <span className="rc-trust-item">
                <ShieldCheck size={14} className="rc-trust-icon" />
                <span>{isAr ? "الدفع عند الاستلام (COD)" : "Cash on Delivery (COD)"}</span>
              </span>
              <span className="rc-trust-item">
                <Truck size={14} className="rc-trust-icon" />
                <span>{isAr ? "شحن لجميع المحافظات" : "Delivery across all governorates"}</span>
              </span>
            </div>

            <div className="rc-status__contact-row">
              <Link href="/contact" className="rc-status__contact-link">
                <HelpCircle size={14} />
                <span>{isAr ? "لأي استفسار أو تفاصيل إضافية حول المنتج، تواصل معنا" : "Have questions or need details? Contact our team"}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Ways to Use Story Section */}
      <section className="rc-moments" aria-labelledby="rc-moments-heading">
        <header className="rc-moments__header">
          <p className="rc-moments__eyebrow">
            <SparkleStar size={12} className="rc-moments__star" />
            {isAr ? "أفكار ملهمة للاستخدام اليومي" : "DAILY INSPIRATION MOMENTS"}
          </p>
          <h2 id="rc-moments-heading" className="rc-moments__title">
            {isAr ? "مفاجآت يومية تسعد قلوبهم" : "Small Surprises, Meaningful Moments"}
          </h2>
          <p className="rc-moments__subtitle">
            {isAr
              ? "طرق بسيطة ومبتكرة تزرع الفرح والثقة في تفاصيل يوم طفلك خطوة بخطوة."
              : "Thoughtful ways to bring cheer, encouragement, and reassurance to your child every single day."}
          </p>
        </header>

        <div className="rc-moments__grid">
          {MOMENTS.map((moment, index) => {
            const Icon = moment.icon;
            return (
              <article key={index} className="rc-moment-card">
                <div className="rc-moment-card__icon-wrap">
                  <Icon size={20} className="rc-moment-card__icon" />
                </div>
                <span className="rc-moment-card__badge">
                  {isAr ? moment.badgeAr : moment.badgeEn}
                </span>
                <h3 className="rc-moment-card__title">
                  {isAr ? moment.titleAr : moment.titleEn}
                </h3>
                <p className="rc-moment-card__desc">
                  {isAr ? moment.descAr : moment.descEn}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      {/* 3. The 10 Encouragement Cards Gallery */}
      <section className="rc-gallery" aria-labelledby="rc-gallery-heading">
        <header className="rc-gallery__header">
          <p className="rc-gallery__eyebrow">
            {isAr ? "محتويات العلبة كاملة" : "INSIDE THE BOX"}
          </p>
          <h2 id="rc-gallery-heading" className="rc-gallery__title">
            {isAr ? "كروت التحفيز العشرة" : "The 10 Encouragement Cards"}
          </h2>
          <p className="rc-gallery__subtitle">
            {isAr
              ? "تصميمات ملهمة ومتنوعة صنعت بكل حب لترافق أطفالكم كل يوم. انقر على أي كارت لمعاينته بالحجم الكامل."
              : "Ten inspiring, cheerful designs crafted to uplift and delight your child every day. Click any card for a full-size preview."}
          </p>

          {/* Filter Tabs */}
          <div className="rc-gallery__tabs" role="tablist" aria-label={isAr ? "تصنيفات الكروت" : "Card Categories"}>
            {THEME_TABS.map((tab) => {
              const active = activeTheme === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveTheme(tab.id)}
                  className={`rc-gallery__tab ${active ? "rc-gallery__tab--active" : ""}`}
                >
                  <span>{isAr ? tab.labelAr : tab.labelEn}</span>
                  <span className="rc-gallery__tab-count">{tab.count}</span>
                </button>
              );
            })}
          </div>
        </header>

        {/* Gallery Grid */}
        <div className="rc-gallery__grid" role="list">
          {filteredCards.map((card) => {
            const cardTitle = isAr ? card.arabicTitle : card.title;
            const cardSub = isAr ? card.title : card.arabicTitle;
            const cardNum = String(card.position).padStart(2, "0");
            const originalIndex = card.position - 1;

            return (
              <div
                key={card.position}
                className="rc-card"
                role="listitem"
                tabIndex={0}
                onClick={() => setSelectedCardIndex(originalIndex)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSelectedCardIndex(originalIndex)}
                title={isAr ? `تكبير ومعاينة كارت ${cardTitle}` : `Preview card ${cardTitle}`}
              >
                <div className="rc-card__visual">
                  <SiteImage
                    src={card.url}
                    alt={cardTitle}
                    width={card.dimensions.width}
                    height={card.dimensions.height}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="rc-card__img"
                  />
                  <div className="rc-card__overlay">
                    <span className="rc-card__overlay-pill">
                      <Maximize2 size={13} />
                      <span>{isAr ? "معاينة الكارت" : "Preview"}</span>
                    </span>
                  </div>
                </div>

                <div className="rc-card__caption">
                  <span className="rc-card__num">{cardNum}</span>
                  <div className="rc-card__copy">
                    <h3 className="rc-card__name">{cardTitle}</h3>
                    {cardSub && (
                      <span className="rc-card__trans" dir="ltr" lang={isAr ? "en" : "ar"}>
                        {cardSub}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Craftsmanship & Quality Assurance */}
      <section className="rc-craftsmanship" aria-labelledby="rc-craft-heading">
        <header className="rc-craftsmanship__header">
          <p className="rc-craftsmanship__eyebrow">
            {isAr ? "جودة الصنع والمواد" : "MATERIAL & CRAFTSMANSHIP"}
          </p>
          <h2 id="rc-craft-heading" className="rc-craftsmanship__title">
            {isAr ? "تفاصيل صُممت لتدوم بأمان" : "Crafted with Care and Safety"}
          </h2>
        </header>

        <div className="rc-craftsmanship__grid">
          {CRAFTSMANSHIP.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="rc-craft-pill">
                <div className="rc-craft-pill__icon">
                  <Icon size={18} />
                </div>
                <div className="rc-craft-pill__content">
                  <h3 className="rc-craft-pill__title">{isAr ? item.titleAr : item.titleEn}</h3>
                  <p className="rc-craft-pill__desc">{isAr ? item.descAr : item.descEn}</p>
                </div>
              </div>
            );
          })}
        </div>

        <footer className="rc-gallery__footer">
          <DaisyFlower size={20} className="rc-closing-flower" />
          <p className="rc-gallery__closing">
            {isAr
              ? "صنع بكل حب ♡ لمسة جميلة للمكتب أو هدية تُسعد من تحب"
              : "Crafted with love ♡ A lovely touch for desks or a gift to brighten someone's day"}
          </p>
          <PlayfulWiggle className="rc-closing-wiggle" />
        </footer>
      </section>

      {/* 5. Lightbox Modal Dialog (Modern Web Guidance animate-to-from-top-layer) */}
      {selectedCardIndex !== null && (
        <div
          className="rc-modal-backdrop"
          onClick={handleCloseModal}
          role="presentation"
        >
          <div
            className="rc-modal-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="rc-modal-title"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Modal Header */}
            <div className="rc-modal__header">
              <div className="rc-modal__badge">
                {isBoxModal ? (
                  <span>{isAr ? "علبة الهدايا الأصلية" : "Official Box Packaging"}</span>
                ) : (
                  <span>
                    {isAr
                      ? `كارت رقم ${String(selectedCardIndex + 1).padStart(2, "0")} من 10`
                      : `Card ${String(selectedCardIndex + 1).padStart(2, "0")} of 10`}
                  </span>
                )}
              </div>

              <button
                ref={modalCloseBtnRef}
                type="button"
                onClick={handleCloseModal}
                className="rc-modal__close"
                aria-label={isAr ? "إغلاق النافذة" : "Close dialog"}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="rc-modal__body">
              {/* Media preview */}
              <div className={`rc-modal__visual ${isBoxModal ? "rc-modal__visual--box" : ""}`}>
                <SiteImage
                  src={isBoxModal ? product.primaryImage.url : currentCard!.url}
                  alt={
                    isBoxModal
                      ? primaryImageAlt
                      : isAr
                      ? currentCard!.arabicTitle
                      : currentCard!.title
                  }
                  width={isBoxModal ? product.primaryImage.dimensions.width : currentCard!.dimensions.width}
                  height={isBoxModal ? product.primaryImage.dimensions.height : currentCard!.dimensions.height}
                  className="rc-modal__img"
                  priority
                />
              </div>

              {/* Detail column */}
              <div className="rc-modal__info">
                <h2 id="rc-modal-title" className="rc-modal__title">
                  {isBoxModal
                    ? productName
                    : isAr
                    ? currentCard!.arabicTitle
                    : currentCard!.title}
                </h2>

                <p className="rc-modal__subtitle" dir="ltr">
                  {isBoxModal
                    ? productSubName
                    : isAr
                    ? currentCard!.title
                    : currentCard!.arabicTitle}
                </p>

                {isBoxModal ? (
                  <p className="rc-modal__desc">{productDescription}</p>
                ) : (
                  <div className="rc-modal__idea-box">
                    <div className="rc-modal__idea-header">
                      <SparkleStar size={13} className="rc-modal__idea-star" />
                      <span>{isAr ? "فكرة ملهمة للمشاركة" : "Parenting Inspiration"}</span>
                    </div>
                    <p className="rc-modal__idea-text">
                      {isAr ? CARD_IDEAS[selectedCardIndex].ar : CARD_IDEAS[selectedCardIndex].en}
                    </p>
                  </div>
                )}

                {/* Navigation controls */}
                <div className="rc-modal__nav">
                  <button
                    type="button"
                    onClick={handlePrevCard}
                    className="rc-modal__nav-btn"
                    aria-label={isAr ? "الكارت السابق" : "Previous card"}
                  >
                    {isAr ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    <span>{isAr ? "السابق" : "Previous"}</span>
                  </button>

                  <span className="rc-modal__counter">
                    {isBoxModal
                      ? isAr
                        ? "العلبة الأصلية"
                        : "Box packaging"
                      : `${selectedCardIndex + 1} / 10`}
                  </span>

                  <button
                    type="button"
                    onClick={handleNextCard}
                    className="rc-modal__nav-btn"
                    aria-label={isAr ? "الكارت التالي" : "Next card"}
                  >
                    <span>{isAr ? "التالي" : "Next"}</span>
                    {isAr ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
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

