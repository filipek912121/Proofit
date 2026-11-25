import { getT } from "@/lib/i18n/server";
import { Lock } from "lucide-react";
import type { Metadata } from "next";
import { ProxiBuddy } from "@/components/proxi/proxi-buddy";
import { TIER_STYLE } from "@/components/social/profile-view";
import { PageHeader, SectionTitle } from "@/components/ui/card";
import { cn } from "@/components/ui/cn";
import { Icon } from "@/components/ui/icon";
import { ProgressBar } from "@/components/ui/progress";
import { requireUser } from "@/lib/auth";
import { achievementProgress } from "@/lib/config/achievements";
import { formatDate } from "@/lib/i18n/core";
import { pickLine } from "@/lib/proxi/messages";
import { profileOverview } from "@/lib/services/profile";
import { achievementStats } from "@/lib/services/progress";
import { getProxiLook } from "@/lib/services/proxi";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("Achievements") };
}

export default async function AchievementsPage() {
  const t = await getT();
  const me = await requireUser();
  const [o, stats, proxi] = await Promise.all([profileOverview(me.id, me.id), achievementStats(me.id), getProxiLook(me.id)]);
  const all = o!.achievements;
  const progress = stats ? achievementProgress(stats) : {};
  const unlocked = all.filter((a) => a.unlockedAt).sort((a, b) => b.unlockedAt!.localeCompare(a.unlockedAt!));
  // Closest to unlocking first — gives a clear next goal.
  const locked = all
    .filter((a) => !a.unlockedAt)
    .sort((a, b) => {
      const pa = progress[a.id] ? progress[a.id][0] / progress[a.id][1] : 0;
      const pb = progress[b.id] ? progress[b.id][0] / progress[b.id][1] : 0;
      return pb - pa;
    });
  const recent = unlocked.find((a) => Date.now() - new Date(a.unlockedAt!).getTime() < 3 * 86_400_000);

  return (
    <>
      <PageHeader eyebrow={t("Achievements")} title={t("Your trophy case")} subtitle={t("{n} of {total} badges unlocked. Each one adds a one-time XP bonus.", { n: unlocked.length, total: all.length })} />
      <ProgressBar value={unlocked.length / all.length} tone="gold" className="mb-6 h-2" label={t("Achievements unlocked")} />

      {recent && (
        <div className="surface mb-6 rounded-2xl p-4 animate-rise">
          <ProxiBuddy stage={proxi.stage} look={proxi.look} mood="excited" line={pickLine("achievement")} size={80} extra={<p className="text-xs font-semibold text-gold">{t(recent.name)}</p>} />
        </div>
      )}

      {locked.length > 0 && (
        <section className="mb-8" aria-label={t("Next goals")}>
          <SectionTitle title={t("Next goals")} />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {locked.map((a, i) => {
              const [cur, target] = progress[a.id] ?? [0, 1];
              return (
                <div key={a.id} className="surface flex items-center gap-3 rounded-2xl p-3.5 animate-rise" style={{ animationDelay: `${i * 35}ms` }}>
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-tint/[0.05] text-subtle ring-1 ring-line">
                    <Lock className="h-5 w-5" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate text-sm font-semibold">{t(a.name)}</p>
                      <span className="shrink-0 text-xs tabular-nums text-subtle">
                        {Math.min(cur, target)}/{target}
                      </span>
                    </div>
                    <p className="truncate text-xs text-subtle">{t(a.description)}</p>
                    <ProgressBar value={cur / target} tone="gold" className="mt-2 h-1.5" label={t(a.name)} />
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-gold">+{a.xpBonus}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section aria-label={t("Unlocked")}>
        <SectionTitle title={t("Unlocked")} />
        {unlocked.length ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {unlocked.map((a, i) => (
              <div key={a.id} className={cn("shine relative flex flex-col items-center rounded-2xl bg-gradient-to-b p-4 text-center ring-1 animate-pop", TIER_STYLE[a.tier])} style={{ animationDelay: `${i * 50}ms` }}>
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-black/20 ring-1 ring-white/10">
                  <Icon name={a.icon} className="h-6 w-6" />
                </span>
                <p className="mt-2 text-sm font-bold text-fg">{t(a.name)}</p>
                <p className="text-[11px] text-muted">
                  {t(a.tier[0].toUpperCase() + a.tier.slice(1))} · {formatDate(a.unlockedAt!, t.locale)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">{t("No achievements yet — your first check-in unlocks one.")}</p>
        )}
      </section>
    </>
  );
}
