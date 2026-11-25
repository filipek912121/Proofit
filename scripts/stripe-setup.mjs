#!/usr/bin/env node
/**
 * One-time Stripe setup for PROOFIT. Run on YOUR computer:
 *
 *   STRIPE_SECRET_KEY=sk_test_... node scripts/stripe-setup.mjs https://your-app.vercel.app
 *
 * Creates (or reuses) the "PROOFIT Premium" product with a 19.99 PLN monthly price
 * and the webhook endpoint, then prints the values to paste into Vercel →
 * Settings → Environment Variables. Safe to run again: nothing is duplicated.
 */
import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
const site = (process.argv[2] ?? "").replace(/\/$/, "");
if (!key || !/^https:\/\//.test(site)) {
  console.error("Usage: STRIPE_SECRET_KEY=sk_... node scripts/stripe-setup.mjs https://your-app.vercel.app");
  process.exit(1);
}
const stripe = new Stripe(key);
const EVENTS = [
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
];

const products = await stripe.products.search({ query: "metadata['app']:'proofit' AND active:'true'" });
const product = products.data[0] ?? (await stripe.products.create({ name: "PROOFIT Premium", metadata: { app: "proofit" } }));
const prices = await stripe.prices.list({ product: product.id, active: true, type: "recurring", limit: 10 });
const price =
  prices.data.find((p) => p.currency === "pln" && p.unit_amount === 1999 && p.recurring?.interval === "month") ??
  (await stripe.prices.create({ product: product.id, currency: "pln", unit_amount: 1999, recurring: { interval: "month" } }));

const url = `${site}/api/stripe/webhook`;
const endpoints = await stripe.webhookEndpoints.list({ limit: 100 });
let secret = null;
let endpoint = endpoints.data.find((e) => e.url === url);
if (endpoint) {
  await stripe.webhookEndpoints.update(endpoint.id, { enabled_events: EVENTS });
  console.log(`Webhook already exists (${endpoint.id}) — events updated. Its signing secret is shown in the Stripe dashboard.`);
} else {
  endpoint = await stripe.webhookEndpoints.create({ url, enabled_events: EVENTS, description: "PROOFIT" });
  secret = endpoint.secret;
}

console.log("\nPaste into Vercel → Settings → Environment Variables, then redeploy:\n");
console.log(`STRIPE_SECRET_KEY=${key.slice(0, 7)}…   (the key you used to run this script)`);
console.log(`STRIPE_PRICE_ID_PREMIUM=${price.id}`);
console.log(secret ? `STRIPE_WEBHOOK_SECRET=${secret}` : "STRIPE_WEBHOOK_SECRET=<copy from Stripe → Developers → Webhooks → your endpoint>");
console.log(`\nAlso enable BLIK and Przelewy24 in Stripe → Settings → Payment methods.`);
