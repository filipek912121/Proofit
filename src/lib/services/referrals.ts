import "server-only";
import { REFERRAL_RULES } from "@/lib/config/game";
import { getStore } from "@/lib/data";

export async function referralOverview(userId: string) {
  const store = getStore();
  const [invited, events] = await Promise.all([store.listReferrals(userId), store.listXpEvents({ userId })]);
  const rewarded = new Set(events.filter((e) => e.reason === "referral" && e.refId?.startsWith("ref:")).map((e) => e.refId!.slice(4)));
  const xpEarned = events.filter((e) => e.reason === "referral" && e.refId?.startsWith("ref:")).reduce((s, e) => s + e.amount, 0);
  return {
    invited: invited
      .map((p) => ({ id: p.id, displayName: p.displayName, username: p.username, avatarColor: p.avatarColor, avatarUrl: p.avatarUrl, avatarFrame: p.avatarFrame, rewarded: rewarded.has(p.id) }))
      .sort((a, b) => Number(b.rewarded) - Number(a.rewarded)),
    rewardedCount: rewarded.size,
    xpEarned,
    rules: REFERRAL_RULES,
  };
}

/** Resolve a referral code (a username) to a user id; ignores invalid codes. */
export async function resolveReferrer(code: string | null | undefined): Promise<string | null> {
  if (!code || !/^[a-z0-9._]{3,20}$/i.test(code)) return null;
  return (await getStore().getProfileByUsername(code.toLowerCase()))?.id ?? null;
}
