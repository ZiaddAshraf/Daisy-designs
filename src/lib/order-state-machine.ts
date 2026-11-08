export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED";

const ALLOWED_ORDER_TRANSITIONS: Record<OrderStatus, ReadonlySet<OrderStatus>> = {
  PENDING: new Set(["CONFIRMED", "CANCELLED"]),
  CONFIRMED: new Set(["PROCESSING", "CANCELLED"]),
  PROCESSING: new Set(["SHIPPED", "CANCELLED"]),
  SHIPPED: new Set(["DELIVERED", "CANCELLED"]),
  DELIVERED: new Set([]), // Terminal
  CANCELLED: new Set([]), // Terminal
};

const ALLOWED_PAYMENT_TRANSITIONS: Record<PaymentStatus, ReadonlySet<PaymentStatus>> = {
  PENDING: new Set(["PAID", "FAILED"]),
  PAID: new Set(["FAILED"]), // Refund / Chargeback
  FAILED: new Set(["PENDING", "PAID"]), // Retry
};

export function canTransitionOrderStatus(from: OrderStatus, to: OrderStatus): boolean {
  if (from === to) return true;
  const allowed = ALLOWED_ORDER_TRANSITIONS[from];
  return allowed ? allowed.has(to) : false;
}

export function canTransitionPaymentStatus(from: PaymentStatus, to: PaymentStatus): boolean {
  if (from === to) return true;
  const allowed = ALLOWED_PAYMENT_TRANSITIONS[from];
  return allowed ? allowed.has(to) : false;
}

/**
 * Checks whether an order status change requires restoring inventory and coupons.
 * True when transitioning into CANCELLED from an active uncancelled state.
 */
export function shouldRestockOnStatusChange(from: OrderStatus, to: OrderStatus): boolean {
  return to === "CANCELLED" && from !== "CANCELLED";
}

