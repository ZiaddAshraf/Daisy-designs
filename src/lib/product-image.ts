export const PRODUCT_IMAGE_PLACEHOLDER = "/images/daisy-designs-placeholder.png";

const legacyPlaceholderPaths = new Set([
  "/daisy-designs.png",
  "/images/placeholder.jpg",
]);

/** Use the temporary brand image for missing or known demo-only product artwork. */
export function getProductImageUrl(url?: string | null) {
  const candidate = url?.trim();
  if (!candidate || legacyPlaceholderPaths.has(candidate) || candidate.startsWith("https://images.unsplash.com/")) {
    return PRODUCT_IMAGE_PLACEHOLDER;
  }
  return candidate;
}
