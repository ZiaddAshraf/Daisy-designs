import "dotenv/config";
import { randomBytes } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
if (process.env.NODE_ENV === "production") throw new Error("The destructive demo seed is disabled in production");
if (!connectionString) throw new Error("DATABASE_URL is required for seeding");
if (process.env.ALLOW_DESTRUCTIVE_SEED !== "true") throw new Error("Set ALLOW_DESTRUCTIVE_SEED=true to seed a local development database");
const databaseHost = new URL(connectionString).hostname;
if (!["localhost", "127.0.0.1", "::1"].includes(databaseHost)) throw new Error("The destructive demo seed only runs against a local database");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const imagePool = [
    "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=900&q=85",
    "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=900&q=85",
    "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=900&q=85",
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900&q=85",
    "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=900&q=85",
];

const categoryData = [
    ["School Stickers", "استيكرات مدرسية", "school-stickers"],
    ["Bottles & Flasks", "أدوات الشرب", "bottles"],
    ["Lunch Boxes", "لانش بوكس", "lunch-boxes"],
    ["Bags", "شنط", "bags"],
    ["Pencil Cases", "مقلمات", "pencil-cases"],
    ["Accessories", "إكسسوارات", "accessories"],
    ["Personalized Gifts", "هدايا مخصصة", "personalized-gifts"],
] as const;

const collectionData = [
    ["Back to School", "العودة إلى المدرسة", "back-to-school"],
    ["Personalized Essentials", "الأساسيات المخصصة", "personalized-essentials"],
    ["Best Sellers", "الأكثر مبيعًا", "best-sellers"],
    ["New Arrivals", "وصل حديثًا", "new-arrivals"],
] as const;

const productNames = [
    "ملصقات الاسم Classic", "ملصقات الاسم Mini", "ملصقات الكتب Monogram", "ملصقات الألوان", "ملصقات الأدوات", "ملصقات الرياضة", "زجاجة يومية Mono", "زجاجة المدرسة 500ml", "فلاسک حراري صغير", "كوب الشرب Easy", "لانش بوكس Soft", "لانش بوكس Bento", "حافظة الساندويتش", "شنطة المدرسة Daily", "شنطة ظهر Mini", "حقيبة الأنشطة", "مقلمة Essential", "مقلمة Double", "مقلمة القماش", "تعليقة الحقيبة", "ميدالية الاسم", "سوار الاسم", "بطاقة الحقيبة", "مجموعة العودة للمدرسة", "دفتر الاسم", "كراسة الأنشطة", "ستيكرات النجوم", "ستيكرات الحيوانات", "طقم الهدايا الصغير", "طقم الاسم الكامل",
];

