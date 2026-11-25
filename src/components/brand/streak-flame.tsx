/** PROOFIT streak flame: chunky two-tone flame; grey when the streak is not lit today. */
export function StreakFlame({ size = 24, lit = true, className }: { size?: number; lit?: boolean; className?: string }) {
  const outer = lit ? "#ff8a1f" : "#c9cdd6";
  const inner = lit ? "#ffd23f" : "#e4e6eb";
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} aria-hidden>
      <path d="M16 2c1.5 5 7.5 8 9.5 14 2.3 7-2.7 14-9.5 14S4.2 23.6 6.5 17c1-3 3-4.5 4.5-5.5-.3 3 .7 5 2.5 6C12.5 11 14 6 16 2Z" fill={outer} />
      <path d="M16.5 14c1 3 4.5 4.5 4.5 8.5a5 5 0 0 1-10 0c0-2.5 1.5-4 3-5 0 1.8.8 2.8 2 3-.5-2.5-.2-4.6.5-6.5Z" fill={inner} />
    </svg>
  );
}
