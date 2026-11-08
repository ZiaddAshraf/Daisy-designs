import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isDatabaseUnavailable, prisma } from "@/lib/prisma";
import { getPaymobClient } from "@/lib/paymob";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
  }

  const { orderId, orderNumber } = body as { orderId?: string; orderNumber?: string };
  if (!orderId && !orderNumber) {
    return NextResponse.json({ error: "ORDER_IDENTIFIER_REQUIRED" }, { status: 400 });
  }

  const client = getPaymobClient();
  if (!client.isConfigured()) {
    return NextResponse.json({ error: "PAYMOB_NOT_CONFIGURED" }, { status: 503 });
  }

  try {
    const session = await getServerSession(authOptions);

    const order = await prisma.order.findFirst({
      where: orderId ? { id: orderId } : { number: orderNumber },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: "ORDER_NOT_FOUND" }, { status: 404 });
    }

    // Customer ownership verification
    if (order.userId && order.userId !== session?.user?.id) {
      return NextResponse.json({ error: "ORDER_ACCESS_DENIED" }, { status: 403 });
    }

    if (order.paymentStatus === "PAID") {
      return NextResponse.json({ error: "ORDER_ALREADY_PAID" }, { status: 409 });
    }

    if (order.paymentMethod !== "PAYMOB") {
      return NextResponse.json({ error: "INVALID_PAYMENT_METHOD" }, { status: 400 });
    }

    const shippingAddress = (order.shippingAddress as Record<string, string>) || {};

    const origin = request.headers.get("origin") || request.headers.get("host") || "http://localhost:3000";
    const baseUrl = origin.startsWith("http") ? origin : `https://${origin}`;

    const intention = await client.createIntention({
      amount: order.total,
      currency: "EGP",
      orderNumber: order.number,
      items: order.items.map((item) => ({
        name: item.productName,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
      })),
      billingData: {
        fullName: shippingAddress.fullName || "Customer",
        phone: shippingAddress.phone || "01152606234",
        email: shippingAddress.email || undefined,
        city: shippingAddress.city || "Cairo",
        governorate: shippingAddress.governorate || "Cairo",
        address: shippingAddress.address || "Address",
      },
      notificationUrl: `${baseUrl}/api/payments/paymob/webhook`,
      redirectionUrl: `${baseUrl}/checkout/success?orderNumber=${encodeURIComponent(order.number)}`,
    });

    return NextResponse.json({
      success: true,
      orderNumber: order.number,
      amountCents: intention.amountCents,
      clientSecret: intention.clientSecret,
      paymentUrl: intention.paymentUrl,
    });
  } catch (error) {
    if (isDatabaseUnavailable(error)) {
      return NextResponse.json({ error: "DATABASE_UNAVAILABLE" }, { status: 503 });
    }
    const message = error instanceof Error ? error.message : "INITIATION_FAILED";
    return NextResponse.json(
      { error: message.startsWith("PAYMOB_") ? message : "PAYMENT_INITIATION_FAILED" },
      { status: 500 }
    );
  }
}

