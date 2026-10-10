/* eslint-disable react/no-unescaped-entities */
"use client";

import Link from "next/link";
import { ProductCard, useWishlist } from "@/components/storefront";

export default function WishlistPage() { const { items } = useWishlist(); return <main className="mx-auto max-w-[1400px] px-6 py-16 lg:px-16"><p className="text-xs tracking-[.2em] text-neutral-400">DAISY DESIGNS / WISHLIST</p><h1 className="mt-3 text-4xl font-semibold">ا�"�.فض�"ة</h1>{items.length ? <div className="mt-12 grid grid-cols-2 gap-x-3 gap-y-12 md:grid-cols-4">{items.map(product => <ProductCard key={product.slug} product={product} />)}</div> : <div className="border-y border-neutral-200 py-24 text-center text-neutral-500"><p>�"�. تضف �.�?تجات إ�"�? ا�"�.فض�"ة بعد.</p><Link href="/products" className="mt-6 inline-block text-neutral-950 underline">ا�fتشف ا�"�.�?تجات</Link></div>}</main>; }
