import { getT } from "@/lib/i18n/server";
import { Award, Bell, BellRing, ChevronRight, CircleCheck, ShieldCheck, Sparkles, type LucideIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ProxiAvatar } from "@/components/proxi/proxi-avatar";
import { InvitesPanel } from "@/components/social/invites-panel";
import { ListGroup, PageHeader, SectionTitle } from "@/components/ui/card";
import { cn } from "@/components/ui/cn";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/i18n/core";
import { buildNotifications, type NotificationKind } from "@/lib/services/notifications";
import { getProxiLook } from "@/lib/services/proxi";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("Notifications") };
}

const ICON: Record<NotificationKind, { I: LucideIcon; tone: string }> = {
  proxi: { I: Sparkles, tone: "bg-violet/12 text-violet-2" },
  reminder: { I: BellRing, tone: "bg-electric/12 text-blue-300" },
  review: { I: ShieldCheck, tone: "bg-easy/12 text-green-300" },
  proof: { I: CircleCheck, tone: "bg-easy/12 text-green-300" },
  achievement: { I: Award, tone: "bg-gold/12 text-gold" },
};

export default async function NotificationsPage() {
  const t = await getT();
  const me = await requireUser();
  const [n, proxi] = await Promise.all([buildNotifications(me.id), getProxiLook(me.id)]);
  const empty = !n.items.length && !n.invites.length && !n.duelInvites.length;
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader eyebrow={t("Inbox")} title={t("Notifications")} />
      <InvitesPanel invites={n.invites} duels={n.duelInvites} />
      {n.items.length > 0 && (
        <section aria-label={t("Updates")}>
          <SectionTitle title={t("Updates")} />
          <ListGroup>
            {n.items.map((item, i) => {
              const { I, tone } = ICON[item.kind];
              const params = Object.fromEntries(Object.entries(item.params ?? {}).map(([k, v]) => [k, typeof v === "string" ? t(v) : v]));
              return (
                <Link key={item.id} href={item.href} className="tap flex items-center gap-3 px-4 py-3.5 hover:bg-tint/[0.03] animate-rise" style={{ animationDelay: `${i * 40}ms` }}>
                  {item.kind === "proxi" ? (
                    <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-violet/12">
                      <ProxiAvatar stage={proxi.stage} look={proxi.look} mood="excited" size={38} animate={false} />
                    </span>
                  ) : (
                    <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", tone)}>
                      <I className="h-5 w-5" aria-hidden />
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className={cn("block text-sm", item.unread ? "font-semibold" : "font-medium")}>{t(item.title, params)}</span>
                    {item.at && <span className="block text-xs text-subtle">{formatDate(item.at, t.locale)}</span>}
                  </span>
                  {item.unread && <span className="h-2 w-2 shrink-0 rounded-full bg-violet" aria-label={t("New")} />}
                  <ChevronRight className="h-4 w-4 shrink-0 text-subtle" aria-hidden />
                </Link>
              );
            })}
          </ListGroup>
        </section>
      )}
      {empty && <EmptyState icon={Bell} title={t("You're all caught up")} text={t("Invites, PROXI news and proof reviews will show up here.")} />}
    </div>
  );
}
