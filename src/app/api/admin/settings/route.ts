import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-auth";
const schema = z.record(z.string().min(1), z.string().max(1000));
export async function GET() { if (!(await isAdmin())) return NextResponse.json({ error: "غير مصرح" }, { status: 403 }); return NextResponse.json(await prisma.siteSetting.findMany({ orderBy: { key: "asc" } })); }
export async function PATCH(request: Request) { if (!(await isAdmin())) return NextResponse.json({ error: "غير مصرح" }, { status: 403 }); const parsed = schema.safeParse(await request.json()); if (!parsed.success) return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 }); await prisma.$transaction(Object.entries(parsed.data).map(([key, value]) => prisma.siteSetting.upsert({ where: { key }, update: { value }, create: { key, value } }))); return NextResponse.json({ ok: true }); }
