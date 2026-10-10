import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { cartIdentity, mergeQuantities } from "@/lib/commerce-rules";
import { validateCustomization } from "@/lib/customization-validation";

const schema = z.object({
    items: z.array(z.object({
        slug: z.string(),
        quantity: z.number().int().positive(),
        customization: z.record(z.string(), z.string()).optional(),
        variantId: z.string().optional(),
    })),
});
type PreparedCartItem = { productId: string; variantId?: string; quantity: number; unitPrice: number; customization?: Record<string, string> };

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "بيانات السلة غير صالحة" }, { status: 400 });

    const incomingSlugs = [...new Set(parsed.data.items.map(item => item.slug))];
    const products = await prisma.product.findMany({
        where: { slug: { in: incomingSlugs }, published: true },
        include: { variants: true, customizationFields: { include: { options: true } } },
    });
    const prepared: PreparedCartItem[] = [];
    for (const item of parsed.data.items) {
        const product = products.find(candidate => candidate.slug === item.slug);
        if (!product) continue;
        const variant = item.variantId
            ? product.variants.find(candidate => candidate.id === item.variantId)
            : product.variants.length === 1 ? product.variants[0] : undefined;
        if (item.variantId && !variant) return NextResponse.json({ error: "خيار المنتج غير صالح" }, { status: 400 });
        const customization = validateCustomization(product.customizationFields, item.customization);
        if (!customization.success) return NextResponse.json({ error: "بيانات التخصيص غير صالحة" }, { status: 400 });
        prepared.push({
            productId: product.id,
            variantId: variant?.id,
            quantity: item.quantity,
            unitPrice: variant?.price ?? product.price,
            customization: customization.data,
        });
    }

    const result = await prisma.$transaction(async transaction => {
        const cart = await transaction.cart.upsert({ where: { userId: session.user.id }, update: {}, create: { userId: session.user.id } });
        const existing = await transaction.cartItem.findMany({ where: { cartId: cart.id } });
        for (const item of mergeQuantities(prepared)) {
            const identity = cartIdentity(item);
            const match = existing.find(candidate => cartIdentity({
                productId: candidate.productId,
                variantId: candidate.variantId ?? undefined,
                customization: candidate.customization as Record<string, string> | undefined,
            }) === identity);
            if (match) {
                await transaction.cartItem.update({ where: { id: match.id }, data: { quantity: match.quantity + item.quantity, unitPrice: item.unitPrice } });
            } else {
                await transaction.cartItem.create({ data: { cartId: cart.id, ...item } });
            }
        }
        return transaction.cartItem.findMany({ where: { cartId: cart.id } });
    });
    return NextResponse.json(result);
}
