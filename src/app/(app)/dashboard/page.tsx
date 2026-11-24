import { getT } from "@/lib/i18n/server";
import { ArrowRight, Camera, ChevronRight, CircleCheck, Compass, Flame, Hourglass, Swords, Trophy, Users, Zap } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { MascotSays } from "@/components/mascot/mascot";
import { InvitesPanel } from "@/components/social/invites-panel";
import { ReferralCard } from "@/components/social/referral-card";
import { ActionButton } from "@/components/ui/action-button";
import { Avatar, avatarOf } from "@/components/ui/avatar";
import { LinkButton } from "@/components/ui/button";
import { Card, ListGroup, SectionTitle } from "@/components/ui/card";
import { cn } from "@/components/ui/cn";
import { CountUp } from "@/components/ui/count-up";
import { ProgressBar, ProgressRing } from "@/components/ui/progress";
import { joinChallengeAction } from "@/lib/actions/challenges";
import { requireUser } from "@/lib/auth";
import { XP_RULES } from "@/lib/config/game";
import { DIFFICULTY_META } from "@/lib/config/taxonomy";
import { appTimeZone, dayKey, diffDays } from "@/lib/engine/dates";
import { levelFromXp, levelTitle } from "@/lib/engine/levels";
import { liveStreak } from "@/lib/engine/xp";
import { intlLocale } from "@/lib/i18n/core";
import { mascotForEvent, type MascotEvent } from "@/lib/mascot";
import { activeChallenges, dailyChallenge } from "@/lib/services/challenges";
import { listDuels } from "@/lib/services/duels";
import { xpEarnedOn } from "@/lib/services/progress";
import { friendActivity, leaderboard, pendingInvites } from "@/lib/services/social";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("Dashboard") };
}

function greeting() {
  const h = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone: appTimeZone() }).format(new Date()));
  return h < 5 ? "Still up" : h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

