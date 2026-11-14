import "dotenv/config";
import { defineConfig } from "prisma/config";

function migrationUrl(): string | undefined {
    const value = process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL;
    if (!value || !process.env.VERCEL || process.env.DIRECT_DATABASE_URL) return value;
    try {
        const url = new URL(value);
        if (url.hostname.endsWith(".neon.tech") && url.hostname.split(".")[0].endsWith("-pooler")) {
            url.hostname = url.hostname.replace(/-pooler(?=\.)/, "");
            return url.toString();
        }
    } catch { /* Prisma will report malformed URLs */ }
    return value;
}

const datasource = migrationUrl()
    ? {
        url: migrationUrl(),
        shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL,
    }
    : undefined;

export default defineConfig({
    schema: "prisma/schema.prisma",
    migrations: {
        path: "prisma/migrations",
        seed: "tsx prisma/seed.ts",
    },
    datasource,
});
