import { PRODUCT_IMAGE_PLACEHOLDER } from "@/lib/product-image";
import { formatLocaleNumber, type Locale } from "@/lib/locale";

export type Product = { slug: string; name: string; category: string; price: number; compareAtPrice?: number; image: string; description: string; customizable?: boolean; hasVariants?: boolean; badge?: string };
export const products: Product[] = [
    { slug: "name-labels-classic", name: "ملصقات الاسم | Classic", category: "استيكرات مدرسية", price: 149, compareAtPrice: 189, image: PRODUCT_IMAGE_PLACEHOLDER, description: "مجموعة ملصقات متينة باسم طفلك، مناسبة للأدوات والكتب.", customizable: true, badge: "الأكثر مبيعًا" },
    { slug: "daily-bottle", name: "زجاجة يومية | Mono", category: "أدوات الشرب", price: 485, image: PRODUCT_IMAGE_PLACEHOLDER, description: "زجاجة خفيفة وآمنة للاستخدام اليومي، بتصميم هادئ.", customizable: true },
    { slug: "soft-lunch-box", name: "لانش بوكس | Soft", category: "لانش بوكس", price: 590, image: PRODUCT_IMAGE_PLACEHOLDER, description: "حافظة طعام عملية تحافظ على ترتيب وجبة طفلك.", customizable: true, badge: "وصل حديثًا" },
    { slug: "school-tote", name: "حقيبة المدرسة | Daily", category: "شنط ومقلمات", price: 890, compareAtPrice: 1050, image: PRODUCT_IMAGE_PLACEHOLDER, description: "حقيبة واسعة بتفاصيل مريحة، جاهزة ليوم مليء بالمغامرات." },
    { slug: "pencil-case", name: "مقلمة | Essential", category: "شنط ومقلمات", price: 320, image: PRODUCT_IMAGE_PLACEHOLDER, description: "مقلمة مرتبة لكل الأدوات الصغيرة.", customizable: true },
    { slug: "sticker-pack-mini", name: "ملصقات صغيرة | Mini", category: "استيكرات مدرسية", price: 99, image: PRODUCT_IMAGE_PLACEHOLDER, description: "تفاصيل صغيرة تضيف شخصية لكل شيء." },
];
export function formatPrice(price: number, locale: Locale = "ar") {
    const amount = formatLocaleNumber(locale, price);
    return locale === "ar" ? `${amount} ج.م` : `${amount} EGP`;
}
