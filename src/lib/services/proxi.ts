import "server-only";
import { getStore } from "@/lib/data";
import { addDays, dayKey, diffDays } from "@/lib/engine/dates";
import { levelFromXp } from "@/lib/engine/levels";
import { DEFAULT_LOOK, meetsRule, PROXI_ITEMS, sanitizeLook, stageForLevel, STAGES, type ProxiItem, type ProxiLook, type ProxiSlot, type ProxiStage, type ProxiStats } from "@/lib/proxi/config";
import type { ProxiMood } from "@/lib/proxi/messages";
import type { ProxiProfile } from "@/lib/types";
import { getEntitlements } from "./entitlements";
import { AppError } from "./errors";

async function loadProfile(userId: string): Promise<ProxiProfile> {
  const store = getStore();
  const existing = await store.getProxiProfile(userId);
  if (existing) return existing;
  return { userId, look: { ...DEFAULT_LOOK }, seenStage: 1, reminders: true, updatedAt: new Date().toISOString() };
}

export async function proxiStats(userId: string): Promise<ProxiStats & { xp: number; createdAt: string; lastActiveDay: string | null }> {
  const store = getStore();
  const [profile, completions, participations, achievements, ent] = await Promise.all([
    store.getProfile(userId),
    store.listCompletions({ userId, status: "approved" }),
    store.listParticipations({ userId }),
    store.listUserAchievements(userId),
    getEntitlements(userId),
  ]);
  if (!profile) throw new AppError("User not found.");
  return {
    level: levelFromXp(profile.xp).level,
    xp: profile.xp,
    checkins: completions.length,
    challengesCompleted: participations.filter((p) => p.status === "completed").length,
    achievements: achievements.map((a) => a.achievementId),
    isPremium: ent.isPremium,
    createdAt: profile.createdAt,
    lastActiveDay: profile.lastActiveDay,
  };
}

/**
 * Persists every wardrobe item the user now qualifies for and returns the
 * newly unlocked ones. Idempotent — safe to call after any progress event.
 */
export async function syncProxiUnlocks(userId: string, stats?: ProxiStats): Promise<ProxiItem[]> {
  const store = getStore();
  const s = stats ?? (await proxiStats(userId));
  const have = new Set((await store.listProxiUnlocks(userId)).map((u) => u.itemId));
  const fresh = PROXI_ITEMS.filter((i) => i.rule.type !== "default" && !have.has(i.id) && meetsRule(i.rule, s));
  const now = new Date().toISOString();
  for (const item of fresh) await store.insertProxiUnlock({ userId, itemId: item.id, unlockedAt: now, seen: false });
  return fresh;
}

/** PROXI's mood is derived from real activity. It never scolds — breaks lead to a warm welcome. */
async function computeMood(userId: string, xp: number, lastActiveDay: string | null): Promise<ProxiMood> {
  const store = getStore();
  const today = dayKey();
  const [achievements, todayEvents, completions] = await Promise.all([
    store.listUserAchievements(userId),
    store.listXpEvents({ userId, day: today }),
    store.listCompletions({ userId, sinceDay: addDays(today, -30) }),
  ]);
  const dayAgo = Date.now() - 86_400_000;
  if (achievements.some((a) => new Date(a.unlockedAt).getTime() > dayAgo)) return "excited";
  const todayXp = todayEvents.reduce((s, e) => s + e.amount, 0);
  if (todayXp > 0 && levelFromXp(xp - todayXp).level < levelFromXp(xp).level) return "proud";
  if (todayEvents.some((e) => e.reason === "challenge_complete")) return "proud";
  const days = [...new Set(completions.filter((c) => c.status !== "rejected").map((c) => c.day))].sort();
  if (days.includes(today)) {
    const previous = days.filter((d) => d < today).pop();
    if (previous && diffDays(previous, today) >= 3) return "motivated";
    return "happy";
  }
  if (!lastActiveDay) return "neutral";
  const gap = diffDays(lastActiveDay, today);
  if (gap <= 1) return "happy";
  if (gap >= 3) return "sleepy";
  return "neutral";
}

