export const PRODUCT_IMAGE_PLACEHOLDER = "/images/daisy-designs-placeholder.png";

const legacyPlaceholderPaths = new Set([
  "/daisy-designs.png",
  "/images/placeholder.jpg",
]);

const legacyTshirtImages: Record<string, string> = {
  "/products/t-shirts/white-tshirt.svg": "/products/t-shirts/kids-tshirt-studio.jpeg",
  "/products/t-shirts/black-tshirt.svg": "/products/t-shirts/kids-tshirt-black-studio.jpeg",
  "/products/t-shirts/gray-tshirt.svg": "/products/t-shirts/kids-tshirt-gray-studio.jpeg",
};

/** Use the temporary brand image for missing or known demo-only product artwork. */
export function getProductImageUrl(url?: string | null) {
  const candidate = url?.trim();
  if (!candidate || legacyPlaceholderPaths.has(candidate) || candidate.startsWith("https://images.unsplash.com/")) {
    return PRODUCT_IMAGE_PLACEHOLDER;
  }
  return legacyTshirtImages[candidate] ?? candidate;
}
