import { NextResponse } from "next/server";
import { checkDatabaseHealth } from "@/lib/db-health";

export async function GET() {
    try {
        const ok = await checkDatabaseHealth();
        return NextResponse.json({ ok }, { status: ok ? 200 : 503 });
    } catch (error) {
        if (process.env.NODE_ENV !== "production") console.error("[database] health check failed", error);
        return NextResponse.json({ ok: false, error: "DATABASE_UNAVAILABLE" }, { status: 503 });
    }
}
