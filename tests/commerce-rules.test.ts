import assert from "node:assert/strict";
import test from "node:test";
import { calculateDiscount, calculateShipping, mergeQuantities } from "@/lib/commerce-rules";
import { adjustCartLine, cartLineId, checkoutLinePayload, removeCartLine } from "@/lib/cart-line-state";
import { checkoutSchema } from "@/lib/order-validation";
import { getProductGalleryImage } from "@/lib/product-gallery";
import { validateCustomization } from "@/lib/customization-validation";

test("merges identical product variant customizations", () => { const result = mergeQuantities([{ productId: "p1", quantity: 1, customization: { name: "Mira" } }, { productId: "p1", quantity: 2, customization: { name: "Mira" } }, { productId: "p1", quantity: 1, customization: { name: "Omar" } }]); assert.equal(result.length, 2); assert.equal(result.find(item => item.customization?.name === "Mira")?.quantity, 3); });
test("calculates percentage and maximum discount", () => { assert.equal(calculateDiscount(1000, { type: "PERCENTAGE", value: 20, minimumOrder: 0, maximumDiscount: 100 }), 100); assert.equal(calculateDiscount(100, { type: "FIXED", value: 200, minimumOrder: 0 }), 100); });
test("requires minimum order and applies free shipping threshold", () => { assert.equal(calculateDiscount(100, { type: "FIXED", value: 50, minimumOrder: 200 }), 0); assert.equal(calculateShipping(2500, 60, 2500), 0); assert.equal(calculateShipping(500, 60, 2500), 60); });
test("cart identities normalize customizations and distinguish variants", () => {
  assert.equal(cartLineId({ slug: "p1", customization: { theme: " stars ", name: "Mira" } }), cartLineId({ slug: "p1", customization: { name: "Mira", theme: "stars" } }));
  assert.notEqual(cartLineId({ slug: "p1", customization: { name: "Mira" } }), cartLineId({ slug: "p1", customization: { name: "Omar" } }));
  assert.notEqual(cartLineId({ slug: "p1", variantId: "small" }), cartLineId({ slug: "p1", variantId: "large" }));
});
test("cart line quantity and removal affect only the selected configuration", () => {
  const first = { lineId: "p1:default:{\"name\":\"Mira\"}", slug: "p1", quantity: 2, customization: { name: "Mira" } };
  const second = { lineId: "p1:default:{\"name\":\"Omar\"}", slug: "p1", quantity: 1, customization: { name: "Omar" } };
  const updated = adjustCartLine([first, second], first.lineId, 1);
  assert.deepEqual(updated.map(item => item.quantity), [3, 1]);
  assert.deepEqual(removeCartLine(updated, first.lineId), [second]);
});
test("checkout payload preserves the selected variant and customization", () => {
  const payload = checkoutLinePayload({ lineId: "line", slug: "p1", variantId: "v1", quantity: 2, customization: { name: "Mira" } });
  assert.deepEqual(payload, { slug: "p1", variantId: "v1", quantity: 2, customization: { name: "Mira" } });
  const parsed = checkoutSchema.safeParse({ fullName: "Mira Name", phone: "01000000000", email: "", governorate: "Cairo", city: "Nasr City", address: "Example street 1", paymentMethod: "COD", items: [payload] });
  assert.equal(parsed.success, true);
});
test("checkout accepts a stable idempotency key and rejects malformed keys", () => {
  const base = { fullName: "Mira Name", phone: "01000000000", email: "", governorate: "Cairo", city: "Nasr City", address: "Example street 1", paymentMethod: "COD", items: [{ slug: "p1", quantity: 1 }] };
  assert.equal(checkoutSchema.safeParse({ ...base, requestId: "5bd4f096-a241-4f9d-a76b-6ccdf165aca1" }).success, true);
  assert.equal(checkoutSchema.safeParse({ ...base, requestId: "not-a-uuid" }).success, false);
});
test("product gallery supports empty and single-image products", () => {
  const image = { url: "/product.jpg", alt: "Product" };
  assert.equal(getProductGalleryImage([], 0), null);
  assert.deepEqual(getProductGalleryImage([image], 0), image);
  assert.deepEqual(getProductGalleryImage([image], 9), image);
});
test("customization validation checks required text, allowed choices, and unsupported image input", () => {
  const fields = [
    { key: "name", type: "TEXT" as const, required: true, maxLength: 12, options: [] },
    { key: "theme", type: "SELECT" as const, required: false, maxLength: null, options: [{ value: "stars" }] },
    { key: "photo", type: "IMAGE" as const, required: false, maxLength: null, options: [] },
  ];
  assert.equal(validateCustomization(fields, { name: "Mira", theme: "stars" }).success, true);
  assert.equal(validateCustomization(fields, { name: "", theme: "stars" }).success, false);
  assert.equal(validateCustomization(fields, { name: "Mira", theme: "invalid" }).success, false);
  assert.equal(validateCustomization(fields, { name: "Mira", photo: "https://example.com/photo.jpg" }).success, false);
});
