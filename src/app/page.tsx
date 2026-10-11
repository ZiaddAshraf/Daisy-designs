import Image from "@/components/site-image";
import Link from "next/link";
import { ArrowLeft, ArrowUpLeft } from "lucide-react";
import { PRODUCT_IMAGE_PLACEHOLDER } from "@/lib/product-image";
import { getCatalogCategories, getCatalogPage, toStorefrontProduct } from "@/lib/catalog";
import { isDatabaseUnavailable } from "@/lib/prisma";
import { HeroTextReveal, SectionReveal } from "@/components/home-motion";
import { HomeProductCarousel } from "@/components/home-product-carousel";

export const dynamic = "force-dynamic";

const editorialImage = "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=1800&q=90";

export default async function Home() {
  let products: ReturnType<typeof toStorefrontProduct>[] = [];
  let categories: { id: string; name: string; arabicName: string; slug: string; image: string | null; _count: { products: number } }[] = [];
  let databaseAvailable = true;

  try {
    const [catalog, categoryRows] = await Promise.all([
      getCatalogPage({ limit: "8", sort: "best-selling" }),
      getCatalogCategories(4),
    ]);
    products = catalog.items.map(toStorefrontProduct);
    categories = categoryRows;
  } catch (error) {
    if (!isDatabaseUnavailable(error)) throw error;
    databaseAvailable = false;
  }

  const personalizedProduct = products.find(product => product.customizable && product.image);

  return <main className="daisy-home">
    <section className="daisy-hero" aria-labelledby="hero-title">
      <HeroTextReveal className="daisy-hero__copy">
        <p className="eyebrow">DAISY DESIGNS <span> / </span> MADE PERSONAL</p>
        <h1 id="hero-title">مصنوع باسمهم.<br /><em>ومصمم ليشبههم.</em></h1>
        <p className="daisy-hero__intro">منتجات يومية مخصصة للأطفال، بتفاصيل صنعت خصيصًا لهم.</p>
        <div className="daisy-hero__actions">
          <Link href="/products" className="daisy-button daisy-button--dark">اكتشف المنتجات <ArrowLeft size={16} /></Link>
          <Link href="/products?customizable=true" className="daisy-text-link">ابدأ التخصيص <ArrowUpLeft size={16} /></Link>
        </div>
        <span className="daisy-hero__index">مجموعة يومهم / ٠١</span>
      </HeroTextReveal>
      <div className="daisy-hero__image">
        <Image src={editorialImage} alt="طفلة تستعد ليومها بحقيبتها المدرسية" fill priority sizes="(max-width: 760px) 100vw, 60vw" className="daisy-image daisy-editorial-photo" />
        <span className="daisy-image-caption">أيامهم الأولى، بتفاصيل تخصهم</span>
      </div>
    </section>

    <SectionReveal className="daisy-intro" labelledBy="intro-title">
      <div className="daisy-intro__heading">
        <p className="eyebrow">مصمم بعناية في مصر</p>
        <h2 id="intro-title">أشياء صغيرة.<br /><em>تفاصيل تخصهم.</em></h2>
      </div>
      <div className="daisy-intro__image">
        <Image src={personalizedProduct?.image ?? PRODUCT_IMAGE_PLACEHOLDER} alt={personalizedProduct ? personalizedProduct.name : "تفاصيل منتج مخصص للأطفال"} fill sizes="(max-width: 760px) 100vw, 24vw" className="daisy-image" />
      </div>
      <div className="daisy-intro__body">
        <p>نصمم منتجات يومية تحمل أسماءهم، وترافقهم في المدرسة، والبيت، وكل تفاصيل يومهم.</p>
        <Link href="/about" className="daisy-text-link">تعرفي على دايزي <ArrowUpLeft size={16} /></Link>
      </div>
    </SectionReveal>

    <section className="daisy-categories" aria-labelledby="categories-title">
      <header className="daisy-section-heading">
        <div><p className="eyebrow">اختيارات مدروسة</p><h2 id="categories-title">اختار عالمهم</h2></div>
        <div className="daisy-section-heading__aside"><p>كل ما يحتاجه يومهم،<br />بلمسة شخصية.</p><Link href="/categories" aria-label="عرض كل الأقسام" className="daisy-round-link"><ArrowUpLeft size={19} /></Link></div>
      </header>
      {!databaseAvailable ? <p className="daisy-empty">الأقسام غير متاحة الآن. حاولي مرة أخرى بعد قليل.</p> : categories.length ? <div className="daisy-category-grid">
        {categories.map((category, index) => <Link href={`/categories/${category.slug}`} key={category.id} className={`daisy-category daisy-category--${index + 1}`}>
          <div className="daisy-category__image"><Image src={category.image ?? PRODUCT_IMAGE_PLACEHOLDER} alt="Daisy Designs" fill sizes={index === 0 ? "(max-width: 760px) 100vw, 52vw" : "(max-width: 760px) 48vw, 24vw"} className="daisy-image" /></div>
          <div className="daisy-category__label"><span>{category.arabicName}</span><span className="daisy-category__count">{String(category._count.products).padStart(2, "0")}</span></div>
        </Link>)}
      </div> : <p className="daisy-empty">ستظهر الأقسام هنا قريبًا.</p>}
    </section>

    <section className="daisy-personalization" aria-labelledby="personal-title">
      <div className="daisy-personalization__visual">
        {personalizedProduct?.image ? <Image src={personalizedProduct.image} alt={`منتج مخصص: ${personalizedProduct.name}`} fill sizes="(max-width: 760px) 100vw, 50vw" className="daisy-image" /> : <Image src={PRODUCT_IMAGE_PLACEHOLDER} alt="تفاصيل منتجات مصممة للأطفال" fill sizes="(max-width: 760px) 100vw, 50vw" className="daisy-image" />}
        <span className="daisy-personalization__stamp">MADE<br />FOR THEM</span>
      </div>
      <div className="daisy-personalization__copy">
        <p className="eyebrow">التفاصيل تبدأ منهم</p>
        <h2 id="personal-title">كل قطعة<br /><em>تبدأ باسم.</em></h2>
        <p className="daisy-personalization__description">اختاري المنتج، اكتبي اسم طفلك، واختاري التصميم الذي يشبهه.</p>
        <ol className="daisy-steps">
          <li><span>٠١</span><span>اختاري منتجك</span></li>
          <li><span>٠٢</span><span>خصّصيه باسم طفلك</span></li>
          <li><span>٠٣</span><span>استلمي منتجك</span></li>
        </ol>
        <Link href="/products?customizable=true" className="daisy-text-link">ابدأ التخصيص <ArrowLeft size={16} /></Link>
      </div>
    </section>

    <SectionReveal className="daisy-featured" labelledBy="featured-title">
      <header className="daisy-section-heading">
        <div><p className="eyebrow">اختيرت ليومهم</p><h2 id="featured-title">مختاراتنا</h2></div>
        <Link href="/products" className="daisy-text-link">اكتشفي كل المنتجات <ArrowLeft size={16} /></Link>
      </header>
      {!databaseAvailable ? <p className="daisy-empty">المنتجات غير متاحة الآن. حاولي مرة أخرى بعد قليل.</p> : products.length ? <HomeProductCarousel products={products.slice(0, 8)} /> : <p className="daisy-empty">لا توجد منتجات منشورة حاليًا.</p>}
    </SectionReveal>

    <SectionReveal className="daisy-story" labelledBy="story-title">
      <div className="daisy-story__image"><Image src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1400&q=90" alt="طفل يبتسم في لحظة من يومه" fill sizes="(max-width: 760px) 100vw, 56vw" className="daisy-image daisy-editorial-photo" /></div>
      <div className="daisy-story__copy"><p className="eyebrow">حكاية دايزي</p><h2 id="story-title">أكثر من<br />مجرد منتج.</h2><p>الأشياء الصغيرة التي تحمل أسماءهم، تصبح جزءًا من حكايتهم.</p><Link href="/about" className="daisy-text-link">اعرف قصتنا <ArrowLeft size={16} /></Link></div>
    </SectionReveal>

    <section className="daisy-cta">
      <p className="eyebrow">DAISY DESIGNS <span> / </span> PERSONALIZED FOR THEM</p>
      <div className="daisy-cta__row"><h2>جاهز تخلي<br /><em>أغراضهم تشبههم؟</em></h2><Link href="/products?customizable=true" className="daisy-button daisy-button--light">ابدأ التخصيص <ArrowLeft size={16} /></Link></div>
      <span className="daisy-cta__mark" aria-hidden="true">D.</span>
    </section>
  </main>;
}
