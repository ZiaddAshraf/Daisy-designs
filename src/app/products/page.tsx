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

  // 1. All 4 Authentic Customized Storybook Products
  const storySchoolProduct: CatalogProductItem = {
    id: "story-01-first-year-at-school",
    slug: "first-year-at-school",
    href: "/products/first-year-at-school?story=first-year-at-school",
    title: isRtl ? "قصة أول سنة في المدرسة" : "First Year at School",
    subtitle: isRtl ? "كتاب ورقي فاخر بطلها طفلك بصورته واسمه" : "Personalized Keepsake Storybook",
    category: isRtl ? "قصص مخصصة" : "Customized Stories",
    categoryId: "customized-stories",
    price: 200,
    priceUnit: isRtl ? "للكتاب المطبوع" : "per printed book",
    badge: isRtl ? "أول سنة مدرسة" : "School Story",
    image: "/products/customized-stories/first-year-at-school/cover.jpeg",
    description: isRtl
      ? "قصة ورقية مطبوعة تاخد طفلك في رحلة مشوقة في أول سنة مدرسة بصورته الشخصية. كتاب ملهم مطبوع بجودة عالية بتوصلك لحد باب بيتك."
      : "A premium physical printed storybook featuring your child's photo in their first school adventure. 10 inspiring illustrated pages printed on paper and delivered to your doorstep.",
    features: isRtl
      ? ["كتاب ورقي مطبوع بيوصلك لباب البيت", "بصورة واسم طفلك الشخصية", "رسومات ملهمة بألوان مبهجة"]
      : ["Physical Printed Storybook", "Personalized Child Photo", "Inspiring Full-Color Art"],
    ctaText: isRtl ? "اشتري الآن" : "Buy Now",
  };

  const storyRedBallProduct: CatalogProductItem = {
    id: "story-02-red-ball",
    slug: "yahya-red-ball",
    href: "/products/first-year-at-school?story=yahya-red-ball",
    title: isRtl ? "قصة يحيى والكرة الحمراء" : "The Red Ball Adventure",
    subtitle: isRtl ? "مغامرة حماسية ولطيفة بطلها طفلك باسمه وصورته" : "Personalized Playtime Storybook",
    category: isRtl ? "قصص مخصصة" : "Customized Stories",
    categoryId: "customized-stories",
    price: 200,
    priceUnit: isRtl ? "للكتاب المطبوع" : "per printed book",
    badge: isRtl ? "للأطفال الصغار" : "Play & Fun",
    image: "/products/customized-stories/story-02-red-ball.jpeg",
    description: isRtl
      ? "قصة مبهجة ولطيفة للأطفال الصغار عن اللعب والمرح واكتشاف الألوان والأنشطة والابتسامة الحلوة بالكرة الحمراء مع صورة طفلك."
      : "A joyful personalized storybook celebrating playtime, smiles, and playful discovery with the red ball.",
    features: isRtl
      ? ["كتاب ورقي مطبوع فاخر", "باسم وصورة طفلك الشخصية", "ألوان زاهية تناسب الأعمار الصغيرة"]
      : ["Physical Printed Storybook", "Personalized Name & Photo", "Vibrant Early Years Colors"],
    ctaText: isRtl ? "اشتري الآن" : "Buy Now",
  };

  const storyCatsProduct: CatalogProductItem = {
    id: "story-03-cats-friends",
    slug: "cats-friends",
    href: "/products/first-year-at-school?story=cats-friends",
    title: isRtl ? "قصة يحيى وأصدقائه الميااو (لولو وتوتو)" : "The Meow Friends: Lulu & Toto",
    subtitle: isRtl ? "قصة لطيفة ودافئة عن حب الحيوانات الأليفة بطلها طفلك" : "Animal Friends Storybook",
    category: isRtl ? "قصص مخصصة" : "Customized Stories",
    categoryId: "customized-stories",
    price: 200,
    priceUnit: isRtl ? "للكتاب المطبوع" : "per printed book",
    badge: isRtl ? "مغامرة القطط" : "Pets & Kindness",
    image: "/products/customized-stories/story-03-cats-friends.jpeg",
    description: isRtl
      ? "مغامرة لطيفة ودافئة عن حب الحيوانات الأليفة والرفق بها ومواقف مضحكة ومحببة مع القطط الصغيرة لولو وتوتو مع صورة طفلك."
      : "A gentle story nurturing kindness to pets and adorable adventures with sweet kittens Lulu and Toto.",
    features: isRtl
      ? ["كتاب ورقي مطبوع بالكامل", "باسم وصورة طفلك الشخصية", "يعلم الرفق بالحيوان بطريقة مرحة"]
      : ["Physical Printed Storybook", "Personalized Name & Photo", "Kindness to Animals"],
    ctaText: isRtl ? "اشتري الآن" : "Buy Now",
  };

  const storyMinecraftProduct: CatalogProductItem = {
    id: "story-04-minecraft",
    slug: "minecraft-adventure",
    href: "/products/first-year-at-school?story=minecraft-adventure",
    title: isRtl ? "قصة مغامرة علي في عالم Minecraft" : "Minecraft World Adventure",
    subtitle: isRtl ? "مغامرة خيالية مليانة إثارة وبناء بطلها طفلك" : "Gaming Adventure Storybook",
    category: isRtl ? "قصص مخصصة" : "Customized Stories",
    categoryId: "customized-stories",
    price: 200,
    priceUnit: isRtl ? "للكتاب المطبوع" : "per printed book",
    badge: isRtl ? "ماينكرافت وألعاب" : "Gaming Adventure",
    image: "/products/customized-stories/story-04-minecraft.jpeg",
    description: isRtl
      ? "مغامرة حماسية مليئة بالإبداع والذكاء والتحدي والبناء والتعاون داخل عالم ماينكرافت المحبوب لكل الأطفال مع صورة طفلك كبطل القصة."
      : "An exciting gaming adventure filled with crafting, building, and courage in the Minecraft universe.",
    features: isRtl
      ? ["كتاب ورقي مطبوع فاخر", "صورة واسم طفلك بطل القصة", "عالم ماينكرافت ثلاثي الأبعاد"]
      : ["Physical Printed Storybook", "Child as the Hero", "Minecraft-Themed Artwork"],
    ctaText: isRtl ? "اشتري الآن" : "Buy Now",
  };

  // 1b. Bespoke "Design Your Story" Product
  const customStoryProduct: CatalogProductItem = {
    id: "story-design-your-own",
    slug: "first-year-at-school?mode=custom",
    href: "/products/first-year-at-school?mode=custom",
    title: isRtl ? "صمم قصتك لطفلك ✨ (فكرة خاصة)" : "Design Your Story ✨",
    subtitle: isRtl ? "نؤلف ونرسم ونطبع قصة حصرية بفكرة ومغامرة طفلك الخاصة" : "Bespoke Personalized Storybook",
    category: isRtl ? "قصص مخصصة" : "Customized Stories",
    categoryId: "customized-stories",
    price: 200,
    priceUnit: isRtl ? "للكتاب المصمم كاملاً" : "per custom book",
    badge: isRtl ? "صمم قصتك" : "Custom Story",
    image: "/products/customized-stories/first-year-at-school/cover.jpeg",
    description: isRtl
      ? "عايزة قصة بفكرة وموضوع من اختيارك؟ نؤلف ونرسم ونطبع كتاب ورقي مخصص بالكامل لطفلك باسمه وصوره وأحلى مغامرة بيحبها."
      : "A bespoke printed storybook authored and illustrated around your child's name, photos, and favorite theme.",
    features: isRtl
      ? ["اختاري موضوع القصة أو فكرة حرة", "باسم وصور طفلك وإهداء مطبوع", "كتاب ورقي فاخر ١٠ صفحات ملونة"]
      : ["Custom Theme & Plot", "Child's Name & Photos", "10 Full-Color Pages"],
    ctaText: isRtl ? "اشتري الآن" : "Buy Now",
  };

  // 2. Reward Cards Box Set Product
  const rewardCardsProduct: CatalogProductItem = {
    id: "reward-cards-box-set",
    slug: "reward-cards-box-set",
    href: "/products/reward-cards-box-set",
    title: isRtl ? "علبة كروت التشجيع (١٠ كروت)" : "Reward Cards Gift Box (10 Cards)",
    subtitle: isRtl ? "علبة كروت تشجيع ومكافآت بعبارات إيجابية للأولاد" : "Keepsake Gift Box with Affirmations",
    category: isRtl ? "كروت التشجيع" : "Reward Cards",
    categoryId: "reward-cards",
    price: 200,
    priceUnit: isRtl ? "للعلبة الكاملة" : "per complete box",
    badge: isRtl ? "بوكس المكافآت" : "Gift Box",
    image: "/products/reward-cards/reward-cards-box-set.jpeg",
    description: isRtl
      ? "علبة هدايا شيك فيها ١٠ كروت تشجيع مميزة ومختارة بعناية، معموله مخصوص عشان تفرح طفلك وتبني ثقته بنفسه كل يوم في اللانش بوكس أو على مكتب المذاكرة."
      : "An elegant keepsake gift box containing 10 uplifting affirmation cards, designed to spark joy and daily encouragement in lunchboxes or study desks.",
    features: isRtl
      ? ["علبة هدايا تذكارية أنيقة", "١٠ كروت تشجيع مختلفة ومبهجة", "ورق كوشيه سميك بطبقة حماية من المية"]
      : ["Luxury Keepsake Gift Box", "10 Unique Affirmation Cards", "Thick Coated Finish"],
    ctaText: isRtl ? "اشتري الآن" : "Buy Now",
  };

  // 3. All 24 Individual School Sticker Designs
  const stickerProducts: CatalogProductItem[] = stickersData.product.designs.map((design) => ({
    id: `sticker-design-${design.id}`,
    slug: `custom-waterproof-stickers?design=${design.id}`,
    href: `/products/custom-waterproof-stickers?design=${design.id}`,
    title: isRtl ? design.arabicTitle : design.title,
    subtitle: isRtl
      ? "شيت استيكرات مخصص باسم طفلك ومقاوم للمية"
      : "Personalized Waterproof Sheet",
    category: isRtl ? "استيكرات وملصقات" : "Stickers",
    categoryId: "stickers",
    price: 50,
    priceUnit: isRtl ? "للشيت الكامل" : "per custom sheet",
    badge: isRtl ? `${design.arabicThemeGroup}` : `${design.themeGroup}`,
    image: design.url,
    description: isRtl
      ? `استيكرات مدرسية متينة بتستحمل المية والغسيل ١٠٠٪ بنطبعها باسم طفلك ومدرسته. كل شيت فيه تيكيت كبير للدفاتر واستيكرات للأقلام والزمزمية.`
      : `Durable 100% waterproof school stickers personalized with your child's name, school, and class. Includes large notebook tickets and pen strips.`,
    features: isRtl
      ? ["فينيل ألماني أصلي ضد المية والغسيل", "طباعة الاسم والمدرسة والفصل بالطلب", `تصميم ${design.arabicTitle}`]
      : ["100% German Waterproof Vinyl", "Personalized Name, School & Class", `${design.title} Artwork`],
    ctaText: isRtl ? "اشتري الآن" : "Buy Now",
    themeGroup: isRtl ? design.arabicThemeGroup : design.themeGroup,
  }));

  // 4. Custom Printed Children's T-Shirt Product
  const tshirtProduct: CatalogProductItem = {
    id: "custom-printed-tshirt",
    slug: "custom-printed-tshirt",
    href: "/products/custom-printed-tshirt",
    title: isRtl ? "تيشيرت أطفال قطن مطبوع مخصص" : "Custom Printed Children's T-Shirt",
    subtitle: isRtl ? "طباعة رسمتك أو فكرتك بأعلى ثبات ألوان - مقاسات ٢ لـ ١٦ سنة" : "Custom Artwork Print - Kids Sizes 2 to 16",
    category: isRtl ? "تيشيرتات مطبوعة" : "Printed T-Shirts",
    categoryId: "printed-t-shirts",
    price: 500,
    priceUnit: isRtl ? "للقطعة الواحدة" : "per shirt",
    badge: isRtl ? "جديد للأطفال" : "New for Kids",
    image: "/products/t-shirts/white-tshirt.svg",
    description: isRtl
      ? "تيشيرت أطفال قطن مصري ١٠٠٪ مريح وناعم، متاح بالأبيض والأسود والرمادي، بنطبع عليه تصميمك الخاص في منتصف الصدر ومقاساته مظبوطة من سنتين لـ ١٦ سنة."
      : "High-quality comfortable plain kids T-shirt in white, black, or gray, customized with your own artwork printed at center chest. Exact fit sizes 2 to 16.",
    features: isRtl
      ? ["قطن مصري ناعم ومريح للأطفال", "طباعة ثابتة على منتصف الصدر بألوان زاهية", "مقاسات دقيقة ومريحة من سن ٢ لـ ١٦ سنة"]
      : ["Premium Soft Cotton", "Center Chest Custom Print", "Verified Sizes 2 to 16"],
    ctaText: isRtl ? "اشتري الآن" : "Buy Now",
  };

  // 5. Deterministic Interleaved / "عشوائي متناسق" Shuffle
  // Interleaving storybooks, t-shirt, stickers of different themes, and reward cards box set
  const shuffledCatalog: CatalogProductItem[] = [
    storySchoolProduct,                               // 1. Story 1: First Year at School
    customStoryProduct,                               // 1b. Bespoke: Design Your Story
    tshirtProduct,                                    // 2. Custom Printed Children's T-Shirt
    storyMinecraftProduct,                            // 3. Story 4: Minecraft Adventure
    stickerProducts[1],                               // 4. Super Cool Dino
    rewardCardsProduct,                               // 5. Reward Cards Box Set
    storyRedBallProduct,                              // 6. Story 2: Yahya & The Red Ball
    stickerProducts[0],                               // 7. K-Pop Demon Hunters
    stickerProducts[3],                               // 8. Little Princess
    storyCatsProduct,                                 // 9. Story 3: Yahya & Meow Friends
    stickerProducts[8],                               // 10. Gaming Zone
    stickerProducts[2],                               // 11. Space Astronaut
    stickerProducts[4],                               // 12. Super Heroes
    stickerProducts[9],                               // 13. Magical Unicorn
    stickerProducts[10],                              // 14. Soccer Champion
    stickerProducts[5],                               // 15. Cute Animals
    stickerProducts[6],                               // 16. Racing Cars
    stickerProducts[7],                               // 17. Mermaid & Ocean
    stickerProducts[13],                              // 18. Sparkle Princess
    stickerProducts[11],                              // 19. Wild Safari
    stickerProducts[12],                              // 20. Futuristic Robots
    stickerProducts[14],                              // 21. Happy Pets
    stickerProducts[15],                              // 22. Big Trucks
    stickerProducts[16],                              // 23. Spring Butterflies
    stickerProducts[17],                              // 24. Deep Space
    stickerProducts[18],                              // 25. Sweet Candies
    stickerProducts[19],                              // 26. Art & Creativity
    stickerProducts[20],                              // 27. Music Beats
    stickerProducts[21],                              // 28. Sky Airplanes
    stickerProducts[22],                              // 29. Martial Arts Hero
    stickerProducts[23],                              // 30. Cartoon Pals
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
