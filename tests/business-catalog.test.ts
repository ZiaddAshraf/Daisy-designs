import test, { mock } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { resolveProductPrice, stickerPackageVariants, usesProductStock } from "../src/lib/product-pricing";
import { cartLineId, mergeCartLine, normalizeStoredCartLine, checkoutLinePayload } from "../src/lib/cart-line-state";
import { prisma } from "../src/lib/prisma";
import { POST as createOrder } from "../src/app/api/orders/route";

const variants = [
  { id: "combined", sku: "DD-STK-050-COMBINED", name: "٢٠ تيكت + ٢٥ ليبل", price: 300, stock: 0, options: { inventory: "product", tickets: 20, labels: 25 } },
  { id: "tickets", sku: "DD-STK-050-TICKETS", name: "٢٠ تيكت", price: 150, stock: 0, options: { inventory: "product", tickets: 20, labels: 0 } },
  { id: "labels", sku: "DD-STK-050-LABELS", name: "٢٥ ليبل", price: 150, stock: 0, options: { inventory: "product", tickets: 0, labels: 25 } },
];
const product = { id: "p1", slug: "custom-waterproof-stickers", name: "Tickets & Labels", arabicName: "تيكت وليبل", sku: "PK", price: 300, stock: 10, published: true, tags: [], variants, images: [], customizationFields: [
  { key: "design_theme", type: "SELECT", required: true, maxLength: 80, options: [{ value: "super-cool-dino" }] },
  { key: "child_name", type: "TEXT", required: true, maxLength: 80, options: [] },
] };

test("packages use DB prices, require a valid selection, and share unchanged product stock", () => {
  for (const v of variants) {
    const result = resolveProductPrice(product, v.id);
    assert.equal(result.unitPrice, v.price);
    assert.equal(result.stock, 10);
    assert.equal(usesProductStock(result.variant), true);
  }
  assert.throws(() => resolveProductPrice(product), /VARIANT_REQUIRED/);
  assert.throws(() => resolveProductPrice(product, "other-product-variant"), /INVALID_VARIANT/);
  assert.throws(() => resolveProductPrice({ ...product, variants: [...variants, { ...variants[0], id: "single", sku: "DD-STK-050-SINGLE" }] }, "single"), /INVALID_VARIANT/);
  assert.equal(resolveProductPrice({ ...product, variants: [{ ...variants[0], price: 321 }] }, "combined").unitPrice, 321);
});

test("AI combined pack is priced at 400 EGP and listed beside the real-photo pack", () => {
  const aiVariant = { ...variants[0], id: "combined-ai", sku: "DD-STK-050-COMBINED-AI", name: "٢٠ تيكت + ٢٥ ليبل — صورة AI", price: 400 };
  const pricedProduct = { ...product, variants: [...variants, aiVariant] };
  assert.deepEqual(stickerPackageVariants([...pricedProduct.variants].reverse()).map(v => v.id), ["combined", "combined-ai", "tickets", "labels"]);
  assert.equal(resolveProductPrice(pricedProduct, "combined-ai").unitPrice, 400);
});

test("AI ticket and label packs each cost 200 EGP", () => {
  const aiTickets = { ...variants[1], id: "tickets-ai", sku: "DD-STK-050-TICKETS-AI", price: 200 };
  const aiLabels = { ...variants[2], id: "labels-ai", sku: "DD-STK-050-LABELS-AI", price: 200 };
  const aiCombined = { ...variants[0], id: "combined-ai", sku: "DD-STK-050-COMBINED-AI", price: 400 };
  const pricedProduct = { ...product, variants: [...variants, aiTickets, aiLabels, aiCombined] };
  assert.deepEqual(stickerPackageVariants([...pricedProduct.variants].reverse()).map(v => v.id), ["combined", "combined-ai", "tickets", "tickets-ai", "labels", "labels-ai"]);
  assert.equal(resolveProductPrice(pricedProduct, aiTickets.id).unitPrice, 200);
  assert.equal(resolveProductPrice(pricedProduct, aiLabels.id).unitPrice, 200);
  assert.equal(resolveProductPrice(pricedProduct, "tickets").unitPrice, 150);
  assert.equal(resolveProductPrice(pricedProduct, "labels").unitPrice, 150);
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
    coupon: { findFirst: async () => ({ id: "coupon", code: "TEN", active: true, type: "PERCENTAGE", value: 10, minimumOrder: 0, usageLimit: null, usageCount: 0, startsAt: null, expiresAt: null }), updateMany: async () => ({ count: 1 }) },
    siteSetting: { findMany: async () => [{ key: "shippingFee", value: "60" }, { key: "freeShippingThreshold", value: "700" }] },
  };
  const originalTransaction = prisma.$transaction;
  prisma.$transaction = (async (callback: (tx: unknown) => Promise<unknown>) => callback(transaction)) as typeof prisma.$transaction;
  const input = { fullName: "Test Customer", phone: "01012345678", governorate: "Cairo", city: "Cairo", address: "Test address", paymentMethod: "COD", couponCode: "TEN", items: variants.map(v => ({ slug: product.slug, variantId: v.id, quantity: 1, price: 1, unitPrice: 1, customization: {
    design_theme: "super-cool-dino", child_name: "Omar",
    ...(v.id === "combined" ? { ticket_designs: '[["super-cool-dino",12],["kuromi-sanrio",8]]', label_designs: '[["super-cool-dino",10],["kuromi-sanrio",15]]' } : {}),
  } })) };
  const request = (body: unknown) => new Request("http://localhost/api/orders", { method: "POST", body: JSON.stringify(body) });
  try {
    const response = await createOrder(request(input));
    assert.equal(response.status, 201);
    assert.equal(saved?.subtotal, 600);
    assert.equal(saved?.discount, 60);
    assert.equal(saved?.shipping, 60);
    assert.equal(saved?.total, 600);
    const snapshots = (saved?.items as { create: { unitPrice: number; selectedVariant: unknown; productName: string; customization: Record<string, string> }[] }).create;
    assert.deepEqual(snapshots.map(i => i.unitPrice), [300, 150, 150]);
    assert.deepEqual(snapshots.map(i => i.selectedVariant), variants.map(v => v.options));
    assert.equal(snapshots[0].customization.ticket_designs, '[["kuromi-sanrio",8],["super-cool-dino",12]]');
    assert.equal(snapshots[0].customization.label_designs, '[["kuromi-sanrio",15],["super-cool-dino",10]]');
  assert.match(snapshots[0].productName, /٢٠ تيكت/);
    assert.deepEqual(decrements, [{ where: { id: product.id, stock: { gte: 3 } }, data: { stock: { decrement: 3 } } }]);
    assert.equal((await createOrder(request({ ...input, items: [{ slug: product.slug, quantity: 1 }] }))).status, 422);
    assert.equal((await createOrder(request({ ...input, items: [{ slug: product.slug, quantity: 1, variantId: "foreign" }] }))).status, 422);
    assert.equal((await createOrder(request({ ...input, items: variants.map(v => ({ slug: product.slug, variantId: v.id, quantity: 4, customization: { design_theme: "super-cool-dino", child_name: "Omar" } })) }))).status, 409);
  } finally { prisma.$transaction = originalTransaction; authMock.mock.restore(); }
});

