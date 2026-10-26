export type StoreTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "daisy-theme";

export function resolveTheme(savedTheme: string | null, systemPrefersDark?: boolean): StoreTheme;
export function resolveTheme(savedTheme: string | null): StoreTheme {
  if (savedTheme === "light" || savedTheme === "dark") return savedTheme;
  return "light";
}

export function getNextTheme(currentTheme: StoreTheme): StoreTheme {
  return currentTheme === "dark" ? "light" : "dark";
}

export const THEME_INIT_SCRIPT = `(() => {
  const root = document.documentElement;
  let savedTheme = null;
  try { savedTheme = window.localStorage.getItem("${THEME_STORAGE_KEY}"); } catch {}
  const hasSavedTheme = savedTheme === "light" || savedTheme === "dark";
  const theme = hasSavedTheme ? savedTheme : "light";
  root.dataset.theme = theme;
  root.dataset.themePreference = hasSavedTheme ? "user" : "default";
  root.classList.toggle("dark", theme === "dark");
})();`;
