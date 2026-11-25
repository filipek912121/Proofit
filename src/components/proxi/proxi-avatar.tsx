"use client";

import type { ProxiProp } from "@/lib/proxi/props";
export type { ProxiProp };

import { useId } from "react";
import { cn } from "@/components/ui/cn";
import { BODY_COLORS, DEFAULT_LOOK, EYE_COLORS, type ProxiLook, type ProxiStage } from "@/lib/proxi/config";
import type { ProxiMood } from "@/lib/proxi/messages";

/**
 * PROXI — layered vector robot. Each evolution stage has its own silhouette;
 * wardrobe items are drawn as separate layers on top. Animations are pure CSS
 * (see .proxi-* in globals.css) and honour prefers-reduced-motion.
 *
 * To swap in final illustrations later, render <img src="/proxi/stage-{n}-{mood}.webp">
 * here — every screen uses this single component.
 */

const SHOULDER_L = { x: 68, y: 142 };
const SHOULDER_R = { x: 132, y: 142 };

// Arm angles (deg, clockwise) per mood — [left, right]
const ARMS: Record<ProxiMood, [number, number]> = {
  neutral: [18, -18],
  happy: [18, -150],
  excited: [150, -150],
  proud: [20, -160],
  sleepy: [8, -8],
  motivated: [22, -165],
  sad: [6, -6],
  surprised: [130, -130],
  laugh: [40, -40],
};
const ANIMATED_ARM: Partial<Record<ProxiMood, "wave" | "pump" | "cheer">> = { happy: "wave", motivated: "pump", excited: "cheer", proud: "pump" };

function Arm({ side, angle, color, hand, anim }: { side: "l" | "r"; angle: number; color: string; hand: string; anim?: string }) {
  const s = side === "l" ? SHOULDER_L : SHOULDER_R;
  return (
    <g
      className={anim ? `proxi-arm-${anim}` : undefined}
      style={{ transform: `rotate(${angle}deg)`, transformOrigin: `${s.x}px ${s.y}px`, transformBox: "view-box", ["--a" as string]: `${angle}deg` }}
    >
      <path d={`M${s.x} ${s.y} V${s.y + 30}`} stroke={color} strokeWidth="12" strokeLinecap="round" />
      <circle cx={s.x} cy={s.y + 34} r="8.5" fill={hand} />
    </g>
  );
}

function Eyes({ mood, color }: { mood: ProxiMood; color: string }) {
  const L = 82;
  const R = 118;
  const Y = 84;
  const glow = { filter: `drop-shadow(0 0 4px ${color})` };
  switch (mood) {
    case "happy":
    case "proud":
    case "laugh":
      return (
        <g stroke={color} strokeWidth="4.5" strokeLinecap="round" fill="none" style={glow}>
          <path d={`M${L - 8} ${Y + 3} q8 -12 16 0`} />
          <path d={`M${R - 8} ${Y + 3} q8 -12 16 0`} />
        </g>
      );
    case "excited":
      return (
        <g fill={color} style={glow}>
          {[L, R].map((x) => (
            <path key={x} d={`M${x} ${Y - 11} L${x + 3.5} ${Y - 3.5} L${x + 11} ${Y} L${x + 3.5} ${Y + 3.5} L${x} ${Y + 11} L${x - 3.5} ${Y + 3.5} L${x - 11} ${Y} L${x - 3.5} ${Y - 3.5} Z`} />
          ))}
        </g>
      );
    case "surprised":
      return (
        <g style={glow}>
          {[L, R].map((x) => (
            <g key={x}>
              <circle cx={x} cy={Y} r="10" fill={color} />
              <circle cx={x + 2} cy={Y - 2} r="3.5" fill="#fff" opacity="0.9" />
            </g>
          ))}
        </g>
      );
    case "sad":
      return (
        <g style={glow}>
          {[L, R].map((x) => (
            <path key={x} d={`M${x - 8} ${Y - 2} a8 8 0 0 0 16 0 z`} fill={color} />
          ))}
          <path d={`M${L - 9} ${Y - 12} l14 4`} stroke={color} strokeWidth="3" strokeLinecap="round" />
          <path d={`M${R + 9} ${Y - 12} l-14 4`} stroke={color} strokeWidth="3" strokeLinecap="round" />
          <path d={`M${R + 6} ${Y + 8} q3 6 0 9 q-3 -3 0 -9`} fill="#7dd3fc" />
        </g>
      );
    case "sleepy":
      return (
        <g stroke={color} strokeWidth="4" strokeLinecap="round" opacity="0.8">
          <path d={`M${L - 8} ${Y + 2} h16`} />
          <path d={`M${R - 8} ${Y + 2} h16`} />
        </g>
      );
    case "motivated":
      return (
        <g style={glow}>
          <rect className="proxi-eye" x={L - 7} y={Y - 9} width="14" height="18" rx="6" fill={color} />
          <rect className="proxi-eye" x={R - 7} y={Y - 9} width="14" height="18" rx="6" fill={color} />
          <path d={`M${L - 10} ${Y - 15} l15 4`} stroke={color} strokeWidth="3.5" strokeLinecap="round" />
          <path d={`M${R + 10} ${Y - 15} l-15 4`} stroke={color} strokeWidth="3.5" strokeLinecap="round" />
        </g>
      );
    default:
      return (
        <g fill={color} style={glow}>
          <rect className="proxi-eye" x={L - 7} y={Y - 11} width="14" height="21" rx="7" />
          <rect className="proxi-eye" x={R - 7} y={Y - 11} width="14" height="21" rx="7" />
          <circle cx={L + 2.5} cy={Y - 5} r="2.5" fill="#fff" opacity="0.85" />
          <circle cx={R + 2.5} cy={Y - 5} r="2.5" fill="#fff" opacity="0.85" />
        </g>
      );
  }
}

