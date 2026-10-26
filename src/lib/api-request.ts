import { NextResponse } from "next/server";
import { isDatabaseUnavailable } from "@/lib/prisma";

export type SafeJsonResult<T> =
  | { ok: true; data: T }
  | { ok: false; response: NextResponse };

/**
 * Safely parses the JSON body of a Request.
 * Returns an HTTP 400 response if the body is malformed, empty, or unparseable.
 */
export async function parseJsonBody<T = unknown>(request: Request): Promise<SafeJsonResult<T>> {
  try {
    const data = await request.json();
    return { ok: true, data: data as T };
  } catch {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "بيانات الطلب غير صالحة أو غير مكتملة" },
        { status: 400 }
      ),
    };
  }
}

/**
 * Handles backend exceptions consistently across App Router API handlers.
 * If the error is a database connectivity issue, returns HTTP 503.
 * Otherwise returns the designated fallback error response.
 */
export function handleApiError(
  error: unknown,
  fallbackMessage = "حدث خطأ غير متوقع",
  fallbackStatus = 500
): NextResponse {
  if (isDatabaseUnavailable(error)) {
    return NextResponse.json(
      { error: "قاعدة البيانات غير متاحة حالياً، يرجى المحاولة لاحقاً" },
      { status: 503 }
    );
  }

  const message = error instanceof Error ? error.message : fallbackMessage;
  return NextResponse.json({ error: message }, { status: fallbackStatus });
}

