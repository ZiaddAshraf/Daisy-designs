import { createHmac, timingSafeEqual } from "node:crypto";

export const ORDER_RECEIPT_COOKIE = "daisy-order-receipt";
export const ORDER_RECEIPT_MAX_AGE = 2 * 60 * 60;

export function receiptSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET ?? (process.env.NODE_ENV !== "production" ? "stitch-development-secret" : undefined);
  if (!secret) throw new Error("ORDER_RECEIPT_NOT_CONFIGURED");
  return secret;
}

export function signOrderReceipt(id: string, secret: string, now = Date.now()): string {
  const payload = Buffer.from(JSON.stringify({ id, expires: now + ORDER_RECEIPT_MAX_AGE * 1000 })).toString("base64url");
  const signature = createHmac("sha256", secret).update(`order-receipt:${payload}`).digest("base64url");
  return `${payload}.${signature}`;
}

export function verifyOrderReceipt(token: string, secret: string, now = Date.now()): string | null {
  try {
    if (token.length > 2048) return null;
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [payload, signature] = parts;
    const expected = createHmac("sha256", secret).update(`order-receipt:${payload}`).digest();
    const received = Buffer.from(signature, "base64url");
    if (received.length !== expected.length || !timingSafeEqual(received, expected)) return null;
    const value = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return typeof value.id === "string" && value.id.length > 0 && Number.isSafeInteger(value.expires) && value.expires > now ? value.id : null;
  } catch { return null; }
}
