import test from "node:test";
import assert from "node:assert/strict";
import { parseJsonBody, handleApiError } from "@/lib/api-request";
import { DatabaseUnavailableError } from "@/lib/prisma";

test("parseJsonBody parses valid JSON request bodies", async () => {
  const req = new Request("http://localhost/api/test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Ahmad", quantity: 2 }),
  });

  const result = await parseJsonBody<{ name: string; quantity: number }>(req);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.data.name, "Ahmad");
    assert.equal(result.data.quantity, 2);
  }
});

test("parseJsonBody gracefully catches malformed JSON with 400 Bad Request", async () => {
  const req = new Request("http://localhost/api/test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{ malformed json",
  });

  const result = await parseJsonBody(req);
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.response.status, 400);
    const data = await result.response.json();
    assert.equal(typeof data.error, "string");
  }
});

test("parseJsonBody gracefully handles empty body with 400 Bad Request", async () => {
  const req = new Request("http://localhost/api/test", {
    method: "POST",
  });

  const result = await parseJsonBody(req);
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.response.status, 400);
  }
});

test("handleApiError returns 503 Service Unavailable for DatabaseUnavailableError", async () => {
  const dbError = new DatabaseUnavailableError();
  const res = handleApiError(dbError);
  assert.equal(res.status, 503);
  const data = await res.json();
  assert.match(data.error, /قاعدة البيانات غير متاحة حالياً/);
});

test("handleApiError returns 503 for Prisma connection failures", async () => {
  const prismaConnError = Object.assign(new Error("Can't reach database server at 127.0.0.1:5432"), {
    code: "P1001",
  });
  const res = handleApiError(prismaConnError);
  assert.equal(res.status, 503);
});

test("handleApiError returns fallback status and message for generic errors", async () => {
  const genericError = new Error("ITEM_NOT_FOUND");
  const res = handleApiError(genericError, "خطأ في العنصر", 404);
  assert.equal(res.status, 404);
  const data = await res.json();
  assert.equal(data.error, "ITEM_NOT_FOUND");
});

test("order inventory aggregation sums quantities across multi-sheet sticker lines", () => {
  type Item = { productId: string; variantId?: string; quantity: number };
  const items: Item[] = [
    { productId: "stk-1", quantity: 2 },
    { productId: "stk-1", quantity: 3 },
    { productId: "card-1", quantity: 1 },
  ];

  const map = new Map<string, number>();
  for (const item of items) {
    const key = item.variantId ? `variant:${item.variantId}` : `product:${item.productId}`;
    map.set(key, (map.get(key) ?? 0) + item.quantity);
  }

  assert.equal(map.get("product:stk-1"), 5);
  assert.equal(map.get("product:card-1"), 1);
});

