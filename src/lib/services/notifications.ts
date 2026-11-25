import "server-only";
import { getStore } from "@/lib/data";
import { dayKey } from "@/lib/engine/dates";
import { PROXI_ITEMS, stageInfo } from "@/lib/proxi/config";
import { activeChallenges, dailyChallenge, myProofs, reviewQueue } from "./challenges";
import { listDuels } from "./duels";
import { getProxiLook } from "./proxi";
import { pendingInvites } from "./social";

export type NotificationKind = "proxi" | "reminder" | "review" | "proof" | "achievement";

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  /** English source string + params (translated in the UI). */
  title: string;
  params?: Record<string, string | number>;
  href: string;
  at: string | null;
  unread: boolean;
}

/**
 * Everything worth telling the user, newest first. PROXI reminders are capped
 * at one per day and can be switched off in PROXI settings.
 */
export async function buildNotifications(userId: string) {
  const store = getStore();
  const [proxi, proxiProfile, unlocks, invites, duels, reviews, proofs, achievements, catalogue] = await Promise.all([
    getProxiLook(userId),
    store.getProxiProfile(userId),
    store.listProxiUnlocks(userId),
    pendingInvites(userId),
    listDuels(userId),
    reviewQueue(userId),
    myProofs(userId),
    store.listUserAchievements(userId),
    store.listAchievements(),
  ]);
  const items: AppNotification[] = [];
  const now = new Date().toISOString();
  const threeDaysAgo = Date.now() - 3 * 86_400_000;

  if (proxi.evolved) items.push({ id: "proxi-evolved", kind: "proxi", title: "PROXI evolved to {stage}!", params: { stage: stageInfo(proxi.stage).name }, href: "/proxi", at: now, unread: true });
  for (const u of unlocks.filter((u) => !u.seen)) {
    const item = PROXI_ITEMS.find((i) => i.id === u.itemId);
    if (item) items.push({ id: `unlock-${u.itemId}`, kind: "proxi", title: "New PROXI look unlocked: {item}", params: { item: item.name }, href: "/proxi", at: u.unlockedAt, unread: true });
  }

  if (proxiProfile?.reminders ?? true) {
    const active = await activeChallenges(userId);
    const open = active.filter((a) => !a.checkedInToday);
    if (open.length) items.push({ id: `reminder-${dayKey()}`, kind: "reminder", title: "Your challenge is waiting: {name}", params: { name: open[0].challenge.title }, href: `/challenges/${open[0].challenge.id}#checkin`, at: null, unread: false });
    else if (!active.length) {
      const daily = await dailyChallenge(userId);
      if (daily) items.push({ id: `suggest-${dayKey()}`, kind: "reminder", title: "PROXI has a new challenge for you: {name}", params: { name: daily.title }, href: `/challenges/${daily.id}`, at: null, unread: false });
    }
  }

  if (reviews.length) items.push({ id: "reviews", kind: "review", title: "{n} proofs are waiting for your review", params: { n: reviews.length }, href: "/review", at: null, unread: true });

  for (const p of proofs.filter((x) => x.proof.status !== "pending" && x.proof.reviewedAt && new Date(x.proof.reviewedAt).getTime() > threeDaysAgo))
    items.push({
      id: `proof-${p.proof.id}`,
      kind: "proof",
      title: p.proof.status === "approved" ? "Your proof was approved: {name}" : "Your proof was rejected: {name}",
      params: { name: p.challenge?.title ?? "" },
      href: "/review",
      at: p.proof.reviewedAt,
      unread: false,
    });

  for (const a of achievements.filter((x) => new Date(x.unlockedAt).getTime() > threeDaysAgo)) {
    const info = catalogue.find((c) => c.id === a.achievementId);
    if (info) items.push({ id: `ach-${a.achievementId}`, kind: "achievement", title: "Achievement unlocked: {name}", params: { name: info.name }, href: "/achievements", at: a.unlockedAt, unread: false });
  }

  items.sort((a, b) => Number(b.unread) - Number(a.unread) || (b.at ?? "").localeCompare(a.at ?? ""));
  const duelInvites = duels.filter((d) => d.duel.status === "pending" && !d.iAmChallenger);
  return { items, invites, duelInvites, unreadCount: items.filter((i) => i.unread && i.kind === "proxi").length + invites.length + duelInvites.length };
}
