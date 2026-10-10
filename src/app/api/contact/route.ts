import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({ name: z.string().trim().min(2).max(120), email: z.string().email(), phone: z.string().trim().max(30).optional(), subject: z.string().trim().min(2).max(160), message: z.string().trim().min(10).max(3000) });
export async function POST(request: Request) { const parsed = schema.safeParse(await request.json()); if (!parsed.success) return NextResponse.json({ error: "تحقق من البيانات المدخلة" }, { status: 400 }); const message = await prisma.contactMessage.create({ data: parsed.data }); return NextResponse.json({ id: message.id }, { status: 201 }); }
