import type { Locale } from "@/lib/locale";

export type StoreCategory = {
  id: string;
  slug: string;
  name: string;
  arabicName: string;
  tagline: string;
  arabicTagline: string;
  description: string;
  arabicDescription: string;
  surfaceNotice?: string;
  arabicSurfaceNotice?: string;
  letter: string;
};

/**
 * Confirmed product categories for Daisy Designs.
 * Extensible: new categories can be appended to this list as the client introduces them.
 */
export const STORE_CATEGORIES: StoreCategory[] = [
  {
    id: "stickers",
    slug: "stickers",
    name: "Stickers",
    arabicName: "استيكرات وملصقات",
    tagline: "Waterproof stickers for notebooks, school bags & water bottles",
    arabicTagline: "استيكرات بتستحمل المية والغسيل للدفاتر والزمزمية والشنط المدرسية",
    description: "Durable, high-quality stickers crafted for school supplies, notebooks, backpacks, and water bottles. The store sells custom stickers, not the bottles or bags.",
    arabicDescription: "استيكرات أطفال كواليتي عالي ومقاومة للمية والغسيل، معمولة مخصوص للأدوات المدرسية، الدفاتر، الشنط، وزجاجات المياه. المتجر بيوفر الاستيكرات المطبوعة فقط للتوضيح.",
    surfaceNotice: "Daisy Designs sells custom stickers only (not the bottles or bags).",
    arabicSurfaceNotice: "المتجر يوفر ويطبع الاستيكرات المخصصة فقط (الزجاجات والشنط المعروضة للتوضيح فقط).",
    letter: "S",
  },
  {
    id: "reward-cards",
    slug: "reward-cards",
    name: "Reward Cards",
    arabicName: "كروت التشجيع",
    tagline: "Inspiring reward and affirmation cards in an exclusive keepsake box",
    arabicTagline: "علبة كروت تشجيع ومكافآت بعبارات إيجابية في علبة هدايا شيك",
    description: "A curated collection of heartwarming affirmation and reward cards, thoughtfully crafted as daily uplifting surprises for lunchboxes, desks, or a joyful gift for little ones.",
    arabicDescription: "مجموعة مميزة من كروت التحفيز والرسائل الإيجابية، صُممت لتكون مفاجأة يومية حلوة في اللانش بوكس أو على المكتب تشجع طفلك وتفرحه كل يوم.",
    surfaceNotice: "Comes in an exclusive Daisy Designs keepsake box containing 10 inspiring cards.",
    arabicSurfaceNotice: "بتوصلك في علبة شيك حصرية من Daisy Designs فيها ١٠ كروت تشجيع ملهمة ومختارة بعناية.",
    letter: "R",
  },
  {
    id: "customized-stories",
    slug: "customized-stories",
    name: "Customized Stories",
    arabicName: "قصص مخصصة",
    tagline: "Personalized printed storybooks starring your child with their photo",
    arabicTagline: "قصص ورقية مطبوعة فاخرة بطلها طفلك بصورته واسمه",
    description: "Imaginative printed storybooks featuring your child's photo, professionally printed on physical paper to inspire a lifelong love of reading.",
    arabicDescription: "قصص ورقية مطبوعة فاخرة بطلها طفلك بصورته واسمه، بنطبعها بعناية عشان تشجع طفلك على حب القراءة وتعيش معاه أحلى ذكريات طفولته.",
    surfaceNotice: "A physical printed storybook personalized with your child's photo, delivered to your door.",
    arabicSurfaceNotice: "كتاب ورقي مطبوع فاخر بيوصلك لحد باب البيت، مخصص بصورة واسم طفلك.",
    letter: "C",
  },
  {
    id: "printed-t-shirts",
    slug: "printed-t-shirts",
    name: "Printed T-Shirts",
    arabicName: "تيشيرتات مطبوعة",
    tagline: "Plain cotton T-shirts for adults and kids customized with your artwork on the center chest",
    arabicTagline: "تيشيرتات قطن سادة للكبار والأطفال مخصصة بطباعة تصميمك الخاص على منتصف الصدر",
    description: "High-quality plain cotton T-shirts for adults and kids customized with your uploaded artwork or written idea. Printed on the center chest, reviewed by our team via WhatsApp, and prepared in 2–3 business days.",
    arabicDescription: "تيشيرتات قطن سادة عالية الجودة للكبار والأطفال، مخصصة بطباعة رسمتك أو فكرتك على منتصف الصدر. تتم مراجعة كل طلب يدويًا وتأكيده عبر الواتساب، وتستغرق مدة التجهيز من يومين إلى ٣ أيام عمل قبل الشحن.",
    surfaceNotice: "Plain cotton T-shirt for adults and kids customized on the center chest (500 EGP). Preparation time: 2–3 business days.",
    arabicSurfaceNotice: "تيشيرت قطن مصري للكبار والأطفال مخصص بطباعة على الصدر (٥٠٠ ج.م). مدة التجهيز: من ٢ لـ ٣ أيام عمل.",
    letter: "T",
  },
];

const SLUG_ALIASES: Record<string, string> = {
  "school-stickers": "stickers",
  "t-shirts": "printed-t-shirts",
  "tshirts": "printed-t-shirts",
};

export function getStoreCategories(): StoreCategory[] {
  return STORE_CATEGORIES;
}

export function getStoreCategory(slug: string): StoreCategory | undefined {
  const normalizedSlug = SLUG_ALIASES[slug] ?? slug;
  return STORE_CATEGORIES.find((cat) => cat.slug === normalizedSlug);
}

export function categoryNameForLocale(category: StoreCategory, locale: Locale): string {
  return locale === "ar" ? category.arabicName : category.name;
}

export function categoryTaglineForLocale(category: StoreCategory, locale: Locale): string {
  return locale === "ar" ? category.arabicTagline : category.tagline;
}

export function categoryDescriptionForLocale(category: StoreCategory, locale: Locale): string {
  return locale === "ar" ? category.arabicDescription : category.description;
}

export function categoryNoticeForLocale(category: StoreCategory, locale: Locale): string | undefined {
  return locale === "ar" ? category.arabicSurfaceNotice : category.surfaceNotice;
}

