import Image from "@/components/site-image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpLeft, ArrowUpRight, BookOpen } from "lucide-react";
import { HomeProductCarousel } from "@/components/home-product-carousel";
import { StaggerCategoryGrid } from "@/components/home-motion";
import { CategoryCard } from "@/components/category-card";
import { getTranslation, type TranslationKey } from "@/lib/i18n/messages";
import { getRequestLocale } from "@/lib/locale-server";
import { getStoreCategories } from "@/lib/store-categories";
import { getPublishedProducts, toStorefrontProduct } from "@/lib/catalog";

export const dynamic = "force-dynamic";

type HomeProductRecord = Awaited<ReturnType<typeof getPublishedProducts>>[number] & {
  featured?: boolean;
  bestSeller?: boolean;
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
  const popularRecords = records.filter((product) => product.bestSeller);
  const featured = (featuredRecords.length ? featuredRecords : records).slice(0, 4).map((product) => toStorefrontProduct(product, locale));
  const popular = (popularRecords.length ? popularRecords : records.filter((product) => !featuredRecords.includes(product)))
    .slice(0, 4)
    .map((product) => toStorefrontProduct(product, locale));
  const socialImages = [
    { src: "/products/customized-stories/first-year-at-school/cover.jpeg", alt: isRtl ? "قصة مخصصة لطفل" : "A personalized storybook" },
    { src: "/products/reward-cards/reward-cards-box-set.jpeg", alt: isRtl ? "علبة كروت تشجيع" : "A box of affirmation cards" },
    { src: "/products/stickers/sticker-03-kuromi-sanrio.jpeg", alt: isRtl ? "استيكرات أطفال" : "Children’s stickers" },
    { src: "/products/customized-stories/story-02-red-ball.jpeg", alt: isRtl ? "صفحات من قصة أطفال" : "Pages from a children’s story" },
  ];

  return (
    <main className="daisy-home daisy-home--storefront">
      <section className="daisy-hero daisy-hero--banner daisy-home-hero" aria-label={isRtl ? "دايزي ديزاينز، تفاصيل صغيرة وذكريات كبيرة" : "Daisy Designs, made for little moments"}>
        <h1>{isRtl ? "تفاصيل صغيرة، ذكريات كبيرة" : "Little details, lasting memories"}</h1>
        <div className="daisy-hero__banner-frame">
          <Image
            src="/hero.jpeg"
            alt={isRtl ? "منتجات دايزي ديزاينز للأطفال" : "Daisy Designs products for children"}
            width={1600}
            height={533}
            priority
            quality={95}
            sizes="100vw"
            className="daisy-hero__banner-img"
          />
          <div className="daisy-home-hero__shade" aria-hidden="true" />
          <div className="daisy-home-hero__copy">
            <p className="eyebrow">DAISY DESIGNS</p>
            <h2>{isRtl ? "حاجات معمولة مخصوص ليهم" : "Made especially for them"}</h2>
            <Link href="/products" className="daisy-button daisy-button--light">
              {isRtl ? "تسوقي الآن" : "Shop now"} <Arrow size={16} />
            </Link>
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
          {storeCategories.map((category, index) => (
            <CategoryCard key={category.id} category={category} locale={locale} index={index} showDescription={false} headingTag="h3" />
          ))}
        </StaggerCategoryGrid>
      </section>

      <section className="daisy-featured daisy-home-products daisy-home-popular" aria-labelledby="popular-title">
        <header className="daisy-home-heading" data-scroll-reveal suppressHydrationWarning>
          <h2 id="popular-title">{isRtl ? "الأكثر مبيعًا" : "Best sellers"}</h2>
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
          <p>{isRtl ? "لحظات حقيقية بنعيشها" : "Little moments, made real"}</p>
        </header>
        <div className="daisy-home-social__grid">
          {socialImages.map((image) => (
            <Link href="/products" key={image.src} aria-label={image.alt}>
              <Image src={image.src} alt={image.alt} fill sizes="(max-width: 650px) 45vw, 18vw" />
            </Link>
          ))}
        </div>
        <Link href="https://instagram.com" target="_blank" rel="noreferrer" className="daisy-home-social__follow">
          {isRtl ? "تابعينا على إنستجرام" : "Follow us on Instagram"} <UpArrow size={15} />
        </Link>
      </section>
    </main>
  );
}
