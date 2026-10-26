import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { resolveProductPrice, variantLabel } from "@/lib/product-pricing";
import { calculateDiscount, calculateShipping } from "@/lib/commerce-rules";
import { isOrderableCatalogProduct } from "@/lib/demo-preview-safety";

const schema = z.object({
  locale: z.enum(["ar", "en"]).default("ar"),
  couponCode: z.string().trim().max(40).optional(),
  items: z.array(z.object({ slug: z.string(), quantity: z.number().int().min(1).max(50), variantId: z.string().optional() })).max(100),
});
export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "INVALID_CART" }, { status: 400 });
  try {
    const { items, locale, couponCode } = parsed.data;
    const products = await prisma.product.findMany({ where: { slug: { in: items.map(i => i.slug) }, published: true }, include: { variants: true } });
    const lines = items.map(item => {
      const product = products.find(p => p.slug === item.slug && isOrderableCatalogProduct(p));
      if (!product) throw new Error("PRODUCT_NOT_FOUND");
      const { variant, unitPrice } = resolveProductPrice(product, item.variantId);
      return { price: unitPrice, variantId: variant?.id, variantName: variant ? variantLabel(variant, locale) : undefined };
    });
    const subtotal = lines.reduce((sum, line, index) => sum + line.price * items[index].quantity, 0);
    let discount = 0;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } });
      const now = new Date();
      if (!coupon || !coupon.active || (coupon.startsAt && coupon.startsAt > now) || (coupon.expiresAt && coupon.expiresAt < now) || (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) || subtotal < coupon.minimumOrder) throw new Error("INVALID_COUPON");
      discount = calculateDiscount(subtotal, coupon);
    }
    const settings = await prisma.siteSetting.findMany({ where: { key: { in: ["shippingFee", "freeShippingThreshold"] } } });
    const fee = Number(settings.find(s => s.key === "shippingFee")?.value ?? 60);
    const threshold = Number(settings.find(s => s.key === "freeShippingThreshold")?.value ?? 700);
    const shipping = items.length ? calculateShipping(subtotal - discount, fee, threshold) : 0;
    return NextResponse.json({ lines, subtotal, discount, shipping, total: subtotal - discount + shipping, fee, threshold });
  } catch (error) {
    const message = error instanceof Error ? error.message : "QUOTE_UNAVAILABLE";
    return NextResponse.json({ error: ["INVALID_VARIANT", "VARIANT_REQUIRED", "INVALID_PRICE", "PRODUCT_NOT_FOUND", "INVALID_COUPON"].includes(message) ? message : "QUOTE_UNAVAILABLE" }, { status: 422 });
  }
}
