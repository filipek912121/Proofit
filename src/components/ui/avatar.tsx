import { frameClass } from "@/lib/config/cosmetics";
import { cn } from "./cn";

/**
 * User avatar: uploaded photo or coloured initials, optionally wrapped in a
 * level-unlocked decorative frame.
 */
export function Avatar({
  name,
  color,
  size = 40,
  className,
  ring,
  url,
  frame,
}: {
  name: string;
  color: string;
  size?: number;
  className?: string;
  ring?: boolean;
  url?: string | null;
  frame?: string | null;
}) {
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const fc = frameClass(frame);
  const inner = (
    <span
      className={cn(
        "relative inline-grid shrink-0 place-items-center overflow-hidden rounded-full font-display font-bold text-white",
        ring && !fc && "ring-2 ring-violet-2/60 ring-offset-2 ring-offset-ink",
        !fc && className,
      )}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: url ? undefined : `radial-gradient(circle at 30% 25%, ${color}ee, ${color}88 60%, ${color}55)`,
        boxShadow: url ? undefined : `0 0 0 1px rgb(255 255 255 / .12) inset, 0 6px 20px -6px ${color}aa`,
      }}
      aria-hidden
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
      ) : (
        initials
      )}
    </span>
  );
  if (!fc) return inner;
  return (
    <span className={cn("avatar-frame relative inline-grid shrink-0 place-items-center rounded-full", fc, className)} style={{ padding: Math.max(2, Math.round(size * 0.06)) }} aria-hidden>
      {inner}
    </span>
  );
}

/** Convenience: avatar props from a profile-like object. */
export function avatarOf(p: { displayName: string; avatarColor: string; avatarUrl?: string | null; avatarFrame?: string | null }) {
  return { name: p.displayName, color: p.avatarColor, url: p.avatarUrl ?? null, frame: p.avatarFrame ?? null };
}
