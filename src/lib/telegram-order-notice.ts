import { prisma } from "@/lib/prisma";
import { sanitizeCustomizationForWhatsApp } from "@/lib/whatsapp-order-message";
import { validateMagicBytes } from "@/lib/child-photo-storage";
import { getStorageBackend } from "@/lib/storage";
import type { Prisma } from "@prisma/client";

type NoticeOrder = Prisma.OrderGetPayload<{ include: { items: true } }>;
type TelegramOrder = Pick<NoticeOrder, "number" | "shippingAddress" | "items" | "paymentMethod" | "subtotal" | "discount" | "shipping" | "total" | "notes" | "couponCode">;
type OrderPhoto = { key: string; kind: "child" | "artwork"; itemNumber: number };

const CHILD_PHOTO_KEY = /^private:story_child_[a-zA-Z0-9_-]+\.(jpg|png|webp)$/;
const ARTWORK_KEY = /^private:tshirt_art_[a-zA-Z0-9_-]+\.(jpg|png|webp)$/;

function stringFields(value: Prisma.JsonValue): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === "string"));
}

function clean(value: string | null | undefined) {
  return value?.replace(/\s+/gu, " ").trim() ?? "";
}

function chunks(text: string, limit = 3000): string[] {
  const result: string[] = [];
  let remaining = text;
  while (remaining.length > limit) {
    let cut = remaining.lastIndexOf("\n", limit);
    if (cut < limit / 2) cut = remaining.lastIndexOf(" ", limit);
    if (cut < limit / 2) cut = limit;
    result.push(remaining.slice(0, cut).trim());
    remaining = remaining.slice(cut).trim();
  }
  if (remaining) result.push(remaining);
  return result;
}

export function telegramOrderParts(order: TelegramOrder): string[] {
  const address = stringFields(order.shippingAddress);
  const addressLine = [address.governorate, address.city, address.address].map(clean).filter(Boolean).join("، ");
  const sections = [
    ["👤 بيانات العميل", `الاسم: ${clean(address.fullName) || "—"}`, `الموبايل: \u200E${clean(address.phone) || "—"}\u200E`, address.email && `البريد: ${clean(address.email)}`, `العنوان: ${addressLine || "—"}`].filter(Boolean).join("\n"),
    ...order.items.map((item, index) => {
      const snapshot = stringFields(item.productSnapshot);
      const customizations = sanitizeCustomizationForWhatsApp(stringFields(item.customization), "ar")
        .split(" | ").map(clean).filter(Boolean);
      return [
        `${index + 1}. ${clean(snapshot.arabicName) || clean(item.productName)}`,
        `الكود: \u200E${clean(item.productSku)}\u200E`,
        `الكمية: ${item.quantity} × ${item.unitPrice} ج.م = ${item.quantity * item.unitPrice} ج.م`,
        ...(customizations.length ? ["التخصيص:", ...customizations.map(value => `• ${value}`)] : []),
      ].join("\n");
    }),
    [
      "💰 ملخص الطلب",
      `المجموع: ${order.subtotal} ج.م`,
      `الخصم: ${order.discount} ج.م`,
      order.couponCode && `الكوبون: ${clean(order.couponCode)}`,
      `الشحن: ${order.shipping} ج.م`,
      `الإجمالي: ${order.total} ج.م`,
      `الدفع: ${order.paymentMethod === "COD" ? "عند الاستلام" : order.paymentMethod}`,
      order.notes && `ملاحظات العميل: ${clean(order.notes)}`,
    ].filter(Boolean).join("\n"),
  ];
  const parts: string[] = [];
  let current = "";
  for (const section of [sections[0], "📦 المنتجات", ...sections.slice(1)].flatMap(section => chunks(section))) {
    if (current && current.length + section.length + 2 > 3000) {
      parts.push(current);
      current = "";
    }
    current += current ? `\n\n${section}` : section;
  }
  if (current) parts.push(current);
  return parts;
}

export function telegramOrderPhotos(order: Pick<TelegramOrder, "items">): OrderPhoto[] {
  const photos: OrderPhoto[] = [];
  const seen = new Set<string>();
  order.items.forEach((item, itemIndex) => {
    const customization = stringFields(item.customization);
    for (const [field, kind, pattern] of [
      ["child_photo", "child", CHILD_PHOTO_KEY],
      ["custom_design_file", "artwork", ARTWORK_KEY],
    ] as const) {
      for (const key of (customization[field] ?? "").split(",").map(value => value.trim())) {
        if (!pattern.test(key) || key.includes("whatsapp_pending") || seen.has(key)) continue;
        seen.add(key);
        photos.push({ key, kind, itemNumber: itemIndex + 1 });
      }
    }
  });
  return photos;
}

export function telegramConfigured() {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN && /^-?\d+$/.test(process.env.TELEGRAM_OWNER_CHAT_ID ?? ""));
}

