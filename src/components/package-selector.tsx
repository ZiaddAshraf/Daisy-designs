"use client";
import { formatPrice } from "@/lib/products";
import { variantLabel, type PricedVariant } from "@/lib/product-pricing";
import type { Locale } from "@/lib/locale";

export function PackageSelector({ variants, value, onChange, locale, basePrice }: {
  variants: PricedVariant[]; value: string; onChange: (id: string) => void; locale: Locale; basePrice: number;
}) {
  return <fieldset className="my-4 space-y-2"><legend className="font-bold mb-2">{locale === "ar" ? "اختاري الباقة — الكمية لكل باقة" : "Choose a package — contents per package"}</legend>
    {variants.map(variant => <label key={variant.id} className={`flex items-center justify-between gap-3 rounded-xl border p-3 cursor-pointer ${value === variant.id ? "border-teal-600 bg-teal-50 dark:bg-teal-950" : "border-[var(--border)]"}`}>
      <span className="flex items-center gap-2"><input required type="radio" name="package" value={variant.id} checked={value === variant.id} onChange={() => onChange(variant.id)} /><span>{variantLabel(variant, locale)}</span></span>
      <strong className="whitespace-nowrap">{formatPrice(variant.price ?? basePrice, locale)}</strong>
    </label>)}
  </fieldset>;
}
