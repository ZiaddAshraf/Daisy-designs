import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import stickersData from "../src/data/stickers-product.json";

type ImportMode = "--dry-run" | "--apply";

function getMode(args: string[]): ImportMode {
  if (args.length === 0) return "--dry-run";
  if (args.length !== 1 || (args[0] !== "--dry-run" && args[0] !== "--apply")) {
    throw new Error("Use exactly one mode: --dry-run or --apply");
  }
  return args[0];
}

const CATEGORY_PAYLOAD = {
  slug: stickersData.category.slug,
  name: stickersData.category.name,
  arabicName: stickersData.category.arabicName,
  description: stickersData.product.description,
  image: stickersData.product.primaryImage.url,
  published: true,
};

const PRODUCT_PAYLOAD = {
  slug: stickersData.product.slug,
  name: stickersData.product.name,
  arabicName: stickersData.product.arabicName,
  description: stickersData.product.description,
  arabicDescription: stickersData.product.arabicDescription,
  price: stickersData.product.price,
  compareAtPrice: stickersData.product.compareAtPrice,
  sku: stickersData.product.sku,
  stock: stickersData.product.stock,
  lowStockThreshold: stickersData.product.lowStockThreshold,
  featured: true,
  bestSeller: false,
  newArrival: true,
  customizable: true,
  published: true,
  tags: ["stickers", "استيكرات", "مدرسة", "Daisy Designs", "أطفال"],
};

const IMAGES = stickersData.product.designs.map((design, index) => ({
  position: index,
  url: design.url,
  alt: `${design.title} / ${design.arabicTitle}`,
}));

const CUSTOMIZATION_FIELDS = [
  {
    key: "design_theme",
    label: "التصميم المختار / Selected Design",
    type: "SELECT" as const,
    required: true,
    placeholder: "اختر التصميم المفضل",
    maxLength: 80,
    position: 0,
    options: stickersData.product.designs.map((design) => ({
      value: design.slug,
      label: `${design.title} - ${design.arabicTitle}`,
    })),
  },
  {
    key: "child_name",
    label: "اسم الطفل / Child Name",
    type: "TEXT" as const,
    required: true,
    placeholder: "مثال: Younis Mohamed أو يونس محمد",
    maxLength: 60,
    position: 1,
    options: [],
  },
  {
    key: "school_name",
    label: "اسم المدرسة / School Name",
    type: "TEXT" as const,
    required: false,
    placeholder: "اسم مدرسة الطفل (اختياري)",
    maxLength: 60,
    position: 2,
    options: [],
  },
  {
    key: "grade",
    label: "الصف الدراسي / Grade",
    type: "TEXT" as const,
    required: false,
    placeholder: "مثال: Year FS2 أو الصف الثاني",
    maxLength: 30,
    position: 3,
    options: [],
  },
  {
    key: "class_name",
    label: "الفصل / Class",
    type: "TEXT" as const,
    required: false,
    placeholder: "مثال: 1B أو فصل النجوم",
    maxLength: 20,
    position: 4,
    options: [],
  },
  {
    key: "parent_phone",
    label: "موبايل ولي الأمر / Parent Phone",
    type: "TEXT" as const,
    required: true,
    placeholder: "01XXXXXXXXX",
    maxLength: 20,
    position: 5,
    options: [],
  },
  {
    key: "child_photo",
    label: "صورة الطفل / Child Photo",
    type: "TEXT" as const,
    required: false,
    placeholder: "رابط الصورة (اختياري)",
    maxLength: 255,
    position: 6,
    options: [],
  },
];

