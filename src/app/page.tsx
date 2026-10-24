import Image from "@/components/site-image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpLeft, ArrowUpRight, BookOpen } from "lucide-react";
import { HomeProductCarousel } from "@/components/home-product-carousel";
import { HomeProductMarquee } from "@/components/home-product-marquee";
import { StaggerCategoryGrid } from "@/components/home-motion";
import { CategoryCard } from "@/components/category-card";
import { getTranslation, type TranslationKey } from "@/lib/i18n/messages";
import { getRequestLocale } from "@/lib/locale-server";
import { getStoreCategories } from "@/lib/store-categories";
import { getPublishedProducts, toStorefrontProduct } from "@/lib/catalog";

export const dynamic = "force-dynamic";

type HomeProductRecord = Awaited<ReturnType<typeof getPublishedProducts>>[number] & {
  featured?: boolean;
};

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

  const featuredRecords = records.filter((product) => product.featured);
  const featured = (featuredRecords.length ? featuredRecords : records).slice(0, 4).map((product) => toStorefrontProduct(product, locale));
  // Daisy picks: show non-featured or remaining catalog items to avoid repeating the exact same products twice
  const remainingRecords = records.filter((p) => !featuredRecords.some((f) => f.id === p.id));
  const popularRecords = remainingRecords.length > 0 ? remainingRecords : [...records].reverse();
  const popular = popularRecords.slice(0, 4).map((product) => toStorefrontProduct(product, locale));
  const categoryOrder = ["customized-stories", "stickers", "reward-cards"];
  const homepageCategories = categoryOrder
    .map((slug) => storeCategories.find((category) => category.slug === slug))
    .filter((category): category is (typeof storeCategories)[number] => Boolean(category));

  return (
    <main className="daisy-home daisy-home--storefront">
      <section className="daisy-hero daisy-hero--banner daisy-home-hero" aria-label={isRtl ? "دايزي ديزاينز، تفاصيل صغيرة وذكريات كبيرة" : "Daisy Designs, made for little moments"}>
        <h1>{isRtl ? "تفاصيل صغيرة، ذكريات كبيرة" : "Little details, lasting memories"}</h1>
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
            <p className="eyebrow !block !text-amber-300 font-extrabold tracking-widest text-[11px] sm:text-xs">DAISY DESIGNS</p>
            <p className="text-xs sm:text-sm text-zinc-100 font-bold max-w-md drop-shadow">
              {isRtl
                ? "قصص مطبوعة باسم وصور طفلك، استيكرات مدرسية ضد الماء وتيشيرتات قطن فاخرة 🚚"
                : "Personalized printed stories, waterproof stickers, and custom t-shirts."}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
              <Link href="/products" className="daisy-button daisy-button--light shadow-md">
                {isRtl ? "تسوقي الآن" : "Shop now"} <Arrow size={16} />
              </Link>
              <Link href="/categories/customized-stories" className="daisy-button bg-amber-500 hover:bg-amber-600 text-white font-bold border-none shadow-md">
                {isRtl ? "صممي قصة طفلك ✨" : "Custom Storybooks ✨"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="daisy-featured daisy-home-products" aria-labelledby="featured-title">
        <header className="daisy-home-heading" data-scroll-reveal suppressHydrationWarning>
          <h2 id="featured-title">{isRtl ? "المنتجات المميزة" : "Featured products"}</h2>
          <span aria-hidden="true" />
        </header>
        {featured.length ? <HomeProductCarousel products={featured} /> : (
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
            <CategoryCard key={category.id} category={category} locale={locale} index={index} showDescription={false} headingTag="h3" />
          ))}
        </StaggerCategoryGrid>
      </section>

      <section className="daisy-featured daisy-home-products daisy-home-popular" aria-labelledby="popular-title">
        <header className="daisy-home-heading" data-scroll-reveal suppressHydrationWarning>
          <h2 id="popular-title">{isRtl ? "اختيارات دايزي" : "Daisy picks"}</h2>
          <span aria-hidden="true" />
        </header>
        {popular.length ? <HomeProductCarousel products={popular} /> : (
          <p className="daisy-empty">{isRtl ? "اختياراتنا المفضلة هتظهر هنا قريبًا." : "Our customer favorites will appear here soon."}</p>
        )}
        <Link href="/products" className="daisy-home-all-link">{isRtl ? "عرض الكل" : "View all"}</Link>
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
          <p>{isRtl ? "اكتشفي لحظات دايزي وشاركي إبداعك" : "Explore Daisy moments and share your creations"}</p>
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
