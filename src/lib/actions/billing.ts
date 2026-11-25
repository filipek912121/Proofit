"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSessionUserId } from "@/lib/auth";
import { getStore } from "@/lib/data";
import { env, isDemoMode, paymentsEnabled } from "@/lib/env";
import { PREMIUM_PRICE } from "@/lib/config/game";
import { hasLiveSubscription, PASS_DAYS, trialEndForPass } from "@/lib/engine/billing";
import { getPlan } from "@/lib/services/entitlements";
import { getStripe } from "@/lib/stripe";
import { getLocale } from "@/lib/i18n/server";
import type { ActionResult } from "@/lib/types";
import { localize } from "./run";

async function origin() {
  return (await headers()).get("origin") ?? env.siteUrl;
}

export type CheckoutKind = "subscription" | "pass";

const PRICE_GROSZE = Math.round(PREMIUM_PRICE.amount * 100);

/**
 * Starts a real Stripe Checkout session. The plan only changes when Stripe's
 * signed webhook confirms payment — never on redirect back to the app.
 *  - "subscription": monthly, renews automatically (cards, Apple Pay, Google Pay).
 *  - "pass": one-time 30 days of Premium, no renewal (BLIK, Przelewy24, cards).
 * Payment methods come from the Stripe dashboard ("dynamic payment methods").
 */
export async function startCheckoutAction(kind: CheckoutKind = "subscription"): Promise<ActionResult> {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login?next=/premium");
  if (kind !== "subscription" && kind !== "pass") return localize({ ok: false, error: "Invalid request." });
  const stripe = getStripe();
  if (!stripe || !paymentsEnabled()) return localize({ ok: false, error: "Payments aren't configured yet. Add your Stripe keys to enable Premium checkout." });

  const store = getStore();
  const sub = await store.getSubscription(userId);
  if (hasLiveSubscription(sub)) return localize({ ok: false, error: "You're already Premium." });
  const base = await origin();
  const locale = (await getLocale()) === "pl" ? "pl" : "en";
  const common = {
    client_reference_id: userId,
    customer: sub?.stripeCustomerId ?? undefined,
    locale,
    success_url: `${base}/premium?status=success&kind=${kind}`,
    cancel_url: `${base}/premium?status=cancelled`,
  } as const;

  let url: string | null = null;
  try {
    if (kind === "subscription") {
      const trialEnd = trialEndForPass(sub);
      const session = await stripe.checkout.sessions.create({
        ...common,
        mode: "subscription",
        line_items: [
          process.env.STRIPE_PRICE_ID_PREMIUM
            ? { price: process.env.STRIPE_PRICE_ID_PREMIUM, quantity: 1 }
            : { price_data: { currency: "pln", unit_amount: PRICE_GROSZE, recurring: { interval: "month" }, product_data: { name: "PROOFIT Premium" } }, quantity: 1 },
        ],
        metadata: { userId, kind },
        // A running pass becomes a free trial, so nobody pays twice for the same days.
        subscription_data: { metadata: { userId }, ...(trialEnd ? { trial_end: trialEnd } : {}) },
        allow_promotion_codes: true,
      });
      url = session.url;
    } else {
      const session = await stripe.checkout.sessions.create({
        ...common,
        mode: "payment",
        line_items: [
          {
            price_data: { currency: "pln", unit_amount: PRICE_GROSZE, product_data: { name: locale === "pl" ? `PROOFIT Premium — ${PASS_DAYS} dni` : `PROOFIT Premium — ${PASS_DAYS} days` } },
            quantity: 1,
          },
        ],
        metadata: { userId, kind },
        payment_intent_data: { metadata: { userId, kind } },
        // A Stripe customer lets the billing portal show receipts later.
        ...(sub?.stripeCustomerId ? {} : { customer_creation: "always" as const }),
        custom_text: { submit: { message: locale === "pl" ? "Jednorazowo, bez automatycznego odnawiania." : "One-time payment, no automatic renewal." } },
      });
      url = session.url;
    }
  } catch (e) {
    console.error("[checkout]", e);
    return localize({ ok: false, error: "Couldn't start checkout." });
  }
  if (!url) return localize({ ok: false, error: "Couldn't start checkout." });
  redirect(url);
}

export async function openBillingPortalAction(): Promise<ActionResult> {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");
  const stripe = getStripe();
  if (!stripe || !paymentsEnabled()) return localize({ ok: false, error: "Payments aren't configured." });
  const sub = await getStore().getSubscription(userId);
  if (!sub?.stripeCustomerId) return localize({ ok: false, error: "No billing account found." });
  const portal = await stripe.billingPortal.sessions.create({ customer: sub.stripeCustomerId, return_url: `${await origin()}/premium` });
  redirect(portal.url);
}

/** DEMO MODE ONLY: flip the plan locally to preview Premium features. No payment is involved or implied. */
export async function demoTogglePremiumAction(): Promise<ActionResult> {
  if (!isDemoMode()) return localize({ ok: false, error: "Not available." });
  const userId = await getSessionUserId();
  if (!userId) return localize({ ok: false, error: "Log in first." });
  const store = getStore();
  const current = await getPlan(userId);
  await store.upsertSubscription({
    userId,
    plan: current === "premium" ? "free" : "premium",
    status: "active",
    currentPeriodEnd: null,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
  });
  revalidatePath("/", "layout");
  return localize({ ok: true, message: current === "premium" ? "Demo: switched back to Free." : "Demo: Premium preview enabled." });
}