async function main() {
  const mode = getMode(process.argv.slice(2));

  if (process.env.NODE_ENV === "production") {
    throw new Error("Production runtime is blocked");
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is missing");

  const target = new URL(connectionString);
  const database = decodeURIComponent(target.pathname.replace(/^\//, ""));
  if (
    !(target.protocol === "postgresql:" || target.protocol === "postgres:") ||
    !["127.0.0.1", "localhost", "::1"].includes(target.hostname) ||
    database !== "stitch"
  ) {
    throw new Error(`Target is not confirmed local dev database (host: ${target.hostname}, db: ${database})`);
  }

  console.log(`Database Target: ${target.hostname}:${target.port}/${database} (Verified local development)`);
  console.log(`Import Mode: ${mode}`);

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

  try {
    const existingCategory = await prisma.category.findUnique({ where: { slug: CATEGORY_PAYLOAD.slug } });
    const existingProduct = await prisma.product.findUnique({ where: { slug: PRODUCT_PAYLOAD.slug } });
    const existingSku = await prisma.product.findUnique({ where: { sku: PRODUCT_PAYLOAD.sku } });

    if (existingSku && existingProduct && existingSku.id !== existingProduct.id) {
      throw new Error(`SKU collision: SKU ${PRODUCT_PAYLOAD.sku} belongs to another product (${existingSku.slug})`);
    }

    console.log(`\nPlan:`);
    console.log(`  Category [${CATEGORY_PAYLOAD.slug}]: ${existingCategory ? "Update" : "Create"}`);
    console.log(`  Product  [${PRODUCT_PAYLOAD.slug}]: ${existingProduct ? "Update" : "Create"}`);
    console.log(`  Images   [${IMAGES.length} assets in public/products/stickers/]: Sync positions 0-23`);
    console.log(`  Fields   [${CUSTOMIZATION_FIELDS.length} fields]: design_theme, child_name, school_name, grade, class_name, parent_phone, child_photo`);
    console.log(`  Price:   50 EGP per sheet`);
    console.log(`  Stock:   500 sheets (internal only)`);
    console.log(`  SKU:     DD-STK-050 (internal only)`);

    if (mode === "--dry-run") {
      console.log(`\nDry run completed successfully. No changes were made.`);
      return;
    }

    // Apply mode
    const category = await prisma.category.upsert({
      where: { slug: CATEGORY_PAYLOAD.slug },
      update: {
        name: CATEGORY_PAYLOAD.name,
        arabicName: CATEGORY_PAYLOAD.arabicName,
        description: CATEGORY_PAYLOAD.description,
        image: CATEGORY_PAYLOAD.image,
        published: CATEGORY_PAYLOAD.published,
      },
      create: CATEGORY_PAYLOAD,
    });

    const product = await prisma.product.upsert({
      where: { slug: PRODUCT_PAYLOAD.slug },
      update: {
        name: PRODUCT_PAYLOAD.name,
        arabicName: PRODUCT_PAYLOAD.arabicName,
        description: PRODUCT_PAYLOAD.description,
        arabicDescription: PRODUCT_PAYLOAD.arabicDescription,
        price: PRODUCT_PAYLOAD.price,
        compareAtPrice: PRODUCT_PAYLOAD.compareAtPrice,
        sku: PRODUCT_PAYLOAD.sku,
        stock: PRODUCT_PAYLOAD.stock,
        lowStockThreshold: PRODUCT_PAYLOAD.lowStockThreshold,
        featured: PRODUCT_PAYLOAD.featured,
        bestSeller: PRODUCT_PAYLOAD.bestSeller,
        newArrival: PRODUCT_PAYLOAD.newArrival,
        customizable: PRODUCT_PAYLOAD.customizable,
        published: PRODUCT_PAYLOAD.published,
        tags: PRODUCT_PAYLOAD.tags,
        categoryId: category.id,
      },
      create: {
        ...PRODUCT_PAYLOAD,
        categoryId: category.id,
      },
    });

    // Sync Images
    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    await prisma.productImage.createMany({
      data: IMAGES.map((img) => ({
        ...img,
        productId: product.id,
      })),
    });

    // Sync Customization Fields
    await prisma.customizationField.deleteMany({ where: { productId: product.id } });
    for (const field of CUSTOMIZATION_FIELDS) {
      await prisma.customizationField.create({
        data: {
          key: field.key,
          label: field.label,
          type: field.type,
          required: field.required,
          placeholder: field.placeholder,
          maxLength: field.maxLength,
          position: field.position,
          productId: product.id,
          options: field.options.length
            ? {
                create: field.options.map((opt) => ({
                  value: opt.value,
                  label: opt.label,
                })),
              }
            : undefined,
        },
      });
    }

    console.log(`\nImport successfully applied:`);
    console.log(`  Category ID: ${category.id}`);
    console.log(`  Product ID:  ${product.id}`);
    console.log(`  Total Images: ${IMAGES.length}`);
    console.log(`  Total Fields: ${CUSTOMIZATION_FIELDS.length}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});

