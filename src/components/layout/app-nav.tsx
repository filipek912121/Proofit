"use client";

import { useT } from "@/lib/i18n/client";

import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import {
  Award,
  Bell,
  Bot,
  CirclePlus,
  Compass,
  Crown,
  House,
  LogOut,
  type LucideIcon,
  ShieldCheck,
  Swords,
  Trophy,
  User,
  Users,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Avatar, avatarOf } from "@/components/ui/avatar";
import { cn } from "@/components/ui/cn";
import { ProgressBar } from "@/components/ui/progress";
import { BOTTOM_NAV, NAV } from "./nav-items";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { ProxiAvatar } from "@/components/proxi/proxi-avatar";
import type { ProxiLook, ProxiStage } from "@/lib/proxi/config";

const ICONS: Record<string, LucideIcon> = { House, Compass, CirclePlus, Swords, Users, Trophy, Award, ShieldCheck, User, Bot, Bell };

export interface ShellUser {
  displayName: string;
  username: string;
  avatarColor: string;
  avatarUrl: string | null;
  avatarFrame: string;
  level: number;
  levelProgress: number;
  xp: number;
  isPremium: boolean;
  reviewCount: number;
  inviteCount: number;
  /** Unread notifications (invites, duel invites, PROXI news). */
  notifCount: number;
  proxiStage: ProxiStage;
  proxiLook: ProxiLook;
  /** PROXI evolved or has new looks waiting. */
  proxiNew: number;
}

/** Icon that pulses while its link's page is loading — instant feedback on tap. */
function NavIcon({ I, className }: { I: LucideIcon; className?: string }) {
  const { pending } = useLinkStatus();
  return <I className={cn(className, "transition-transform duration-200", pending && "animate-nav-pending scale-110")} aria-hidden />;
}

function useActive() {
  const pathname = usePathname();
  return (href: string) =>
    pathname === href ||
    pathname.startsWith(`${href}/`) ||
    (href === "/explore" && pathname.startsWith("/challenges")) ||
    (href === "/profile" && pathname.startsWith("/settings"));
}

