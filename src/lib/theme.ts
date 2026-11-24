export type Theme = "neon" | "light" | "midnight";
export const THEMES: Theme[] = ["neon", "light", "midnight"];
export const THEME_COOKIE = "proofit_theme";
export const DEFAULT_THEME: Theme = "neon";

/** Normalises any stored value (including legacy "dark"/"system") to a supported theme. */
export function parseTheme(v: string | undefined | null): Theme {
  return v === "light" || v === "midnight" || v === "neon" ? v : DEFAULT_THEME;
}

/** Browser chrome colour (status bar) per theme. */
export const THEME_COLOR: Record<Theme, string> = { neon: "#09090f", light: "#f3f4f8", midnight: "#0a101f" };
