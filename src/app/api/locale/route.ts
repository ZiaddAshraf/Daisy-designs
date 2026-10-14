import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getLocaleCookieOptions, isLocale, LOCALE_COOKIE_NAME } from "@/lib/locale";

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const locale =
    typeof body === "object" && body !== null && "locale" in body
      ? body.locale
      : undefined;

  if (!isLocale(locale)) {
    return NextResponse.json({ error: "INVALID_LOCALE" }, { status: 400 });
  }

  const cookieStore = await cookies();
  cookieStore.set(
    LOCALE_COOKIE_NAME,
    locale,
    getLocaleCookieOptions(process.env.NODE_ENV === "production"),
  );

  return NextResponse.json({ locale });
}
