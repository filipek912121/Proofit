import { cn } from "@/components/ui/cn";

/** PROOFIT mark: a chunky hexagon badge (commitment) with a rising check (proof). Flat, two-tone. */
export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className} aria-hidden>
      <path d="M20 4.5 35 13v17.5L20 39 5 30.5V13L20 4.5Z" fill="#5a3ee0" />
      <path d="M20 1.5 35 10v17.5L20 36 5 27.5V10L20 1.5Z" fill="#7b5cff" />
      <path d="M12.5 19 18 24.5l10.5-12" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M24.5 12.2h4.2v4.2" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ className, size = 30, showWordmark = true }: { className?: string; size?: number; showWordmark?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark size={size} />
      {showWordmark && (
        <span className="font-display text-[1.3rem] font-black tracking-[0.06em] text-violet-2">
          PROOF<span className="text-green">IT</span>
        </span>
      )}
    </span>
  );
}
