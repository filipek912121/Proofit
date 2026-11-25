import { getT } from "@/lib/i18n/server";
import { ArrowLeft, Check, CircleCheck, Crown, Hourglass, PartyPopper, ShieldCheck, Swords, Trophy } from "lucide-react";
import { CategoryIcon } from "@/components/brand/category-icon";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { durationLabel } from "@/components/challenges/challenge-card";
import { STATUS_LABEL } from "@/components/social/profile-view";
import { CheckInForm } from "@/components/challenges/check-in-form";
import { ActionButton } from "@/components/ui/action-button";
import { Avatar, avatarOf } from "@/components/ui/avatar";
import { CategoryChip, DifficultyBadge, Pill, VisibilityChip } from "@/components/ui/badges";
import { LinkButton } from "@/components/ui/button";
import { SectionTitle } from "@/components/ui/card";
import { cn } from "@/components/ui/cn";
import { joinChallengeAction, leaveChallengeAction } from "@/lib/actions/challenges";
import { requireUser } from "@/lib/auth";
import { DIFFICULTY_META } from "@/lib/config/taxonomy";
import { addDays, dayKey } from "@/lib/engine/dates";
import { challengeDetail } from "@/lib/services/challenges";
import { getProxiLook } from "@/lib/services/proxi";
import { getStore } from "@/lib/data";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const ch = await getStore().getChallenge(id.slice(0, 64));
  const t = await getT();
  return { title: ch && ch.visibility === "public" ? t(ch.title) : t("Challenge") };
}

