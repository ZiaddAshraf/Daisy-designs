/**
 * Fictional storefront fixtures for local review only. These are not client
 * products, approved prices, or available inventory. Keep every record
 * unpublished and retain the DEMO marker when editing this catalog.
 */
import { DEMO_CATALOG_MARKER } from "../src/lib/demo-preview-safety";
import { PRODUCT_IMAGE_PLACEHOLDER } from "../src/lib/product-image";

export { DEMO_CATALOG_MARKER } from "../src/lib/demo-preview-safety";
const DEMO_PREFIX = "DEMO — ";
const DISCLAIMER_EN = "DEMO DATA ONLY. Fictional example for design review; not a real product, approved price, or available inventory. ";
const DISCLAIMER_AR = "بيانات تجريبية فقط للمراجعة البصرية؛ هذا المنتج والسعر والمخزون افتراضي وغير معتمد للبيع. ";

const image = PRODUCT_IMAGE_PLACEHOLDER;

const categories = [
  ["demo-school-labels", "School Labels", "ملصقات مدرسية", "ملصقات وأسماء توضيحية للكتب والأدوات.", image],
  ["demo-bottles-flasks", "Bottles & Flasks", "زجاجات وقوارير", "زجاجات وقوارير أطفال ضمن كتالوج تجريبي.", image],
  ["demo-lunch-essentials", "Lunch Essentials", "مستلزمات الطعام", "علب طعام وإكسسوارات وجبات للاستخدام المدرسي.", image],
  ["demo-bags", "Bags & Backpacks", "حقائب وشنط", "حقائب وشنط بأمثلة ألوان وتخصيص افتراضية.", image],
  ["demo-pencil-cases", "Pencil Cases", "مقالم", "مقالم منظمة بتصميمات تجريبية متنوعة.", image],
  ["demo-stationery", "Stationery", "أدوات مكتبية", "دفاتر وأدوات مكتبية شخصية للعرض التجريبي.", image],
  ["demo-accessories", "Personalized Accessories", "إكسسوارات شخصية", "إكسسوارات أطفال تحمل أسماءهم في أمثلة غير معتمدة.", image],
].map(([slug, name, arabicName, summary, categoryImage]) => ({
  slug,
  name: `${DEMO_PREFIX}${name}`,
  arabicName: `${DEMO_PREFIX}${arabicName}`,
  description: `DEMO DATA ONLY — ${DEMO_CATALOG_MARKER} — ${summary}`,
  image: categoryImage,
  published: false as const,
}));

const collections = [
  ["demo-school-ready", "School Ready", "جاهزون للمدرسة", "تنسيقات مدرسية افتراضية لعرض واجهات المتجر."],
  ["demo-everyday-personal", "Everyday Personal", "تفاصيل يومية شخصية", "أمثلة يومية تجمع خيارات الاسم والألوان."],
  ["demo-thoughtful-gifts", "Thoughtful Gifts", "هدايا مميزة", "أفكار هدايا توضيحية وليست عروضًا للبيع."],
  ["demo-favorites", "Daisy Favorites", "اختيارات دايزي", "مجموعة تحريرية تجريبية لتجربة ترتيب المنتجات."],
].map(([slug, name, , summary]) => ({
  slug,
  name: `${DEMO_PREFIX}${name}`,
  description: `DEMO DATA ONLY — ${DEMO_CATALOG_MARKER} — ${summary}`,
  image,
  published: false as const,
  seoTitle: `${DEMO_PREFIX}${name}`,
  seoDescription: `DEMO DATA ONLY — ${summary}`,
}));

type CustomizationOption = { label: string; value: string };
type CustomizationField = {
  label: string;
  key: string;
  type: "TEXT" | "SELECT" | "COLOR" | "SIZE" | "IMAGE";
  required: boolean;
  placeholder?: string;
  maxLength?: number;
  options: CustomizationOption[];
};
type Variant = { name: string; sku: string; price?: number; stock: number; options: Record<string, string> };

