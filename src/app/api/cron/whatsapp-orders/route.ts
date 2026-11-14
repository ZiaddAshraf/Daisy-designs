import { prisma } from "@/lib/prisma";
import { dispatchOrderNotice, whatsappConfigured } from "@/lib/whatsapp-order-notice";
import { dispatchTelegramOrderNotice, telegramConfigured } from "@/lib/telegram-order-notice";

export const maxDuration = 60;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response(null, { status: 401 });
  }
  if (!whatsappConfigured() && !telegramConfigured()) return new Response(null, { status: 503 });
  const [whatsappDue, telegramDue] = await Promise.all([
    whatsappConfigured() ? prisma.whatsAppOrderNotice.findMany({
      where: { acceptedAt: null, availableAt: { lte: new Date() } },
      orderBy: { availableAt: "asc" }, take: 10, select: { orderId: true },
    }) : [],
    telegramConfigured() ? prisma.telegramOrderNotice.findMany({
      where: { acceptedAt: null, availableAt: { lte: new Date() } },
      orderBy: { availableAt: "asc" }, take: 10, select: { orderId: true },
    }) : [],
  ]);
  await Promise.all([
    ...whatsappDue.map(notice => dispatchOrderNotice(notice.orderId)),
    ...telegramDue.map(notice => dispatchTelegramOrderNotice(notice.orderId)),
  ]);
  return Response.json({ checked: whatsappDue.length + telegramDue.length }, { headers: { "Cache-Control": "no-store" } });
}
