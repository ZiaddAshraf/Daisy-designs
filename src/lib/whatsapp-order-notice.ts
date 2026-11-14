import { prisma } from "@/lib/prisma";
import { DEFAULT_WHATSAPP_NUMBER, sanitizeCustomizationForWhatsApp } from "@/lib/whatsapp-order-message";
import type { Prisma } from "@prisma/client";

export function whatsappConfigured() {
  return Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.WHATSAPP_ORDER_TEMPLATE);
}

function stringFields(value: Prisma.JsonValue): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === "string"));
}

type NoticeOrder = Prisma.OrderGetPayload<{ include: { items: true } }>;

export function orderNoticeParts(order: Pick<NoticeOrder, "shippingAddress" | "items" | "paymentMethod" | "subtotal" | "discount" | "shipping" | "total" | "notes" | "couponCode">) {
  const address = stringFields(order.shippingAddress);
  const fields = [
    `العميل: ${address.fullName}، الموبايل: ${address.phone}`,
    address.email,
    `العنوان: ${[address.governorate, address.city, address.address].filter(Boolean).join("، ")}`,
    ...order.items.map((item, index) => [
      `${index + 1}. ${item.productName} (${item.productSku})`,
      `${item.quantity} × ${item.unitPrice} = ${item.quantity * item.unitPrice} ج.م`,
      sanitizeCustomizationForWhatsApp(stringFields(item.customization), "ar"),
    ].filter(Boolean).join("، ")),
    order.notes && `ملاحظات: ${order.notes}`,
    `الدفع: ${order.paymentMethod === "COD" ? "عند الاستلام" : order.paymentMethod}`,
    `المجموع: ${order.subtotal}، الخصم: ${order.discount}`,
    order.couponCode && `الكوبون: ${order.couponCode}`,
    `الشحن: ${order.shipping}، الإجمالي: ${order.total} ج.م`,
  ];
  const text = fields.filter(Boolean).join(" | ").replace(/\s+/gu, " ").trim();
  return Array.from(text.matchAll(/.{1,800}/gu), match => match[0]);
}

export async function sendOrderPart(number: string, part: string, details: string) {
  const version = process.env.WHATSAPP_GRAPH_VERSION || "v23.0";
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!/^v\d+\.\d+$/.test(version) || !/^\d+$/.test(phoneId ?? "")) throw new Error("Invalid WhatsApp configuration");
  const response = await fetch(`https://graph.facebook.com/${version}/${phoneId}/messages`, {
    method: "POST",
    redirect: "error",
    signal: AbortSignal.timeout(6000),
    headers: { Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp", to: DEFAULT_WHATSAPP_NUMBER, type: "template",
      template: {
        name: process.env.WHATSAPP_ORDER_TEMPLATE, language: { code: "ar" },
        components: [{ type: "body", parameters: [number, part, details].map(text => ({ type: "text", text })) }],
      },
    }),
  });
  const result = await response.json();
  if (!response.ok || !result.messages?.[0]?.id) throw new Error(`WhatsApp request failed (HTTP ${response.status})`);
}

export async function dispatchOrderNotice(orderId: string) {
  if (!whatsappConfigured()) return;
  const notice = await prisma.whatsAppOrderNotice.findUnique({
    where: { orderId }, include: { order: { include: { items: { orderBy: { id: "asc" } } } } },
  });
  if (!notice || notice.acceptedAt || notice.availableAt > new Date()) return;
  const parts = orderNoticeParts(notice.order);
  for (let index = notice.nextPart; index < Math.min(parts.length, notice.nextPart + 4); index++) {
    const lease = new Date(Date.now() + 60_000);
    const claimed = await prisma.whatsAppOrderNotice.updateMany({
      where: { orderId, acceptedAt: null, nextPart: index, availableAt: { lte: new Date() } },
      data: { availableAt: lease },
    });
    if (!claimed.count) return;
    try {
      await sendOrderPart(notice.order.number, `${index + 1}/${parts.length}`, parts[index]);
    } catch {
      console.error("WhatsApp order notification pending retry", notice.order.number, index + 1);
      return;
    }
    await prisma.whatsAppOrderNotice.updateMany({
      where: { orderId, nextPart: index, availableAt: lease },
      data: { nextPart: index + 1, availableAt: new Date(), acceptedAt: index + 1 === parts.length ? new Date() : null },
    });
  }
}
