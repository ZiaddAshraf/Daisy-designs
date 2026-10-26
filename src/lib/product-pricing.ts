export type PricedVariant = { id: string; name: string; price: number | null; stock: number; options: unknown };
export function usesProductStock(variant?: Pick<PricedVariant, "options">) {
  return !!variant?.options && typeof variant.options === "object" && "inventory" in variant.options && variant.options.inventory === "product";
}
export function variantLabel(variant: Pick<PricedVariant, "name" | "options">, locale: string) {
  const options = variant.options;
  if (options && typeof options === "object") {
    const key = locale === "ar" ? "arabicName" : "englishName";
    if (key in options && typeof (options as Record<string, unknown>)[key] === "string") return (options as Record<string, string>)[key];
  }
  return variant.name;
}
export function resolveProductPrice<V extends PricedVariant>(product: { price: number; stock: number; variants: V[] }, variantId?: string) {
  const variant = variantId ? product.variants.find(v => v.id === variantId) : product.variants.length === 1 ? product.variants[0] : undefined;
  if (variantId && !variant) throw new Error("INVALID_VARIANT");
  if (product.variants.length > 1 && !variant) throw new Error("VARIANT_REQUIRED");
  const unitPrice = variant?.price ?? product.price;
  if (!Number.isSafeInteger(unitPrice) || unitPrice <= 0) throw new Error("INVALID_PRICE");
  return { variant, unitPrice, stock: variant && !usesProductStock(variant) ? variant.stock : product.stock };
}
