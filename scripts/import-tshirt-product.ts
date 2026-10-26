import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

type ImportMode = "--dry-run" | "--apply";

function getMode(args: string[]): ImportMode {
  if (args.length === 0) return "--dry-run";
  if (args.length !== 1 || (args[0] !== "--dry-run" && args[0] !== "--apply")) {
    throw new Error("Use exactly one mode: --dry-run or --apply");
  }
  return args[0];
}

const CATEGORY_PAYLOAD = {
  slug: "printed-t-shirts",
  name: "Printed T-Shirts",
  arabicName: "تيشيرتات مطبوعة",
  description:
    "Custom printed children's T-shirts featuring personalized artwork or written ideas on comfortable plain cotton garments.",
  image: "/products/t-shirts/white-tshirt.svg",
  published: true,
};

const PRODUCT_PAYLOAD = {
  slug: "custom-printed-tshirt",
  name: "Daisy Designs Custom Printed Children's T-Shirt",
  arabicName: "تيشيرت أطفال بطباعة مخصصة",
  description:
    "High-quality plain children's T-shirt customized with your requested artwork or written idea. Printed on the center chest with premium vibrant colors. Each order is individually reviewed and confirmed by our team via WhatsApp before production.",
  arabicDescription:
    "تيشيرت أطفال سادة عالي الجودة ومريح، مخصص بطباعة تصميمك الخاص أو فكرتك المكتوبة على منتصف الصدر. تتم مراجعة وتأكيد كل طلب يدوياً من قِبل فريق العمل عبر الواتساب لضمان أفضل جودة قبل بدء الطباعة.",
  price: 450,
  compareAtPrice: null,
  sku: "DD-TS-001",
  stock: 100,
  lowStockThreshold: 5,
  featured: true,
  bestSeller: false,
  newArrival: true,
  customizable: true,
  published: true,
  tags: ["printed-t-shirts", "تيشيرتات مطبوعة", "تيشيرت أطفال", "Daisy Designs", "أطفال"],
};

const IMAGES = [
  { position: 0, url: "/products/t-shirts/white-tshirt.svg", alt: "White Children's T-Shirt / تيشيرت أطفال أبيض" },
  { position: 1, url: "/products/t-shirts/black-tshirt.svg", alt: "Black Children's T-Shirt / تيشيرت أطفال أسود" },
  { position: 2, url: "/products/t-shirts/gray-tshirt.svg", alt: "Gray Children's T-Shirt / تيشيرت أطفال رمادي" },
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
    console.log(`  Images   [3 mockups in public/products/t-shirts/]: Sync positions 0-2`);
    console.log(`  Price:   450 EGP per custom printed children's T-shirt`);
    console.log(`  Stock:   100 units (shared aggregate pool)`);
    console.log(`  SKU:     DD-TS-001 (internal only)`);
    console.log(`  Customization: custom_design_file (IMAGE), custom_design_text (TEXT), garment_color (COLOR), garment_size (SIZE)`);

    if (mode === "--dry-run") {
      console.log(`\nDry run completed successfully. No changes were made to the database.`);
      return;
    }

    // Apply within transaction
    await prisma.$transaction(async (tx) => {
      let categoryId: string;
      if (existingCategory) {
        const cat = await tx.category.update({
          where: { slug: CATEGORY_PAYLOAD.slug },
          data: CATEGORY_PAYLOAD,
        });
        categoryId = cat.id;
        console.log(`Updated Category: ${cat.id}`);
      } else {
        const cat = await tx.category.create({
          data: CATEGORY_PAYLOAD,
        });
        categoryId = cat.id;
        console.log(`Created Category: ${cat.id}`);
      }

      let productId: string;
      if (existingProduct) {
        const prod = await tx.product.update({
          where: { slug: PRODUCT_PAYLOAD.slug },
          data: {
            ...PRODUCT_PAYLOAD,
            categoryId,
          },
        });
        productId = prod.id;
        console.log(`Updated Product: ${prod.id}`);
      } else {
        const prod = await tx.product.create({
          data: {
            ...PRODUCT_PAYLOAD,
            categoryId,
          },
        });
        productId = prod.id;
        console.log(`Created Product: ${prod.id}`);
      }

      // Sync Images
      await tx.productImage.deleteMany({ where: { productId } });
      await tx.productImage.createMany({
        data: IMAGES.map((img) => ({
          productId,
          position: img.position,
          url: img.url,
          alt: img.alt,
        })),
      });
      console.log(`Synced ${IMAGES.length} product images for positions 0-2`);

      // Sync Customization Fields
      await tx.customizationField.deleteMany({ where: { productId } });
      await tx.customizationField.createMany({
        data: [
          {
            productId,
            key: "garment_color",
            label: "لون التيشيرت",
            type: "COLOR",
            required: true,
            position: 0,
          },
          {
            productId,
            key: "garment_size",
            label: "مقاس الطفل",
            type: "SIZE",
            required: true,
            position: 1,
          },
          {
            productId,
            key: "custom_design_file",
            label: "ملف التصميم المرفق",
            type: "IMAGE",
            required: false,
            position: 2,
          },
          {
            productId,
            key: "custom_design_text",
            label: "وصف فكرة التصميم",
            type: "TEXT",
            required: false,
            maxLength: 500,
            position: 3,
          },
        ],
      });
      console.log(`Synced customization fields for custom printed T-shirt`);
    });

    console.log(`\nApply completed successfully!`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});

