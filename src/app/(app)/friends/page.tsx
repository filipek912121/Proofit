import { getT } from "@/lib/i18n/server";
import { ChevronRight, Swords, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { StreakFlame } from "@/components/brand/streak-flame";
import { ProxiBuddy } from "@/components/proxi/proxi-buddy";
import { InvitesPanel } from "@/components/social/invites-panel";
import { ReferralCard } from "@/components/social/referral-card";
import { Avatar, avatarOf } from "@/components/ui/avatar";
import { LinkButton } from "@/components/ui/button";
import { SectionTitle } from "@/components/ui/card";
import { cn } from "@/components/ui/cn";
import { requireUser } from "@/lib/auth";
import { dayKey } from "@/lib/engine/dates";
import { liveStreak } from "@/lib/engine/xp";
import { intlLocale } from "@/lib/i18n/core";
import { listDuels } from "@/lib/services/duels";
import { getProxiLook } from "@/lib/services/proxi";
import { friendActivity, friends, leaderboard, pendingInvites } from "@/lib/services/social";
import { listSquadsFor } from "@/lib/services/squads";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("Friends") };
}

function timeAgo(iso: string, locale: string) {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  if (mins < 60) return rtf.format(-Math.max(1, mins), "minute");
  if (mins < 60 * 24) return rtf.format(-Math.round(mins / 60), "hour");
  return rtf.format(-Math.round(mins / 1440), "day");
}

/**
 * Friends: the social reasons to come back — who's on fire, where you stand this
 * week, live duels and your squads. No feed to scroll; everything leads to doing.
 */
