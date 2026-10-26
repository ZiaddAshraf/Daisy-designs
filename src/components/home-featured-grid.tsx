"use client";

import Link from "next/link";
import Image from "@/components/site-image";
import { WishlistButton, useLocale } from "@/components/storefront";
import { formatPrice, type Product } from "@/lib/products";
import { getProductImageUrl } from "@/lib/product-image";

export function HomeFeaturedGrid({ products }: { products: Product[] }) {
  const locale = useLocale();

  return (
    <div className="home-featured-grid">
      {products.map((product) => {
        // Keep the catalog's sticker-design navigation into the customizer.
        const designId = product.slug.match(/^sticker-(\d+)/)?.[1] ?? "0";
        const href = product.slug.startsWith("sticker-")
          ? `/products/custom-waterproof-stickers?design=${designId}`
          : `/products/${product.slug}`;

        return (
          <article className="home-featured-card group" key={product.slug}>
            <div className="home-featured-media">
              <Link href={href} aria-label={product.name}>
                <Image
                  src={getProductImageUrl(product.image)}
                  alt={product.name}
                  fill
                  sizes="(max-width: 700px) 50vw, 25vw"
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
              <p className="home-featured-price">{formatPrice(product.price, locale)}</p>
            </div>
          </article>
        );
      })}
    </div>
  );
}
