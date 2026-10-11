"use client";

import Link from "next/link";
import { ProductCard, useWishlist } from "@/components/storefront";

export default function WishlistPage() { const { items } = useWishlist(); return <main className="commerce-page mx-auto max-w-[1400px] px-6 py-16 lg:px-16"><p className="text-xs tracking-[.2em] text-neutral-400">DAISY DESIGNS / WISHLIST</p><h1 className="mt-3 text-4xl font-semibold">المفضلة</h1>{items.length ? <div className="catalog-product-grid mt-12 grid grid-cols-2 gap-x-3 gap-y-12 md:grid-cols-4">{items.map(product => <ProductCard key={product.slug} product={product} />)}</div> : <div className="commerce-empty-state border-y border-neutral-200 py-24 text-center text-neutral-500"><p>لم تضيفي منتجات إلى المفضلة بعد.</p><Link href="/products" className="mt-6 inline-block text-neutral-950 underline">اكتشفي المنتجات</Link></div>}</main>; }
