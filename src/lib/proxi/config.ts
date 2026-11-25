/**
 * PROXI — evolution stages, wardrobe catalogue and unlock rules.
 * Stages follow the existing XP level system (lib/engine/levels.ts).
 */
export type ProxiStage = 1 | 2 | 3 | 4;
export type ProxiSlot = "color" | "eyes" | "face" | "head" | "aura";

export const STAGES: { stage: ProxiStage; key: string; name: string; minLevel: number; color: string; tagline: string }[] = [
  { stage: 1, key: "rookie", name: "ROOKIE", minLevel: 1, color: "#a78bfa", tagline: "Just booted up. Ready to learn." },
  { stage: 2, key: "pro", name: "PRO", minLevel: 5, color: "#38bdf8", tagline: "Upgraded armour and a confident attitude." },
  { stage: 3, key: "elite", name: "ELITE", minLevel: 10, color: "#22d3ee", tagline: "Hover jets, circuits and a glowing aura." },
  { stage: 4, key: "legend", name: "LEGEND", minLevel: 20, color: "#fbbf24", tagline: "Golden chrome. The rarest PROXI there is." },
];

export function stageForLevel(level: number): ProxiStage {
  return [...STAGES].reverse().find((s) => level >= s.minLevel)!.stage;
}
export const stageInfo = (s: ProxiStage) => STAGES[s - 1];

/** What a user has achieved — everything an unlock rule can check. */
export interface ProxiStats {
  level: number;
  checkins: number;
  challengesCompleted: number;
  achievements: string[];
  isPremium: boolean;
}

export type UnlockRule =
  | { type: "default" }
  | { type: "level"; value: number }
  | { type: "checkins"; value: number }
  | { type: "completed"; value: number }
  | { type: "achievement"; id: string }
  | { type: "premium" };

export interface ProxiItem {
  id: string;
  slot: ProxiSlot;
  name: string;
  rule: UnlockRule;
}

export const PROXI_ITEMS: ProxiItem[] = [
  // Body colour schemes
  { id: "color-classic", slot: "color", name: "Classic", rule: { type: "default" } },
  { id: "color-midnight", slot: "color", name: "Midnight blue", rule: { type: "level", value: 5 } },
  { id: "color-sunset", slot: "color", name: "Sunset", rule: { type: "checkins", value: 10 } },
  { id: "color-chrome", slot: "color", name: "Chrome", rule: { type: "level", value: 10 } },
  { id: "color-gold", slot: "color", name: "Gold", rule: { type: "level", value: 20 } },
  { id: "color-aurora", slot: "color", name: "Aurora", rule: { type: "premium" } },
  // Eye colours
  { id: "eyes-cyan", slot: "eyes", name: "Cyan", rule: { type: "default" } },
  { id: "eyes-lime", slot: "eyes", name: "Lime", rule: { type: "level", value: 3 } },
  { id: "eyes-magenta", slot: "eyes", name: "Magenta", rule: { type: "completed", value: 3 } },
  { id: "eyes-gold", slot: "eyes", name: "Gold", rule: { type: "achievement", id: "duel_winner" } },
  // Face accessories
  { id: "face-none", slot: "face", name: "None", rule: { type: "default" } },
  { id: "face-glasses", slot: "face", name: "Neon glasses", rule: { type: "level", value: 2 } },
  { id: "face-shades", slot: "face", name: "Cyber shades", rule: { type: "achievement", id: "streak_7" } },
  // Headwear
  { id: "head-none", slot: "head", name: "None", rule: { type: "default" } },
  { id: "head-cap", slot: "head", name: "Cap", rule: { type: "achievement", id: "first_challenge" } },
  { id: "head-headphones", slot: "head", name: "Headphones", rule: { type: "checkins", value: 5 } },
  { id: "head-halo", slot: "head", name: "Halo", rule: { type: "achievement", id: "challenge_master" } },
  { id: "head-crown", slot: "head", name: "Crown", rule: { type: "level", value: 20 } },
  // Light effects
  { id: "aura-none", slot: "aura", name: "None", rule: { type: "default" } },
  { id: "aura-sparks", slot: "aura", name: "Sparks", rule: { type: "level", value: 8 } },
  { id: "aura-flames", slot: "aura", name: "Flames", rule: { type: "achievement", id: "streak_30" } },
  { id: "aura-rainbow", slot: "aura", name: "Rainbow", rule: { type: "premium" } },
];

export const SLOTS: { slot: ProxiSlot; name: string }[] = [
  { slot: "color", name: "Colour" },
  { slot: "eyes", name: "Eyes" },
  { slot: "face", name: "Face" },
  { slot: "head", name: "Head" },
  { slot: "aura", name: "Light effect" },
];

export type ProxiLook = Record<ProxiSlot, string>;
export const DEFAULT_LOOK: ProxiLook = { color: "color-classic", eyes: "eyes-cyan", face: "face-none", head: "head-none", aura: "aura-none" };

export function meetsRule(rule: UnlockRule, s: ProxiStats): boolean {
  switch (rule.type) {
    case "default":
      return true;
    case "level":
      return s.level >= rule.value;
    case "checkins":
      return s.checkins >= rule.value;
    case "completed":
      return s.challengesCompleted >= rule.value;
    case "achievement":
      return s.achievements.includes(rule.id);
    case "premium":
      return s.isPremium;
  }
}

/** Normalises a stored look: unknown or wrong-slot ids fall back to defaults. */
export function sanitizeLook(look: Partial<Record<string, unknown>> | null | undefined): ProxiLook {
  const out = { ...DEFAULT_LOOK };
  for (const { slot } of SLOTS) {
    const id = look?.[slot];
    if (typeof id === "string" && PROXI_ITEMS.some((i) => i.id === id && i.slot === slot)) out[slot] = id;
  }
  return out;
}

export const BODY_COLORS: Record<string, { shell: string; shade: string; trim: string; visor: string }> = {
  "color-classic": { shell: "#efecff", shade: "#c4b8ff", trim: "#8b5cf6", visor: "#120f2a" },
  "color-midnight": { shell: "#dbe3ff", shade: "#8b9cf6", trim: "#4f46e5", visor: "#0a0f24" },
  "color-sunset": { shell: "#ffe8ea", shade: "#fda4af", trim: "#f97316", visor: "#1f0d16" },
  "color-chrome": { shell: "#f4f6fa", shade: "#9aa6b8", trim: "#475569", visor: "#0d1320" },
  "color-gold": { shell: "#fff4d1", shade: "#f5c04a", trim: "#b45309", visor: "#1a1206" },
  "color-aurora": { shell: "#e6fffa", shade: "#7dd3fc", trim: "#a855f7", visor: "#0b1222" },
};

export const EYE_COLORS: Record<string, string> = {
  "eyes-cyan": "#67e8f9",
  "eyes-lime": "#bef264",
  "eyes-magenta": "#f472b6",
  "eyes-gold": "#fcd34d",
};
