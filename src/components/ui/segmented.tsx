"use client";

import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "./cn";

/**
 * Segmented control with a sliding indicator. Items are links (URL state), so
 * the selection survives reloads and is shareable.
 */
export function Segmented({ items, active, label, className }: { items: { key: string; label: string; href: string }[]; active: string; label: string; className?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null);
  useLayoutEffect(() => {
    const el = wrap.current?.querySelector<HTMLElement>(`[data-key="${active}"]`);
    if (el) setPill({ left: el.offsetLeft, width: el.offsetWidth });
  }, [active, items.length]);
  return (
    <nav ref={wrap} aria-label={label} className={cn("relative inline-flex rounded-xl bg-tint/[0.06] p-1", className)}>
      {pill && <span className="absolute top-1 bottom-1 rounded-lg bg-ink-2 shadow-sm ring-1 ring-line transition-all duration-300 ease-out" style={{ left: pill.left, width: pill.width }} aria-hidden />}
      {items.map((it) => (
        <Link
          key={it.key}
          data-key={it.key}
          href={it.href}
          scroll={false}
          aria-current={active === it.key ? "page" : undefined}
          className={cn("relative z-10 flex-1 whitespace-nowrap rounded-lg px-3.5 py-1.5 text-center text-[13px] font-semibold transition-colors", active === it.key ? "text-fg" : "text-subtle hover:text-fg")}
        >
          {it.label}
        </Link>
      ))}
    </nav>
  );
}
