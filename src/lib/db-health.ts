import { prisma } from "@/lib/prisma";

export async function checkDatabaseHealth() {
    const rows = await prisma.$queryRaw<Array<{ ok: number }>>`SELECT 1 AS ok`;
    return rows[0]?.ok === 1;
}