"use server";

import { revalidatePath } from "next/cache";
import * as proxi from "@/lib/services/proxi";
import type { ActionResult } from "@/lib/types";
import { authed } from "./run";

export async function equipProxiAction(itemId: string): Promise<ActionResult> {
  if (typeof itemId !== "string" || !/^[a-z]+-[a-z]+$/.test(itemId)) return { ok: false, error: "Invalid request." };
  return authed(async (userId) => {
    await proxi.equipProxiItem(userId, itemId);
    revalidatePath("/", "layout");
    return { ok: true, message: "PROXI updated." };
  });
}

export async function setProxiRemindersAction(on: boolean): Promise<ActionResult> {
  return authed(async (userId) => {
    await proxi.setProxiReminders(userId, Boolean(on));
    revalidatePath("/", "layout");
    return { ok: true, message: on ? "PROXI reminders on." : "PROXI reminders off." };
  });
}

/** Called when the user has seen PROXI's evolution / new looks (clears the badges). */
export async function markProxiSeenAction(): Promise<ActionResult> {
  return authed(async (userId) => {
    await proxi.markProxiSeen(userId);
    revalidatePath("/", "layout");
    return { ok: true };
  });
}
