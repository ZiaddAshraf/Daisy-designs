import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({ token: z.string().length(64), password: z.string().min(8).max(100) });
export async function POST(request: Request) {
    let body: unknown;
    try { body = await request.json(); } catch { return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 }); }
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
    const tokenHash = createHash("sha256").update(parsed.data.token).digest("hex");
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
}