export default async function ChallengePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  const t = await getT();
  const me = await requireUser();
  const { id } = await params;
  const { created } = await searchParams;
  const d = await challengeDetail(id.slice(0, 64), me.id);
  if (!d) notFound();
  const proxiLook = await getProxiLook(me.id);
  const c = d.challenge;
  const p = d.participation;
  const m = DIFFICULTY_META[c.difficulty];
  const today = dayKey();
  const days = d.window ? Array.from({ length: c.durationDays }, (_, i) => addDays(d.window!.startDay, i)) : [];
  const byDay = new Map(d.myCompletions.filter((x) => x.status !== "rejected").map((x) => [x.day, x.status]));
  const isActive = p?.status === "active";
  // Keep the check-in panel mounted when today's check-in just finished the challenge,
  // so the XP celebration stays on screen instead of jumping to the "completed" view.
  const showCheckIn = isActive || (p?.status === "completed" && Boolean(d.todayCompletion));

  const ranked = [...d.roster].filter((r) => r.participation.status !== "left").sort((a, b) => b.participation.checkins - a.participation.checkins);
  const myRank = ranked.findIndex((r) => r.profile.id === me.id) + 1;
  const dayNumber = d.window ? Math.min(c.durationDays, Math.max(1, days.indexOf(today) + 1 || (today > days[days.length - 1] ? c.durationDays : 1))) : 0;
  const daysLeft = d.window ? Math.max(0, days.length - dayNumber) : 0;

  return (
    <div className="space-y-8">
      <Link href="/explore" className="inline-flex items-center gap-1.5 text-sm font-extrabold uppercase tracking-wide text-subtle hover:text-fg">
        <ArrowLeft className="h-4 w-4" aria-hidden />{" "}{t("Challenges")}
      </Link>

      {created && (
        <div className="flex items-center gap-3 rounded-2xl border-2 border-green/60 bg-green/10 p-4 animate-pop" role="status">
          <PartyPopper className="h-6 w-6 text-green-dark" aria-hidden />
          <p className="text-sm">
            <span className="font-extrabold">{t("Challenge launched!")}</span> {c.isTemplate ? t("Saved as a template — use it from the Create page.") : t("Share it with friends or start a duel on it.")}
          </p>
        </div>
      )}

      {/* Mission header */}
      <header className="flex items-start gap-4 animate-rise">
        <CategoryIcon category={c.category} size={76} className="shrink-0" />
        <div className="min-w-0">
          <h1 className="font-display text-[28px] font-black leading-tight">{t(c.title)}</h1>
          <p className="mt-1 text-sm font-bold text-subtle">
            {durationLabel(c.durationDays, t)} · <span className={m.text}>+{c.xpReward} XP</span> {t("per day")} · {t.p(c.participants, "{n} player", "{n} players")}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <DifficultyBadge difficulty={c.difficulty} />
            <CategoryChip category={c.category} />
            {c.visibility === "private" && <VisibilityChip visibility={c.visibility} squad={Boolean(c.squadId)} />}
            {c.isTemplate && <Pill tone="gold">{t("Template")}</Pill>}
          </div>
        </div>
      </header>
      <p className="-mt-4 text-[15px] text-muted">{t(c.description)}</p>

      {/* Today: the one thing to do */}
      <section id="checkin" className="scroll-mt-20">
        {showCheckIn && d.window ? (
          <>
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <p className="text-sm font-black uppercase tracking-wider text-violet-2">
                {t("Day {n} of {total}", { n: dayNumber, total: c.durationDays })}
              </p>
              <p className="text-sm font-bold text-subtle">{daysLeft > 0 ? t.p(daysLeft, "{n} day left", "{n} days left") : t("Last day!")}</p>
            </div>
            {d.canCheckIn || d.todayCompletion ? (
              <CheckInForm
                challengeId={c.id}
                tasks={c.tasks}
                requiresProof={c.requiresProof}
                today={d.todayCompletion && d.todayCompletion.status !== "rejected" ? { status: d.todayCompletion.status, xp: d.todayCompletion.xpAwarded } : null}
                proxi={proxiLook}
                category={c.category}
              />
            ) : (
              <p className="text-sm text-muted">{t("Check-ins are closed for this window.")}</p>
            )}
          </>
        ) : (
          <div className="rounded-3xl border-2 border-line p-6 text-center">
            {p?.status === "completed" ? (
              <>
                <Trophy className="mx-auto mb-2 h-12 w-12 text-gold" aria-hidden />
                <h2 className="font-display text-2xl font-black">{t("You completed this challenge!")}</h2>
                <p className="mt-1 text-sm text-muted">{t("Run it again to keep the habit going.")}</p>
              </>
            ) : p?.status === "failed" ? (
              <>
                <h2 className="font-display text-2xl font-black">{t("This run ended")}</h2>
                <p className="mt-1 text-sm text-muted">{t("You checked in {done} of {total} days. Every attempt counts — try again.", { done: p.checkins, total: c.durationDays })}</p>
              </>
            ) : (
              <>
                <h2 className="font-display text-2xl font-black">{c.isTemplate ? t("This is a template") : t("Ready to commit?")}</h2>
                <p className="mt-1 text-sm text-muted">
                  {c.isTemplate ? t("Templates can't be joined. Create a live challenge from it.") : t("Check in once a day for {duration}. Starts today.", { duration: durationLabel(c.durationDays, t) })}
                </p>
                <ul className="mx-auto mt-4 max-w-sm space-y-1.5 text-left">
                  {c.tasks.map((task) => (
                    <li key={task} className="flex items-center gap-2 text-sm font-bold">
                      <span className="h-2 w-2 shrink-0 rounded-full bg-violet" aria-hidden /> {t(task)}
                    </li>
                  ))}
                </ul>
              </>
            )}
            <div className="mt-5 flex flex-col items-center gap-2">
              {c.isTemplate ? (
                <LinkButton href={`/create?template=${c.id}`}>{t("Use template")}</LinkButton>
              ) : d.slotsLeft > 0 ? (
                <ActionButton size="lg" variant="success" className="w-full max-w-xs" action={joinChallengeAction.bind(null, c.id)} successTitle={t("Challenge joined!")}>
                  {p ? t("Start again") : t("Join challenge")}
                </ActionButton>
              ) : (
                <>
                  <p className="text-sm font-bold text-orange-300">{t("You've hit your active challenge limit.")}</p>
                  {d.plan === "free" && (
                    <LinkButton href="/premium" variant="gold" icon={<Crown className="h-4 w-4" />}>
                      {t("Upgrade for more slots")}
                    </LinkButton>
                  )}
                </>
              )}
              {!c.isTemplate && d.slotsLeft > 0 && <p className="text-xs font-semibold text-subtle">{t.p(d.slotsLeft, "{n} free slot on your {plan} plan", "{n} free slots on your {plan} plan", { plan: d.plan === "premium" ? "Premium" : t("Free") })}</p>}
            </div>
          </div>
        )}
        {c.requiresProof && (
          <p className="mt-3 flex items-start gap-2 text-xs font-semibold text-subtle">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> {t("Proof is reviewed by the challenge creator or verified finishers. Uploading a photo doesn't automatically count as completion.")}
          </p>
        )}
      </section>

      {/* The mission path */}
      {d.window && p && (
        <section aria-label={t("Your path")}>
          <h2 className="mb-4 font-display text-[19px] font-extrabold">{t("Your path")}</h2>
          <MissionPath
            days={days}
            today={today}
            byDay={byDay}
            labels={{ day: (n) => t("Day {n}", { n }), done: t("done"), pending: t("pending"), missed: t("missed"), today: t("today"), upcoming: t("upcoming"), finish: t("Finish line") }}
          />
        </section>
      )}

      {/* Standing + players */}
      {!c.isTemplate && (
        <section aria-label={t("Players")}>
          <SectionTitle title={t("Players")} subtitle={myRank > 0 && ranked.length > 1 ? t("You're #{rank} of {n}", { rank: myRank, n: ranked.length }) : t("{n} in total", { n: c.participants })} />
          {ranked.length ? (
            <ol className="divide-y-2 divide-line rounded-2xl border-2 border-line">
              {ranked.map((r, i) => (
                <li key={r.profile.id}>
                  <Link href={r.profile.id === me.id ? "/profile" : `/u/${r.profile.username}`} className={cn("flex items-center gap-3 px-4 py-2.5", r.profile.id === me.id ? "bg-green/10" : "hover:bg-ink-3")}>
                    <span className={cn("w-5 text-center font-black tabular-nums", i < 3 ? "text-gold-dark" : "text-subtle")}>{i + 1}</span>
                    <Avatar {...avatarOf(r.profile)} size={36} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-extrabold">
                        {r.profile.displayName} {r.profile.id === me.id && <span className="text-subtle">{t("(you)")}</span>}
                      </span>
                      <span className="block text-xs font-semibold text-subtle">{t(STATUS_LABEL[r.participation.status])}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 font-black tabular-nums text-green-dark">
                      {r.participation.checkins} <CircleCheck className="h-4 w-4" aria-label={t("check-ins")} />
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-muted">{t("Nobody yet — be the first.")}</p>
          )}
        </section>
      )}

      {!c.isTemplate && (
        <div className="flex flex-col gap-2 sm:flex-row">
          <LinkButton href={`/duels?challenge=${c.id}`} variant="secondary" className="flex-1" icon={<Swords className="h-4 w-4" />}>
            {t("Duel a friend on this")}
          </LinkButton>
          {d.isCreator && c.requiresProof && (
            <LinkButton href="/review" variant="secondary" className="flex-1" icon={<ShieldCheck className="h-4 w-4" />}>
              {t("Review submitted proofs")}
            </LinkButton>
          )}
          {isActive && (
            <ActionButton variant="ghost" action={leaveChallengeAction.bind(null, c.id)} confirm={t("Leave this challenge? Your current run will end.")}>
              {t("Leave challenge")}
            </ActionButton>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * A winding path of day nodes (zig-zag), ending in a trophy. Done days are solid
 * green coins, today is the big violet node, missed days stay grey (no shaming),
 * future days are quiet. Long challenges (> 14 days) use a compact grid instead.
 */
function MissionPath({
  days,
  today,
  byDay,
  labels,
}: {
  days: string[];
  today: string;
  byDay: Map<string, string>;
  labels: { day: (n: number) => string; done: string; pending: string; missed: string; today: string; upcoming: string; finish: string };
}) {
  const state = (day: string) => {
    const st = byDay.get(day);
    return st === "approved" ? "done" : st === "pending" ? "pending" : day === today ? "today" : day < today ? "missed" : "upcoming";
  };
  const STYLE = {
    done: "bg-green text-white [--lip:var(--color-green-dark)]",
    pending: "bg-gold text-[#3b2a00] [--lip:var(--color-gold-dark)]",
    today: "bg-violet text-white [--lip:var(--color-violet-dark)]",
    missed: "bg-ink-3 text-subtle [--lip:var(--color-line-strong)]",
    upcoming: "bg-ink-3 text-subtle/70 [--lip:var(--color-line)]",
  } as const;
  if (days.length > 14)
    return (
      <ol className="grid grid-cols-7 gap-2">
        {days.map((day, i) => {
          const s = state(day);
          return (
            <li key={day} aria-label={`${labels.day(i + 1)}: ${labels[s]}`} className={cn("btn-3d grid aspect-square place-items-center rounded-full text-sm font-black [--btn-depth:3px]", STYLE[s], s === "today" && "ring-4 ring-violet/25")}>
              {s === "done" ? <Check className="h-4 w-4" strokeWidth={4} aria-hidden /> : i + 1}
            </li>
          );
        })}
      </ol>
    );
  // Horizontal offsets that make the path snake left and right.
  const OFF = [0, 52, 78, 52, 0, -52, -78, -52];
  return (
    <ol className="relative mx-auto flex max-w-xs flex-col items-center gap-4 pb-2 pt-10">
      {days.map((day, i) => {
        const s = state(day);
        return (
          <li key={day} className="relative" style={{ transform: `translateX(${OFF[i % OFF.length]}px)` }} aria-label={`${labels.day(i + 1)}: ${labels[s]}`}>
            {s === "today" && <span className="absolute -inset-2 rounded-full border-4 border-violet/25 animate-pulse" aria-hidden />}
            <span className={cn("btn-3d relative grid place-items-center rounded-full font-black [--btn-depth:6px]", s === "today" ? "h-[72px] w-[72px] text-xl" : "h-16 w-16 text-lg", STYLE[s])}>
              {s === "done" ? <Check className="h-8 w-8" strokeWidth={4} aria-hidden /> : s === "pending" ? <Hourglass className="h-7 w-7" aria-hidden /> : i + 1}
            </span>
            {s === "today" && <span className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-xl border-2 border-violet/40 bg-violet-soft px-2.5 py-1 text-xs font-black uppercase text-violet-2 animate-bob">{labels.today}</span>}
          </li>
        );
      })}
      <li className="relative mt-1" aria-label={labels.finish}>
        <span className={cn("btn-3d grid h-20 w-20 place-items-center rounded-3xl [--btn-depth:6px]", days.every((d) => byDay.get(d) === "approved") ? "bg-gold [--lip:var(--color-gold-dark)]" : "bg-ink-3 [--lip:var(--color-line-strong)]")}>
          <Trophy className={cn("h-10 w-10", days.every((d) => byDay.get(d) === "approved") ? "text-white" : "text-subtle")} aria-hidden />
        </span>
      </li>
    </ol>
  );
}
