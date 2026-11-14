import assert from "node:assert/strict";
import test from "node:test";
import type { PrismaClient } from "@prisma/client";
import { setStorageBackendForTesting } from "../src/lib/storage";
import type { StorageBackend } from "../src/lib/storage";

test("Telegram notice sends complete order details, resumes failed parts, and hides private storage keys", async t => {
  process.env.TELEGRAM_BOT_TOKEN = "123456:synthetic";
  process.env.TELEGRAM_OWNER_CHAT_ID = "-100123456789";
  t.after(() => {
    delete process.env.TELEGRAM_BOT_TOKEN;
    delete process.env.TELEGRAM_OWNER_CHAT_ID;
  });
  const order = {
    number: "TEST-ORDER", shippingAddress: { fullName: "Test Name", phone: "01000000000", city: "Test City", address: "Demo address" },
    items: [{ productName: "Test product", productSku: "TEST-SKU", quantity: 2, unitPrice: 200, customization: { child_photo: "private:story_child_example.jpg" } }],
    paymentMethod: "COD", subtotal: 400, discount: 20, shipping: 60, total: 440, notes: "test ".repeat(750), couponCode: "SAVE",
  };
  const row = { nextPart: 0, nextPhoto: 0, acceptedAt: null as Date | null, availableAt: new Date(0) };
  const delegate = {
    findUnique: async () => ({ ...row, order }),
    updateMany: async ({ where, data }: { where: { nextPart: number; nextPhoto?: number }; data: Partial<typeof row> }) => {
      if (row.nextPart !== where.nextPart || (where.nextPhoto !== undefined && row.nextPhoto !== where.nextPhoto)) return { count: 0 };
      Object.assign(row, data);
      return { count: 1 };
    },
  };
  const shared = globalThis as typeof globalThis & { prisma?: PrismaClient };
  shared.prisma = { telegramOrderNotice: delegate } as unknown as PrismaClient;
  t.after(() => { delete shared.prisma; });
  const { dispatchTelegramOrderNotice } = await import("../src/lib/telegram-order-notice");
  const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
  setStorageBackendForTesting({
    driverName: "test",
    put: async () => ({ key: "private:test.jpg" }),
    get: async () => ({ data: jpeg, contentType: "image/jpeg", contentLength: jpeg.length }),
    delete: async () => true,
    exists: async () => true,
  } satisfies StorageBackend);
  t.after(() => setStorageBackendForTesting(null));
  const accepted: string[] = [];
  let acceptedPhotos = 0;
  let rejectOnce = true;
  let rejectPhotoOnce = true;
  t.mock.method(globalThis, "fetch", async (url: RequestInfo | URL, options: RequestInit) => {
    if (String(url).endsWith("/sendPhoto")) {
      assert.ok(options.body instanceof FormData);
      assert.equal(options.body.get("chat_id"), "-100123456789");
      assert.match(String(options.body.get("caption")), /صورة الطفل/);
      assert.ok(options.body.get("photo") instanceof Blob);
      if (rejectPhotoOnce) {
        rejectPhotoOnce = false;
        return Response.json({ ok: false }, { status: 503 });
      }
      acceptedPhotos++;
      return Response.json({ ok: true, result: { message_id: 100 + acceptedPhotos } });
    }
    assert.equal(String(url), "https://api.telegram.org/bot123456:synthetic/sendMessage");
    const payload = JSON.parse(String(options.body));
    assert.equal(payload.chat_id, "-100123456789");
    if (payload.text.includes("الجزء 2 من") && rejectOnce) {
      rejectOnce = false;
      return Response.json({ ok: false }, { status: 503 });
    }
    accepted.push(payload.text);
    return Response.json({ ok: true, result: { message_id: accepted.length } });
  });
  await dispatchTelegramOrderNotice("test");
  assert.equal(row.nextPart, 1);
  assert.equal(row.acceptedAt, null);
  row.availableAt = new Date(0);
  await dispatchTelegramOrderNotice("test");
  assert.equal(row.acceptedAt, null);
  row.availableAt = new Date(0);
  await dispatchTelegramOrderNotice("test");
  assert.ok(row.acceptedAt);
  await dispatchTelegramOrderNotice("test");
  assert.equal(row.nextPhoto, 1);
  assert.equal(acceptedPhotos, 1);
  assert.ok(accepted.length >= 2);
  assert.equal(accepted.filter(text => text.includes("الجزء 1 من")).length, 1);
  const message = accepted.join("");
  for (const field of ["TEST-ORDER", "Test Name", "01000000000", "Test City", "Demo address", "TEST-SKU", "2 × 200", "SAVE", "440", "60", "20"]) {
    assert.ok(message.includes(field), field);
  }
  assert.ok(!message.includes("private:"));
  assert.match(message, /👤 بيانات العميل\n/);
  assert.match(message, /📦 المنتجات\n/);
  assert.match(message, /💰 ملخص الطلب\n/);
  assert.ok(accepted.every(text => text.length < 4096));
});
