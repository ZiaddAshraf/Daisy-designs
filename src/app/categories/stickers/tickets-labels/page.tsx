import Link from "next/link";
import type { Metadata } from "next";
import { StickersCatalogClient } from "@/components/stickers-catalog-client";
import { DatabaseUnavailable } from "@/components/database-state";
import { getPublishedProduct } from "@/lib/catalog";
import { isDatabaseUnavailable } from "@/lib/prisma";
import { ensureStickerPackages } from "@/lib/ensure-sticker-packages";
import { stickerPackageVariants } from "@/lib/product-pricing";
import { getRequestLocale } from "@/lib/locale-server";
import { ensureThermalLabelProduct } from "@/lib/ensure-thermal-label-product";
import { ThermalLabelsCard } from "@/components/thermal-labels-card";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return { title: `${locale === "ar" ? "تيكت وليبل" : "Tickets & Labels"} | Daisy Designs` };
}

export default async function TicketsLabelsPage() {
  const locale = await getRequestLocale();
  let product: Awaited<ReturnType<typeof getPublishedProduct>> = null;
  try {
    await ensureStickerPackages();
    await ensureThermalLabelProduct();
    product = await getPublishedProduct("custom-waterproof-stickers");
  } catch (error) {
    if (!isDatabaseUnavailable(error)) throw error;
  }

  return <main className="catalog-page">
    <nav className="catalog-breadcrumb" aria-label={locale === "ar" ? "مسار التصفح" : "Breadcrumb"}>
      <Link href="/">{locale === "ar" ? "الرئيسية" : "Home"}</Link><span>/</span>
      <Link href="/categories">{locale === "ar" ? "الأقسام" : "Categories"}</Link><span>/</span>
      <Link href="/categories/stickers">{locale === "ar" ? "تيكت وليبل وميدالية" : "Tickets, Labels & Keychains"}</Link><span>/</span>
      <span>{locale === "ar" ? "تيكت وليبل" : "Tickets & Labels"}</span>
    </nav>
    {product ? <StickersCatalogClient locale={locale} catalog={{ price: product.price, stock: product.stock, variants: stickerPackageVariants(product.variants) }} thermalLabelsCard={<ThermalLabelsCard locale={locale} />} /> : <DatabaseUnavailable messageKey="categoryUnavailable" />}
  </main>;
}
