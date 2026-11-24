import { getT } from "@/lib/i18n/server";
import { Award, ChartColumn, ChevronRight, Crown, Languages, LogOut, Palette, Settings, ShieldCheck, type LucideIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProfileView } from "@/components/social/profile-view";
import { ReferralCard } from "@/components/social/referral-card";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Card, SectionTitle } from "@/components/ui/card";
import { signOutAction } from "@/lib/actions/auth";
import { requireUser } from "@/lib/auth";
import { profileOverview } from "@/lib/services/profile";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("Profile") };
}

function Row({ href, icon: I, label, hint, tone }: { href: string; icon: LucideIcon; label: string; hint?: string; tone?: string }) {
  return (
    <Link href={href} className="tap flex items-center gap-3 px-4 py-3.5 hover:bg-tint/[0.03]">
      <span className={`grid h-9 w-9 place-items-center rounded-xl bg-tint/[0.05] ring-1 ring-line ${tone ?? "text-muted"}`}>
        <I className="h-[18px] w-[18px]" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{label}</span>
        {hint && <span className="block truncate text-xs text-subtle">{hint}</span>}
      </span>
      <ChevronRight className="h-4 w-4 text-subtle" aria-hidden />
    </Link>
  );
}

export default async function ProfilePage() {
  const t = await getT();
  const me = await requireUser();
  const o = await profileOverview(me.id, me.id);
  if (!o) notFound();
  return (
    <>
      <ProfileView o={o} />
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ReferralCard userId={me.id} username={me.username} />
        <section>
          <SectionTitle title={t("Account")} />
          <Card className="divide-y divide-line overflow-hidden">
            <Row href="/settings" icon={Settings} label={t("Edit profile")} hint={t("Photo, frame, background and name")} />
            <Row href="/achievements" icon={Award} label={t("Achievements")} tone="text-gold" />
            <Row href="/stats" icon={o.isPremium ? ChartColumn : Crown} label={t("Advanced stats")} hint={o.isPremium ? undefined : t("Premium feature")} tone="text-violet-2" />
            <Row href="/premium" icon={Crown} label={o.isPremium ? t("Manage Premium") : t("Go Premium")} tone="text-gold" />
            <Row href="/review" icon={ShieldCheck} label={t("Verify proofs")} />
            <div className="flex items-center gap-3 px-4 py-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-tint/[0.05] text-muted ring-1 ring-line">
                <Languages className="h-[18px] w-[18px]" aria-hidden />
              </span>
              <span className="flex-1 text-sm font-semibold">{t("Language")}</span>
              <LanguageSwitcher />
            </div>
            <div className="flex items-center gap-3 px-4 py-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-tint/[0.05] text-muted ring-1 ring-line">
                <Palette className="h-[18px] w-[18px]" aria-hidden />
              </span>
              <span className="flex-1 text-sm font-semibold">{t("Theme")}</span>
              <ThemeSwitcher />
            </div>
            <form action={signOutAction}>
              <button className="tap flex w-full items-center gap-3 px-4 py-3.5 text-left text-red-300 hover:bg-extreme/5">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-extreme/10 ring-1 ring-extreme/25">
                  <LogOut className="h-[18px] w-[18px]" aria-hidden />
                </span>
                <span className="text-sm font-semibold">{t("Log out")}</span>
              </button>
            </form>
          </Card>
        </section>
      </div>
    </>
  );
}
