import { NextResponse } from "next/server";
import { createHash, randomBytes } from "node:crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isDatabaseUnavailable, prisma } from "@/lib/prisma";
import { CashOnDeliveryProvider } from "@/lib/payments";
import { checkoutSchema } from "@/lib/order-validation";
import { calculateDiscount, calculateShipping } from "@/lib/commerce-rules";
import { validateCustomization, validateTshirtCustomization } from "@/lib/customization-validation";
import { isDemoCatalogProduct } from "@/lib/demo-preview-safety";
import { isDemoModeEnabled, shouldBlockDemoTransactions } from "@/lib/demo-mode";
import { ensureCatalogProductInTransaction } from "@/lib/ensure-catalog-product";

export const runtime = "nodejs";

export async function POST(request: Request) {
    if (shouldBlockDemoTransactions(isDemoModeEnabled())) return NextResponse.json({ error: "DEMO_MODE_READ_ONLY" }, { status: 503 });
    let body: unknown;
    try { body = await request.json(); } catch { return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 }); }
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "بيانات الطلب غير مكتملة", issues: parsed.error.flatten() }, { status: 400 });
    const input = parsed.data;
    const session = await getServerSession(authOptions);
    const payment = new CashOnDeliveryProvider();
    const number = input.requestId
        ? `ST-${createHash("sha256").update(input.requestId).digest("hex").slice(0, 16).toUpperCase()}`
        : `ST-${randomBytes(6).toString("hex").toUpperCase()}`;

    try {
        const result = await prisma.$transaction(async transaction => {
            const existingOrder = await transaction.order.findUnique({ where: { number }, include: { items: true } });
            if (existingOrder) return { id: existingOrder.id, number: existingOrder.number, total: existingOrder.total, items: existingOrder.items.map(item => ({ productName: item.productName, quantity: item.quantity, unitPrice: item.unitPrice, customization: item.customization as Record<string, string> | undefined })) };
            let products = await transaction.product.findMany({ where: { slug: { in: input.items.map(item => item.slug) }, published: true }, include: { variants: true, images: { orderBy: { position: "asc" }, take: 1 }, customizationFields: { include: { options: true } } } });
            const missingSlugs = input.items.map(i => i.slug).filter(s => !products.some(p => p.slug === s));
            if (missingSlugs.length > 0) {
                for (const slug of missingSlugs) {
                    await ensureCatalogProductInTransaction(slug, transaction);
                }
                products = await transaction.product.findMany({ where: { slug: { in: input.items.map(item => item.slug) }, published: true }, include: { variants: true, images: { orderBy: { position: "asc" }, take: 1 }, customizationFields: { include: { options: true } } } });
            }
            if (products.some(isDemoCatalogProduct)) throw new Error("PRODUCT_NOT_FOUND");
            if (products.length !== new Set(input.items.map(item => item.slug)).size) throw new Error("PRODUCT_NOT_FOUND");
            const pricedItems = input.items.map(item => {
                const product = products.find(candidate => candidate.slug === item.slug);
                if (!product) throw new Error("PRODUCT_NOT_FOUND");
                const variant = item.variantId
                    ? product.variants.find(candidate => candidate.id === item.variantId)
                    : product.variants.length === 1 ? product.variants[0] : undefined;
                if (item.variantId && !variant) throw new Error("INVALID_VARIANT");
                if (product.variants.length > 1 && !variant) throw new Error("VARIANT_REQUIRED");
                const customization = product.slug === "custom-printed-tshirt"
                    ? validateTshirtCustomization(item.customization)
                    : validateCustomization(product.customizationFields, item.customization);
                if (!customization.success) throw new Error(customization.reason ?? "INVALID_CUSTOMIZATION");
                const unitPrice = variant?.price ?? product.price;
                return { item: { ...item, customization: customization.data }, product, variant, unitPrice };
            });

            // Aggregate quantities by inventory target to prevent multi-line race conditions and stock exhaustion bugs
            type InventoryTarget = { id: string; isVariant: boolean; productName: string; requiredQty: number; availableStock: number };
            const inventoryTargets = new Map<string, InventoryTarget>();

            for (const entry of pricedItems) {
                const key = entry.variant ? `variant:${entry.variant.id}` : `product:${entry.product.id}`;
                const existing = inventoryTargets.get(key);
                if (existing) {
                    existing.requiredQty += entry.item.quantity;
                } else {
                    inventoryTargets.set(key, {
                        id: entry.variant ? entry.variant.id : entry.product.id,
                        isVariant: Boolean(entry.variant),
                        productName: entry.product.name,
                        requiredQty: entry.item.quantity,
                        availableStock: entry.variant ? entry.variant.stock : entry.product.stock,
                    });
                }
            }

            // Verify total aggregated quantity against available stock before processing
            for (const target of inventoryTargets.values()) {
                if (target.availableStock < target.requiredQty) {
                    throw new Error(`OUT_OF_STOCK:${target.productName}`);
                }
            }

            const subtotal = pricedItems.reduce((sum, entry) => sum + entry.unitPrice * entry.item.quantity, 0);
            let discount = 0;
            let couponCode: string | undefined;
            if (input.couponCode) {
                const coupon = await transaction.coupon.findFirst({ where: { code: input.couponCode.toUpperCase(), active: true } });
                if (!coupon || (coupon.startsAt && coupon.startsAt > new Date()) || (coupon.expiresAt && coupon.expiresAt < new Date()) || (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) || subtotal < coupon.minimumOrder) throw new Error("INVALID_COUPON");
                discount = calculateDiscount(subtotal, coupon);
                couponCode = coupon.code;
                await transaction.coupon.update({ where: { id: coupon.id }, data: { usageCount: { increment: 1 } } });
            }
            const settings = await transaction.siteSetting.findMany({ where: { key: { in: ["shippingFee", "freeShippingThreshold"] } } });
            const setting = (key: string, fallback: number) => Number(settings.find(item => item.key === key)?.value ?? fallback);
            const shipping = calculateShipping(subtotal - discount, setting("shippingFee", 60), setting("freeShippingThreshold", 700));
            const total = Math.max(0, subtotal - discount + shipping);

            // Execute single atomic decrement per unique inventory target
            for (const target of inventoryTargets.values()) {
                const update = target.isVariant
                    ? await transaction.productVariant.updateMany({ where: { id: target.id, stock: { gte: target.requiredQty } }, data: { stock: { decrement: target.requiredQty } } })
                    : await transaction.product.updateMany({ where: { id: target.id, stock: { gte: target.requiredQty } }, data: { stock: { decrement: target.requiredQty } } });
                if (update.count !== 1) throw new Error(`OUT_OF_STOCK:${target.productName}`);
            }

            const paymentResult = await payment.createPayment({ orderNumber: number, amount: total, customerEmail: input.email || undefined });
            const order = await transaction.order.create({
                data: {
                    number, status: "PENDING", paymentStatus: paymentResult.status, paymentMethod: "COD",
                    subtotal, shipping, discount, couponCode, total, notes: input.notes,
                    ...(session?.user?.id ? { userId: session.user.id } : {}),
                    shippingAddress: { fullName: input.fullName, phone: input.phone, email: input.email, governorate: input.governorate, city: input.city, address: input.address },
                    items: { create: pricedItems.map(entry => ({
                        productId: entry.product.id,
                        ...(entry.variant?.id ? { variantId: entry.variant.id } : {}),
                        productName: entry.product.name,
                        productSku: entry.product.sku,
                        productSnapshot: { name: entry.product.name, arabicName: entry.product.arabicName, sku: entry.product.sku, price: entry.unitPrice, image: entry.product.images[0]?.url },
                        ...(entry.item.customization ? { customization: entry.item.customization } : {}),
                        quantity: entry.item.quantity,
                        unitPrice: entry.unitPrice,
                        ...(entry.variant?.options ? { selectedVariant: entry.variant.options } : {}),
                    })) },
                },
                include: { items: true },
            });
            return { id: order.id, number: order.number, total: order.total, items: order.items.map(item => ({ productName: item.productName, quantity: item.quantity, unitPrice: item.unitPrice, customization: item.customization as Record<string, string> | undefined })) };
        });
        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        if (input.requestId && typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
            const existingOrder = await prisma.order.findUnique({ where: { number }, include: { items: true } });
            if (existingOrder) return NextResponse.json({ id: existingOrder.id, number: existingOrder.number, total: existingOrder.total, items: existingOrder.items.map(item => ({ productName: item.productName, quantity: item.quantity, unitPrice: item.unitPrice, customization: item.customization as Record<string, string> | undefined })) }, { status: 201 });
        }
        if (isDatabaseUnavailable(error)) {
            return NextResponse.json({ error: "DATABASE_UNAVAILABLE" }, { status: 503 });
        }
        const message = error instanceof Error ? error.message : "ORDER_FAILED";
        const status = message.startsWith("OUT_OF_STOCK")
            ? 409
            : [
                "INVALID_COUPON",
                "INVALID_VARIANT",
                "VARIANT_REQUIRED",
                "INVALID_CUSTOMIZATION",
                "UNSUPPORTED_CUSTOMIZATION",
                "MISSING_CUSTOMIZATION",
                "INVALID_GARMENT_COLOR",
                "INVALID_GARMENT_SIZE",
              ].includes(message)
            ? 422
            : message === "PRODUCT_NOT_FOUND"
            ? 404
            : 500;
        return NextResponse.json({ error: message }, { status });
    }
}

