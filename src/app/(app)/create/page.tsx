import { getT } from "@/lib/i18n/server";
import { Crown, LayoutTemplate } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { CreateChallengeForm, type CreateDefaults } from "@/components/challenges/create-challenge-form";
import { DifficultyBadge } from "@/components/ui/badges";
import { CategoryIcon } from "@/components/brand/category-icon";
import { PRESETS } from "@/lib/config/presets";
import { PageHeader } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { getStore } from "@/lib/data";
import { getEntitlements } from "@/lib/services/entitlements";
import { friends as getFriends } from "@/lib/services/social";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("Create challenge") };
}

export default async function CreatePage({ searchParams }: { searchParams: Promise<{ template?: string; squad?: string; preset?: string }> }) {
  const t = await getT();
  const me = await requireUser();
  const sp = await searchParams;
  const store = getStore();
  const [ent, memberships, friends, mine] = await Promise.all([
    getEntitlements(me.id),
    store.listSquadMembers({ userId: me.id }),
    getFriends(me.id),
    store.listChallenges({ creatorId: me.id }),
  ]);
  const squads = await store.listSquads({ ids: memberships.map((m) => m.squadId) });
  const templates = mine.filter((c) => c.isTemplate && c.creatorId === me.id);

  let defaults: CreateDefaults = {};
  if (sp.template) {
    const t = await store.getChallenge(sp.template.slice(0, 64));
    // Only your own templates or public challenges can be used as a starting point.
    if (t && (t.creatorId === me.id || (t.visibility === "public" && !t.squadId)))
      defaults = { title: t.title, description: t.description, difficulty: t.difficulty, category: t.category, durationDays: t.durationDays, tasks: t.tasks, requiresProof: t.requiresProof };
  }
  const preset = PRESETS.find((x) => x.key === sp.preset);
  if (preset && !sp.template)
    defaults = { title: t(preset.title), description: t(preset.description), category: preset.category, difficulty: preset.difficulty, durationDays: preset.durationDays, tasks: preset.tasks.map((x) => t(x)), requiresProof: false };
  if (sp.squad && squads.some((s) => s.id === sp.squad)) defaults.squadId = sp.squad;

  return (
    <>
      <PageHeader title={t("New challenge")} subtitle={t("Start from an idea or build your own.")} />
      <section className="mb-8" aria-label={t("Quick start")}>
        <h2 className="mb-3 font-display text-[19px] font-extrabold">{t("Quick start")}</h2>
        <div className="no-scrollbar -mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1">
          {PRESETS.map((x) => (
            <Link key={x.key} href={`/create?preset=${x.key}`} scroll={false} className={`tile flex w-36 shrink-0 flex-col gap-2 rounded-2xl p-3 ${sp.preset === x.key ? "!border-violet bg-violet-soft" : ""}`}>
              <CategoryIcon category={x.category} size={40} />
              <span className="text-sm font-extrabold leading-snug">{t(x.title)}</span>
              <span className="mt-auto text-xs font-bold text-subtle">{t.p(x.durationDays, "{n} day", "{n} days")}</span>
            </Link>
          ))}
        </div>
      </section>
      {ent.isPremium ? (
        templates.length > 0 && (
          <section className="mb-6" aria-label={t("Your templates")}>
            <p className="mb-2 flex items-center gap-2 text-sm font-medium text-muted">
              <LayoutTemplate className="h-4 w-4" aria-hidden />{" "}{t("Your templates")}
            </p>
            <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
              {templates.map((tpl) => (
                <Link key={tpl.id} href={`/create?template=${tpl.id}`} className="glass flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm hover:border-line-strong">
                  <DifficultyBadge difficulty={tpl.difficulty} /> {tpl.title}
                </Link>
              ))}
            </div>
          </section>
        )
      ) : (
        <Link href="/premium" className="mb-6 flex items-center gap-3 rounded-2xl bg-gold/[0.07] px-4 py-3 text-sm ring-1 ring-gold/20 hover:ring-gold/40">
          <Crown className="h-4 w-4 shrink-0 text-gold" aria-hidden />
          <span className="text-muted">
            <span className="font-semibold text-fg">{t("Premium")}</span>{" "}{t("unlocks reusable templates and more private challenges.")}
          </span>
        </Link>
      )}
      <CreateChallengeForm
        key={sp.template ?? sp.preset ?? "new"}
        squads={squads.map((s) => ({ id: s.id, name: s.name }))}
        friends={friends.map((f) => ({ id: f.id, displayName: f.displayName, username: f.username, avatarColor: f.avatarColor, avatarUrl: f.avatarUrl, avatarFrame: f.avatarFrame }))}
        isPremium={ent.isPremium}
        defaults={defaults}
      />
    </>
  );
}
