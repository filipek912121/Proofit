/**
 * PROXI's voice: confident, funny, a bit cheeky — never guilt-tripping.
 * Strings are English source keys (translated with t()). Pick with `pickLine`
 * so the same line isn't shown twice in a row.
 */
export type ProxiMood = "happy" | "excited" | "proud" | "sleepy" | "motivated" | "sad" | "surprised" | "laugh" | "neutral";

export type LineCategory =
  | "greeting"
  | "xp"
  | "challengeDone"
  | "welcomeBack"
  | "levelUp"
  | "defeat"
  | "victory"
  | "achievement"
  | "reminder"
  | "allDone"
  | "unlock"
  | "evolve"
  | "poke";

export const LINES: Record<LineCategory, string[]> = {
  greeting: [
    "Hey there, champ! Ready for another day?",
    "PROXI online! What are we doing today?",
    "Welcome back! I've got a few tasks for you.",
    "Systems green. Let's make today count.",
  ],
  xp: ["+{n} XP! You're starting to impress me!", "OHO! Somebody's not slacking!", "Keep it up! Your progress is climbing!", "+{n} XP. I'm writing this one down."],
  challengeDone: ["Challenge complete! I knew you could do it!", "Another challenge down. What's next?", "Job done. I'm proud of you!"],
  welcomeBack: [
    "Hey hey! Great to see you again.",
    "You're back! Let's pick up right where we left off.",
    "Back in the game? PROXI is ready!",
  ],
  levelUp: ["WHAAAT?! NEW LEVEL!", "We just jumped a level higher!", "Things are getting serious!"],
  defeat: ["Easy, champ. Rematch?", "Not every day is a win. Tomorrow we go again!", "This isn't the end of our story."],
  victory: ["Victory! Did you see that?!", "Undefeated energy. I like it.", "That's how it's done!"],
  achievement: ["New badge unlocked! Shiny!", "Achievement get! I'm framing this one.", "Look at you collecting trophies!"],
  reminder: ["Your challenge is waiting for you!", "One quick check-in and today is yours.", "Psst… a challenge is still open today."],
  allDone: ["Everything done today. Show-off.", "Daily goals: crushed. See you tomorrow!", "Nothing left today. Time to recharge!"],
  unlock: ["New look unlocked! Dress me up?", "Ooh, new gear for me? You shouldn't have!"],
  evolve: ["I'm EVOLVING! Look at me now!", "New form unlocked. We did this together!"],
  poke: ["Hey! That tickles!", "Beep boop. Yes, I'm real.", "Tap me again and I'll start charging rent.", "I run on XP and good vibes."],
};

export const MOOD_INFO: Record<ProxiMood, { label: string; why: string; color: string }> = {
  happy: { label: "Happy", why: "You've been active lately.", color: "#22c55e" },
  excited: { label: "Excited", why: "You unlocked an achievement recently.", color: "#f472b6" },
  proud: { label: "Proud", why: "You completed a challenge or levelled up.", color: "#fbbf24" },
  sleepy: { label: "Sleepy", why: "It's been a while — PROXI saved your spot.", color: "#94a3b8" },
  motivated: { label: "Motivated", why: "You came back after a break!", color: "#38bdf8" },
  sad: { label: "Sad", why: "Tough loss — rematch time.", color: "#64748b" },
  surprised: { label: "Surprised", why: "Something unexpected happened!", color: "#a78bfa" },
  laugh: { label: "Laughing", why: "PROXI is having fun.", color: "#f59e0b" },
  neutral: { label: "Ready", why: "Waiting for your first move.", color: "#a78bfa" },
};

/** Random line from a category, avoiding the previously shown index when possible. */
export function pickLine(category: LineCategory, avoid?: string): string {
  const pool = LINES[category];
  const choices = pool.length > 1 && avoid ? pool.filter((l) => l !== avoid) : pool;
  return choices[Math.floor(Math.random() * choices.length)];
}
