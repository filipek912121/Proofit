import { getT } from "@/lib/i18n/server";
import { Award, Bell, CalendarHeart, CircleCheck, Shirt, Star, Trophy, Zap } from "lucide-react";
import type { Metadata } from "next";
import { ProxiAvatar } from "@/components/proxi/proxi-avatar";
import { ProxiReminderToggle } from "@/components/proxi/reminder-toggle";
import { ProxiStudio } from "@/components/proxi/proxi-studio";
import { Card, ListGroup, SectionTitle } from "@/components/ui/card";
import { cn } from "@/components/ui/cn";
import { Icon } from "@/components/ui/icon";
import { ProgressBar } from "@/components/ui/progress";
import { requireUser } from "@/lib/auth";
import { formatDate, formatNumber } from "@/lib/i18n/core";
import { PROXI_ITEMS, STAGES } from "@/lib/proxi/config";
import { pickLine, type LineCategory } from "@/lib/proxi/messages";
import { profileOverview } from "@/lib/services/profile";
import { getProxi } from "@/lib/services/proxi";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("Your PROXI") };
}

const MOOD_LINE: Record<string, LineCategory> = {
  happy: "greeting",
  neutral: "greeting",
  excited: "achievement",
  proud: "challengeDone",
  sleepy: "welcomeBack",
  motivated: "welcomeBack",
};

export default async function ProxiPage() {
  const t = await getT();
  const me = await requireUser();
  const [p, o] = await Promise.all([getProxi(me.id), profileOverview(me.id, me.id)]);
  const unlockedAchievements = (o?.achievements ?? []).filter((a) => a.unlockedAt).sort((a, b) => b.unlockedAt!.localeCompare(a.unlockedAt!));
  const achievementNames = Object.fromEntries((o?.achievements ?? []).map((a) => [a.id, a.name]));
  const toNextStage = p.nextStage ? Math.max(0, p.nextStage.minLevel - p.level) : 0;
  const stageSpan = p.nextStage ? p.nextStage.minLevel - STAGES[p.stage - 1].minLevel : 1;
  const stageProgress = p.nextStage ? (p.level - STAGES[p.stage - 1].minLevel + p.levelProgress.progress) / stageSpan : 1;

  return (
    <div className="space-y-6">
      <header className="animate-rise">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-subtle">{t("Your companion")}</p>
        <h1 className="font-display text-[26px] font-bold tracking-tight sm:text-4xl">{t("Your PROXI")}</h1>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.25fr_1fr]">
        <ProxiStudio
          stage={p.stage}
          look={p.look}
          mood={p.mood}
          line={pickLine(MOOD_LINE[p.mood] ?? "greeting")}
          unlocked={p.unlocked}
          newUnlocks={p.newUnlocks}
          evolved={p.evolved}
          achievementNames={achievementNames}
        />

        <div className="space-y-6">
          {/* Progress */}
          <Card className="p-5">
            <div className="mb-3 flex items-baseline justify-between">
              <p className="font-display text-lg font-bold">{t("Level {n}", { n: p.level })}</p>
              <p className="text-sm text-subtle">
                {formatNumber(p.xp, t.locale)} XP · {t("{xp} XP to level {n}", { xp: p.levelProgress.xpToNext, n: p.level + 1 })}
              </p>
            </div>
            <ProgressBar value={p.levelProgress.progress} className="h-2.5" label={t("Level progress")} />
            <p className="mt-4 text-sm font-semibold">
              {p.nextStage ? t("Next evolution: {stage} at level {n}", { stage: p.nextStage.name, n: p.nextStage.minLevel }) : t("PROXI reached its final form!")}
            </p>
            {p.nextStage && (
              <>
                <ProgressBar value={stageProgress} tone="gold" className="mt-2 h-1.5" label={t("Evolution progress")} />
                <p className="mt-1 text-xs text-subtle">{t.p(toNextStage, "{n} level to go", "{n} levels to go")}</p>
              </>
            )}
          </Card>

          {/* Evolution path */}
          <section aria-label={t("Evolution")}>
            <SectionTitle title={t("Evolution")} />
            <div className="grid grid-cols-4 gap-2">
              {STAGES.map((s) => {
                const reached = p.stage >= s.stage;
                const current = p.stage === s.stage;
                return (
                  <div key={s.stage} className={cn("surface flex flex-col items-center rounded-2xl px-1 py-3", current && "ring-2")} style={current ? { ["--tw-ring-color" as string]: s.color } : undefined}>
                    <ProxiAvatar stage={s.stage} look={reached ? p.look : undefined} mood={current ? "happy" : "neutral"} size={58} animate={current} silhouette={!reached} />
                    <p className="mt-1 text-[10px] font-extrabold tracking-[0.12em]" style={{ color: reached ? s.color : undefined }}>
                      {s.name}
                    </p>
                    <p className="text-[10px] text-subtle">{t("Lv {n}", { n: s.minLevel })}+</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Stats */}
          <section aria-label={t("Stats")}>
            <SectionTitle title={t("PROXI stats")} />
            <div className="grid grid-cols-2 gap-2">
              {[
                { I: Zap, v: formatNumber(p.xp, t.locale), k: t("Total XP"), c: "text-gold" },
                { I: Star, v: String(p.level), k: t("Level"), c: "text-violet-2" },
                { I: CalendarHeart, v: String(p.stats.daysTogether), k: t("Days together"), c: "text-pink-400" },
                { I: CircleCheck, v: String(p.stats.checkins), k: t("Check-ins"), c: "text-green-300" },
                { I: Trophy, v: String(p.stats.challengesCompleted), k: t("Completed"), c: "text-orange-300" },
                { I: Shirt, v: `${p.unlocked.length}/${PROXI_ITEMS.length}`, k: t("Looks unlocked"), c: "text-blue-300" },
              ].map(({ I, v, k, c }) => (
                <div key={k} className="surface flex items-center gap-3 rounded-2xl px-3 py-3">
                  <I className={cn("h-5 w-5 shrink-0", c)} aria-hidden />
                  <div className="min-w-0">
                    <p className="font-display text-lg font-bold leading-none">{v}</p>
                    <p className="mt-1 truncate text-[11px] text-subtle">{k}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Reminders */}
          <Card className="flex items-center gap-3 p-4">
            <Bell className="h-5 w-5 shrink-0 text-violet-2" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{t("Friendly reminders")}</p>
              <p className="text-xs text-subtle">{t("PROXI reminds you about open challenges — at most once a day, never pushy.")}</p>
            </div>
            <ProxiReminderToggle on={p.reminders} />
          </Card>

          {/* Achievement history */}
          <section aria-label={t("Achievement history")}>
            <SectionTitle title={t("Achievement history")} subtitle={t("{n} of {total} badges unlocked. Each one adds a one-time XP bonus.", { n: unlockedAchievements.length, total: o?.achievements.length ?? 0 })} />
            {unlockedAchievements.length ? (
              <ListGroup>
                {unlockedAchievements.map((a) => (
                  <div key={a.id} className="flex items-center gap-3 px-4 py-3">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-gold/12 text-gold">
                      <Icon name={a.icon} className="h-[18px] w-[18px]" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{t(a.name)}</p>
                      <p className="truncate text-xs text-subtle">{t(a.description)}</p>
                    </div>
                    <span className="shrink-0 text-xs text-subtle">{formatDate(a.unlockedAt!, t.locale)}</span>
                  </div>
                ))}
              </ListGroup>
            ) : (
              <p className="flex items-center gap-2 text-sm text-muted">
                <Award className="h-4 w-4" aria-hidden /> {t("No achievements yet — your first check-in unlocks one.")}
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
