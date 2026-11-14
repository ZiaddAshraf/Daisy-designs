export type PricedVariant = { id: string; sku?: string; name: string; price: number | null; stock: number; options: unknown };
const STICKER_PACKAGE_SKUS = new Set(["DD-STK-050-COMBINED", "DD-STK-050-TICKETS", "DD-STK-050-LABELS"]);
export function stickerPackageVariants<V extends PricedVariant>(variants: V[]): V[] {
  return variants.filter(variant => STICKER_PACKAGE_SKUS.has(variant.sku ?? ""));
}
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
export function resolveProductPrice<V extends PricedVariant>(product: { slug?: string; price: number; stock: number; variants: V[] }, variantId?: string) {
  const variant = variantId ? product.variants.find(v => v.id === variantId) : product.variants.length === 1 ? product.variants[0] : undefined;
  if (variantId && !variant) throw new Error("INVALID_VARIANT");
  if (product.variants.length > 1 && !variant) throw new Error("VARIANT_REQUIRED");
  if (product.slug === "custom-waterproof-stickers" && (!variant || !STICKER_PACKAGE_SKUS.has(variant.sku ?? ""))) throw new Error("INVALID_VARIANT");
  const unitPrice = variant?.price ?? product.price;
  if (!Number.isSafeInteger(unitPrice) || unitPrice <= 0) throw new Error("INVALID_PRICE");
  return { variant, unitPrice, stock: variant && !usesProductStock(variant) ? variant.stock : product.stock };
}
