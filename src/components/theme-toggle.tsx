"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import { getNextTheme, resolveTheme, THEME_STORAGE_KEY } from "@/lib/theme";
import { getTranslation } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/locale";

function subscribeToTheme(onChange: () => void) {
  window.addEventListener("daisy-theme-change", onChange);
  return () => {
    window.removeEventListener("daisy-theme-change", onChange);
  };
}

function getIsDark() {
  return document.documentElement.dataset.theme === "dark";
}

export function ThemeToggle({ locale }: { locale: Locale }) {
  const isDark = useSyncExternalStore(subscribeToTheme, getIsDark, () => false);

  const toggleTheme = () => {
    const root = document.documentElement;
    const currentTheme = resolveTheme(root.dataset.theme ?? null);
    const nextTheme = getNextTheme(currentTheme);
    root.dataset.theme = nextTheme;
    root.dataset.themePreference = "user";
    root.classList.toggle("dark", nextTheme === "dark");
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
