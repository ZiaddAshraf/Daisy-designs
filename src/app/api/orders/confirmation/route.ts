import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ORDER_RECEIPT_COOKIE, receiptSecret, verifyOrderReceipt } from "@/lib/order-receipt";

export async function GET() {
  const headers = { "Cache-Control": "private, no-store" };
  try {
    const token = (await cookies()).get(ORDER_RECEIPT_COOKIE)?.value;
    const id = token ? verifyOrderReceipt(token, receiptSecret()) : null;
    if (!id) return NextResponse.json({ error: "ORDER_RECEIPT_REQUIRED" }, { status: 401, headers });
    const order = await prisma.order.findUnique({
      where: { id },
      select: {
        number: true,
        total: true,
        status: true,
        paymentStatus: true,
        paymentMethod: true,
        shippingAddress: true,
        items: { select: { productName: true, quantity: true, unitPrice: true, customization: true } },
      },
    });
    if (!order) return NextResponse.json({ error: "ORDER_NOT_FOUND" }, { status: 404, headers });
    return NextResponse.json(order, { headers });
  } catch {
    return NextResponse.json({ error: "ORDER_CONFIRMATION_UNAVAILABLE" }, { status: 503, headers });
  }
}
