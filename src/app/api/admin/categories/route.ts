import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-auth";
const schema = z.object({ name: z.string().min(2), arabicName: z.string().min(2), slug: z.string().regex(/^[a-z0-9-]+$/), description: z.string().optional(), image: z.string().url().optional(), parentId: z.string().nullable().optional(), published: z.boolean().default(true) });
export async function GET() { if (!(await isAdmin())) return NextResponse.json({ error: "غير مصرح" }, { status: 403 }); return NextResponse.json(await prisma.category.findMany({ include: { _count: { select: { products: true } } }, orderBy: { createdAt: "desc" } })); }
export async function POST(request: Request) { if (!(await isAdmin())) return NextResponse.json({ error: "غير مصرح" }, { status: 403 }); const parsed = schema.safeParse(await request.json()); if (!parsed.success) return NextResponse.json({ error: "بيانات القسم غير صالحة" }, { status: 400 }); return NextResponse.json(await prisma.category.create({ data: parsed.data }), { status: 201 }); }
