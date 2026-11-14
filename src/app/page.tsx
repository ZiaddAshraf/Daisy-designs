import { BundleOffer } from "@/components/story-cards-offer";
import Image from "@/components/site-image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpLeft, ArrowUpRight, BookOpen } from "lucide-react";
import { HomeFeaturedGrid } from "@/components/home-featured-grid";
import { HomeProductMarquee } from "@/components/home-product-marquee";
import { StaggerCategoryGrid } from "@/components/home-motion";
import { CategoryCard } from "@/components/category-card";
import { getTranslation, type TranslationKey } from "@/lib/i18n/messages";
import { getRequestLocale } from "@/lib/locale-server";
import { getStoreCategories } from "@/lib/store-categories";
import { getPublishedProducts, isDemoMode, toStorefrontProduct } from "@/lib/catalog";
import { ensureCoreCatalogProducts } from "@/lib/ensure-catalog-product";

export const dynamic = "force-dynamic";

type HomeProductRecord = Omit<Parameters<typeof toStorefrontProduct>[0], "category"> & {
  id?: string;
  published?: boolean;
  category?: {
    id?: string;
    slug?: string;
    name?: string;
    arabicName?: string;
  } | null;
};


const CORE_FALLBACK_PRODUCTS: HomeProductRecord[] = [
  {
    id: "reward-cards-box-set",
    slug: "reward-cards-box-set",
    name: "Daisy Designs Reward Cards Box Set",
    arabicName: "علبة كروت التشجيع",
    price: 150,
    compareAtPrice: null,
    description: "An exclusive collection of 10 inspiring, heartwarming affirmation and reward cards in a beautifully branded Daisy Designs keepsake box.",
    arabicDescription: "مجموعة حصرية من كروت التحفيز الملهمة تضم 10 كروت متنوعة ورسائل إيجابية دافئة داخل علبة هدايا أنيقة بشعار Daisy Designs.",
    customizable: false,
    featured: true,
    published: true,
    images: [{ url: "/products/reward-cards/reward-cards-box-set.jpeg" }],
    category: {
      id: "reward-cards",
      slug: "reward-cards",
      name: "Reward Cards",
      arabicName: "كروت التشجيع",
    },
    variants: [],
    tags: ["reward-cards"],
  },
  {
    id: "first-year-at-school",
    slug: "first-year-at-school",
    name: "Daisy Designs First Year at School Storybook",
    arabicName: "قصة أول سنة في المدرسة",
    price: 300,
    compareAtPrice: null,
    description: "An inspiring personalized children's storybook starring your child with their uploaded photograph.",
    arabicDescription: "قصة أطفال ملهمة ومصممة بحب من Daisy Designs تضع طفلك بطلاً للقصة.",
    customizable: true,
    featured: true,
    published: true,
    images: [{ url: "/products/customized-stories/first-year-at-school/cover.jpeg" }],
    category: {
      id: "customized-stories",
      slug: "customized-stories",
      name: "Customized Stories",
      arabicName: "قصص مخصصة",
    },
    variants: [],
    tags: ["customized-stories"],
  },
  {
    id: "custom-waterproof-stickers",
    slug: "custom-waterproof-stickers",
    name: "Daisy Designs Custom Waterproof Stickers",
    arabicName: "استيكرات مدرسية مخصصة مقاومة للماء",
    price: 50,
    compareAtPrice: null,
    description: "High-quality, durable waterproof stickers personalized with your child's name, school, and class.",
    arabicDescription: "استيكرات مدرسية عالية الجودة ومقاومة للماء بتصميمات متنوعة.",
    customizable: true,
    featured: true,
    published: true,
    images: [{ url: "/products/stickers/sticker-02-super-cool-dino.jpeg" }],
    category: {
      id: "stickers",
      slug: "stickers",
      name: "Tickets, Labels & Keychains",
      arabicName: "تيكت وليبل وميدالية",
    },
    variants: [],
    tags: ["stickers"],
  },
  {
    id: "custom-printed-tshirt",
    slug: "custom-printed-tshirt",
    name: "Daisy Designs Custom Printed Cotton T-Shirt (Adults & Kids)",
    arabicName: "تيشيرت قطن بطباعة مخصصة (كبار وأطفال)",
    price: 450,
    compareAtPrice: null,
    description: "High-quality plain cotton T-shirt for adults and kids customized with your requested artwork or written idea.",
    arabicDescription: "تيشيرت قطن سادة عالي الجودة ومريح للكبار والأطفال، مخصص بطباعة تصميمك الخاص.",
    customizable: true,
    featured: true,
    published: true,
    images: [{ url: "/products/t-shirts/kids-tshirt-studio.jpeg" }],
    category: {
      id: "printed-t-shirts",
      slug: "printed-t-shirts",
      name: "Printed T-Shirts",
      arabicName: "تيشيرتات مطبوعة",
    },
    variants: [],
    tags: ["printed-t-shirts"],
  },
];

