import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { hasLiveSubscription, isLivePass, passEnd, rowFromStripeSubscription, trialEndForPass } from "@/lib/engine/billing";
import { planFromSubscription } from "@/lib/engine/plan";
import type { Subscription } from "@/lib/types";

const now = new Date("2026-11-27T12:00:00Z");
const days = (n: number) => new Date(now.getTime() + n * 86_400_000).toISOString();
const pass = (endInDays: number): Subscription => ({ userId: "u", plan: "premium", status: "active", currentPeriodEnd: days(endInDays), stripeCustomerId: "cus_1", stripeSubscriptionId: null });
const sub = (id: string, status: Subscription["status"] = "active"): Subscription => ({ userId: "u", plan: status === "active" ? "premium" : "free", status, currentPeriodEnd: days(20), stripeCustomerId: "cus_1", stripeSubscriptionId: id });

describe("one-time Premium pass", () => {
  it("starts today when there is no running pass", () => {
    assert.equal(passEnd(null, now), days(30));
    assert.equal(passEnd(pass(-1), now), days(30));
  });
  it("stacks on a pass that is still running", () => {
    assert.equal(passEnd(pass(10), now), days(40));
  });
  it("grants Premium until the end date, then expires", () => {
    const p = pass(5);
    assert.equal(isLivePass(p, now), true);
    assert.equal(planFromSubscription(p, now), "premium");
    assert.equal(planFromSubscription(p, new Date(days(6))), "free");
  });
  it("is not a subscription", () => {
    assert.equal(hasLiveSubscription(pass(5)), false);
    assert.equal(hasLiveSubscription(sub("sub_1")), true);
  });
});

describe("Stripe subscription sync", () => {
  it("upgrades on active and downgrades on cancel", () => {
    const up = rowFromStripeSubscription("u", { id: "sub_1", status: "active", customerId: "cus_1", periodEnd: 1_800_000_000 }, null, now)!;
    assert.equal(up.plan, "premium");
    assert.equal(up.currentPeriodEnd, new Date(1_800_000_000 * 1000).toISOString());
    const down = rowFromStripeSubscription("u", { id: "sub_1", status: "canceled", customerId: "cus_1" }, up, now)!;
    assert.equal(down.plan, "free");
    assert.equal(down.status, "canceled");
  });
  it("maps unpaid to past_due (no Premium)", () => {
    const r = rowFromStripeSubscription("u", { id: "sub_1", status: "unpaid", customerId: "cus_1" }, null, now)!;
    assert.equal(r.status, "past_due");
    assert.equal(planFromSubscription(r, now), "free");
  });
  it("never lets a dead subscription wipe a running pass", () => {
    assert.equal(rowFromStripeSubscription("u", { id: "sub_old", status: "canceled", customerId: "cus_1" }, pass(10), now), null);
    assert.equal(rowFromStripeSubscription("u", { id: "sub_x", status: "incomplete_expired", customerId: "cus_1" }, pass(10), now), null);
  });
  it("ignores a dead, unrelated subscription while another one is live", () => {
    assert.equal(rowFromStripeSubscription("u", { id: "sub_old", status: "canceled", customerId: "cus_1" }, sub("sub_new"), now), null);
  });
  it("an active subscription replaces a pass", () => {
    const r = rowFromStripeSubscription("u", { id: "sub_1", status: "trialing", customerId: "cus_1", periodEnd: 1_800_000_000 }, pass(10), now)!;
    assert.equal(r.stripeSubscriptionId, "sub_1");
    assert.equal(r.plan, "premium");
  });
});

describe("pass → subscription without double charge", () => {
  it("uses the pass end as trial end when ≥ 48 h away", () => {
    assert.equal(trialEndForPass(pass(10), now), Math.floor(new Date(days(10)).getTime() / 1000));
  });
  it("no trial when the pass ends within 48 h or there is none", () => {
    assert.equal(trialEndForPass(pass(1), now), undefined);
    assert.equal(trialEndForPass(null, now), undefined);
  });
});
