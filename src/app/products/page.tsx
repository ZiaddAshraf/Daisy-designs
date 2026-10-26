import { getPublishedProducts, toStorefrontProduct } from "@/lib/catalog";
import { DatabaseUnavailable } from "@/components/database-state";
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

  let records: Awaited<ReturnType<typeof getPublishedProducts>>;
  try { records = await getPublishedProducts(); } catch { return <main className="catalog-page"><DatabaseUnavailable /></main>; }
  const priceFor = (slug: string) => records.find(p => p.slug === slug)?.price ?? 0;
  // 1. All 4 Authentic Customized Storybook Products
  const storySchoolProduct: CatalogProductItem = {
    id: "story-01-first-year-at-school",
    slug: "first-year-at-school",
    href: "/products/first-year-at-school?story=first-year-at-school",
    title: isRtl ? "قصة أول سنة في المدرسة" : "First Year at School",
    subtitle: isRtl ? "كتاب ورقي فاخر بطلها طفلك بصورته واسمه" : "Personalized Keepsake Storybook",
    category: isRtl ? "قصص مخصصة" : "Customized Stories",
    categoryId: "customized-stories",
    price: priceFor("first-year-at-school"),
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
    price: priceFor("first-year-at-school"),
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
    price: priceFor("first-year-at-school"),
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
    price: priceFor("first-year-at-school"),
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
    price: priceFor("first-year-at-school"),
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
    price: priceFor("reward-cards-box-set"),
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
    category: isRtl ? "تيكت وليبل وميدالية" : "Tickets, Labels & Keychains",
    categoryId: "stickers",
    price: priceFor("custom-waterproof-stickers"),
    priceUnit: isRtl ? "للباقة الكاملة — خيارات أخرى متاحة" : "combined package — more options available",
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

  // 4. Custom Printed T-Shirt Product (Adults & Kids)
  const tshirtProduct: CatalogProductItem = {
    id: "custom-printed-tshirt",
    slug: "custom-printed-tshirt",
    href: "/products/custom-printed-tshirt",
    title: isRtl ? "تيشيرت قطن مطبوع مخصص (كبار وأطفال)" : "Custom Printed T-Shirt (Adults & Kids)",
    subtitle: isRtl ? "طباعة رسمتك أو فكرتك بأعلى ثبات ألوان - مقاسات من سن سنتين حتى XXL" : "Custom Artwork Print - Sizes 2 Years to Adult XXL",
    category: isRtl ? "تيشيرتات مطبوعة" : "Printed T-Shirts",
    categoryId: "printed-t-shirts",
    price: priceFor("custom-printed-tshirt"),
    priceUnit: isRtl ? "للقطعة الواحدة" : "per shirt",
    badge: isRtl ? "كبار وأطفال" : "Adults & Kids",
    image: "/products/t-shirts/white-tshirt.svg",
    description: isRtl
      ? "تيشيرت قطن مصري ١٠٠٪ مريح وناعم للكبار والأطفال، متاح بالأبيض والأسود والرمادي، بنطبع عليه تصميمك الخاص في منتصف الصدر ومقاساته شاملة من سنتين لـ XXL."
      : "High-quality comfortable plain cotton T-shirt for adults and kids in white, black, or gray, customized with your own artwork printed at center chest. Sizes from 2 years to adult XXL.",
    features: isRtl
      ? ["قطن مصري ناعم ومريح للكبار والأطفال", "طباعة ثابتة على منتصف الصدر بألوان زاهية", "مقاسات شاملة من سن سنتين ومقاسات كبار حتى XXL"]
      : ["Premium Soft Egyptian Cotton", "Center Chest Custom Print", "Sizes 2 Years up to Adult XXL"],
    ctaText: isRtl ? "اشتري الآن" : "Buy Now",
  };

  
  // 4b. Custom Acrylic Name Keychains
  const keychainAssortedProduct: CatalogProductItem = {
    id: "keychain-assorted",
    slug: "custom-acrylic-name-keychain",
    href: "/products/custom-acrylic-name-keychain",
    title: isRtl ? "ميدالية اسم مخصصة (أشكال متعددة)" : "Custom Acrylic Name Keychain (Assorted)",
    subtitle: isRtl ? "ميدالية أكريليك متينة ومقاومة للماء للشنطة والمفاتيح" : "Personalized Acrylic Keychain for Bags & Keys",
    category: isRtl ? "تيكت وليبل وميدالية" : "Tickets, Labels & Keychains",
    categoryId: "stickers",
    price: priceFor("custom-acrylic-name-keychain") || 70,
    priceUnit: isRtl ? "للقطعة الواحدة" : "per keychain",
    badge: isRtl ? "ميدالية مخصصة" : "Custom Keychain",
    image: "/products/keychains/keychains-collection.jpeg",
    description: isRtl
      ? "ميدالية أكريليك عالية الجودة ومقاومة للمية بتصميمات كرتونية وبناتي وولادي مبهجة (سبايدرمان، باربي، ستيتش، سونيك، موانا) مخصصة باسم طفلك وفصله لشنطة المدرسة والمفاتيح."
      : "High-quality durable acrylic keychain featuring fun characters (Spider-Man, Barbie, Stitch, Sonic, Moana) customized with your child's name and grade.",
    features: isRtl
      ? ["أكريليك صلب ومقاوم للمية والصدمات", "طباعة ألوان زاهية بوجهين مع الاسم", "حلقة معدنية قوية للتعليق في شنطة المدرسة"]
      : ["Durable Waterproof Acrylic", "Vibrant Double-Sided Print with Name", "Sturdy Metal Ring for School Bags"],
    ctaText: isRtl ? "اشتري الآن" : "Buy Now",
  };

  const keychainYamalProduct: CatalogProductItem = {
    id: "keychain-yamal",
    slug: "keychain-lamine-yamal",
    href: "/products/keychain-lamine-yamal",
    title: isRtl ? "ميدالية لامين يامال - برشلونة مخصصة بالاسم" : "Lamine Yamal FC Barcelona Custom Keychain",
    subtitle: isRtl ? "ميدالية أكريليك رقم 19 بتصميم لامين يامال وبرشلونة" : "Custom Lamine Yamal #19 Acrylic Keychain",
    category: isRtl ? "تيكت وليبل وميدالية" : "Tickets, Labels & Keychains",
    categoryId: "stickers",
    price: priceFor("keychain-lamine-yamal") || 70,
    priceUnit: isRtl ? "للقطعة الواحدة" : "per keychain",
    badge: isRtl ? "برشلونة 19" : "Barça 19",
    image: "/products/keychains/keychain-lamine-yamal.jpeg",
    description: isRtl
      ? "ميدالية أكريليك كروية مميزة لعشاق نادي برشلونة وللنجم لامين يامال رقم 19، مطبوعة بجودة فائقة ومخصصة باسم طفلك بالكامل."
      : "Premium acrylic football keychain for FC Barcelona and Lamine Yamal #19 fans, personalized with your child's name.",
    features: isRtl
      ? ["أكريليك قوي بطبقة حماية ولمعان فائق", "تصميم نجم برشلونة لامين يامال رقم 19", "مطبوع باسم طفلك الشخصي"]
      : ["Glossy Durable Acrylic", "Official Lamine Yamal #19 Artwork", "Personalized with Custom Name"],
    ctaText: isRtl ? "اشتري الآن" : "Buy Now",
  };

  const keychainRonaldoProduct: CatalogProductItem = {
    id: "keychain-ronaldo",
    slug: "keychain-cristiano-ronaldo",
    href: "/products/keychain-cristiano-ronaldo",
    title: isRtl ? "ميدالية كريستيانو رونالدو - الكرة الذهبية مخصصة بالاسم" : "Cristiano Ronaldo Ballon d'Or Custom Keychain",
    subtitle: isRtl ? "ميدالية أكريليك فاخرة بشعار ريال مدريد والكرة الذهبية" : "Cristiano Ronaldo Real Madrid Acrylic Keychain",
    category: isRtl ? "تيكت وليبل وميدالية" : "Tickets, Labels & Keychains",
    categoryId: "stickers",
    price: priceFor("keychain-cristiano-ronaldo") || 70,
    priceUnit: isRtl ? "للقطعة الواحدة" : "per keychain",
    badge: isRtl ? "ريال مدريد" : "Real Madrid",
    image: "/products/keychains/keychain-cristiano-ronaldo.jpeg",
    description: isRtl
      ? "ميدالية أكريليك أسطورية للنجم كريستيانو رونالدو مع شعار ريال مدريد والكرة الذهبية، مخصصة باسم طفلك ومقاومة للخدش والماء."
      : "Legendary acrylic keychain featuring Cristiano Ronaldo with Real Madrid crest and the Ballon d'Or, personalized with your child's name.",
    features: isRtl
      ? ["أكريليك صلب متين ومقاوم للخدش", "تصميم الأسطورة رونالدو والكرة الذهبية", "مطبوع باسم طفلك الشخصي"]
      : ["Scratch-Resistant Sturdy Acrylic", "Legendary Ronaldo & Ballon d'Or Design", "Personalized with Custom Name"],
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
    keychainAssortedProduct,                          // 5b. Custom Acrylic Keychains (Assorted)
    storyRedBallProduct,                              // 6. Story 2: Yahya & The Red Ball
    stickerProducts[0],                               // 7. K-Pop Demon Hunters
    keychainYamalProduct,                             // 7b. Lamine Yamal Barça 19 Keychain
    stickerProducts[3],                               // 8. Little Princess
    keychainRonaldoProduct,                           // 8b. Cristiano Ronaldo Real Madrid Keychain
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

  const catalog = shuffledCatalog.filter(item => {
    const slug = item.categoryId === "customized-stories" ? "first-year-at-school" : item.href.split("?")[0].split("/").pop();
    return records.some(p => p.slug === slug);
  });
  const known = new Set(["custom-waterproof-stickers", "custom-printed-tshirt", "reward-cards-box-set", "first-year-at-school", "custom-acrylic-name-keychain", "keychain-lamine-yamal", "keychain-cristiano-ronaldo"]);
  for (const record of records.filter(p => !known.has(p.slug) && !p.slug.startsWith("demo-"))) {
    const product = toStorefrontProduct(record, locale);
    catalog.push({ id: record.id, slug: record.slug, href: `/products/${record.slug}`, title: product.name, subtitle: product.description, category: product.category, categoryId: record.category.slug, price: product.price, priceUnit: "", badge: "", image: product.image, description: product.description, features: [], ctaText: isRtl ? "عرض المنتج" : "View product" });
  }

  const translations = {
    catalogHeading: t("catalogHeading"),
    catalogTitle: t("catalogTitle"),
    home: t("home"),
    products: t("products"),
    searchPlaceholder: isRtl ? "ابحث باسم المنتج أو التصميم..." : "Search by product or design name...",
    allFilter: isRtl ? "كل المنتجات" : "All Products",
    stickersFilter: isRtl ? "تيكت وليبل وميدالية" : "Tickets, Labels & Keychains",
    storiesFilter: isRtl ? "قصص مخصصة" : "Customized Stories",
    cardsFilter: isRtl ? "كروت التشجيع" : "Reward Cards",
    tshirtsFilter: isRtl ? "تيشيرتات (كبار وأطفال)" : "T-Shirts (Adults & Kids)",
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
          initialProducts={catalog}
          locale={locale}
          translations={translations}
        />
      </section>
    </main>
  );
}
