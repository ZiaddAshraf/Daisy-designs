import { prisma } from "@/lib/prisma";

export const THERMAL_LABEL_SLUG = "custom-thermal-clothing-labels";
export const THERMAL_LABEL_PACK_PRICE = 150;

export async function ensureThermalLabelProduct(): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const category = await tx.category.upsert({
      where: { slug: "stickers" },
      update: {},
      create: {
        slug: "stickers",
        name: "Tickets, Labels & Keychains",
        arabicName: "تيكت وليبل وميدالية",
        description: "Waterproof tickets, clothing labels and personalized acrylic keychains.",
        image: "/products/stickers/tickets-labels-studio.jpeg",
        published: true,
      },
    });

    await tx.product.upsert({
      where: { slug: THERMAL_LABEL_SLUG },
      update: { price: THERMAL_LABEL_PACK_PRICE, published: true, categoryId: category.id },
      create: {
        slug: THERMAL_LABEL_SLUG,
        name: "Personalized Thermal Clothing Labels - Pack of 10",
        arabicName: "ليبل حراري مخصص - ١٠ قطع",
        description: "A pack of 10 personalized iron-on clothing labels with your child's name.",
        arabicDescription: "باقة من ١٠ ليبل حراري للملابس باسم طفلك. اختاري التصميم واكتبي البيانات المطلوبة للباقة.",
        price: THERMAL_LABEL_PACK_PRICE,
        sku: "DD-TL-010",
        stock: 100,
        lowStockThreshold: 10,
        featured: false,
        customizable: true,
        published: true,
        categoryId: category.id,
        tags: ["thermal-labels", "ليبل حراري", "Daisy Designs", "أطفال"],
        images: {
          create: [{ position: 0, url: "/products/stickers/thermal-labels-10-pack.jpg", alt: "Ten personalized thermal clothing labels" }],
        },
        customizationFields: {
          create: [
            { position: 0, label: "اسم الطفل المكتوب على الليبل", key: "child_name", type: "TEXT", required: true, maxLength: 80 },
            { position: 1, label: "رقم الهاتف على الليبل (اختياري)", key: "parent_phone", type: "TEXT", required: false, maxLength: 30 },
            { position: 2, label: "التصميم أو اللون المطلوب (اختياري)", key: "design_theme", type: "TEXT", required: false, maxLength: 100 },
          ],
        },
      },
    });
  });
}
