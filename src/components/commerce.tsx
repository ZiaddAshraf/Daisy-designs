"use client";

import Image from "@/components/site-image";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowLeft, Minus, Plus, ShieldCheck, Truck } from "lucide-react";
import type { Product } from "@/lib/products";
import { formatPrice } from "@/lib/products";
import { ProductCard, WishlistButton, useCart } from "@/components/storefront";
import { getProductGalleryImage, type ProductGalleryImage } from "@/lib/product-gallery";

type CustomizationField = { label: string; key: string; type: string; required: boolean; placeholder: string | null; maxLength: number | null; options: { label: string; value: string }[] };
type ReviewSummary = { rating: number; title: string; comment: string };
type ProductVariant = { id: string; name: string; price: number | null; stock: number; options: unknown };

export function ProductDetail({ product, images = [], variants = [], customizationFields = [], stock = 0, lowStockThreshold = 5, sku, categorySlug, reviews = [], reviewCount = 0, reviewAverage = 0, relatedProducts = [] }: {
  product: Product;
  images?: ProductGalleryImage[];
  variants?: ProductVariant[];
  customizationFields?: CustomizationField[];
  stock?: number;
  lowStockThreshold?: number;
  sku?: string;
  categorySlug?: string;
  reviews?: ReviewSummary[];
  reviewCount?: number;
  reviewAverage?: number;
  relatedProducts?: Product[];
}) {
  const { add } = useCart();
  const [customization, setCustomization] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const selectedVariant = variants.find(variant => variant.id === selectedVariantId);
  const selectedStock = selectedVariant ? selectedVariant.stock : variants.length ? 0 : stock;
  const outOfStock = selectedStock <= 0;
  const needsVariant = variants.length > 0;
  const unsupportedRequiredField = customizationFields.some(field => field.required && (field.type === "IMAGE" || (["SELECT", "COLOR", "SIZE"].includes(field.type) && field.options.length === 0)));
  const unsupportedImageField = customizationFields.some(field => field.type === "IMAGE");
  const selectedFields = customizationFields.filter(field => customization[field.key]);
  const availability = needsVariant && !selectedVariant
    ? variants.every(variant => variant.stock <= 0) ? "نفدت جميع الخيارات" : "اختاري الخيار أولًا"
    : outOfStock ? "غير متوفر حاليًا" : selectedStock <= lowStockThreshold ? "كمية محدودة" : "متوفر";
  const currentPrice = selectedVariant?.price ?? product.price;
  const galleryImages = images;
  const activeImage = getProductGalleryImage(galleryImages, selectedImage);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!event.currentTarget.reportValidity() || outOfStock || (needsVariant && !selectedVariant) || unsupportedRequiredField) return;
    add({ ...product, price: currentPrice }, customization, selectedVariant ? { id: selectedVariant.id, name: selectedVariant.name, stock: selectedVariant.stock } : undefined, quantity);
    setAdded(true);
  };

  return <main className="product-detail-page">
    <nav className="catalog-breadcrumb" aria-label="مسار التنقل"><Link href="/">الرئيسية</Link><span>/</span><Link href="/products">المنتجات</Link>{categorySlug && <><span>/</span><Link href={`/categories/${categorySlug}`}>{product.category}</Link></>}<span>/</span><span>{product.name}</span></nav>
    <div className="product-detail-layout">
      <div className="product-detail-gallery">
        <div className="product-detail-media">
          <Image src={activeImage?.url ?? "/daisy-designs.png"} alt="Daisy Designs" fill priority sizes="(max-width: 760px) 100vw, 54vw" className="daisy-image" />
        </div>
        {galleryImages.length > 1 && <div className="product-gallery-thumbnails" role="group" aria-label="صور المنتج">{galleryImages.map((image, index) => <button key={`${image.url}-${index}`} type="button" className={`product-gallery-thumbnail ${selectedImage === index ? "is-selected" : ""}`} aria-label={`عرض صورة ${index + 1} من ${galleryImages.length}`} aria-pressed={selectedImage === index} onClick={() => setSelectedImage(index)}><Image src={image.url} alt="" fill sizes="88px" className="daisy-image" /></button>)}</div>}
      </div>
      <div className="product-detail-content">
        <p className="eyebrow">{product.category}</p>
        <h1>{product.name}</h1>
        <div className="product-detail-price"><strong>{formatPrice(currentPrice)}</strong>{currentPrice === product.price && product.compareAtPrice && <del>{formatPrice(product.compareAtPrice)}</del>}</div>
        <p className={`product-availability ${outOfStock ? "status-error" : stock <= lowStockThreshold ? "status-warning" : "status-success"}`} role="status">{availability}</p>
        <p className="product-detail-description">{product.description}</p>
        {sku && <p className="product-sku">رمز المنتج: <span dir="ltr">{sku}</span></p>}

        <form className="product-purchase-form" onSubmit={handleSubmit}>
          {needsVariant && <fieldset className="product-variants"><legend>اختاري الخيار</legend><div className="product-variant-list">{variants.map(variant => <label key={variant.id} className={`product-variant-option ${selectedVariantId === variant.id ? "is-selected" : ""} ${variant.stock <= 0 ? "is-unavailable" : ""}`}><input type="radio" name="product-variant" value={variant.id} checked={selectedVariantId === variant.id} disabled={variant.stock <= 0} onChange={() => { setSelectedVariantId(variant.id); setQuantity(1); setAdded(false); }} /><span>{variant.name}</span><small>{variant.stock <= 0 ? "نفد المخزون" : variant.price !== null && variant.price !== product.price ? formatPrice(variant.price) : "متوفر"}</small></label>)}</div></fieldset>}
          {product.customizable && customizationFields.length > 0 && <fieldset className="product-customization"><legend>خصصي هذا المنتج</legend><p className="product-customization-hint">أدخلي التفاصيل المطلوبة ليُصنع خصيصًا لطفلك.</p>
            {customizationFields.filter(field => field.type !== "IMAGE").map(field => <label key={field.key} className="product-custom-field" htmlFor={`custom-${field.key}`}><span>{field.label}{field.required && <b aria-label="مطلوب"> *</b>}</span>
              {["SELECT", "COLOR", "SIZE"].includes(field.type) ? <select id={`custom-${field.key}`} required={field.required} value={customization[field.key] ?? ""} onChange={event => { setCustomization(current => ({ ...current, [field.key]: event.target.value })); setAdded(false); }}><option value="">اختاري {field.label}</option>{field.options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : <input id={`custom-${field.key}`} type="text" required={field.required} value={customization[field.key] ?? ""} onChange={event => { setCustomization(current => ({ ...current, [field.key]: event.target.value })); setAdded(false); }} placeholder={field.placeholder ?? "اكتبي هنا"} maxLength={field.maxLength ?? undefined} />}
            </label>)}
            {unsupportedImageField && <p className="product-customization-hint" role="status">رفع الصور أو اختيار صورة مخصصة غير متاح لهذا المنتج حاليًا.</p>}
            {unsupportedRequiredField && <p className="product-customization-hint" role="alert">لا يمكن إتمام الطلب لأن أحد خيارات التخصيص المطلوبة غير مدعوم حاليًا.</p>}
            {selectedFields.length > 0 && <div className="product-selection-summary" aria-live="polite"><span>اختياراتك</span>{selectedFields.map(field => <p key={field.key}>{field.label}: {field.options.find(option => option.value === customization[field.key])?.label ?? customization[field.key]}</p>)}</div>}
          </fieldset>}
          <div className="product-purchase-row"><div className="product-quantity" aria-label="الكمية"><button type="button" onClick={() => setQuantity(value => Math.max(1, value - 1))} aria-label="تقليل الكمية" disabled={quantity <= 1}><Minus size={14} /></button><output>{quantity}</output><button type="button" onClick={() => setQuantity(value => Math.min(Math.max(selectedStock, 1), value + 1))} aria-label="زيادة الكمية" disabled={!selectedStock || quantity >= selectedStock}><Plus size={14} /></button></div><button type="submit" className="daisy-button daisy-button--dark product-add-button" disabled={outOfStock || (needsVariant && !selectedVariant) || unsupportedRequiredField}>{needsVariant && !selectedVariant ? variants.every(variant => variant.stock <= 0) ? "نفد من المخزون" : "اختاري الخيار" : outOfStock ? "نفد من المخزون" : "أضيفي إلى السلة"}<ArrowLeft size={16} /></button><div className="product-wishlist-action"><WishlistButton product={product} /></div></div>
          {added && <p className="product-added-message status-success" role="status">أُضيف المنتج إلى سلتك مع اختياراتك.</p>}
        </form>
        <div className="product-service-notes"><span><Truck size={16} /> توصيل لجميع المحافظات</span><span><ShieldCheck size={16} /> الدفع عند الاستلام</span></div>
      </div>
    </div>
    {reviewCount > 0 && <section className="product-reviews"><div className="product-subheading"><p className="eyebrow">تجارب حقيقية</p><h2>آراء العائلات</h2><span>{"★"} {reviewAverage.toFixed(1)} · {reviewCount} تقييم</span></div><div className="product-review-list">{reviews.map((review, index) => <article key={`${review.title}-${index}`}><p className="product-review-stars" aria-label={`${review.rating} من 5 نجوم`}>{"★".repeat(review.rating)}</p><h3>{review.title}</h3><p>{review.comment}</p></article>)}</div>{reviewCount > reviews.length && <p className="product-review-preview">عرض أحدث {reviews.length} من أصل {reviewCount} تقييمات معتمدة.</p>}</section>}
    {relatedProducts.length > 0 && <section className="product-related"><div className="product-subheading"><p className="eyebrow">من نفس العالم</p><h2>قد يعجبك أيضًا</h2></div><div className="daisy-product-grid">{relatedProducts.map(related => <ProductCard key={related.slug} product={related} editorial />)}</div></section>}
  </main>;
}

