import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-auth";
const schema = z.object({ stock: z.number().int().nonnegative(), lowStockThreshold: z.number().int().nonnegative().optional() });
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) { if (!(await isAdmin())) return NextResponse.json({ error: "غير مصرح" }, { status: 403 }); const { id } = await context.params; const parsed = schema.safeParse(await request.json()); if (!parsed.success) return NextResponse.json({ error: "قيمة مخزون غير صالحة" }, { status: 400 }); return NextResponse.json(await prisma.product.update({ where: { id }, data: parsed.data })); }
