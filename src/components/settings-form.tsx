"use client";

import { Camera, Check, Crown, Lock, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { removeAvatarAction, updateProfileAction, uploadAvatarAction } from "@/lib/actions/social";
import { AVATAR_FRAMES, bannerStyle, isUnlocked, PROFILE_BANNERS } from "@/lib/config/cosmetics";
import { useT } from "@/lib/i18n/client";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { Field, FormAlert, Input, Textarea } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { useToast } from "@/components/ui/toast";

/** Center-crops and shrinks a photo on the device before upload (fast, small, strips metadata). */
async function resizeImage(file: File, size = 320): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, size, size);
  bitmap.close();
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/webp", 0.86));
  if (blob) return blob;
  return new Promise<Blob>((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("encode"))), "image/jpeg", 0.88));
}

function PhotoPicker({ name, color, url, frame }: { name: string; color: string; url: string | null; frame: string }) {
  const t = useT();
  const toast = useToast();
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [pending, start] = useTransition();
  const [preview, setPreview] = useState<string | null>(url);
  useEffect(() => setPreview(url), [url]);

  const upload = (file: File) =>
    start(async () => {
      try {
        const blob = await resizeImage(file);
        const fd = new FormData();
        fd.set("avatar", new File([blob], "avatar", { type: blob.type }));
        setPreview(URL.createObjectURL(blob));
        const r = await uploadAvatarAction(fd);
        toast(r.ok ? { tone: "success", title: r.message ?? t("Saved") } : { tone: "error", title: r.error });
        if (!r.ok) setPreview(url);
        router.refresh();
      } catch {
        toast({ tone: "error", title: t("This photo couldn't be read. Try another one.") });
      }
    });

  return (
    <div className="flex items-center gap-4">
      <button type="button" onClick={() => input.current?.click()} className="tap group relative rounded-full" aria-label={t("Change profile photo")} disabled={pending}>
        <Avatar name={name || "?"} color={color} url={preview} frame={frame} size={84} />
        <span className={cn("absolute inset-0 grid place-items-center rounded-full bg-black/45 text-white opacity-0 transition group-hover:opacity-100", pending && "opacity-100")}>
          <Camera className={cn("h-6 w-6", pending && "animate-nav-pending")} aria-hidden />
        </span>
      </button>
      <div className="space-y-2">
        <p className="text-sm font-medium">{t("Profile photo")}</p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="secondary" loading={pending} icon={<Camera className="h-4 w-4" />} onClick={() => input.current?.click()}>
            {preview ? t("Change photo") : t("Add photo")}
          </Button>
          {preview && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={pending}
              icon={<Trash2 className="h-4 w-4" />}
              onClick={() =>
                start(async () => {
                  const r = await removeAvatarAction();
                  toast(r.ok ? { tone: "success", title: r.message ?? t("Saved") } : { tone: "error", title: r.error });
                  if (r.ok) setPreview(null);
                  router.refresh();
                })
              }
            >
              {t("Remove")}
            </Button>
          )}
        </div>
        <p className="text-xs text-subtle">{t("JPG, PNG or WEBP. It is cropped to a square on your phone.")}</p>
      </div>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (f) upload(f);
        }}
      />
    </div>
  );
}

function LockBadge({ level, premium }: { level: number; premium?: boolean }) {
  const t = useT();
  return (
    <span className="absolute right-1.5 top-1.5 z-10 inline-flex items-center gap-0.5 rounded-full bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-white shadow">
      {premium ? <Crown className="h-3 w-3 text-gold" aria-hidden /> : <Lock className="h-3 w-3" aria-hidden />}
      {premium ? "Premium" : t("Lv {n}", { n: level })}
    </span>
  );
}

