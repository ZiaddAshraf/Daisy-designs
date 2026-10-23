import { loadEnvConfig } from "@next/env";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const projectRoot = process.cwd();
const envRoot = path.basename(projectRoot) === "store" || path.basename(projectRoot).startsWith("store-") ? projectRoot : path.join(projectRoot, "store");
loadEnvConfig(envRoot);

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export class DatabaseUnavailableError extends Error {
    constructor() {
        super("DATABASE_UNAVAILABLE");
        this.name = "DatabaseUnavailableError";
    }
}

let lastLoggedError: unknown;

export function isDatabaseUnavailable(error: unknown) {
    if (process.env.NODE_ENV !== "production" && error !== lastLoggedError) {
        lastLoggedError = error;
        console.error("[database] runtime connection failed", error);
    }
    if (error instanceof DatabaseUnavailableError) return true;
    if (!(error instanceof Error)) return false;
    const code = "code" in error && typeof error.code === "string" ? error.code : "";
    return ["P1000", "P1001", "P1017", "P2021", "P2022"].includes(code)
        || /DATABASE_URL|PrismaClientInitializationError|Can't reach database/i.test(error.message);
}

function createPrismaClient() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        if (process.env.NODE_ENV !== "production") console.error("[database] DATABASE_URL was not loaded from", envRoot);
        throw new DatabaseUnavailableError();
    }
    const adapter = new PrismaPg({ connectionString });
    return new PrismaClient({ adapter });
}

const unavailablePrisma = new Proxy({} as PrismaClient, { get() { throw new DatabaseUnavailableError(); } });
export const prisma = globalForPrisma.prisma ?? (process.env.DATABASE_URL ? createPrismaClient() : unavailablePrisma);
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
