import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
const schema = z.object({ orderItemId: z.string(), rating: z.number().int().min(1).max(5), title: z.string().trim().min(2).max(120), comment: z.string().trim().min(10).max(2000) });
export async function POST(request: Request) { const session = await getServerSession(authOptions); if (!session?.user?.id) return NextResponse.json({ error: "سجل الدخول أولًا" }, { status: 401 }); const parsed = schema.safeParse(await request.json()); if (!parsed.success) return NextResponse.json({ error: "بيانات المراجعة غير صالحة" }, { status: 400 }); const item = await prisma.orderItem.findFirst({ where: { id: parsed.data.orderItemId, order: { userId: session.user.id, status: { in: ["DELIVERED", "CONFIRMED"] } } } }); if (!item || !item.productId) return NextResponse.json({ error: "يمكن مراجعة المنتجات التي تم شراؤها فقط" }, { status: 403 }); const review = await prisma.review.create({ data: { ...parsed.data, productId: item.productId, userId: session.user.id, verified: true } }); return NextResponse.json(review, { status: 201 }); }
