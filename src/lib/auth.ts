import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getStore } from "@/lib/data";
import { isDemoMode } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export const DEMO_COOKIE = "proofit_demo_uid";
/** Demo only: name of the visitor's demo account, so it can be re-created on a fresh server instance. */
export const DEMO_PROFILE_COOKIE = "proofit_demo_profile";

/** Returns the verified user id for this request, or null. */
export const getSessionUserId = cache(async (): Promise<string | null> => {
  if (isDemoMode()) {
    const jar = await cookies();
    const id = jar.get(DEMO_COOKIE)?.value;
    if (!id || id.length > 64) return null;
    if (await getStore().getProfile(id)) return id;
    // Serverless hosts (e.g. Vercel) run several short-lived instances, each with its own
    // in-memory demo data. Re-create the visitor's demo account instead of logging them out.
    try {
      const raw = jar.get(DEMO_PROFILE_COOKIE)?.value;
      const saved = raw ? (JSON.parse(raw) as { u?: unknown; n?: unknown }) : null;
      const username = typeof saved?.u === "string" && /^[a-z0-9._]{3,20}$/.test(saved.u) ? saved.u : null;
      const name = typeof saved?.n === "string" ? saved.n.trim().slice(0, 40) : "";
      if (username && name.length >= 2) {
        const { createDemoProfile } = await import("@/lib/data/demo/memory-store");
        return createDemoProfile(username, name, id);
      }
    } catch {
      // malformed cookie — treat as signed out
    }
    return null;
  }
  const supabase = await createSupabaseServerClient();
  // getUser() validates the JWT with Supabase Auth (never trust getSession() on the server).
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
});

export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  const id = await getSessionUserId();
  if (!id) return null;
  return getStore().getProfile(id);
});

/** Use in protected pages/actions. Redirects to /login when signed out. */
export async function requireUser(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  return profile;
}
