"use client";

import Image from "@/components/site-image";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Minus, Plus, ShieldCheck, ShoppingBag, Trash2, Truck } from "lucide-react";
import type { Product } from "@/lib/products";
import { formatPrice } from "@/lib/products";
import { getProductImageUrl, PRODUCT_IMAGE_PLACEHOLDER } from "@/lib/product-image";
import { ProductCard, WishlistButton, useCart, useLocale, useTranslation } from "@/components/storefront";
import { formatMessage } from "@/lib/i18n/messages";
import { formatLocaleNumber } from "@/lib/locale";
import { getProductGalleryImage, type ProductGalleryImage } from "@/lib/product-gallery";
import { formatCustomizationEntries } from "@/lib/customization-formatter";

type CustomizationField = { label: string; key: string; type: string; required: boolean; placeholder: string | null; maxLength: number | null; options: { label: string; value: string }[] };
type ReviewSummary = { rating: number; title: string; comment: string };
type ProductVariant = { id: string; name: string; price: number | null; stock: number; options: unknown };

export function ProductDetail({ product, images = [], variants = [], customizationFields = [], stock = 0, lowStockThreshold = 5, categorySlug, reviews = [], reviewCount = 0, reviewAverage = 0, relatedProducts = [] }: {
  product: Product;
  images?: ProductGalleryImage[];
  variants?: ProductVariant[];
  customizationFields?: CustomizationField[];
  stock?: number;
  lowStockThreshold?: number;
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
        <div className="product-detail-price"><strong>{formatPrice(currentPrice * quantity, locale)}</strong>{quantity > 1 && <span className="text-xs text-[var(--muted-foreground)] ms-2">({formatPrice(currentPrice, locale)} {locale === "ar" ? "للقطعة" : "each"})</span>}{currentPrice === product.price && product.compareAtPrice && <del>{formatPrice(product.compareAtPrice * quantity, locale)}</del>}</div>
        <p className={`product-availability ${demoMode ? "" : outOfStock ? "status-error" : stock <= lowStockThreshold ? "status-warning" : "status-success"}`} role="status">{displayAvailability}</p>
        <p className="product-detail-description">{product.description}</p>

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
          <div className="product-purchase-row"><div className="product-quantity" aria-label={t("quantity")}><button type="button" onClick={() => setQuantity(value => Math.max(1, value - 1))} aria-label={t("decreaseQuantity")} disabled={quantity <= 1}><Minus size={14} /></button><output>{quantity}</output><button type="button" onClick={() => setQuantity(value => Math.min(Math.max(selectedStock, 1), value + 1))} aria-label={t("increaseQuantity")} disabled={!selectedStock || quantity >= selectedStock}><Plus size={14} /></button></div><button type="submit" className="daisy-button daisy-button--dark product-add-button" disabled={outOfStock || (needsVariant && !selectedVariant) || unsupportedRequiredField}>{needsVariant && !selectedVariant ? variants.every(variant => variant.stock <= 0) ? t("outOfStock") : t("selectVariant") : outOfStock ? t("outOfStock") : quantity > 1 ? `${t("addToCart")} — ${formatPrice(currentPrice * quantity, locale)}` : t("addToCart")}{locale === "ar" ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}</button><div className="product-wishlist-action"><WishlistButton product={product} /></div></div>
          {added && <p className="product-added-message status-success" role="status">{t("productAddedToCart")}</p>}
        </form>}
        {!demoMode && <div className="product-service-notes"><span><Truck size={16} /> {t("deliveryAllGovernorates")}</span><span><ShieldCheck size={16} /> {t("cashOnDelivery")}</span></div>}
      </div>
    </div>
    {reviewCount > 0 && <section className="product-reviews" data-scroll-reveal suppressHydrationWarning><div className="product-subheading"><p className="eyebrow">{t("genuineExperiences")}</p><h2>{t("familyReviews")}</h2><span aria-label={formatMessage(t("reviewCount"), { count: formatLocaleNumber(locale, reviewCount) })}>{"★"} {formatLocaleNumber(locale, reviewAverage)} · {formatMessage(t("reviewCount"), { count: formatLocaleNumber(locale, reviewCount) })}</span></div><div className="product-review-list">{reviews.map((review, index) => <article key={`${review.title}-${index}`}><p className="product-review-stars" aria-label={formatMessage(t("reviewStars"), { rating: formatLocaleNumber(locale, review.rating) })}>{"★".repeat(review.rating)}</p><h3>{review.title}</h3><p>{review.comment}</p></article>)}</div>{reviewCount > reviews.length && <p className="product-review-preview">{formatMessage(t("recentApprovedReviews"), { shown: formatLocaleNumber(locale, reviews.length), total: formatLocaleNumber(locale, reviewCount) })}</p>}</section>}
    {relatedProducts.length > 0 && <section className="product-related" data-scroll-reveal suppressHydrationWarning><div className="product-subheading"><p className="eyebrow">{t("fromSameWorld")}</p><h2>{t("youMayAlsoLike")}</h2></div><div className="daisy-product-grid" data-scroll-reveal-stagger>{relatedProducts.map(related => <ProductCard key={related.slug} product={related} editorial />)}</div></section>}
  </main>;
}

