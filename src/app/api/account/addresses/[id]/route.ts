import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleApiError, parseJsonBody } from "@/lib/api-request";

const updateSchema = z.object({
  fullName: z.string().trim().min(2).max(120).optional(),
  phone: z.string().trim().min(8).max(30).optional(),
  governorate: z.string().trim().min(2).max(80).optional(),
  city: z.string().trim().min(2).max(80).optional(),
  address: z.string().trim().min(3).max(300).optional(),
  area: z.string().trim().max(100).nullable().optional(),
  street: z.string().trim().max(150).nullable().optional(),
  building: z.string().trim().max(30).nullable().optional(),
  apartment: z.string().trim().max(30).nullable().optional(),
  postalCode: z.string().trim().max(20).nullable().optional(),
  notes: z.string().trim().max(500).nullable().optional(),
  isDefault: z.boolean().optional(),
});

async function owner(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return await prisma.address.findFirst({ where: { id, userId: session.user.id } });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const address = await owner(id);
    if (!address) return NextResponse.json({ error: "العنوان غير موجود" }, { status: 404 });

    const body = await parseJsonBody(request);
    if (!body.ok) return body.response;

    const parsed = updateSchema.safeParse(body.data);
    if (!parsed.success) return NextResponse.json({ error: "بيانات العنوان غير صالحة" }, { status: 400 });

    const updated = await prisma.$transaction(async transaction => {
      if (parsed.data.isDefault) {
        await transaction.address.updateMany({ where: { userId: address.userId }, data: { isDefault: false } });
      }
      return transaction.address.update({ where: { id }, data: parsed.data });
    });
    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error, "تعذر تحديث العنوان، يرجى المحاولة لاحقاً");
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const address = await owner(id);
    if (!address) return NextResponse.json({ error: "العنوان غير موجود" }, { status: 404 });

    await prisma.address.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error, "تعذر حذف العنوان، يرجى المحاولة لاحقاً");
  }
}

