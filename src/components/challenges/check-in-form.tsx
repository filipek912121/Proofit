"use client";

import { useT } from "@/lib/i18n/client";

import { Camera, Check, CircleCheck, Flame, Hourglass, ImagePlus, Link2, PartyPopper, FileText, Sparkles, Trophy, X, Zap } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import { checkInAction } from "@/lib/actions/challenges";
import { LIMITS } from "@/lib/config/game";
import type { ProofKind } from "@/lib/types";
import { cn } from "@/components/ui/cn";
import { Confetti } from "@/components/ui/confetti";
import { ProxiBuddy } from "@/components/proxi/proxi-buddy";
import { propForCategory } from "@/lib/proxi/props";
import { ProxiCelebration } from "@/components/proxi/proxi-celebration";
import { XpGainBar } from "@/components/proxi/xp-gain-bar";
import type { ProxiLook, ProxiStage } from "@/lib/proxi/config";
import { pickLine } from "@/lib/proxi/messages";
import { CountUp } from "@/components/ui/count-up";
import { Field, FormAlert, Input, Textarea } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { Button } from "@/components/ui/button";

export function CheckInForm({
  challengeId,
  tasks,
  requiresProof,
  today,
  proxi,
  category,
}: {
  challengeId: string;
  tasks: string[];
  requiresProof: boolean;
  /** Today's existing check-in, if any (from the server). */
  today: { status: "approved" | "pending"; xp: number } | null;
  /** The user's PROXI, which reacts to the result. */
  proxi: { stage: ProxiStage; look: ProxiLook };
  /** Challenge category — PROXI shows up with matching gear. */
  category?: string;
}) {
  const t = useT();
  // Kept mounted across the post-action refresh so the result celebration stays visible.
  const [state, action] = useActionState(checkInAction, null);
  const [done, setDone] = useState<string[]>([]);
  const [kind, setKind] = useState<ProofKind>("photo");
  const [preview, setPreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => void (preview && URL.revokeObjectURL(preview)), [preview]);

  if (state?.ok && state.data) return <CheckInResultView r={state.data} proxi={proxi} category={category} />;
  if (today) return <TodayStatus status={today.status} xp={today.xp} />;

  const allDone = tasks.every((task) => done.includes(task));
  const fe = state && !state.ok ? state.fieldErrors : undefined;

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="challengeId" value={challengeId} />
      <fieldset>
        <legend className="mb-3 font-display text-[19px] font-extrabold">{t("Today's goal")}</legend>
        <ul className="space-y-2">
          {tasks.map((task) => {
            const checked = done.includes(task);
            return (
              <li key={task}>
                <label
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-2xl border-2 px-4 py-3.5 transition-colors",
                    checked ? "border-green/60 bg-green/10" : "border-line hover:bg-ink-3",
                  )}
                >
                  <input
                    type="checkbox"
                    name="tasksDone"
                    value={task}
                    checked={checked}
                    onChange={(e) => setDone((d) => (e.target.checked ? [...d, task] : d.filter((x) => x !== task)))}
                    className="peer sr-only"
                  />
                  <span
                    className={cn(
                      "grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 transition peer-focus-visible:ring-2 peer-focus-visible:ring-violet-2",
                      checked ? "border-green bg-green text-white" : "border-line-strong",
                    )}
                    aria-hidden
                  >
                    {checked && <Check className="h-5 w-5 animate-check" strokeWidth={3.5} />}
                  </span>
                  <span className={cn("text-[15px] font-bold", checked && "text-muted")}>{t(task)}</span>
                </label>
              </li>
            );
          })}
        </ul>
        {fe?.tasks && <p className="mt-2 text-xs text-red-300">{fe.tasks}</p>}
      </fieldset>

      {requiresProof && (
        <fieldset className="space-y-3">
          <legend className="mb-2 text-sm font-medium">
            {t("Proof")}{" "}<span className="font-normal text-muted">{t("— reviewed before XP is awarded")}</span>
          </legend>
          <input type="hidden" name="proofKind" value={kind} />
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label={t("Proof type")}>
            {([
              ["photo", "Photo", Camera],
              ["link", "Link", Link2],
              ["text", "Describe", FileText],
            ] as const).map(([k, label, I]) => (
              <button
                key={k}
                type="button"
                role="radio"
                aria-checked={kind === k}
                onClick={() => setKind(k)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 rounded-2xl border-2 py-3 text-xs font-extrabold uppercase tracking-wide transition-colors",
                  kind === k ? "border-violet bg-violet-soft text-violet-2" : "border-line text-muted hover:bg-ink-3",
                )}
              >
                <I className="h-6 w-6" aria-hidden /> {t(label)}
              </button>
            ))}
          </div>

          {kind === "photo" && (
            <div>
              <label
                htmlFor="proofFile"
                className={cn(
                  "group relative flex min-h-40 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition",
                  preview ? "border-violet/40" : "border-line-strong hover:border-violet/50 hover:bg-violet/5",
                )}
              >
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview} alt={t("Selected proof preview")} className="max-h-72 w-full object-cover" />
                ) : (
                  <>
                    <ImagePlus className="mb-2 h-8 w-8 text-violet-2" aria-hidden />
                    <span className="text-sm font-medium">{t("Tap to take or upload a photo")}</span>
                    <span className="mt-1 text-xs text-subtle">{t("JPG, PNG, WEBP or HEIC · max 5 MB")}</span>
                  </>
                )}
              </label>
              <input
                ref={fileRef}
                id="proofFile"
                name="proofFile"
                type="file"
                accept={LIMITS.proofMimeTypes.join(",")}
                capture="environment"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  setFileError(null);
                  if (!f) return setPreview(null);
                  if (f.size > LIMITS.proofMaxBytes) {
                    setFileError(t("That photo is over 5 MB. Choose a smaller one."));
                    e.target.value = "";
                    return setPreview(null);
                  }
                  setPreview(URL.createObjectURL(f));
                }}
              />
              {preview && (
                <button
                  type="button"
                  className="mt-2 inline-flex items-center gap-1 text-xs text-muted hover:text-fg"
                  onClick={() => {
                    if (fileRef.current) fileRef.current.value = "";
                    setPreview(null);
                  }}
                >
                  <X className="h-3.5 w-3.5" aria-hidden />{" "}{t("Remove photo")}
                </button>
              )}
              {(fileError || fe?.proof) && <p className="mt-2 text-xs text-red-300">{fileError ?? fe?.proof}</p>}
            </div>
          )}
          {kind === "link" && (
            <Field label={t("Link to your proof")} htmlFor="proofUrl" error={fe?.proofUrl ?? fe?.proof} hint={t("e.g. a Strava activity or a shared screenshot (https only)")}>
              <Input id="proofUrl" name="proofUrl" type="url" inputMode="url" placeholder="https://" invalid={Boolean(fe?.proofUrl)} required />
            </Field>
          )}
          <Field label={kind === "text" ? t("What did you do?") : t("Caption (optional)")} htmlFor="proofText" error={kind === "text" ? fe?.proof : undefined}>
            <Textarea id="proofText" name="proofText" maxLength={LIMITS.noteMax} placeholder={kind === "text" ? t("Describe what you did in detail…") : t("Add context for the reviewer")} required={kind === "text"} minLength={kind === "text" ? 10 : undefined} />
          </Field>
          <p className="text-xs text-subtle">{t("Proof is reviewed by the challenge creator or verified finishers. Uploading a photo doesn't automatically count as completion.")}
          </p>
        </fieldset>
      )}

      <Field label={t("Note (optional)")} htmlFor="note">
        <Input id="note" name="note" maxLength={LIMITS.noteMax} placeholder={t("How did it go?")} />
      </Field>

      {state && !state.ok && <FormAlert>{state.error}</FormAlert>}
      <SubmitButton size="lg" variant={allDone ? "success" : "secondary"} className="h-auto min-h-14 w-full whitespace-normal py-3 text-center" disabled={!allDone} pendingText={requiresProof ? t("Uploading proof…") : t("Checking in…")} icon={<CircleCheck className="h-5 w-5" />}>
        {allDone ? (requiresProof ? t("Submit for verification") : t("Complete today’s check-in")) : t.p(tasks.length, "Tick {n} task to continue", "Tick all {n} tasks to continue")}
      </SubmitButton>
    </form>
  );
}

