import assert from "node:assert/strict";
import test from "node:test";
import { getProductImageUrl, PRODUCT_IMAGE_PLACEHOLDER } from "../src/lib/product-image";

test("product imagery uses the local Daisy Designs image for missing or demo artwork", () => {
  assert.equal(getProductImageUrl(undefined), PRODUCT_IMAGE_PLACEHOLDER);
  assert.equal(getProductImageUrl("  "), PRODUCT_IMAGE_PLACEHOLDER);
  assert.equal(getProductImageUrl("/daisy-designs.png"), PRODUCT_IMAGE_PLACEHOLDER);
  assert.equal(getProductImageUrl("/images/placeholder.jpg"), PRODUCT_IMAGE_PLACEHOLDER);
  assert.equal(getProductImageUrl("https://images.unsplash.com/demo-photo"), PRODUCT_IMAGE_PLACEHOLDER);
});

test("product imagery preserves a real client-provided image URL", () => {
  const clientImage = "/uploads/products/approved-catalog-image.webp";
  assert.equal(getProductImageUrl(clientImage), clientImage);
});
