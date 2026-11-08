import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function isAdmin() {
    try {
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== "ADMIN" || !session.user.id) return false;
        const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
        return user?.role === "ADMIN";
    } catch {
        return false;
    }
}
