"use client";

import { Check, Moon, Sparkles, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useT } from "@/lib/i18n/client";
import { parseTheme, THEME_COLOR, THEME_COOKIE, type Theme } from "@/lib/theme";
import { cn } from "@/components/ui/cn";

const OPTIONS: { value: Theme; label: string; hint: string; I: typeof Moon; swatch: [string, string, string] }[] = [
  { value: "neon", label: "Dark Neon", hint: "Dark with violet accents", I: Sparkles, swatch: ["#09090f", "#111119", "#8b5cf6"] },
  { value: "light", label: "Light", hint: "Clean and bright", I: Sun, swatch: ["#f3f4f8", "#ffffff", "#7c3aed"] },
  { value: "midnight", label: "Midnight", hint: "Calm deep navy", I: Moon, swatch: ["#0a101f", "#111a2e", "#6d7ff2"] },
];

function useTheme() {
  const [theme, setTheme] = useState<Theme>("neon");
  useEffect(() => setTheme(parseTheme(document.documentElement.dataset.theme)), []);
  const choose = (next: Theme) => {
    setTheme(next);
    document.documentElement.dataset.theme = next;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLOR[next]);
    // Remembered across restarts; the server reads it so the first paint already uses this theme.
    document.cookie = `${THEME_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
  };
  return [theme, choose] as const;
}

/** Compact three-way toggle (sidebar, profile menu, auth pages). */
export function ThemeSwitcher({ className }: { className?: string }) {
  const t = useT();
  const [theme, choose] = useTheme();
  return (
    <div className={cn("inline-flex items-center gap-1 rounded-xl bg-tint/[0.05] p-1 ring-1 ring-line", className)} role="radiogroup" aria-label={t("Theme")}>
      {OPTIONS.map(({ value, I, label }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={theme === value}
          onClick={() => choose(value)}
          title={t(label)}
          className={cn("grid h-7 w-8 place-items-center rounded-lg transition-all duration-200", theme === value ? "bg-ink-2 text-fg shadow-sm ring-1 ring-line" : "text-subtle hover:text-fg")}
        >
          <I className="h-4 w-4" aria-hidden />
          <span className="sr-only">{t(label)}</span>
        </button>
      ))}
    </div>
  );
}

/** Large picker with live previews (Settings). */
export function ThemePicker() {
  const t = useT();
  const [theme, choose] = useTheme();
  return (
    <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label={t("Theme")}>
      {OPTIONS.map(({ value, label, hint, swatch: [bg, card, accent] }) => {
        const on = theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => choose(value)}
            className={cn("tap rounded-2xl p-1.5 text-left ring-1 transition", on ? "ring-2 ring-violet" : "ring-line hover:ring-line-strong")}
          >
            <span className="relative block h-20 overflow-hidden rounded-xl" style={{ background: bg }} aria-hidden>
              <span className="absolute left-2 right-2 top-2 h-5 rounded-md" style={{ background: card }} />
              <span className="absolute left-2 top-9 h-2 w-10 rounded-full" style={{ background: accent }} />
              <span className="absolute left-2 right-6 top-13 h-1.5 rounded-full opacity-40" style={{ background: accent }} />
              <span className="absolute bottom-2 right-2 h-5 w-5 rounded-full" style={{ background: accent }} />
              {on && (
                <span className="absolute left-2 bottom-2 grid h-5 w-5 place-items-center rounded-full bg-white text-black">
                  <Check className="h-3.5 w-3.5" aria-hidden />
                </span>
              )}
            </span>
            <span className="mt-2 block px-1 text-sm font-semibold">{t(label)}</span>
            <span className="block px-1 pb-1 text-[11px] leading-tight text-subtle">{t(hint)}</span>
          </button>
        );
      })}
    </div>
  );
}
