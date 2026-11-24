"use client";

import { useT } from "@/lib/i18n/client";

import { CircleCheck, CircleExclamationPoint, Info, X } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { cn } from "./cn";

type Tone = "success" | "error" | "info";
interface Toast {
  id: number;
  leaving?: boolean;
  tone: Tone;
  title: string;
  text?: string;
}

const Ctx = createContext<{ push: (t: Omit<Toast, "id">) => void } | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const t = useT();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);
  // Play the exit animation, then remove.
  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.map((x) => (x.id === id ? { ...x, leaving: true } : x)));
    setTimeout(() => setToasts((list) => list.filter((x) => x.id !== id)), 220);
  }, []);
  const push = useCallback(
    (t: Omit<Toast, "id">) => {
      const id = nextId.current++;
      // Ignore an identical toast that is already on screen (e.g. double taps).
      setToasts((list) => (list.some((x) => !x.leaving && x.title === t.title && x.tone === t.tone) ? list : [...list.slice(-2), { ...t, id }]));
      setTimeout(() => dismiss(id), t.tone === "error" ? 6000 : 4200);
    },
    [dismiss],
  );
  const value = useMemo(() => ({ push }), [push]);
  return (
    <Ctx.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 top-3 z-[100] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:top-auto sm:items-end"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((item) => {
          const I = item.tone === "success" ? CircleCheck : item.tone === "error" ? CircleExclamationPoint : Info;
          return (
            <div
              key={item.id}
              className={cn(
                "glass-strong pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl p-4 shadow-2xl",
                item.leaving ? "animate-toast-out" : "animate-toast-in",
                item.tone === "success" && "ring-1 ring-easy/30",
                item.tone === "error" && "ring-1 ring-extreme/30",
              )}
              role={item.tone === "error" ? "alert" : "status"}
            >
              <I className={cn("mt-0.5 h-5 w-5 shrink-0", item.tone === "success" ? "text-easy" : item.tone === "error" ? "text-extreme" : "text-electric")} aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{item.title}</p>
                {item.text && <p className="mt-0.5 text-sm text-muted">{item.text}</p>}
              </div>
              <button onClick={() => dismiss(item.id)} className="text-subtle hover:text-fg" aria-label={t("Dismiss notification")}>
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx.push;
}
