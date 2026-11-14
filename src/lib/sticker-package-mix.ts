import stickersData from "@/data/stickers-product.json";

export type StickerMix = Record<string, number>;
export type StickerKind = "tickets" | "labels";

export const STICKER_PACKAGE_COUNTS: Record<string, { tickets: number; labels: number }> = {
  "DD-STK-050-COMBINED": { tickets: 20, labels: 25 },
  "DD-STK-050-TICKETS": { tickets: 20, labels: 0 },
  "DD-STK-050-LABELS": { tickets: 0, labels: 25 },
};

const knownDesigns = new Set(stickersData.product.designs.map(design => design.slug));

export function stickerMixTotal(mix: StickerMix): number {
  return Object.values(mix).reduce((total, count) => total + count, 0);
}

export function initialStickerMix(slug: string, count: number): StickerMix {
  return count ? { [slug]: count } : {};
}

export function addStickerDesign(mix: StickerMix, slug: string, limit: number): StickerMix {
  if (mix[slug] || !knownDesigns.has(slug) || limit === 0) return mix;
  const next = { ...mix };
  if (stickerMixTotal(next) >= limit) {
    const first = Object.keys(next).find(key => next[key] > 1);
    if (!first) return mix;
    next[first] -= 1;
  }
  next[slug] = 1;
  return next;
}

export function parseStickerMix(value: string | undefined, count: number): StickerMix | null {
  if (!value || value.length > 4000) return null;
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed) || parsed.length < 1 || parsed.length > count) return null;
    const mix: StickerMix = {};
    for (const entry of parsed) {
      if (!Array.isArray(entry) || entry.length !== 2) return null;
      const [slug, quantity] = entry;
      if (typeof slug !== "string" || !knownDesigns.has(slug) || slug in mix || !Number.isInteger(quantity) || quantity < 1 || quantity > count) return null;
      mix[slug] = quantity;
    }
    return stickerMixTotal(mix) === count ? mix : null;
  } catch {
    return null;
  }
}

export function serializeStickerMix(mix: StickerMix): string {
  return JSON.stringify(Object.entries(mix).filter(([, count]) => count > 0).sort(([a], [b]) => a.localeCompare(b)));
}
