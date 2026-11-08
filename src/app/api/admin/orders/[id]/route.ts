import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-auth";
import { handleApiError, parseJsonBody } from "@/lib/api-request";
import {
  canTransitionOrderStatus,
  canTransitionPaymentStatus,
  shouldRestockOnStatusChange,
  type OrderStatus,
  type PaymentStatus,
} from "@/lib/order-state-machine";

const schema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]),
  paymentStatus: z.enum(["PENDING", "PAID", "FAILED"]).optional(),
});

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const { id } = await context.params;

  const body = await parseJsonBody(request);
  if (!body.ok) return body.response;

  const parsed = schema.safeParse(body.data);
  if (!parsed.success) return NextResponse.json({ error: "حالة غير صالحة" }, { status: 400 });

  try {
    const existing = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "ORDER_NOT_FOUND" }, { status: 404 });
    }

    const currentStatus = existing.status as OrderStatus;
    const targetStatus = parsed.data.status as OrderStatus;

    if (!canTransitionOrderStatus(currentStatus, targetStatus)) {
      return NextResponse.json(
        { error: "INVALID_STATUS_TRANSITION", currentStatus, targetStatus },
        { status: 422 }
      );
    }

    if (parsed.data.paymentStatus) {
      const currentPayment = existing.paymentStatus as PaymentStatus;
      const targetPayment = parsed.data.paymentStatus as PaymentStatus;
      if (!canTransitionPaymentStatus(currentPayment, targetPayment)) {
        return NextResponse.json(
          { error: "INVALID_PAYMENT_TRANSITION", currentPayment, targetPayment },
          { status: 422 }
        );
      }
    }

    const needsRestock = shouldRestockOnStatusChange(currentStatus, targetStatus);

    const updated = await prisma.$transaction(async (tx) => {
      if (needsRestock) {
        // Restore inventory for each line item
        for (const item of existing.items) {
          if (item.variantId) {
            await tx.productVariant.updateMany({
              where: { id: item.variantId },
              data: { stock: { increment: item.quantity } },
            });
          } else if (item.productId) {
            await tx.product.updateMany({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            });
          }
        }

        // Restore coupon usage count
        if (existing.couponCode) {
          await tx.coupon.updateMany({
            where: { code: existing.couponCode, usageCount: { gt: 0 } },
            data: { usageCount: { decrement: 1 } },
          });
        }
      }

      return tx.order.update({
        where: { id },
        data: parsed.data,
      });
    });

    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
