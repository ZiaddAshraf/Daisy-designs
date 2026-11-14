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

export function shippingProgress(quote: { subtotal: number; discount: number; shipping: number; threshold: number } | null) {
    if (!quote) return null;
    const eligibleAmount = quote.subtotal - quote.discount;
    if (quote.shipping === 0) return { remaining: 0, percent: 100 };
    return {
        remaining: Math.max(0, quote.threshold - eligibleAmount),
        percent: Math.min(99, Math.floor(eligibleAmount / quote.threshold * 100)),
    };
}

export const STORY_CARDS_BUNDLE_PRICE = 400;

export function storyCardsDiscount(lines: { slug: string; price: number; quantity: number }[]) {
    const stories = lines.filter(line => line.slug === "first-year-at-school");
    const cards = lines.filter(line => line.slug === "reward-cards-box-set");
    if (!stories.length || !cards.length) return 0;
    const count = (items: typeof lines) => items.reduce((sum, item) => sum + item.quantity, 0);
    const pairs = Math.min(count(stories), count(cards));
    return pairs * Math.max(0, stories[0].price + cards[0].price - STORY_CARDS_BUNDLE_PRICE);
}
