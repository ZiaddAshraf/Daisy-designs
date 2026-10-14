"use client";

import Link from "next/link";
import { ProductCard, useTranslation, useWishlist } from "@/components/storefront";

export default function WishlistPage() { const { items } = useWishlist(); const t = useTranslation(); return <main className="commerce-page mx-auto max-w-[1400px] px-6 py-16 lg:px-16"><header data-scroll-reveal suppressHydrationWarning><p className="text-xs tracking-[.2em] text-neutral-400">DAISY DESIGNS / {t("wishlistEyebrow").toUpperCase()}</p><h1 className="mt-3 text-4xl font-semibold">{t("wishlist")}</h1></header>{items.length ? <div className="catalog-product-grid mt-12 grid grid-cols-2 gap-x-3 gap-y-12 md:grid-cols-4" data-scroll-reveal-stagger>{items.map(product => <ProductCard key={product.slug} product={product} />)}</div> : <div className="commerce-empty-state border-y border-neutral-200 py-24 text-center text-neutral-500" data-scroll-reveal suppressHydrationWarning><p>{t("wishlistEmpty")}</p><Link href="/products" className="mt-6 inline-block text-neutral-950 underline">{t("exploreProducts")}</Link></div>}</main>; }
