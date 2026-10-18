import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handleApiError, parseJsonBody } from "@/lib/api-request";

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().email(),
  phone: z.string().trim().max(30).optional(),
  subject: z.string().trim().min(2).max(160),
  message: z.string().trim().min(10).max(3000),
});

export async function POST(request: Request) {
  const body = await parseJsonBody(request);
  if (!body.ok) return body.response;

  const parsed = schema.safeParse(body.data);
  if (!parsed.success) {
    return NextResponse.json({ error: "تحقق من البيانات المدخلة" }, { status: 400 });
  }

  try {
    const message = await prisma.contactMessage.create({ data: parsed.data });
    return NextResponse.json({ id: message.id }, { status: 201 });
  } catch (error) {
    return handleApiError(error, "تعذر إرسال الرسالة، يرجى المحاولة لاحقاً");
  }
}
