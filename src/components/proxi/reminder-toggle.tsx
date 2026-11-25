"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { setProxiRemindersAction } from "@/lib/actions/proxi";
import { useT } from "@/lib/i18n/client";
import { cn } from "@/components/ui/cn";
import { useToast } from "@/components/ui/toast";

export function ProxiReminderToggle({ on: initial }: { on: boolean }) {
  const t = useT();
  const toast = useToast();
  const router = useRouter();
  const [on, setOn] = useState(initial);
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={t("Friendly reminders")}
      disabled={pending}
      onClick={() => {
        const next = !on;
        setOn(next);
        start(async () => {
          const r = await setProxiRemindersAction(next);
          if (!r.ok) {
            setOn(!next);
            toast({ tone: "error", title: r.error });
          } else {
            toast({ tone: "success", title: r.message ?? t("Saved") });
            router.refresh();
          }
        });
      }}
      className={cn("relative h-7 w-12 shrink-0 rounded-full transition-colors", on ? "bg-violet" : "bg-tint/15")}
    >
      <span className={cn("absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200", on ? "translate-x-6" : "translate-x-1")} />
    </button>
  );
}
