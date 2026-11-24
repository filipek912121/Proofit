import { CircleCheck, Gift, Hourglass } from "lucide-react";
import { headers } from "next/headers";
import { Avatar, avatarOf } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { env } from "@/lib/env";
import { getT } from "@/lib/i18n/server";
import { referralOverview } from "@/lib/services/referrals";
import { ReferralShare } from "./referral-share";

async function siteOrigin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) return env.siteUrl;
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/** "Invite friends" panel: personal link, rewards explained, and who already joined. */
export async function ReferralCard({ userId, username, compact }: { userId: string; username: string; compact?: boolean }) {
  const t = await getT();
  const r = await referralOverview(userId);
  const link = `${await siteOrigin()}/signup?ref=${encodeURIComponent(username)}`;
  const nextGoal = Math.max(3, Math.ceil((r.rewardedCount + 1) / 3) * 3);
  return (
    <Card glow className="relative overflow-hidden p-5">
      <span className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-gold/20 blur-3xl" aria-hidden />
      <div className="relative flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gold/15 text-gold ring-1 ring-gold/30">
          <Gift className="h-5 w-5 animate-float" aria-hidden />
        </span>
        <div>
          <h2 className="font-display text-lg font-bold">{t("Invite friends, earn XP")}</h2>
          <p className="text-sm text-muted">
            {t("You get +{a} XP and your friend +{b} XP after their first check-in.", { a: r.rules.inviterXp, b: r.rules.inviteeXp })}
          </p>
        </div>
      </div>
      <div className="relative mt-4">
        <ReferralShare link={link} />
      </div>
      <div className="relative mt-4 grid grid-cols-3 gap-2 text-center">
        {[
          [String(r.invited.length), t("Joined")],
          [String(r.rewardedCount), t("Rewarded")],
          [`+${r.xpEarned}`, "XP"],
        ].map(([v, k]) => (
          <div key={k} className="rounded-xl bg-tint/[0.04] p-2 ring-1 ring-line">
            <p className="font-display text-lg font-bold">{v}</p>
            <p className="text-[11px] text-muted">{k}</p>
          </div>
        ))}
      </div>
      {!compact && (
        <>
          <div className="relative mt-4">
            <div className="mb-1 flex justify-between text-xs text-subtle">
              <span>{t("Next goal: {n} friends", { n: nextGoal })}</span>
              <span className="tabular-nums">
                {r.rewardedCount}/{nextGoal}
              </span>
            </div>
            <ProgressBar value={r.rewardedCount / nextGoal} tone="gold" className="h-1.5" label={t("Next goal: {n} friends", { n: nextGoal })} />
          </div>
          {r.invited.length > 0 && (
            <ul className="relative mt-4 space-y-1">
              {r.invited.slice(0, 8).map((f) => (
                <li key={f.id} className="flex items-center gap-3 rounded-xl px-2 py-1.5">
                  <Avatar {...avatarOf(f)} size={30} />
                  <span className="min-w-0 flex-1 truncate text-sm">{f.displayName}</span>
                  {f.rewarded ? (
                    <span className="inline-flex items-center gap-1 text-xs text-green-300">
                      <CircleCheck className="h-3.5 w-3.5" aria-hidden /> +{r.rules.inviterXp} XP
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-subtle">
                      <Hourglass className="h-3.5 w-3.5" aria-hidden /> {t("Waiting for first check-in")}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </Card>
  );
}
