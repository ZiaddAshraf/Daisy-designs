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
  slug: "customized-stories",
  name: "Customized Stories",
  arabicName: "قصص مخصصة",
  description:
    "Imaginative personalized stories featuring your child's photo, with themes chosen to build confidence, imagination, and a lifelong love of reading.",
  image: "/products/customized-stories/first-year-at-school/cover.jpeg",
  published: true,
};

const PRODUCT_PAYLOAD = {
  slug: "first-year-at-school",
  name: "Daisy Designs First Year at School Storybook",
  arabicName: "قصة أول سنة في المدرسة",
  description:
    "An inspiring personalized children's storybook crafted with care by Daisy Designs. Starring your child with their uploaded photograph integrated into a beautifully printed keepsake paper book. Fixed narrative celebrating friendship, confidence, and courage on their first year at school.",
  arabicDescription:
    "قصة أطفال ملهمة ومصممة بحب من Daisy Designs. تضع طفلك بطلاً للقصة من خلال رفع صورته لتُطبع داخل كتاب ورقي فاخر يبقى ذكرى لا تُنسى. نصوص ورسومات ثابتة ومحفزة تروي تفاصيل أول سنة في المدرسة بمشاعر الحماس والثقة بالنفس والصداقة.",
  price: 200,
  compareAtPrice: null,
  sku: "DD-ST-001",
  stock: 50,
  lowStockThreshold: 5,
  featured: true,
  bestSeller: false,
  newArrival: true,
  customizable: true,
  published: true,
  tags: ["customized-stories", "قصص مخصصة", "أول سنة في المدرسة", "Daisy Designs", "أطفال"],
};

const IMAGES = [
  { position: 0, url: "/products/customized-stories/first-year-at-school/cover.jpeg", alt: "Daisy Designs First Year at School Storybook Cover / غلاف قصة أول سنة في المدرسة" },
  { position: 1, url: "/products/customized-stories/first-year-at-school/page-01.jpeg", alt: "Page 1: Good Morning! / صباح الخير!" },
  { position: 2, url: "/products/customized-stories/first-year-at-school/page-02.jpeg", alt: "Page 2: The School Bus / باص المدرسة" },
  { position: 3, url: "/products/customized-stories/first-year-at-school/page-03.jpeg", alt: "Page 3: Warm Welcome / الترحيب في المدرسة" },
  { position: 4, url: "/products/customized-stories/first-year-at-school/page-04.jpeg", alt: "Page 4: Classroom Activities / أنشطة الفصل" },
  { position: 5, url: "/products/customized-stories/first-year-at-school/page-05.jpeg", alt: "Page 5: Recess & Friends / وقت البريك واللعب" },
  { position: 6, url: "/products/customized-stories/first-year-at-school/page-06.jpeg", alt: "Page 6: Lunchbox Surprise / وجبة اللانش بوكس" },
  { position: 7, url: "/products/customized-stories/first-year-at-school/page-07.jpeg", alt: "Page 7: Back Home / العودة للمنزل" },
  { position: 8, url: "/products/customized-stories/first-year-at-school/page-08.jpeg", alt: "Page 8: Self-Belief Affirmations / توكيدات الثقة بالنفس" },
  { position: 9, url: "/products/customized-stories/first-year-at-school/back-cover.jpeg", alt: "Back Cover: Daisy Designs Branding / الغلاف الخلفي" },
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
    console.log(`  Images   [10 assets in public/products/customized-stories/first-year-at-school/]: Sync positions 0-9`);
    console.log(`  Price:   200 EGP per physical printed storybook`);
    console.log(`  Stock:   50 books`);
    console.log(`  SKU:     DD-ST-001 (internal only)`);
    console.log(`  Customization: child_photo (IMAGE, required)`);

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
      console.log(`Synced ${IMAGES.length} product images for positions 0-9`);

      // Sync Customization Field: child_photo (required IMAGE)
      await tx.customizationField.deleteMany({ where: { productId } });
      await tx.customizationField.create({
        data: {
          productId,
          key: "child_photo",
          label: "صورة الطفل المرفوعة",
          type: "IMAGE",
          required: true,
          position: 0,
        },
      });
      console.log(`Synced required child_photo customization field`);
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

