"use client";

import { Check, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { equipProxiAction, markProxiSeenAction } from "@/lib/actions/proxi";
import { useT } from "@/lib/i18n/client";
import { PROXI_ITEMS, SLOTS, stageInfo, type ProxiItem, type ProxiLook, type ProxiSlot, type ProxiStage } from "@/lib/proxi/config";
import { MOOD_INFO, type ProxiMood } from "@/lib/proxi/messages";
import { cn } from "@/components/ui/cn";
import { useToast } from "@/components/ui/toast";
import { ProxiAvatar } from "./proxi-avatar";
import { ProxiBuddy } from "./proxi-buddy";
import { ProxiCelebration } from "./proxi-celebration";

function lockReason(item: ProxiItem, t: ReturnType<typeof useT>, achievementNames: Record<string, string>) {
  const r = item.rule;
  switch (r.type) {
    case "level":
      return t("Reach level {n}", { n: r.value });
    case "checkins":
      return t("{n} check-ins", { n: r.value });
    case "completed":
      return t("Complete {n} challenges", { n: r.value });
    case "achievement":
      return t("Badge: {name}", { name: t(achievementNames[r.id] ?? r.id) });
    case "premium":
      return "Premium";
    default:
      return "";
  }
}

export function ProxiStudio({
  stage,
  look: initialLook,
  mood,
  line,
  unlocked,
  newUnlocks,
  evolved,
  achievementNames,
}: {
  stage: ProxiStage;
  look: ProxiLook;
  mood: ProxiMood;
  line: string;
  unlocked: string[];
  newUnlocks: string[];
  evolved: boolean;
  achievementNames: Record<string, string>;
}) {
  const t = useT();
  const toast = useToast();
  const router = useRouter();
  const [look, setLook] = useState(initialLook);
  const [slot, setSlot] = useState<ProxiSlot>("color");
  const [pending, start] = useTransition();
  const [fresh] = useState(() => new Set(newUnlocks));
  const info = stageInfo(stage);
  const moodInfo = MOOD_INFO[mood];

  // Seeing this screen clears the "new look" / evolution badges.
  useEffect(() => {
    if (newUnlocks.length && !evolved) void markProxiSeenAction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const equip = (item: ProxiItem) => {
    const prev = look;
    setLook({ ...look, [item.slot]: item.id }); // optimistic preview
    start(async () => {
      const r = await equipProxiAction(item.id);
      if (!r.ok) {
        setLook(prev);
        toast({ tone: "error", title: r.error });
      } else router.refresh();
    });
  };

  const items = PROXI_ITEMS.filter((i) => i.slot === slot);
  return (
    <div className="space-y-6">
      {evolved && (
        <ProxiCelebration
          data={{ levelUp: null, evolvedTo: stage, achievements: [], newItems: newUnlocks }}
          stage={stage}
          look={look}
          onClose={() => {
            void markProxiSeenAction().then(() => router.refresh());
          }}
        />
      )}

      {/* Hero */}
      <section className="surface relative overflow-hidden rounded-3xl px-5 pb-5 pt-6">
        <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(60% 50% at 50% 35%, ${info.color}33, transparent 70%)` }} aria-hidden />
        <div className="relative flex flex-col items-center">
          <span className="mb-1 rounded-full px-3 py-1 text-[11px] font-extrabold tracking-[0.22em] text-black" style={{ background: info.color }}>
            {info.name}
          </span>
          <ProxiBuddy stage={stage} look={look} mood={mood} line={line} size={200} layout="stack" />
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-tint/[0.06] px-3 py-1.5 text-[13px] ring-1 ring-line">
            <span className="h-2 w-2 rounded-full" style={{ background: moodInfo.color }} aria-hidden />
            <span className="font-semibold">{t(moodInfo.label)}</span>
            <span className="text-subtle">· {t(moodInfo.why)}</span>
          </div>
        </div>
      </section>

      {/* Wardrobe */}
      <section aria-label={t("Wardrobe")}>
        <h2 className="mb-3 font-display text-[17px] font-bold">{t("Wardrobe")}</h2>
        <div className="no-scrollbar -mx-4 mb-3 flex gap-2 overflow-x-auto px-4" role="tablist" aria-label={t("Wardrobe")}>
          {SLOTS.map((s) => {
            const owned = PROXI_ITEMS.filter((i) => i.slot === s.slot && unlocked.includes(i.id)).length;
            const total = PROXI_ITEMS.filter((i) => i.slot === s.slot).length;
            const hasNew = PROXI_ITEMS.some((i) => i.slot === s.slot && fresh.has(i.id));
            return (
              <button
                key={s.slot}
                role="tab"
                aria-selected={slot === s.slot}
                onClick={() => setSlot(s.slot)}
                className={cn("tap relative shrink-0 rounded-full px-4 py-2 text-[13px] font-semibold ring-1", slot === s.slot ? "bg-violet text-white ring-violet" : "bg-ink-2 text-muted ring-line")}
              >
                {t(s.name)} <span className="opacity-70">{owned}/{total}</span>
                {hasNew && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-extreme ring-2 ring-ink" aria-label={t("New")} />}
              </button>
            );
          })}
        </div>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6" role="tabpanel">
          {items.map((item) => {
            const owned = unlocked.includes(item.id);
            const on = look[item.slot] === item.id;
            return (
              <button
                key={item.id}
                type="button"
                disabled={!owned || pending}
                onClick={() => equip(item)}
                aria-pressed={on}
                className={cn(
                  "tap relative flex flex-col items-center rounded-2xl px-1 pb-2.5 pt-2 ring-1",
                  on ? "bg-violet/12 ring-2 ring-violet" : "bg-ink-2 ring-line",
                  !owned && "cursor-not-allowed",
                )}
              >
                {fresh.has(item.id) && <span className="absolute left-2 top-2 rounded-full bg-extreme px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">{t("New")}</span>}
                {on && (
                  <span className="absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-violet text-white">
                    <Check className="h-3 w-3" aria-hidden />
                  </span>
                )}
                <span className={cn(!owned && "opacity-35 grayscale")}>
                  <ProxiAvatar stage={stage} look={{ ...look, [item.slot]: item.id }} mood="neutral" size={70} animate={false} />
                </span>
                <span className="mt-1 text-xs font-semibold">{t(item.name)}</span>
                {!owned && (
                  <span className="mt-0.5 inline-flex items-center gap-1 px-1 text-center text-[10px] leading-tight text-subtle">
                    <Lock className="h-3 w-3 shrink-0" aria-hidden /> {lockReason(item, t, achievementNames)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