export async function sendTelegramOrderPart(number: string, part: string, details: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_OWNER_CHAT_ID;
  if (!token || !chatId || !/^-?\d+$/.test(chatId)) throw new Error("Invalid Telegram configuration");

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    redirect: "error",
    signal: AbortSignal.timeout(6000),
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: `🛍️ طلب جديد\nرقم الطلب: \u200E${number}\u200E${part === "1/1" ? "" : `\nالجزء ${part.replace("/", " من ")}`}\n\n${details}`,
    }),
  });
  const result = await response.json().catch(() => null) as { ok?: boolean; result?: { message_id?: number } } | null;
  if (!response.ok || result?.ok !== true || typeof result.result?.message_id !== "number") {
    throw new Error(`Telegram request failed (HTTP ${response.status})`);
  }
}

export async function sendTelegramOrderPhoto(number: string, photo: OrderPhoto, index: number, total: number) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_OWNER_CHAT_ID;
  if (!token || !chatId || !/^-?\d+$/.test(chatId)) throw new Error("Invalid Telegram configuration");
  const object = await getStorageBackend().get(photo.key);
  if (!object || object.data.length > 50 * 1024 * 1024) throw new Error("Order photo unavailable");
  const format = validateMagicBytes(object.data);
  if (!format) throw new Error("Invalid order photo format");
  const isDocument = format === "webp" || object.data.length > 10 * 1024 * 1024;
  const field = isDocument ? "document" : "photo";
  const mime = format === "jpg" ? "image/jpeg" : `image/${format}`;
  const form = new FormData();
  form.set("chat_id", chatId);
  form.set("caption", `${photo.kind === "child" ? "🖼️ صورة الطفل" : "🎨 التصميم المرفق"} — طلب \u200E${number}\u200E\nالمنتج ${photo.itemNumber} · المرفق ${index + 1} من ${total}`);
  form.set(field, new Blob([new Uint8Array(object.data)], { type: mime }), `order-${number}-${index + 1}.${format}`);
  const response = await fetch(`https://api.telegram.org/bot${token}/send${isDocument ? "Document" : "Photo"}`, {
    method: "POST",
    redirect: "error",
    signal: AbortSignal.timeout(15_000),
    body: form,
  });
  const result = await response.json().catch(() => null) as { ok?: boolean; result?: { message_id?: number } } | null;
  if (!response.ok || result?.ok !== true || typeof result.result?.message_id !== "number") {
    throw new Error(`Telegram photo request failed (HTTP ${response.status})`);
  }
}

export async function dispatchTelegramOrderNotice(orderId: string) {
  if (!telegramConfigured()) return;
  const notice = await prisma.telegramOrderNotice.findUnique({
    where: { orderId }, include: { order: { include: { items: { orderBy: { id: "asc" } } } } },
  });
  if (!notice || notice.acceptedAt || notice.availableAt > new Date()) return;
  const parts = telegramOrderParts(notice.order);
  const photos = telegramOrderPhotos(notice.order);
  for (let index = notice.nextPart; index < parts.length; index++) {
    const lease = new Date(Date.now() + 60_000);
    const claimed = await prisma.telegramOrderNotice.updateMany({
      where: { orderId, acceptedAt: null, nextPart: index, availableAt: { lte: new Date() } },
      data: { availableAt: lease },
    });
    if (!claimed.count) return;
    try {
      await sendTelegramOrderPart(notice.order.number, `${index + 1}/${parts.length}`, parts[index]);
    } catch {
      console.error("Telegram order notification pending retry", notice.order.number, index + 1);
      return;
    }
    await prisma.telegramOrderNotice.updateMany({
      where: { orderId, nextPart: index, availableAt: lease },
      data: { nextPart: index + 1, availableAt: new Date(), acceptedAt: index + 1 === parts.length && photos.length === 0 ? new Date() : null },
    });
  }
  for (let index = notice.nextPhoto; index < photos.length; index++) {
    const lease = new Date(Date.now() + 60_000);
    const claimed = await prisma.telegramOrderNotice.updateMany({
      where: { orderId, acceptedAt: null, nextPart: parts.length, nextPhoto: index, availableAt: { lte: new Date() } },
      data: { availableAt: lease },
    });
    if (!claimed.count) return;
    try {
      await sendTelegramOrderPhoto(notice.order.number, photos[index], index, photos.length);
    } catch {
      console.error("Telegram order photo pending retry", notice.order.number, index + 1);
      return;
    }
    await prisma.telegramOrderNotice.updateMany({
      where: { orderId, nextPart: parts.length, nextPhoto: index, availableAt: lease },
      data: { nextPhoto: index + 1, availableAt: new Date(), acceptedAt: index + 1 === photos.length ? new Date() : null },
    });
  }
}
