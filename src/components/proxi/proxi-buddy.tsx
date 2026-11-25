"use client";

import { useEffect, useRef, useState } from "react";
import { useT } from "@/lib/i18n/client";
import type { ProxiLook, ProxiStage } from "@/lib/proxi/config";
import { pickLine, type ProxiMood } from "@/lib/proxi/messages";
import { cn } from "@/components/ui/cn";
import { ProxiAvatar } from "./proxi-avatar";

/**
 * PROXI with a speech bubble. Tapping PROXI makes it react (laugh/surprise)
 * with a random line, then it returns to its real mood.
 */
export function ProxiBuddy({
  stage,
  look,
  mood,
  line,
  params,
  size = 96,
  layout = "row",
  extra,
  className,
}: {
  stage: ProxiStage;
  look: ProxiLook;
  mood: ProxiMood;
  /** English source line (translated here). */
  line: string;
  params?: Record<string, string | number>;
  size?: number;
  layout?: "row" | "stack";
  extra?: React.ReactNode;
  className?: string;
}) {
  const t = useT();
  const [poke, setPoke] = useState<{ mood: ProxiMood; line: string } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);
  const onTap = () => {
    if (timer.current) clearTimeout(timer.current);
    setPoke((p) => ({ mood: Math.random() > 0.5 ? "laugh" : "surprised", line: pickLine("poke", p?.line) }));
    timer.current = setTimeout(() => setPoke(null), 2400);
  };
  const shown = poke ? t(poke.line) : t(line, params);
  return (
    <div className={cn(layout === "row" ? "flex items-center gap-3" : "flex flex-col items-center gap-3 text-center", className)}>
      <button type="button" onClick={onTap} className="tap shrink-0 rounded-3xl focus-visible:outline-offset-4" aria-label={t("Poke PROXI")}>
        <ProxiAvatar stage={stage} look={look} mood={poke?.mood ?? mood} size={size} />
      </button>
      <div
        key={shown}
        className={cn(
          "relative min-w-0 rounded-2xl bg-ink-3 px-4 py-3 ring-1 ring-line animate-pop",
          layout === "row" ? "flex-1 rounded-bl-md" : "max-w-sm rounded-t-md",
        )}
        role="status"
        aria-live="polite"
      >
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-violet-2">PROXI</p>
        <p className="mt-0.5 text-[15px] font-semibold leading-snug">{shown}</p>
        {extra && <div className="mt-2">{extra}</div>}
      </div>
    </div>
  );
}
