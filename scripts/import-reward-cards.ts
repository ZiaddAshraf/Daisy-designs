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
  slug: "reward-cards",
  name: "Reward Cards",
  arabicName: "كروت التشجيع",
  description:
    "A curated collection of heartwarming affirmation and reward cards, thoughtfully crafted as daily uplifting surprises for lunchboxes, desks, or a joyful gift for little ones.",
  image: "/products/reward-cards/reward-cards-box-set.jpeg",
  published: true,
};

const PRODUCT_PAYLOAD = {
  slug: "reward-cards-box-set",
  name: "Daisy Designs Reward Cards Box Set",
  arabicName: "علبة كروت التشجيع",
  description:
    "An exclusive collection of 10 inspiring, heartwarming affirmation and reward cards in a beautifully branded Daisy Designs keepsake box. Thoughtfully created as daily uplifting surprises for lunchboxes, study desks, or a delightful gift for little ones.",
  arabicDescription:
    "مجموعة حصرية من كروت التحفيز الملهمة تضم 10 كروت متنوعة ورسائل إيجابية دافئة داخل علبة هدايا أنيقة بشعار Daisy Designs. صُممت لتكون لمسة جميلة للمكتب، أو مفاجأة يومية مبهجة داخل اللانش بوكس والحقيبة المدرسية، أو هدية تُسعد من تحب.",
  price: 200,
  compareAtPrice: null,
  sku: "DD-RC-010",
  stock: 50,
  lowStockThreshold: 5,
  featured: true,
  bestSeller: false,
  newArrival: true,
  customizable: false,
  published: true,
  tags: ["reward-cards", "كروت التشجيع", "Daisy Designs", "أطفال"],
};

const IMAGES = [
  { position: 0, url: "/products/reward-cards/reward-cards-box-set.jpeg", alt: "Daisy Designs Reward Cards Keepsake Box / علبة كروت التشجيع والتحفيز" },
  { position: 1, url: "/products/reward-cards/card-01-you-can-do-it.jpeg", alt: "You can do it! / أنت تستطيع!" },
  { position: 2, url: "/products/reward-cards/card-02-bee-happy.jpeg", alt: "BEE HAPPY / كن سعيداً" },
  { position: 3, url: "/products/reward-cards/card-03-youre-a-superstar.jpeg", alt: "YOU'RE A SUPERSTAR / أنت نجم ساطع" },
  { position: 4, url: "/products/reward-cards/card-04-sprinkles-ice-cream.jpeg", alt: "You're the Sprinkles to my ice cream! / أنت حلوى الآيس كريم" },
  { position: 5, url: "/products/reward-cards/card-05-berry-berry-much.jpeg", alt: "I love you Soooooo... BERRY BERRY MUCH! / أحبك كثيراً جداً" },
  { position: 6, url: "/products/reward-cards/card-06-have-a-good-day.jpeg", alt: "Have a good day! / أتمنى لك يوماً جميلاً" },
  { position: 7, url: "/products/reward-cards/card-07-happy-as-a-hippo.jpeg", alt: "HAPPY AS A HIPPO / سعيد ومبتهج كفرس النهر" },
  { position: 8, url: "/products/reward-cards/card-08-you-are-affirmations.jpeg", alt: "YOU ARE Kind, Brave, Smart / توكيدات إيجابية" },
  { position: 9, url: "/products/reward-cards/card-09-never-give-up.jpeg", alt: "Never give up / لا تستسلم أبداً" },
  { position: 10, url: "/products/reward-cards/card-10-i-love-you.jpeg", alt: "I LOVE YOU / أنا أحبك" },
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
    console.log(`  Images   [11 assets in public/products/reward-cards/]: Sync positions 0-10`);
    console.log(`  Price:   200 EGP per complete box`);
    console.log(`  Stock:   50 complete boxes`);
    console.log(`  SKU:     DD-RC-010 (internal only)`);

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

        // Delete existing images to recreate with correct positions
        await tx.productImage.deleteMany({ where: { productId } });
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

      await tx.productImage.createMany({
        data: IMAGES.map((img) => ({
          productId,
          url: img.url,
          alt: img.alt,
          position: img.position,
        })),
      });
      console.log(`Created ${IMAGES.length} product images for Product: ${productId}`);
    });

    const totalCount = await prisma.product.count();
    console.log(`\nApply completed successfully! Total products in database: ${totalCount}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error("Failed to import reward cards:", err);
  process.exit(1);
});
