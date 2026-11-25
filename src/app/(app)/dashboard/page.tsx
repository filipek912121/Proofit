import { getT } from "@/lib/i18n/server";
import { Check, ChevronRight, Hourglass } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { CategoryIcon } from "@/components/brand/category-icon";
import { StreakFlame } from "@/components/brand/streak-flame";
import { ProxiBuddy } from "@/components/proxi/proxi-buddy";
import { propForCategory } from "@/lib/proxi/props";
import { InvitesPanel } from "@/components/social/invites-panel";
import { ActionButton } from "@/components/ui/action-button";
import { Avatar, avatarOf } from "@/components/ui/avatar";
import { LinkButton } from "@/components/ui/button";
import { SectionTitle } from "@/components/ui/card";
import { cn } from "@/components/ui/cn";
import { ProgressBar } from "@/components/ui/progress";
import { joinChallengeAction } from "@/lib/actions/challenges";
import { requireUser } from "@/lib/auth";
import { getStore } from "@/lib/data";
import { addDays, appTimeZone, dayKey, startOfWeek } from "@/lib/engine/dates";
import { liveStreak } from "@/lib/engine/xp";
import { intlLocale } from "@/lib/i18n/core";
import { pickLine } from "@/lib/proxi/messages";
import { activeChallenges, dailyChallenge } from "@/lib/services/challenges";
import { listDuels } from "@/lib/services/duels";
import { getProxi } from "@/lib/services/proxi";
import { friendActivity, leaderboard, pendingInvites } from "@/lib/services/social";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("Today") };
}

function hourNow() {
  return Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone: appTimeZone() }).format(new Date()));
}

/**
 * TODAY — the home screen answers four questions in this order:
 *   1. What do I do today?   (missions, one big PROOF action each)
 *   2. How am I doing?       (day progress + this week's streak strip)
 *   3. How are my friends?   (one line about the league, latest proofs)
 *   4. What do I tap now?    (the first open mission is the primary button)
 */
