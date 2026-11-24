import Link from "next/link";
import type { Metadata } from "next";
import { ToppersPreview } from "@/components/toppers-preview";
import { getPublishedProduct } from "@/lib/catalog";
import { isDatabaseUnavailable } from "@/lib/prisma";
import { getRequestLocale } from "@/lib/locale-server";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return {
    title: `${locale === "ar" ? "باكدج توبرز بصورة الطفل (32 صورة)" : "Child Photo Cupcake Toppers Kit"} | Daisy Designs`,
    description:
      locale === "ar"
        ? "باكدج توبرز كب كيك مخصص بصورة الطفل: 32 صورة مطبوعة على شيت + شمعة لزق + 3 ورقات فوم جليتر ملون + 5 أعواد ملونة + كيس أعواد خشبية."
        : "Personalized child photo cupcake toppers kit with 32 printed photos, glue stick, glitter foam sheets, and sticks.",
  };
}

export default async function ToppersCategoryPage() {
  const locale = await getRequestLocale();
  let product: Awaited<ReturnType<typeof getPublishedProduct>> = null;
  try {
    product = await getPublishedProduct("custom-cupcake-toppers");
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
        <span>{locale === "ar" ? "باكدج التوبرز" : "Cupcake Toppers"}</span>
      </nav>
      <ToppersPreview locale={locale} price={product?.price ?? 200} inStock={product ? product.stock > 0 : true} />
    </main>
  );
}
