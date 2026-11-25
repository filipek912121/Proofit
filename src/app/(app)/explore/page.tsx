import { getT } from "@/lib/i18n/server";
import { Plus, SearchX, Zap } from "lucide-react";
import Link from "next/link";
import { CategoryIcon } from "@/components/brand/category-icon";
import { DIFFICULTY_META } from "@/lib/config/taxonomy";
import { cn } from "@/components/ui/cn";
import type { Metadata } from "next";
import { Suspense } from "react";
import { ChallengeCard } from "@/components/challenges/challenge-card";
import { ChallengeFilters } from "@/components/challenges/filters";
import { LinkButton } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth";
import { isCategory, isDifficulty } from "@/lib/config/taxonomy";
import { exploreChallenges } from "@/lib/services/challenges";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("Explore challenges") };
}

type SP = Promise<{ q?: string; difficulty?: string; category?: string; sort?: string }>;

export default async function ExplorePage({ searchParams }: { searchParams: SP }) {
  const t = await getT();
  const me = await requireUser();
  const sp = await searchParams;
  const list = await exploreChallenges(me.id, {
    q: sp.q?.slice(0, 80),
    difficulty: isDifficulty(sp.difficulty) ? sp.difficulty : undefined,
    category: isCategory(sp.category) ? sp.category : undefined,
    sort: sp.sort === "new" || sp.sort === "xp" ? sp.sort : "popular",
  });
  const filtered = Boolean(sp.q || sp.difficulty || sp.category || (sp.sort && sp.sort !== "popular"));
  const today = filtered ? [] : list.filter((c) => c.durationDays === 1 && !c.joined).slice(0, 8);
  return (
    <>
      <PageHeader
        title={t("Challenges")}
        subtitle={t("Pick a mission. Or make your own and bring friends.")}
        action={
          <LinkButton href="/create" variant="success" icon={<Plus className="h-4 w-4" strokeWidth={3} />}>
            {t("Create")}
          </LinkButton>
        }
      />
      {today.length > 0 && (
        <section className="mb-6" aria-label={t("For today")}>
          <h2 className="mb-3 font-display text-[19px] font-extrabold">{t("Quick missions for today")}</h2>
          <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 lg:mx-0 lg:px-0">
            {today.map((c, i) => (
              <Link key={c.id} href={`/challenges/${c.id}`} className="tile w-40 shrink-0 snap-start rounded-2xl p-3.5 animate-rise" style={{ animationDelay: `${i * 40}ms` }}>
                <CategoryIcon category={c.category} size={44} />
                <p className="mt-2 line-clamp-2 text-sm font-semibold leading-snug">{t(c.title)}</p>
                <p className={cn("mt-1.5 inline-flex items-center gap-1 text-xs font-bold", DIFFICULTY_META[c.difficulty].text)}>
                  <Zap className="h-3 w-3" aria-hidden /> {t("{n} XP/day", { n: c.xpReward })}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
      <Suspense fallback={<div className="skeleton h-28 rounded-2xl" />}>
        <ChallengeFilters />
      </Suspense>
      <p className="mb-4 mt-6 text-sm text-muted" aria-live="polite">
        {t.p(list.length, "{n} challenge", "{n} challenges")}
      </p>
      {list.length ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {list.map((c, i) => (
            <ChallengeCard key={c.id} c={c} index={i} />
          ))}
        </div>
      ) : (
        <EmptyState icon={SearchX} title={t("No challenges match")} text={t("Try another filter — or create exactly the challenge you're looking for.")} action={<LinkButton href="/create">{t("Create a challenge")}</LinkButton>} />
      )}
    </>
  );
}
