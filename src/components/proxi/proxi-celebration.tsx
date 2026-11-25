"use client";

import { Award, Sparkles, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useT } from "@/lib/i18n/client";
import { PROXI_ITEMS, stageInfo, type ProxiLook, type ProxiStage } from "@/lib/proxi/config";
import { pickLine } from "@/lib/proxi/messages";
import { Button } from "@/components/ui/button";
import { Confetti } from "@/components/ui/confetti";
import { ProxiAvatar } from "./proxi-avatar";

export interface Celebration {
  levelUp: number | null;
  evolvedTo: ProxiStage | null;
  achievements: string[];
  newItems: string[];
}

/** Full-screen celebration for level-ups, PROXI evolutions, achievements and new looks. */
export function ProxiCelebration({ data, stage, look, onClose }: { data: Celebration; stage: ProxiStage; look: ProxiLook; onClose?: () => void }) {
  const t = useT();
  const [open, setOpen] = useState(true);
  const [line] = useState(() =>
    pickLine(data.evolvedTo ? "evolve" : data.levelUp ? "levelUp" : data.achievements.length ? "achievement" : "unlock"),
  );
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const close = () => {
    setOpen(false);
    onClose?.();
  };
  if (!open) return null;
  const title = data.evolvedTo
    ? t("PROXI evolved to {stage}!", { stage: stageInfo(data.evolvedTo).name })
    : data.levelUp
      ? t("Level {n}!", { n: data.levelUp })
      : data.achievements.length
        ? t("New achievement!")
        : t("New PROXI look unlocked!");
  return (
    <div className="fixed inset-0 z-[95] grid place-items-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <button className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade" onClick={close} aria-label={t("Close")} />
      <div className="surface raised relative w-full max-w-sm overflow-hidden rounded-3xl p-6 text-center animate-levelup">
        <Confetti count={36} />
        <div className="relative mx-auto mb-2 grid place-items-center">
          <span className="absolute h-40 w-40 rounded-full blur-3xl" style={{ background: stageInfo(stage).color, opacity: 0.35 }} aria-hidden />
          <ProxiAvatar stage={stage} look={look} mood={data.evolvedTo || data.levelUp ? "proud" : "excited"} size={150} />
        </div>
        {data.evolvedTo && (
          <span className="shine mb-2 inline-block rounded-full px-3 py-1 text-xs font-extrabold tracking-[0.2em] text-black" style={{ background: stageInfo(data.evolvedTo).color }}>
            {stageInfo(data.evolvedTo).name}
          </span>
        )}
        <h2 className="font-display text-2xl font-bold">{title}</h2>
        <p className="mt-1 text-sm text-muted">„{t(line)}”</p>
        {data.evolvedTo && <p className="mt-2 text-sm">{t(stageInfo(data.evolvedTo).tagline)}</p>}
        <ul className="mt-4 space-y-2 text-left">
          {data.levelUp && data.evolvedTo && (
            <li className="flex items-center gap-2 rounded-xl bg-tint/[0.05] px-3 py-2 text-sm">
              <Star className="h-4 w-4 text-gold" aria-hidden /> {t("Level {n}!", { n: data.levelUp })}
            </li>
          )}
          {data.achievements.map((a) => (
            <li key={a} className="shine flex items-center gap-2 rounded-xl bg-gold/10 px-3 py-2 text-sm ring-1 ring-gold/25">
              <Award className="h-4 w-4 text-gold" aria-hidden /> {t(a)}
            </li>
          ))}
          {data.newItems.map((id) => {
            const item = PROXI_ITEMS.find((i) => i.id === id);
            return item ? (
              <li key={id} className="flex items-center gap-2 rounded-xl bg-violet/10 px-3 py-2 text-sm ring-1 ring-violet/25">
                <Sparkles className="h-4 w-4 text-violet-2" aria-hidden /> {t("New for PROXI: {item}", { item: t(item.name) })}
              </li>
            ) : null;
          })}
        </ul>
        <div className="mt-5 grid gap-2">
          {(data.newItems.length > 0 || data.evolvedTo) && (
            <a href="/proxi" className="inline-flex h-11 items-center justify-center rounded-xl bg-violet text-sm font-semibold text-white">
              {t("Visit your PROXI")}
            </a>
          )}
          <Button variant="secondary" onClick={close}>
            {t("Awesome!")}
          </Button>
        </div>
      </div>
    </div>
  );
}
