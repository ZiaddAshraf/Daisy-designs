import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { demoCatalog, DEMO_CATALOG_MARKER } from "../prisma/demo-catalog";
import { validateDemoCatalog } from "./demo-catalog-validation";

type ImportMode = "--dry-run" | "--apply";

function getMode(args: string[]): ImportMode {
  if (args.length === 0) return "--dry-run";
  if (args.length !== 1 || (args[0] !== "--dry-run" && args[0] !== "--apply")) {
    throw new Error("Use exactly one mode: --dry-run or --apply");
  }
  return args[0];
}

function isDemoCategory(row: { slug: string; name: string; description: string | null; published: boolean }) {
  return !row.published && row.slug.startsWith("demo-") && row.name.startsWith("DEMO — ") && row.description?.startsWith(`DEMO DATA ONLY — ${DEMO_CATALOG_MARKER}`);
}

function isDemoCollection(row: { slug: string; name: string; description: string | null; published: boolean }) {
  return !row.published && row.slug.startsWith("demo-") && row.name.startsWith("DEMO — ") && row.description?.startsWith(`DEMO DATA ONLY — ${DEMO_CATALOG_MARKER}`);
}

function isDemoProduct(row: { slug: string; name: string; sku: string; description: string; tags: string[]; published: boolean }) {
  return !row.published && row.slug.startsWith("demo-") && row.name.startsWith("DEMO — ") && row.sku.startsWith("DEMO-DD-") &&
    row.description.startsWith("DEMO DATA ONLY.") && row.tags.includes(DEMO_CATALOG_MARKER);
}

async function importIntoLocalDatabase() {
  if (process.env.NODE_ENV === "production") throw new Error("Production runtime is blocked");
  if (process.env.ALLOW_LOCAL_DEMO_CATALOG_IMPORT !== "YES") {
    throw new Error("Explicit local import acknowledgement is required");
  }
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is missing");

  let target: URL;
  try {
    target = new URL(connectionString);
  } catch {
    throw new Error("DATABASE_URL is invalid");
  }
  const database = decodeURIComponent(target.pathname.replace(/^\//, ""));
  if (!(target.protocol === "postgresql:" || target.protocol === "postgres:") ||
      target.hostname !== "127.0.0.1" || database !== "stitch") {
    throw new Error("Only the verified local 127.0.0.1/stitch database is allowed");
  }

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  try {
    const result = await prisma.$transaction(async (tx) => {
      const categoryActions = new Map<string, "create" | "skip">();
      for (const category of catalog.categories) {
        const existing = await tx.category.findUnique({ where: { slug: category.slug } });
        if (existing && !isDemoCategory(existing)) throw new Error(`Category collision: ${category.slug}`);
        categoryActions.set(category.slug, existing ? "skip" : "create");
      }

      const collectionActions = new Map<string, "create" | "skip">();
      for (const collection of catalog.collections) {
        const existing = await tx.collection.findUnique({ where: { slug: collection.slug } });
        if (existing && !isDemoCollection(existing)) throw new Error(`Collection collision: ${collection.slug}`);
        collectionActions.set(collection.slug, existing ? "skip" : "create");
      }

      const productActions = new Map<string, "create" | "skip">();
      const newProducts = [] as typeof catalog.products;
      for (const product of catalog.products) {
        const [bySlug, bySku] = await Promise.all([
          tx.product.findUnique({ where: { slug: product.slug } }),
          tx.product.findUnique({ where: { sku: product.sku } }),
        ]);
        if (bySlug || bySku) {
          if (!bySlug || !bySku || bySlug.id !== bySku.id || !isDemoProduct(bySlug)) {
            throw new Error(`Product slug/SKU collision: ${product.slug}`);
          }
          productActions.set(product.slug, "skip");
          continue;
        }
        const variantConflict = await tx.productVariant.findFirst({
          where: { sku: { in: product.variants.map(({ sku }) => sku) } },
          select: { sku: true },
        });
        if (variantConflict) throw new Error(`Variant SKU collision: ${product.slug}`);
        newProducts.push(product);
        productActions.set(product.slug, "create");
      }

      for (const category of catalog.categories) {
        if (categoryActions.get(category.slug) === "create") {
          await tx.category.create({ data: category });
        }
      }
      for (const collection of catalog.collections) {
        if (collectionActions.get(collection.slug) === "create") {
          await tx.collection.create({ data: collection });
        }
      }
      for (const product of newProducts) {
        const { categorySlug, collectionSlug, images, variants, customizationFields, ...fields } = product;
        await tx.product.create({
          data: {
            ...fields,
            category: { connect: { slug: categorySlug } },
            collection: { connect: { slug: collectionSlug } },
            images: { create: images },
            variants: { create: variants },
            customizationFields: {
              create: customizationFields.map(({ options, ...field }) => ({ ...field, options: { create: options } })),
            },
          },
        });
      }

      return {
        categoriesCreated: [...categoryActions.values()].filter((action) => action === "create").length,
        collectionsCreated: [...collectionActions.values()].filter((action) => action === "create").length,
        productsCreated: [...productActions.values()].filter((action) => action === "create").length,
        alreadyPresent: [...categoryActions.values(), ...collectionActions.values(), ...productActions.values()].filter((action) => action === "skip").length,
      };
    });
    console.log(`Local add-only import complete: ${result.categoriesCreated} categories, ${result.collectionsCreated} collections, ${result.productsCreated} products created; ${result.alreadyPresent} demo records already present and left unchanged.`);
  } finally {
    await prisma.$disconnect();
  }
}

const mode = getMode(process.argv.slice(2));
const catalog = validateDemoCatalog(demoCatalog);

if (mode === "--dry-run") {
  console.log(`Offline dry run passed: ${catalog.categories.length} unpublished demo categories, ${catalog.collections.length} unpublished demo collections, and ${catalog.products.length} unpublished demo products validated.`);
  console.log("No database connection or writes occurred. Existing-database duplicate checks run only inside the local-only transaction with --apply.");
} else {
  importIntoLocalDatabase().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "";
    const category = message.includes("collision")
      ? "catalog identity collision; existing records were left unchanged"
      : message.includes("acknowledgement")
        ? "explicit local-import acknowledgement is missing"
        : message.includes("Only the verified local")
          ? "target is not the approved local database"
          : message.includes("Production runtime")
            ? "production runtime is blocked"
            : message.includes("DATABASE_URL")
              ? "local database target is missing or invalid"
              : "local database operation failed; details suppressed";
    // Never print database URLs, credentials, or raw database error messages.
    console.error(`Demo import stopped safely: ${category}.`);
    process.exitCode = 1;
  });
}
