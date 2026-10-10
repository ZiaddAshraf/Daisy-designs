export type CartIdentity = { productId: string; variantId?: string; customization?: Record<string, string> };
export function normalizeCustomization(customization?: Record<string, string>) {
    if (!customization) return undefined;
    const entries = Object.entries(customization)
        .map(([key, value]) => [key.trim(), value.trim()] as const)
        .filter(([key, value]) => key && value)
        .sort(([left], [right]) => left.localeCompare(right));
    return entries.length ? Object.fromEntries(entries) : undefined;
}
export function cartIdentity(item: CartIdentity) {
    return `${item.productId}:${item.variantId ?? "default"}:${JSON.stringify(normalizeCustomization(item.customization) ?? {})}`;
}
export function mergeQuantities<T extends CartIdentity & { quantity: number }>(items: T[]) { const merged = new Map<string, T>(); for (const item of items) { const key = cartIdentity(item); const existing = merged.get(key); merged.set(key, existing ? { ...existing, quantity: existing.quantity + item.quantity } : { ...item }); } return [...merged.values()]; }
export function calculateDiscount(subtotal: number, coupon: { type: "PERCENTAGE" | "FIXED"; value: number; minimumOrder: number; maximumDiscount?: number | null }) { if (subtotal < coupon.minimumOrder) return 0; const raw = coupon.type === "PERCENTAGE" ? Math.floor(subtotal * coupon.value / 100) : coupon.value; return Math.min(raw, coupon.maximumDiscount ?? raw, subtotal); }
export function calculateShipping(subtotalAfterDiscount: number, fee: number, freeThreshold: number) { return subtotalAfterDiscount >= freeThreshold ? 0 : fee; }