const childName: CustomizationField = {
  label: "اسم الطفل (تجريبي)", key: "child-name", type: "TEXT", required: true,
  placeholder: "اكتب اسمًا تجريبيًا", maxLength: 20, options: [],
};
const theme: CustomizationField = {
  label: "التصميم", key: "theme", type: "SELECT", required: false,
  options: [{ label: "نجوم هادئة", value: "soft-stars" }, { label: "حديقة صغيرة", value: "little-garden" }, { label: "فضاء", value: "outer-space" }],
};
const color: CustomizationField = {
  label: "اللون", key: "color", type: "COLOR", required: false,
  options: [{ label: "وردي غباري", value: "dusty-rose" }, { label: "أزرق سماوي", value: "sky-blue" }, { label: "أخضر مريمي", value: "sage" }],
};
const size: CustomizationField = {
  label: "المقاس", key: "size", type: "SIZE", required: false,
  options: [{ label: "صغير", value: "small" }, { label: "متوسط", value: "medium" }, { label: "كبير", value: "large" }],
};

type ProductInput = {
  slug: string; skuNumber: number; name: string; arabicName: string; en: string; ar: string;
  price: number; stock: number; categorySlug: string; collectionSlug: string; image: string;
  fields?: CustomizationField[]; variants?: Variant[]; featured?: boolean; bestSeller?: boolean; newArrival?: boolean;
};
function makeProduct(input: ProductInput) {
  const fields = input.fields ?? [];
  const sku = `DEMO-DD-${String(input.skuNumber).padStart(3, "0")}`;
  return {
    slug: `demo-${input.slug}`,
    name: `${DEMO_PREFIX}${input.name}`,
    arabicName: `${DEMO_PREFIX}${input.arabicName}`,
    description: `${DISCLAIMER_EN}${input.en}`,
    arabicDescription: `${DISCLAIMER_AR}${input.ar}`,
    tags: [DEMO_CATALOG_MARKER, "DEMO", "بيانات تجريبية"],
    price: input.price,
    compareAtPrice: null,
    sku,
    stock: input.stock,
    lowStockThreshold: 4,
    featured: input.featured ?? false,
    bestSeller: input.bestSeller ?? false,
    newArrival: input.newArrival ?? false,
    customizable: fields.length > 0,
    published: false as const,
    seoTitle: `${DEMO_PREFIX}${input.name}`,
    seoDescription: "DEMO DATA ONLY — fictional product and price for visual review.",
    categorySlug: input.categorySlug,
    collectionSlug: input.collectionSlug,
    images: [{ url: input.image, alt: `DEMO image reference — ${input.arabicName}` }],
    variants: input.variants ?? [],
    customizationFields: fields,
  };
}

const bottleVariants = (base: string, basePrice: number): Variant[] => [
  { name: "٣٥٠ مل", sku: `${base}-V1`, price: basePrice, stock: 12, options: { capacity: "350ml" } },
  { name: "٥٠٠ مل", sku: `${base}-V2`, price: basePrice + 80, stock: 9, options: { capacity: "500ml" } },
];

