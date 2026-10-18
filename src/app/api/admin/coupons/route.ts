import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-auth";
import { handleApiError, parseJsonBody } from "@/lib/api-request";

const schema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3)
      .max(40)
      .transform(value => value.toUpperCase()),
    type: z.enum(["PERCENTAGE", "FIXED"]),
    value: z.number().int().positive(),
    minimumOrder: z.number().int().nonnegative().default(0),
    maximumDiscount: z.number().int().positive().nullable().optional(),
    startsAt: z.coerce.date().nullable().optional(),
    expiresAt: z.coerce.date().nullable().optional(),
    usageLimit: z.number().int().positive().nullable().optional(),
    active: z.boolean().default(true),
  })
  .superRefine((data, context) => {
    if (data.type === "PERCENTAGE" && data.value > 100) {
      context.addIssue({ code: "custom", path: ["value"], message: "النسبة لا تتجاوز 100" });
    }
    if (data.expiresAt && data.startsAt && data.expiresAt <= data.startsAt) {
      context.addIssue({ code: "custom", path: ["expiresAt"], message: "تاريخ الانتهاء يجب أن يكون بعد البداية" });
    }
  });

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  try {
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(coupons);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const body = await parseJsonBody(request);
  if (!body.ok) return body.response;

  const parsed = schema.safeParse(body.data);
  if (!parsed.success) {
    return NextResponse.json({ error: "بيانات الكوبون غير صالحة", issues: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const coupon = await prisma.coupon.create({ data: parsed.data });
    return NextResponse.json(coupon, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

