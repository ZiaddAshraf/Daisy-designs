import test, { mock } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { prisma } from "../src/lib/prisma";
import { POST } from "../src/app/api/orders/route";

test("actual COD handler: price tampering, coupon contention, replay ownership and malformed quantities", async () => {
  const require = createRequire(import.meta.url);
  const auth = mock.method(require("next-auth/next"), "getServerSession", async () => ({ user: { id: "synthetic-customer" } }));
  const input = { fullName: "Synthetic Buyer", phone: "01000000000", email: "audit@example.invalid", governorate: "Cairo", city: "Test City", address: "Fictional test address", paymentMethod: "COD", requestId: "10000000-0000-4000-8000-000000000000", items: [{ slug: "synthetic-product", quantity: 2, price: 0 }], total: 0, couponCode: "LAST" };
  const request = (body: unknown) => new Request("http://localhost/api/orders", { method: "POST", body: JSON.stringify(body) });
  let existing: Record<string, unknown> | null = null;
  let claims = 1;
  let creations = 0;
  let decrements = 0;
  let saved: Record<string, unknown> | undefined;
  const tx = {
    order: {
      findUnique: async () => existing,
      create: async ({ data }: { data: Record<string, unknown> }) => {
        creations++; saved = data;
        existing = { ...data, id: "synthetic-order", items: (data.items as { create: unknown[] }).create };
        return existing;
      },
    },
    product: {
      findMany: async () => [{ id: "synthetic-product", slug: "synthetic-product", name: "Synthetic", arabicName: "Test", sku: "SYNTHETIC", price: 100, stock: 5, tags: [], published: true, variants: [], images: [], customizationFields: [] }],
      updateMany: async () => { decrements++; return { count: 1 }; },
    },
    coupon: {
      findFirst: async () => ({ id: "synthetic-coupon", code: "LAST", active: true, type: "PERCENTAGE", value: 10, minimumOrder: 0, usageLimit: 1, usageCount: 0 }),
      updateMany: async (args: unknown) => {
        assert.deepEqual(args, { where: { id: "synthetic-coupon", active: true, usageCount: { lt: 1 } }, data: { usageCount: { increment: 1 } } });
        return { count: claims };
      },
    },
    siteSetting: { findMany: async () => [] },
  };
  const original = prisma.$transaction;
  prisma.$transaction = (async (callback: (transaction: unknown) => Promise<unknown>) => callback(tx)) as typeof prisma.$transaction;
  try {
    for (const quantity of [-1, 0, 1.5, 51, "2", null]) {
      assert.equal((await POST(request({ ...input, items: [{ slug: "synthetic-product", quantity }] }))).status, 400);
    }
    assert.equal((await POST(request({ ...input, paymentMethod: "PAYMOB" }))).status, 400);
    assert.equal((await POST(request(input))).status, 201);
    assert.equal(saved?.subtotal, 200); assert.equal(saved?.discount, 20); assert.equal(saved?.shipping, 60); assert.equal(saved?.total, 240);
    assert.equal(saved?.status, "PENDING"); assert.equal(saved?.paymentStatus, "PENDING");
    assert.equal((await POST(request(input))).status, 201);
    assert.equal(creations, 1); assert.equal(decrements, 1);
    existing = Object.assign({}, existing, { userId: "different-customer" });
    const denied = await POST(request(input));
    assert.equal(denied.status, 403); assert.deepEqual(await denied.json(), { error: "ORDER_ACCESS_DENIED" });
    existing = null; claims = 0;
    assert.equal((await POST(request(input))).status, 422);
    assert.equal(creations, 1); assert.equal(decrements, 1);
  } finally { prisma.$transaction = original; auth.mock.restore(); }
});
