"use client";

import Link from "next/link";
import { Heart, Sparkles } from "lucide-react";
import { ProductCard, useLocale, useTranslation, useWishlist } from "@/components/storefront";
import { directionForLocale, formatLocaleNumber } from "@/lib/locale";

export default function WishlistPage() {
    const { items } = useWishlist();
    const t = useTranslation();
    const locale = useLocale();
    const direction = directionForLocale(locale);

    return (
        <main dir={direction} className="commerce-page mx-auto max-w-[1400px] px-4 py-12 sm:px-6 sm:py-16 lg:px-12">
            {/* Breadcrumb Navigation */}
            <nav className="catalog-breadcrumb" aria-label={t("breadcrumb")}>
                <Link href="/">{t("home")}</Link>
                <span>/</span>
                <span className="text-[var(--foreground)] font-medium">{t("wishlist")}</span>
            </nav>

            {/* Page Header */}
            <header className="mt-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-[var(--border)] pb-6" data-scroll-reveal suppressHydrationWarning>
                <div>
                    <p className="text-xs font-semibold tracking-wider text-[var(--muted-foreground)] uppercase">
                        DAISY DESIGNS / {t("wishlistEyebrow").toUpperCase()}
                    </p>
                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
                        {t("wishlist")}
                    </h1>
                </div>
                {items.length > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--muted-foreground)] border border-[var(--border)]">
                        <Heart size={14} className="text-amber-500 fill-amber-500" />
                        <span>{formatLocaleNumber(locale, items.length)} {locale === "ar" ? "منتجات محفوظة" : "saved items"}</span>
                    </span>
                )}
            </header>

            {/* Content Section */}
            {items.length > 0 ? (
                <div className="catalog-product-grid mt-10 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4" data-scroll-reveal-stagger>
                    {items.map(product => (
                        <ProductCard key={product.slug} product={product} editorial />
                    ))}
                </div>
            ) : (
                <div className="mt-12 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-12 sm:p-16 text-center shadow-xs" data-scroll-reveal suppressHydrationWarning>
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[var(--surface-soft)] text-amber-500 border border-[var(--border)]">
                        <Heart size={36} />
                    </div>
                    <h2 className="mt-6 text-2xl font-bold text-[var(--foreground)] sm:text-3xl">
                        {t("emptyWishlistTitle")}
                    </h2>
                    <p className="mt-2 text-sm text-[var(--muted-foreground)] max-w-md mx-auto leading-relaxed">
                        {t("emptyWishlistMessage")}
                    </p>
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                        <Link
                            href="/products/stickers"
                            className="inline-flex items-center gap-2 rounded-xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 px-6 py-3.5 text-sm font-semibold hover:opacity-95 hover:-translate-y-0.5 hover:shadow-md transition-all shadow-sm active:scale-95 cursor-pointer"
                        >
                            <Sparkles size={16} className="text-amber-400" />
                            <span>{t("emptyCartExploreStickers")}</span>
                        </Link>
                        <Link
                            href="/products/reward-cards"
                            className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] px-6 py-3.5 text-sm font-semibold hover:bg-[var(--surface-hover)] hover:-translate-y-0.5 hover:shadow-md transition-all shadow-xs active:scale-95 cursor-pointer"
                        >
                            <span>{t("emptyCartExploreRewardCards")}</span>
                        </Link>
                        <Link
                            href="/products/first-year-at-school"
                            className="inline-flex items-center gap-2 rounded-xl border border-amber-300 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 px-6 py-3.5 text-sm font-semibold hover:bg-amber-100 dark:hover:bg-amber-900/40 hover:-translate-y-0.5 hover:shadow-md transition-all shadow-xs active:scale-95 cursor-pointer"
                        >
                            <span>{t("emptyCartExploreStorybooks")}</span>
                        </Link>
                    </div>
                </div>
            )}
        </main>
    );
}