function Mouth({ mood, color }: { mood: ProxiMood; color: string }) {
  const y = 104;
  switch (mood) {
    case "laugh":
      return <path className="proxi-laugh-mouth" d={`M88 ${y - 3} q12 16 24 0 z`} fill={color} />;
    case "excited":
    case "proud":
      return <path d={`M89 ${y - 2} q11 11 22 0 z`} fill={color} />;
    case "surprised":
      return <ellipse cx="100" cy={y} rx="5" ry="6" fill={color} />;
    case "sad":
      return <path d={`M91 ${y + 4} q9 -7 18 0`} stroke={color} strokeWidth="3.2" strokeLinecap="round" fill="none" />;
    case "sleepy":
      return <ellipse cx="100" cy={y} rx="3.5" ry="2.5" fill={color} opacity="0.7" />;
    case "motivated":
      return <path d={`M90 ${y} h20`} stroke={color} strokeWidth="3.5" strokeLinecap="round" />;
    default:
      return <path d={`M90 ${y - 1} q10 8 20 0`} stroke={color} strokeWidth="3.5" strokeLinecap="round" fill="none" />;
  }
}

export function ProxiAvatar({
  stage = 1,
  look = DEFAULT_LOOK,
  mood = "neutral",
  size = 160,
  className,
  animate = true,
  silhouette = false,
  prop,
}: {
  stage?: ProxiStage;
  look?: ProxiLook;
  mood?: ProxiMood;
  size?: number;
  className?: string;
  animate?: boolean;
  /** Locked-preview mode: dark silhouette, no effects. */
  silhouette?: boolean;
  /** Contextual gear for the moment: headphones for music, dumbbell for training… */
  prop?: ProxiProp;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const c = BODY_COLORS[look.color] ?? BODY_COLORS["color-classic"];
  const eye = EYE_COLORS[look.eyes] ?? EYE_COLORS["eyes-cyan"];
  const gold = "#fbbf24";
  const metal = `pm-${uid}`;
  const glow = `pg-${uid}`;
  const visor = `pv-${uid}`;
  const shell = silhouette ? "#3f3f55" : `url(#${metal})`;
  const trim = silhouette ? "#2e2e40" : stage === 4 ? gold : c.trim;
  const [la, ra] = ARMS[mood];
  const armAnim = animate ? ANIMATED_ARM[mood] : undefined;
  const floating = stage >= 3;
  const hasHeadItem = look.head !== "head-none";
  const moodClass = animate && !silhouette ? `proxi-mood-${mood}` : undefined;
  const fx = !silhouette;

  return (
    <svg width={size} height={size * 1.15} viewBox="0 0 200 230" className={cn("overflow-visible", className)} role="img" aria-hidden>
      <defs>
        <linearGradient id={metal} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={c.shell} />
          <stop offset="0.55" stopColor={c.shell} />
          <stop offset="1" stopColor={c.shade} />
        </linearGradient>
        <linearGradient id={visor} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={c.visor} stopOpacity="0.92" />
          <stop offset="1" stopColor={c.visor} />
        </linearGradient>
        <radialGradient id={glow}>
          <stop offset="0" stopColor={stage === 4 ? gold : eye} stopOpacity="0.55" />
          <stop offset="1" stopColor={stage === 4 ? gold : eye} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ── Aura layers ── */}
      {fx && stage >= 3 && <circle className={animate ? "proxi-pulse" : undefined} cx="100" cy="112" r="96" fill={`url(#${glow})`} />}
      {fx && stage === 3 && (
        <circle className={animate ? "proxi-spin" : undefined} cx="100" cy="112" r="88" fill="none" stroke={eye} strokeOpacity="0.45" strokeWidth="2" strokeDasharray="4 10" />
      )}
      {fx && stage === 4 && (
        <g className={animate ? "proxi-spin" : undefined}>
          {[0, 120, 240].map((d) => (
            <circle key={d} cx={100 + 90 * Math.cos((d * Math.PI) / 180)} cy={112 + 90 * Math.sin((d * Math.PI) / 180)} r="5" fill={gold} style={{ filter: `drop-shadow(0 0 6px ${gold})` }} />
          ))}
        </g>
      )}
      {fx && look.aura === "aura-flames" && (
        <g className={animate ? "proxi-flicker" : undefined} opacity="0.85">
          <path d="M46 190 q-14 -46 14 -88 q-2 30 18 40 q-6 -34 22 -62 q-4 38 26 54 q4 -18 18 -30 q20 44 -6 86 z" fill="#f97316" opacity="0.55" />
          <path d="M64 192 q-6 -30 12 -54 q2 22 16 28 q-2 -24 16 -40 q2 26 20 36 q14 14 2 30 z" fill="#fde047" opacity="0.5" />
        </g>
      )}
      {fx && look.aura === "aura-sparks" && (
        <g fill={eye}>
          {[
            [28, 60],
            [172, 74],
            [36, 160],
            [166, 170],
            [100, 12],
          ].map(([x, y], i) => (
            <path key={i} className={animate ? "proxi-twinkle" : undefined} style={{ animationDelay: `${i * 0.35}s` }} d={`M${x} ${y - 7} L${x + 2} ${y - 2} L${x + 7} ${y} L${x + 2} ${y + 2} L${x} ${y + 7} L${x - 2} ${y + 2} L${x - 7} ${y} L${x - 2} ${y - 2} Z`} />
          ))}
        </g>
      )}
      {fx && look.aura === "aura-rainbow" && (
        <g className={animate ? "proxi-spin" : undefined} fill="none" strokeWidth="4" strokeLinecap="round">
          {["#f43f5e", "#f59e0b", "#22c55e", "#3b82f6", "#a855f7"].map((col, i) => (
            <circle key={col} cx="100" cy="112" r="92" stroke={col} strokeDasharray="60 518" strokeDashoffset={-i * 116} opacity="0.8" />
          ))}
        </g>
      )}

      {/* ground shadow */}
      <ellipse className={floating && animate ? "proxi-shadow" : undefined} cx="100" cy="214" rx={floating ? 34 : 42} ry="6" fill="#000" opacity="0.22" />

      <g className={floating && animate ? "proxi-hover" : undefined}>
      <g className={moodClass}>
        {/* ── Base: feet (Rookie/Pro) or jets (Elite/Legend) ── */}
        {stage <= 2 ? (
          <g>
            <rect x="76" y="186" width="20" height="14" rx="7" fill={shell} />
            <rect x="104" y="186" width="20" height="14" rx="7" fill={shell} />
            {stage === 2 && fx && (
              <g fill={eye} opacity="0.85">
                <rect x="80" y="199" width="12" height="3" rx="1.5" />
                <rect x="108" y="199" width="12" height="3" rx="1.5" />
              </g>
            )}
          </g>
        ) : (
          <g>
            <rect x="82" y="182" width="36" height="10" rx="5" fill={trim} />
            {fx && (
              <g className={animate ? "proxi-flicker" : undefined}>
                <path d="M86 192 q4 18 8 0 z" fill={stage === 4 ? gold : eye} />
                <path d="M106 192 q4 18 8 0 z" fill={stage === 4 ? gold : eye} />
                <path d="M88 192 q2 9 4 0 z" fill="#fff" opacity="0.8" />
                <path d="M108 192 q2 9 4 0 z" fill="#fff" opacity="0.8" />
              </g>
            )}
          </g>
        )}

        {/* ── Arms (behind torso) ── */}
        <Arm side="l" angle={la} color={silhouette ? "#2e2e40" : c.shade} hand={shell} anim={armAnim === "cheer" ? "cheer" : undefined} />
        <Arm side="r" angle={ra} color={silhouette ? "#2e2e40" : c.shade} hand={shell} anim={armAnim} />

        {/* ── Torso ── */}
        {stage === 1 ? (
          <rect x="72" y="128" width="56" height="60" rx="20" fill={shell} />
        ) : (
          <rect x="66" y="124" width="68" height="64" rx="22" fill={shell} stroke={stage === 4 ? gold : "none"} strokeWidth="2.5" />
        )}
        {stage >= 2 && (
          <g fill={trim}>
            <ellipse cx="66" cy="136" rx="12" ry="10" />
            <ellipse cx="134" cy="136" rx="12" ry="10" />
          </g>
        )}
        {/* chest emblem / core */}
        {stage === 1 && <path d="M90 156 l7 7 l13 -14" stroke={trim} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />}
        {stage === 2 && fx && <circle className={animate ? "proxi-core" : undefined} cx="100" cy="156" r="9" fill={eye} style={{ filter: `drop-shadow(0 0 6px ${eye})` }} />}
        {stage === 3 && fx && (
          <g>
            <circle cx="100" cy="156" r="13" fill="none" stroke={eye} strokeWidth="2.5" opacity="0.8" />
            <circle className={animate ? "proxi-core" : undefined} cx="100" cy="156" r="7" fill={eye} style={{ filter: `drop-shadow(0 0 7px ${eye})` }} />
            <path d="M76 146 h8 l4 6 M124 146 h-8 l-4 6 M78 172 h10 M112 172 h10" stroke={eye} strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
          </g>
        )}
        {stage === 4 && fx && (
          <g>
            <path className={animate ? "proxi-core" : undefined} d="M100 142 l12 14 l-12 14 l-12 -14 z" fill={gold} style={{ filter: `drop-shadow(0 0 8px ${gold})` }} />
            <path d="M100 146 l7 10 l-7 10" fill="#fff" opacity="0.45" />
          </g>
        )}

        {/* neck */}
        <rect x="90" y="118" width="20" height="12" rx="4" fill={silhouette ? "#2e2e40" : c.shade} />

        {/* ── Head ── */}
        {stage >= 3 && (
          <g fill={trim}>
            <path d="M44 74 l-14 -12 l4 30 z" />
            <path d="M156 74 l14 -12 l-4 30 z" />
          </g>
        )}
        {stage === 2 && look.head !== "head-headphones" && (
          <g>
            <circle cx="42" cy="86" r="11" fill={trim} />
            <circle cx="158" cy="86" r="11" fill={trim} />
            <circle cx="42" cy="86" r="4.5" fill={fx ? eye : "#555"} opacity="0.85" />
            <circle cx="158" cy="86" r="4.5" fill={fx ? eye : "#555"} opacity="0.85" />
          </g>
        )}
        <rect x="44" y="44" width="112" height="82" rx="34" fill={shell} stroke={stage === 4 ? gold : "none"} strokeWidth="3" />
        {/* antennas / crown spikes */}
        {stage <= 2 && look.head !== "head-cap" && look.head !== "head-crown" && (
          <g>
            <path d="M100 44 V24" stroke={trim} strokeWidth="4" strokeLinecap="round" />
            <circle className={animate && fx ? "proxi-antenna" : undefined} cx="100" cy="20" r="6.5" fill={fx ? eye : "#555"} />
          </g>
        )}
        {stage === 3 && look.head !== "head-cap" && look.head !== "head-crown" && (
          <g>
            <path d="M80 46 L70 22 M120 46 L130 22" stroke={trim} strokeWidth="4" strokeLinecap="round" />
            <circle className={animate && fx ? "proxi-antenna" : undefined} cx="69" cy="19" r="5.5" fill={fx ? eye : "#555"} />
            <circle className={animate && fx ? "proxi-antenna" : undefined} cx="131" cy="19" r="5.5" fill={fx ? eye : "#555"} style={{ animationDelay: "0.5s" }} />
          </g>
        )}
        {stage === 4 && !hasHeadItem && (
          <g fill={gold} style={fx ? { filter: `drop-shadow(0 0 5px ${gold})` } : undefined}>
            <path d="M74 48 l6 -22 l8 20 z" />
            <path d="M92 46 l8 -30 l8 30 z" />
            <path d="M112 46 l8 -20 l6 22 z" />
          </g>
        )}

        {/* visor + face */}
        <rect x="56" y="58" width="88" height="58" rx="24" fill={silhouette ? "#1b1b26" : `url(#${visor})`} />
        {fx && stage >= 3 && <path d="M64 64 h50" stroke="#fff" strokeOpacity="0.12" strokeWidth="6" strokeLinecap="round" />}
        {!silhouette && (
          <>
            <Eyes mood={mood} color={eye} />
            <Mouth mood={mood} color={eye} />
            {(mood === "happy" || mood === "excited" || mood === "laugh" || mood === "proud") && (
              <g fill="#f472b6" opacity="0.5">
                <ellipse cx="68" cy="100" rx="5" ry="3.5" />
                <ellipse cx="132" cy="100" rx="5" ry="3.5" />
              </g>
            )}
          </>
        )}

        {/* ── Accessories ── */}
        {!silhouette && look.face === "face-glasses" && (
          <g fill={eye} fillOpacity="0.12" stroke="#f472b6" strokeWidth="3.2">
            <rect x="67" y="71" width="30" height="26" rx="9" />
            <rect x="103" y="71" width="30" height="26" rx="9" />
            <path d="M97 82 h6" fill="none" />
          </g>
        )}
        {!silhouette && look.face === "face-shades" && (
          <g>
            <rect x="62" y="72" width="76" height="24" rx="11" fill="#07070d" />
            <path d="M70 79 h22" stroke={eye} strokeWidth="3" strokeLinecap="round" opacity="0.9" />
            <path d="M108 79 h14" stroke={eye} strokeWidth="3" strokeLinecap="round" opacity="0.6" />
          </g>
        )}
        {!silhouette && look.head === "head-cap" && (
          <g>
            <path d="M56 58 q2 -34 44 -36 q42 2 44 36 z" fill={c.trim} />
            <path d="M100 58 h62 q6 0 2 6 h-64 z" fill={c.trim} />
            <circle cx="100" cy="36" r="5" fill={eye} />
          </g>
        )}
        {!silhouette && look.head === "head-headphones" && (
          <g>
            <path d="M44 84 q-2 -60 56 -62 q58 2 56 62" fill="none" stroke="#1f1f2e" strokeWidth="8" strokeLinecap="round" />
            <rect x="30" y="68" width="20" height="36" rx="9" fill={c.trim} />
            <rect x="150" y="68" width="20" height="36" rx="9" fill={c.trim} />
            <rect x="35" y="76" width="10" height="20" rx="5" fill={eye} opacity="0.8" />
            <rect x="155" y="76" width="10" height="20" rx="5" fill={eye} opacity="0.8" />
          </g>
        )}
        {!silhouette && look.head === "head-halo" && (
          <ellipse className={animate ? "proxi-halo" : undefined} cx="100" cy="24" rx="34" ry="8" fill="none" stroke={gold} strokeWidth="4.5" style={{ filter: `drop-shadow(0 0 6px ${gold})` }} />
        )}
        {!silhouette && look.head === "head-crown" && (
          <g style={{ filter: `drop-shadow(0 0 5px ${gold})` }}>
            <path d="M70 48 l4 -28 l14 14 l12 -20 l12 20 l14 -14 l4 28 z" fill={gold} />
            <circle cx="100" cy="36" r="4" fill="#f43f5e" />
          </g>
        )}
        {mood === "sleepy" && !silhouette && (
          <g fill={eye} fontFamily="sans-serif" fontWeight="800">
            <text className={animate ? "proxi-zzz" : undefined} x="150" y="40" fontSize="16">
              z
            </text>
            <text className={animate ? "proxi-zzz" : undefined} x="164" y="24" fontSize="12" style={{ animationDelay: "0.6s" }}>
              z
            </text>
          </g>
        )}
        {prop && !silhouette && <Prop kind={prop} />}
      </g>
      </g>
    </svg>
  );
}

