import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Updating category 'stickers' to 'تيكت وليبل وميدالية'...");

  const category = await prisma.category.upsert({
    where: { slug: "stickers" },
    update: {
      arabicName: "تيكت وليبل وميدالية",
      name: "Tickets, Labels & Keychains",
      description: "استيكرات أطفال كواليتي عالي مقاومة للمية، ليبل ملابس حراري، وميداليات أكريليك متينة مخصصة باسم طفلك للأدوات والشنط المدرسية.",
    },
    create: {
      slug: "stickers",
      name: "Tickets, Labels & Keychains",
      arabicName: "تيكت وليبل وميدالية",
      description: "استيكرات أطفال كواليتي عالي مقاومة للمية، ليبل ملابس حراري، وميداليات أكريليك متينة مخصصة باسم طفلك للأدوات والشنط المدرسية.",
      image: "/products/stickers/tickets-labels-studio.jpeg",
      published: true,
    },
  });

  console.log("Category updated:", category.id, category.arabicName);

  const keychains = [
    {
      slug: "custom-acrylic-name-keychain",
      sku: "DD-KC-001",
      name: "Daisy Designs Custom Acrylic Name Keychain",
      arabicName: "ميدالية اسم مخصصة (أشكال متعددة)",
      description: "Durable waterproof custom acrylic keychain with your child's name for school backpacks and keys.",
      arabicDescription: "ميدالية أكريليك متينة ومقاومة للماء مخصصة باسم طفلك والشخصية المفضلة للحقائب المدرسية والمفاتيح.",
      price: 70,
      stock: 100,
      image: "/products/keychains/keychains-collection.jpeg",
      fields: [
        { label: "اسم الطفل المكتوب على الميدالية", key: "child_name", type: "TEXT" as const, required: true },
        { label: "الشخصية أو التصميم المطلوب (سبايدرمان، باربي، ستيتش، سونيك، موانا)", key: "design_theme", type: "TEXT" as const, required: false },
      ],
    },
    {
      slug: "keychain-lamine-yamal",
      sku: "DD-KC-002",
      name: "Lamine Yamal FC Barcelona Custom Name Keychain",
      arabicName: "ميدالية لامين يامال - برشلونة مخصصة بالاسم",
      description: "Custom acrylic keychain featuring Lamine Yamal (Barcelona #19) personalized with your child's name.",
      arabicDescription: "ميدالية أكريليك مميزة بتصميم لامين يامال ونادي برشلونة رقم 19، مخصصة باسم طفلك بجودة طباعة فائقة ومقاومة للماء.",
      price: 70,
      stock: 100,
      image: "/products/keychains/keychain-lamine-yamal.jpeg",
      fields: [
        { label: "اسم الطفل المكتوب على الميدالية", key: "child_name", type: "TEXT" as const, required: true },
      ],
    },
    {
      slug: "keychain-cristiano-ronaldo",
      sku: "DD-KC-003",
      name: "Cristiano Ronaldo Real Madrid Ballon d'Or Custom Name Keychain",
      arabicName: "ميدالية كريستيانو رونالدو - الكرة الذهبية مخصصة بالاسم",
      description: "Luxury custom acrylic keychain featuring Cristiano Ronaldo with Ballon d'Or and Real Madrid logo, personalized with child's name.",
      arabicDescription: "ميدالية أكريليك فاخرة للأسطورة كريستيانو رونالدو بشعار ريال مدريد والكرة الذهبية، مخصصة باسم طفلك.",
      price: 70,
      stock: 100,
      image: "/products/keychains/keychain-cristiano-ronaldo.jpeg",
      fields: [
        { label: "اسم الطفل المكتوب على الميدالية", key: "child_name", type: "TEXT" as const, required: true },
      ],
    },
  ];

  for (const item of keychains) {
    const existing = await prisma.product.findUnique({
      where: { slug: item.slug },
      include: { images: true, customizationFields: true },
    });

    if (existing) {
      console.log(`Updating existing product ${item.slug}...`);
      await prisma.product.update({
        where: { id: existing.id },
        data: {
          name: item.name,
          arabicName: item.arabicName,
          price: item.price,
          stock: item.stock,
          published: true,
          categoryId: category.id,
          description: item.description,
          arabicDescription: item.arabicDescription,
        },
      });

      // Update image
      if (existing.images.length === 0) {
        await prisma.productImage.create({
          data: {
            productId: existing.id,
            url: item.image,
            alt: item.arabicName,
            position: 0,
          },
        });
      } else {
        await prisma.productImage.update({
          where: { id: existing.images[0].id },
          data: { url: item.image, alt: item.arabicName },
        });
      }
    } else {
      console.log(`Creating product ${item.slug}...`);
      await prisma.product.create({
        data: {
          slug: item.slug,
          sku: item.sku,
          name: item.name,
          arabicName: item.arabicName,
          description: item.description,
          arabicDescription: item.arabicDescription,
          price: item.price,
          stock: item.stock,
          lowStockThreshold: 5,
          featured: false,
          customizable: true,
          published: true,
          categoryId: category.id,
          tags: ["stickers", "ميدالية", "تيكت وليبل وميدالية", "Daisy Designs", "أطفال"],
          images: {
            create: [
              { position: 0, url: item.image, alt: item.arabicName },
            ],
          },
          customizationFields: {
            create: item.fields.map((f, pos) => ({
              position: pos,
              label: f.label,
              key: f.key,
              type: f.type,
              required: f.required,
              maxLength: 100,
            })),
          },
        },
      });
    }
  }

  // Also point old dummy stitch-product-21 or keychain to category stickers if present
  await prisma.product.updateMany({
    where: { slug: { in: ["stitch-product-21", "keychain"] } },
    data: { categoryId: category.id, published: false },
  });

  console.log("All keychains synchronized successfully!");
}

main()
  .catch((err) => {
    console.error("Sync failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

