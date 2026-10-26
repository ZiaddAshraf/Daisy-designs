import assert from "node:assert/strict";
import test from "node:test";
import {
  directionForLocale,
  getAlternativeLocale,
  getLocaleCookieOptions,
  getLocaleDocumentAttributes,
  getSafeLocaleSwitchHref,
  isLocale,
  LOCALE_COOKIE_MAX_AGE_SECONDS,
  LOCALE_COOKIE_NAME,
  readLocaleFromCookieHeader,
  resolveLocale,
} from "../src/lib/locale";
import { formatMessage, getTranslation, messages } from "../src/lib/i18n/messages";

test("Arabic is the default when the locale cookie is absent or invalid", () => {
  assert.equal(resolveLocale(null), "ar");
  assert.equal(resolveLocale("fr"), "ar");
  assert.equal(readLocaleFromCookieHeader(null), "ar");
  assert.equal(readLocaleFromCookieHeader(`${LOCALE_COOKIE_NAME}=invalid`), "ar");
});

test("English is selected only for a valid locale cookie", () => {
  assert.equal(isLocale("en"), true);
  assert.equal(isLocale("ar"), true);
  assert.equal(isLocale("EN"), false);
  assert.equal(readLocaleFromCookieHeader(`other=value; ${LOCALE_COOKIE_NAME}=en`), "en");
  assert.equal(resolveLocale("en"), "en");
});

test("language switcher targets only the alternative locale", () => {
  assert.equal(getAlternativeLocale("ar"), "en");
  assert.equal(getAlternativeLocale("en"), "ar");
});

test("locale controls the document language and direction", () => {
  assert.deepEqual(getLocaleDocumentAttributes("ar"), { lang: "ar", dir: "rtl" });
  assert.deepEqual(getLocaleDocumentAttributes("en"), { lang: "en", dir: "ltr" });
  assert.equal(directionForLocale("en"), "ltr");
});

test("locale cookie is scoped safely with a one-year lifetime", () => {
  assert.equal(LOCALE_COOKIE_MAX_AGE_SECONDS, 60 * 60 * 24 * 365);
  assert.deepEqual(getLocaleCookieOptions(false), {
    httpOnly: true,
    maxAge: LOCALE_COOKIE_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: false,
  });
  assert.equal(getLocaleCookieOptions(true).secure, true);
});

test("locale switch destination preserves a same-site path and query only", () => {
  assert.equal(
    getSafeLocaleSwitchHref("https://shop.example/search?q=labels&sort=price-asc#results", "https://shop.example"),
    "/search?q=labels&sort=price-asc#results",
  );
  assert.equal(getSafeLocaleSwitchHref("https://attacker.example/redirect", "https://shop.example"), "/");
  assert.equal(getSafeLocaleSwitchHref("javascript:alert(1)", "https://shop.example"), "/");
  assert.equal(getSafeLocaleSwitchHref("//attacker.example/path", "https://shop.example"), "/");
});

test("Arabic and English dictionaries have matching keys", () => {
  assert.deepEqual(Object.keys(messages.ar).sort(), Object.keys(messages.en).sort());
});

test("English interface translations do not contain Arabic text", () => {
  for (const [key, value] of Object.entries(messages.en)) {
    assert.doesNotMatch(value, /[\u0600-\u06FF]/, `English translation contains Arabic text at ${key}`);
  }
});

test("interpolated interface messages preserve merchant-provided product names", () => {
  assert.equal(formatMessage(getTranslation("en", "viewProduct"), { name: "Merchant Original Name" }), "View Merchant Original Name");
  assert.equal(formatMessage(getTranslation("ar", "viewProduct"), { name: "Merchant Original Name" }), "عرض Merchant Original Name");
});

test("translation helper returns the requested message and exposes missing keys", () => {
  assert.equal(getTranslation("en", "languageEnglish"), "English");
  assert.throws(
    () => getTranslation("ar", "missingKey" as keyof typeof messages.ar),
    /Missing translation key: missingKey/,
  );
});
