import type { Subscription } from "@/lib/types";

/** Length of a one-time Premium pass (BLIK / Przelewy24 / card, no auto-renewal). */
export const PASS_DAYS = 30;
const DAY = 86_400_000;

/** Stripe subscription status → our row status. */
export const STRIPE_STATUS: Record<string, Subscription["status"]> = {
  active: "active",
  trialing: "trialing",
  past_due: "past_due",
  canceled: "canceled",
  unpaid: "past_due",
  incomplete: "inactive",
  incomplete_expired: "inactive",
  paused: "inactive",
};

/** A prepaid pass (no Stripe subscription behind it) that hasn't expired yet. */
export function isLivePass(sub: Subscription | null, now = new Date()): boolean {
  return Boolean(sub && sub.plan === "premium" && !sub.stripeSubscriptionId && sub.currentPeriodEnd && new Date(sub.currentPeriodEnd) > now);
}

/** A recurring subscription that currently grants Premium. */
export function hasLiveSubscription(sub: Subscription | null): boolean {
  return Boolean(sub && sub.stripeSubscriptionId && sub.plan === "premium" && (sub.status === "active" || sub.status === "trialing"));
}

/** New end date after buying a pass: stacks on top of a pass that is still running. */
export function passEnd(existing: Subscription | null, now = new Date(), days = PASS_DAYS): string {
  const from = isLivePass(existing, now) ? new Date(existing!.currentPeriodEnd!).getTime() : now.getTime();
  return new Date(from + days * DAY).toISOString();
}

export interface StripeSubscriptionInput {
  id: string;
  status: string;
  customerId: string;
  /** Unix seconds. */
  periodEnd?: number | null;
}

/**
 * Row to store for a Stripe subscription event, or null to ignore it.
 * An event about a subscription that isn't the stored one must never
 * downgrade a user who has a live prepaid pass.
 */
export function rowFromStripeSubscription(userId: string, s: StripeSubscriptionInput, existing: Subscription | null, now = new Date()): Subscription | null {
  const grants = s.status === "active" || s.status === "trialing";
  const otherSub = existing?.stripeSubscriptionId && existing.stripeSubscriptionId !== s.id;
  if (!grants && (isLivePass(existing, now) || (otherSub && hasLiveSubscription(existing)))) return null;
  return {
    userId,
    plan: grants ? "premium" : "free",
    status: STRIPE_STATUS[s.status] ?? "inactive",
    currentPeriodEnd: s.periodEnd ? new Date(s.periodEnd * 1000).toISOString() : null,
    stripeCustomerId: s.customerId,
    stripeSubscriptionId: s.id,
  };
}

/** Free trial end (unix seconds) so a pass holder who subscribes isn't charged twice. Stripe needs ≥ 48 h. */
export function trialEndForPass(existing: Subscription | null, now = new Date()): number | undefined {
  if (!isLivePass(existing, now)) return undefined;
  const end = new Date(existing!.currentPeriodEnd!).getTime();
  return end - now.getTime() >= 2 * DAY + 60_000 ? Math.floor(end / 1000) : undefined;
}
