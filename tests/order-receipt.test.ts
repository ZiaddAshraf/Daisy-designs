import test from "node:test";
import assert from "node:assert/strict";
import { signOrderReceipt, verifyOrderReceipt, ORDER_RECEIPT_MAX_AGE } from "../src/lib/order-receipt";

test("receipt rejects tampering, wrong secrets, expiry and malformed values", () => {
  const now = 100000;
  const token = signOrderReceipt("synthetic-order", "synthetic-secret", now);
  assert.equal(verifyOrderReceipt(token, "synthetic-secret", now), "synthetic-order");
  assert.equal(verifyOrderReceipt(token, "wrong-secret", now), null);
  assert.equal(verifyOrderReceipt(token, "synthetic-secret", now + ORDER_RECEIPT_MAX_AGE * 1000), null);
  const forgedPayload = Buffer.from(JSON.stringify({ id: "another-order", expires: now + 10000 })).toString("base64url");
  assert.equal(verifyOrderReceipt(`${forgedPayload}.${token.split(".")[1]}`, "synthetic-secret", now), null);
  for (const bad of ["", "bad", "a.b.c", ".", "x".repeat(3000)]) assert.equal(verifyOrderReceipt(bad, "synthetic-secret", now), null);
});
