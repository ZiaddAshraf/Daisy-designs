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
    arabicTagline: "ملصقات مقاومة للماء للدفاتر والحقائب وزجاجات المياه",
    description: "Durable, high-quality stickers crafted for school supplies, notebooks, backpacks, and water bottles. The store sells custom stickers, not the bottles or bags.",
    arabicDescription: "استيكرات عالية الجودة ومقاومة للماء مخصصة للأدوات المدرسية، الدفاتر، الحقائب، وزجاجات المياه. المتجر يصمم ويوفر الملصقات فقط ولا يبيع الزجاجات أو الحقائب.",
    surfaceNotice: "Daisy Designs sells custom stickers only (not the bottles or bags).",
    arabicSurfaceNotice: "المتجر يوفر ويصمم الملصقات فقط، ولا يبيع الزجاجات أو الحقائب المعروضة للتوضيح.",
    letter: "S",
  },
  {
    id: "reward-cards",
    slug: "reward-cards",
    name: "Reward Cards",
    arabicName: "كروت التشجيع",
    tagline: "Waterproof motivational cards designed for lunchboxes",
    arabicTagline: "كروت تحفيزية مقاومة للماء لمفاجآت اللانش بوكس",
    description: "Heartwarming waterproof affirmation and reward cards for children, thoughtfully sized as daily uplifting surprises tucked inside lunchboxes and school kits.",
    arabicDescription: "كروت تحفيزية ورسائل تشجيعية مقاومة للماء للأطفال، صُممت لتكون مفاجأة يومية دافئة ولطيفة داخل اللانش بوكس والحقيبة المدرسية.",
    surfaceNotice: "Waterproof and durable for daily lunchbox surprises.",
    arabicSurfaceNotice: "مقاومة للماء والرطوبة لمفاجآت اللانش بوكس اليومية.",
    letter: "R",
  },
  {
    id: "customized-stories",
    slug: "customized-stories",
    name: "Customized Stories",
    arabicName: "قصص مخصصة",
    tagline: "Personalized stories starring your child with their name & photo",
    arabicTagline: "قصص مصممة خصيصاً باسم طفلك وصورته وعالمه المحبب",
    description: "Imaginative personalized stories featuring your child's name and photo, with themes chosen to build confidence, imagination, and a lifelong love of reading.",
    arabicDescription: "قصص شيقة من بطولة طفلك باسمه وصورته، مع اختيار قصة وموضوع محبب له لغرس حب القراءة وبناء الثقة والخيال.",
    surfaceNotice: "Personalized with the child's name, photo, and selected theme.",
    arabicSurfaceNotice: "تُخصص بالكامل باسم الطفل وصورته وموضوع القصة المختار.",
    letter: "C",
  },
];

const SLUG_ALIASES: Record<string, string> = {
  "school-stickers": "stickers",
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

