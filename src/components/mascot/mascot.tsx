import { cn } from "@/components/ui/cn";

/**
 * Proofi — the PROOFIT robot mascot.
 *
 * Moods map to app events (see `mascotForEvent`). The built-in vector art is a
 * placeholder that already matches the brand; to ship real illustrations or
 * Lottie files later, add them to MASCOT_ASSETS (e.g. "/mascot/celebrate.webp")
 * and every screen picks them up automatically.
 */
export type MascotMood = "idle" | "happy" | "celebrate" | "proud" | "fire" | "sad" | "sleepy" | "nudge";

export const MASCOT_ASSETS: Partial<Record<MascotMood, string>> = {
  // celebrate: "/mascot/celebrate.webp",
};

const ANTENNA: Record<MascotMood, string> = {
  idle: "#a78bfa",
  happy: "#22d3ee",
  celebrate: "#fbbf24",
  proud: "#fbbf24",
  fire: "#f97316",
  sad: "#64748b",
  sleepy: "#64748b",
  nudge: "#22c55e",
};

function Eyes({ mood }: { mood: MascotMood }) {
  const glow = mood === "sad" || mood === "sleepy" ? "#94a3b8" : mood === "fire" ? "#fdba74" : "#67e8f9";
  switch (mood) {
    case "happy":
    case "celebrate":
    case "proud":
      // ^ ^ smiling eyes
      return (
        <g stroke={glow} strokeWidth="4" strokeLinecap="round" fill="none">
          <path d="M41 56 l6 -6 l6 6" />
          <path d="M67 56 l6 -6 l6 6" />
        </g>
      );
    case "sleepy":
      return (
        <g stroke={glow} strokeWidth="4" strokeLinecap="round">
          <path d="M40 54 h13" />
          <path d="M67 54 h13" />
        </g>
      );
    case "sad":
      return (
        <g fill={glow}>
          <ellipse cx="47" cy="55" rx="4.5" ry="5" />
          <ellipse cx="73" cy="55" rx="4.5" ry="5" />
          <path d="M40 47 l12 3" stroke={glow} strokeWidth="3" strokeLinecap="round" />
          <path d="M80 47 l-12 3" stroke={glow} strokeWidth="3" strokeLinecap="round" />
        </g>
      );
    case "fire":
      return (
        <g fill={glow}>
          <path d="M41 58 q6 -14 12 0 z" />
          <path d="M67 58 q6 -14 12 0 z" />
        </g>
      );
    default:
      return (
        <g fill={glow}>
          <rect className="mascot-eye" x="42" y="48" width="10" height="13" rx="5" />
          <rect className="mascot-eye" x="68" y="48" width="10" height="13" rx="5" />
        </g>
      );
  }
}

function Mouth({ mood }: { mood: MascotMood }) {
  if (mood === "sad") return <path d="M52 69 q8 -6 16 0" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" fill="none" />;
  if (mood === "sleepy") return <ellipse cx="60" cy="68" rx="3" ry="2.5" fill="#94a3b8" />;
  if (mood === "celebrate" || mood === "proud") return <path d="M51 65 q9 9 18 0 z" fill="#67e8f9" />;
  return <path d="M52 66 q8 6 16 0" stroke={mood === "fire" ? "#fdba74" : "#67e8f9"} strokeWidth="3" strokeLinecap="round" fill="none" />;
}

export function Mascot({ mood = "idle", size = 96, className, animate = true }: { mood?: MascotMood; size?: number; className?: string; animate?: boolean }) {
  const asset = MASCOT_ASSETS[mood];
  if (asset)
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={asset} alt="" width={size} height={size} className={cn(animate && "animate-bob", className)} aria-hidden />;
  const armsUp = mood === "celebrate" || mood === "proud";
  return (
    <svg width={size} height={size} viewBox="0 0 120 124" className={cn(animate && "animate-bob", className)} aria-hidden>
      {/* shadow */}
      <ellipse cx="60" cy="119" rx="26" ry="4" fill="#000" opacity="0.18" />
      {/* antenna */}
      <path d="M60 22 V10" stroke="#a78bfa" strokeWidth="3" strokeLinecap="round" />
      <circle className={animate ? "mascot-antenna" : undefined} cx="60" cy="8" r="5" fill={ANTENNA[mood]} />
      {/* arms */}
      {armsUp ? (
        <g stroke="#c4b5fd" strokeWidth="7" strokeLinecap="round">
          <path d="M30 92 L18 70" />
          <path d="M90 92 L102 70" />
        </g>
      ) : (
        <g stroke="#c4b5fd" strokeWidth="7" strokeLinecap="round">
          <path d="M31 92 L22 104" />
          <path d="M89 92 L98 104" />
        </g>
      )}
      {/* body */}
      <rect x="36" y="84" width="48" height="28" rx="11" fill="#ddd6fe" />
      <path d="M53 98 l5 5 l9 -10" stroke="#7c3aed" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* head */}
      <rect x="18" y="20" width="84" height="66" rx="24" fill="#ddd6fe" />
      <rect x="27" y="33" width="66" height="44" rx="17" fill="#16132e" />
      <Eyes mood={mood} />
      <Mouth mood={mood} />
      {/* cheeks */}
      {(mood === "happy" || mood === "celebrate" || mood === "proud") && (
        <g fill="#f472b6" opacity="0.55">
          <circle cx="36" cy="66" r="3.5" />
          <circle cx="84" cy="66" r="3.5" />
        </g>
      )}
      {mood === "sleepy" && (
        <text x="92" y="22" fill="#94a3b8" fontSize="14" fontWeight="700" fontFamily="sans-serif">
          z
        </text>
      )}
    </svg>
  );
}

/** Mascot with a speech bubble. Use sparingly — only where a reaction adds emotion. */
export function MascotSays({ mood, title, text, size = 72, action, className }: { mood: MascotMood; title: string; text?: string; size?: number; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)} role="status">
      <Mascot mood={mood} size={size} className="shrink-0" />
      <div className="relative min-w-0 flex-1 rounded-2xl rounded-bl-md bg-ink-3 px-4 py-3 ring-1 ring-line">
        <p className="text-sm font-semibold">{title}</p>
        {text && <p className="mt-0.5 text-[13px] text-muted">{text}</p>}
        {action && <div className="mt-2">{action}</div>}
      </div>
    </div>
  );
}
