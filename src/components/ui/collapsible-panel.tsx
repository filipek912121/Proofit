"use client";

import { ChevronDown } from "lucide-react";
import { useId, useState } from "react";
import { cn } from "./cn";

/**
 * Form panel that is a compact tap-to-open row on phones (so lists stay on top)
 * and always expanded on desktop. Content is rendered once, never duplicated.
 */
export function CollapsiblePanel({
  title,
  icon,
  defaultOpen = false,
  glow,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  glow?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <div className={cn("surface rounded-2xl", glow && "neon-border")}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={id}
        className="tap flex w-full items-center gap-2 p-4 text-left lg:pointer-events-none lg:cursor-default lg:px-5 lg:pt-5 lg:pb-0"
      >
        {icon}
        <h2 className="flex-1 font-display text-lg font-bold">{title}</h2>
        <ChevronDown className={cn("h-5 w-5 text-subtle transition-transform duration-300 lg:hidden", open && "rotate-180")} aria-hidden />
      </button>
      <div id={id} className={cn("px-4 pb-4 lg:block lg:px-5 lg:pt-4 lg:pb-5", open ? "block animate-fade" : "hidden")}>
        {children}
      </div>
    </div>
  );
}
