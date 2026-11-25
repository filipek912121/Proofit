/**
 * Tab bar icons: small flat illustrations (not outline glyphs) so every tab is
 * recognisable by colour and shape alone. 32×32 grid, solid fills, darker lips.
 */
export type NavIconName = "today" | "challenges" | "friends" | "proxi" | "profile" | "create" | "bell" | "trophy" | "shield" | "award";

export function NavIcon({ name, size = 30, muted = false }: { name: NavIconName; size?: number; muted?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden style={muted ? { filter: "grayscale(0.35)", opacity: 0.9 } : undefined}>
      {ICONS[name]}
    </svg>
  );
}

const ICONS: Record<NavIconName, React.ReactNode> = {
  // Home with a lit window: "today"
  today: (
    <g>
      <path d="M5 15 16 5l11 10v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2Z" fill="#ff8a1f" />
      <path d="M3.5 15.5 16 4l12.5 11.5" stroke="#e05a00" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x="12.5" y="17" width="7" height="11" rx="1.5" fill="#ffd28a" />
      <circle cx="18" cy="23" r="1" fill="#e05a00" />
    </g>
  ),
  // Mission flag on a hill
  challenges: (
    <g>
      <path d="M3 28c3-5 8-7 13-7s10 2 13 7Z" fill="#3cc13b" />
      <rect x="14.5" y="4" width="3" height="20" rx="1.5" fill="#475472" />
      <path d="M17.5 5h9.5l-2.5 4 2.5 4h-9.5Z" fill="#ff4f5e" />
    </g>
  ),
  // Two friends
  friends: (
    <g>
      <circle cx="21.5" cy="11" r="4.5" fill="#1e9bf0" />
      <path d="M13 27c0-5 3.8-8.5 8.5-8.5S30 22 30 27Z" fill="#1e9bf0" />
      <circle cx="11" cy="12" r="5" fill="#ffb81c" />
      <path d="M2 28c0-5.5 4-9 9-9s9 3.5 9 9Z" fill="#ffb81c" />
    </g>
  ),
  // PROXI's head (simplified)
  proxi: (
    <g>
      <rect x="15" y="2" width="2" height="5" rx="1" fill="#5a3ee0" />
      <circle cx="16" cy="3" r="2.2" fill="#ffb81c" />
      <rect x="4" y="7" width="24" height="20" rx="8" fill="#7b5cff" />
      <rect x="7.5" y="11" width="17" height="11" rx="5" fill="#1d2130" />
      <circle cx="12.5" cy="16.5" r="2.2" fill="#6ff3ff" />
      <circle cx="19.5" cy="16.5" r="2.2" fill="#6ff3ff" />
    </g>
  ),
  profile: (
    <g>
      <circle cx="16" cy="11" r="6" fill="#ff5fae" />
      <path d="M5 28c0-6.5 5-10.5 11-10.5S27 21.5 27 28Z" fill="#7b5cff" />
    </g>
  ),
  create: (
    <g>
      <rect x="3" y="3" width="26" height="26" rx="9" fill="#3cc13b" />
      <path d="M16 10v12M10 16h12" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" />
    </g>
  ),
  bell: (
    <g>
      <path d="M16 4a8 8 0 0 1 8 8v6l2.5 4H5.5L8 18v-6a8 8 0 0 1 8-8Z" fill="#ffb81c" />
      <circle cx="16" cy="25" r="3" fill="#e09400" />
    </g>
  ),
  trophy: (
    <g>
      <path d="M9 4h14v8a7 7 0 0 1-14 0Z" fill="#ffb81c" />
      <path d="M9 7H5a4 4 0 0 0 4 5M23 7h4a4 4 0 0 1-4 5" stroke="#e09400" strokeWidth="2.5" fill="none" />
      <rect x="14" y="18" width="4" height="5" fill="#e09400" />
      <rect x="9" y="23" width="14" height="5" rx="2" fill="#475472" />
    </g>
  ),
  shield: (
    <g>
      <path d="M16 3 27 7v8c0 7-5 12-11 14C10 27 5 22 5 15V7Z" fill="#3cc13b" />
      <path d="m11 16 3.5 3.5L21.5 12" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </g>
  ),
  award: (
    <g>
      <path d="M10 18 7 29l5-2 3 4 2-11Z" fill="#ff4f5e" />
      <path d="M22 18l3 11-5-2-3 4-2-11Z" fill="#d93241" />
      <circle cx="16" cy="13" r="9" fill="#ffb81c" />
      <circle cx="16" cy="13" r="5" fill="#ffd56b" />
    </g>
  ),
};
