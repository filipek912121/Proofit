"use client";

import { useT } from "@/lib/i18n/client";

import { CreditCard, Crown, FlaskConical } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";
import type { CheckoutKind } from "@/lib/actions/billing";
import { demoTogglePremiumAction, openBillingPortalAction, startCheckoutAction } from "@/lib/actions/billing";
import { ActionButton } from "@/components/ui/action-button";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function CheckoutButton({ label, kind = "subscription", variant = "gold" }: { label: string; kind?: CheckoutKind; variant?: "gold" | "secondary" | "success" }) {
  const [pending, start] = useTransition();
  const toast = useToast();
  return (
    <Button
      variant={variant}
      size="lg"
      className="w-full"
      loading={pending}
      icon={kind === "subscription" ? <Crown className="h-5 w-5" /> : undefined}
      onClick={() =>
        start(async () => {
          // On success the action redirects to Stripe Checkout; only errors return.
          const r = await startCheckoutAction(kind);
          if (r && !r.ok) toast({ tone: "error", title: r.error });
        })
      }
    >
      {label}
    </Button>
  );
}

/**
 * After returning from Checkout the webhook may land a moment later
 * (Przelewy24 can take a minute). Re-check quietly until Premium shows up.
 */
export function ActivationWatcher({ active }: { active: boolean }) {
  const router = useRouter();
  useEffect(() => {
    if (active) return;
    let n = 0;
    const id = setInterval(() => {
      n += 1;
      router.refresh();
      if (n >= 20) clearInterval(id);
    }, 3000);
    return () => clearInterval(id);
  }, [active, router]);
  return null;
}

export function PortalButton() {
  const t = useT();
  const [pending, start] = useTransition();
  const toast = useToast();
  return (
    <Button
      variant="secondary"
      className="w-full"
      loading={pending}
      icon={<CreditCard className="h-4 w-4" />}
      onClick={() =>
        start(async () => {
          const r = await openBillingPortalAction();
          if (r && !r.ok) toast({ tone: "error", title: r.error });
        })
      }
    >
      {t("Manage billing")}
    </Button>
  );
}

export function DemoToggle({ isPremium }: { isPremium: boolean }) {
  const t = useT();
  return (
    <ActionButton variant="secondary" className="w-full" action={demoTogglePremiumAction} icon={<FlaskConical className="h-4 w-4" />}>
      {isPremium ? t("Demo: switch back to Free") : t("Demo: preview Premium (no payment)")}
    </ActionButton>
  );
}
