import "server-only";
import type Stripe from "stripe";
import { revalidatePath } from "next/cache";
import { getStore } from "@/lib/data";
import { passEnd, rowFromStripeSubscription } from "@/lib/engine/billing";

const customerId = (c: string | Stripe.Customer | Stripe.DeletedCustomer | null) => (c ? (typeof c === "string" ? c : c.id) : null);

/** Mirror a Stripe subscription onto the user's row (the only way a subscription upgrades a plan). */
export async function syncSubscription(sub: Stripe.Subscription, userIdHint?: string | null) {
  const userId = userIdHint ?? sub.metadata?.userId;
  if (!userId) return;
  const store = getStore();
  const row = rowFromStripeSubscription(
    userId,
    { id: sub.id, status: sub.status, customerId: customerId(sub.customer)!, periodEnd: sub.items?.data?.[0]?.current_period_end ?? null },
    await store.getSubscription(userId),
  );
  if (row) await store.upsertSubscription(row);
}

/** A paid one-time pass: Premium for 30 days, stacked on any pass still running. */
export async function grantPass(session: Stripe.Checkout.Session) {
  const userId = session.client_reference_id ?? session.metadata?.userId;
  if (!userId || session.payment_status !== "paid") return;
  const store = getStore();
  const existing = await store.getSubscription(userId);
  await store.upsertSubscription({
    userId,
    plan: "premium",
    status: "active",
    currentPeriodEnd: passEnd(existing),
    stripeCustomerId: customerId(session.customer) ?? existing?.stripeCustomerId ?? null,
    stripeSubscriptionId: null,
  });
}

/**
 * Handles a verified Stripe event. Each event id is processed once — Stripe
 * redelivers on timeouts, and a pass must never be granted twice.
 */
export async function handleStripeEvent(event: Stripe.Event, stripe: Stripe): Promise<"processed" | "duplicate" | "ignored"> {
  const relevant = [
    "checkout.session.completed",
    "checkout.session.async_payment_succeeded",
    "customer.subscription.created",
    "customer.subscription.updated",
    "customer.subscription.deleted",
  ];
  if (!relevant.includes(event.type)) return "ignored";
  const store = getStore();
  if (!(await store.claimStripeEvent(event.id, event.type))) return "duplicate";
  try {
    await apply(event, stripe);
  } catch (e) {
    await store.releaseStripeEvent(event.id).catch(() => undefined);
    throw e;
  }
  revalidatePath("/", "layout");
  return "processed";
}

async function apply(event: Stripe.Event, stripe: Stripe) {
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === "payment" && session.metadata?.kind === "pass") {
        // BLIK/cards are paid immediately; Przelewy24 may confirm later via async_payment_succeeded.
        await grantPass(session);
      } else if (session.mode === "subscription" && session.subscription) {
        const id = typeof session.subscription === "string" ? session.subscription : session.subscription.id;
        await syncSubscription(await stripe.subscriptions.retrieve(id), session.client_reference_id ?? session.metadata?.userId);
      }
      break;
    }
    default:
      await syncSubscription(event.data.object as Stripe.Subscription);
  }
}