/** Flat, chunky props drawn in the same language as PROXI (200×230 grid). */
function Prop({ kind }: { kind: ProxiProp }) {
  switch (kind) {
    case "headphones":
      return (
        <g>
          <path d="M50 92 C50 34 150 34 150 92" stroke="#1d2130" strokeWidth="9" fill="none" strokeLinecap="round" />
          <rect x="38" y="76" width="20" height="34" rx="9" fill="#ff4f5e" />
          <rect x="142" y="76" width="20" height="34" rx="9" fill="#ff4f5e" />
          <rect x="42" y="82" width="8" height="22" rx="4" fill="#d93241" />
          <rect x="150" y="82" width="8" height="22" rx="4" fill="#d93241" />
        </g>
      );
    case "dumbbell":
      return (
        <g transform="translate(150 168) rotate(-20)">
          <rect x="-22" y="-4" width="44" height="8" rx="3" fill="#475472" />
          <rect x="-30" y="-14" width="10" height="28" rx="4" fill="#ff8a1f" />
          <rect x="20" y="-14" width="10" height="28" rx="4" fill="#ff8a1f" />
          <rect x="-36" y="-9" width="6" height="18" rx="3" fill="#e06a00" />
          <rect x="30" y="-9" width="6" height="18" rx="3" fill="#e06a00" />
        </g>
      );
    case "book":
      return (
        <g transform="translate(150 170) rotate(-12)">
          <path d="M-26 -16 c10 -4 18 -2 26 4 v32 c-8 -6 -16 -8 -26 -4 Z" fill="#1e9bf0" />
          <path d="M26 -16 c-10 -4 -18 -2 -26 4 v32 c8 -6 16 -8 26 -4 Z" fill="#0b7bc8" />
          <path d="M-20 -8 h12 M-20 0 h12 M8 -8 h12 M8 0 h12" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
        </g>
      );
    case "bottle":
      return (
        <g transform="translate(156 164) rotate(10)">
          <rect x="-6" y="-34" width="12" height="8" rx="2" fill="#1d2130" />
          <rect x="-14" y="-27" width="28" height="56" rx="10" fill="#11b5c9" />
          <rect x="-14" y="-4" width="28" height="33" rx="10" fill="#0a91a3" />
          <rect x="-8" y="-20" width="5" height="16" rx="2.5" fill="#fff" opacity="0.6" />
        </g>
      );
    case "trophy":
      return (
        <g transform="translate(154 166)">
          <path d="M-18 -26 h36 v14 a18 18 0 0 1 -36 0 Z" fill="#ffb81c" />
          <path d="M-18 -20 h-8 a9 9 0 0 0 9 12 M18 -20 h8 a9 9 0 0 1 -9 12" stroke="#e09400" strokeWidth="4" fill="none" />
          <rect x="-5" y="4" width="10" height="10" fill="#e09400" />
          <rect x="-16" y="13" width="32" height="10" rx="3" fill="#475472" />
        </g>
      );
    case "pencil":
      return (
        <g transform="translate(152 166) rotate(35)">
          <rect x="-7" y="-30" width="14" height="46" rx="3" fill="#ff5fae" />
          <rect x="-7" y="-36" width="14" height="8" rx="3" fill="#ffd0e6" />
          <path d="M-7 16 L0 32 L7 16 Z" fill="#ffd28a" />
          <path d="M-2.5 26 L0 32 L2.5 26 Z" fill="#1d2130" />
        </g>
      );
    case "pajamas":
      // A sleepy cap for early-morning missions.
      return (
        <g>
          <path d="M58 64 C70 22 128 18 148 58 Z" fill="#7b5cff" />
          <path d="M140 46 C160 50 170 70 172 86" stroke="#7b5cff" strokeWidth="10" strokeLinecap="round" fill="none" />
          <circle cx="173" cy="92" r="9" fill="#fff" />
          <rect x="54" y="58" width="98" height="12" rx="6" fill="#fff" />
        </g>
      );
  }
}
