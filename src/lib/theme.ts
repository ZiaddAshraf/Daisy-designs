export type StoreTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "daisy-theme";

export function resolveTheme(savedTheme: string | null, systemPrefersDark: boolean): StoreTheme {
  if (savedTheme === "light" || savedTheme === "dark") return savedTheme;
  return systemPrefersDark ? "dark" : "light";
}

export function getNextTheme(currentTheme: StoreTheme): StoreTheme {
  return currentTheme === "dark" ? "light" : "dark";
}

export const THEME_INIT_SCRIPT = `(() => {
  const root = document.documentElement;
  let savedTheme = null;
  try { savedTheme = window.localStorage.getItem("${THEME_STORAGE_KEY}"); } catch {}
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const hasSavedTheme = savedTheme === "light" || savedTheme === "dark";
  root.dataset.theme = hasSavedTheme ? savedTheme : (systemPrefersDark ? "dark" : "light");
  root.dataset.themePreference = hasSavedTheme ? "user" : "system";
})();`;
