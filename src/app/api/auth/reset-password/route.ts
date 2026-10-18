import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handleApiError, parseJsonBody } from "@/lib/api-request";

const schema = z.object({ token: z.string().length(64), password: z.string().min(8).max(100) });

export async function POST(request: Request) {
    const body = await parseJsonBody(request);
    if (!body.ok) return body.response;

    const parsed = schema.safeParse(body.data);
    if (!parsed.success) return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });

    const tokenHash = createHash("sha256").update(parsed.data.token).digest("hex");

    try {
        const reset = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });
        const now = new Date();
        if (!reset || reset.usedAt || reset.expiresAt <= now) return NextResponse.json({ error: "الرابط منتهي أو غير صالح" }, { status: 400 });
        const passwordHash = await hash(parsed.data.password, 12);
        const updated = await prisma.$transaction(async transaction => {
            const claimed = await transaction.passwordResetToken.updateMany({ where: { id: reset.id, usedAt: null, expiresAt: { gt: now } }, data: { usedAt: now } });
            if (claimed.count !== 1) return false;
            await transaction.user.update({ where: { id: reset.userId }, data: { passwordHash } });
            return true;
        });
        if (!updated) return NextResponse.json({ error: "الرابط منتهي أو غير صالح" }, { status: 400 });
        return NextResponse.json({ message: "تم تحديث كلمة المرور" });
    } catch (error) {
        return handleApiError(error, "تعذر إعادة تعيين كلمة المرور، يرجى المحاولة لاحقاً");
    }
}

