"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getAlternativeLocale, getSafeLocaleSwitchHref, type Locale } from "@/lib/locale";
import { getTranslation } from "@/lib/i18n/messages";

export function LocaleSwitcher({ locale, compact = false }: { locale: Locale; compact?: boolean }) {
  const alternativeLocale = getAlternativeLocale(locale);
  const router = useRouter();
  const [pendingLocale, setPendingLocale] = useState<Locale | null>(null);
  const [error, setError] = useState(false);
  const pending = pendingLocale !== null && pendingLocale !== locale;

  async function selectLocale(nextLocale: Locale) {
    if (pending || nextLocale === locale) return;
    setPendingLocale(nextLocale);
    setError(false);
    const currentHref = getSafeLocaleSwitchHref(window.location.href, window.location.origin);

    try {
      const response = await fetch("/api/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: nextLocale }),
      });
      if (!response.ok) throw new Error("Locale update failed");

      const liveHref = getSafeLocaleSwitchHref(window.location.href, window.location.origin);
      if (liveHref !== currentHref) router.replace(currentHref, { scroll: false });
      router.refresh();
    } catch {
      setError(true);
      setPendingLocale(null);
    }
  }

  return <div className={`daisy-locale-switcher${compact ? " daisy-locale-switcher--compact" : ""}`}>
    <div className="daisy-locale-switcher__buttons" role="group" aria-label={getTranslation(locale, "languageGroup")} aria-busy={pending}>
      <button type="button" onClick={() => selectLocale(alternativeLocale)} aria-label={getTranslation(locale, alternativeLocale === "ar" ? "languageArabic" : "languageEnglish")} disabled={pending} lang={alternativeLocale}>
        {alternativeLocale === "ar" ? "AR" : "EN"}
      </button>
    </div>
    {pending && <span className="daisy-locale-switcher__status" role="status">{getTranslation(locale, "languageSwitching")}</span>}
    {error && <span className="daisy-locale-switcher__error" role="alert">{getTranslation(locale, "languageSwitchError")}</span>}
  </div>;
}
