"use client";

import { Copy, Share2 } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function ReferralShare({ link }: { link: string }) {
  const t = useT();
  const toast = useToast();
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      toast({ tone: "success", title: t("Invite link copied") });
    } catch {
      toast({ tone: "info", title: link });
    }
  };
  return (
    <div className="space-y-2">
      <div className="truncate rounded-xl bg-tint/[0.05] px-4 py-3 font-mono text-xs text-muted ring-1 ring-line" title={link}>
        {link}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button type="button" variant="secondary" icon={<Copy className="h-4 w-4" />} onClick={copy}>
          {t("Copy")}
        </Button>
        <Button
          type="button"
          icon={<Share2 className="h-4 w-4" />}
          onClick={async () => {
            if (navigator.share) {
              try {
                await navigator.share({ title: "PROOFIT", text: t("Join me on PROOFIT — let's challenge each other!"), url: link });
              } catch {
                /* user closed the share sheet */
              }
            } else copy();
          }}
        >
          {t("Share")}
        </Button>
      </div>
    </div>
  );
}