export default async function Today({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const t = await getT();
  const me = await requireUser();
  const today = dayKey();
  const weekStart = startOfWeek(today);
  const [active, daily, duels, invites, board, activity, proxi, weekProofs] = await Promise.all([
    activeChallenges(me.id),
    dailyChallenge(me.id),
    listDuels(me.id),
    pendingInvites(me.id),
    leaderboard(me.id, "friends", "week"),
    friendActivity(me.id, 3),
    getProxi(me.id),
    getStore().listCompletions({ userId: me.id, sinceDay: weekStart }),
  ]);
  const { welcome } = await searchParams;
  const locale = intlLocale(t.locale);
  const streak = liveStreak(me, today);
  const open = active.filter((a) => !a.checkedInToday);
  const done = active.length - open.length;
  const allDone = active.length > 0 && open.length === 0;
  const firstName = me.displayName.split(" ")[0];
  const proofDays = new Set(weekProofs.filter((c) => c.status !== "rejected").map((c) => c.day));
  const duelInvites = duels.filter((d) => d.duel.status === "pending" && !d.iAmChallenger);
  const meRow = board.find((r) => r.isMe);
  const above = meRow && meRow.rank > 1 ? board.find((r) => r.rank === meRow.rank - 1) : undefined;

  // State of the day → headline + what PROXI says. Breaks are met with a welcome, never guilt.
  const state = welcome ? "new" : !active.length ? "empty" : allDone ? "done" : proxi.mood === "sleepy" || proxi.mood === "motivated" ? "back" : "open";
  const headline = {
    new: t("Hi {name}! Let's start.", { name: firstName }),
    empty: t("Pick your first mission"),
    done: t("That's a wrap for today."),
    back: t("You're back. Let's go."),
    open: hourNow() < 12 ? t("Make today count.") : t("One more push today."),
  }[state];
  const proxiLine =
    state === "new"
      ? "Welcome to PROOFIT, {name}!"
      : state === "done"
        ? pickLine("allDone")
        : state === "back"
          ? pickLine("welcomeBack")
          : state === "empty"
            ? "Pick a mission and I'll cheer you on."
            : proxi.mood === "excited"
              ? pickLine("achievement")
              : pickLine("reminder");
  const proxiMood = state === "new" ? "excited" : state === "done" ? "proud" : state === "back" ? "happy" : proxi.mood;

  return (
    <div className="space-y-8">
      {/* 1 · Headline + PROXI */}
      <header className="space-y-4 animate-rise">
        <h1 className="font-display text-[28px] font-black leading-tight">{headline}</h1>
        <ProxiBuddy stage={proxi.stage} look={proxi.look} mood={proxiMood} line={proxiLine} params={{ name: firstName }} size={88} prop={state === "done" ? "trophy" : propForCategory(open[0]?.challenge.category)} />
      </header>

      {/* 2 · Today's missions */}
      {active.length > 0 ? (
        <section aria-label={t("Today's missions")} className="animate-rise [animation-delay:60ms]">
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h2 className="font-display text-[19px] font-extrabold">{t("Today's missions")}</h2>
            <span className={cn("text-sm font-black tabular-nums", allDone ? "text-green-dark" : "text-subtle")}>
              {done}/{active.length}
            </span>
          </div>
          <ProgressBar value={done / active.length} tone={allDone ? "easy" : "brand"} className="mb-4 h-4" label={t("Today's progress")} />
          <ul className="space-y-3">
            {active.map((a, i) => {
              const c = a.challenge;
              const pending = a.todayStatus === "pending";
              const primary = !a.checkedInToday && a === open[0];
              return (
                <li key={c.id} className="animate-rise" style={{ animationDelay: `${80 + i * 50}ms` }}>
                  <div className={cn("flex items-center gap-3 rounded-2xl border-2 p-3", a.checkedInToday ? "border-line bg-ink-3/60" : "border-line")}>
                    <Link href={`/challenges/${c.id}`} className="tap shrink-0" aria-label={t(c.title)}>
                      <CategoryIcon category={c.category} size={52} />
                    </Link>
                    <Link href={`/challenges/${c.id}`} className="min-w-0 flex-1">
                      <span className={cn("block truncate font-extrabold", a.checkedInToday && "text-muted")}>{t(c.title)}</span>
                      <span className="mt-0.5 block text-xs font-bold text-subtle">
                        {c.durationDays > 1 ? t("Day {n} of {total}", { n: a.dayNumber, total: c.durationDays }) : t("Today only")}
                        {" · +"}
                        {c.xpReward} XP
                      </span>
                      {c.durationDays > 1 && c.durationDays <= 14 && (
                        <span className="mt-1.5 flex gap-1" aria-hidden>
                          {Array.from({ length: c.durationDays }, (_, d) => {
                            const n = d + 1;
                            const isDone = n < a.dayNumber ? true : n === a.dayNumber && a.checkedInToday;
                            return <span key={d} className={cn("h-1.5 flex-1 rounded-full", isDone ? "bg-green" : n === a.dayNumber ? "bg-violet/40" : "bg-ink-3")} />;
                          })}
                        </span>
                      )}
                    </Link>
                    {a.checkedInToday ? (
                      pending ? (
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gold/20 text-gold-dark" title={t("Proof awaiting review")}>
                          <Hourglass className="h-5 w-5" aria-label={t("Proof awaiting review")} />
                        </span>
                      ) : (
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-green text-white animate-check" title={t("Done today")}>
                          <Check className="h-6 w-6" strokeWidth={3.5} aria-label={t("Done today")} />
                        </span>
                      )
                    ) : (
                      <LinkButton href={`/challenges/${c.id}#checkin`} size="sm" variant={primary ? "success" : "secondary"} className="shrink-0">
                        {t("Proof it")}
                      </LinkButton>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
          {allDone && <p className="mt-4 text-center text-sm font-bold text-muted">{t("Done is better than promised. See you tomorrow.")}</p>}
        </section>
      ) : (
        <section className="rounded-3xl border-2 border-dashed border-line-strong p-5 text-center animate-rise" aria-label={t("Start a mission")}>
          <p className="font-extrabold">{t("No missions yet")}</p>
          <p className="mt-1 text-sm text-muted">{t("Start with something small. A 1-day mission takes a few minutes.")}</p>
          <LinkButton href="/explore" className="mt-4">
            {t("Find a mission")}
          </LinkButton>
        </section>
      )}

      {/* 3 · This week: streak strip */}
      <section aria-label={t("This week")} className="animate-rise [animation-delay:120ms]">
        <div className="mb-3 flex items-center gap-2">
          <StreakFlame size={26} lit={streak > 0} />
          <h2 className="font-display text-[19px] font-extrabold">
            {streak > 0 ? t.p(streak, "{n}-day streak", "{n}-day streak") : t("Start a streak today")}
          </h2>
        </div>
        <WeekStrip weekStart={weekStart} today={today} proofDays={proofDays} locale={locale} />
      </section>

      <InvitesPanel invites={invites} duels={duelInvites} />

      {/* 4 · Friends pulse */}
      {(meRow && board.length > 1) || activity.length > 0 ? (
        <section aria-label={t("Friends")}>
          <SectionTitle title={t("Your crew")} action={<Link href="/friends">{t("Friends")}</Link>} />
          <div className="divide-y-2 divide-line rounded-2xl border-2 border-line">
            {meRow && board.length > 1 && (
              <Link href="/leaderboard" className="flex items-center gap-3 px-4 py-3 hover:bg-ink-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-gold font-black text-[#3b2a00]">#{meRow.rank}</span>
                <span className="min-w-0 flex-1 text-sm font-bold">
                  {above
                    ? t("{xp} XP to pass {name} this week", { xp: above.xp - meRow.xp + 1, name: above.profile.displayName.split(" ")[0] })
                    : t("You lead your friends this week")}
                </span>
                <ChevronRight className="h-4 w-4 text-subtle" aria-hidden />
              </Link>
            )}
            {activity.map((a) => (
              <Link key={a.id} href={`/challenges/${a.challenge.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-ink-3">
                <Avatar {...avatarOf(a.profile)} size={36} />
                <span className="min-w-0 flex-1 text-sm">
                  <span className="font-extrabold">{a.profile.displayName.split(" ")[0]}</span> <span className="text-muted">{t("showed proof for")}</span>{" "}
                  <span className="font-bold">{t(a.challenge.title)}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* Today's quick mission — only when it adds something */}
      {daily && !daily.joined && active.length < 3 && (
        <section aria-label={t("Daily challenge")}>
          <SectionTitle title={t("Quick mission")} />
          <div className="flex items-center gap-3 rounded-2xl border-2 border-line p-3">
            <CategoryIcon category={daily.category} size={48} />
            <Link href={`/challenges/${daily.id}`} className="min-w-0 flex-1">
              <span className="block truncate font-extrabold">{t(daily.title)}</span>
              <span className="text-xs font-bold text-subtle">{t("Today only")} · +{daily.xpReward} XP</span>
            </Link>
            <ActionButton size="sm" variant="secondary" action={joinChallengeAction.bind(null, daily.id)} successTitle={t("Challenge accepted!")}>
              {t("Start")}
            </ActionButton>
          </div>
        </section>
      )}
    </div>
  );
}

/** Mon–Sun strip: days with a proof are joined into one flame-orange band. */
function WeekStrip({ weekStart, today, proofDays, locale }: { weekStart: string; today: string; proofDays: Set<string>; locale: string }) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const fmt = new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" });
  return (
    <div className="rounded-2xl border-2 border-line p-3">
      <div className="grid grid-cols-7 text-center text-[11px] font-extrabold uppercase text-subtle">
        {days.map((d) => (
          <span key={d}>{fmt.format(new Date(`${d}T12:00:00Z`)).replace(".", "").slice(0, 2)}</span>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-7">
        {days.map((d, i) => {
          const lit = proofDays.has(d);
          const prev = i > 0 && proofDays.has(days[i - 1]);
          const next = i < 6 && proofDays.has(days[i + 1]);
          const isToday = d === today;
          return (
            <span
              key={d}
              className={cn(
                "grid h-10 place-items-center text-sm font-black tabular-nums",
                lit && "bg-flame text-white",
                lit && !prev && "rounded-l-full",
                lit && !next && "rounded-r-full",
                !lit && d > today && "text-subtle/60",
                !lit && d <= today && "text-muted",
              )}
            >
              <span className={cn("grid h-8 w-8 place-items-center rounded-full", isToday && !lit && "ring-2 ring-flame text-flame")}>{Number(d.slice(8))}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