const products = ([
  { skuNumber: 1, slug: "classic-name-labels", name: "Classic Name Labels", arabicName: "ملصقات الاسم الكلاسيكية", en: "Water-resistant name labels for school books and everyday supplies.", ar: "ملصقات اسم مقاومة للماء لتوضيح الكتب والأدوات اليومية.", price: 145, stock: 32, categorySlug: "demo-school-labels", collectionSlug: "demo-school-ready", image, fields: [childName, theme], featured: true, bestSeller: true },
  { skuNumber: 2, slug: "mini-name-labels", name: "Mini Name Labels", arabicName: "ملصقات الاسم الصغيرة", en: "A compact set sized for pencils, lunch containers, and small accessories.", ar: "مجموعة صغيرة تناسب الأقلام وعلب الطعام والإكسسوارات.", price: 95, stock: 40, categorySlug: "demo-school-labels", collectionSlug: "demo-everyday-personal", image, fields: [childName, color] },
  { skuNumber: 3, slug: "book-label-set", name: "Book Label Set", arabicName: "مجموعة ملصقات الكتب", en: "Coordinated labels designed to make a school library feel personal.", ar: "ملصقات متناسقة تضيف لمسة شخصية إلى كتب المدرسة.", price: 125, stock: 28, categorySlug: "demo-school-labels", collectionSlug: "demo-school-ready", image, fields: [childName, theme] },
  { skuNumber: 4, slug: "rainbow-labels", name: "Soft Rainbow Labels", arabicName: "ملصقات قوس قزح الهادئ", en: "A gentle color story for organizing school and craft supplies.", ar: "ألوان هادئة لتنظيم أدوات المدرسة والأشغال اليدوية.", price: 135, stock: 24, categorySlug: "demo-school-labels", collectionSlug: "demo-favorites", image, fields: [childName, color], bestSeller: true },
  { skuNumber: 5, slug: "daily-bottle", name: "Daily Name Bottle", arabicName: "زجاجة يومية بالاسم", en: "A lightweight bottle concept with a personalized name panel.", ar: "تصميم توضيحي لزجاجة خفيفة تحمل لوحة اسم شخصية.", price: 420, stock: 21, categorySlug: "demo-bottles-flasks", collectionSlug: "demo-everyday-personal", image, fields: [childName, color], variants: bottleVariants("DEMO-DD-005", 420), featured: true },
  { skuNumber: 6, slug: "school-bottle", name: "School Day Bottle", arabicName: "زجاجة يوم المدرسة", en: "A practical school bottle example with two size options.", ar: "مثال لزجاجة مدرسية عملية بخيارين للسعة.", price: 465, stock: 21, categorySlug: "demo-bottles-flasks", collectionSlug: "demo-school-ready", image, fields: [childName, theme], variants: bottleVariants("DEMO-DD-006", 465) },
  { skuNumber: 7, slug: "little-star-flask", name: "Little Star Flask", arabicName: "قارورة النجمة الصغيرة", en: "A compact flask concept for outings and after-school activities.", ar: "تصميم توضيحي لقارورة صغيرة للنزهات والأنشطة بعد المدرسة.", price: 590, stock: 13, categorySlug: "demo-bottles-flasks", collectionSlug: "demo-thoughtful-gifts", image, fields: [childName, theme], featured: true },
  { skuNumber: 8, slug: "bento-lunch-box", name: "Bento Lunch Box", arabicName: "علبة طعام بينتو", en: "A tidy lunch-box concept with a removable divider and name label.", ar: "تصميم توضيحي لعلبة طعام بفاصل داخلي وملصق للاسم.", price: 510, stock: 16, categorySlug: "demo-lunch-essentials", collectionSlug: "demo-school-ready", image, fields: [childName, color], featured: true },
  { skuNumber: 9, slug: "snack-duo-box", name: "Snack Duo Box", arabicName: "علبة وجبتين خفيفتين", en: "A two-compartment snack container concept for school breaks.", ar: "تصميم توضيحي لعلبة مقسمة إلى جزأين للوجبات الخفيفة.", price: 285, stock: 25, categorySlug: "demo-lunch-essentials", collectionSlug: "demo-everyday-personal", image, fields: [childName] },
  { skuNumber: 10, slug: "lunch-wrap-set", name: "Lunch Wrap Set", arabicName: "مجموعة غلاف الوجبة", en: "A reusable wrap and matching label concept for packed lunches.", ar: "تصميم توضيحي لغلاف قابل لإعادة الاستخدام وملصق متناسق.", price: 195, stock: 30, categorySlug: "demo-lunch-essentials", collectionSlug: "demo-favorites", image, fields: [childName, theme], bestSeller: true },
  { skuNumber: 11, slug: "everyday-backpack", name: "Everyday Mini Backpack", arabicName: "حقيبة يومية صغيرة", en: "A compact backpack concept with a name tag and organized pockets.", ar: "تصميم توضيحي لحقيبة صغيرة ببطاقة اسم وجيوب منظمة.", price: 890, stock: 10, categorySlug: "demo-bags", collectionSlug: "demo-school-ready", image, fields: [childName, color, size], featured: true },
  { skuNumber: 12, slug: "light-tote", name: "Lightweight School Tote", arabicName: "حقيبة كتف مدرسية خفيفة", en: "A soft carry-all example for books, crafts, and weekend visits.", ar: "مثال لحقيبة خفيفة للكتب والأشغال اليدوية والزيارات.", price: 620, stock: 14, categorySlug: "demo-bags", collectionSlug: "demo-everyday-personal", image, fields: [childName, color] },
  { skuNumber: 13, slug: "activity-bag", name: "Little Explorer Activity Bag", arabicName: "حقيبة أنشطة المستكشف الصغير", en: "A roomy activity-bag concept for art materials and small essentials.", ar: "تصميم توضيحي لحقيبة أنشطة تتسع للأدوات والأغراض الصغيرة.", price: 740, stock: 9, categorySlug: "demo-bags", collectionSlug: "demo-thoughtful-gifts", image, fields: [childName, theme], newArrival: true },
  { skuNumber: 14, slug: "classic-pencil-case", name: "Classic Pencil Case", arabicName: "مقلمة كلاسيكية", en: "A neat pencil-case concept with a personalized front panel.", ar: "تصميم توضيحي لمقلمة مرتبة بلوحة أمامية تحمل الاسم.", price: 260, stock: 27, categorySlug: "demo-pencil-cases", collectionSlug: "demo-school-ready", image, fields: [childName, color], bestSeller: true },
  { skuNumber: 15, slug: "double-pencil-case", name: "Double-Zip Pencil Case", arabicName: "مقلمة بسحابين", en: "Two compartments keep writing tools and small accessories organized.", ar: "قسمان لتنظيم أقلام الكتابة والإكسسوارات الصغيرة.", price: 340, stock: 19, categorySlug: "demo-pencil-cases", collectionSlug: "demo-favorites", image, fields: [childName, theme] },
  { skuNumber: 16, slug: "soft-pencil-roll", name: "Soft Pencil Roll", arabicName: "حافظة أقلام قماشية", en: "A fabric roll concept for carrying a curated set of colored pencils.", ar: "تصميم توضيحي لحافظة قماشية لمجموعة مختارة من الألوان.", price: 310, stock: 17, categorySlug: "demo-pencil-cases", collectionSlug: "demo-thoughtful-gifts", image, fields: [childName, color] },
  { skuNumber: 17, slug: "first-notebook", name: "First-Day Notebook", arabicName: "دفتر اليوم الأول", en: "A personalized notebook concept with a clean cover and name line.", ar: "تصميم توضيحي لدفتر بغلاف بسيط ومساحة لكتابة الاسم.", price: 180, stock: 35, categorySlug: "demo-stationery", collectionSlug: "demo-school-ready", image, fields: [childName, theme] },
  { skuNumber: 18, slug: "drawing-pad", name: "Little Artist Drawing Pad", arabicName: "دفتر رسم الفنان الصغير", en: "A drawing-pad example for sketches, notes, and creative ideas.", ar: "مثال لدفتر رسم مناسب للرسومات والملاحظات والأفكار.", price: 220, stock: 26, categorySlug: "demo-stationery", collectionSlug: "demo-thoughtful-gifts", image, fields: [childName], newArrival: true },
  { skuNumber: 19, slug: "homework-planner", name: "Homework Planner", arabicName: "مخطط الواجبات", en: "A weekly planner concept that helps make school routines feel manageable.", ar: "تصميم توضيحي لمخطط أسبوعي يساعد على ترتيب مهام المدرسة.", price: 240, stock: 20, categorySlug: "demo-stationery", collectionSlug: "demo-everyday-personal", image, fields: [childName, color] },
  { skuNumber: 20, slug: "name-bookmarks", name: "Name Bookmark Pair", arabicName: "زوج فواصل كتب بالاسم", en: "Two coordinating bookmarks with a simple personalized name area.", ar: "فاصلان متناسقان للكتب مع مساحة بسيطة للاسم.", price: 110, stock: 42, categorySlug: "demo-stationery", collectionSlug: "demo-favorites", image, fields: [childName, theme], bestSeller: true },
  { skuNumber: 21, slug: "name-key-tag", name: "Personalized Bag Tag", arabicName: "تعليقة حقيبة بالاسم", en: "A bag-tag concept designed to make school belongings easier to identify.", ar: "تصميم توضيحي لتعليقة تساعد على تمييز أغراض المدرسة.", price: 155, stock: 33, categorySlug: "demo-accessories", collectionSlug: "demo-school-ready", image, fields: [childName, color] },
  { skuNumber: 22, slug: "initial-bracelet", name: "Initial Friendship Bracelet", arabicName: "سوار صداقة بالحرف الأول", en: "A gentle accessory concept with a customizable initial and color.", ar: "تصميم توضيحي لإكسسوار بسيط بحرف أول ولون قابلين للاختيار.", price: 175, stock: 29, categorySlug: "demo-accessories", collectionSlug: "demo-thoughtful-gifts", image, fields: [childName, color] },
  { skuNumber: 23, slug: "lunch-bag-tag", name: "Lunch Bag Name Tag", arabicName: "بطاقة اسم لحقيبة الطعام", en: "A small personalized tag concept for lunch bags and activity kits.", ar: "تصميم توضيحي لبطاقة صغيرة لحقيبة الطعام أو حقيبة الأنشطة.", price: 125, stock: 31, categorySlug: "demo-accessories", collectionSlug: "demo-everyday-personal", image, fields: [childName, theme] },
  { skuNumber: 24, slug: "gift-set-school", name: "School-Day Gift Set", arabicName: "مجموعة هدية ليوم المدرسة", en: "A coordinated gift-set concept pairing labels, a notebook, and a bag tag.", ar: "تصميم توضيحي يجمع ملصقات ودفترًا وتعليقة حقيبة متناسقة.", price: 650, stock: 8, categorySlug: "demo-accessories", collectionSlug: "demo-thoughtful-gifts", image, fields: [childName, theme], featured: true, newArrival: true },
  { skuNumber: 25, slug: "canvas-art-pouch", name: "Canvas Art Pouch", arabicName: "حافظة أدوات فنية قماشية", en: "A washable pouch concept for carrying craft tools and small treasures.", ar: "تصميم توضيحي لحافظة قابلة للغسل للأدوات الفنية والأغراض الصغيرة.", price: 295, stock: 16, categorySlug: "demo-pencil-cases", collectionSlug: "demo-everyday-personal", image, fields: [childName, color] },
  { skuNumber: 26, slug: "reusable-sticker-kit", name: "Reusable Sticker Kit", arabicName: "مجموعة ملصقات قابلة لإعادة الاستخدام", en: "A playful organization kit concept for notebooks and storage boxes.", ar: "تصميم توضيحي لمجموعة تنظيم مرحة للدفاتر وصناديق التخزين.", price: 210, stock: 23, categorySlug: "demo-school-labels", collectionSlug: "demo-favorites", image, fields: [childName, theme], newArrival: true },
  { skuNumber: 27, slug: "thermal-flask-sleeve", name: "Flask Sleeve Set", arabicName: "طقم غلاف القارورة", en: "A bottle-sleeve and name-label pairing shown as a giftable set.", ar: "تصميم توضيحي يجمع غلاف قارورة وملصق اسم في طقم هدية.", price: 375, stock: 12, categorySlug: "demo-bottles-flasks", collectionSlug: "demo-thoughtful-gifts", image, fields: [childName, color] },
  { skuNumber: 28, slug: "weekend-drawstring", name: "Weekend Drawstring Bag", arabicName: "حقيبة قماش برباط للنزهات", en: "A light drawstring-bag concept for sports, visits, and weekend outings.", ar: "تصميم توضيحي لحقيبة خفيفة للرياضة والزيارات والنزهات.", price: 330, stock: 18, categorySlug: "demo-bags", collectionSlug: "demo-everyday-personal", image, fields: [childName, color, size] },
  { skuNumber: 29, slug: "storybook-label-bundle", name: "Storybook Label Bundle", arabicName: "باقة ملصقات القصص", en: "A themed bundle concept for book labels, bookmarks, and a reading notebook.", ar: "تصميم توضيحي يجمع ملصقات كتب وفواصل ودفترًا للقراءة.", price: 285, stock: 15, categorySlug: "demo-school-labels", collectionSlug: "demo-favorites", image, fields: [childName, theme], bestSeller: true },
  { skuNumber: 30, slug: "personalized-starter-set", name: "Personalized Starter Set", arabicName: "مجموعة البداية الشخصية", en: "A starter-set concept combining a bottle, labels, and a pencil case.", ar: "تصميم توضيحي لمجموعة بداية تجمع زجاجة وملصقات ومقلمة.", price: 980, stock: 7, categorySlug: "demo-accessories", collectionSlug: "demo-thoughtful-gifts", image, fields: [childName, theme, color], featured: true, bestSeller: true },
 ] satisfies ProductInput[]).map((input) => {
  const product = makeProduct(input);
  // Variant SKUs are globally unique and remain visibly demo-scoped.
  const variants = (input.variants ?? []).map((variant) => ({ ...variant, sku: `${variant.sku}` }));
  return { ...product, variants };
});

export const demoCatalog = {
  version: 1,
  marker: DEMO_CATALOG_MARKER,
  disclaimer: "Fictional demo content only. Names, photos, prices, stock, and customizations are illustrative and are not approved client inventory.",
  categories,
  collections,
  products,
};

export type DemoCatalog = typeof demoCatalog;
