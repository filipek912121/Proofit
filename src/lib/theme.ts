export type Theme = "light" | "dark";
export const THEMES: Theme[] = ["light", "dark"];
export const THEME_COOKIE = "proofit_theme";
export const DEFAULT_THEME: Theme = "light";

/** Normalises any stored value (including legacy "neon"/"midnight") to a supported theme. */
export function parseTheme(v: string | undefined | null): Theme {
  if (v === "light") return "light";
  if (v === "dark" || v === "neon" || v === "midnight") return "dark";
  return DEFAULT_THEME;
}

/** Browser chrome colour (status bar) per theme. */
export const THEME_COLOR: Record<Theme, string> = { light: "#ffffff", dark: "#121722" };
