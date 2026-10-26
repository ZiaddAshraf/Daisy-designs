import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-auth";
import { handleApiError, parseJsonBody } from "@/lib/api-request";

const updateSchema = z.object({
  variants: z.array(z.object({ id: z.string(), price: z.number().int().positive().nullable() })).max(100).optional(),
  price: z.number().int().positive().optional(),
  stock: z.number().int().nonnegative().optional(),
  published: z.boolean().optional(),
  featured: z.boolean().optional(),
  bestSeller: z.boolean().optional(),
  newArrival: z.boolean().optional(),
  name: z.string().min(2).optional(),
  arabicName: z.string().min(2).optional(),
  description: z.string().min(10).optional(),
  arabicDescription: z.string().min(10).optional(),
  compareAtPrice: z.number().int().positive().nullable().optional(),
  categoryId: z.string().optional(),
  collectionId: z.string().nullable().optional(),
});

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const { id } = await context.params;

  const body = await parseJsonBody(request);
  if (!body.ok) return body.response;

  const parsed = updateSchema.safeParse(body.data);
  if (!parsed.success) return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });

  try {
    const { variants, ...data } = parsed.data;
    const product = await prisma.$transaction(async tx => {
      if (variants) {
        for (const variant of variants) {
          const result = await tx.productVariant.updateMany({ where: { id: variant.id, productId: id }, data: { price: variant.price } });
          if (result.count !== 1) throw new Error("INVALID_VARIANT");
        }
      }
      return tx.product.update({ where: { id }, data });
    });
    return NextResponse.json(product);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const { id } = await context.params;

  try {
    await prisma.product.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}

