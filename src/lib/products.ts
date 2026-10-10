export type Product = { slug: string; name: string; category: string; price: number; compareAtPrice?: number; image: string; description: string; customizable?: boolean; hasVariants?: boolean; badge?: string };
export const products: Product[] = [
    { slug: "name-labels-classic", name: "ملصقات الاسم | Classic", category: "استيكرات مدرسية", price: 149, compareAtPrice: 189, image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=900&q=85", description: "مجموعة ملصقات متينة باسم طفلك، مناسبة للأدوات والكتب.", customizable: true, badge: "الأكثر مبيعًا" },
    { slug: "daily-bottle", name: "زجاجة يومية | Mono", category: "أدوات الشرب", price: 485, image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=900&q=85", description: "زجاجة خفيفة وآمنة للاستخدام اليومي، بتصميم هادئ.", customizable: true },
    { slug: "soft-lunch-box", name: "لانش بوكس | Soft", category: "لانش بوكس", price: 590, image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=900&q=85", description: "حافظة طعام عملية تحافظ على ترتيب وجبة طفلك.", customizable: true, badge: "وصل حديثًا" },
    { slug: "school-tote", name: "حقيبة المدرسة | Daily", category: "شنط ومقلمات", price: 890, compareAtPrice: 1050, image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900&q=85", description: "حقيبة واسعة بتفاصيل مريحة، جاهزة ليوم مليء بالمغامرات." },
    { slug: "pencil-case", name: "مقلمة | Essential", category: "شنط ومقلمات", price: 320, image: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=900&q=85", description: "مقلمة مرتبة لكل الأدوات الصغيرة.", customizable: true },
    { slug: "sticker-pack-mini", name: "ملصقات صغيرة | Mini", category: "استيكرات مدرسية", price: 99, image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=900&q=85", description: "تفاصيل صغيرة تضيف شخصية لكل شيء." },
];
export function formatPrice(price: number) { return `${price.toLocaleString("ar-EG")} ج.م`; }
