import { formatDate } from "@/lib/i18n/core";
import { getT } from "@/lib/i18n/server";
import { Check, Crown, Info, Minus } from "lucide-react";
import type { Metadata } from "next";
import { ActivationWatcher, CheckoutButton, DemoToggle, PortalButton } from "@/components/premium-actions";
import { ProxiAvatar } from "@/components/proxi/proxi-avatar";
import { FormAlert } from "@/components/ui/field";
import { requireUser } from "@/lib/auth";
import { PLAN_LIMITS, PREMIUM_PRICE } from "@/lib/config/game";
import { getStore } from "@/lib/data";
import { hasLiveSubscription, isLivePass, PASS_DAYS } from "@/lib/engine/billing";
import { isDemoMode, paymentsEnabled } from "@/lib/env";
import { getEntitlements } from "@/lib/services/entitlements";
import { getProxiLook } from "@/lib/services/proxi";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("Premium") };
}

const ROWS: { label: string; free: string | boolean; premium: string | boolean }[] = [
  { label: "Active challenges", free: String(PLAN_LIMITS.free.maxActiveChallenges), premium: String(PLAN_LIMITS.premium.maxActiveChallenges) },
  { label: "Private challenges", free: String(PLAN_LIMITS.free.maxPrivateChallenges), premium: String(PLAN_LIMITS.premium.maxPrivateChallenges) },
  { label: "Squads you can own", free: String(PLAN_LIMITS.free.maxSquadsOwned), premium: String(PLAN_LIMITS.premium.maxSquadsOwned) },
  { label: "Duels, leaderboards & achievements", free: true, premium: true },
  { label: "Private squads", free: false, premium: true },
  { label: "Advanced statistics", free: false, premium: true },
  { label: "Custom challenge templates", free: false, premium: true },
  { label: "PROXI Premium styles", free: false, premium: true },
];

