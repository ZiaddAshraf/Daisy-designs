import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handleApiError, parseJsonBody } from "@/lib/api-request";

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  phone: z.string().trim().min(8).max(30).optional(),
});

export async function POST(request: Request) {
  const body = await parseJsonBody(request);
  if (!body.ok) return body.response;

  const parsed = schema.safeParse(body.data);
  if (!parsed.success) {
    return NextResponse.json({ error: "تحقق من البيانات المدخلة" }, { status: 400 });
  }

  const data = parsed.data;
  const email = data.email.toLowerCase();

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "البريد الإلكتروني مستخدم بالفعل" }, { status: 409 });
    }

    const passwordHash = await hash(data.password, 12);
    const user = await prisma.user.create({
      data: { name: data.name, email, phone: data.phone, passwordHash },
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    return handleApiError(error, "تعذر إنشاء الحساب، يرجى المحاولة لاحقاً");
  }
}

