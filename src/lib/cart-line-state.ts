import { cartIdentity, normalizeCustomization } from "@/lib/commerce-rules";

export type CartLineReference = {
    lineId: string;
    slug: string;
    variantId?: string;
    customization?: Record<string, string>;
    quantity: number;
};

export function cartLineId(item: Pick<CartLineReference, "slug" | "variantId" | "customization">) {
    return cartIdentity({ productId: item.slug, variantId: item.variantId, customization: item.customization });
}

export function mergeCartLine<T extends CartLineReference>(items: T[], incoming: T) {
    const lineId = cartLineId(incoming);
    const existing = items.find(item => item.lineId === lineId);
    return existing
        ? items.map(item => item.lineId === lineId ? { ...item, quantity: item.quantity + incoming.quantity } : item)
        : [...items, { ...incoming, lineId }];
}

export function adjustCartLine<T extends CartLineReference>(items: T[], lineId: string, amount: number) {
    return items.map(item => item.lineId === lineId ? { ...item, quantity: Math.max(0, item.quantity + amount) } : item).filter(item => item.quantity > 0);
}

export function removeCartLine<T extends CartLineReference>(items: T[], lineId: string) {
    return items.filter(item => item.lineId !== lineId);
}

export function normalizeStoredCartLine<T extends Omit<CartLineReference, "lineId">>(item: T) {
    const customization = normalizeCustomization(item.customization);
    return { ...item, customization, lineId: cartLineId({ ...item, customization }) };
}

export function checkoutLinePayload(item: CartLineReference) {
    return {
        slug: item.slug,
        quantity: item.quantity,
        ...(item.customization ? { customization: item.customization } : {}),
        ...(item.variantId ? { variantId: item.variantId } : {}),
    };
}
