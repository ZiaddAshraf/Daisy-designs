import Link from "next/link";
import type { Metadata } from "next";
import { getTranslation, type TranslationKey } from "@/lib/i18n/messages";
import { getRequestLocale } from "@/lib/locale-server";
import stickersData from "@/data/stickers-product.json";
import { ProductsCatalogClient, type CatalogProductItem } from "@/components/products-catalog-client";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return {
    title: getTranslation(locale, "catalogTitle"),
    description: getTranslation(locale, "productsMetadata"),
  };
}

export default async function ProductsPage() {
  const locale = await getRequestLocale();
  const t = (key: TranslationKey) => getTranslation(locale, key);
  const isRtl = locale === "ar";

  // 1. Customized Storybook Product
  const storybookProduct: CatalogProductItem = {
    id: "story-first-year-at-school",
    slug: "first-year-at-school",
    href: "/products/first-year-at-school",
    title: isRtl ? "قصة أول سنة في المدرسة" : "First Year at School",
    subtitle: isRtl ? "كتاب ورقي فاخر مخصص بصورة طفلك" : "Personalized Keepsake Storybook",
    category: isRtl ? "قصص مخصصة" : "Customized Stories",
    categoryId: "customized-stories",
    price: 200,
    priceUnit: isRtl ? "للكتاب المطبوع" : "per printed book",
    badge: isRtl ? "أول سنة" : "Storybook",
    image: "/products/customized-stories/first-year-at-school/cover.jpeg",
    description: isRtl
      ? "قصة ورقية مطبوعة تأخذ طفلك في رحلة مشوقة في أول سنة دراسية بصورته الشخصية. ١٠ صفحات ملهمة مطبوعة بجودة عالية تُشحن حتى باب منزلك."
      : "A premium physical printed storybook featuring your child's photo in their first school adventure. 10 inspiring illustrated pages printed on paper and delivered to your doorstep.",
    features: isRtl
      ? ["كتاب ورقي مطبوع يُشحن للمنزل", "تخصيص صورة طفلك الشخصية", "١٠ صفحات مصورة ملهمة"]
      : ["Physical Printed Storybook", "Personalized Child Photo", "10 Inspiring Illustrated Pages"],
    ctaText: isRtl ? "طلب القصة" : "Order Story",
  };

  // 2. Reward Cards Box Set Product
  const rewardCardsProduct: CatalogProductItem = {
    id: "reward-cards-box-set",
    slug: "reward-cards-box-set",
    href: "/products/reward-cards-box-set",
    title: isRtl ? "علبة كروت التشجيع (١٠ كروت)" : "Reward Cards Gift Box (10 Cards)",
    subtitle: isRtl ? "علبة هدايا تذكارية أنيقة وملهمة" : "Keepsake Gift Box with Affirmations",
    category: isRtl ? "كروت التشجيع" : "Reward Cards",
    categoryId: "reward-cards",
    price: 200,
    priceUnit: isRtl ? "للعلبة الكاملة" : "per complete box",
    badge: isRtl ? "بوكس المكافآت" : "Gift Box",
    image: "/products/reward-cards/reward-cards-box-set.jpeg",
    description: isRtl
      ? "علبة تذكارية أنيقة تضم ١٠ كروت تشجيع ملهمة ومختارة بعناية للأطفال، مصممة لإضفاء البهجة وبناء الثقة اليومية في اللانش بوكس أو على المكتب."
      : "An elegant keepsake gift box containing 10 uplifting affirmation cards, designed to spark joy and daily encouragement in lunchboxes or study desks.",
    features: isRtl
      ? ["علبة تذكارية فاخرة", "١٠ كروت تشجيع فريدة", "طباعة ورقية سميكة ومحمية"]
      : ["Luxury Keepsake Gift Box", "10 Unique Affirmation Cards", "Thick Coated Finish"],
    ctaText: isRtl ? "اطلبي العلبة" : "Order Box",
  };

  // 3. All 24 Individual School Sticker Designs
  const stickerProducts: CatalogProductItem[] = stickersData.product.designs.map((design) => ({
    id: `sticker-design-${design.id}`,
    slug: `custom-waterproof-stickers?design=${design.id}`,
    href: `/products/custom-waterproof-stickers?design=${design.id}`,
    title: isRtl ? design.arabicTitle : design.title,
    subtitle: isRtl
      ? "شيت استيكرات مخصص مقاوم للماء"
      : "Personalized Waterproof Sheet",
    category: isRtl ? "استيكرات وملصقات" : "Stickers",
    categoryId: "stickers",
    price: 50,
    priceUnit: isRtl ? "للشيت الكامل" : "per custom sheet",
    badge: isRtl ? `${design.arabicThemeGroup}` : `${design.themeGroup}`,
    image: design.url,
    description: isRtl
      ? `استيكرات مدرسية متينة مقاومة للماء 100% تُطبع باسم طفلك ومدرسته. يشمل كل شيت ملصقاً كبيراً للدفاتر وشريطاً للأقلام وزجاجات المياه.`
      : `Durable 100% waterproof school stickers personalized with your child's name, school, and class. Includes large notebook tickets and pen strips.`,
    features: isRtl
      ? ["فينيل ألماني مقاوم للماء 100%", "تخصيص الاسم والمدرسة والفصل", `تصميم ${design.arabicTitle}`]
      : ["100% German Waterproof Vinyl", "Personalized Name, School & Class", `${design.title} Artwork`],
    ctaText: isRtl ? "تخصيص وطلب" : "Personalize & Order",
    themeGroup: isRtl ? design.arabicThemeGroup : design.themeGroup,
  }));

  // 4. Custom Printed Children's T-Shirt Product
  const tshirtProduct: CatalogProductItem = {
    id: "custom-printed-tshirt",
    slug: "custom-printed-tshirt",
    href: "/products/custom-printed-tshirt",
    title: isRtl ? "تيشيرت أطفال مطبوع مخصص" : "Custom Printed Children's T-Shirt",
    subtitle: isRtl ? "طباعة مخصصة بأعلى جودة - مقاسات ٢ إلى ١٦ سنة" : "Custom Artwork Print - Kids Sizes 2 to 16",
    category: isRtl ? "تيشيرتات مطبوعة" : "Printed T-Shirts",
    categoryId: "printed-t-shirts",
    price: 500,
    priceUnit: isRtl ? "للقطعة الواحدة" : "per shirt",
    badge: isRtl ? "جديد للأطفال" : "New for Kids",
    image: "/products/t-shirts/white-tshirt.svg",
    description: isRtl
      ? "تيشيرت أطفال سادة مريح عالي الجودة متوفر بالألوان الأبيض والأسود والرمادي، ومخصص بطباعة تصميمك الخاص في منتصف الصدر. مقاسات دقيقة من سن سنتين حتى ١٦ سنة."
      : "High-quality comfortable plain kids T-shirt in white, black, or gray, customized with your own artwork printed at center chest. Exact fit sizes 2 to 16.",
    features: isRtl
      ? ["قطن مريح عالي الجودة", "طباعة مخصصة في منتصف الصدر", "مقاسات دقيقة من ٢ إلى ١٦ سنة"]
      : ["Premium Soft Cotton", "Center Chest Custom Print", "Verified Sizes 2 to 16"],
    ctaText: isRtl ? "تخصيص التيشيرت" : "Customize T-Shirt",
  };

  // 5. Deterministic Interleaved / "عشوائي متناسق" Shuffle
  // Interleaving storybook, t-shirt, stickers of different themes, and reward cards box set
  const shuffledCatalog: CatalogProductItem[] = [
    storybookProduct,                                 // 1. Storybook
    tshirtProduct,                                    // 2. Custom Printed Children's T-Shirt
    stickerProducts[1],                               // 3. Super Cool Dino
    rewardCardsProduct,                               // 4. Reward Cards Box Set
    stickerProducts[0],                               // 5. K-Pop Demon Hunters
    stickerProducts[3],                               // 6. Little Princess
    stickerProducts[8],                               // 7. Gaming Zone
    stickerProducts[2],                               // 8. Space Astronaut
    stickerProducts[4],                               // 9. Super Heroes
    stickerProducts[9],                               // 10. Magical Unicorn
    stickerProducts[10],                              // 11. Soccer Champion
    stickerProducts[5],                               // 12. Cute Animals
    stickerProducts[6],                               // 13. Racing Cars
    stickerProducts[7],                               // 14. Mermaid & Ocean
    stickerProducts[13],                              // 15. Sparkle Princess
    stickerProducts[11],                              // 16. Wild Safari
    stickerProducts[12],                              // 17. Futuristic Robots
    stickerProducts[14],                              // 18. Happy Pets
    stickerProducts[15],                              // 19. Big Trucks
    stickerProducts[16],                              // 20. Spring Butterflies
    stickerProducts[17],                              // 21. Deep Space
    stickerProducts[18],                              // 22. Sweet Candies
    stickerProducts[19],                              // 23. Art & Creativity
    stickerProducts[20],                              // 24. Music Beats
    stickerProducts[21],                              // 25. Sky Airplanes
    stickerProducts[22],                              // 26. Martial Arts Hero
    stickerProducts[23],                              // 27. Cartoon Pals
  ];

  const translations = {
    catalogHeading: t("catalogHeading"),
    catalogTitle: t("catalogTitle"),
    home: t("home"),
    products: t("products"),
    searchPlaceholder: isRtl ? "ابحث باسم المنتج أو التصميم..." : "Search by product or design name...",
    allFilter: isRtl ? "كل المنتجات" : "All Products",
    stickersFilter: isRtl ? "استيكرات مدرسية" : "School Stickers",
    storiesFilter: isRtl ? "قصص مخصصة" : "Customized Stories",
    cardsFilter: isRtl ? "كروت التشجيع" : "Reward Cards",
    tshirtsFilter: isRtl ? "تيشيرتات أطفال" : "Children's T-Shirts",
    noResultsTitle: isRtl ? "لم يتم العثور على منتجات مطابقة" : "No matching products found",
    noResultsHint: isRtl
      ? "جرب البحث بكلمات أخرى أو أعد ضبط الفلاتر لتصفح كامل المجموعة."
      : "Try searching with different terms or reset filters to browse all items.",
    resetFilters: isRtl ? "إعادة ضبط الفلاتر" : "Reset Filters",
    showingCount: isRtl ? "عرض {count} منتج" : "Showing {count} products",
  };

  return (
    <main className="catalog-page">
      <nav className="catalog-breadcrumb" aria-label={t("breadcrumb")}>
        <Link href="/">{t("home")}</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{t("products")}</span>
      </nav>

      <header className="catalog-page__heading" data-scroll-reveal suppressHydrationWarning>
        <div>
          <p className="eyebrow">DAISY DESIGNS / {t("catalogTitle")}</p>
          <h1>{t("catalogHeading")}</h1>
          <p>{t("productsLiveCatalogIntro")}</p>
        </div>
      </header>

      {/* Full Products Catalog View */}
      <section className="mb-20" aria-label={t("productsLiveCatalogTitle")} data-scroll-reveal suppressHydrationWarning>
        <ProductsCatalogClient
          initialProducts={shuffledCatalog}
          locale={locale}
          translations={translations}
        />
      </section>
    </main>
  );
}
