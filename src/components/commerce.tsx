"use client";

import Image from "@/components/site-image";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Minus, Plus, ShieldCheck, Truck } from "lucide-react";
import type { Product } from "@/lib/products";
import { formatPrice } from "@/lib/products";
import { getProductImageUrl, PRODUCT_IMAGE_PLACEHOLDER } from "@/lib/product-image";
import { ProductCard, WishlistButton, useCart, useLocale, useTranslation } from "@/components/storefront";
import { formatMessage } from "@/lib/i18n/messages";
import { formatLocaleNumber } from "@/lib/locale";
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
  const { add, demoMode } = useCart();
  const t = useTranslation();
  const locale = useLocale();
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
    ? variants.every(variant => variant.stock <= 0) ? t("allOptionsUnavailable") : t("selectVariantFirst")
    : outOfStock ? t("productUnavailableStock") : selectedStock <= lowStockThreshold ? t("limitedStock") : t("available");
  const displayAvailability = demoMode ? t("previewOnly") : availability;
  const currentPrice = selectedVariant?.price ?? product.price;
  const galleryImages = images.length ? images.map(image => ({ ...image, url: getProductImageUrl(image.url) })) : [{ url: getProductImageUrl(product.image) }];
  const activeImage = getProductGalleryImage(galleryImages, selectedImage);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (demoMode) return;
    if (!event.currentTarget.reportValidity() || outOfStock || (needsVariant && !selectedVariant) || unsupportedRequiredField) return;
    add({ ...product, price: currentPrice }, customization, selectedVariant ? { id: selectedVariant.id, name: selectedVariant.name, stock: selectedVariant.stock } : undefined, quantity);
    setAdded(true);
  };

  return <main className="product-detail-page">
    <nav className="catalog-breadcrumb" aria-label={t("breadcrumb")}><Link href="/">{t("home")}</Link><span>/</span><Link href="/products">{t("catalogTitle")}</Link>{categorySlug && <><span>/</span><Link href={`/categories/${categorySlug}`}>{product.category}</Link></>}<span>/</span><span>{product.name}</span></nav>
    <div className="product-detail-layout">
      <div className="product-detail-gallery" data-scroll-reveal suppressHydrationWarning>
        <div className="product-detail-media">
          <Image src={activeImage?.url ?? PRODUCT_IMAGE_PLACEHOLDER} alt="Daisy Designs" fill priority sizes="(max-width: 760px) 100vw, 54vw" className="daisy-image" />
        </div>
        {galleryImages.length > 1 && <div className="product-gallery-thumbnails" role="group" aria-label={t("productImages")}>{galleryImages.map((image, index) => <button key={`${image.url}-${index}`} type="button" className={`product-gallery-thumbnail ${selectedImage === index ? "is-selected" : ""}`} aria-label={formatMessage(t("showProductImage"), { index: index + 1, total: galleryImages.length })} aria-pressed={selectedImage === index} onClick={() => setSelectedImage(index)}><Image src={image.url} alt="" fill sizes="88px" className="daisy-image" /></button>)}</div>}
      </div>
      <div className="product-detail-content" data-scroll-reveal suppressHydrationWarning>
        <p className="eyebrow">{product.category}</p>
        <h1>{product.name}</h1>
        <div className="product-detail-price"><strong>{formatPrice(currentPrice, locale)}</strong>{currentPrice === product.price && product.compareAtPrice && <del>{formatPrice(product.compareAtPrice, locale)}</del>}</div>
        <p className={`product-availability ${demoMode ? "" : outOfStock ? "status-error" : stock <= lowStockThreshold ? "status-warning" : "status-success"}`} role="status">{displayAvailability}</p>
        <p className="product-detail-description">{product.description}</p>
        {sku && <p className="product-sku">{t("productSku")} <span dir="ltr">{sku}</span></p>}

        {demoMode ? <div className="product-demo-purchase" role="note">{t("demoProductNotice")}</div> : <form className="product-purchase-form" onSubmit={handleSubmit}>
          {needsVariant && <fieldset className="product-variants"><legend>{t("selectVariant")}</legend><div className="product-variant-list">{variants.map(variant => <label key={variant.id} className={`product-variant-option ${selectedVariantId === variant.id ? "is-selected" : ""} ${variant.stock <= 0 ? "is-unavailable" : ""}`}><input type="radio" name="product-variant" value={variant.id} checked={selectedVariantId === variant.id} disabled={variant.stock <= 0} onChange={() => { setSelectedVariantId(variant.id); setQuantity(1); setAdded(false); }} /><span>{variant.name}</span><small>{variant.stock <= 0 ? t("outOfStock") : variant.price !== null && variant.price !== product.price ? formatPrice(variant.price, locale) : t("available")}</small></label>)}</div></fieldset>}
          {product.customizable && customizationFields.length > 0 && <fieldset className="product-customization"><legend>{t("personalizeProduct")}</legend><p className="product-customization-hint">{t("customizationHint")}</p>
            {customizationFields.filter(field => field.type !== "IMAGE").map(field => <label key={field.key} className="product-custom-field" htmlFor={`custom-${field.key}`}><span>{field.label}{field.required && <b aria-label={t("required")}> *</b>}</span>
              {["SELECT", "COLOR", "SIZE"].includes(field.type) ? <select id={`custom-${field.key}`} required={field.required} value={customization[field.key] ?? ""} onChange={event => { setCustomization(current => ({ ...current, [field.key]: event.target.value })); setAdded(false); }}><option value="">{formatMessage(t("chooseFieldOption"), { label: field.label })}</option>{field.options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : <input id={`custom-${field.key}`} type="text" required={field.required} value={customization[field.key] ?? ""} onChange={event => { setCustomization(current => ({ ...current, [field.key]: event.target.value })); setAdded(false); }} placeholder={field.placeholder ?? t("writeHere")} maxLength={field.maxLength ?? undefined} />}
            </label>)}
            {unsupportedImageField && <p className="product-customization-hint" role="status">{t("unsupportedImageCustomization")}</p>}
            {unsupportedRequiredField && <p className="product-customization-hint" role="alert">{t("unsupportedRequiredCustomization")}</p>}
            {selectedFields.length > 0 && <div className="product-selection-summary" aria-live="polite"><span>{t("yourSelections")}</span>{selectedFields.map(field => <p key={field.key}>{field.label}: {field.options.find(option => option.value === customization[field.key])?.label ?? customization[field.key]}</p>)}</div>}
          </fieldset>}
          <div className="product-purchase-row"><div className="product-quantity" aria-label={t("quantity")}><button type="button" onClick={() => setQuantity(value => Math.max(1, value - 1))} aria-label={t("decreaseQuantity")} disabled={quantity <= 1}><Minus size={14} /></button><output>{quantity}</output><button type="button" onClick={() => setQuantity(value => Math.min(Math.max(selectedStock, 1), value + 1))} aria-label={t("increaseQuantity")} disabled={!selectedStock || quantity >= selectedStock}><Plus size={14} /></button></div><button type="submit" className="daisy-button daisy-button--dark product-add-button" disabled={outOfStock || (needsVariant && !selectedVariant) || unsupportedRequiredField}>{needsVariant && !selectedVariant ? variants.every(variant => variant.stock <= 0) ? t("outOfStock") : t("selectVariant") : outOfStock ? t("outOfStock") : t("addToCart")}{locale === "ar" ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}</button><div className="product-wishlist-action"><WishlistButton product={product} /></div></div>
          {added && <p className="product-added-message status-success" role="status">{t("productAddedToCart")}</p>}
        </form>}
        {!demoMode && <div className="product-service-notes"><span><Truck size={16} /> {t("deliveryAllGovernorates")}</span><span><ShieldCheck size={16} /> {t("cashOnDelivery")}</span></div>}
      </div>
    </div>
    {reviewCount > 0 && <section className="product-reviews" data-scroll-reveal suppressHydrationWarning><div className="product-subheading"><p className="eyebrow">{t("genuineExperiences")}</p><h2>{t("familyReviews")}</h2><span aria-label={formatMessage(t("reviewCount"), { count: formatLocaleNumber(locale, reviewCount) })}>{"★"} {formatLocaleNumber(locale, reviewAverage)} · {formatMessage(t("reviewCount"), { count: formatLocaleNumber(locale, reviewCount) })}</span></div><div className="product-review-list">{reviews.map((review, index) => <article key={`${review.title}-${index}`}><p className="product-review-stars" aria-label={formatMessage(t("reviewStars"), { rating: formatLocaleNumber(locale, review.rating) })}>{"★".repeat(review.rating)}</p><h3>{review.title}</h3><p>{review.comment}</p></article>)}</div>{reviewCount > reviews.length && <p className="product-review-preview">{formatMessage(t("recentApprovedReviews"), { shown: formatLocaleNumber(locale, reviews.length), total: formatLocaleNumber(locale, reviewCount) })}</p>}</section>}
    {relatedProducts.length > 0 && <section className="product-related" data-scroll-reveal suppressHydrationWarning><div className="product-subheading"><p className="eyebrow">{t("fromSameWorld")}</p><h2>{t("youMayAlsoLike")}</h2></div><div className="daisy-product-grid" data-scroll-reveal-stagger>{relatedProducts.map(related => <ProductCard key={related.slug} product={related} editorial />)}</div></section>}
  </main>;
}

