import type { ComponentProps } from "react";
import { cn } from "./cn";

/** Flat surface with a 2px border. `glow` is kept for API compatibility and only strengthens the border. */
export function Card({ className, glow, ...rest }: ComponentProps<"div"> & { glow?: boolean }) {
  return <div className={cn("surface rounded-2xl", glow && "neon-border", className)} {...rest} />;
}

export function SectionTitle({ title, action, subtitle }: { title: React.ReactNode; subtitle?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div className="min-w-0">
        <h2 className="font-display text-[19px] font-extrabold">{title}</h2>
        {subtitle && <p className="text-[13px] text-subtle">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0 text-[13px] font-extrabold uppercase tracking-wide text-violet-2">{action}</div>}
    </div>
  );
}

export function PageHeader({ title, subtitle, action, eyebrow }: { title: React.ReactNode; subtitle?: React.ReactNode; action?: React.ReactNode; eyebrow?: string }) {
  return (
    <header className="mb-5 flex flex-col gap-3 sm:mb-7 sm:flex-row sm:items-end sm:justify-between animate-rise">
      <div className="min-w-0">
        {eyebrow && <p className="mb-1 text-[12px] font-extrabold uppercase tracking-[0.12em] text-subtle">{eyebrow}</p>}
        <h1 className="font-display text-[28px] font-black leading-tight sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-1.5 max-w-xl text-[15px] text-muted">{subtitle}</p>}
      </div>
      {action && <div className="flex shrink-0 gap-2">{action}</div>}
    </header>
  );
}

/** Grouped list container (iOS/Android settings style) — rows separated by hairlines, no nested borders. */
export function ListGroup({ className, ...rest }: ComponentProps<"div">) {
  return <div className={cn("surface divide-y divide-line overflow-hidden rounded-2xl", className)} {...rest} />;
}

/** Compact metric: big number + label. */
export function Stat({ value, label, icon, className }: { value: React.ReactNode; label: React.ReactNode; icon?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("min-w-0", className)}>
      <div className="flex items-center gap-1.5 font-display text-xl font-black leading-none tabular-nums">
        {icon}
        {value}
      </div>
      <p className="mt-1 truncate text-[12px] text-subtle">{label}</p>
    </div>
  );
}
