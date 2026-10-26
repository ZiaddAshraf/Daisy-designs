import { cookies } from "next/headers";
import { LOCALE_COOKIE_NAME, resolveLocale } from "@/lib/locale";

export async function getRequestLocale() {
  const cookieStore = await cookies();
  return resolveLocale(cookieStore.get(LOCALE_COOKIE_NAME)?.value);
}
