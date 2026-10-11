import Image from "@/components/site-image";
import Link from "next/link";
import { DatabaseUnavailable } from "@/components/database-state";
import { PRODUCT_IMAGE_PLACEHOLDER } from "@/lib/product-image";
import { getCatalogCollections } from "@/lib/catalog";
import { isDatabaseUnavailable } from "@/lib/prisma";

type Collection = { id: string; name: string; slug: string; description: string | null; image: string | null; _count: { products: number } };
export const dynamic = "force-dynamic";
export default async function CollectionsPage() {
  let collections: Collection[] = [];
  let unavailable = false;
  try { collections = await getCatalogCollections(); }
  catch (error) { if (isDatabaseUnavailable(error)) unavailable = true; else throw error; }
  if (unavailable) return <main className="catalog-page"><DatabaseUnavailable message="لا يمكن تحميل المجموعات الآن" /></main>;
  return <main className="catalog-page"><header className="catalog-page__heading"><div><p className="eyebrow">DAISY DESIGNS / المجموعات</p><h1>مجموعات اختيرت بعناية</h1><p>عوالم صغيرة تجمع القطع التي تكمل يومهم.</p></div></header>{collections.length ? <div className="catalog-category-grid">{collections.map((collection, index) => <Link key={collection.id} href={`/collections/${collection.slug}`} className={`catalog-category catalog-category--${index % 4}`}><div className="catalog-category__image"><Image src={collection.image ?? PRODUCT_IMAGE_PLACEHOLDER} alt="Daisy Designs" fill sizes="(max-width: 760px) 50vw, 25vw" className="daisy-image" /></div><div className="catalog-category__meta"><h2>{collection.name}</h2><span>{collection._count.products} منتج</span></div></Link>)}</div> : <section className="catalog-empty"><h2>لا توجد مجموعات منشورة حاليًا</h2><Link href="/products" className="daisy-button daisy-button--dark">تصفحي المنتجات</Link></section>}</main>;
}
