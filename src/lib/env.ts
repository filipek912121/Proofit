/** Feature detection based on environment variables. Server-only values are never read on the client. */
export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
};

/** Demo mode = Supabase is not configured. Uses an in-memory store with sample data. */
export function isDemoMode(): boolean {
  return !(env.supabaseUrl && env.supabaseAnonKey && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/** Stripe keys present. The price id is optional — without it the 19.99 PLN price is created inline. */
export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET);
}

/**
 * Real payments need a persistent database: in demo mode Premium would live in
 * one server's memory and could be lost after paying. So checkout is only
 * offered with Supabase configured (or explicitly for local testing).
 */
export function paymentsEnabled(): boolean {
  return isStripeConfigured() && (!isDemoMode() || process.env.STRIPE_ALLOW_DEMO === "1");
}
