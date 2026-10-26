import type { Prisma } from "@prisma/client";
import stickersData from "@/data/stickers-product.json";

export async function ensureCatalogProductInTransaction(
  slug: string,
  tx: Prisma.TransactionClient
): Promise<void> {
  const existing = await tx.product.findUnique({
    where: { slug },
    include: { customizationFields: { include: { options: true } } },
  });
  if (existing) {
    if (slug === "custom-waterproof-stickers") {
      const existingKeys = new Set(existing.customizationFields.map((f) => f.key));
      if (!existingKeys.has("custom_design_text")) {
        await tx.customizationField.create({
          data: {
            productId: existing.id,
            position: 7,
            label: "وصف فكرة التصميم المطلوب (للتصميم المخصص)",
            key: "custom_design_text",
            type: "TEXT",
            required: false,
            maxLength: 500,
          },
        });
      }
      const themeField = existing.customizationFields.find((f) => f.key === "design_theme");
      if (themeField && !themeField.options.some((o) => o.value === "custom-design")) {
        await tx.customizationOption.create({
          data: {
            fieldId: themeField.id,
            label: "استيكر مخصص بتصميمك وفكرتك الخاصة",
            value: "custom-design",
          },
        });
      }
    }
    return;
  }

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
          description: "Custom printed cotton T-shirts for adults and kids.",
          image: "/products/t-shirts/white-tshirt.svg",
          published: true,
        },
      });
    }
    await tx.product.create({
      data: {
        slug: "custom-printed-tshirt",
        name: "Daisy Designs Custom Printed Cotton T-Shirt (Adults & Kids)",
        arabicName: "تيشيرت قطن بطباعة مخصصة (كبار وأطفال)",
        description: "High-quality plain cotton T-shirt for adults and kids customized with your requested artwork or written idea.",
        arabicDescription: "تيشيرت قطن سادة عالي الجودة ومريح للكبار والأطفال، مخصص بطباعة تصميمك الخاص.",
        price: 450,
        sku: "DD-TS-001",
        stock: 100,
        lowStockThreshold: 5,
        featured: true,
        customizable: true,
        published: true,
        categoryId: cat.id,
        tags: ["printed-t-shirts", "تيشيرتات مطبوعة", "تيشيرت كبار وأطفال", "Daisy Designs", "ملابس قطنية"],
        images: {
          create: [
            { position: 0, url: "/products/t-shirts/white-tshirt.svg", alt: "White T-Shirt (Adults & Kids)" },
            { position: 1, url: "/products/t-shirts/black-tshirt.svg", alt: "Black T-Shirt (Adults & Kids)" },
            { position: 2, url: "/products/t-shirts/gray-tshirt.svg", alt: "Gray T-Shirt (Adults & Kids)" },
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
          name: "Tickets, Labels & Keychains",
          arabicName: "تيكت وليبل وميدالية",
          description: "High-quality, durable waterproof stickers, clothing labels & personalized acrylic keychains.",
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
        price: stickersData.product.price,
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
              label: "اسم المدرسة (اختياري)",
              key: "school_name",
              type: "TEXT",
              required: false,
              maxLength: 120,
            },
            {
              position: 3,
              label: "المرحلة / الصف (اختياري)",
              key: "grade",
              type: "TEXT",
              required: false,
              maxLength: 80,
            },
            {
              position: 4,
              label: "الفصل (اختياري)",
              key: "class_name",
              type: "TEXT",
              required: false,
              maxLength: 80,
            },
            {
              position: 5,
              label: "رقم هاتف ولي الأمر (اختياري)",
              key: "parent_phone",
              type: "TEXT",
              required: false,
              maxLength: 20,
            },
            {
              position: 6,
              label: "صورة الطفل أو التصميم (اختياري)",
              key: "child_photo",
              type: "IMAGE",
              required: false,
            },
            {
              position: 7,
              label: "وصف فكرة التصميم المطلوب (للتصميم المخصص)",
              key: "custom_design_text",
              type: "TEXT",
              required: false,
              maxLength: 500,
            },
          ],
        },
      },
    });
    return;
  }

  if (slug === "custom-acrylic-name-keychain" || slug === "keychain-lamine-yamal" || slug === "keychain-cristiano-ronaldo") {
    let cat = await tx.category.findUnique({ where: { slug: "stickers" } });
    if (!cat) {
      cat = await tx.category.create({
        data: {
          slug: "stickers",
          name: "Tickets, Labels & Keychains",
          arabicName: "تيكت وليبل وميدالية",
          description: "High-quality, durable waterproof stickers, clothing labels & personalized acrylic keychains.",
          image: "/products/stickers/sticker-02-super-cool-dino.jpeg",
          published: true,
        },
      });
    }

    if (slug === "custom-acrylic-name-keychain") {
      await tx.product.create({
        data: {
          slug: "custom-acrylic-name-keychain",
          name: "Daisy Designs Custom Acrylic Name Keychain",
          arabicName: "ميدالية اسم مخصصة (أشكال متعددة)",
          description: "Durable waterproof custom acrylic keychain with your child's name for school backpacks and keys.",
          arabicDescription: "ميدالية أكريليك متينة ومقاومة للماء مخصصة باسم طفلك والشخصية المفضلة للحقائب المدرسية والمفاتيح.",
          price: 70,
          sku: "DD-KC-001",
          stock: 100,
          lowStockThreshold: 10,
          featured: false,
          customizable: true,
          published: true,
          categoryId: cat.id,
          tags: ["keychains", "ميداليات", "Daisy Designs", "أطفال"],
          images: {
            create: [
              { position: 0, url: "/products/keychains/keychains-collection.jpeg", alt: "Custom Acrylic Keychain Collection" },
            ],
          },
          customizationFields: {
            create: [
              { position: 0, label: "اسم الطفل المكتوب على الميدالية", key: "child_name", type: "TEXT", required: true, maxLength: 80 },
              { position: 1, label: "الشخصية أو التصميم المطلوب (سبايدرمان، باربي، ستيتش، سونيك، موانا)", key: "design_theme", type: "TEXT", required: false, maxLength: 100 },
            ],
          },
        },
      });
      return;
    }

    if (slug === "keychain-lamine-yamal") {
      await tx.product.create({
        data: {
          slug: "keychain-lamine-yamal",
          name: "Lamine Yamal FC Barcelona Custom Name Keychain",
          arabicName: "ميدالية لامين يامال - برشلونة مخصصة بالاسم",
          description: "Custom acrylic keychain featuring Lamine Yamal (Barcelona #19) personalized with your child's name.",
          arabicDescription: "ميدالية أكريليك مميزة بتصميم لامين يامال ونادي برشلونة رقم 19، مخصصة باسم طفلك بجودة طباعة فائقة ومقاومة للماء.",
          price: 70,
          sku: "DD-KC-002",
          stock: 100,
          lowStockThreshold: 10,
          featured: false,
          customizable: true,
          published: true,
          categoryId: cat.id,
          tags: ["keychains", "ميداليات", "Daisy Designs", "برشلونة", "يامال"],
          images: {
            create: [
              { position: 0, url: "/products/keychains/keychain-lamine-yamal.jpeg", alt: "Lamine Yamal Keychain" },
            ],
          },
          customizationFields: {
            create: [
              { position: 0, label: "اسم الطفل المكتوب على الميدالية", key: "child_name", type: "TEXT", required: true, maxLength: 80 },
            ],
          },
        },
      });
      return;
    }

    if (slug === "keychain-cristiano-ronaldo") {
      await tx.product.create({
        data: {
          slug: "keychain-cristiano-ronaldo",
          name: "Cristiano Ronaldo Real Madrid Ballon d'Or Custom Name Keychain",
          arabicName: "ميدالية كريستيانو رونالدو - الكرة الذهبية مخصصة بالاسم",
          description: "Luxury custom acrylic keychain featuring Cristiano Ronaldo with Ballon d'Or and Real Madrid logo, personalized with child's name.",
          arabicDescription: "ميدالية أكريليك فاخرة للأسطورة كريستيانو رونالدو بشعار ريال مدريد والكرة الذهبية، مخصصة باسم طفلك.",
          price: 70,
          sku: "DD-KC-003",
          stock: 100,
          lowStockThreshold: 10,
          featured: false,
          customizable: true,
          published: true,
          categoryId: cat.id,
          tags: ["keychains", "ميداليات", "Daisy Designs", "ريال مدريد", "رونالدو"],
          images: {
            create: [
              { position: 0, url: "/products/keychains/keychain-cristiano-ronaldo.jpeg", alt: "Cristiano Ronaldo Keychain" },
            ],
          },
          customizationFields: {
            create: [
              { position: 0, label: "اسم الطفل المكتوب على الميدالية", key: "child_name", type: "TEXT", required: true, maxLength: 80 },
            ],
          },
        },
      });
      return;
    }
  }

}
