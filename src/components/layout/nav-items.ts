/** Sidebar (desktop) — grouped so related screens sit together. */
export const NAV = [
  { href: "/dashboard", label: "Home", icon: "House" },
  { href: "/proxi", label: "Your PROXI", icon: "Bot" },
  { href: "/explore", label: "Explore", icon: "Compass" },
  { href: "/create", label: "Create", icon: "CirclePlus" },
  { href: "/leaderboard", label: "Rankings", icon: "Trophy" },
  { href: "/duels", label: "Duels", icon: "Swords" },
  { href: "/squads", label: "Squads", icon: "Users" },
  { href: "/notifications", label: "Notifications", icon: "Bell" },
  { href: "/achievements", label: "Achievements", icon: "Award" },
  { href: "/review", label: "Verify proofs", icon: "ShieldCheck" },
  { href: "/profile", label: "Profile", icon: "User" },
] as const;

/** Mobile tab bar: PROXI takes the centre spot as the face of the app. */
export const BOTTOM_NAV = ["/dashboard", "/explore", "/proxi", "/leaderboard", "/profile"] as const;
