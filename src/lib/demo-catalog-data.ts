import type { Prisma } from "@prisma/client";
import { demoCatalog } from "../../prisma/demo-catalog";

type CategoryRecord = Prisma.CategoryGetPayload<{ include: { _count: { select: { products: true } } } }>;
type CollectionRecord = Prisma.CollectionGetPayload<{ include: { _count: { select: { products: true } } } }>;
type ProductRecord = Prisma.ProductGetPayload<{ include: {
  images: true;
  category: true;
  collection: true;
  variants: true;
  customizationFields: { include: { options: true } };
  reviews: true;
} }>;

const createdAt = new Date("2026-01-01T00:00:00.000Z");
const visibleName = (name: string) => name.replace(/^DEMO — /, "");
const demoCollectionDisplayNames: Record<string, string> = {
  "demo-school-ready": "جاهزون للمدرسة",
  "demo-everyday-personal": "تفاصيل يومية شخصية",
  "demo-thoughtful-gifts": "هدايا بلمسة شخصية",
  "demo-favorites": "اختيارات دايزي",
};

const categories: CategoryRecord[] = demoCatalog.categories.map((category) => ({
  id: category.slug,
  name: visibleName(category.name),
  arabicName: visibleName(category.arabicName),
  slug: category.slug,
  description: category.description,
  image: category.image,
  parentId: null,
  createdAt,
  updatedAt: createdAt,
  published: false,
  _count: { products: demoCatalog.products.filter((product) => product.categorySlug === category.slug).length },
} as CategoryRecord));

const collections: CollectionRecord[] = demoCatalog.collections.map((collection) => ({
  id: collection.slug,
  name: demoCollectionDisplayNames[collection.slug] ?? visibleName(collection.name),
  slug: collection.slug,
  description: collection.description,
  image: collection.image,
  createdAt,
  updatedAt: createdAt,
  published: false,
  seoDescription: collection.seoDescription,
  seoTitle: collection.seoTitle,
  _count: { products: demoCatalog.products.filter((product) => product.collectionSlug === collection.slug).length },
} as CollectionRecord));

const products: ProductRecord[] = demoCatalog.products.map((product) => {
  const id = product.slug;
  const category = categories.find((item) => item.slug === product.categorySlug)!;
  const collection = collections.find((item) => item.slug === product.collectionSlug)!;
  return {
    id,
    name: product.name,
    arabicName: product.arabicName,
    slug: product.slug,
    description: product.description,
    arabicDescription: product.arabicDescription,
    tags: product.tags,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    sku: product.sku,
    stock: product.stock,
    lowStockThreshold: product.lowStockThreshold,
    featured: product.featured,
    bestSeller: product.bestSeller,
    newArrival: product.newArrival,
    customizable: product.customizable,
    published: false,
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
    categoryId: category.id,
    collectionId: collection.id,
    createdAt,
    updatedAt: createdAt,
    category,
    collection,
    images: product.images.map((image, index) => ({ id: `${id}-image-${index}`, productId: id, ...image, position: index })),
    variants: product.variants.map((variant, index) => ({ id: `${id}-variant-${index}`, productId: id, ...variant, price: variant.price ?? null })),
    customizationFields: product.customizationFields.map((field, index) => ({
      id: `${id}-field-${index}`,
      productId: id,
      maxLength: field.maxLength ?? null,
      placeholder: field.placeholder ?? null,
      position: index,
      ...field,
      options: field.options.map((option, optionIndex) => ({ id: `${id}-field-${index}-option-${optionIndex}`, fieldId: `${id}-field-${index}`, ...option })),
    })),
    reviews: [],
  } as unknown as ProductRecord;
});

export function getDemoCategories() { return categories; }
export function getDemoCollections() { return collections; }
export function getDemoCategory(slug: string) { return categories.find((category) => category.slug === slug) ?? null; }
export function getDemoCollection(slug: string) { return collections.find((collection) => collection.slug === slug) ?? null; }
export function getDemoProduct(slug: string) { return products.find((product) => product.slug === slug) ?? null; }
export function getDemoProducts() { return products; }

type CatalogFilters = { category?: string; collection?: string; min?: string; max?: string; availability?: string; customizable?: string; sort?: string; page?: string; limit?: string };

function filterProducts(filters: CatalogFilters, query = "") {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  return products.filter((product) => {
    if (filters.category && product.category.slug !== filters.category) return false;
    if (filters.collection && product.collection?.slug !== filters.collection) return false;
    if (filters.min && product.price < Number(filters.min)) return false;
    if (filters.max && product.price > Number(filters.max)) return false;
    if (filters.availability === "in-stock" && product.stock <= 0) return false;
    if (filters.customizable === "true" && !product.customizable) return false;
    if (!normalizedQuery) return true;
    const haystack = [product.name, product.arabicName, product.description, product.arabicDescription, product.sku, ...product.tags, product.category.arabicName]
      .join(" ").toLocaleLowerCase();
    return haystack.includes(normalizedQuery);
  });
}

export function getDemoCatalogPage(filters: CatalogFilters, query = "") {
  const page = Math.max(1, Number(filters.page ?? 1) || 1);
  const limit = Math.min(48, Math.max(1, Number(filters.limit ?? 12) || 12));
  const matching = filterProducts(filters, query);
  if (filters.sort === "price-asc") matching.sort((a, b) => a.price - b.price);
  else if (filters.sort === "price-desc") matching.sort((a, b) => b.price - a.price);
  else if (filters.sort === "best-selling") matching.sort((a, b) => Number(b.bestSeller) - Number(a.bestSeller));
  const total = matching.length;
  return { items: matching.slice((page - 1) * limit, page * limit), total, page, limit, totalPages: Math.ceil(total / limit) };
}
