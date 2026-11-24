"use client";

import { useMemo } from "react";

const COLORS = ["#a78bfa", "#3b82f6", "#22d3ee", "#fbbf24", "#22c55e", "#f472b6"];

/** One-shot CSS confetti burst for celebrations. Decorative only. */
export function Confetti({ count = 28 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2 + (i % 3) * 0.3;
        const dist = 90 + ((i * 37) % 80);
        return {
          dx: `${Math.round(Math.cos(angle) * dist)}px`,
          dy: `${Math.round(Math.sin(angle) * dist + 60)}px`,
          rot: `${(i * 67) % 540}deg`,
          color: COLORS[i % COLORS.length],
          delay: `${(i % 6) * 25}ms`,
        };
      }),
    [count],
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={{ background: p.color, animationDelay: p.delay, ["--dx" as string]: p.dx, ["--dy" as string]: p.dy, ["--rot" as string]: p.rot }}
        />
      ))}
    </div>
  );
}
