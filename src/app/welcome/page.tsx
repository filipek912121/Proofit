import { getT } from "@/lib/i18n/server";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { Onboarding } from "@/components/onboarding/onboarding";
import { requireUser } from "@/lib/auth";
import { getStore } from "@/lib/data";
import { env } from "@/lib/env";
import { activeChallenges } from "@/lib/services/challenges";
import { getProxiLook } from "@/lib/services/proxi";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("Welcome") };
}

/** First run: meet PROXI → choose an area → start a real mission → (optional) invite → go. */
export default async function WelcomePage() {
  const t = await getT();
  const me = await requireUser();
  const [proxi, official, active] = await Promise.all([getProxiLook(me.id), getStore().listChallenges({ publicOnly: true }), activeChallenges(me.id)]);
  const missions = official
    .filter((c) => c.isOfficial && !c.isTemplate && !c.squadId && c.durationDays <= 14)
    .sort((a, b) => a.durationDays - b.durationDays)
    .map((c) => ({ id: c.id, title: t(c.title), category: c.category, durationDays: c.durationDays, xp: c.xpReward }));
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const origin = host ? `${h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https")}://${host}` : env.siteUrl;
  return (
    <Onboarding
      name={me.displayName.split(" ")[0]}
      proxi={{ stage: proxi.stage, look: proxi.look }}
      missions={missions}
      alreadyActive={active.map((a) => a.challenge.id)}
      inviteLink={`${origin}/signup?ref=${encodeURIComponent(me.username)}`}
    />
  );
}
