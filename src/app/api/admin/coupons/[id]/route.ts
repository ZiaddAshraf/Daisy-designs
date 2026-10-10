import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-auth";
const schema = z.object({ active: z.boolean().optional(), value: z.number().int().positive().optional(), minimumOrder: z.number().int().nonnegative().optional(), maximumDiscount: z.number().int().positive().nullable().optional(), startsAt: z.coerce.date().nullable().optional(), expiresAt: z.coerce.date().nullable().optional(), usageLimit: z.number().int().positive().nullable().optional() });
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) { if (!(await isAdmin())) return NextResponse.json({ error: "غير مصرح" }, { status: 403 }); const { id } = await context.params; const parsed = schema.safeParse(await request.json()); if (!parsed.success) return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 }); return NextResponse.json(await prisma.coupon.update({ where: { id }, data: parsed.data })); }
export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) { if (!(await isAdmin())) return NextResponse.json({ error: "غير مصرح" }, { status: 403 }); const { id } = await context.params; await prisma.coupon.delete({ where: { id } }); return new NextResponse(null, { status: 204 }); }
