import type { NavIconName } from "@/components/brand/nav-icons";

/**
 * Information architecture: five worlds.
 *  Today      — what to do now (home)
 *  Challenges — find, start and create missions
 *  Friends    — crew, duels, squads and the weekly league
 *  PROXI      — your companion
 *  Profile    — you, achievements and settings
 */
export const NAV: { href: string; label: string; icon: NavIconName; desktopOnly?: boolean }[] = [
  { href: "/dashboard", label: "Today", icon: "today" },
  { href: "/explore", label: "Challenges", icon: "challenges" },
  { href: "/friends", label: "Friends", icon: "friends" },
  { href: "/proxi", label: "Your PROXI", icon: "proxi" },
  { href: "/profile", label: "Profile", icon: "profile" },
  { href: "/create", label: "Create", icon: "create", desktopOnly: true },
  { href: "/notifications", label: "Notifications", icon: "bell", desktopOnly: true },
  { href: "/achievements", label: "Achievements", icon: "award", desktopOnly: true },
  { href: "/review", label: "Verify proofs", icon: "shield", desktopOnly: true },
];

export const BOTTOM_NAV = ["/dashboard", "/explore", "/proxi", "/friends", "/profile"] as const;

/** Short tab labels for the phone tab bar. */
export const TAB_LABEL: Record<string, string> = {
  "/dashboard": "Today",
  "/explore": "Challenges",
  "/friends": "Friends",
  "/proxi": "PROXI",
  "/profile": "Profile",
};
