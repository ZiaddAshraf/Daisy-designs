import { createHmac, timingSafeEqual } from "node:crypto";
import type { PaymobTransactionObject } from "./types";

/**
 * Computes Paymob HMAC-SHA512 for a transaction object according to official Paymob specification.
 * Concatenation order:
 * 1. amount_cents
 * 2. created_at
 * 3. currency
 * 4. error_occured
 * 5. has_parent_transaction
 * 6. id
 * 7. integration_id
 * 8. is_3d_secure
 * 9. is_auth
 * 10. is_capture
 * 11. is_refunded
 * 12. is_standalone_payment
 * 13. is_voided
 * 14. order.id
 * 15. owner
 * 16. pending
 * 17. source_data.pan
 * 18. source_data.sub_type
 * 19. source_data.type
 * 20. success
 */
export function calculatePaymobHmac(obj: PaymobTransactionObject, hmacSecret: string): string {
  const values = [
    obj.amount_cents,
    obj.created_at,
    obj.currency,
    String(obj.error_occured),
    String(obj.has_parent_transaction),
    obj.id,
    obj.integration_id,
    String(obj.is_3d_secure),
    String(obj.is_auth),
    String(obj.is_capture),
    String(obj.is_refunded),
    String(obj.is_standalone_payment),
    String(obj.is_voided),
    obj.order?.id,
    obj.owner,
    String(obj.pending),
    obj.source_data?.pan ?? "",
    obj.source_data?.sub_type ?? "",
    obj.source_data?.type ?? "",
    String(obj.success),
  ];

  const concatenated = values.map((v) => (v === undefined || v === null ? "" : String(v))).join("");
  return createHmac("sha512", hmacSecret).update(concatenated).digest("hex");
}

/**
 * Timing-safe HMAC verification
 */
export function verifyPaymobHmac(
  obj: PaymobTransactionObject,
  receivedHmac: string | undefined | null,
  hmacSecret: string
): boolean {
  if (!receivedHmac || !hmacSecret || typeof receivedHmac !== "string") {
    return false;
  }

  const calculated = calculatePaymobHmac(obj, hmacSecret);
  const calculatedBuf = Buffer.from(calculated.toLowerCase(), "hex");
  const receivedBuf = Buffer.from(receivedHmac.toLowerCase(), "hex");

  if (calculatedBuf.length !== receivedBuf.length) {
    return false;
  }

  return timingSafeEqual(calculatedBuf, receivedBuf);
}

