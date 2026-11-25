import { CATEGORY_META } from "@/lib/config/taxonomy";
import type { Category } from "@/lib/types";

/**
 * PROOFIT category glyphs: flat, geometric, drawn on a 48×48 grid with chunky
 * rounded strokes so they read at 20px and at 96px. White on the category colour,
 * with a darker "lip" at the bottom of the tile — the same depth language as buttons.
 */
const W = "#ffffff";
const GLYPHS: Record<Category, (dark: string) => React.ReactNode> = {
  fitness: () => (
    <g fill={W}>
      <rect x="10" y="17" width="6" height="14" rx="2" />
      <rect x="32" y="17" width="6" height="14" rx="2" />
      <rect x="6" y="20" width="4" height="8" rx="1.5" />
      <rect x="38" y="20" width="4" height="8" rx="1.5" />
      <rect x="16" y="22" width="16" height="4" rx="1" />
    </g>
  ),
  health: () => <path fill={W} d="M24 37s-12-7.2-12-15.5A6.5 6.5 0 0 1 24 18a6.5 6.5 0 0 1 12 3.5C36 29.8 24 37 24 37Z" />,
  creativity: (dark) => (
    <g>
      <path fill={W} d="m29.5 11.5 7 7L19 36l-8.5 1.5L12 29Z" />
      <path fill={dark} d="m29.5 11.5 7 7-3 3-7-7Z" opacity="0.35" />
      <circle cx="35.5" cy="34.5" r="3" fill={W} />
    </g>
  ),
  music: () => (
    <g fill={W}>
      <path d="M20 14.5 36 11v19h-4V16.2l-8 1.7V33h-4Z" />
      <ellipse cx="17" cy="33" rx="5" ry="4" />
      <ellipse cx="29" cy="30" rx="5" ry="4" />
    </g>
  ),
  discipline: (dark) => (
    <g>
      <circle cx="24" cy="26" r="11" fill={W} />
      <path d="M24 20v6l4 3" stroke={dark} strokeWidth="3" strokeLinecap="round" fill="none" />
      <circle cx="14" cy="14" r="4" fill={W} />
      <circle cx="34" cy="14" r="4" fill={W} />
    </g>
  ),
  learning: (dark) => (
    <g>
      <path fill={W} d="M8 15c6-2 11-1 16 2v20c-5-3-10-4-16-2Z" />
      <path fill={W} d="M40 15c-6-2-11-1-16 2v20c5-3 10-4 16-2Z" opacity="0.85" />
      <path d="M24 17v20" stroke={dark} strokeWidth="1.5" />
    </g>
  ),
  mindfulness: () => <path fill={W} d="M30 10a14 14 0 1 0 8 25A12 12 0 0 1 30 10Z" />,
  lifestyle: (dark) => (
    <g>
      <path fill={W} d="M37 11C21 11 11 19 13 35c14 1 24-7 24-24Z" />
      <path d="M13 35c5-8 11-13 18-17" stroke={dark} strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </g>
  ),
  productivity: (dark) => (
    <g>
      <circle cx="24" cy="24" r="13" fill={W} />
      <circle cx="24" cy="24" r="8" fill={dark} />
      <circle cx="24" cy="24" r="4" fill={W} />
    </g>
  ),
  money: (dark) => (
    <g>
      <circle cx="24" cy="24" r="13" fill={W} />
      <path d="M24 16v16M28 19.5c-1-1.3-2.4-2-4-2-2.2 0-4 1.2-4 3s1.8 2.6 4 3.2 4 1.4 4 3.3-1.8 3-4 3c-1.7 0-3.2-.7-4.2-2" stroke={dark} strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </g>
  ),
  social: () => (
    <g fill={W}>
      <circle cx="18" cy="18" r="5" />
      <circle cx="31" cy="18" r="5" />
      <path d="M9 35c0-6 4-9.5 9-9.5s9 3.5 9 9.5Z" />
      <path d="M24 35c.4-4.4 3-8 7-8s8 3.5 8 8Z" opacity="0.85" />
    </g>
  ),
  custom: () => <path fill={W} d="M24 9c1.2 7.6 5.4 11.8 13 13-7.6 1.2-11.8 5.4-13 13-1.2-7.6-5.4-11.8-13-13 7.6-1.2 11.8-5.4 13-13Z" />,
};

export function CategoryIcon({ category, size = 44, className }: { category: Category; size?: number; className?: string }) {
  const m = CATEGORY_META[category] ?? CATEGORY_META.custom;
  const glyph = GLYPHS[category] ?? GLYPHS.custom;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden>
      <rect x="0" y="0" width="48" height="48" rx="14" fill={m.dark} />
      <rect x="0" y="0" width="48" height="44" rx="14" fill={m.color} />
      <g transform="translate(0 -1.5)">{glyph(m.dark)}</g>
    </svg>
  );
}