function timeAgo(iso: string, locale: string) {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  if (mins < 60) return rtf.format(-Math.max(1, mins), "minute");
  if (mins < 60 * 24) return rtf.format(-Math.round(mins / 60), "hour");
  return rtf.format(-Math.round(mins / 1440), "day");
}

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const t = await getT();
  const me = await requireUser();
  const today = dayKey();
  const [active, daily, duels, invites, friendsBoard, activity, earnedToday] = await Promise.all([
    activeChallenges(me.id),
    dailyChallenge(me.id),
    listDuels(me.id),
    pendingInvites(me.id),
    leaderboard(me.id, "friends", "week"),
    friendActivity(me.id),
    xpEarnedOn(me.id, today),
  ]);
  const { welcome } = await searchParams;
  const locale = intlLocale(t.locale);
  const lv = levelFromXp(me.xp);
  const streak = liveStreak(me, today);
  const doneToday = active.filter((a) => a.checkedInToday).length;
  const pending = active.filter((a) => !a.checkedInToday);
  const next = pending[0];
  const liveDuels = duels.filter((d) => d.duel.status === "active");
  const duelInvites = duels.filter((d) => d.duel.status === "pending" && !d.iAmChallenger);
  const firstName = me.displayName.split(" ")[0];

  // The mascot only speaks when it adds something: a streak at risk, a comeback, or a finished day.
  const inactiveDays = me.lastActiveDay ? diffDays(me.lastActiveDay, today) : null;
  const event: MascotEvent | null = !active.length
    ? inactiveDays && inactiveDays > 2
      ? { kind: "inactive", days: inactiveDays }
      : { kind: "no-challenges" }
    : pending.length === 0
      ? { kind: "all-done", streak }
      : streak >= 2 && !doneToday
        ? { kind: "pending-today", left: pending.length, streak }
        : null;
  const mascot = event ? mascotForEvent(event) : null;

  // Friends board: top 3 + me (if I'm not in the top 3).
  const meRow = friendsBoard.find((r) => r.isMe);
  const board = friendsBoard.slice(0, 3);
  if (meRow && !board.includes(meRow)) board.push(meRow);

  return (
    <div className="space-y-6">
      {welcome && (
        <MascotSays
          mood="celebrate"
          title={t("Welcome to PROOFIT, {name}!", { name: firstName })}
          text={t("Join your first challenge below — your first check-in unlocks an achievement.")}
          className="animate-pop"
        />
      )}

      {/* Greeting */}
      <header className="flex items-center gap-3 animate-rise">
        <Link href="/profile" className="tap shrink-0 rounded-full" aria-label={t("Profile")}>
          <Avatar {...avatarOf(me)} size={46} />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] text-subtle">
            {t(greeting())}, {firstName}
          </p>
          <p className="truncate font-display text-lg font-bold leading-tight">
            {t("Level {n}", { n: lv.level })} · {t(levelTitle(lv.level))}
          </p>
        </div>
        <Link
          href="/profile"
          className={cn("tap inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold ring-1", streak ? "bg-hard/12 text-orange-300 ring-hard/30" : "bg-tint/5 text-subtle ring-line")}
          aria-label={t("day streak · best {n}", { n: me.longestStreak })}
        >
          <Flame className={cn("h-4 w-4", streak > 0 && "animate-flame")} aria-hidden />
          <CountUp value={streak} />
        </Link>
      </header>

      {/* Today — the hero */}
      <Card glow className="p-5 animate-rise [animation-delay:60ms]">
        <div className="flex items-center gap-4">
          <ProgressRing value={active.length ? doneToday / active.length : 0} size={84} stroke={9} color={pending.length === 0 && active.length ? "var(--color-easy)" : undefined} label={t("{done}/{total} done", { done: doneToday, total: active.length })}>
            <div className="font-display text-xl font-bold leading-none tabular-nums">
              {doneToday}
              <span className="text-sm text-subtle">/{active.length}</span>
            </div>
          </ProgressRing>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-subtle">{t("Today")}</p>
            <h1 className="font-display text-xl font-bold leading-snug">
              {!active.length
                ? t("No active challenges")
                : pending.length
                  ? t.p(pending.length, "{n} check-in left", "{n} check-ins left")
                  : t("All done today.")}
            </h1>
            <p className="mt-1 flex items-center gap-1 text-[13px] text-muted">
              <Zap className="h-3.5 w-3.5 text-gold" aria-hidden />
              {t("{n}/{cap} XP today", { n: earnedToday, cap: XP_RULES.dailyXpCap })}
            </p>
          </div>
        </div>
        {next ? (
          <LinkButton href={`/challenges/${next.challenge.id}#checkin`} variant="brand" size="lg" className="mt-5 w-full justify-between">
            <span className="min-w-0 truncate text-left">
              <span className="block text-[11px] font-medium uppercase tracking-wider opacity-80">{t("Next up")}</span>
              <span className="block truncate">{t(next.challenge.title)}</span>
            </span>
            <ArrowRight className="h-5 w-5 shrink-0" aria-hidden />
          </LinkButton>
        ) : !active.length ? (
          <LinkButton href="/explore" variant="brand" size="lg" className="mt-5 w-full" icon={<Compass className="h-5 w-5" />}>
            {t("Find a challenge")}
          </LinkButton>
        ) : null}
      </Card>

      {mascot && <MascotSays mood={mascot.mood} title={t(mascot.title, mascot.params)} text={mascot.text ? t(mascot.text, mascot.params) : undefined} className="animate-rise [animation-delay:120ms]" />}

      {/* Today's challenges */}
      {active.length > 0 && (
        <section aria-label={t("Active challenges")} className="animate-rise [animation-delay:120ms]">
          <SectionTitle title={t("Active challenges")} action={<Link href="/explore">{t("Find more")}</Link>} />
          <ListGroup>
            {active.map((a) => {
              const m = DIFFICULTY_META[a.challenge.difficulty];
              const done = a.todayStatus === "approved";
              return (
                <Link key={a.participation.id} href={`/challenges/${a.challenge.id}${a.checkedInToday ? "" : "#checkin"}`} className="tap flex items-center gap-3 px-4 py-3.5 hover:bg-tint/[0.03]">
                  <span
                    className={cn(
                      "grid h-9 w-9 shrink-0 place-items-center rounded-full",
                      done ? "bg-easy text-white" : a.todayStatus === "pending" ? "bg-electric/15 text-blue-300" : "ring-2 ring-line-strong",
                    )}
                    aria-hidden
                  >
                    {done ? <CircleCheck className="h-5 w-5 animate-check" /> : a.todayStatus === "pending" ? <Hourglass className="h-4 w-4" /> : a.challenge.requiresProof ? <Camera className="h-4 w-4 text-subtle" /> : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={cn("block truncate text-[15px] font-semibold", done && "text-muted")}>{t(a.challenge.title)}</span>
                    <span className="mt-1 flex items-center gap-2">
                      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", m.dot)} aria-hidden />
                      <ProgressBar value={a.participation.checkins / a.challenge.durationDays} tone={a.challenge.difficulty} className="h-1 max-w-32" label={t(a.challenge.title)} />
                      <span className="shrink-0 text-xs tabular-nums text-subtle">
                        {a.participation.checkins}/{a.challenge.durationDays}
                      </span>
                    </span>
                  </span>
                  <span className="shrink-0 text-xs font-semibold">
                    {done ? (
                      <span className="text-green-300">+{a.challenge.xpReward} XP</span>
                    ) : a.todayStatus === "pending" ? (
                      <span className="text-blue-300">{t("Pending")}</span>
                    ) : (
                      <span className="rounded-full bg-violet px-3 py-1.5 text-white">{t("Check in")}</span>
                    )}
                  </span>
                </Link>
              );
            })}
          </ListGroup>
        </section>
      )}

      {/* Level progress */}
      <Link href="/achievements" className="tap surface block rounded-2xl px-4 py-3.5 animate-rise [animation-delay:160ms]">
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <span className="text-sm font-semibold">{t("Level {n}", { n: lv.level })}</span>
          <span className="text-xs text-subtle">
            <CountUp value={me.xp} locale={locale} /> XP · {t("{xp} XP to level {n}", { xp: lv.xpToNext, n: lv.level + 1 })}
          </span>
        </div>
        <ProgressBar value={lv.progress} className="h-2" label={t("Level progress")} />
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Friends ranking */}
        <section aria-label={t("Friends")}>
          <SectionTitle title={t("Friends this week")} action={<Link href="/leaderboard?scope=friends">{t("Rankings")}</Link>} />
          {board.length > 1 ? (
            <ListGroup>
              {board.map((r) => (
                <Link key={r.profile.id} href={r.isMe ? "/profile" : `/u/${r.profile.username}`} className={cn("tap flex items-center gap-3 px-4 py-2.5", r.isMe && "bg-violet/[0.08]")}>
                  <span className={cn("w-5 text-center font-display text-sm font-bold tabular-nums", r.rank === 1 ? "text-gold" : "text-subtle")}>{r.rank}</span>
                  <Avatar {...avatarOf(r.profile)} size={32} />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{r.isMe ? t("You") : r.profile.displayName}</span>
                  <span className="font-display text-sm font-bold tabular-nums">{r.xp} XP</span>
                </Link>
              ))}
            </ListGroup>
          ) : (
            <Link href="/leaderboard" className="tap surface flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm text-muted">
              <Users className="h-5 w-5 text-violet-2" aria-hidden />
              <span className="flex-1">{t("Follow people from the global leaderboard and they'll show up here.")}</span>
              <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
          )}
        </section>

        {/* Shortcuts */}
        <section aria-label={t("Quick actions")}>
          <SectionTitle title={t("Compete")} />
          <div className="grid grid-cols-3 gap-2">
            {[
              { href: "/duels", label: t("Duels"), I: Swords, badge: liveDuels.length ? t("{n} live", { n: liveDuels.length }) : null, tone: "text-red-300 bg-extreme/10" },
              { href: "/squads", label: t("Squads"), I: Users, badge: null, tone: "text-blue-300 bg-electric/10" },
              { href: "/explore", label: t("Explore"), I: Compass, badge: null, tone: "text-green-300 bg-easy/10" },
            ].map(({ href, label, I, badge, tone }) => (
              <Link key={href} href={href} className="tap surface relative flex flex-col items-center gap-2 rounded-2xl py-4 text-[13px] font-semibold">
                <span className={cn("grid h-10 w-10 place-items-center rounded-xl", tone)}>
                  <I className="h-5 w-5" aria-hidden />
                </span>
                {label}
                {badge && <span className="absolute right-2 top-2 rounded-full bg-extreme px-1.5 py-0.5 text-[10px] font-bold text-white">{badge}</span>}
              </Link>
            ))}
          </div>
          {daily && (
            <div className="surface mt-3 flex items-center gap-3 rounded-2xl px-4 py-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gold/12 text-gold">
                <Trophy className="h-[18px] w-[18px]" aria-hidden />
              </span>
              <Link href={`/challenges/${daily.id}`} className="min-w-0 flex-1">
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-subtle">{t("Daily challenge")}</span>
                <span className="block truncate text-sm font-semibold">{t(daily.title)}</span>
              </Link>
              {daily.joined ? (
                <LinkButton href={`/challenges/${daily.id}#checkin`} size="sm" variant="secondary">
                  {t("Check in")}
                </LinkButton>
              ) : (
                <ActionButton size="sm" variant="secondary" action={joinChallengeAction.bind(null, daily.id)} successTitle={t("Joined today's challenge!")}>
                  +{daily.xpReward} XP
                </ActionButton>
              )}
            </div>
          )}
        </section>
      </div>

      <InvitesPanel invites={invites} duels={duelInvites} />

      {/* Friend activity */}
      {activity.length > 0 && (
        <section aria-label={t("Friend activity")}>
          <SectionTitle title={t("Friend activity")} />
          <ListGroup>
            {activity.map((a) => (
              <Link key={a.id} href={`/u/${a.profile.username}`} className="tap flex items-center gap-3 px-4 py-3">
                <Avatar {...avatarOf(a.profile)} size={34} />
                <span className="min-w-0 flex-1 text-sm">
                  <span className="font-semibold">{a.profile.displayName.split(" ")[0]}</span> <span className="text-muted">{t("checked in to")}</span>{" "}
                  <span className="font-medium">{t(a.challenge.title)}</span>
                </span>
                <span className="shrink-0 text-xs text-subtle">{timeAgo(a.at, locale)}</span>
              </Link>
            ))}
          </ListGroup>
        </section>
      )}

      <ReferralCard userId={me.id} username={me.username} compact />
    </div>
  );
}