export function Sidebar({ user, signOut, demo }: { user: ShellUser; signOut: () => Promise<void>; demo: boolean }) {
  const t = useT();
  const isActive = useActive();
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-line bg-ink/70 px-4 py-6 backdrop-blur-xl lg:flex">
      <Link href="/dashboard" className="mb-8 px-2" aria-label={t("PROOFIT home")}>
        <Logo />
      </Link>
      <nav aria-label={t("Main")} className="flex-1 space-y-1 overflow-y-auto no-scrollbar">
        {NAV.map((item) => {
          const I = ICONS[item.icon];
          const active = isActive(item.href);
          const badge = item.href === "/review" ? user.reviewCount : item.href === "/notifications" ? user.notifCount : item.href === "/proxi" ? user.proxiNew : 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all",
                active ? "bg-violet/12 text-fg" : "text-muted hover:bg-tint/5 hover:text-fg",
              )}
            >
              {active && <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-violet" />}
              <NavIcon I={I} className={cn("h-[18px] w-[18px] transition-colors", active ? "text-violet-2" : "group-hover:text-fg")} />
              {t(item.label)}
              {badge > 0 && (
                <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-violet px-1.5 text-[10px] font-bold text-white" aria-label={t("{n} pending", { n: badge })}>
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mb-3 flex flex-wrap gap-2">
        <LanguageSwitcher />
        <ThemeSwitcher />
      </div>
      <Link
        href="/premium"
        className={cn(
          "mb-4 flex items-center gap-3 rounded-2xl p-3 text-sm transition",
          user.isPremium ? "bg-gold/10 ring-1 ring-gold/25" : "bg-violet/10 ring-1 ring-violet/25 hover:ring-violet/50",
        )}
      >
        <Crown className={cn("h-5 w-5", user.isPremium ? "text-gold" : "text-violet-2")} aria-hidden />
        <div>
          <p className="font-semibold">{user.isPremium ? t("Premium active") : t("Go Premium")}</p>
          <p className="text-xs text-muted">{user.isPremium ? t("Thanks for your support") : t("More challenges & stats")}</p>
        </div>
      </Link>

      <div className="rounded-2xl bg-tint/[0.03] p-3 ring-1 ring-line">
        <div className="flex items-center gap-3">
          <Avatar {...avatarOf(user)} size={38} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{user.displayName}</p>
            <p className="text-xs text-muted">
              {t("Lv {n}", { n: user.level })} · {user.xp} XP
            </p>
          </div>
          <form action={signOut}>
            <button className="rounded-lg p-2 text-subtle transition hover:bg-tint/5 hover:text-fg" aria-label={t("Log out")}>
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
        <ProgressBar value={user.levelProgress} className="mt-3 h-1.5" label={t("Level progress")} />
        {demo && <p className="mt-2 text-[10px] uppercase tracking-wider text-subtle">{t("Demo mode")}</p>}
      </div>
    </aside>
  );
}

export function MobileTopBar({ user }: { user: ShellUser }) {
  const t = useT();
  return (
    <header className="glass-strong sticky top-0 z-40 flex h-14 items-center justify-between border-x-0 border-t-0 px-4 lg:hidden">
      <Link href="/dashboard" aria-label={t("PROOFIT home")}>
        <Logo size={26} />
      </Link>
      <div className="flex items-center gap-1">
        <Link href="/create" className="tap rounded-xl p-2 text-muted hover:text-fg" aria-label={t("Create challenge")}>
          <CirclePlus className="h-[22px] w-[22px]" />
        </Link>
        <Link href="/notifications" className="tap relative rounded-xl p-2 text-muted hover:text-fg" aria-label={`${t("Notifications")}${user.notifCount ? `, ${t("{n} pending", { n: user.notifCount })}` : ""}`}>
          <Bell className="h-[22px] w-[22px]" />
          {user.notifCount > 0 && (
            <span className="absolute right-0.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-extreme px-1 text-[10px] font-bold text-white animate-pop">{user.notifCount > 9 ? "9+" : user.notifCount}</span>
          )}
        </Link>
      </div>
    </header>
  );
}

export function BottomNav({ user }: { user: ShellUser }) {
  const t = useT();
  const isActive = useActive();
  const activeIndex = BOTTOM_NAV.findIndex((h) => isActive(h));
  return (
    <nav aria-label={t("Primary")} className="glass-strong pb-safe fixed inset-x-0 bottom-0 z-40 border-x-0 border-b-0 lg:hidden">
      <ul className="relative mx-auto grid max-w-md grid-cols-5 px-2 pt-1.5">
        {/* Sliding active indicator (hidden when PROXI, the centre button, is active) */}
        {activeIndex >= 0 && BOTTOM_NAV[activeIndex] !== "/proxi" && (
          <span
            className="pointer-events-none absolute top-1.5 h-7 rounded-full bg-violet/15 transition-transform duration-300 ease-out"
            style={{ width: "calc((100% - 1rem) / 5 - 1.5rem)", left: "calc(0.5rem + 0.75rem)", transform: `translateX(calc(${activeIndex} * (100% + 1.5rem)))` }}
            aria-hidden
          />
        )}
        {BOTTOM_NAV.map((href) => {
          const item = NAV.find((n) => n.href === href)!;
          const I = ICONS[item.icon];
          const active = isActive(href);
          if (href === "/proxi")
            return (
              <li key={href} className="flex justify-center">
                <Link
                  href={href}
                  aria-label={t("Your PROXI")}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "tap relative -mt-6 grid h-16 w-16 place-items-center overflow-hidden rounded-full bg-ink-2 ring-4 ring-ink transition-shadow",
                    active ? "shadow-[0_0_0_2px_var(--color-violet)]" : "shadow-[0_8px_24px_-8px_rgb(0_0_0/0.5)]",
                  )}
                >
                  <span className="pointer-events-none mt-3" aria-hidden>
                    <ProxiAvatar stage={user.proxiStage} look={user.proxiLook} mood={active ? "happy" : "neutral"} size={56} animate={active} />
                  </span>
                  {user.proxiNew > 0 && <span className="absolute right-2 top-2 h-3 w-3 rounded-full bg-extreme ring-2 ring-ink-2" aria-label={t("New")} />}
                </Link>
              </li>
            );
          return (
            <li key={href}>
              <Link href={href} aria-current={active ? "page" : undefined} className={cn("relative flex flex-col items-center gap-1 rounded-xl py-1.5 text-[10px] font-medium transition-colors", active ? "text-fg" : "text-subtle")}>
                <span className="grid h-7 w-12 place-items-center">
                  <NavIcon I={I} className={cn("h-5 w-5 transition-transform duration-300", active && "scale-110 text-violet-2")} />
                </span>
                {t(item.label)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
