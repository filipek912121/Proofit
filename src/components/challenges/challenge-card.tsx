import { getT } from "@/lib/i18n/server";
import Link from "next/link";
import { Calendar, Camera, CircleCheck, Users, Zap } from "lucide-react";
import { DifficultyBadge } from "@/components/ui/badges";
import { CategoryIcon } from "@/components/brand/category-icon";
import { cn } from "@/components/ui/cn";
import { DIFFICULTY_META } from "@/lib/config/taxonomy";
import type { ChallengeCard as Card } from "@/lib/services/challenges";
import type { TFn } from "@/lib/i18n/core";

export function durationLabel(days: number, t: TFn) {
  if (days === 7) return t("1 week");
  return t.p(days, "{n} day", "{n} days");
}

/** A mission row: category world icon, title, the essentials. The whole tile is the button. */
export async function ChallengeCard({ c, index = 0 }: { c: Card; index?: number }) {
  const t = await getT();
  const m = DIFFICULTY_META[c.difficulty];
  return (
    <Link
      href={`/challenges/${c.id}`}
      className="tile group flex items-start gap-3.5 rounded-2xl p-4 animate-rise"
      style={{ animationDelay: `${Math.min(index, 10) * 40}ms` }}
    >
      <CategoryIcon category={c.category} size={56} className="shrink-0" />
      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-2">
          <span className="font-display text-[17px] font-extrabold leading-snug">{t(c.title)}</span>
          {c.joined && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-green px-2 py-0.5 text-[11px] font-black uppercase text-white">
              <CircleCheck className="h-3.5 w-3.5" aria-hidden /> {t("Joined")}
            </span>
          )}
        </span>
        <span className="mt-0.5 line-clamp-2 block text-sm text-muted">{t(c.description)}</span>
        <span className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs font-bold text-subtle">
          <DifficultyBadge difficulty={c.difficulty} />
          <span className={cn("inline-flex items-center gap-1 font-black", m.text)}>
            <Zap className="h-3.5 w-3.5 fill-current" aria-hidden /> {t("{n} XP/day", { n: c.xpReward })}
          </span>
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" aria-hidden /> {durationLabel(c.durationDays, t)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" aria-hidden /> {c.participants}
          </span>
          {c.requiresProof && (
            <span className="inline-flex items-center gap-1">
              <Camera className="h-3.5 w-3.5" aria-hidden /> {t("Proof")}
            </span>
          )}
        </span>
      </span>
    </Link>
  );
}
