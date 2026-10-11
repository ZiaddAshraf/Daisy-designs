import Image from "@/components/site-image";
import Link from "next/link";
import { DatabaseUnavailable } from "@/components/database-state";
import { PRODUCT_IMAGE_PLACEHOLDER } from "@/lib/product-image";
import { getCatalogCategories } from "@/lib/catalog";
import { isDatabaseUnavailable } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export default async function CategoriesPage() {
  let categories: { id: string; slug: string; name: string; arabicName: string; image: string | null; _count: { products: number } }[] = [];
  let unavailable = false;
  try { categories = await getCatalogCategories(); }
  catch (error) { if (isDatabaseUnavailable(error)) unavailable = true; else throw error; }
  if (unavailable) return <main className="catalog-page"><DatabaseUnavailable message="لا يمكن تحميل الأقسام الآن" /></main>;
  return <main className="catalog-page"><header className="catalog-page__heading"><div><p className="eyebrow">DAISY DESIGNS / الأقسام</p><h1>تسوّقي حسب عالمهم</h1><p>اختيارات يومية بتفاصيل شخصية.</p></div></header>{categories.length ? <div className="catalog-category-grid">{categories.map((category, index) => <Link key={category.id} href={`/categories/${category.slug}`} className={`catalog-category catalog-category--${index % 4}`}><div className="catalog-category__image"><Image src={category.image ?? PRODUCT_IMAGE_PLACEHOLDER} alt="Daisy Designs" fill sizes="(max-width: 760px) 50vw, 25vw" className="daisy-image" /></div><div className="catalog-category__meta"><h2>{category.arabicName}</h2><span>{category._count.products} منتج</span></div></Link>)}</div> : <section className="catalog-empty"><h2>الأقسام ستظهر هنا قريبًا</h2><Link href="/products" className="daisy-button daisy-button--dark">اكتشفي المنتجات</Link></section>}</main>;
}
