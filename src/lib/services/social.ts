import "server-only";
import { getStore } from "@/lib/data";
import { addDays, dayKey, startOfMonth, startOfWeek } from "@/lib/engine/dates";
import { levelFromXp } from "@/lib/engine/levels";
import type { Challenge, Invite, Profile, Squad } from "@/lib/types";
import { AppError } from "./errors";
import { joinChallenge } from "./challenges";
import { joinSquad } from "./squads";

export type LeaderboardScope = "global" | "friends";
export type LeaderboardPeriod = "week" | "month" | "all";

export interface LeaderRow {
  rank: number;
  profile: Profile;
  xp: number;
  level: number;
  isMe: boolean;
  following: boolean;
  /** Places gained (+) or lost (−) compared with the ranking before today's XP. */
  delta: number;
  todayXp: number;
}

export async function leaderboard(userId: string, scope: LeaderboardScope, period: LeaderboardPeriod): Promise<LeaderRow[]> {
  const store = getStore();
  const today = dayKey();
  const following = (await store.listFollows({ followerId: userId })).map((f) => f.followingId);
  const userIds = scope === "friends" ? [userId, ...following] : undefined;
  const sinceDay = period === "week" ? startOfWeek(today) : period === "month" ? startOfMonth(today) : undefined;
  const [totals, todayEvents] = await Promise.all([store.xpTotals({ sinceDay, userIds, limit: 50 }), store.listXpEvents({ day: today })]);
  const profiles = await store.listProfiles(totals.map((t) => t.userId));
  const todayBy = new Map<string, number>();
  for (const e of todayEvents) todayBy.set(e.userId, (todayBy.get(e.userId) ?? 0) + e.amount);
  // Ranking as it stood before today's XP → movement arrows.
  const before = [...totals].map((t) => ({ id: t.userId, xp: t.xp - (todayBy.get(t.userId) ?? 0) })).sort((a, b) => b.xp - a.xp);
  const prevRank = new Map(before.map((b, i) => [b.id, i + 1]));
  return totals
    .map((t, i) => {
      const profile = profiles.find((p) => p.id === t.userId)!;
      return {
        rank: i + 1,
        profile,
        xp: period === "all" ? profile?.xp ?? t.xp : t.xp,
        level: levelFromXp(profile?.xp ?? 0).level,
        isMe: t.userId === userId,
        following: following.includes(t.userId),
        delta: (prevRank.get(t.userId) ?? i + 1) - (i + 1),
        todayXp: todayBy.get(t.userId) ?? 0,
      };
    })
    .filter((r) => r.profile);
}

export async function myRank(userId: string, period: LeaderboardPeriod) {
  const rows = await leaderboard(userId, "global", period);
  return rows.find((r) => r.isMe)?.rank ?? null;
}

export async function setFollow(userId: string, targetId: string, follow: boolean) {
  if (userId === targetId) throw new AppError("You can't follow yourself.");
  const store = getStore();
  if (!(await store.getProfile(targetId))) throw new AppError("User not found.");
  if (follow) await store.insertFollow({ followerId: userId, followingId: targetId });
  else await store.deleteFollow({ followerId: userId, followingId: targetId });
}

export async function friends(userId: string): Promise<Profile[]> {
  const store = getStore();
  const ids = (await store.listFollows({ followerId: userId })).map((f) => f.followingId);
  return store.listProfiles(ids);
}

export interface InviteView {
  invite: Invite;
  from: Profile | null;
  challenge: Challenge | null;
  squad: Squad | null;
}

export async function pendingInvites(userId: string): Promise<InviteView[]> {
  const store = getStore();
  const invites = await store.listInvites({ toUserId: userId, status: "pending" });
  const from = await store.listProfiles([...new Set(invites.map((i) => i.fromUserId))]);
  return Promise.all(
    invites.map(async (invite) => ({
      invite,
      from: from.find((p) => p.id === invite.fromUserId) ?? null,
      challenge: invite.kind === "challenge" ? await store.getChallenge(invite.targetId) : null,
      squad: invite.kind === "squad" ? await store.getSquad(invite.targetId) : null,
    })),
  );
}

export async function respondToInvite(userId: string, inviteId: string, accept: boolean) {
  const store = getStore();
  const inv = await store.getInvite(inviteId);
  if (!inv || inv.toUserId !== userId || inv.status !== "pending") throw new AppError("Invite not found.");
  if (!accept) return store.updateInvite(inv.id, { status: "declined" });
  if (inv.kind === "challenge") await joinChallenge(userId, inv.targetId);
  else await joinSquad(userId, { squadId: inv.targetId });
  return store.updateInvite(inv.id, { status: "accepted" });
}

export interface ActivityItem {
  id: string;
  profile: Profile;
  challenge: Challenge;
  at: string;
}

/** Recent approved check-ins by people you follow (last 3 days). */
export async function friendActivity(userId: string, limit = 6): Promise<ActivityItem[]> {
  const store = getStore();
  const following = (await store.listFollows({ followerId: userId })).map((f) => f.followingId);
  if (!following.length) return [];
  const since = addDays(dayKey(), -2);
  const lists = await Promise.all(following.slice(0, 30).map((id) => store.listCompletions({ userId: id, sinceDay: since, status: "approved" })));
  // One line per person+challenge: the latest proof is the news, not every repeat.
  const seen = new Set<string>();
  const items = lists
    .flat()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .filter((c) => {
      const k = `${c.userId}:${c.challengeId}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .slice(0, limit);
  const [profiles, chs] = await Promise.all([
    store.listProfiles([...new Set(items.map((i) => i.userId))]),
    store.listChallenges({ ids: [...new Set(items.map((i) => i.challengeId))] }),
  ]);
  return items
    .map((c) => ({ id: c.id, profile: profiles.find((p) => p.id === c.userId)!, challenge: chs.find((x) => x.id === c.challengeId)!, at: c.createdAt }))
    .filter((x) => x.profile && x.challenge && (x.challenge.visibility === "public" || x.challenge.isOfficial));
}
