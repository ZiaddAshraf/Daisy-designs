import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { Product as StorefrontProduct } from "@/lib/products";
import { getProductImageUrl } from "@/lib/product-image";
import { isDemoModeEnabled } from "@/lib/demo-mode";
import { getDemoCatalogPage, getDemoCategories, getDemoCategory, getDemoCollection, getDemoCollections, getDemoProduct, getDemoProducts } from "@/lib/demo-catalog-data";

export function isDemoMode() { return isDemoModeEnabled(); }

export async function getCatalogCategories(limit?: number) {
    return isDemoMode() ? (limit ? getDemoCategories().slice(0, limit) : getDemoCategories()) : prisma.category.findMany({ where: { published: true }, include: { _count: { select: { products: true } } }, orderBy: { arabicName: "asc" }, ...(limit ? { take: limit } : {}) });
}

export async function getCatalogCollections() {
    return isDemoMode() ? getDemoCollections() : prisma.collection.findMany({ where: { published: true }, include: { _count: { select: { products: true } } }, orderBy: { createdAt: "desc" } });
}

export async function getCatalogCollectionOptions() {
    return isDemoMode() ? [...getDemoCollections()].sort((a, b) => a.name.localeCompare(b.name)) : prisma.collection.findMany({ where: { published: true }, select: { slug: true, name: true }, orderBy: { name: "asc" } });
}

export async function getCatalogCategory(slug: string) {
    return isDemoMode() ? getDemoCategory(slug) : prisma.category.findUnique({ where: { slug, published: true } });
}

export async function getCatalogCollection(slug: string) {
    return isDemoMode() ? getDemoCollection(slug) : prisma.collection.findUnique({ where: { slug, published: true } });
}

export async function getPublishedProducts() {
    if (isDemoMode()) return getDemoProducts();
    return prisma.product.findMany({ where: { published: true }, include: { images: { orderBy: { position: "asc" }, take: 1 }, category: true, variants: { select: { id: true }, take: 1 } }, orderBy: { createdAt: "desc" } });
}

export async function getPublishedProduct(slug: string) {
    if (isDemoMode()) return getDemoProduct(slug);
    return prisma.product.findFirst({ where: { slug, published: true }, include: { images: { orderBy: { position: "asc" } }, category: true, variants: true, customizationFields: { include: { options: true }, orderBy: { position: "asc" } }, reviews: { where: { status: "APPROVED" }, orderBy: { createdAt: "desc" }, take: 3 } } });
}

export async function getCatalogPage(filters: { category?: string; collection?: string; min?: string; max?: string; availability?: string; customizable?: string; sort?: string; page?: string; limit?: string }) {
    if (isDemoMode()) return getDemoCatalogPage(filters);
    const page = Math.max(1, Number(filters.page ?? 1) || 1);
    const limit = Math.min(48, Math.max(1, Number(filters.limit ?? 12) || 12));
    const where: Prisma.ProductWhereInput = { published: true };
    if (filters.category) where.category = { slug: filters.category };
    if (filters.collection) where.collection = { slug: filters.collection };
    if (filters.min || filters.max) where.price = { ...(filters.min ? { gte: Number(filters.min) } : {}), ...(filters.max ? { lte: Number(filters.max) } : {}) };
    if (filters.availability === "in-stock") where.stock = { gt: 0 };
    if (filters.customizable === "true") where.customizable = true;
    const orderBy: Prisma.ProductOrderByWithRelationInput = filters.sort === "price-asc" ? { price: "asc" } : filters.sort === "price-desc" ? { price: "desc" } : filters.sort === "best-selling" ? { bestSeller: "desc" } : { createdAt: "desc" };
    const items = await prisma.product.findMany({ where, include: { images: { orderBy: { position: "asc" }, take: 1 }, category: true, variants: { select: { id: true }, take: 1 } }, orderBy, skip: (page - 1) * limit, take: limit });
    const total = await prisma.product.count({ where });
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export function toStorefrontProduct(product: { slug: string; name: string; arabicName?: string; tags?: string[]; price: number; compareAtPrice: number | null; description: string; arabicDescription?: string; customizable: boolean; images: { url: string }[]; variants?: { id: string }[]; category?: { arabicName: string } | null; badge?: string; featured?: boolean; bestSeller?: boolean; newArrival?: boolean }): StorefrontProduct {
    const demo = product.tags?.includes("DEMO_CATALOG_V1") ?? false;
    const visibleName = demo ? (product.arabicName ?? product.name).replace(/^DEMO — /, "") : product.name;
    const visibleCategory = demo ? product.category?.arabicName?.replace(/^DEMO — /, "") : product.category?.arabicName;
    const badge = product.badge ?? (demo && product.bestSeller ? "اختيار تجريبي" : undefined);
    return { slug: product.slug, name: visibleName, category: visibleCategory ?? "منتجات مخصصة", price: product.price, compareAtPrice: product.compareAtPrice ?? undefined, image: getProductImageUrl(product.images[0]?.url), description: demo ? product.arabicDescription ?? product.description : product.description, customizable: product.customizable, hasVariants: Boolean(product.variants?.length), badge };
}
