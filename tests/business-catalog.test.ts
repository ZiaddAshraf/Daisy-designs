import test, { mock } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { resolveProductPrice, usesProductStock } from "../src/lib/product-pricing";
import { cartLineId, mergeCartLine, normalizeStoredCartLine, checkoutLinePayload } from "../src/lib/cart-line-state";
import { prisma } from "../src/lib/prisma";
import { POST as createOrder } from "../src/app/api/orders/route";

const variants = [
  { id: "combined", sku: "PK-C", name: "٢٥ تيكت + ٣٠ ليبل", price: 300, stock: 0, options: { inventory: "product", tickets: 25, labels: 30 } },
  { id: "tickets", sku: "PK-T", name: "٢٥ تيكت", price: 150, stock: 0, options: { inventory: "product", tickets: 25, labels: 0 } },
  { id: "labels", sku: "PK-L", name: "٣٠ ليبل", price: 150, stock: 0, options: { inventory: "product", tickets: 0, labels: 30 } },
];
const product = { id: "p1", slug: "custom-waterproof-stickers", name: "Tickets & Labels", arabicName: "تيكت وليبل", sku: "PK", price: 300, stock: 10, published: true, tags: [], variants, images: [], customizationFields: [] };

test("packages use DB prices, require a valid selection, and share unchanged product stock", () => {
  for (const v of variants) {
    const result = resolveProductPrice(product, v.id);
    assert.equal(result.unitPrice, v.price);
    assert.equal(result.stock, 10);
    assert.equal(usesProductStock(result.variant), true);
  }
  assert.throws(() => resolveProductPrice(product), /VARIANT_REQUIRED/);
  assert.throws(() => resolveProductPrice(product, "other-product-variant"), /INVALID_VARIANT/);
  assert.equal(resolveProductPrice({ ...product, variants: [{ ...variants[0], price: 321 }] }, "combined").unitPrice, 321);
});

test("three packages persist as distinct cart lines; merging and checkout preserve selection and quantity", () => {
  const lines = variants.map(v => ({ slug: product.slug, variantId: v.id, quantity: 2, price: v.price, lineId: cartLineId({ slug: product.slug, variantId: v.id }) }));
  const restored = (JSON.parse(JSON.stringify(lines)) as typeof lines).map(normalizeStoredCartLine);
  assert.equal(new Set(restored.map(l => l.lineId)).size, 3);
  const merged = mergeCartLine(restored, restored[1]);
  assert.deepEqual(merged.map(l => l.quantity), [2, 4, 2]);
  assert.equal(merged.reduce((sum, l) => sum + l.price * l.quantity, 0), 1500);
  assert.deepEqual(checkoutLinePayload(merged[1]), { slug: product.slug, quantity: 4, variantId: "tickets" });
});

test("actual order handler ignores forged prices, aggregates shared inventory and snapshots every package", async () => {
  const require = createRequire(import.meta.url);
  const authMock = mock.method(require("next-auth/next"), "getServerSession", async () => null);
  let saved: Record<string, unknown> | undefined;
  const decrements: unknown[] = [];
  const transaction = {
    order: { findUnique: async () => null, create: async ({ data }: { data: Record<string, unknown> }) => { saved = data; return { ...data, id: "order", items: (data.items as { create: unknown[] }).create }; } },
    product: { findMany: async () => [product], updateMany: async (args: unknown) => { decrements.push(args); return { count: 1 }; } },
    productVariant: { updateMany: async () => { throw new Error("Package stock must not be decremented"); } },
    coupon: { findFirst: async () => ({ code: "TEN", active: true, type: "PERCENTAGE", value: 10, minimumOrder: 0, usageLimit: null, usageCount: 0, startsAt: null, expiresAt: null }), update: async () => ({}) },
    siteSetting: { findMany: async () => [{ key: "shippingFee", value: "60" }, { key: "freeShippingThreshold", value: "700" }] },
  };
  const originalTransaction = prisma.$transaction;
  prisma.$transaction = (async (callback: (tx: unknown) => Promise<unknown>) => callback(transaction)) as typeof prisma.$transaction;
  const input = { fullName: "Test Customer", phone: "01012345678", governorate: "Cairo", city: "Cairo", address: "Test address", paymentMethod: "COD", couponCode: "TEN", items: variants.map(v => ({ slug: product.slug, variantId: v.id, quantity: 1, price: 1, unitPrice: 1 })) };
  const request = (body: unknown) => new Request("http://localhost/api/orders", { method: "POST", body: JSON.stringify(body) });
  try {
    const response = await createOrder(request(input));
    assert.equal(response.status, 201);
    assert.equal(saved?.subtotal, 600);
    assert.equal(saved?.discount, 60);
    assert.equal(saved?.shipping, 60);
    assert.equal(saved?.total, 600);
    const snapshots = (saved?.items as { create: { unitPrice: number; selectedVariant: unknown; productName: string }[] }).create;
    assert.deepEqual(snapshots.map(i => i.unitPrice), [300, 150, 150]);
    assert.deepEqual(snapshots.map(i => i.selectedVariant), variants.map(v => v.options));
    assert.match(snapshots[0].productName, /٢٥ تيكت/);
    assert.deepEqual(decrements, [{ where: { id: product.id, stock: { gte: 3 } }, data: { stock: { decrement: 3 } } }]);
    assert.equal((await createOrder(request({ ...input, items: [{ slug: product.slug, quantity: 1 }] }))).status, 422);
    assert.equal((await createOrder(request({ ...input, items: [{ slug: product.slug, quantity: 1, variantId: "foreign" }] }))).status, 422);
    assert.equal((await createOrder(request({ ...input, items: variants.map(v => ({ slug: product.slug, variantId: v.id, quantity: 4 })) }))).status, 409);
  } finally { prisma.$transaction = originalTransaction; authMock.mock.restore(); }
});

