import Link from "next/link";
import type { Metadata } from "next";
import { BannerPreview } from "@/components/banner-preview";
import { getPublishedProduct } from "@/lib/catalog";
import { isDatabaseUnavailable } from "@/lib/prisma";
import { getRequestLocale } from "@/lib/locale-server";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return {
    title: `${locale === "ar" ? "بانرز الاحتفالات (1.5*1.5 متر)" : "Celebration Banners (1.5x1.5m)"} | Daisy Designs`,
    description:
      locale === "ar"
        ? "بانر مخصص مقاس 1.5*1.5 متر: ابعتيلنا صورة الطفل والـ theme المفضل وهنعملك أجمل بانر!"
        : "Custom 1.5x1.5m celebration banners personalized with child's photo and favorite theme.",
  };
}

export default async function WallBannersPage() {
  const locale = await getRequestLocale();
  let product: Awaited<ReturnType<typeof getPublishedProduct>> = null;
  try {
    product = await getPublishedProduct("custom-birthday-banner");
  } catch (error) {
    if (!isDatabaseUnavailable(error)) throw error;
  }

  return (
    <main className="catalog-page">
      <nav className="catalog-breadcrumb" aria-label={locale === "ar" ? "مسار التصفح" : "Breadcrumb"}>
        <Link href="/">{locale === "ar" ? "الرئيسية" : "Home"}</Link>
        <span>/</span>
        <Link href="/categories">{locale === "ar" ? "الأقسام" : "Categories"}</Link>
        <span>/</span>
        <Link href="/categories/banners">{locale === "ar" ? "بانرز وتوبرز" : "Banners & Toppers"}</Link>
        <span>/</span>
        <span>{locale === "ar" ? "بانرز الاحتفالات" : "Celebration Banners"}</span>
      </nav>
      <BannerPreview locale={locale} price={product?.price ?? 600} inStock={product ? product.stock > 0 : true} />
    </main>
  );
}
