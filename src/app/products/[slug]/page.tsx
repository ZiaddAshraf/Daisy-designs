import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/commerce";
import { getPublishedProduct, isDemoMode, toStorefrontProduct } from "@/lib/catalog";
import { getDemoProducts } from "@/lib/demo-catalog-data";
import { isDatabaseUnavailable, prisma } from "@/lib/prisma";
import { DatabaseUnavailable } from "@/components/database-state";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    let product: Awaited<ReturnType<typeof getPublishedProduct>> = null;
    let unavailable = false;
    try {
        product = await getPublishedProduct(slug);
    } catch (error) {
        if (isDatabaseUnavailable(error)) unavailable = true;
        else throw error;
    }
    if (unavailable) return <main className="catalog-page"><DatabaseUnavailable message="لا يمكن تحميل هذا المنتج الآن" /></main>;
    if (!product) notFound();

    let relatedRows: Parameters<typeof toStorefrontProduct>[0][] = [];
    let reviewCount = 0;
    let reviewAverage = 0;
    try {
        if (isDemoMode()) {
            relatedRows = getDemoProducts().filter(item => item.categoryId === product.categoryId && item.id !== product.id).slice(0, 4);
        } else {
        const [related, reviewStats] = await Promise.all([
            prisma.product.findMany({ where: { published: true, categoryId: product.categoryId, id: { not: product.id } }, include: { images: { orderBy: { position: "asc" }, take: 1 }, category: true }, orderBy: { createdAt: "desc" }, take: 4 }),
            prisma.review.aggregate({ where: { productId: product.id, status: "APPROVED" }, _avg: { rating: true }, _count: { _all: true } }),
        ]);
        relatedRows = related;
        reviewCount = reviewStats._count._all;
        reviewAverage = reviewStats._avg.rating ?? 0;
        }
    } catch (error) {
        if (!isDatabaseUnavailable(error)) throw error;
    }

    return <ProductDetail
        key={product.id}
        product={toStorefrontProduct(product)}
        images={product.images.map(image => ({ url: image.url, alt: image.alt }))}
        variants={product.variants.map(variant => ({ id: variant.id, name: variant.name, price: variant.price, stock: variant.stock, options: variant.options }))}
        customizationFields={product.customizationFields}
        stock={product.stock}
        lowStockThreshold={product.lowStockThreshold}
        sku={product.sku}
        categorySlug={product.category.slug}
        reviews={product.reviews.map(review => ({ rating: review.rating, title: review.title, comment: review.comment }))}
        reviewCount={reviewCount}
        reviewAverage={reviewAverage}
        relatedProducts={relatedRows.map(toStorefrontProduct)}
    />;
}
