"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import { getNextTheme, resolveTheme, THEME_STORAGE_KEY } from "@/lib/theme";
import { getTranslation } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/locale";

function subscribeToTheme(onChange: () => void) {
  const root = document.documentElement;
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const syncSystemTheme = (event: MediaQueryListEvent) => {
    if (root.dataset.themePreference === "system") {
      root.dataset.theme = resolveTheme(null, event.matches);
      onChange();
    }
  };

  window.addEventListener("daisy-theme-change", onChange);
  media.addEventListener("change", syncSystemTheme);
  return () => {
    window.removeEventListener("daisy-theme-change", onChange);
    media.removeEventListener("change", syncSystemTheme);
  };
}

function getIsDark() {
  return document.documentElement.dataset.theme === "dark";
}

export function ThemeToggle({ locale }: { locale: Locale }) {
  const isDark = useSyncExternalStore(subscribeToTheme, getIsDark, () => false);

  const toggleTheme = () => {
    const root = document.documentElement;
    const currentTheme = resolveTheme(root.dataset.theme ?? null, window.matchMedia("(prefers-color-scheme: dark)").matches);
    const nextTheme = getNextTheme(currentTheme);
    root.dataset.theme = nextTheme;
    root.dataset.themePreference = "user";
    try { window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme); } catch {}
    window.dispatchEvent(new Event("daisy-theme-change"));
  };

  return <button
    type="button"
    className="daisy-icon-button daisy-theme-toggle"
    onClick={toggleTheme}
    aria-pressed={isDark}
    aria-label={getTranslation(locale, "toggleTheme")}
    title={getTranslation(locale, "toggleTheme")}
  >
    <Sun className="daisy-theme-toggle__sun" size={18} strokeWidth={1.5} aria-hidden="true" />
    <Moon className="daisy-theme-toggle__moon" size={18} strokeWidth={1.5} aria-hidden="true" />
  </button>;
}
