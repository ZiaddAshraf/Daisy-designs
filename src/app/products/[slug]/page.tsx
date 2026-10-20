import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
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
import stickersData from "@/data/stickers-product.json";
import rewardCardsData from "@/data/reward-cards-product.json";
import storyData from "@/data/story-product.json";
import tshirtData from "@/data/tshirt-product.json";

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

type CoreFallbackProduct = {
    id: string;
    slug: string;
    name: string;
    arabicName: string;
    description: string;
    arabicDescription: string;
    stock: number;
    tags: string[];
    category: {
        id: string;
        slug: string;
        name: string;
        arabicName: string;
    };
};

function getCoreFallbackProduct(slug: string): CoreFallbackProduct | null {
    if (slug === "reward-cards-box-set") {
        return {
            id: "reward-cards-box-set",
            slug: "reward-cards-box-set",
            name: rewardCardsData.product.name,
            arabicName: rewardCardsData.product.arabicName,
            description: rewardCardsData.product.description,
            arabicDescription: rewardCardsData.product.arabicDescription,
            stock: rewardCardsData.product.stock,
            tags: ["reward-cards"],
            category: {
                id: "reward-cards",
                slug: "reward-cards",
                name: rewardCardsData.category.name,
                arabicName: rewardCardsData.category.arabicName,
            },
        };
    }
    if (slug === "custom-waterproof-stickers") {
        return {
            id: "custom-waterproof-stickers",
            slug: "custom-waterproof-stickers",
            name: stickersData.product.name,
            arabicName: stickersData.product.arabicName,
            description: stickersData.product.description,
            arabicDescription: stickersData.product.arabicDescription,
            stock: stickersData.product.stock,
            tags: ["stickers"],
            category: {
                id: "stickers",
                slug: "stickers",
                name: stickersData.category.name,
                arabicName: stickersData.category.arabicName,
            },
        };
    }
    if (slug === "first-year-at-school") {
        return {
            id: "first-year-at-school",
            slug: "first-year-at-school",
            name: storyData.product.name,
            arabicName: storyData.product.arabicName,
            description: storyData.product.description,
            arabicDescription: storyData.product.arabicDescription,
            stock: storyData.product.stock,
            tags: ["customized-stories"],
            category: {
                id: "customized-stories",
                slug: "customized-stories",
                name: storyData.category.name,
                arabicName: storyData.category.arabicName,
            },
        };
    }
    if (slug === "custom-printed-tshirt") {
        return {
            id: "custom-printed-tshirt",
            slug: "custom-printed-tshirt",
            name: tshirtData.product.name,
            arabicName: tshirtData.product.arabicName,
            description: tshirtData.product.description,
            arabicDescription: tshirtData.product.arabicDescription,
            stock: tshirtData.product.stock,
            tags: ["printed-t-shirts"],
            category: {
                id: "printed-t-shirts",
                slug: "printed-t-shirts",
                name: tshirtData.category.name,
                arabicName: tshirtData.category.arabicName,
            },
        };
    }
    return null;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const [{ slug }, locale] = await Promise.all([params, getRequestLocale()]);
    if (slug.startsWith("sticker-")) {
        return {
            title: `استيكرات مدرسية مخصصة | Daisy Designs`,
            description: stickersData.product.arabicDescription,
        };
    }
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

    const fallback = getCoreFallbackProduct(resolvedSlug);
    if (fallback) {
        const localizedName = selectLocalizedText(locale, fallback.name, fallback.arabicName);
        return {
            title: `${localizedName} | Daisy Designs`,
            description: selectLocalizedText(locale, fallback.description, fallback.arabicDescription),
        };
    }

    return { title: getTranslation(locale, "productNotFound"), description: getTranslation(locale, "productNotFoundHelp") };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const locale = await getRequestLocale();
    const { slug } = await params;
    if (slug.startsWith("sticker-")) {
        const match = slug.match(/^sticker-(\d+)/);
        const designId = match ? match[1] : "0";
        redirect(`/products/custom-waterproof-stickers?design=${designId}`);
    }
    const resolvedSlug = PRODUCT_SLUG_ALIASES[slug] ?? slug;
    let product: Awaited<ReturnType<typeof getPublishedProduct>> | CoreFallbackProduct | null = null;
    let unavailable = false;
    try {
        product = await getPublishedProduct(resolvedSlug);
    } catch (error) {
        if (isDatabaseUnavailable(error)) unavailable = true;
        else throw error;
    }

    if (!product) {
        const fallback = getCoreFallbackProduct(resolvedSlug);
        if (fallback) {
            product = fallback;
            unavailable = false;
        }
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

    if (!("categoryId" in product)) {
        notFound();
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
