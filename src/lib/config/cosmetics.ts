/**
 * Profile decorations unlocked by level. Purely cosmetic; the server checks
 * the level (and Premium for premium-only items) before saving a choice.
 */
export interface Cosmetic {
  id: string;
  name: string;
  minLevel: number;
  premium?: boolean;
}

export const AVATAR_FRAMES: (Cosmetic & { className: string })[] = [
  { id: "none", name: "No frame", minLevel: 1, className: "" },
  { id: "neon", name: "Neon", minLevel: 3, className: "frame-neon" },
  { id: "fire", name: "Fire", minLevel: 5, className: "frame-fire" },
  { id: "ice", name: "Ice", minLevel: 8, className: "frame-ice" },
  { id: "gold", name: "Gold", minLevel: 10, className: "frame-gold" },
  { id: "cosmic", name: "Cosmic", minLevel: 15, className: "frame-cosmic" },
  { id: "legend", name: "Legend", minLevel: 25, className: "frame-legend" },
  { id: "aurora", name: "Aurora", minLevel: 1, premium: true, className: "frame-aurora" },
];

export const PROFILE_BANNERS: (Cosmetic & { style: string })[] = [
  { id: "default", name: "Classic", minLevel: 1, style: "linear-gradient(120deg, var(--banner-accent, #8b5cf6) 0%, transparent 70%)" },
  { id: "sunset", name: "Sunset", minLevel: 2, style: "linear-gradient(120deg, #f97316 0%, #ec4899 45%, transparent 80%)" },
  { id: "ocean", name: "Ocean", minLevel: 4, style: "linear-gradient(120deg, #0ea5e9 0%, #22d3ee 40%, transparent 80%)" },
  { id: "forest", name: "Forest", minLevel: 6, style: "linear-gradient(120deg, #16a34a 0%, #84cc16 40%, transparent 80%)" },
  { id: "galaxy", name: "Galaxy", minLevel: 12, style: "radial-gradient(circle at 20% 30%, #a855f7 0%, transparent 40%), radial-gradient(circle at 70% 10%, #3b82f6 0%, transparent 40%), linear-gradient(120deg, #1e1b4b, transparent 85%)" },
  { id: "champion", name: "Champion", minLevel: 20, style: "linear-gradient(120deg, #fbbf24 0%, #f59e0b 30%, #7c3aed 70%, transparent 95%)" },
  { id: "midnight", name: "Midnight", minLevel: 1, premium: true, style: "linear-gradient(120deg, #312e81 0%, #6d28d9 40%, #db2777 75%, transparent 100%)" },
];

export function frameClass(id: string | null | undefined): string {
  return AVATAR_FRAMES.find((f) => f.id === id)?.className ?? "";
}

export function bannerStyle(id: string | null | undefined, accent: string): string {
  const b = PROFILE_BANNERS.find((x) => x.id === id) ?? PROFILE_BANNERS[0];
  return b.style.replace("var(--banner-accent, #8b5cf6)", accent);
}

export function isUnlocked(c: Cosmetic, level: number, isPremium: boolean): boolean {
  return level >= c.minLevel && (!c.premium || isPremium);
}
