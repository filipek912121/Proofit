"use client";

import { useT } from "@/lib/i18n/client";

import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { Crown, LogOut, Zap } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { NavIcon, type NavIconName } from "@/components/brand/nav-icons";
import { StreakFlame } from "@/components/brand/streak-flame";
import { Avatar, avatarOf } from "@/components/ui/avatar";
import { cn } from "@/components/ui/cn";
import { ProgressBar } from "@/components/ui/progress";
import { BOTTOM_NAV, NAV, TAB_LABEL } from "./nav-items";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { ProxiAvatar } from "@/components/proxi/proxi-avatar";
import type { ProxiLook, ProxiStage } from "@/lib/proxi/config";

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
  streak: number;
}

/** Icon that bobs while its page loads — instant feedback on tap. */
function PendingIcon({ children }: { children: React.ReactNode }) {
  const { pending } = useLinkStatus();
  return <span className={cn("grid place-items-center transition-transform duration-150", pending && "animate-nav-pending scale-110")}>{children}</span>;
}

function useActive() {
  const pathname = usePathname();
  return (href: string) =>
    pathname === href ||
    pathname.startsWith(`${href}/`) ||
    (href === "/explore" && (pathname.startsWith("/challenges") || pathname.startsWith("/create"))) ||
    (href === "/friends" && ["/leaderboard", "/duels", "/squads", "/u/"].some((p) => pathname.startsWith(p))) ||
    (href === "/profile" && ["/settings", "/achievements", "/stats", "/premium"].some((p) => pathname.startsWith(p)));
}

function Badge({ n, label }: { n: number; label: string }) {
  if (n <= 0) return null;
  return (
    <span className="grid h-5 min-w-5 place-items-center rounded-full bg-red px-1.5 text-[11px] font-black text-white" aria-label={label}>
      {n > 9 ? "9+" : n}
    </span>
  );
}

export function Sidebar({ user, signOut, demo }: { user: ShellUser; signOut: () => Promise<void>; demo: boolean }) {
  const t = useT();
  const isActive = useActive();
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r-2 border-line bg-ink px-4 py-6 lg:flex">
      <Link href="/dashboard" className="mb-7 px-3" aria-label={t("PROOFIT home")}>
        <Logo />
      </Link>
      <nav aria-label={t("Main")} className="flex-1 space-y-1.5 overflow-y-auto no-scrollbar">
        {NAV.map((item) => {
          const active = isActive(item.href);
          const badge = item.href === "/review" ? user.reviewCount : item.href === "/notifications" ? user.notifCount : item.href === "/proxi" ? user.proxiNew : 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3.5 rounded-2xl border-2 px-3 py-2 text-[14px] font-extrabold uppercase tracking-[0.05em] transition-colors",
                active ? "border-violet/60 bg-violet-soft text-violet-2" : "border-transparent text-muted hover:bg-ink-3",
              )}
            >
              <PendingIcon>
                {item.icon === "proxi" ? <ProxiAvatar stage={user.proxiStage} look={user.proxiLook} mood="neutral" size={32} animate={false} /> : <NavIcon name={item.icon as NavIconName} size={30} />}
              </PendingIcon>
              <span className="flex-1 truncate">{t(item.label)}</span>
              <Badge n={badge} label={t("{n} pending", { n: badge })} />
            </Link>
          );
        })}
      </nav>

      <div className="mb-3 flex flex-wrap gap-2">
        <LanguageSwitcher />
        <ThemeSwitcher />
      </div>
      <Link href="/premium" className="tile mb-4 flex items-center gap-3 rounded-2xl p-3 text-sm">
        <Crown className="h-6 w-6 text-gold" aria-hidden />
        <span className="min-w-0">
          <span className="block font-extrabold">{user.isPremium ? t("Premium active") : t("Go Premium")}</span>
          <span className="block truncate text-xs text-subtle">{user.isPremium ? t("Thanks for your support") : t("More challenges & stats")}</span>
        </span>
      </Link>

      <div className="rounded-2xl border-2 border-line p-3">
        <div className="flex items-center gap-3">
          <Avatar {...avatarOf(user)} size={38} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-extrabold">{user.displayName}</p>
            <p className="text-xs font-bold text-subtle">
              {t("Lv {n}", { n: user.level })} · {user.xp} XP
            </p>
          </div>
          <form action={signOut}>
            <button className="rounded-lg p-2 text-subtle transition hover:bg-ink-3 hover:text-fg" aria-label={t("Log out")}>
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
        <ProgressBar value={user.levelProgress} className="mt-3 h-2.5" label={t("Level progress")} />
        {demo && <p className="mt-2 text-[10px] font-extrabold uppercase tracking-wider text-subtle">{t("Demo mode")}</p>}
      </div>
    </aside>
  );
}