export function CartView() {
  const { items, update, remove } = useCart();
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return <main className="mx-auto max-w-[1000px] px-6 py-16 lg:px-0"><p className="text-xs tracking-[.2em] text-neutral-400">DAISY DESIGNS / السلة</p><h1 className="mt-3 text-4xl font-semibold">سلة التسوق</h1>{items.length === 0 ? <div className="border-y border-neutral-200 py-24 text-center"><p className="text-neutral-500">السلة فارغة حاليًا</p><Link href="/products" className="mt-6 inline-flex bg-neutral-950 px-6 py-3 text-sm text-white">اكتشف المنتجات</Link></div> : <div className="mt-12 grid gap-12 md:grid-cols-[1fr_320px]"><div>{items.map(item => <div key={item.lineId} className="flex gap-4 border-t border-neutral-200 py-5"><div className="relative h-28 w-24 bg-neutral-100"><Image src={item.image} alt={item.name} fill sizes="96px" className="object-cover" /></div><div className="flex flex-1 flex-col justify-between"><div><p>{item.name}</p>{item.variantName && <p className="mt-1 text-xs text-neutral-400">{item.variantName}</p>}{item.customization && Object.entries(item.customization).map(([key, value]) => <p key={key} className="mt-1 text-xs text-neutral-400">{key}: {value}</p>)}</div><div className="flex items-center justify-between"><div className="flex items-center gap-3 border border-neutral-200 px-3 py-1"><button onClick={() => update(item.lineId, -1)}><Minus size={13} /></button>{item.quantity}<button onClick={() => update(item.lineId, 1)}><Plus size={13} /></button></div><button onClick={() => remove(item.lineId)} className="text-xs text-neutral-400 underline">حذف</button><span>{formatPrice(item.price * item.quantity)}</span></div></div></div>)}</div><div className="h-fit border-t border-neutral-950 pt-5"><div className="flex justify-between"><span>الإجمالي</span><strong>{formatPrice(total)}</strong></div><Link href="/checkout" className="mt-6 flex justify-center bg-neutral-950 py-4 text-sm text-white">متابعة الدفع</Link></div></div>}</main>;
}