const FREE_SHIPPING_THRESHOLD = 2500;

export function CartView() {
  const { items, update, remove, demoMode } = useCart();
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const locale = useLocale();
  const t = useTranslation();
  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const freeShippingProgress = Math.min(100, Math.round((total / FREE_SHIPPING_THRESHOLD) * 100));
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - total);

  if (demoMode) {
    return (
      <main className="commerce-page commerce-page--preview-empty mx-auto max-w-[1000px] px-6 py-16 lg:px-0" data-scroll-reveal suppressHydrationWarning>
        <p className="text-xs tracking-[.2em] text-[var(--muted-foreground)]">DAISY DESIGNS / {t("cart")}</p>
        <h1 className="mt-3 text-3xl sm:text-4xl font-bold text-[var(--foreground)]">{t("previewNoPurchase")}</h1>
        <p className="mt-6 max-w-2xl text-[var(--muted-foreground)]">{t("previewCartMessage")}</p>
        <Link href="/products" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-neutral-950 dark:bg-white px-6 py-3 text-sm font-semibold text-white dark:text-neutral-950 transition-all hover:opacity-95 hover:-translate-y-0.5 hover:shadow-md active:scale-95 cursor-pointer">
          {t("exploreProducts")}
        </Link>
      </main>
    );
  }

  return (
    <main className="commerce-page mx-auto max-w-[1100px] px-4 py-12 sm:px-6 sm:py-16 lg:px-8" data-scroll-reveal suppressHydrationWarning>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold tracking-wider text-[var(--muted-foreground)] uppercase">
          DAISY DESIGNS / {t("cart")}
        </p>
        {items.length > 0 && (
          <span className="rounded-full bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--muted-foreground)]">
            {formatMessage(t("orderItemsCount"), { count: totalItemCount })}
          </span>
        )}
      </div>

      <h1 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[var(--foreground)]">
        {t("cartDrawer")}
      </h1>

      {items.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-10 sm:p-16 text-center shadow-xs" data-scroll-reveal suppressHydrationWarning>
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[var(--surface-soft)] text-amber-500">
            <ShoppingBag size={36} />
          </div>
          <h2 className="mt-5 text-2xl font-bold text-[var(--foreground)]">{t("emptyCart")}</h2>
          <p className="mt-2 text-sm text-[var(--muted-foreground)] max-w-md mx-auto">{t("emptyCartMessage")}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/products/stickers"
              className="inline-flex items-center gap-2 rounded-xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 px-5 py-3 text-sm font-semibold hover:opacity-95 hover:-translate-y-0.5 hover:shadow-md transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              {t("emptyCartExploreStickers")}
            </Link>
            <Link
              href="/products/reward-cards"
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] px-5 py-3 text-sm font-semibold hover:bg-[var(--surface-hover)] hover:-translate-y-0.5 hover:shadow-md transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              {t("emptyCartExploreRewardCards")}
            </Link>
            <Link
              href="/products/first-year-at-school"
              className="inline-flex items-center gap-2 rounded-xl border border-amber-300 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 px-5 py-3 text-sm font-semibold hover:bg-amber-100 dark:hover:bg-amber-900/40 hover:-translate-y-0.5 hover:shadow-md transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              {t("emptyCartExploreStorybooks")}
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
          {/* Cart Items List */}
          <div className="space-y-4">
            {items.map(item => (
              <div
                key={item.lineId}
                className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5 shadow-xs transition hover:border-[var(--foreground)]/20 flex flex-col sm:flex-row gap-4 sm:items-center"
              >
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--background)]">
                  <Image
                    src={getProductImageUrl(item.image) || PRODUCT_IMAGE_PLACEHOLDER}
                    alt={item.name}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-base text-[var(--foreground)]">{item.name}</p>
                      {item.variantName && (
                        <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">{item.variantName}</p>
                      )}
                    </div>
                    <span className="font-bold text-base text-[var(--foreground)] shrink-0">
                      {formatPrice(item.price * item.quantity, locale)}
                    </span>
                  </div>

                  {item.customization && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {formatCustomizationEntries(item.customization, locale).map(entry => (
                        <span
                          key={entry.key}
                          className="inline-flex items-center gap-1 rounded-md bg-[var(--surface-soft)] px-2 py-0.5 text-xs text-[var(--muted-foreground)] border border-[var(--border)]/70"
                        >
                          <strong className="font-semibold text-[var(--foreground)]">{entry.label}:</strong>
                          <span className="truncate max-w-[150px]">{entry.displayValue}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between border-t border-[var(--border)]/60 pt-3">
                    <div className="flex items-center rounded-xl border border-[var(--border)] bg-[var(--background)] overflow-hidden">
                      <button
                        onClick={() => update(item.lineId, -1)}
                        aria-label={t("decreaseQuantity")}
                        className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-[var(--foreground)] hover:bg-[var(--surface-hover)] active:scale-90 transition-all cursor-pointer"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="font-bold text-sm min-w-8 text-center text-[var(--foreground)]">{item.quantity}</span>
                      <button
                        onClick={() => update(item.lineId, 1)}
                        aria-label={t("increaseQuantity")}
                        className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-[var(--foreground)] hover:bg-[var(--surface-hover)] active:scale-90 transition-all cursor-pointer"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <button
                      onClick={() => remove(item.lineId)}
                      className="inline-flex items-center gap-1.5 py-2 px-3 rounded-lg text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30 active:scale-95 font-medium transition cursor-pointer min-h-[44px]"
                    >
                      <Trash2 size={14} />
                      <span>{t("remove")}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary Card */}
          <aside className="space-y-6 lg:sticky lg:top-24">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xs space-y-5">
              <h2 className="text-lg font-bold text-[var(--foreground)] border-b border-[var(--border)] pb-4">
                {t("cartSummary")}
              </h2>

              {/* Free shipping progress bar */}
              <div className="rounded-xl bg-[var(--surface-soft)] p-3.5 border border-[var(--border)]">
                <div className="text-xs font-semibold text-[var(--foreground)] flex items-center gap-1.5">
                  <Truck size={14} className="text-teal-600 dark:text-teal-400 shrink-0" />
                  {total >= FREE_SHIPPING_THRESHOLD ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      {t("freeShippingUnlocked")}
                    </span>
                  ) : (
                    <span>
                      {formatMessage(t("freeShippingProgress"), {
                        amount: amountToFreeShipping.toLocaleString(locale === "ar" ? "ar-EG" : "en-US"),
                      })}
                    </span>
                  )}
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--border)]">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-300"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </div>

              {/* Pricing lines */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-[var(--muted-foreground)]">
                  <span>{t("subtotal")}</span>
                  <span className="font-medium text-[var(--foreground)]">{formatPrice(total, locale)}</span>
                </div>
                <div className="flex justify-between text-[var(--muted-foreground)]">
                  <span>{t("shippingFee")}</span>
                  <span>
                    {total >= FREE_SHIPPING_THRESHOLD ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 dark:bg-emerald-950/40 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 size={12} />
                        {t("freeShipping")}
                      </span>
                    ) : (
                      <span className="text-xs text-[var(--muted-foreground)]">{locale === "ar" ? "يُحسب عند الدفع" : "Calculated at checkout"}</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between border-t border-[var(--border)] pt-3 text-base font-bold text-[var(--foreground)]">
                  <span>{t("total")}</span>
                  <span className="text-xl text-[var(--foreground)]">{formatPrice(total, locale)}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <Link
                href="/checkout"
                className="min-h-13 w-full rounded-xl bg-neutral-950 dark:bg-white px-6 py-3.5 text-center text-sm font-bold text-white dark:text-neutral-950 shadow-md transition-all hover:opacity-95 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{t("checkout")}</span>
                {locale === "ar" ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
              </Link>
            </div>

            {/* Trust Points */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-3 text-xs font-medium text-[var(--muted-foreground)]">
                <ShieldCheck size={18} className="text-amber-500 shrink-0" />
                <span>{t("trustCashOnDelivery")}</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-medium text-[var(--muted-foreground)]">
                <Truck size={18} className="text-amber-500 shrink-0" />
                <span>{t("trustNationwideDelivery")}</span>
              </div>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
