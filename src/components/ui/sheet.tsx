"use client";

import { X } from "lucide-react";
import { useEffect } from "react";
import { cn } from "./cn";

/** Bottom sheet (mobile) / centered dialog (desktop). Closes on backdrop tap and Escape. */
export function Sheet({ open, onClose, title, children, closeLabel }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; closeLabel: string }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={title}>
      <button className="absolute inset-0 bg-black/50 animate-fade" onClick={onClose} aria-label={closeLabel} />
      <div className={cn("glass-strong raised pb-safe relative w-full max-w-md rounded-t-3xl p-5 animate-sheet sm:rounded-3xl sm:animate-pop")}>
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-tint/20 sm:hidden" aria-hidden />
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-subtle hover:bg-tint/5 hover:text-fg" aria-label={closeLabel}>
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
