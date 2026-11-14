import assert from "node:assert/strict";
import test from "node:test";
import type { PrismaClient } from "@prisma/client";

test("merchant notification resumes at the rejected part and skips accepted orders", async (t) => {
  process.env.WHATSAPP_ACCESS_TOKEN = "synthetic";
  process.env.WHATSAPP_PHONE_NUMBER_ID = "123456";
  process.env.WHATSAPP_ORDER_TEMPLATE = "merchant_notice";
  const order = {
    number: "TEST-ORDER", shippingAddress: { fullName: "Test Name", phone: "01000000000", city: "Test City", address: "Demo address" },
    items: [{ productName: "Test product", productSku: "TEST-SKU", quantity: 2, unitPrice: 200, customization: { child_photo: "private:story_child_example.jpg" } }],
    paymentMethod: "COD", subtotal: 400, discount: 20, shipping: 60, total: 440, notes: "test ".repeat(210), couponCode: "SAVE",
  };
  const row = { nextPart: 0, acceptedAt: null as Date | null, availableAt: new Date(0) };
  const delegate = {
    findUnique: async () => ({ ...row, order }),
    updateMany: async ({ where, data }: { where: { nextPart: number }; data: Partial<typeof row> }) => {
      if (row.nextPart !== where.nextPart) return { count: 0 };
      Object.assign(row, data);
      return { count: 1 };
    },
  };
  const shared = globalThis as typeof globalThis & { prisma?: PrismaClient };
  shared.prisma = { whatsAppOrderNotice: delegate } as unknown as PrismaClient;
  t.after(() => { delete shared.prisma; });
  const { dispatchOrderNotice } = await import("../src/lib/whatsapp-order-notice");
  const accepted: string[] = [];
  let rejectOnce = true;
  t.mock.method(globalThis, "fetch", async (url: RequestInfo | URL, options: RequestInit) => {
    assert.match(String(url), /^https:\/\/graph\.facebook\.com\/v\d+\.\d+\/123456\/messages$/);
    const payload = JSON.parse(String(options.body));
    assert.equal(payload.to, "201152606234");
    assert.equal(payload.type, "template");
    const [number, part, details] = payload.template.components[0].parameters;
    assert.equal(number.text, order.number);
    if (part.text.startsWith("2/") && rejectOnce) {
      rejectOnce = false;
      return Response.json({}, { status: 503 });
    }
    accepted.push(details.text);
    return Response.json({ messages: [{ id: "wamid.synthetic" }] });
  });
  await dispatchOrderNotice("test");
  assert.equal(row.nextPart, 1);
  assert.equal(row.acceptedAt, null);
  row.availableAt = new Date(0);
  await dispatchOrderNotice("test");
  assert.ok(row.acceptedAt);
  await dispatchOrderNotice("test");
  assert.equal(accepted.length, 2);
  const message = accepted.join("");
  for (const field of ["Test Name", "01000000000", "Test City", "Demo address", "TEST-SKU", "2 × 200", "SAVE", "440", "60", "20"]) assert.ok(message.includes(field), field);
  assert.ok(!message.includes("private:"));
});
