import type { Category, Difficulty } from "@/lib/types";
import { XP_RULES } from "./game";

export const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard", "extreme"];

export const DIFFICULTY_META: Record<
  Difficulty,
  { label: string; blurb: string; text: string; bg: string; ring: string; dot: string; glow: string }
> = {
  easy: {
    label: "Easy",
    blurb: "Beginner-friendly",
    text: "text-easy",
    bg: "bg-easy/12",
    ring: "ring-easy/35",
    dot: "bg-easy",
    glow: "shadow-[0_0_24px_-6px_var(--color-easy)]",
  },
  medium: {
    label: "Medium",
    blurb: "Moderate effort",
    text: "text-medium",
    bg: "bg-medium/12",
    ring: "ring-medium/35",
    dot: "bg-medium",
    glow: "shadow-[0_0_24px_-6px_var(--color-medium)]",
  },
  hard: {
    label: "Hard",
    blurb: "Serious commitment",
    text: "text-hard",
    bg: "bg-hard/12",
    ring: "ring-hard/35",
    dot: "bg-hard",
    glow: "shadow-[0_0_24px_-6px_var(--color-hard)]",
  },
  extreme: {
    label: "Extreme",
    blurb: "Advanced — but always safe",
    text: "text-extreme",
    bg: "bg-extreme/12",
    ring: "ring-extreme/35",
    dot: "bg-extreme",
    glow: "shadow-[0_0_24px_-6px_var(--color-extreme)]",
  },
};

export function xpRangeLabel(d: Difficulty) {
  const r = XP_RULES.difficultyRange[d];
  return `${r.min}–${r.max} XP`;
}

/** Display order: the everyday "mission worlds" first, legacy categories after. */
export const CATEGORIES: Category[] = [
  "fitness",
  "health",
  "creativity",
  "music",
  "discipline",
  "learning",
  "mindfulness",
  "lifestyle",
  "productivity",
  "money",
  "social",
  "custom",
];

/** Each category is a small world: its own colour + hand-drawn glyph (see components/brand/category-icon). */
export const CATEGORY_META: Record<Category, { label: string; icon: string; color: string; dark: string }> = {
  fitness: { label: "Fitness", icon: "Dumbbell", color: "#ff8a1f", dark: "#e06a00" },
  health: { label: "Health", icon: "Heart", color: "#ff4f5e", dark: "#d93241" },
  creativity: { label: "Creativity", icon: "Pencil", color: "#ff5fae", dark: "#e03d8f" },
  music: { label: "Music", icon: "Music", color: "#7b5cff", dark: "#5a3ee0" },
  discipline: { label: "Discipline", icon: "AlarmClock", color: "#475472", dark: "#323d57" },
  learning: { label: "Learning", icon: "BookOpen", color: "#1e9bf0", dark: "#0b7bc8" },
  mindfulness: { label: "Mindfulness", icon: "Moon", color: "#11b5c9", dark: "#0a91a3" },
  lifestyle: { label: "Lifestyle", icon: "Leaf", color: "#3cc13b", dark: "#2a9a29" },
  productivity: { label: "Productivity", icon: "Target", color: "#ffb81c", dark: "#e09400" },
  money: { label: "Money habits", icon: "Wallet", color: "#20b07a", dark: "#14895d" },
  social: { label: "Social", icon: "HeartHandshake", color: "#ff7a59", dark: "#e0573a" },
  custom: { label: "Custom", icon: "Sparkles", color: "#8a90a2", dark: "#6b7184" },
};

export function isDifficulty(v: unknown): v is Difficulty {
  return typeof v === "string" && (DIFFICULTIES as string[]).includes(v);
}
export function isCategory(v: unknown): v is Category {
  return typeof v === "string" && (CATEGORIES as string[]).includes(v);
}
