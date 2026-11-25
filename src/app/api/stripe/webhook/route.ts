import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { paymentsEnabled } from "@/lib/env";
import { handleStripeEvent } from "@/lib/services/billing";
import { getStripe } from "@/lib/stripe";

/**
 * Stripe → PROOFIT. The ONLY place a plan is upgraded in production: the
 * signature is verified with STRIPE_WEBHOOK_SECRET and rows are written with
 * the service role. Events are processed once (see stripe_events).
 *
 * Stripe → Developers → Webhooks → endpoint https://<your-domain>/api/stripe/webhook, events:
 *   checkout.session.completed, checkout.session.async_payment_succeeded,
 *   customer.subscription.created, customer.subscription.updated, customer.subscription.deleted
 */
export async function POST(req: Request) {
  const stripe = getStripe();
  if (!stripe || !paymentsEnabled()) return NextResponse.json({ error: "Payments not configured" }, { status: 501 });

  const signature = req.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await req.text(), signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    const result = await handleStripeEvent(event, stripe);
    return NextResponse.json({ received: true, result });
  } catch (e) {
    console.error("[stripe-webhook]", event.type, e);
    // 500 → Stripe retries later; the claim was released so the retry is processed.
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
