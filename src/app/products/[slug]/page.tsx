import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/commerce";
import { RewardCardsPreview } from "@/components/reward-cards-preview";
import { StickersPreview } from "@/components/stickers-preview";
import { StoryBookPreview } from "@/components/story-book-preview";
import { TShirtPreview } from "@/components/tshirt-preview";
import { getPublishedProduct, isDemoMode, selectLocalizedText, toStorefrontProduct } from "@/lib/catalog";
import { getDemoProducts } from "@/lib/demo-catalog-data";
import { isDatabaseUnavailable, prisma } from "@/lib/prisma";
import { DatabaseUnavailable } from "@/components/database-state";
import { getTranslation, type TranslationKey } from "@/lib/i18n/messages";
import { getRequestLocale } from "@/lib/locale-server";
import { DEMO_CATALOG_MARKER } from "@/lib/demo-preview-safety";

const PRODUCT_SLUG_ALIASES: Record<string, string> = {
    "stickers": "custom-waterproof-stickers",
    "school-stickers": "custom-waterproof-stickers",
    "reward-cards": "reward-cards-box-set",
    "cards": "reward-cards-box-set",
    "customized-stories": "first-year-at-school",
    "story": "first-year-at-school",
    "first-year-school": "first-year-at-school",
    "printed-t-shirts": "custom-printed-tshirt",
    "t-shirts": "custom-printed-tshirt",
    "t-shirt": "custom-printed-tshirt",
    "tshirts": "custom-printed-tshirt",
    "tshirt": "custom-printed-tshirt",
    "custom-tshirt": "custom-printed-tshirt",
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const [{ slug }, locale] = await Promise.all([params, getRequestLocale()]);
    const resolvedSlug = PRODUCT_SLUG_ALIASES[slug] ?? slug;
    try {
        const product = await getPublishedProduct(resolvedSlug);
        if (product) {
            const localizedName = selectLocalizedText(locale, product.name, product.arabicName);
            const productName = product.tags.includes(DEMO_CATALOG_MARKER) ? localizedName.replace(/^DEMO — /, "") : localizedName;
            return {
            title: `${productName} | Daisy Designs`,
            description: selectLocalizedText(locale, product.description, product.arabicDescription),
            };
        }
    } catch (error) { if (!isDatabaseUnavailable(error)) throw error; }
    return { title: getTranslation(locale, "productNotFound"), description: getTranslation(locale, "productNotFoundHelp") };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const locale = await getRequestLocale();
    const { slug } = await params;
    const resolvedSlug = PRODUCT_SLUG_ALIASES[slug] ?? slug;
    let product: Awaited<ReturnType<typeof getPublishedProduct>> = null;
    let unavailable = false;
    try {
        product = await getPublishedProduct(resolvedSlug);
    } catch (error) {
        if (isDatabaseUnavailable(error)) unavailable = true;
        else throw error;
    }
    if (unavailable) return <main className="catalog-page"><DatabaseUnavailable messageKey="productUnavailable" /></main>;
    if (!product) notFound();

    if (resolvedSlug === "reward-cards-box-set") {
        const t = (key: TranslationKey) => getTranslation(locale, key);
        return <main className="catalog-page">
            <nav className="catalog-breadcrumb" aria-label={t("breadcrumb")}>
                <Link href="/">{t("home")}</Link>
                <span>/</span>
                <Link href="/categories">{t("categoriesHeading")}</Link>
                <span>/</span>
                <Link href="/categories/reward-cards">{selectLocalizedText(locale, product.category.name, product.category.arabicName)}</Link>
                <span>/</span>
                <span>{selectLocalizedText(locale, product.name, product.arabicName)}</span>
            </nav>
            <RewardCardsPreview locale={locale} inStock={product.stock > 0} />
        </main>;
    }

    if (resolvedSlug === "custom-waterproof-stickers") {
        const t = (key: TranslationKey) => getTranslation(locale, key);
        return <main className="catalog-page">
            <nav className="catalog-breadcrumb" aria-label={t("breadcrumb")}>
                <Link href="/">{t("home")}</Link>
                <span>/</span>
                <Link href="/categories">{t("categoriesHeading")}</Link>
                <span>/</span>
                <Link href="/categories/stickers">{selectLocalizedText(locale, product.category.name, product.category.arabicName)}</Link>
                <span>/</span>
                <span>{selectLocalizedText(locale, product.name, product.arabicName)}</span>
            </nav>
            <StickersPreview locale={locale} inStock={product.stock > 0} />
        </main>;
    }

    if (resolvedSlug === "first-year-at-school") {
        const t = (key: TranslationKey) => getTranslation(locale, key);
        return <main className="catalog-page">
            <nav className="catalog-breadcrumb" aria-label={t("breadcrumb")}>
                <Link href="/">{t("home")}</Link>
                <span>/</span>
                <Link href="/categories">{t("categoriesHeading")}</Link>
                <span>/</span>
                <Link href="/categories/customized-stories">{selectLocalizedText(locale, product.category.name, product.category.arabicName)}</Link>
                <span>/</span>
                <span>{selectLocalizedText(locale, product.name, product.arabicName)}</span>
            </nav>
            <StoryBookPreview locale={locale} inStock={product.stock > 0} />
        </main>;
    }

    if (resolvedSlug === "custom-printed-tshirt") {
        return <main className="catalog-page">
            <TShirtPreview locale={locale} inStock={product.stock > 0} />
        </main>;
    }

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
        product={toStorefrontProduct(product, locale)}
        images={product.images.map(image => ({ url: image.url, alt: image.alt }))}
        variants={product.variants.map(variant => ({ id: variant.id, name: variant.name, price: variant.price, stock: variant.stock, options: variant.options }))}
        customizationFields={product.customizationFields}
        stock={product.stock}
        lowStockThreshold={product.lowStockThreshold}
        categorySlug={product.category.slug}
        reviews={product.reviews.map(review => ({ rating: review.rating, title: review.title, comment: review.comment }))}
        reviewCount={reviewCount}
        reviewAverage={reviewAverage}
        relatedProducts={relatedRows.map(related => toStorefrontProduct(related, locale))}
    />;
}
