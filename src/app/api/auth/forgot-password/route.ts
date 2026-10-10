import { NextResponse } from "next/server";
import { createHash, randomBytes } from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ResendEmailService } from "@/lib/email";

const schema = z.object({ email: z.string().email() });
export async function POST(request: Request) {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "بريد إلكتروني غير صالح" }, { status: 400 });
    const email = parsed.data.email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ message: "إذا كان الحساب موجودًا فسيصل رابط إعادة التعيين قريبًا." });
    const configuredOrigin = process.env.NEXTAUTH_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);
    const origin = configuredOrigin ?? (process.env.NODE_ENV === "development" ? "http://localhost:3000" : undefined);
    if (!origin) return NextResponse.json({ message: "إذا كان الحساب موجودًا فسيصل رابط إعادة التعيين قريبًا." });
    const rawToken = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(rawToken).digest("hex");
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } });
    await prisma.passwordResetToken.create({ data: { tokenHash, userId: user.id, expiresAt: new Date(Date.now() + 1000 * 60 * 30) } });
    const resetUrl = `${origin}/reset-password?token=${rawToken}`;
    try {
        await new ResendEmailService().send({ to: email, subject: "إعادة تعيين كلمة المرور", html: `<p>افتح الرابط لإعادة تعيين كلمة المرور: <a href="${resetUrl}">${resetUrl}</a></p>` });
    } catch (error) {
        if (process.env.NODE_ENV === "production") return NextResponse.json({ message: "إذا كان الحساب موجودًا فسيصل رابط إعادة التعيين قريبًا." });
        void error;
        return NextResponse.json({ message: "وضع التطوير: استخدم رابط إعادة التعيين أدناه.", devResetUrl: resetUrl });
    }
    return NextResponse.json({ message: "إذا كان الحساب موجودًا فسيصل رابط إعادة التعيين قريبًا." });
}
