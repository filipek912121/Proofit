"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CategoryIcon } from "@/components/brand/category-icon";
import { ProxiAvatar } from "@/components/proxi/proxi-avatar";
import { ReferralShare } from "@/components/social/referral-share";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { FormAlert } from "@/components/ui/field";
import { joinChallengeAction } from "@/lib/actions/challenges";
import { CATEGORY_META } from "@/lib/config/taxonomy";
import { useT } from "@/lib/i18n/client";
import type { ProxiLook, ProxiStage } from "@/lib/proxi/config";
import type { ProxiMood } from "@/lib/proxi/messages";
import type { Category } from "@/lib/types";

const AREAS: Category[] = ["fitness", "health", "learning", "discipline", "creativity", "music", "mindfulness", "lifestyle"];
type Mission = { id: string; title: string; category: Category; durationDays: number; xp: number };

export function Onboarding({
  name,
  proxi,
  missions,
  alreadyActive,
  inviteLink,
}: {
  name: string;
  proxi: { stage: ProxiStage; look: ProxiLook };
  missions: Mission[];
  alreadyActive: string[];
  inviteLink: string;
}) {
  const t = useT();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [area, setArea] = useState<Category | null>(null);
  const [mission, setMission] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const inArea = area ? missions.filter((m) => m.category === area) : [];
  const shown = (inArea.length ? inArea : missions).slice(0, 5);

  const SAY: { mood: ProxiMood; line: string }[] = [
    { mood: "excited", line: t("Hi {name}! I'm PROXI. I grow every time you show proof.", { name }) },
    { mood: "happy", line: t("What do you want to level up first?") },
    { mood: "motivated", line: area && !inArea.length ? t("Nothing official there yet — here are good starters.") : t("Pick your first mission. Small is perfect.") },
    { mood: "proud", line: t("Challenge accepted! Want backup? Friends make it way easier.") },
  ];

  const startMission = () => {
    if (!mission) return;
    setError(null);
    if (alreadyActive.includes(mission)) return setStep(3);
    start(async () => {
      const r = await joinChallengeAction(mission);
      if (r.ok) setStep(3);
      else setError(r.error ?? t("Something went wrong."));
    });
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col px-5 pt-6 pb-safe">
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => setStep(Math.max(0, step - 1))} className={cn("rounded-xl p-1.5 text-subtle hover:bg-ink-3", (step === 0 || step === 3) && "invisible")} aria-label={t("Back")}>
          <ChevronLeft className="h-6 w-6" />
        </button>
        <div className="h-4 flex-1 overflow-hidden rounded-full bg-ink-3" role="progressbar" aria-valuemin={1} aria-valuemax={4} aria-valuenow={step + 1}>
          <div className="relative h-full rounded-full bg-green transition-[width] duration-500" style={{ width: `${((step + 1) / 4) * 100}%` }}>
            <span className="absolute inset-x-[6px] top-[22%] h-[26%] rounded-full bg-white/30" aria-hidden />
          </div>
        </div>
      </div>

      {/* PROXI speaks on every step */}
      <div className={cn("mt-6 flex gap-3", step === 0 ? "flex-col items-center text-center" : "items-end")}>
        <ProxiAvatar stage={proxi.stage} look={proxi.look} mood={SAY[step].mood} size={step === 0 ? 190 : 84} />
        <p key={step} role="status" className={cn("relative rounded-2xl border-2 border-line bg-ink-2 px-4 py-3 text-[16px] font-bold animate-pop", step === 0 ? "max-w-xs" : "flex-1 rounded-bl-md")}>
          {SAY[step].line}
        </p>
      </div>

      <div className="mt-6 flex-1">
        {step === 1 && (
          <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label={t("Areas")}>
            {AREAS.map((c) => (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={area === c}
                onClick={() => {
                  setArea(c);
                  setMission(null);
                }}
                className={cn("flex flex-col items-center gap-1 rounded-2xl border-2 p-1.5 text-[11px] font-extrabold transition-colors", area === c ? "border-violet bg-violet-soft text-violet-2" : "border-line text-muted")}
              >
                <CategoryIcon category={c} size={48} />
                <span className="w-full truncate">{t(CATEGORY_META[c].label)}</span>
              </button>
            ))}
          </div>
        )}
        {step === 2 && (
          <div className="space-y-2" role="radiogroup" aria-label={t("Missions")}>
            {shown.map((m) => (
              <button
                key={m.id}
                type="button"
                role="radio"
                aria-checked={mission === m.id}
                onClick={() => setMission(m.id)}
                className={cn("flex w-full items-center gap-3 rounded-2xl border-2 p-3 text-left transition-colors", mission === m.id ? "border-violet bg-violet-soft" : "border-line")}
              >
                <CategoryIcon category={m.category} size={44} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-extrabold">{m.title}</span>
                  <span className="text-xs font-bold text-subtle">
                    {t.p(m.durationDays, "{n} day", "{n} days")} · +{m.xp} XP
                  </span>
                </span>
              </button>
            ))}
            {error && <FormAlert>{error}</FormAlert>}
          </div>
        )}
        {step === 3 && <ReferralShare link={inviteLink} />}
      </div>

      <div className="py-6">
        {step === 0 && (
          <Button size="lg" variant="success" className="w-full" onClick={() => setStep(1)}>
            {t("Let's go")}
          </Button>
        )}
        {step === 1 && (
          <Button size="lg" variant="success" className="w-full" disabled={!area} onClick={() => setStep(2)}>
            {t("Continue")}
          </Button>
        )}
        {step === 2 && (
          <Button size="lg" variant="success" className="w-full" disabled={!mission} loading={pending} onClick={startMission}>
            {t("Start mission")}
          </Button>
        )}
        {step === 3 && (
          <Button size="lg" variant="success" className="w-full" onClick={() => router.push(mission ? `/challenges/${mission}#checkin` : "/dashboard")}>
            {t("Start playing")}
          </Button>
        )}
        {step < 3 && (
          <button type="button" onClick={() => router.push("/dashboard?welcome=1")} className="mt-3 w-full py-2 text-sm font-extrabold uppercase tracking-wide text-violet-2">
            {t("Skip for now")}
          </button>
        )}
      </div>
    </div>
  );
}
