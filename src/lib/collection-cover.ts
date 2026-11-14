import { PRODUCT_IMAGE_PLACEHOLDER, getProductImageUrl } from "@/lib/product-image";

const FEATURED_COLLECTION_COVERS: Record<string, string> = {
  "back-to-school": "/products/stickers/tickets-labels-studio.jpeg",
  "best-sellers": "/products/reward-cards/reward-cards-box-set.jpeg",
  "personalized-essentials": "/products/customized-stories/first-year-at-school/cover.jpeg",
  "new-arrivals": "/products/t-shirts/kids-tshirt-studio.jpeg",
};

export function collectionCover(image: string | null, slug: string) {
  const source = getProductImageUrl(image);
  return source === PRODUCT_IMAGE_PLACEHOLDER
    ? FEATURED_COLLECTION_COVERS[slug] ?? source
    : source;
}
