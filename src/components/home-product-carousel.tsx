"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { ProductCard, useTranslation } from "@/components/storefront";
import { getCarouselScrollDelta, type CarouselAction } from "@/lib/home-carousel";
import type { Product } from "@/lib/products";
import { useReducedMotion } from "motion/react";

export function HomeProductCarousel({ products }: { products: Product[] }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const t = useTranslation();

  function scroll(action: CarouselAction) {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const direction = getComputedStyle(viewport).direction === "rtl" ? "rtl" : "ltr";
    const left = getCarouselScrollDelta(direction, action, viewport.clientWidth);
    viewport.scrollBy({ left, behavior: reduceMotion ? "instant" : "smooth" });
  }

  return <div className="daisy-product-carousel">
    <div className="daisy-product-carousel__controls" role="group" aria-label={t("carouselGroup")}>
      <button type="button" onClick={() => scroll("previous")} aria-label={t("previousFeaturedProducts")}><ChevronRight size={18} aria-hidden="true" /></button>
      <button type="button" onClick={() => scroll("next")} aria-label={t("nextFeaturedProducts")}><ChevronLeft size={18} aria-hidden="true" /></button>
    </div>
    <div className="daisy-product-carousel__viewport" ref={viewportRef} role="region" aria-label={t("featuredProducts")} tabIndex={0}>
      <div className="daisy-product-carousel__track" data-scroll-reveal-stagger>
        {products.map(product => <div className="daisy-product-carousel__slide" key={product.slug}>
          <ProductCard product={product} editorial />
        </div>)}
      </div>
    </div>
  </div>;
}
