import { z } from "zod";
import { DEMO_CATALOG_MARKER } from "../prisma/demo-catalog";
import { PRODUCT_IMAGE_PLACEHOLDER } from "../src/lib/product-image";

const optionSchema = z.object({ label: z.string().min(1), value: z.string().min(1) });
const fieldSchema = z.object({
  label: z.string().min(1),
  key: z.string().regex(/^[a-z0-9-]+$/),
  type: z.enum(["TEXT", "SELECT", "COLOR", "SIZE", "IMAGE"]),
  required: z.boolean(),
  placeholder: z.string().optional(),
  maxLength: z.number().int().positive().optional(),
  options: z.array(optionSchema),
});
const variantSchema = z.object({
  name: z.string().min(1),
  sku: z.string().regex(/^DEMO-DD-\d{3}-V\d+$/),
  price: z.number().int().positive().optional(),
  stock: z.number().int().nonnegative(),
  options: z.record(z.string(), z.string()),
});
const imageUrlSchema = z.literal(PRODUCT_IMAGE_PLACEHOLDER);
const imageSchema = z.object({ url: imageUrlSchema, alt: z.string().min(1) });
const categorySchema = z.object({
  slug: z.string().regex(/^demo-[a-z0-9-]+$/),
  name: z.string().startsWith("DEMO — "),
  arabicName: z.string().startsWith("DEMO — "),
  description: z.string().startsWith(`DEMO DATA ONLY —`),
  image: imageUrlSchema,
  published: z.literal(false),
});
const collectionSchema = z.object({
  slug: z.string().regex(/^demo-[a-z0-9-]+$/),
  name: z.string().startsWith("DEMO — "),
  description: z.string().startsWith(`DEMO DATA ONLY —`),
  image: imageUrlSchema,
  published: z.literal(false),
  seoTitle: z.string().startsWith("DEMO — "),
  seoDescription: z.string().startsWith(`DEMO DATA ONLY —`),
});
const productSchema = z.object({
  slug: z.string().regex(/^demo-[a-z0-9-]+$/),
  name: z.string().startsWith("DEMO — "),
  arabicName: z.string().startsWith("DEMO — "),
  description: z.string().startsWith("DEMO DATA ONLY."),
  arabicDescription: z.string().startsWith("بيانات تجريبية فقط"),
  tags: z.array(z.string()).refine((tags) => tags.includes(DEMO_CATALOG_MARKER) && tags.includes("DEMO")),
  price: z.number().int().positive(),
  compareAtPrice: z.null(),
  sku: z.string().regex(/^DEMO-DD-\d{3}$/),
  stock: z.number().int().nonnegative(),
  lowStockThreshold: z.number().int().nonnegative(),
  featured: z.boolean(),
  bestSeller: z.boolean(),
  newArrival: z.boolean(),
  customizable: z.boolean(),
  published: z.literal(false),
  seoTitle: z.string().startsWith("DEMO — "),
  seoDescription: z.string().startsWith("DEMO DATA ONLY —"),
  categorySlug: z.string().regex(/^demo-[a-z0-9-]+$/),
  collectionSlug: z.string().regex(/^demo-[a-z0-9-]+$/),
  images: z.array(imageSchema).min(1),
  variants: z.array(variantSchema),
  customizationFields: z.array(fieldSchema),
});

export const demoCatalogSchema = z.object({
  version: z.literal(1),
  marker: z.literal(DEMO_CATALOG_MARKER),
  disclaimer: z.string().min(40),
  categories: z.array(categorySchema).length(7),
  collections: z.array(collectionSchema).length(4),
  products: z.array(productSchema).length(30),
});

export type ValidatedDemoCatalog = z.infer<typeof demoCatalogSchema>;

export function validateDemoCatalog(input: unknown): ValidatedDemoCatalog {
  const catalog = demoCatalogSchema.parse(input);
  const unique = (values: string[], label: string) => {
    if (new Set(values).size !== values.length) throw new Error(`Duplicate ${label} in demo catalog`);
  };

  unique(catalog.categories.map(({ slug }) => slug), "category slug");
  unique(catalog.collections.map(({ slug }) => slug), "collection slug");
  unique(catalog.products.map(({ slug }) => slug), "product slug");
  unique(catalog.products.map(({ sku }) => sku), "product SKU");

  const variantSkus = catalog.products.flatMap(({ variants }) => variants.map(({ sku }) => sku));
  unique(variantSkus, "variant SKU");
  unique([...catalog.products.map(({ sku }) => sku), ...variantSkus], "SKU");

  const categorySlugs = new Set(catalog.categories.map(({ slug }) => slug));
  const collectionSlugs = new Set(catalog.collections.map(({ slug }) => slug));
  for (const product of catalog.products) {
    if (!categorySlugs.has(product.categorySlug)) throw new Error(`Unknown demo category for ${product.slug}`);
    if (!collectionSlugs.has(product.collectionSlug)) throw new Error(`Unknown demo collection for ${product.slug}`);
    if (product.customizable !== (product.customizationFields.length > 0)) {
      throw new Error(`Customization flag does not match fields for ${product.slug}`);
    }
    unique(product.customizationFields.map(({ key }) => key), `customization key on ${product.slug}`);
    for (const field of product.customizationFields) unique(field.options.map(({ value }) => value), `option value on ${product.slug}.${field.key}`);
  }
  return catalog;
}
