import Image from "@/components/site-image";
import { notFound } from "next/navigation";
import { DEMO_CATALOG_MARKER, isLocalDemoPreviewEnabled } from "@/lib/demo-preview-safety";
import { getProductImageUrl } from "@/lib/product-image";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function LocalDemoPreviewPage() {
  if (!isLocalDemoPreviewEnabled(process.env.NODE_ENV, process.env.DATABASE_URL)) notFound();

  const demoDescription = `DEMO DATA ONLY — ${DEMO_CATALOG_MARKER}`;
  const [categories, collections, products] = await Promise.all([
    prisma.category.findMany({
      where: { slug: { startsWith: "demo-" }, description: { startsWith: demoDescription } },
      orderBy: { arabicName: "asc" },
    }),
    prisma.collection.findMany({
      where: { slug: { startsWith: "demo-" }, description: { startsWith: demoDescription } },
      orderBy: { name: "asc" },
    }),
    prisma.product.findMany({
      where: { slug: { startsWith: "demo-" }, tags: { has: DEMO_CATALOG_MARKER } },
      include: {
        category: { select: { arabicName: true } },
        collection: { select: { name: true } },
        images: { orderBy: { position: "asc" }, take: 1 },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  if ([...categories, ...collections, ...products].some(record => record.published)) notFound();

  return <main className="catalog-page">
    <header className="catalog-page__heading">
      <div>
        <p className="eyebrow">LOCAL DEVELOPMENT / DEMO PREVIEW</p>
        <h1>معاينة كتالوج دايزي</h1>
        <p role="note">بيانات تجريبية خيالية للمعاينة فقط. الأسماء والأسعار والمخزون غير معتمدة للبيع.</p>
      </div>
    </header>

    <section aria-labelledby="demo-categories-title" className="mt-12">
      <div className="product-subheading"><p className="eyebrow">DEMO ONLY</p><h2 id="demo-categories-title">الأقسام ({categories.length})</h2></div>
      <div className="catalog-category-grid">
        {categories.map((category, index) => <article key={category.id} className={`catalog-category catalog-category--${index % 4}`}>
          <div className="catalog-category__image"><Image src={getProductImageUrl(category.image)} alt="Daisy Designs demo placeholder" fill sizes="(max-width: 760px) 50vw, 25vw" className="daisy-image" /></div>
          <div className="catalog-category__meta"><h3>{category.arabicName}</h3><span>DEMO</span></div>
        </article>)}
      </div>
    </section>

    <section aria-labelledby="demo-collections-title" className="mt-16">
      <div className="product-subheading"><p className="eyebrow">DEMO ONLY</p><h2 id="demo-collections-title">المجموعات ({collections.length})</h2></div>
      <div className="catalog-category-grid">
        {collections.map((collection, index) => <article key={collection.id} className={`catalog-category catalog-category--${index % 4}`}>
          <div className="catalog-category__image"><Image src={getProductImageUrl(collection.image)} alt="Daisy Designs demo placeholder" fill sizes="(max-width: 760px) 50vw, 25vw" className="daisy-image" /></div>
          <div className="catalog-category__meta"><h3>{collection.name}</h3><span>DEMO</span></div>
        </article>)}
      </div>
    </section>

    <section aria-labelledby="demo-products-title" className="mt-16">
      <div className="product-subheading"><p className="eyebrow">DEMO ONLY / NOT FOR SALE</p><h2 id="demo-products-title">المنتجات ({products.length})</h2></div>
      <div className="catalog-product-grid">
        {products.map(product => <article key={product.id} className="daisy-product">
          <div className="daisy-product__media"><Image src={getProductImageUrl(product.images[0]?.url)} alt={product.name} fill sizes="(max-width: 760px) 50vw, 25vw" className="daisy-image daisy-product__image--placeholder" /></div>
          <div className="daisy-product__meta"><div><p className="daisy-product__category">{product.category.arabicName} · DEMO</p><h3 className="daisy-product__name">{product.arabicName}</h3><p className="daisy-product__category">{product.collection?.name}</p></div><span className="daisy-product__price">{product.price.toLocaleString("ar-EG")} ج.م</span></div>
          <p className="mt-3 text-xs text-neutral-500">معاينة فقط · غير متاح للشراء</p>
        </article>)}
      </div>
    </section>
  </main>;
}
