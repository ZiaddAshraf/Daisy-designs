import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { Product as StorefrontProduct } from "@/lib/products";

export async function getPublishedProducts() {
    return prisma.product.findMany({ where: { published: true }, include: { images: { orderBy: { position: "asc" }, take: 1 }, category: true, variants: { select: { id: true }, take: 1 } }, orderBy: { createdAt: "desc" } });
}

export async function getPublishedProduct(slug: string) {
    return prisma.product.findFirst({ where: { slug, published: true }, include: { images: { orderBy: { position: "asc" } }, category: true, variants: true, customizationFields: { include: { options: true }, orderBy: { position: "asc" } }, reviews: { where: { status: "APPROVED" }, orderBy: { createdAt: "desc" }, take: 3 } } });
}

export async function getCatalogPage(filters: { category?: string; collection?: string; min?: string; max?: string; availability?: string; customizable?: string; sort?: string; page?: string; limit?: string }) {
    const page = Math.max(1, Number(filters.page ?? 1) || 1);
    const limit = Math.min(48, Math.max(1, Number(filters.limit ?? 12) || 12));
    const where: Prisma.ProductWhereInput = { published: true };
    if (filters.category) where.category = { slug: filters.category };
    if (filters.collection) where.collection = { slug: filters.collection };
    if (filters.min || filters.max) where.price = { ...(filters.min ? { gte: Number(filters.min) } : {}), ...(filters.max ? { lte: Number(filters.max) } : {}) };
    if (filters.availability === "in-stock") where.stock = { gt: 0 };
    if (filters.customizable === "true") where.customizable = true;
    const orderBy: Prisma.ProductOrderByWithRelationInput = filters.sort === "price-asc" ? { price: "asc" } : filters.sort === "price-desc" ? { price: "desc" } : filters.sort === "best-selling" ? { bestSeller: "desc" } : { createdAt: "desc" };
    const [items, total] = await prisma.$transaction([prisma.product.findMany({ where, include: { images: { orderBy: { position: "asc" }, take: 1 }, category: true, variants: { select: { id: true }, take: 1 } }, orderBy, skip: (page - 1) * limit, take: limit }), prisma.product.count({ where })]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export function toStorefrontProduct(product: { slug: string; name: string; price: number; compareAtPrice: number | null; description: string; customizable: boolean; images: { url: string }[]; variants?: { id: string }[]; category?: { arabicName: string } | null; badge?: string }): StorefrontProduct {
    return { slug: product.slug, name: product.name, category: product.category?.arabicName ?? "منتجات مخصصة", price: product.price, compareAtPrice: product.compareAtPrice ?? undefined, image: product.images[0]?.url ?? "/images/placeholder.jpg", description: product.description, customizable: product.customizable, hasVariants: Boolean(product.variants?.length), badge: product.badge };
}