/** Phone header: your vital signs at a glance (streak, XP, inbox) — like a game HUD. */
export function MobileTopBar({ user }: { user: ShellUser }) {
  const t = useT();
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b-2 border-line bg-ink px-4 lg:hidden">
      <Link href="/profile" className="tap flex items-center gap-1.5" aria-label={t("{n}-day streak", { n: user.streak })}>
        <StreakFlame size={24} lit={user.streak > 0} />
        <span className={cn("text-[17px] font-black tabular-nums", user.streak > 0 ? "text-flame" : "text-subtle")}>{user.streak}</span>
      </Link>
      <Link href="/profile" className="tap flex items-center gap-1" aria-label={`${user.xp} XP`}>
        <Zap className="h-5 w-5 fill-gold text-gold" aria-hidden />
        <span className="text-[17px] font-black tabular-nums text-gold-dark">{user.xp}</span>
      </Link>
      <Link href="/create" className="tap" aria-label={t("Create challenge")}>
        <NavIcon name="create" size={28} />
      </Link>
      <Link href="/notifications" className="tap relative" aria-label={`${t("Notifications")}${user.notifCount ? `, ${t("{n} pending", { n: user.notifCount })}` : ""}`}>
        <NavIcon name="bell" size={28} />
        {user.notifCount > 0 && (
          <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-red px-1 text-[10px] font-black text-white ring-2 ring-ink animate-pop">
            {user.notifCount > 9 ? "9+" : user.notifCount}
          </span>
        )}
      </Link>
    </header>
  );
}

export function BottomNav({ user }: { user: ShellUser }) {
  const t = useT();
  const isActive = useActive();
  return (
    <nav aria-label={t("Primary")} className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t-2 border-line bg-ink lg:hidden">
      <ul className="mx-auto grid max-w-md grid-cols-5 gap-1 px-2 pt-1.5">
        {BOTTOM_NAV.map((href) => {
          const item = NAV.find((n) => n.href === href)!;
          const active = isActive(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-label={href === "/proxi" ? t("Your PROXI") : undefined}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex flex-col items-center gap-0.5 rounded-2xl border-2 py-1 text-[10px] font-extrabold uppercase tracking-wide transition-colors",
                  active ? "border-violet/50 bg-violet-soft text-violet-2" : "border-transparent text-subtle",
                )}
              >
                <PendingIcon>
                  {href === "/proxi" ? (
                    <span className="block h-[30px] w-[30px] overflow-hidden">
                      <ProxiAvatar stage={user.proxiStage} look={user.proxiLook} mood={active ? "happy" : "neutral"} size={30} animate={false} />
                    </span>
                  ) : (
                    <NavIcon name={item.icon as NavIconName} size={28} />
                  )}
                </PendingIcon>
                <span aria-hidden={href === "/proxi" || undefined}>{t(TAB_LABEL[href])}</span>
                {href === "/proxi" && user.proxiNew > 0 && <span className="absolute right-2 top-1 h-2.5 w-2.5 rounded-full bg-red ring-2 ring-ink" aria-label={t("New")} />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
