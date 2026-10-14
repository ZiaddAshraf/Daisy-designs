import Image from "@/components/site-image";
import Link from "next/link";
import type { Metadata } from "next";
import { DatabaseUnavailable } from "@/components/database-state";
import { PRODUCT_IMAGE_PLACEHOLDER, getProductImageUrl } from "@/lib/product-image";
import { collectionTextForLocale, getCatalogCollections } from "@/lib/catalog";
import { formatMessage, getTranslation } from "@/lib/i18n/messages";
import { formatLocaleNumber } from "@/lib/locale";
import { getRequestLocale } from "@/lib/locale-server";
import { isDatabaseUnavailable } from "@/lib/prisma";

type Collection = { id: string; name: string; slug: string; description: string | null; image: string | null; _count: { products: number } };
export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return { title: getTranslation(locale, "collectionsHeading"), description: getTranslation(locale, "collectionsMetadata") };
}

export default async function CollectionsPage() {
  const locale = await getRequestLocale();
  let collections: Collection[] = [];
  let unavailable = false;
  try { collections = await getCatalogCollections(); }
  catch (error) { if (isDatabaseUnavailable(error)) unavailable = true; else throw error; }
  if (unavailable) return <main className="catalog-page"><DatabaseUnavailable messageKey="collectionsUnavailable" /></main>;
  const t = (key: "collections" | "collectionsHeading" | "collectionsIntro" | "noCollections" | "browseProductsLink" | "productCount" | "exploreCollection" | "breadcrumb") => getTranslation(locale, key);
  return <main className="catalog-page collections-page">
    <nav className="catalog-breadcrumb" aria-label={t("breadcrumb")}><Link href="/">{getTranslation(locale, "home")}</Link><span aria-hidden="true">/</span><span aria-current="page">{t("collections")}</span></nav>
    <header className="collections-intro" data-scroll-reveal suppressHydrationWarning><div><p className="eyebrow">DAISY DESIGNS / {t("collections")}</p><h1>{t("collectionsHeading")}</h1><p>{t("collectionsIntro")}</p></div></header>
    {collections.length ? <div className="collections-grid" data-scroll-reveal-stagger>{collections.map(collection => {
      const name = collectionTextForLocale(collection.name, locale) ?? collection.name;
      const image = getProductImageUrl(collection.image);
      const isBrandCover = image === PRODUCT_IMAGE_PLACEHOLDER;
      return <Link key={collection.id} href={`/collections/${collection.slug}`} className="collection-card" data-scroll-reveal suppressHydrationWarning>
        <div className={`collection-card__image${isBrandCover ? " collection-card__image--brand" : ""}`}><Image src={image} alt="" fill sizes="(max-width: 760px) 100vw, (max-width: 1100px) 50vw, 50vw" className="daisy-image" />{isBrandCover && <span className="collection-cover-mark" aria-hidden="true"><span>{name.trim().slice(0, 1).toLocaleUpperCase(locale)}</span><small>DAISY DESIGNS / {t("collections")}</small></span>}</div>
        <div className="collection-card__content">
          <div className="collection-card__title"><h2>{name}</h2><span className="collection-card__arrow" aria-hidden="true">↗</span></div>
          {collection.description && <p className="collection-card__description">{collectionTextForLocale(collection.description, locale)}</p>}
          <div className="collection-card__footer"><span>{formatMessage(t("productCount"), { count: formatLocaleNumber(locale, collection._count.products) })}</span><span className="collection-card__cta">{t("exploreCollection")}</span></div>
        </div>
      </Link>;
    })}</div> : <section className="catalog-empty" data-scroll-reveal suppressHydrationWarning><h2>{t("noCollections")}</h2><Link href="/products" className="daisy-button daisy-button--dark">{t("browseProductsLink")}</Link></section>}
  </main>;
}
