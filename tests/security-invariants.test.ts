import assert from "node:assert/strict";
import test from "node:test";
import {
  checkRateLimit,
  getClientIp,
  resetRateLimitsForTesting,
} from "../src/lib/rate-limit";
import {
  canTransitionOrderStatus,
  canTransitionPaymentStatus,
  shouldRestockOnStatusChange,
} from "../src/lib/order-state-machine";

test("Rate Limiter: enforces request bounds and isolates client IPs", () => {
  resetRateLimitsForTesting();

  const ip1 = "192.168.1.10";
  const ip2 = "192.168.1.20";
  const options = { intervalMs: 1000, maxRequests: 3 };

  // 1. IP 1 uses up its 3 requests
  assert.equal(checkRateLimit(`action:${ip1}`, options).success, true);
  assert.equal(checkRateLimit(`action:${ip1}`, options).success, true);
  assert.equal(checkRateLimit(`action:${ip1}`, options).success, true);

  // 4th request from IP 1 is rate-limited
  const blocked = checkRateLimit(`action:${ip1}`, options);
  assert.equal(blocked.success, false);
  assert.equal(blocked.remaining, 0);

  // 2. IP 2 remains unaffected (isolated bucket)
  const ip2Res = checkRateLimit(`action:${ip2}`, options);
  assert.equal(ip2Res.success, true);
  assert.equal(ip2Res.remaining, 2);

  resetRateLimitsForTesting();
});

test("Rate Limiter: getClientIp safely extracts sanitized IP and rejects spoofed junk", () => {
  // Valid x-forwarded-for
  const req1 = new Request("http://localhost:3000", {
    headers: { "x-forwarded-for": "203.0.113.195, 70.41.3.18" },
  });
  assert.equal(getClientIp(req1), "203.0.113.195");

  // Valid x-real-ip
  const req2 = new Request("http://localhost:3000", {
    headers: { "x-real-ip": "198.51.100.4" },
  });
  assert.equal(getClientIp(req2), "198.51.100.4");

  // Malformed / injection string falls back safely
  const req3 = new Request("http://localhost:3000", {
    headers: { "x-forwarded-for": "DROP TABLE users;--" },
  });
  assert.equal(getClientIp(req3), "127.0.0.1");

  // Missing headers fallback
  const req4 = new Request("http://localhost:3000");
  assert.equal(getClientIp(req4), "127.0.0.1");
});

test("Order State Machine: enforces valid lifecycle transitions and prevents invalid jumps", () => {
  // Valid order status transitions
  assert.equal(canTransitionOrderStatus("PENDING", "CONFIRMED"), true);
  assert.equal(canTransitionOrderStatus("PENDING", "CANCELLED"), true);
  assert.equal(canTransitionOrderStatus("CONFIRMED", "PROCESSING"), true);
  assert.equal(canTransitionOrderStatus("PROCESSING", "SHIPPED"), true);
  assert.equal(canTransitionOrderStatus("SHIPPED", "DELIVERED"), true);
  assert.equal(canTransitionOrderStatus("CONFIRMED", "CONFIRMED"), true); // Idempotent

  // Invalid order jumps
  assert.equal(canTransitionOrderStatus("PENDING", "DELIVERED"), false);
  assert.equal(canTransitionOrderStatus("PENDING", "SHIPPED"), false);
  assert.equal(canTransitionOrderStatus("DELIVERED", "PENDING"), false);
  assert.equal(canTransitionOrderStatus("DELIVERED", "CANCELLED"), false);
  assert.equal(canTransitionOrderStatus("CANCELLED", "CONFIRMED"), false);
  assert.equal(canTransitionOrderStatus("CANCELLED", "SHIPPED"), false);

  // Valid payment status transitions
  assert.equal(canTransitionPaymentStatus("PENDING", "PAID"), true);
  assert.equal(canTransitionPaymentStatus("PENDING", "FAILED"), true);
  assert.equal(canTransitionPaymentStatus("PAID", "FAILED"), true); // Refund
  assert.equal(canTransitionPaymentStatus("FAILED", "PENDING"), true); // Retry

  // Restocking policy
  assert.equal(shouldRestockOnStatusChange("PENDING", "CANCELLED"), true);
  assert.equal(shouldRestockOnStatusChange("CONFIRMED", "CANCELLED"), true);
  assert.equal(shouldRestockOnStatusChange("PROCESSING", "CANCELLED"), true);
  assert.equal(shouldRestockOnStatusChange("CANCELLED", "CANCELLED"), false); // No duplicate restock
  assert.equal(shouldRestockOnStatusChange("PENDING", "CONFIRMED"), false);
});

