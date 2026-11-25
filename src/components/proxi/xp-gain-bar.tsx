"use client";

import { useEffect, useState } from "react";
import { levelFromXp } from "@/lib/engine/levels";
import { useT } from "@/lib/i18n/client";

/** Animates the level bar from the XP before an action to the XP after it (fills up and rolls over on level-up). */
export function XpGainBar({ from, to }: { from: number; to: number }) {
  const t = useT();
  const a = levelFromXp(from);
  const b = levelFromXp(to);
  const [width, setWidth] = useState(a.progress);
  const [level, setLevel] = useState(a.level);
  const [instant, setInstant] = useState(false);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setLevel(b.level);
      setWidth(b.progress);
      return;
    }
    const timers: ReturnType<typeof setTimeout>[] = [];
    if (b.level > a.level) {
      timers.push(setTimeout(() => setWidth(1), 250));
      timers.push(
        setTimeout(() => {
          setInstant(true);
          setLevel(b.level);
          setWidth(0);
        }, 1150),
      );
      timers.push(
        setTimeout(() => {
          setInstant(false);
          setWidth(b.progress);
        }, 1250),
      );
    } else timers.push(setTimeout(() => setWidth(b.progress), 250));
    return () => timers.forEach(clearTimeout);
  }, [a.level, a.progress, b.level, b.progress]);
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="font-semibold">{t("Level {n}", { n: level })}</span>
        <span className="text-subtle tabular-nums">{t("{xp} XP to level {n}", { xp: b.xpToNext, n: b.level + 1 })}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-tint/[0.08]" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(b.progress * 100)} aria-label={t("Level progress")}>
        <div className="h-full rounded-full bg-gold" style={{ width: `${width * 100}%`, transition: instant ? "none" : "width 0.85s cubic-bezier(.2,.7,.2,1)" }} />
      </div>
    </div>
  );
}
