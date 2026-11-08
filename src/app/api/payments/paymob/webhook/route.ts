import { NextResponse } from "next/server";
import { isDatabaseUnavailable, prisma } from "@/lib/prisma";
import { getPaymobClient } from "@/lib/paymob";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const url = new URL(request.url);
  const queryHmac = url.searchParams.get("hmac") || request.headers.get("x-paymob-hmac");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON_PAYLOAD" }, { status: 400 });
  }

  const client = getPaymobClient();
  const parsed = client.verifyWebhook(body, queryHmac ?? undefined);

  if (!parsed.isValid) {
    return NextResponse.json({ error: "INVALID_HMAC_SIGNATURE" }, { status: 401 });
  }

  const orderNumber = parsed.orderNumber;
  if (!orderNumber) {
    return NextResponse.json({ error: "MISSING_ORDER_REFERENCE" }, { status: 400 });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { number: orderNumber },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: "ORDER_NOT_FOUND" }, { status: 404 });
    }

    // Verify amount in cents and currency match exactly
    if (parsed.amountCents !== undefined) {
      const expectedCents = Math.round(order.total * 100);
      if (parsed.amountCents !== expectedCents) {
        return NextResponse.json({ error: "AMOUNT_MISMATCH" }, { status: 400 });
      }
    }

    if (parsed.currency && parsed.currency.toUpperCase() !== "EGP") {
      return NextResponse.json({ error: "CURRENCY_MISMATCH" }, { status: 400 });
    }

    // Idempotent guard: if already paid, do not repeat side effects
    if (order.paymentStatus === "PAID") {
      return NextResponse.json({ received: true, alreadyPaid: true });
    }

    if (parsed.status === "PAID") {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "PAID",
          status: order.status === "PENDING" ? "CONFIRMED" : order.status,
        },
      });
    } else if (parsed.status === "CANCELLED") {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "FAILED",
          status: "CANCELLED",
        },
      });
    } else if (parsed.status === "FAILED") {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "FAILED",
        },
      });
    }

    return NextResponse.json({ received: true, status: parsed.status });
  } catch (error) {
    if (isDatabaseUnavailable(error)) {
      return NextResponse.json({ error: "DATABASE_UNAVAILABLE" }, { status: 503 });
    }
    return NextResponse.json({ error: "WEBHOOK_PROCESSING_FAILED" }, { status: 500 });
  }
}

