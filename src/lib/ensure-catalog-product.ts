import type { Prisma } from "@prisma/client";
import stickersData from "@/data/stickers-product.json";

export async function ensureCatalogProductInTransaction(
  slug: string,
  tx: Prisma.TransactionClient
): Promise<void> {
  const existing = await tx.product.findUnique({ where: { slug } });
  if (existing) return;

  if (slug === "reward-cards-box-set") {
    let cat = await tx.category.findUnique({ where: { slug: "reward-cards" } });
    if (!cat) {
      cat = await tx.category.create({
        data: {
          slug: "reward-cards",
          name: "Reward Cards",
          arabicName: "كروت التشجيع",
          description: "A curated collection of heartwarming affirmation and reward cards.",
          image: "/products/reward-cards/reward-cards-box-set.jpeg",
          published: true,
        },
      });
    }
    await tx.product.create({
      data: {
        slug: "reward-cards-box-set",
        name: "Daisy Designs Reward Cards Box Set",
        arabicName: "علبة كروت التشجيع",
        description:
          "An exclusive collection of 10 inspiring, heartwarming affirmation and reward cards in a beautifully branded Daisy Designs keepsake box.",
        arabicDescription:
          "مجموعة حصرية من كروت التحفيز الملهمة تضم 10 كروت متنوعة ورسائل إيجابية دافئة داخل علبة هدايا أنيقة بشعار Daisy Designs.",
        price: 200,
        sku: "DD-RC-010",
        stock: 50,
        lowStockThreshold: 5,
        featured: true,
        customizable: false,
        published: true,
        categoryId: cat.id,
        tags: ["reward-cards", "كروت التشجيع", "Daisy Designs", "أطفال"],
        images: {
          create: [{ position: 0, url: "/products/reward-cards/reward-cards-box-set.jpeg", alt: "Reward Cards Box" }],
        },
      },
    });
    return;
  }

  if (slug === "custom-printed-tshirt") {
    let cat = await tx.category.findUnique({ where: { slug: "printed-t-shirts" } });
    if (!cat) {
      cat = await tx.category.create({
        data: {
          slug: "printed-t-shirts",
          name: "Printed T-Shirts",
          arabicName: "تيشيرتات مطبوعة",
          description: "Custom printed children's T-shirts.",
          image: "/products/t-shirts/white-tshirt.svg",
          published: true,
        },
      });
    }
    await tx.product.create({
      data: {
        slug: "custom-printed-tshirt",
        name: "Daisy Designs Custom Printed Children's T-Shirt",
        arabicName: "تيشيرت أطفال بطباعة مخصصة",
        description: "High-quality plain children's T-shirt customized with your requested artwork or written idea.",
        arabicDescription: "تيشيرت أطفال سادة عالي الجودة ومريح، مخصص بطباعة تصميمك الخاص.",
        price: 500,
        sku: "DD-TS-001",
        stock: 100,
        lowStockThreshold: 5,
        featured: true,
        customizable: true,
        published: true,
        categoryId: cat.id,
        tags: ["printed-t-shirts", "تيشيرتات مطبوعة", "تيشيرت أطفال", "Daisy Designs", "أطفال"],
        images: {
          create: [
            { position: 0, url: "/products/t-shirts/white-tshirt.svg", alt: "White Children's T-Shirt" },
            { position: 1, url: "/products/t-shirts/black-tshirt.svg", alt: "Black Children's T-Shirt" },
            { position: 2, url: "/products/t-shirts/gray-tshirt.svg", alt: "Gray Children's T-Shirt" },
          ],
        },
      },
    });
    return;
  }

  if (slug === "first-year-at-school") {
    let cat = await tx.category.findUnique({ where: { slug: "customized-stories" } });
    if (!cat) {
      cat = await tx.category.create({
        data: {
          slug: "customized-stories",
          name: "Customized Stories",
          arabicName: "قصص مخصصة",
          description: "Imaginative personalized stories featuring your child's photo.",
          image: "/products/customized-stories/first-year-at-school/cover.jpeg",
          published: true,
        },
      });
    }
    await tx.product.create({
      data: {
        slug: "first-year-at-school",
        name: "Daisy Designs First Year at School Storybook",
        arabicName: "قصة أول سنة في المدرسة",
        description: "An inspiring personalized children's storybook starring your child with their uploaded photograph.",
        arabicDescription: "قصة أطفال ملهمة ومصممة بحب من Daisy Designs تضع طفلك بطلاً للقصة.",
        price: 200,
        sku: "DD-ST-001",
        stock: 50,
        lowStockThreshold: 5,
        featured: true,
        customizable: true,
        published: true,
        categoryId: cat.id,
        tags: ["customized-stories", "قصص مخصصة", "Daisy Designs", "أطفال"],
        images: {
          create: [
            { position: 0, url: "/products/customized-stories/first-year-at-school/cover.jpeg", alt: "Storybook Cover" },
          ],
        },
        customizationFields: {
          create: [
            {
              position: 0,
              label: "صورة الطفل (مطلوبة)",
              key: "child_photo",
              type: "IMAGE",
              required: true,
            },
          ],
        },
      },
    });
    return;
  }

  if (slug === "custom-waterproof-stickers") {
    let cat = await tx.category.findUnique({ where: { slug: "stickers" } });
    if (!cat) {
      cat = await tx.category.create({
        data: {
          slug: "stickers",
          name: "Stickers",
          arabicName: "استيكرات وملصقات",
          description: "High-quality, durable waterproof stickers.",
          image: "/products/stickers/sticker-02-super-cool-dino.jpeg",
          published: true,
        },
      });
    }
    const designOptions = stickersData.product.designs.map((d) => ({
      label: d.arabicTitle,
      value: d.slug,
    }));
    await tx.product.create({
      data: {
        slug: "custom-waterproof-stickers",
        name: "Daisy Designs Custom Waterproof Stickers",
        arabicName: "استيكرات مدرسية مخصصة مقاومة للماء",
        description: "High-quality, durable waterproof stickers personalized with your child's name, school, and class.",
        arabicDescription: "استيكرات مدرسية عالية الجودة ومقاومة للماء مخصصة باسم طفلك ومدرسته وفصله.",
        price: 50,
        sku: "DD-STK-050",
        stock: 500,
        lowStockThreshold: 20,
        featured: true,
        customizable: true,
        published: true,
        categoryId: cat.id,
        tags: ["stickers", "استيكرات", "Daisy Designs", "أطفال"],
        images: {
          create: [
            { position: 0, url: "/products/stickers/sticker-02-super-cool-dino.jpeg", alt: "Custom Stickers" },
          ],
        },
        customizationFields: {
          create: [
            {
              position: 0,
              label: "التصميم",
              key: "design_theme",
              type: "SELECT",
              required: true,
              options: {
                create: designOptions,
              },
            },
            {
              position: 1,
              label: "اسم الطفل",
              key: "child_name",
              type: "TEXT",
              required: true,
              maxLength: 80,
            },
            {
              position: 2,
              label: "رقم هاتف ولي الأمر (اختياري)",
              key: "parent_phone",
              type: "TEXT",
              required: false,
              maxLength: 20,
            },
          ],
        },
      },
    });
    return;
  }
}