export function SettingsForm({
  profile,
  freeColors,
  premiumColors,
  isPremium,
  level,
}: {
  profile: { displayName: string; bio: string; avatarColor: string; username: string; avatarUrl: string | null; avatarFrame: string; banner: string };
  freeColors: string[];
  premiumColors: string[];
  isPremium: boolean;
  level: number;
}) {
  const t = useT();
  const [state, action] = useActionState(updateProfileAction, null);
  const [name, setName] = useState(profile.displayName);
  const [color, setColor] = useState(profile.avatarColor);
  const [frame, setFrame] = useState(profile.avatarFrame);
  const [banner, setBanner] = useState(profile.banner);
  const toast = useToast();
  useEffect(() => {
    if (state?.ok) toast({ tone: "success", title: state.message ?? t("Saved") });
  }, [state, toast, t]);
  const fe = state && !state.ok ? state.fieldErrors : undefined;

  return (
    <div className="space-y-6">
      {/* Live preview */}
      <div className="relative overflow-hidden rounded-2xl p-5 ring-1 ring-line">
        <div className="absolute inset-0 opacity-80" style={{ background: bannerStyle(banner, `${color}88`) }} aria-hidden />
        <div className="relative">
          <PhotoPicker name={name} color={color} url={profile.avatarUrl} frame={frame} />
          <p className="mt-3 font-display text-lg font-bold">{name || t("Your name")}</p>
          <p className="text-sm text-muted">@{profile.username}</p>
        </div>
      </div>

      <form action={action} className="space-y-6">
        <input type="hidden" name="avatarColor" value={color} />
        <input type="hidden" name="avatarFrame" value={frame} />
        <input type="hidden" name="banner" value={banner} />
        <Field label={t("Display name")} htmlFor="displayName" error={fe?.displayName}>
          <Input id="displayName" name="displayName" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} maxLength={40} invalid={Boolean(fe?.displayName)} />
        </Field>
        <Field label={t("Bio")} htmlFor="bio" error={fe?.bio} hint={t("Up to 160 characters")}>
          <Textarea id="bio" name="bio" defaultValue={profile.bio} maxLength={160} className="min-h-20" />
        </Field>

        <fieldset>
          <legend className="mb-1 text-sm font-medium">{t("Avatar frame")}</legend>
          <p className="mb-3 text-xs text-subtle">{t("New frames unlock as you level up. You are level {n}.", { n: level })}</p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {AVATAR_FRAMES.map((f) => {
              const open = isUnlocked(f, level, isPremium);
              const selected = frame === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  disabled={!open}
                  onClick={() => setFrame(f.id)}
                  aria-pressed={selected}
                  className={cn(
                    "tap relative flex flex-col items-center gap-2 rounded-2xl px-2 py-3 ring-1",
                    selected ? "bg-violet/15 ring-2 ring-violet-2" : "bg-tint/[0.03] ring-line",
                    !open && "cursor-not-allowed opacity-50",
                  )}
                >
                  {!open && <LockBadge level={f.minLevel} premium={f.premium} />}
                  <Avatar name={name || "?"} color={color} url={profile.avatarUrl} frame={f.id} size={44} />
                  <span className="text-xs font-medium">{t(f.name)}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-3 text-sm font-medium">{t("Profile background")}</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {PROFILE_BANNERS.map((b) => {
              const open = isUnlocked(b, level, isPremium);
              const selected = banner === b.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  disabled={!open}
                  onClick={() => setBanner(b.id)}
                  aria-pressed={selected}
                  className={cn("tap relative h-16 overflow-hidden rounded-2xl text-left ring-1", selected ? "ring-2 ring-violet-2" : "ring-line", !open && "cursor-not-allowed opacity-50")}
                >
                  <span className="absolute inset-0 bg-ink-2" aria-hidden />
                  <span className="absolute inset-0" style={{ background: bannerStyle(b.id, `${color}aa`) }} aria-hidden />
                  {!open && <LockBadge level={b.minLevel} premium={b.premium} />}
                  <span className="absolute bottom-1.5 left-2.5 flex items-center gap-1 text-xs font-semibold text-white drop-shadow">
                    {selected && <Check className="h-3.5 w-3.5" aria-hidden />}
                    {t(b.name)}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-2 text-sm font-medium">{t("Avatar colour")}</legend>
          <div className="flex flex-wrap gap-2">
            {[...freeColors, ...premiumColors].map((c) => {
              const locked = !isPremium && premiumColors.includes(c);
              return (
                <button
                  key={c}
                  type="button"
                  disabled={locked}
                  onClick={() => setColor(c)}
                  className={cn("relative grid h-10 w-10 place-items-center rounded-full ring-2 ring-offset-2 ring-offset-ink transition", color === c ? "ring-fg" : "ring-transparent hover:ring-fg/30", locked && "cursor-not-allowed opacity-40")}
                  style={{ background: c }}
                  aria-label={`${locked ? t("Premium colour") : t("Colour")} ${c}`}
                  aria-pressed={color === c}
                >
                  {color === c && <Check className="h-4 w-4 animate-check text-white" aria-hidden />}
                  {locked && <Lock className="h-3.5 w-3.5 text-white" aria-hidden />}
                </button>
              );
            })}
          </div>
          {!isPremium && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-subtle">
              <Crown className="h-3.5 w-3.5 text-gold" aria-hidden /> {t("Extra colours and a highlighted avatar ring come with Premium.")}
            </p>
          )}
        </fieldset>
        {state && !state.ok && <FormAlert>{state.error}</FormAlert>}
        <SubmitButton pendingText={t("Saving…")} className="w-full sm:w-auto">
          {t("Save profile")}
        </SubmitButton>
      </form>
    </div>
  );
}
