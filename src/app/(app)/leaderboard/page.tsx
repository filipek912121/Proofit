import { getT } from "@/lib/i18n/server";
import { ArrowDown, ArrowUp, Crown, Minus, Swords, Trophy, UserCheck, UserPlus, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ActionButton } from "@/components/ui/action-button";
import { Avatar, avatarOf } from "@/components/ui/avatar";
import { LinkButton } from "@/components/ui/button";
import { ListGroup } from "@/components/ui/card";
import { cn } from "@/components/ui/cn";
import { EmptyState } from "@/components/ui/empty-state";
import { Segmented } from "@/components/ui/segmented";
import { followAction } from "@/lib/actions/social";
import { requireUser } from "@/lib/auth";
import { formatNumber } from "@/lib/i18n/core";
import { leaderboard, type LeaderboardPeriod, type LeaderboardScope, type LeaderRow } from "@/lib/services/social";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("Rankings") };
}

function Delta({ d }: { d: number }) {
  if (d > 0)
    return (
      <span className="inline-flex items-center text-[11px] font-bold text-green-300" aria-label={`+${d}`}>
        <ArrowUp className="h-3 w-3" aria-hidden />
        {d}
      </span>
    );
  if (d < 0)
    return (
      <span className="inline-flex items-center text-[11px] font-bold text-red-300" aria-label={`${d}`}>
        <ArrowDown className="h-3 w-3" aria-hidden />
        {Math.abs(d)}
      </span>
    );
  return <Minus className="h-3 w-3 text-subtle" aria-hidden />;
}

