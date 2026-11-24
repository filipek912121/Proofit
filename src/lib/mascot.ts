import type { MascotMood } from "@/components/mascot/mascot";

/** App events the mascot reacts to. */
export type MascotEvent =
  | { kind: "all-done"; streak: number }
  | { kind: "pending-today"; left: number; streak: number }
  | { kind: "inactive"; days: number }
  | { kind: "no-challenges" }
  | { kind: "streak"; days: number }
  | { kind: "level-up"; level: number }
  | { kind: "challenge-complete" }
  | { kind: "duel-win" }
  | { kind: "duel-loss" }
  | { kind: "duel-draw" }
  | { kind: "achievement"; name: string };

/** English source strings (translated with t()) + the mood for each event. */
export function mascotForEvent(e: MascotEvent): { mood: MascotMood; title: string; text?: string; params?: Record<string, string | number> } {
  switch (e.kind) {
    case "all-done":
      return e.streak >= 3
        ? { mood: "fire", title: "{n}-day streak! You're on fire.", text: "Everything done for today. See you tomorrow!", params: { n: e.streak } }
        : { mood: "happy", title: "All done for today!", text: "Come back tomorrow to keep the streak going." };
    case "pending-today":
      return e.streak >= 2
        ? { mood: "nudge", title: "Keep your {n}-day streak alive!", text: "One check-in today is all it takes.", params: { n: e.streak } }
        : { mood: "idle", title: "Ready when you are", text: "Small steps every day add up." };
    case "inactive":
      return { mood: "sleepy", title: "I missed you!", text: "It's been {n} days. Start small today — one check-in.", params: { n: e.days } };
    case "no-challenges":
      return { mood: "nudge", title: "Let's find your first challenge", text: "Pick an easy one — you can finish it today." };
    case "streak":
      return { mood: "fire", title: "{n} days in a row!", params: { n: e.days } };
    case "level-up":
      return { mood: "proud", title: "Level {n}!", text: "New decorations may be waiting in your profile.", params: { n: e.level } };
    case "challenge-complete":
      return { mood: "celebrate", title: "Challenge completed!", text: "That's what proof looks like." };
    case "duel-win":
      return { mood: "celebrate", title: "Victory!", text: "You out-checked your opponent." };
    case "duel-loss":
      return { mood: "sad", title: "Not this time", text: "Rematch? Every duel makes you stronger." };
    case "duel-draw":
      return { mood: "happy", title: "A perfect tie", text: "Evenly matched — time for a rematch." };
    case "achievement":
      return { mood: "proud", title: "New badge: {name}", params: { name: e.name } };
  }
}