async function main() {
    await prisma.orderItem.deleteMany(); await prisma.order.deleteMany(); await prisma.review.deleteMany(); await prisma.cartItem.deleteMany(); await prisma.cart.deleteMany(); await prisma.wishlistItem.deleteMany(); await prisma.wishlist.deleteMany(); await prisma.customizationOption.deleteMany(); await prisma.customizationField.deleteMany(); await prisma.productVariant.deleteMany(); await prisma.productImage.deleteMany(); await prisma.product.deleteMany(); await prisma.category.deleteMany(); await prisma.collection.deleteMany(); await prisma.coupon.deleteMany(); await prisma.address.deleteMany(); await prisma.account.deleteMany(); await prisma.session.deleteMany(); await prisma.user.deleteMany(); await prisma.siteSetting.deleteMany();

    const categories = await Promise.all(categoryData.map(([name, arabicName, slug], index) => prisma.category.create({ data: { name, arabicName, slug, description: `منتجات ${arabicName} المصممة بعناية`, image: imagePool[index % imagePool.length] } })));
    const collections = await Promise.all(collectionData.map(([name, description, slug], index) => prisma.collection.create({ data: { name, slug, description, image: imagePool[index % imagePool.length] } })));

    const products = [];
    for (let index = 0; index < productNames.length; index += 1) {
        const category = categories[index % categories.length];
        const collection = collections[index % collections.length];
        const customizable = index % 3 !== 1;
        const product = await prisma.product.create({
            data: {
                name: productNames[index], arabicName: productNames[index], slug: `stitch-product-${index + 1}`, description: "منتج عملي بتفاصيل أنيقة، مصنوع ليرافق طفلك كل يوم.", arabicDescription: "منتج عملي بتفاصيل أنيقة، مصنوع ليصاحب طفلك في يومه.", tags: ["مخصص", category.arabicName, "أطفال"], price: 99 + index * 31, compareAtPrice: index % 4 === 0 ? 149 + index * 31 : null, sku: `ST-${String(index + 1).padStart(3, "0")}`, stock: 8 + index, lowStockThreshold: 5, featured: index < 8, bestSeller: index % 3 === 0, newArrival: index > 23, customizable, published: true, categoryId: category.id, collectionId: collection.id, seoTitle: productNames[index], seoDescription: "منتجات مخصصة للأطفال من Daisy Designs", images: { create: [{ url: imagePool[index % imagePool.length], alt: productNames[index], position: 0 }, { url: imagePool[(index + 1) % imagePool.length], alt: `${productNames[index]} صورة إضافية`, position: 1 }] }, variants: { create: [{ name: "الأساسي", sku: `ST-${String(index + 1).padStart(3, "0")}-A`, stock: 8 + index, options: { size: "standard" } }] }, customizationFields: customizable ? { create: [{ label: "اسم الطفل", key: "name", type: "TEXT", required: true, placeholder: "اكتب الاسم هنا", maxLength: 24, position: 0 }, { label: "التصميم", key: "theme", type: "SELECT", required: false, position: 1, options: { create: [{ label: "نجوم", value: "stars" }, { label: "قوس قزح", value: "rainbow" }, { label: "حيوانات لطيفة", value: "animals" }] } }, { label: "اللون", key: "color", type: "COLOR", required: false, position: 2, options: { create: [{ label: "أسود", value: "black" }, { label: "أبيض", value: "white" }, { label: "وردي هادئ", value: "soft-pink" }] } }] } : undefined,
            }
        });
        products.push(product);
    }

    const customers = [];
    for (let index = 0; index < 10; index += 1) customers.push(await prisma.user.create({ data: { name: `عميل Daisy Designs ${index + 1}`, email: `customer${index + 1}@example.com`, passwordHash: await hash(randomBytes(32).toString("hex"), 12), phone: `010000000${index}`, role: "CUSTOMER" } }));
    await prisma.user.create({ data: { name: "مدير Daisy Designs", email: "admin@stitch.eg", passwordHash: await hash(randomBytes(32).toString("hex"), 12), role: "ADMIN" } });

    for (let index = 0; index < 20; index += 1) await prisma.review.create({ data: { rating: 4 + (index % 2), title: "تجربة جميلة", comment: "الخامة ممتازة والاسم واضح جدًا، وصل الطلب بسرعة.", status: "APPROVED", verified: true, productId: products[index % products.length].id, userId: customers[index % customers.length].id } });
    const coupons = [{ code: "WELCOME10", type: "PERCENTAGE" as const, value: 10 }, { code: "STITCH50", type: "FIXED" as const, value: 50 }, { code: "SCHOOL15", type: "PERCENTAGE" as const, value: 15 }, { code: "FAMILY100", type: "FIXED" as const, value: 100 }, { code: "NEWYEAR20", type: "PERCENTAGE" as const, value: 20 }];
    for (const coupon of coupons) await prisma.coupon.create({ data: { ...coupon, minimumOrder: 200, active: true } });
    const settings = { announcement: "شحن مجاني للطلبات فوق 2,500 ج.م", brandName: "Daisy Designs", shippingFee: "60", freeShippingThreshold: "2500", currency: "EGP", phone: "+20 100 000 0000", whatsapp: "+20 100 000 0000", email: "hello@stitch.eg" };
    for (const [key, value] of Object.entries(settings)) await prisma.siteSetting.create({ data: { key, value } });

    for (let index = 0; index < 10; index += 1) {
        const product = products[index]; const customer = customers[index];
        const address = await prisma.address.create({ data: { fullName: customer.name ?? "عميل Daisy Designs", phone: customer.phone ?? "01000000000", governorate: "القاهرة", city: "مدينة نصر", address: "عنوان تجريبي للبيانات الأولية", isDefault: true, userId: customer.id } });
        const price = product.price; await prisma.order.create({ data: { number: `ST-${2026000 + index}`, status: index < 2 ? "DELIVERED" : "PROCESSING", paymentStatus: "PENDING", paymentMethod: "COD", subtotal: price, shipping: 60, total: price + 60, userId: customer.id, addressId: address.id, items: { create: { productId: product.id, productName: product.name, productSku: product.sku, productSnapshot: { name: product.name, sku: product.sku, price }, customization: { name: customer.name }, quantity: 1, unitPrice: price, selectedVariant: { name: "الأساسي" } } } } });
    }
    console.log(`Seeded ${products.length} products, ${customers.length + 1} demo users, reviews, coupons, settings and orders. Demo account passwords are random and unavailable.`);
}

main().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => prisma.$disconnect());
