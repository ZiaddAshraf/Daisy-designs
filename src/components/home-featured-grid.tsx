"use client";

import Link from "next/link";
import Image from "@/components/site-image";
import { WishlistButton, useLocale } from "@/components/storefront";
import { formatPrice, type Product } from "@/lib/products";
import { getProductImageUrl } from "@/lib/product-image";
import { ArrowLeft, ArrowRight } from "lucide-react";

export function HomeFeaturedGrid({ products }: { products: Product[] }) {
  const locale = useLocale();
  const isAr = locale === "ar";
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  return (
    <div className="home-featured-grid" data-scroll-reveal-stagger>
      {products.map((product) => {
        // Keep the catalog's sticker-design navigation into the customizer.
        const designId = product.slug.match(/^sticker-(\d+)/)?.[1] ?? "0";
        const href = product.slug.startsWith("sticker-")
          ? `/products/custom-waterproof-stickers?design=${designId}`
          : `/products/${product.slug}`;

        const cta = product.slug.includes("tshirt")
          ? (isAr ? "اختاري المقاس والتصميم" : "Choose size & design")
          : product.slug.includes("sticker")
            ? (isAr ? "اختاري الباقة والتصميم" : "Choose package & design")
            : product.slug.includes("school") || product.slug.includes("story")
              ? (isAr ? "خصّصي قصة طفلك" : "Personalize your story")
              : (isAr ? "شوفي تفاصيل المنتج" : "View product details");

        return (
          <article className="home-featured-card group" key={product.slug} data-scroll-reveal="card">
            <div className="home-featured-media">
              <Link href={href} aria-label={product.name}>
                <Image
                  src={getProductImageUrl(product.image)}
                  alt={product.name}
                  fill
                  sizes="(max-width: 900px) 50vw, 25vw"
                  className="home-featured-image transition-transform duration-500 group-hover:scale-105"
                />
              </Link>
              <WishlistButton product={product} />
            </div>
            <div className="home-featured-details">
              <h3 className="home-featured-name">
                <Link href={href} title={product.name} className="transition-colors group-hover:text-teal-700 dark:group-hover:text-teal-400">
                  {product.name}
                </Link>
              </h3>
              <div className="home-featured-footer">
                <p className="home-featured-price">{formatPrice(product.price, locale)}</p>
                <Link
                  href={href}
                  className="home-featured-cta"
                  aria-label={`${cta}: ${product.name}`}
                >
                  <span>{cta}</span>
                  <Arrow size={12} className="shrink-0" />
                </Link>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
