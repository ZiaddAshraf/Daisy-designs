export const LOCALE_COOKIE_NAME = "daisy-locale";
export const LOCALE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export type Locale = "ar" | "en";
export type TextDirection = "rtl" | "ltr";

export function getAlternativeLocale(locale: Locale): Locale {
  return locale === "ar" ? "en" : "ar";
}

export function isLocale(value: unknown): value is Locale {
  return value === "ar" || value === "en";
}

export function resolveLocale(value: unknown): Locale {
  return isLocale(value) ? value : "ar";
}

export function directionForLocale(locale: Locale): TextDirection {
  return locale === "ar" ? "rtl" : "ltr";
}

export function getLocaleDocumentAttributes(locale: Locale) {
  return { lang: locale, dir: directionForLocale(locale) } as const;
}

export function readLocaleFromCookieHeader(cookieHeader: string | null | undefined): Locale {
  if (!cookieHeader) return "ar";

  for (const part of cookieHeader.split(";")) {
    const separator = part.indexOf("=");
    if (separator < 0 || part.slice(0, separator).trim() !== LOCALE_COOKIE_NAME) continue;

    let value = part.slice(separator + 1).trim();
    try {
      value = decodeURIComponent(value);
    } catch {
      return "ar";
    }
    return resolveLocale(value);
  }

  return "ar";
}

export function getLocaleCookieOptions(secure: boolean) {
  return {
    httpOnly: true,
    maxAge: LOCALE_COOKIE_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "lax" as const,
    secure,
  };
}

/** Return only a same-origin route, preserving its path, query, and fragment. */
export function getSafeLocaleSwitchHref(currentUrl: string, currentOrigin: string): string {
  try {
    const origin = new URL(currentOrigin).origin;
    const url = new URL(currentUrl, origin);
    if (url.origin !== origin) return "/";
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/";
  }
}