export default async function Home() {
  const locale = await getRequestLocale();
  const isRtl = locale === "ar";
  const Arrow = isRtl ? ArrowLeft : ArrowRight;
  const UpArrow = isRtl ? ArrowUpLeft : ArrowUpRight;
  const t = (key: TranslationKey) => getTranslation(locale, key);
  const storeCategories = getStoreCategories();

  let records: HomeProductRecord[] = [];
  let productsUnavailable = false;
  try {
    records = await getPublishedProducts();
  } catch {
    productsUnavailable = true;
  }

  // Ensure all 4 flagship products are represented even if missing from remote DB
  const existingSlugs = new Set(records.map((p) => p.slug));
  let missingCore = false;
  for (const fallback of CORE_FALLBACK_PRODUCTS) {
    if (!existingSlugs.has(fallback.slug)) {
      records.push(fallback);
      existingSlugs.add(fallback.slug);
      missingCore = true;
    }
  }

  // Self-heal the database in background so it permanently persists
  if (missingCore && !isDemoMode()) {
    void ensureCoreCatalogProducts();
  }

  const featuredRecords = records.filter((product) => product.featured || product.slug === "custom-printed-tshirt");
  const featured = (featuredRecords.length >= 4 ? featuredRecords : records).slice(0, 4).map((product) => toStorefrontProduct(product, locale));
  
  const categoryOrder = ["customized-stories", "stickers", "reward-cards", "printed-t-shirts"];
  const homepageCategories = categoryOrder
    .map((slug) => storeCategories.find((category) => category.slug === slug))
    .filter((category): category is (typeof storeCategories)[number] => Boolean(category));

  return (
    <main className="daisy-home daisy-home--storefront">
      <section className="daisy-hero daisy-hero--banner daisy-home-hero" aria-label={isRtl ? "دايزي ديزاينز، تفاصيل صغيرة وذكريات كبيرة" : "Daisy Designs, made for little moments"}>
        <div className="daisy-hero__banner-frame">
          <Image
            src="/products/reward-cards/reward-cards-box-set.jpeg"
            alt={isRtl ? "مجموعة كروت التشجيع من دايزي ديزاينز" : "Daisy Designs reward card collection"}
            width={1600}
            height={900}
            priority
            quality={95}
            sizes="100vw"
            className="daisy-hero__banner-img"
          />
          <div className="daisy-home-hero__shade" aria-hidden="true" />
          <div className="daisy-home-hero__copy">
            <span className="daisy-home-hero__eyebrow">DAISY DESIGNS</span>
            <h1>{isRtl ? "تفاصيل صغيرة، ذكريات كبيرة" : "Little details, lasting memories"}</h1>
            
            <div className="daisy-home-hero__actions">
              <Link href="/products" className="daisy-button daisy-button--light shadow-xl">
                <span>{isRtl ? "تسوقي الآن" : "Shop now"}</span>
                <Arrow size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto w-[92%] pt-6"><BundleOffer locale={locale} /></div>

      <section className="daisy-featured daisy-home-products" aria-labelledby="featured-title">
        <header className="daisy-home-heading" data-scroll-reveal suppressHydrationWarning>
          <h2 id="featured-title">{isRtl ? "المنتجات المميزة" : "Featured products"}</h2>
          <span aria-hidden="true" />
        </header>
        {featured.length ? <HomeFeaturedGrid products={featured} /> : (
          <p className="daisy-empty" role={productsUnavailable ? "status" : undefined}>
            {productsUnavailable ? t("homeProductsUnavailable") : t("noPublishedProducts")}
          </p>
        )}
        <Link href="/products" className="daisy-home-all-link">{isRtl ? "عرض الكل" : "View all"}</Link>
      </section>

      <section className="daisy-categories daisy-home-categories" aria-labelledby="categories-title">
        <header className="daisy-home-heading" data-scroll-reveal suppressHydrationWarning>
          <h2 id="categories-title">{isRtl ? "تسوقي حسب الفئة" : "Shop by category"}</h2>
          <span aria-hidden="true" />
        </header>
        <StaggerCategoryGrid className="store-category-grid daisy-home-category-grid" data-scroll-reveal-stagger>
          {homepageCategories.map((category, index) => (
            <CategoryCard key={category.id} category={category} locale={locale} index={index} showDescription={false} headingTag="h3" clearPhotography />
          ))}
        </StaggerCategoryGrid>
      </section>

      <section className="daisy-home-story" aria-labelledby="home-story-title" data-scroll-reveal suppressHydrationWarning>
        <BookOpen size={42} strokeWidth={1.1} aria-hidden="true" />
        <h2 id="home-story-title">{isRtl ? "ليه دايزي؟" : "Why Daisy?"}</h2>
        <span className="daisy-home-story__rule" aria-hidden="true" />
        <p>{isRtl
          ? "بنؤمن إن التفاصيل الصغيرة بتفرق. عشان كده بنعمل منتجات فنية مخصصة للأطفال، بتصميمات مبهجة وجودة تعيش معاهم وتصنع ذكريات حلوة."
          : "We believe the little details matter. That’s why we make joyful, personalized pieces for children, thoughtfully designed to become part of their favorite memories."}</p>
        <Link href="/about" className="daisy-text-link">{isRtl ? "اعرفي قصتنا" : "Our story"} <Arrow size={16} /></Link>
      </section>

      <section className="daisy-home-social" aria-labelledby="home-social-title">
        <header className="daisy-home-heading" data-scroll-reveal suppressHydrationWarning>
          <h2 id="home-social-title">{isRtl ? "من عالم دايزي" : "From the Daisy world"}</h2>
          <span aria-hidden="true" />
        </header>
        <HomeProductMarquee isRtl={isRtl} />
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="https://www.instagram.com/daisydesign23" target="_blank" rel="noreferrer" className="daisy-home-social__follow">
            {isRtl ? "تابعينا على إنستجرام" : "Follow us on Instagram"} <UpArrow size={15} />
          </Link>
          <Link href="https://www.facebook.com/share/1PwXqKfKAq/" target="_blank" rel="noreferrer" className="daisy-home-social__follow">
            {isRtl ? "تابعينا على فيسبوك" : "Follow us on Facebook"} <UpArrow size={15} />
          </Link>
        </div>
      </section>
    </main>
  );
}
