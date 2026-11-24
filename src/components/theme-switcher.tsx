"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useT } from "@/lib/i18n/client";
import { cn } from "@/components/ui/cn";

export type Theme = "dark" | "light" | "system";
export const THEME_COOKIE = "proofit_theme";

/** Dark / light / system theme toggle. Applies instantly; the cookie lets the server render the same theme. */
export function ThemeSwitcher({ className }: { className?: string }) {
  const t = useT();
  const [theme, setTheme] = useState<Theme>("dark");
  useEffect(() => {
    const current = document.documentElement.dataset.theme;
    if (current === "light" || current === "system" || current === "dark") setTheme(current);
  }, []);
  const choose = (next: Theme) => {
    setTheme(next);
    document.documentElement.dataset.theme = next;
    document.cookie = `${THEME_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
  };
  const options: [Theme, typeof Moon, string][] = [
    ["dark", Moon, "Dark"],
    ["light", Sun, "Light"],
    ["system", Monitor, "System"],
  ];
  return (
    <div className={cn("inline-flex items-center gap-1 rounded-xl bg-tint/[0.04] p-1 ring-1 ring-line", className)} role="group" aria-label={t("Theme")}>
      {options.map(([value, I, label]) => (
        <button
          key={value}
          type="button"
          onClick={() => choose(value)}
          aria-pressed={theme === value}
          title={t(label)}
          className={cn("grid h-7 w-8 place-items-center rounded-lg transition", theme === value ? "bg-tint/10 text-fg" : "text-subtle hover:text-fg")}
        >
          <I className="h-4 w-4" aria-hidden />
          <span className="sr-only">{t(label)}</span>
        </button>
      ))}
    </div>
  );
}