export function CartView() {
  const { items, update, remove, demoMode } = useCart();
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const locale = useLocale();
  const t = useTranslation();
  if (demoMode) return <main className="commerce-page commerce-page--preview-empty mx-auto max-w-[1000px] px-6 py-16 lg:px-0" data-scroll-reveal suppressHydrationWarning><p className="text-xs tracking-[.2em] text-neutral-400">DAISY DESIGNS / {t("cart")}</p><h1 className="mt-3 text-4xl font-semibold">{t("previewNoPurchase")}</h1><p className="mt-6 max-w-2xl text-neutral-600">{t("previewCartMessage")}</p><Link href="/products" className="mt-8 inline-flex bg-neutral-950 px-6 py-3 text-sm text-white">{t("exploreProducts")}</Link></main>;
  return <main className="commerce-page mx-auto max-w-[1000px] px-6 py-16 lg:px-0" data-scroll-reveal suppressHydrationWarning><p className="text-xs tracking-[.2em] text-neutral-400">DAISY DESIGNS / {t("cart")}</p><h1 className="mt-3 text-4xl font-semibold">{t("cartDrawer")}</h1>{items.length === 0 ? <div className="commerce-empty-state border-y border-neutral-200 py-24 text-center" data-scroll-reveal suppressHydrationWarning><p className="text-neutral-500">{t("emptyCart")}</p><Link href="/products" className="mt-6 inline-flex bg-neutral-950 px-6 py-3 text-sm text-white">{t("exploreProducts")}</Link></div> : <div className="mt-12 grid gap-12 md:grid-cols-[1fr_320px]"><div>{items.map(item => <div key={item.lineId} className="commerce-cart-item flex gap-4 border-t border-neutral-200 py-5"><div className="daisy-cart-item__image relative h-28 w-24 bg-neutral-100"><Image src={getProductImageUrl(item.image)} alt={item.name} fill sizes="96px" className="daisy-image" /></div><div className="flex flex-1 flex-col justify-between"><div><p>{item.name}</p>{item.variantName && <p className="mt-1 text-xs text-neutral-400">{item.variantName}</p>}{item.customization && Object.entries(item.customization).map(([key, value]) => <p key={key} className="mt-1 text-xs text-neutral-400">{key}: {value}</p>)}</div><div className="flex items-center justify-between"><div className="flex items-center gap-3 border border-neutral-200 px-3 py-1"><button onClick={() => update(item.lineId, -1)} aria-label={t("decreaseQuantity")}><Minus size={13} /></button>{item.quantity}<button onClick={() => update(item.lineId, 1)} aria-label={t("increaseQuantity")}><Plus size={13} /></button></div><button onClick={() => remove(item.lineId)} className="text-xs text-neutral-400 underline">{t("remove")}</button><span>{formatPrice(item.price * item.quantity, locale)}</span></div></div></div>)}</div><div className="h-fit border-t border-neutral-950 pt-5"><div className="flex justify-between"><span>{t("total")}</span><strong>{formatPrice(total, locale)}</strong></div><Link href="/checkout" className="mt-6 flex justify-center bg-neutral-950 py-4 text-sm text-white">{t("checkout")}</Link></div></div>}</main>;
}