export default async function PremiumPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const t = await getT();
  const me = await requireUser();
  const { status } = await searchParams;
  const [ent, sub, proxi] = await Promise.all([getEntitlements(me.id), getStore().getSubscription(me.id), getProxiLook(me.id)]);
  const demo = isDemoMode();
  const payments = paymentsEnabled();
  const price = PREMIUM_PRICE.amount.toFixed(2).replace(".", ",");
  const subscribed = hasLiveSubscription(sub);
  const pass = isLivePass(sub);
  const date = (iso: string) => formatDate(iso, t.locale, { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <header className="flex flex-col items-center text-center animate-rise">
        <ProxiAvatar stage={proxi.stage} look={proxi.look} mood={ent.isPremium ? "proud" : "excited"} size={120} prop="trophy" />
        <h1 className="mt-3 font-display text-[30px] font-black leading-tight">{ent.isPremium ? t("You're Premium") : t("PROOFIT Premium")}</h1>
        <p className="mt-1 max-w-md font-semibold text-muted">{t("More challenges at once, deeper stats and private groups for your crew.")}</p>
      </header>

      {status === "success" && (
        <>
          <FormAlert tone="success">
            {ent.isPremium ? t("Payment received. Premium is on — have fun!") : t("Payment received! Premium turns on as soon as Stripe confirms it — usually a few seconds, up to a minute for bank transfers.")}
          </FormAlert>
          <ActivationWatcher active={ent.isPremium} />
        </>
      )}
      {status === "cancelled" && <FormAlert tone="info">{t("Checkout cancelled — you haven't been charged.")}</FormAlert>}

      {/* Current state */}
      {ent.isPremium && (
        <section className="rounded-3xl border-2 border-gold bg-gold/10 p-5">
          <p className="flex items-center gap-2 text-lg font-black">
            <Crown className="h-6 w-6 text-gold" aria-hidden /> {t("Your Premium is active")}
          </p>
          {subscribed && sub?.currentPeriodEnd && <p className="mt-1 font-semibold text-muted">{t("Renews {date}", { date: date(sub.currentPeriodEnd) })}</p>}
          {pass && sub?.currentPeriodEnd && <p className="mt-1 font-semibold text-muted">{t("Active until {date}. No automatic renewal.", { date: date(sub.currentPeriodEnd) })}</p>}
          {!subscribed && !pass && demo && <p className="mt-1 text-sm font-semibold text-muted">{t("Demo preview — no payment involved.")}</p>}
          {sub?.stripeCustomerId && payments && (
            <div className="mt-4">
              <PortalButton />
            </div>
          )}
        </section>
      )}

      {/* Plans */}
      {!subscribed && (
        <section aria-label={t("Plans")} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col rounded-3xl border-2 border-violet p-5">
            <p className="text-xs font-black uppercase tracking-wider text-violet-2">{t("Monthly")}</p>
            <p className="mt-1 font-display text-4xl font-black">
              {price} <span className="text-base font-bold text-muted">{t("PLN / month")}</span>
            </p>
            <p className="mt-2 text-sm font-semibold text-muted">{t("Renews every month. Cancel anytime in two taps.")}</p>
            <p className="mt-1 text-xs font-bold text-subtle">{t("Card · Apple Pay · Google Pay")}</p>
            {pass && sub?.currentPeriodEnd && <p className="mt-2 text-xs font-bold text-green-dark">{t("Your pass days count as a free trial — first charge after {date}.", { date: date(sub.currentPeriodEnd) })}</p>}
            <div className="mt-auto pt-5">{payments && <CheckoutButton kind="subscription" label={t("Subscribe")} variant="gold" />}</div>
          </div>
          <div className="flex flex-col rounded-3xl border-2 border-line p-5">
            <p className="text-xs font-black uppercase tracking-wider text-green-dark">{t("{n} days, one payment", { n: PASS_DAYS })}</p>
            <p className="mt-1 font-display text-4xl font-black">
              {price} <span className="text-base font-bold text-muted">{t("PLN once")}</span>
            </p>
            <p className="mt-2 text-sm font-semibold text-muted">{t("No subscription, nothing renews. Buy again whenever you want — days add up.")}</p>
            <p className="mt-1 text-xs font-bold text-subtle">{t("BLIK · Przelewy24 · Card")}</p>
            <div className="mt-auto pt-5">{payments && <CheckoutButton kind="pass" label={pass ? t("Add {n} days", { n: PASS_DAYS }) : t("Buy {n} days", { n: PASS_DAYS })} variant="success" />}</div>
          </div>
        </section>
      )}

      {!payments && (
        <FormAlert tone="info">
          <Info className="mr-1 inline h-4 w-4 -translate-y-px" aria-hidden />{" "}
          {demo ? t("Payments go live once the database (Supabase) and Stripe keys are connected. Until then nobody can be charged.") : t("Payments aren't configured yet. Add your Stripe keys (see README) to enable checkout — no fake payments are ever taken.")}
        </FormAlert>
      )}
      {demo && <DemoToggle isPremium={ent.isPremium} />}

      {/* Comparison */}
      <section aria-label={t("Free vs Premium")}>
        <h2 className="mb-3 font-display text-[19px] font-extrabold">{t("Free vs Premium")}</h2>
        <div className="overflow-hidden rounded-2xl border-2 border-line">
          <table className="w-full text-sm">
            <caption className="sr-only">{t("Free vs Premium")}</caption>
            <thead>
              <tr className="border-b-2 border-line bg-ink-3 text-left">
                <th scope="col" className="px-4 py-3 font-extrabold text-muted">
                  {t("Feature")}
                </th>
                <th scope="col" className="px-2 py-3 text-center font-extrabold">
                  {t("Free")}
                </th>
                <th scope="col" className="px-2 py-3 text-center font-extrabold text-gold-dark">
                  {t("Premium")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-line">
              {ROWS.map((r) => (
                <tr key={r.label}>
                  <th scope="row" className="px-4 py-3 text-left font-bold">
                    {t(r.label)}
                  </th>
                  {[r.free, r.premium].map((v, i) => (
                    <td key={i} className="px-2 py-3 text-center">
                      {v === true ? <Check className="mx-auto h-5 w-5 text-green" strokeWidth={3} aria-label={t("Included")} /> : v === false ? <Minus className="mx-auto h-5 w-5 text-subtle" aria-label={t("Not included")} /> : <span className={i ? "font-black" : "font-bold text-muted"}>{v}</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs font-semibold text-subtle">{t("Payments are processed by Stripe. PROOFIT never sees your card or bank details.")}</p>
      </section>
    </div>
  );
}
