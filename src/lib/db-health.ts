import { prisma } from "@/lib/prisma";

export async function checkDatabaseHealth() {
    const rows = await prisma.$queryRaw<Array<{ ok: number }>>`SELECT (to_regclass('public."Category"') IS NOT NULL AND to_regclass('public."Product"') IS NOT NULL AND to_regclass('public."Order"') IS NOT NULL)::int AS ok`;
    return rows[0]?.ok === 1;
}