export default async function LeaderboardPage({ searchParams }: { searchParams: Promise<{ scope?: string; period?: string }> }) {
  const t = await getT();
  const me = await requireUser();
  const sp = await searchParams;
  const scope: LeaderboardScope = sp.scope === "friends" ? "friends" : "global";
  const period: LeaderboardPeriod = sp.period === "month" || sp.period === "all" ? sp.period : "week";
  const rows = await leaderboard(me.id, scope, period);
  const href = (s: LeaderboardScope, p: LeaderboardPeriod) => `/leaderboard?scope=${s}&period=${p}`;
  const leaderXp = Math.max(1, rows[0]?.xp ?? 1);
  const podium = rows.length >= 3 ? rows.slice(0, 3) : [];
  const rest = podium.length ? rows.slice(3) : rows;
  const mine = rows.find((r) => r.isMe);

  const Row = ({ r }: { r: LeaderRow }) => (
    <div className={cn("flex items-center gap-3 px-3 py-2.5 sm:px-4", r.isMe && "bg-violet/[0.09]", r.isMe && r.delta > 0 && "animate-rank-up")}>
      <div className="flex w-7 flex-col items-center gap-0.5">
        <span className="font-display text-sm font-bold tabular-nums text-subtle">{r.rank}</span>
        <Delta d={r.delta} />
      </div>
      <Link href={r.isMe ? "/profile" : `/u/${r.profile.username}`} className="tap flex min-w-0 flex-1 items-center gap-3">
        <Avatar {...avatarOf(r.profile)} size={38} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">{r.isMe ? t("You") : r.profile.displayName}</span>
          <span className="mt-1 flex items-center gap-2">
            <span className="shrink-0 text-[11px] text-subtle">{t("Lv {n}", { n: r.level })}</span>
            <span className="block h-1 flex-1 overflow-hidden rounded-full bg-tint/[0.07]" aria-hidden>
              <span className="block h-full origin-left rounded-full bg-violet animate-grow-x" style={{ width: `${Math.max(3, (r.xp / leaderXp) * 100)}%` }} />
            </span>
          </span>
        </span>
      </Link>
      <div className="w-16 text-right">
        <p className="font-display text-sm font-bold tabular-nums">{formatNumber(r.xp, t.locale)}</p>
        {r.todayXp > 0 && <p className="text-[11px] text-green-300">+{r.todayXp} {t("today")}</p>}
      </div>
      {!r.isMe && (
        <div className="flex shrink-0 gap-1">
          <LinkButton href={`/duels?opponent=${r.profile.id}`} size="icon" variant="ghost" className="h-9 w-9" aria-label={t("Challenge {name} to a duel", { name: r.profile.displayName })} title={t("Duel")}>
            <Swords className="h-4 w-4" />
          </LinkButton>
          <ActionButton
            size="icon"
            variant="ghost"
            className="h-9 w-9"
            action={followAction.bind(null, r.profile.id, !r.following)}
            aria-label={r.following ? t("Unfollow {name}", { name: r.profile.displayName }) : t("Follow {name}", { name: r.profile.displayName })}
            title={r.following ? t("Following — click to unfollow") : t("Follow")}
          >
            {r.following ? <UserCheck className="h-4 w-4 text-green-300" /> : <UserPlus className="h-4 w-4" />}
          </ActionButton>
        </div>
      )}
    </div>
  );

  return (
    <>
      <header className="mb-5 animate-rise">
        <h1 className="font-display text-[26px] font-bold tracking-tight sm:text-4xl">{t("Leaderboard")}</h1>
        <p className="mt-1 text-[14px] text-muted">{t("XP earned from verified check-ins, streaks, completions and wins.")}</p>
      </header>
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Segmented
          label={t("Scope")}
          active={scope}
          className="w-full sm:w-auto"
          items={[
            { key: "global", label: t("Global"), href: href("global", period) },
            { key: "friends", label: t("Friends"), href: href("friends", period) },
          ]}
        />
        <Segmented
          label={t("Period")}
          active={period}
          className="w-full sm:w-auto"
          items={[
            { key: "week", label: t("This week"), href: href(scope, "week") },
            { key: "month", label: t("This month"), href: href(scope, "month") },
            { key: "all", label: t("All time"), href: href(scope, "all") },
          ]}
        />
      </div>

      {rows.length <= 1 && scope === "friends" ? (
        <EmptyState icon={Users} title={t("Add friends to compete")} text={t("Follow people from the global leaderboard and they'll show up here.")} action={<LinkButton href={href("global", period)}>{t("Browse global")}</LinkButton>} />
      ) : (
        <>
          {podium.length === 3 && (
            <section className="mx-auto mb-6 grid max-w-lg grid-cols-3 items-end gap-2 sm:gap-4" aria-label={t("Top three")}>
              {[podium[1], podium[0], podium[2]].map((r, i) => {
                const place = r.rank;
                const h = place === 1 ? "h-32" : place === 2 ? "h-24" : "h-20";
                const tone = place === 1 ? "bg-gold/15 ring-gold/35" : place === 2 ? "bg-zinc-300/10 ring-zinc-300/25" : "bg-hard/10 ring-hard/25";
                const delay = place === 1 ? 260 : place === 2 ? 120 : 0;
                return (
                  <Link key={r.profile.id} href={r.isMe ? "/profile" : `/u/${r.profile.username}`} className="tap flex min-w-0 flex-col items-center gap-1.5" aria-label={`${place}. ${r.profile.displayName}, ${r.xp} XP`}>
                    <div className="relative animate-pop" style={{ animationDelay: `${delay + 250}ms` }}>
                      {place === 1 && <Crown className="absolute -top-6 left-1/2 h-6 w-6 -translate-x-1/2 animate-float text-gold" aria-hidden />}
                      <Avatar {...avatarOf(r.profile)} size={place === 1 ? 68 : 54} ring={r.isMe} />
                    </div>
                    <p className="max-w-full truncate text-center text-[13px] font-semibold">{r.isMe ? t("You") : r.profile.displayName.split(" ")[0]}</p>
                    <p className="font-display text-xs font-bold tabular-nums text-muted">{formatNumber(r.xp, t.locale)} XP</p>
                    <div className={cn("flex w-full origin-bottom items-start justify-center rounded-t-2xl pt-2 ring-1 animate-podium", h, tone)} style={{ animationDelay: `${delay}ms` }}>
                      <span className={cn("font-display text-2xl font-bold", place === 1 ? "text-gold" : place === 2 ? "text-zinc-300" : "text-orange-300")}>{place}</span>
                    </div>
                  </Link>
                );
              })}
            </section>
          )}
          {rest.length > 0 && (
            <ListGroup>
              {rest.map((r, i) => (
                <div key={r.profile.id} className="animate-rise" style={{ animationDelay: `${Math.min(i, 12) * 35}ms` }}>
                  <Row r={r} />
                </div>
              ))}
            </ListGroup>
          )}
          {mine && mine.rank > 3 && (
            <div className="sticky bottom-24 z-30 mt-4 lg:bottom-6">
              <div className="glass-strong raised flex items-center gap-3 rounded-2xl px-4 py-3">
                <Trophy className="h-5 w-5 text-gold" aria-hidden />
                <span className="flex-1 text-sm">
                  {t("Your position")}: <span className="font-display font-bold">#{mine.rank}</span>
                </span>
                <Delta d={mine.delta} />
                <span className="font-display text-sm font-bold tabular-nums">{formatNumber(mine.xp, t.locale)} XP</span>
              </div>
            </div>
          )}
          {!mine && (
            <p className="mt-4 flex items-center gap-2 text-sm text-muted">
              <Trophy className="h-4 w-4" aria-hidden />{" "}
              {t(period === "week" ? "Earn XP this week to enter the rankings." : period === "month" ? "Earn XP this month to enter the rankings." : "Earn XP to enter the rankings.")}
            </p>
          )}
        </>
      )}
    </>
  );
}
