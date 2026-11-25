"use client";

import { useT } from "@/lib/i18n/client";
import { CategoryIcon } from "@/components/brand/category-icon";

import { Camera, ChevronLeft, Crown, Globe, Lock, Minus, Plus, Rocket, Users } from "lucide-react";
import Link from "next/link";
import { useActionState, useState } from "react";
import { createChallengeAction } from "@/lib/actions/challenges";
import { DURATION_OPTIONS, LIMITS, XP_RULES } from "@/lib/config/game";
import { CATEGORIES, CATEGORY_META, DIFFICULTIES, DIFFICULTY_META } from "@/lib/config/taxonomy";
import type { Category, Difficulty } from "@/lib/types";
import { Avatar, avatarOf } from "@/components/ui/avatar";
import { cn } from "@/components/ui/cn";
import { Field, FormAlert, Input, inputClass, Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";

export interface CreateDefaults {
  title?: string;
  description?: string;
  difficulty?: Difficulty;
  category?: Category;
  durationDays?: number;
  tasks?: string[];
  requiresProof?: boolean;
  squadId?: string;
}

function Toggle({ name, label, hint, defaultChecked, disabled, icon }: { name: string; label: string; hint?: string; defaultChecked?: boolean; disabled?: boolean; icon?: React.ReactNode }) {
  const t = useT();
  return (
    <label className={cn("flex items-center gap-3 rounded-2xl border-2 border-line px-4 py-3", disabled ? "opacity-60" : "cursor-pointer hover:bg-ink-3")}>
      {icon}
      <span className="flex-1">
        <span className="block text-sm font-extrabold">{t(label)}</span>
        {hint && <span className="block text-xs font-semibold text-subtle">{t(hint)}</span>}
      </span>
      <input type="checkbox" name={name} defaultChecked={defaultChecked} disabled={disabled} className="peer sr-only" />
      <span className="relative h-7 w-12 shrink-0 rounded-full bg-line-strong transition peer-checked:bg-green peer-focus-visible:ring-2 peer-focus-visible:ring-violet-2 after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-5" aria-hidden />
    </label>
  );
}

const STEPS = ["What", "Rules", "Players", "Go"] as const;
type Mode = "solo" | "friends" | "squad";

/**
 * Four short steps instead of one long form. Every input stays inside the same
 * <form> (hidden steps are just not displayed), so submission and server-side
 * validation are unchanged; on an error we jump back to the step that has it.
 */
export function CreateChallengeForm({
  squads,
  friends,
  isPremium,
  defaults = {},
}: {
  squads: { id: string; name: string }[];
  friends: { id: string; displayName: string; username: string; avatarColor: string; avatarUrl: string | null; avatarFrame: string }[];
  isPremium: boolean;
  defaults?: CreateDefaults;
}) {
  const t = useT();
  const [state, action] = useActionState(createChallengeAction, null);
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState(defaults.title ?? "");
  const [category, setCategory] = useState<Category>(defaults.category ?? "fitness");
  const [difficulty, setDifficulty] = useState<Difficulty>(defaults.difficulty ?? "medium");
  const [xp, setXp] = useState<number>(() => {
    const r = XP_RULES.difficultyRange[defaults.difficulty ?? "medium"];
    return Math.round((r.min + r.max) / 2);
  });
  const [duration, setDuration] = useState<number>(defaults.durationDays ?? 7);
  const [tasks, setTasks] = useState<string[]>(defaults.tasks?.length ? defaults.tasks : [""]);
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [mode, setMode] = useState<Mode>(defaults.squadId ? "squad" : "solo");
  const [squadId, setSquadId] = useState(defaults.squadId ?? "");
  const fe = state && !state.ok ? state.fieldErrors : undefined;
  const range = XP_RULES.difficultyRange[difficulty];

  // Send the user back to the step that holds the first error.
  const [seen, setSeen] = useState<typeof state>(null);
  if (state !== seen) {
    setSeen(state);
    if (fe) {
      const keys = Object.keys(fe);
      if (keys.some((k) => k === "title" || k === "description" || k === "category")) setStep(0);
      else if (keys.some((k) => k.startsWith("tasks") || k === "durationDays" || k === "difficulty" || k === "xpReward")) setStep(1);
    }
  }

  const canNext = step === 0 ? title.trim().length >= LIMITS.titleMin : step === 1 ? tasks.some((x) => x.trim()) : true;
  const effectiveSquad = mode === "squad" ? squadId : "";

  return (
    <form action={action} className="mx-auto max-w-xl" noValidate>
      {/* Progress: one bar, four beats */}
      <div className="mb-6 flex items-center gap-3">
        {step > 0 && (
          <button type="button" onClick={() => setStep(step - 1)} className="rounded-xl p-1.5 text-subtle hover:bg-ink-3" aria-label={t("Back")}>
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}
        <div className="h-4 flex-1 overflow-hidden rounded-full bg-ink-3" role="progressbar" aria-valuemin={1} aria-valuemax={4} aria-valuenow={step + 1} aria-label={t("Step {n} of {total}", { n: step + 1, total: 4 })}>
          <div className="relative h-full rounded-full bg-green transition-[width] duration-500" style={{ width: `${((step + 1) / 4) * 100}%` }}>
            <span className="absolute inset-x-[6px] top-[22%] h-[26%] rounded-full bg-white/30" aria-hidden />
          </div>
        </div>
        <span className="text-xs font-black uppercase tracking-wider text-subtle">{t(STEPS[step])}</span>
      </div>

      {/* 1 · What */}
      <section className={cn("space-y-6", step !== 0 && "hidden")}>
        <h2 className="font-display text-[26px] font-black leading-tight">{t("What's the mission?")}</h2>
        <fieldset>
          <legend className="mb-3 text-sm font-extrabold">{t("Pick a world")}</legend>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
            {CATEGORIES.map((c) => (
              <label key={c} className="cursor-pointer">
                <input type="radio" name="category" value={c} checked={category === c} onChange={() => setCategory(c)} className="peer sr-only" />
                <span className="flex flex-col items-center gap-1 rounded-2xl border-2 border-transparent p-1.5 text-center text-[11px] font-extrabold text-muted transition-colors peer-checked:border-violet peer-checked:bg-violet-soft peer-checked:text-violet-2 peer-focus-visible:ring-2 peer-focus-visible:ring-violet-2 hover:bg-ink-3">
                  <CategoryIcon category={c} size={46} />
                  <span className="w-full truncate">{t(CATEGORY_META[c].label)}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <Field label={t("Challenge title")} htmlFor="title" error={fe?.title}>
          <Input id="title" name="title" required minLength={LIMITS.titleMin} maxLength={LIMITS.titleMax} value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("e.g. One beat a day")} invalid={Boolean(fe?.title)} />
        </Field>
        <Field label={t("Description")} htmlFor="description" error={fe?.description} hint={t("Explain the rules. Keep it challenging — but safe.")}>
          <Textarea id="description" name="description" required maxLength={LIMITS.descriptionMax} defaultValue={defaults.description} placeholder={t("What counts, what doesn't, and why it matters.")} invalid={Boolean(fe?.description)} />
        </Field>
      </section>

      {/* 2 · Rules */}
      <section className={cn("space-y-6", step !== 1 && "hidden")}>
        <h2 className="font-display text-[26px] font-black leading-tight">{t("Set the rules")}</h2>
        <fieldset>
          <legend className="mb-1 text-sm font-extrabold">{t("Daily tasks")}</legend>
          <p className="mb-3 text-xs font-semibold text-subtle">{t("Participants tick every task to check in each day.")}</p>
          <ul className="space-y-2">
            {tasks.map((task, i) => (
              <li key={i} className="flex gap-2">
                <label htmlFor={`task-${i}`} className="sr-only">
                  {t("Task {n}", { n: i + 1 })}
                </label>
                <Input id={`task-${i}`} name="tasks" value={task} maxLength={LIMITS.taskMax} onChange={(e) => setTasks((ts) => ts.map((x, j) => (j === i ? e.target.value : x)))} placeholder={i === 0 ? t("e.g. Make one beat") : t("Another task")} invalid={Boolean(fe?.[`tasks.${i}`])} />
                {tasks.length > 1 && (
                  <button type="button" onClick={() => setTasks((ts) => ts.filter((_, j) => j !== i))} className="grid w-12 shrink-0 place-items-center rounded-2xl border-2 border-line text-muted hover:bg-ink-3" aria-label={t("Remove task {n}", { n: i + 1 })}>
                    <Minus className="h-4 w-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>
          {(fe?.tasks || Object.keys(fe ?? {}).some((k) => k.startsWith("tasks."))) && (
            <p className="mt-2 text-xs font-bold text-red-300">{fe?.tasks ?? Object.entries(fe ?? {}).find(([k]) => k.startsWith("tasks."))?.[1]}</p>
          )}
          {tasks.length < LIMITS.maxTasks && (
            <button type="button" onClick={() => setTasks((ts) => [...ts, ""])} className="mt-2 inline-flex items-center gap-1.5 text-sm font-extrabold uppercase tracking-wide text-violet-2">
              <Plus className="h-4 w-4" aria-hidden /> {t("Add task")}
            </button>
          )}
        </fieldset>
        <fieldset>
          <legend className="mb-3 text-sm font-extrabold">{t("How long?")}</legend>
          <div className="grid grid-cols-5 gap-2">
            {DURATION_OPTIONS.map((d) => (
              <label key={d.days} className="cursor-pointer">
                <input type="radio" name="durationDays" value={d.days} checked={duration === d.days} onChange={() => setDuration(d.days)} className="peer sr-only" />
                <span className="block rounded-2xl border-2 border-line py-2.5 text-center transition-colors peer-checked:border-electric peer-checked:bg-electric/10 peer-focus-visible:ring-2 peer-focus-visible:ring-violet-2">
                  <span className="block text-lg font-black tabular-nums">{d.days}</span>
                  <span className="block text-[10px] font-extrabold uppercase text-subtle">{t.p(d.days, "day", "days")}</span>
                </span>
              </label>
            ))}
          </div>
          {fe?.durationDays && <p className="mt-2 text-xs font-bold text-red-300">{fe.durationDays}</p>}
        </fieldset>
        <fieldset>
          <legend className="mb-3 text-sm font-extrabold">{t("Difficulty")}</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {DIFFICULTIES.map((d) => {
              const m = DIFFICULTY_META[d];
              const r = XP_RULES.difficultyRange[d];
              return (
                <label key={d} className={cn("cursor-pointer rounded-2xl border-2 p-3 transition-colors", difficulty === d ? cn(m.bg, "border-current", m.text) : "border-line hover:bg-ink-3")}>
                  <input
                    type="radio"
                    name="difficulty"
                    value={d}
                    checked={difficulty === d}
                    onChange={() => {
                      setDifficulty(d);
                      setXp(Math.round((r.min + r.max) / 2));
                    }}
                    className="sr-only"
                  />
                  <span className={cn("block text-sm font-black uppercase", m.text)}>{t(m.label)}</span>
                  <span className="mt-0.5 block text-xs font-bold text-muted">
                    {r.min}–{r.max} XP
                  </span>
                </label>
              );
            })}
          </div>
          <div className="mt-4">
            <label htmlFor="xpReward" className="flex items-center justify-between text-sm">
              <span className="font-extrabold">{t("XP per check-in")}</span>
              <span className={cn("font-display text-lg font-black", DIFFICULTY_META[difficulty].text)}>{xp} XP</span>
            </label>
            <input id="xpReward" name="xpReward" type="range" min={range.min} max={range.max} value={xp} onChange={(e) => setXp(Number(e.target.value))} className="mt-2 w-full accent-violet" />
            <p className="text-xs font-semibold text-subtle">{t("Capped by difficulty so every challenge stays fair.")}</p>
          </div>
        </fieldset>
      </section>

      {/* 3 · Players */}
      <section className={cn("space-y-6", step !== 2 && "hidden")}>
        <h2 className="font-display text-[26px] font-black leading-tight">{t("Who's playing?")}</h2>
        <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label={t("Mode")}>
          {([
            ["solo", "Solo", "Just me", Rocket],
            ["friends", "Friends", "Invite your crew", Users],
            ["squad", "Squad", "For a whole squad", Globe],
          ] as const).map(([v, label, hint, I]) => (
            <button
              key={v}
              type="button"
              role="radio"
              aria-checked={mode === v}
              disabled={v === "squad" && !squads.length}
              onClick={() => {
                setMode(v);
                if (v !== "squad") setSquadId("");
                else if (!squadId && squads[0]) setSquadId(squads[0].id);
              }}
              className={cn("flex flex-col items-center gap-1 rounded-2xl border-2 p-3 text-center transition-colors disabled:opacity-40", mode === v ? "border-violet bg-violet-soft text-violet-2" : "border-line text-muted hover:bg-ink-3")}
            >
              <I className="h-6 w-6" aria-hidden />
              <span className="text-sm font-black">{t(label)}</span>
              <span className="text-[11px] font-semibold leading-tight text-subtle">{t(hint)}</span>
            </button>
          ))}
        </div>
        <input type="hidden" name="squadId" value={effectiveSquad} />
        {mode === "squad" && squads.length > 0 && (
          <Field label={t("Which squad?")} htmlFor="squadPick" hint={t("Only squad members can see and join it.")}>
            <select id="squadPick" value={squadId} onChange={(e) => setSquadId(e.target.value)} className={inputClass}>
              {squads.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </Field>
        )}
        <div className={cn(mode !== "friends" && "hidden")}>
          <p className="mb-2 text-sm font-extrabold">{t("Invite friends")}</p>
          {friends.length ? (
            <ul className="max-h-64 space-y-1 overflow-y-auto rounded-2xl border-2 border-line p-1.5">
              {friends.map((f) => (
                <li key={f.id}>
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-ink-3">
                    <input type="checkbox" name="invite" value={f.id} disabled={mode !== "friends"} className="h-5 w-5 accent-green" />
                    <Avatar {...avatarOf(f)} size={32} />
                    <span className="min-w-0 text-sm">
                      <span className="block truncate font-bold">{f.displayName}</span>
                      <span className="block truncate text-xs text-subtle">@{f.username}</span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">
              {t("Follow people from the league to invite them.")}{" "}
              <Link href="/leaderboard" className="font-bold text-violet-2 hover:underline">
                {t("League")}
              </Link>
            </p>
          )}
        </div>
        <fieldset>
          <legend className="mb-2 text-sm font-extrabold">{t("Visibility")}</legend>
          <div className="grid grid-cols-2 gap-2">
            {([
              ["public", "Public", Globe],
              ["private", "Private", Lock],
            ] as const).map(([v, label, I]) => (
              <label key={v} className="cursor-pointer">
                <input type="radio" name="visibility" value={v} checked={visibility === v} onChange={() => setVisibility(v)} disabled={Boolean(effectiveSquad)} className="peer sr-only" />
                <span className="flex items-center justify-center gap-2 rounded-2xl border-2 border-line py-2.5 text-sm font-extrabold transition-colors peer-checked:border-violet peer-checked:bg-violet-soft peer-checked:text-violet-2 peer-disabled:opacity-50 peer-focus-visible:ring-2 peer-focus-visible:ring-violet-2">
                  <I className="h-4 w-4" aria-hidden /> {t(label)}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      {/* 4 · Go */}
      <section className={cn("space-y-5", step !== 3 && "hidden")}>
        <div className="flex items-center gap-4">
          <CategoryIcon category={category} size={72} />
          <div className="min-w-0">
            <h2 className="font-display text-[24px] font-black leading-tight">{title || t("Your challenge")}</h2>
            <p className="text-sm font-bold text-subtle">
              {t.p(duration, "{n} day", "{n} days")} · <span className={DIFFICULTY_META[difficulty].text}>+{xp} XP</span> {t("per day")}
            </p>
          </div>
        </div>
        <ul className="space-y-1.5">
          {tasks.filter((x) => x.trim()).map((x, i) => (
            <li key={i} className="flex items-center gap-2 text-sm font-bold">
              <span className="h-2 w-2 shrink-0 rounded-full bg-violet" aria-hidden /> {x}
            </li>
          ))}
        </ul>
        <Toggle name="requiresProof" label={t("Require proof")} hint={t("Check-ins need a photo, link or description and are verified by you")} defaultChecked={defaults.requiresProof} icon={<Camera className="h-5 w-5 text-muted" aria-hidden />} />
        <Toggle name="joinNow" label={t("Join it myself")} hint={t("Start today")} defaultChecked icon={<Rocket className="h-5 w-5 text-muted" aria-hidden />} />
        <Toggle
          name="isTemplate"
          label={t("Save as template")}
          hint={isPremium ? t("Reuse it later — templates aren't joinable") : t("Premium feature")}
          disabled={!isPremium}
          icon={<Crown className={cn("h-5 w-5", isPremium ? "text-gold" : "text-subtle")} aria-hidden />}
        />
      </section>

      <div className="mt-8 space-y-3">
        {state && !state.ok && <FormAlert>{state.error}</FormAlert>}
        {step < 3 ? (
          <Button type="button" size="lg" variant="success" className="w-full" disabled={!canNext} onClick={() => setStep(step + 1)}>
            {t("Continue")}
          </Button>
        ) : (
          <SubmitButton size="lg" variant="success" className="w-full" pendingText={t("Creating…")}>
            {t("Launch challenge")}
          </SubmitButton>
        )}
      </div>
    </form>
  );
}