export interface ProxiState {
  stage: ProxiStage;
  level: number;
  xp: number;
  levelProgress: ReturnType<typeof levelFromXp>;
  nextStage: (typeof STAGES)[number] | null;
  look: ProxiLook;
  unlocked: string[];
  newUnlocks: string[];
  mood: ProxiMood;
  /** True when PROXI evolved since the user last saw it — show the evolution celebration. */
  evolved: boolean;
  reminders: boolean;
  stats: ProxiStats & { daysTogether: number };
}

export async function getProxi(userId: string): Promise<ProxiState> {
  const store = getStore();
  const s = await proxiStats(userId);
  await syncProxiUnlocks(userId, s);
  const [profile, unlocks, mood] = await Promise.all([loadProfile(userId), store.listProxiUnlocks(userId), computeMood(userId, s.xp, s.lastActiveDay)]);
  const unlocked = new Set([...PROXI_ITEMS.filter((i) => i.rule.type === "default").map((i) => i.id), ...unlocks.map((u) => u.itemId)]);
  // Only show equipped items the user still owns (e.g. Premium items after a lapsed subscription).
  const stored = sanitizeLook(profile.look);
  const look = { ...stored };
  for (const slot of Object.keys(look) as ProxiSlot[]) {
    const item = PROXI_ITEMS.find((i) => i.id === look[slot]);
    if (!unlocked.has(look[slot]) || (item?.rule.type === "premium" && !s.isPremium)) look[slot] = DEFAULT_LOOK[slot];
  }
  const stage = stageForLevel(s.level);
  return {
    stage,
    level: s.level,
    xp: s.xp,
    levelProgress: levelFromXp(s.xp),
    nextStage: STAGES.find((x) => x.stage === stage + 1) ?? null,
    look,
    unlocked: [...unlocked],
    newUnlocks: unlocks.filter((u) => !u.seen).map((u) => u.itemId),
    mood,
    evolved: stage > profile.seenStage,
    reminders: profile.reminders,
    stats: { ...s, daysTogether: Math.max(1, diffDays(dayKey(new Date(s.createdAt)), dayKey()) + 1) },
  };
}

/** Lightweight read for navigation and widgets (no unlock sync, no mood). */
export async function getProxiLook(userId: string): Promise<{ look: ProxiLook; stage: ProxiStage; unseen: number; evolved: boolean }> {
  const store = getStore();
  const [user, profile, unlocks] = await Promise.all([store.getProfile(userId), loadProfile(userId), store.listProxiUnlocks(userId)]);
  const owned = new Set([...PROXI_ITEMS.filter((i) => i.rule.type === "default").map((i) => i.id), ...unlocks.map((u) => u.itemId)]);
  const look = sanitizeLook(profile.look);
  for (const slot of Object.keys(look) as ProxiSlot[]) if (!owned.has(look[slot])) look[slot] = DEFAULT_LOOK[slot];
  const stage = stageForLevel(levelFromXp(user?.xp ?? 0).level);
  return { look, stage, unseen: unlocks.filter((u) => !u.seen).length, evolved: stage > profile.seenStage };
}

export async function equipProxiItem(userId: string, itemId: string) {
  const item = PROXI_ITEMS.find((i) => i.id === itemId);
  if (!item) throw new AppError("Invalid request.");
  const state = await getProxi(userId);
  if (!state.unlocked.includes(item.id)) throw new AppError("Keep progressing to unlock this item.");
  if (item.rule.type === "premium" && !state.stats.isPremium) throw new AppError("This item is part of PROXI Premium styles.");
  const profile = await loadProfile(userId);
  await getStore().upsertProxiProfile({ ...profile, look: { ...sanitizeLook(profile.look), [item.slot]: item.id }, updatedAt: new Date().toISOString() });
}

export async function setProxiReminders(userId: string, on: boolean) {
  const profile = await loadProfile(userId);
  await getStore().upsertProxiProfile({ ...profile, reminders: on, updatedAt: new Date().toISOString() });
}

export async function markProxiSeen(userId: string) {
  const store = getStore();
  const [profile, s] = await Promise.all([loadProfile(userId), proxiStats(userId)]);
  await store.markProxiUnlocksSeen(userId);
  const stage = stageForLevel(s.level);
  if (stage !== profile.seenStage) await store.upsertProxiProfile({ ...profile, seenStage: stage, updatedAt: new Date().toISOString() });
}