function TodayStatus({ status, xp }: { status: "approved" | "pending"; xp: number }) {
  const t = useT();
  const pending = status === "pending";
  return (
    <div className={cn("flex items-center gap-4 rounded-2xl border-2 p-4", pending ? "border-gold/50 bg-gold/10" : "border-green/50 bg-green/10")} role="status">
      <span className={cn("grid h-12 w-12 shrink-0 place-items-center rounded-full text-white", pending ? "bg-gold" : "bg-green")}>
        {pending ? <Hourglass className="h-6 w-6" aria-hidden /> : <Check className="h-7 w-7" strokeWidth={3.5} aria-hidden />}
      </span>
      <div>
        <p className="font-extrabold">{pending ? t("Proof pending verification") : t("Checked in today · +{n} XP", { n: xp })}</p>
        <p className="text-sm text-muted">{pending ? t("XP is added once a reviewer approves it.") : t("Come back tomorrow to keep your streak.")}</p>
      </div>
    </div>
  );
}

/**
 * The payoff moment, modelled on a "lesson complete" screen: full screen, PROXI
 * front and centre, three stat tiles, one button. Level-ups / evolutions / new
 * badges follow as a second beat after "Continue" so nothing competes.
 */
function CheckInResultView({ r, proxi, category }: { r: import("@/lib/services/challenges").CheckInResult; proxi: { stage: ProxiStage; look: ProxiLook }; category?: string }) {
  const t = useT();
  const total = r.xp + r.streakBonus + r.completionBonus;
  const [line] = useState(() => (r.status === "pending" ? "Proof sent! I'll keep an eye on it." : r.challengeCompleted ? pickLine("challengeDone") : pickLine("xp")));
  const [open, setOpen] = useState(true);
  const [secondBeat, setSecondBeat] = useState(false);
  const evolvedTo = r.stageAfter > r.stageBefore ? (r.stageAfter as ProxiStage) : null;
  const celebrate = r.status === "approved" && (Boolean(r.levelUp) || Boolean(evolvedTo) || r.achievements.length > 0 || r.newProxiItems.length > 0);
  const stage = (r.stageAfter as ProxiStage) || proxi.stage;
  const pending = r.status === "pending";

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (!pending && "vibrate" in navigator) navigator.vibrate?.(30);
    return () => void (document.body.style.overflow = prev);
  }, [open, pending]);

  const close = () => {
    setOpen(false);
    if (celebrate) setSecondBeat(true);
  };

  const summary = pending ? (
    <TodayStatus status="pending" xp={0} />
  ) : (
    <TodayStatus status="approved" xp={total} />
  );

  return (
    <div role="status">
      {open ? (
        <div className="fixed inset-0 z-[90] flex flex-col overflow-y-auto bg-ink px-6 pt-10 pb-safe animate-fade">
          {!pending && <Confetti count={40} />}
          <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center text-center">
            <ProxiBuddy stage={stage} look={proxi.look} mood={pending ? "motivated" : r.challengeCompleted ? "excited" : "proud"} line={line} params={{ n: total }} size={170} layout="stack" prop={r.challengeCompleted ? "trophy" : propForCategory(category)} />
            <h2 className={cn("mt-6 font-display text-[34px] font-black leading-tight animate-levelup", pending ? "text-electric" : "text-gold-dark")}>
              {pending ? t("Proof submitted") : r.challengeCompleted ? t("Mission complete!") : t("Day complete!")}
            </h2>
            <p className="mt-1 font-bold text-muted">{pending ? t("Pending verification. XP is awarded once a reviewer approves it.") : t("Check-in complete. See you tomorrow.")}</p>

            <div className="mt-6 grid w-full grid-cols-3 gap-2.5">
              {!pending && (
                <StatTile tone="gold" label={t("Total XP")}>
                  <Zap className="h-5 w-5 fill-current" aria-hidden />
                  <CountUp value={total} prefix="+" suffix=" XP" />
                </StatTile>
              )}
              <StatTile tone="flame" label={t("Streak")}>
                <Flame className="h-5 w-5 fill-current" aria-hidden />
                {r.streak}
              </StatTile>
              {r.completionBonus > 0 ? (
                <StatTile tone="green" label={t("Finish bonus")}>
                  <Trophy className="h-5 w-5" aria-hidden />+{r.completionBonus}
                </StatTile>
              ) : r.streakBonus > 0 ? (
                <StatTile tone="green" label={t("Streak bonus")}>
                  <Sparkles className="h-5 w-5" aria-hidden />+{r.streakBonus}
                </StatTile>
              ) : (
                !pending && (
                  <StatTile tone="violet" label={t("Base")}>
                    <Check className="h-5 w-5" strokeWidth={3} aria-hidden />+{r.xp}
                  </StatTile>
                )
              )}
            </div>
            {!pending && (
              <div className="mt-5 w-full text-left">
                <XpGainBar from={r.xpBefore} to={r.xpAfter} />
              </div>
            )}
            {r.achievements.length > 0 && (
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {r.achievements.map((a) => (
                  <span key={a} className="inline-flex items-center gap-1 rounded-full bg-gold/20 px-3 py-1.5 text-xs font-extrabold text-gold-dark">
                    <Sparkles className="h-3.5 w-3.5" aria-hidden /> {t(a)}
                  </span>
                ))}
              </div>
            )}
            {r.capped && <p className="mt-3 text-xs font-semibold text-subtle">{t("Daily XP cap reached — keep it up tomorrow.")}</p>}
          </div>
          <div className="mx-auto w-full max-w-sm py-6">
            <Button size="lg" variant={pending ? "primary" : "success"} className="w-full" onClick={close} autoFocus>
              {t("Continue")}
            </Button>
          </div>
        </div>
      ) : (
        summary
      )}
      {secondBeat && (
        <ProxiCelebration data={{ levelUp: r.levelUp, evolvedTo, achievements: r.achievements, newItems: r.newProxiItems }} stage={stage} look={proxi.look} onClose={() => setSecondBeat(false)} />
      )}
    </div>
  );
}

const TILE = {
  gold: "border-gold text-gold-dark [--h:var(--color-gold)]",
  flame: "border-flame text-flame [--h:var(--color-flame)]",
  green: "border-green text-green-dark [--h:var(--color-green)]",
  violet: "border-violet text-violet-2 [--h:var(--color-violet)]",
};
function StatTile({ tone, label, children }: { tone: keyof typeof TILE; label: string; children: React.ReactNode }) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border-2 animate-pop", TILE[tone])}>
      <p className="truncate bg-[var(--h)] px-1 py-1 text-[10px] font-black uppercase tracking-wider text-white">{label}</p>
      <p className="flex items-center justify-center gap-1 px-1 py-2.5 text-[17px] font-black tabular-nums">{children}</p>
    </div>
  );
}
