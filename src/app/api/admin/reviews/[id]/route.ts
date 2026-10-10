import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-auth";
const schema = z.object({ status: z.enum(["PENDING", "APPROVED", "REJECTED"]), verified: z.boolean().optional() });
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) { if (!(await isAdmin())) return NextResponse.json({ error: "غير مصرح" }, { status: 403 }); const { id } = await context.params; const parsed = schema.safeParse(await request.json()); if (!parsed.success) return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 }); return NextResponse.json(await prisma.review.update({ where: { id }, data: parsed.data })); }
export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) { if (!(await isAdmin())) return NextResponse.json({ error: "غير مصرح" }, { status: 403 }); const { id } = await context.params; await prisma.review.delete({ where: { id } }); return new NextResponse(null, { status: 204 }); }
