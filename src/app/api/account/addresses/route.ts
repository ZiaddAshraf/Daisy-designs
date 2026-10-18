import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleApiError, parseJsonBody } from "@/lib/api-request";

const addressSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(8).max(30),
  governorate: z.string().trim().min(2).max(80),
  city: z.string().trim().min(2).max(80),
  address: z.string().trim().min(3).max(300),
  area: z.string().trim().max(100).optional(),
  street: z.string().trim().max(150).optional(),
  building: z.string().trim().max(30).optional(),
  apartment: z.string().trim().max(30).optional(),
  postalCode: z.string().trim().max(20).optional(),
  notes: z.string().trim().max(500).optional(),
  isDefault: z.boolean().default(false),
});

async function currentUser() {
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}

export async function GET() {
  const userId = await currentUser();
  if (!userId) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  try {
    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
    return NextResponse.json(addresses);
  } catch (error) {
    return handleApiError(error, "تعذر جلب العناوين، يرجى المحاولة لاحقاً");
  }
}

export async function POST(request: Request) {
  const userId = await currentUser();
  if (!userId) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const body = await parseJsonBody(request);
  if (!body.ok) return body.response;

  const parsed = addressSchema.safeParse(body.data);
  if (!parsed.success) return NextResponse.json({ error: "بيانات العنوان غير صالحة" }, { status: 400 });

  try {
    const address = await prisma.$transaction(async transaction => {
      if (parsed.data.isDefault) {
        await transaction.address.updateMany({ where: { userId }, data: { isDefault: false } });
      }
      return transaction.address.create({ data: { ...parsed.data, userId } });
    });
    return NextResponse.json(address, { status: 201 });
  } catch (error) {
    return handleApiError(error, "تعذر حفظ العنوان، يرجى المحاولة لاحقاً");
  }
}

