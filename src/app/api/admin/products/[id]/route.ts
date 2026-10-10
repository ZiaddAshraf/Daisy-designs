import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-auth";

const updateSchema = z.object({ price: z.number().int().positive().optional(), stock: z.number().int().nonnegative().optional(), published: z.boolean().optional(), featured: z.boolean().optional(), bestSeller: z.boolean().optional(), newArrival: z.boolean().optional(), name: z.string().min(2).optional(), arabicName: z.string().min(2).optional(), description: z.string().min(10).optional(), arabicDescription: z.string().min(10).optional(), compareAtPrice: z.number().int().positive().nullable().optional(), categoryId: z.string().optional(), collectionId: z.string().nullable().optional() });
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) { if (!(await isAdmin())) return NextResponse.json({ error: "غير مصرح" }, { status: 403 }); const { id } = await context.params; const parsed = updateSchema.safeParse(await request.json()); if (!parsed.success) return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 }); const product = await prisma.product.update({ where: { id }, data: parsed.data }); return NextResponse.json(product); }
export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) { if (!(await isAdmin())) return NextResponse.json({ error: "غير مصرح" }, { status: 403 }); const { id } = await context.params; await prisma.product.delete({ where: { id } }); return new NextResponse(null, { status: 204 }); }
