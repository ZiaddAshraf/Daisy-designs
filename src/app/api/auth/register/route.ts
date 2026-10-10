import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({ name: z.string().trim().min(2).max(120), email: z.string().email(), password: z.string().min(8).max(100), phone: z.string().trim().min(8).max(30).optional() });

export async function POST(request: Request) {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "تحقق من البيانات المدخلة" }, { status: 400 });
    const data = parsed.data;
    const email = data.email.toLowerCase();
    if (await prisma.user.findUnique({ where: { email } })) return NextResponse.json({ error: "البريد الإلكتروني مستخدم بالفعل" }, { status: 409 });
    const user = await prisma.user.create({ data: { name: data.name, email, phone: data.phone, passwordHash: await hash(data.password, 12) }, select: { id: true, name: true, email: true } });
    return NextResponse.json({ user }, { status: 201 });
}
