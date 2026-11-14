import Link from "next/link";
import type { Metadata } from "next";
import { KeychainExamples } from "@/components/keychain-examples";
import { getRequestLocale } from "@/lib/locale-server";
import { ensureKeychainCatalogProducts } from "@/lib/ensure-catalog-product";
import { isDatabaseUnavailable } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return { title: `${locale === "ar" ? "الميداليات" : "Keychains"} | Daisy Designs` };
}

export default async function KeychainsPage() {
  const locale = await getRequestLocale();
  try { await ensureKeychainCatalogProducts(); }
  catch (error) { if (!isDatabaseUnavailable(error)) throw error; }

  return <main className="catalog-page">
    <nav className="catalog-breadcrumb" aria-label={locale === "ar" ? "مسار التصفح" : "Breadcrumb"}>
      <Link href="/">{locale === "ar" ? "الرئيسية" : "Home"}</Link><span>/</span>
      <Link href="/categories">{locale === "ar" ? "الأقسام" : "Categories"}</Link><span>/</span>
      <Link href="/categories/stickers">{locale === "ar" ? "تيكت وليبل وميدالية" : "Tickets, Labels & Keychains"}</Link><span>/</span>
      <span>{locale === "ar" ? "الميداليات" : "Keychains"}</span>
    </nav>
    <KeychainExamples locale={locale} />
  </main>;
}