export default async function FriendsPage() {
  const t = await getT();
  const me = await requireUser();
  const today = dayKey();
  const [crew, board, duels, squads, activity, proxi, invites] = await Promise.all([
    friends(me.id),
    leaderboard(me.id, "friends", "week"),
    listDuels(me.id),
    listSquadsFor(me.id),
    friendActivity(me.id, 5),
    getProxiLook(me.id),
    pendingInvites(me.id),
  ]);
  const locale = intlLocale(t.locale);
  const streaks = crew.map((p) => ({ p, s: liveStreak(p, today) })).sort((a, b) => b.s - a.s);
  const meRow = board.find((r) => r.isMe);
  const above = meRow && meRow.rank > 1 ? board.find((r) => r.rank === meRow.rank - 1) : undefined;
  const gap = above && meRow ? above.xp - meRow.xp + 1 : 0;
  const live = duels.filter((d) => d.duel.status === "active");
  const waiting = duels.filter((d) => d.duel.status === "pending" && !d.iAmChallenger);

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between gap-3 animate-rise">
        <h1 className="font-display text-[28px] font-black leading-tight">{t("Friends")}</h1>
        <LinkButton href="/leaderboard" variant="secondary" size="sm">
          {t("League")}
        </LinkButton>
      </header>

      {crew.length === 0 ? (
        <section className="flex flex-col items-center gap-4 rounded-3xl border-2 border-line p-6 text-center">
          <ProxiBuddy stage={proxi.stage} look={proxi.look} mood="motivated" line="Challenges hit different with friends. Bring your crew!" size={110} layout="stack" />
          <p className="text-sm text-muted">{t("Follow people from the league or invite friends with your link.")}</p>
          <LinkButton href="/leaderboard?scope=global">{t("Find people")}</LinkButton>
        </section>
      ) : (
        <section aria-label={t("Friend streaks")}>
          <SectionTitle title={t("Friend streaks")} />
          <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-1">
            {streaks.map(({ p, s }, i) => (
              <Link key={p.id} href={`/u/${p.username}`} className="tap flex w-16 shrink-0 flex-col items-center gap-1 animate-rise" style={{ animationDelay: `${i * 40}ms` }}>
                <Avatar {...avatarOf(p)} size={56} />
                <span className="w-full truncate text-center text-xs font-bold">{p.displayName.split(" ")[0]}</span>
                <span className={cn("inline-flex items-center gap-0.5 text-xs font-black tabular-nums", s > 0 ? "text-flame" : "text-subtle")}>
                  <StreakFlame size={14} lit={s > 0} /> {s}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Weekly league: where am I and what does it take to climb */}
      <section aria-label={t("This week")}>
        <SectionTitle title={t("This week")} action={<Link href="/leaderboard">{t("See all")}</Link>} />
        <div className="overflow-hidden rounded-2xl border-2 border-line">
          {meRow && (
            <p className="border-b-2 border-line bg-ink-3 px-4 py-2.5 text-sm font-bold">
              {meRow.rank === 1
                ? t("You're #1 among friends this week. Defend it!")
                : t("You're #{rank}. {xp} XP to pass {name}.", { rank: meRow.rank, xp: gap, name: above!.profile.displayName.split(" ")[0] })}
            </p>
          )}
          <ol>
            {board.slice(0, 5).map((r) => (
              <li key={r.profile.id}>
                <Link href={r.isMe ? "/profile" : `/u/${r.profile.username}`} className={cn("flex items-center gap-3 px-4 py-2.5", r.isMe ? "bg-green/12" : "hover:bg-ink-3")}>
                  <span className={cn("w-5 text-center font-black tabular-nums", r.rank <= 3 ? "text-gold-dark" : "text-subtle")}>{r.rank}</span>
                  <Avatar {...avatarOf(r.profile)} size={36} />
                  <span className={cn("min-w-0 flex-1 truncate font-extrabold", r.isMe && "text-green-dark")}>{r.isMe ? t("You") : r.profile.displayName}</span>
                  <span className="text-sm font-bold tabular-nums text-muted">{r.xp} XP</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <InvitesPanel invites={invites} duels={waiting} />

      {/* Duels */}
      <section aria-label={t("Duels")}>
        <SectionTitle title={t("Duels")} action={<Link href="/duels">{t("All")}</Link>} />
        {live.length ? (
          <ul className="space-y-2">
            {live.slice(0, 4).map((d) => {
              const ahead = d.myScore - d.theirScore;
              return (
                <li key={d.duel.id}>
                  <Link href={`/duels/${d.duel.id}`} className="tile flex items-center gap-3 rounded-2xl p-3">
                    <Avatar {...avatarOf(d.opponent)} size={40} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-extrabold">{t("vs {name}", { name: d.opponent.displayName })}</span>
                      <span className="block truncate text-xs font-semibold text-subtle">
                        {d.duel.status === "pending"
                          ? t("Waiting for your answer")
                          : ahead > 0
                            ? t("You're ahead by {n}", { n: ahead })
                            : ahead < 0
                              ? t("One more PROOF to close the gap")
                              : t("Dead even")}
                      </span>
                    </span>
                    <span className="font-black tabular-nums">
                      {d.myScore}:{d.theirScore}
                    </span>
                    <ChevronRight className="h-4 w-4 text-subtle" aria-hidden />
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <Link href="/duels" className="tile flex items-center gap-3 rounded-2xl p-4">
            <Swords className="h-7 w-7 text-red" aria-hidden />
            <span className="flex-1 font-extrabold">{t("Challenge a friend to a duel")}</span>
            <ChevronRight className="h-4 w-4 text-subtle" aria-hidden />
          </Link>
        )}
      </section>

      {/* Squads */}
      <section aria-label={t("Squads")}>
        <SectionTitle title={t("Squads")} action={<Link href="/squads">{t("All")}</Link>} />
        {squads.mine.length ? (
          <ul className="space-y-2">
            {squads.mine.slice(0, 3).map((s) => (
              <li key={s.id}>
                <Link href={`/squads/${s.id}`} className="tile flex items-center gap-3 rounded-2xl p-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-electric font-black text-white">{s.name[0]}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-extrabold">{s.name}</span>
                    <span className="block text-xs font-semibold text-subtle">{t.p(squads.counts[s.id] ?? 0, "{n} member", "{n} members")}</span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-subtle" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <Link href="/squads" className="tile flex items-center gap-3 rounded-2xl p-4">
            <Users className="h-7 w-7 text-electric" aria-hidden />
            <span className="flex-1 font-extrabold">{t("Start a squad with your crew")}</span>
            <ChevronRight className="h-4 w-4 text-subtle" aria-hidden />
          </Link>
        )}
      </section>

      {activity.length > 0 && (
        <section aria-label={t("Recently")}>
          <SectionTitle title={t("Recently")} />
          <ul className="divide-y-2 divide-line rounded-2xl border-2 border-line">
            {activity.map((a) => (
              <li key={a.id} className="flex items-center gap-3 px-4 py-3">
                <Avatar {...avatarOf(a.profile)} size={34} />
                <p className="min-w-0 flex-1 text-sm">
                  <span className="font-extrabold">{a.profile.displayName.split(" ")[0]}</span>{" "}
                  <span className="text-muted">{t("showed proof for")}</span>{" "}
                  <Link href={`/challenges/${a.challenge.id}`} className="font-bold text-violet-2 hover:underline">
                    {t(a.challenge.title)}
                  </Link>
                </p>
                <span className="shrink-0 text-xs font-semibold text-subtle">{timeAgo(a.at, locale)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <ReferralCard userId={me.id} username={me.username} compact />
    </div>
  );
}
