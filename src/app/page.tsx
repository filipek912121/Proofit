import { getT } from "@/lib/i18n/server";
import { Check, Crown, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { CategoryIcon } from "@/components/brand/category-icon";
import { Logo } from "@/components/brand/logo";
import { NavIcon } from "@/components/brand/nav-icons";
import { StreakFlame } from "@/components/brand/streak-flame";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ProxiAvatar } from "@/components/proxi/proxi-avatar";
import { Button, LinkButton } from "@/components/ui/button";
import { enterDemoAction } from "@/lib/actions/auth";
import { getSessionUserId } from "@/lib/auth";
import { PLAN_LIMITS, PREMIUM_PRICE } from "@/lib/config/game";
import { isDemoMode } from "@/lib/env";

/** Landing: one idea (prove it), one mascot, one button. */
export default async function Landing() {
  const t = await getT();
  const signedIn = Boolean(await getSessionUserId());
  const demo = isDemoMode();
  const LOOP = [
    { icon: <CategoryIcon category="music" size={56} />, title: t("Pick a mission"), text: t("One beat a day. Up at 7:00. 10 pages. Or your own idea.") },
    { icon: <NavIcon name="shield" size={56} />, title: t("Show your proof"), text: t("A photo, a link or a note. Done is better than promised.") },
    { icon: <StreakFlame size={56} />, title: t("Keep the streak"), text: t("Your friends see it. PROXI grows with you.") },
    { icon: <NavIcon name="trophy" size={56} />, title: t("Climb the league"), text: t("Weekly league with your crew. Duels when it gets personal.") },
  ];
  return (
    <div className="overflow-x-hidden">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
        <Logo />
        <nav className="flex items-center gap-2" aria-label={t("Account")}>
          <LanguageSwitcher className="hidden sm:inline-flex" />
          {signedIn ? (
            <LinkButton href="/dashboard" size="sm">
              {t("Open app")}
            </LinkButton>
          ) : (
            <LinkButton href="/login" variant="secondary" size="sm">
              {t("Log in")}
            </LinkButton>
          )}
        </nav>
      </header>

      <main id="main">
        <section className="mx-auto flex max-w-5xl flex-col items-center gap-8 px-5 pb-16 pt-6 text-center md:flex-row md:text-left">
          <div className="shrink-0 animate-pop">
            <ProxiAvatar stage={2} mood="excited" size={220} prop="trophy" />
          </div>
          <div className="animate-rise">
            <h1 className="font-display text-[40px] font-black leading-[1.05] sm:text-6xl">
              {t("Challenge.")} {t("Compete.")} <span className="text-green">{t("Win.")}</span>
            </h1>
            <p className="mt-4 text-xl font-extrabold">{t("Don't just say it. PROOF it.")}</p>
            <p className="mt-2 max-w-md text-[17px] font-semibold text-muted">{t("Real-life missions with your friends. Show proof, keep your streak and grow your PROXI.")}</p>
            <div className="mt-7 flex flex-col gap-3 sm:max-w-sm">
              {signedIn ? (
                <LinkButton href="/dashboard" size="lg" variant="success">
                  {t("Continue your streak")}
                </LinkButton>
              ) : demo ? (
                <form action={enterDemoAction}>
                  <Button size="lg" variant="success" className="w-full">
                    {t("Try the live demo")}
                  </Button>
                </form>
              ) : (
                <LinkButton href="/signup" size="lg" variant="success">
                  {t("Get started")}
                </LinkButton>
              )}
              {!signedIn && (
                <LinkButton href={demo ? "/signup" : "/login"} variant="secondary" size="lg">
                  {demo ? t("Create account") : t("I already have an account")}
                </LinkButton>
              )}
            </div>
          </div>
        </section>

        <section className="border-y-2 border-line bg-ink-3/60 py-14">
          <div className="mx-auto max-w-5xl px-5">
            <h2 className="text-center font-display text-3xl font-black">{t("Real life is the game")}</h2>
            <ol className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {LOOP.map((s) => (
                <li key={s.title} className="flex flex-col items-center text-center">
                  {s.icon}
                  <h3 className="mt-3 text-lg font-black">{s.title}</h3>
                  <p className="mt-1 text-[15px] font-semibold text-muted">{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-5 py-14">
          <div className="flex items-start gap-4 rounded-3xl border-2 border-line p-6">
            <ShieldCheck className="h-10 w-10 shrink-0 text-green" aria-hidden />
            <div>
              <h2 className="font-display text-xl font-black">{t("Hard, never harmful")}</h2>
              <p className="mt-1 font-semibold text-muted">
                {t("Even Extreme challenges stay safe. PROOFIT blocks challenges that promote dangerous exercise, sleep deprivation, starvation, dehydration, substance use or self-harm.")}
              </p>
            </div>
          </div>

          <h2 className="mt-14 text-center font-display text-3xl font-black">{t("Simple pricing")}</h2>
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-3xl border-2 border-line p-6">
              <p className="font-display text-xl font-black">{t("Free")}</p>
              <p className="mt-1 font-display text-4xl font-black">{t("0 PLN")}</p>
              <ul className="mt-5 space-y-2 font-semibold text-muted">
                {[t("Up to {n} active challenges", { n: PLAN_LIMITS.free.maxActiveChallenges }), t("Duels, squads & leaderboards"), t("Achievements & streaks")].map((x) => (
                  <li key={x} className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green" strokeWidth={3} aria-hidden /> {x}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border-2 border-gold p-6">
              <p className="flex items-center gap-2 font-display text-xl font-black">
                <Crown className="h-5 w-5 text-gold" aria-hidden /> {t("Premium")}
              </p>
              <p className="mt-1 font-display text-4xl font-black">
                {PREMIUM_PRICE.amount.toFixed(2).replace(".", ",")} <span className="text-lg text-muted">{t("PLN / month")}</span>
              </p>
              <ul className="mt-5 space-y-2 font-semibold text-muted">
                {[t("Up to {n} active challenges", { n: PLAN_LIMITS.premium.maxActiveChallenges }), t("Advanced statistics"), t("Private squads & custom templates"), t("Extra profile customization")].map((x) => (
                  <li key={x} className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-gold" strokeWidth={3} aria-hidden /> {x}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t-2 border-line py-8 text-center text-sm font-semibold text-subtle">
        <Link href={signedIn ? "/dashboard" : "/login"} className="font-extrabold uppercase tracking-wide text-violet-2">
          {signedIn ? t("Dashboard") : t("Log in")}
        </Link>
        <p className="mt-2">PROOFIT · {t("Challenge. Compete. Win.")}</p>
      </footer>
    </div>
  );
}
