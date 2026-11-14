import Link from "next/link";
import Image from "@/components/site-image";
import type { Locale } from "@/lib/locale";
import { formatPrice } from "@/lib/products";
import { STORY_CARDS_BUNDLE_PRICE } from "@/lib/commerce-rules";
import story from "@/data/story-product.json";
import cards from "@/data/reward-cards-product.json";
import { ArrowLeft, ArrowRight } from "lucide-react";

export function BundlePhotos() {
  return <span aria-hidden="true" className="flex h-full w-full items-center justify-center" dir="ltr">
    <Image src="/products/customized-stories/first-year-at-school/cover.jpeg" alt="" width={120} height={150} className="h-[84%] w-[45%] -rotate-6 rounded-md object-cover shadow-md" />
    <Image src="/products/reward-cards/reward-cards-box-set.jpeg" alt="" width={120} height={100} className="-ms-2 mt-4 h-[60%] w-[50%] rotate-3 rounded-md object-cover shadow-md" />
  </span>;
}

export function BundlePrice({ locale }: { locale: Locale }) {
  const original = story.product.price + cards.product.price;
  return <span className="bundle-offer__prices">
    <strong>{formatPrice(STORY_CARDS_BUNDLE_PRICE, locale)}</strong>
    <del>{formatPrice(original, locale)}</del>
  </span>;
}

export function BundleOffer({ locale }: { locale: Locale }) {
  const ar = locale === "ar";
  const Arrow = ar ? ArrowLeft : ArrowRight;
  return <Link href="/products/first-year-at-school?bundle=cards" data-scroll-reveal="card" className="bundle-offer">
    <span className="bundle-offer__visual"><BundlePhotos /></span>
    <span className="bundle-offer__content">
      <span className="bundle-offer__eyebrow">{ar ? "باقة أوفر · وفّري ٥٠ ج.م" : "BUNDLE OFFER · SAVE 50 EGP"}</span>
      <strong>{ar ? "القصة وكروت التشجيع مع بعض" : "A storybook and a little encouragement"}</strong>
      <span className="bundle-offer__description">{ar ? "قصة باسم وصورة طفلك + علبة فيها ١٠ كروت" : "Personalized storybook + a box of 10 reward cards"}</span>
      <BundlePrice locale={locale} />
    </span>
    <span className="bundle-offer__action">{ar ? "خصّصي الباقة" : "Personalize the bundle"}<Arrow size={17} aria-hidden="true" /></span>
  </Link>;
}
export function DiscountRows({ locale, discount, bundleDiscount = 0 }: { locale: Locale; discount: number; bundleDiscount?: number }) {
  const rows = [
    { label: locale === "ar" ? "خصم باقة القصة والكروت" : "Story & cards bundle savings", amount: bundleDiscount },
    { label: locale === "ar" ? "خصم الكوبون" : "Coupon discount", amount: discount - bundleDiscount },
  ];
  return <>{rows.filter(row => row.amount > 0).map(row => (
    <div key={row.label} className="flex justify-between gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
      <span>{row.label}</span><span>{formatPrice(-row.amount, locale)}</span>
    </div>
  ))}</>;
}
