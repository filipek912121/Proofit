import "server-only";
import { CATEGORIES } from "@/lib/config/taxonomy";
import { getStore } from "@/lib/data";
import { addDays, dayKey } from "@/lib/engine/dates";
import { liveStreak } from "@/lib/engine/xp";
import type { Category, Challenge, Participation } from "@/lib/types";
import { getEntitlements } from "./entitlements";
import { AVATAR_FRAMES, isUnlocked, PROFILE_BANNERS } from "@/lib/config/cosmetics";
import { levelFromXp } from "@/lib/engine/levels";
import { AppError } from "./errors";

export const FREE_AVATAR_COLORS = ["#8b5cf6", "#3b82f6", "#06b6d4", "#ec4899", "#22c55e", "#f59e0b"];
export const PREMIUM_AVATAR_COLORS = ["#f43f5e", "#a855f7", "#14b8a6", "#eab308", "#6366f1", "#d946ef"];

export async function profileOverview(profileId: string, viewerId: string) {
  const store = getStore();
  const profile = await store.getProfile(profileId);
  if (!profile) return null;
  const today = dayKey();
  const [parts, achievements, catalogue, ent, followers, following, completions] = await Promise.all([
    store.listParticipations({ userId: profileId }),
    store.listUserAchievements(profileId),
    store.listAchievements(),
    getEntitlements(profileId),
    store.listFollows({ followingId: profileId }),
    store.listFollows({ followerId: profileId }),
    store.listCompletions({ userId: profileId }),
  ]);
  const chs = await store.listChallenges({ ids: parts.map((p) => p.challengeId) });
  const isSelf = profileId === viewerId;
  const history = parts
    .filter((p) => p.status !== "active")
    .map((p) => ({ participation: p, challenge: chs.find((c) => c.id === p.challengeId)! }))
    .filter((h) => h.challenge && (isSelf || h.challenge.visibility === "public"))
    .sort((a, b) => b.participation.joinedAt.localeCompare(a.participation.joinedAt));
  return {
    profile,
    isSelf,
    isPremium: ent.isPremium,
    streak: liveStreak(profile, today),
    completedCount: parts.filter((p) => p.status === "completed").length,
    activeCount: parts.filter((p) => p.status === "active").length,
    totalCheckins: completions.filter((c) => c.status === "approved").length,
    achievements: catalogue.map((a) => ({ ...a, unlockedAt: achievements.find((u) => u.achievementId === a.id)?.unlockedAt ?? null })),
    history: history.slice(0, 20),
    followers: followers.length,
    following: following.length,
    viewerFollows: followers.some((f) => f.followerId === viewerId),
  };
}

export async function updateProfile(
  userId: string,
  input: { displayName: string; bio: string; avatarColor: string; avatarFrame: string; banner: string },
) {
  const ent = await getEntitlements(userId);
  const allowed = ent.limits.profileCustomization ? [...FREE_AVATAR_COLORS, ...PREMIUM_AVATAR_COLORS] : FREE_AVATAR_COLORS;
  if (!allowed.includes(input.avatarColor)) throw new AppError("That colour is part of Premium profile customization.");
  const me = await getStore().getProfile(userId);
  if (!me) throw new AppError("User not found.");
  const level = levelFromXp(me.xp).level;
  const frame = AVATAR_FRAMES.find((f) => f.id === input.avatarFrame);
  const banner = PROFILE_BANNERS.find((b) => b.id === input.banner);
  if (!frame || !banner) throw new AppError("Invalid request.");
  if (!isUnlocked(frame, level, ent.isPremium) || !isUnlocked(banner, level, ent.isPremium))
    throw new AppError("Reach a higher level to unlock this decoration.");
  // Only safe, user-editable columns are ever written here — never xp/streak/admin/subscription.
  return getStore().updateProfile(userId, {
    displayName: input.displayName,
    bio: input.bio,
    avatarColor: input.avatarColor,
    avatarFrame: frame.id,
    banner: banner.id,
  });
}

const AVATAR_MAX_BYTES = 2 * 1024 * 1024;

/** Detects the real image type from the file's first bytes (never trust the browser's label). */
function sniffImage(b: Uint8Array): "image/jpeg" | "image/png" | "image/webp" | null {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  if (String.fromCharCode(...b.slice(0, 4)) === "RIFF" && String.fromCharCode(...b.slice(8, 12)) === "WEBP") return "image/webp";
  return null;
}

export async function setAvatarPhoto(userId: string, file: File | null) {
  const store = getStore();
  if (!file) {
    await store.updateProfile(userId, { avatarUrl: null });
    return;
  }
  if (file.size === 0) throw new AppError("Choose a photo to upload.");
  if (file.size > AVATAR_MAX_BYTES) throw new AppError("Profile photo must be 2 MB or smaller.");
  const type = sniffImage(new Uint8Array(await file.slice(0, 12).arrayBuffer()));
  if (!type) throw new AppError("Upload a JPG, PNG or WEBP image.");
  const clean = new File([await file.arrayBuffer()], `avatar.${type.split("/")[1]}`, { type });
  const url = await store.uploadAvatar(userId, clean);
  await store.updateProfile(userId, { avatarUrl: url });
}

/** Premium-only analytics. Callers must check entitlements first; this also enforces it. */
export async function advancedStats(userId: string) {
  const ent = await getEntitlements(userId);
  if (!ent.limits.advancedStats) throw new AppError("Advanced statistics are a Premium feature.");
  const store = getStore();
  const today = dayKey();
  const since = addDays(today, -29);
  const [events, parts, completions] = await Promise.all([
    store.listXpEvents({ userId, sinceDay: since }),
    store.listParticipations({ userId }),
    store.listCompletions({ userId }),
  ]);
  const chs = await store.listChallenges({ ids: parts.map((p) => p.challengeId) });
  const daily = Array.from({ length: 30 }, (_, i) => {
    const day = addDays(since, i);
    return { day, xp: events.filter((e) => e.day === day).reduce((s, e) => s + e.amount, 0) };
  });
  const byCategory = CATEGORIES.map((cat) => ({
    category: cat as Category,
    checkins: completions.filter((c) => c.status === "approved" && chs.find((x) => x.id === c.challengeId)?.category === cat).length,
  }));
  const finished = parts.filter((p) => p.status === "completed" || p.status === "failed");
  const weekday = [0, 0, 0, 0, 0, 0, 0];
  for (const c of completions) if (c.status === "approved") weekday[(new Date(`${c.day}T12:00:00Z`).getUTCDay() + 6) % 7]++;
  const bySource: Record<string, number> = {};
  for (const e of events) bySource[e.reason] = (bySource[e.reason] ?? 0) + e.amount;
  const byDifficulty = (["easy", "medium", "hard", "extreme"] as const).map((d) => ({
    difficulty: d,
    completed: parts.filter((p) => p.status === "completed" && chs.find((c: Challenge) => c.id === p.challengeId)?.difficulty === d).length,
  }));
  return {
    daily,
    total30: daily.reduce((s, d) => s + d.xp, 0),
    bestDay: daily.reduce((b, d) => (d.xp > b.xp ? d : b), daily[0]),
    activeDays: daily.filter((d) => d.xp > 0).length,
    byCategory,
    byDifficulty,
    weekday,
    bySource,
    successRate: finished.length ? parts.filter((p: Participation) => p.status === "completed").length / finished.length : null,
  };
}
