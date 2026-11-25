import type { Category, Difficulty } from "@/lib/types";

/** Ready-made missions: one tap fills the create wizard, everything stays editable. */
export interface Preset {
  key: string;
  title: string;
  description: string;
  category: Category;
  difficulty: Difficulty;
  durationDays: number;
  tasks: string[];
}

export const PRESETS: Preset[] = [
  { key: "beat", title: "One beat a day", description: "Make one beat every day for a week. Rough is fine — finished beats more than perfect.", category: "music", difficulty: "medium", durationDays: 7, tasks: ["Make one beat"] },
  { key: "wake7", title: "Up at 7:00", description: "Get out of bed by 7:00 every day for a week. No snooze marathons.", category: "discipline", difficulty: "medium", durationDays: 7, tasks: ["Out of bed by 7:00"] },
  { key: "water", title: "2 litres of water", description: "Drink 2 litres of water across the day.", category: "health", difficulty: "easy", durationDays: 7, tasks: ["Drink 2 litres of water"] },
  { key: "steps", title: "10,000 steps", description: "Hit 10,000 steps every day. Walks, stairs, everything counts.", category: "fitness", difficulty: "medium", durationDays: 7, tasks: ["Walk 10,000 steps"] },
  { key: "read10", title: "10 pages a day", description: "Read at least 10 pages of a book every day.", category: "learning", difficulty: "easy", durationDays: 14, tasks: ["Read 10 pages"] },
  { key: "code30", title: "30 minutes of code", description: "Learn programming for 30 focused minutes a day.", category: "learning", difficulty: "medium", durationDays: 30, tasks: ["Code for 30 minutes"] },
  { key: "nofastfood", title: "No fast food week", description: "Skip fast food for 7 days straight.", category: "health", difficulty: "medium", durationDays: 7, tasks: ["No fast food today"] },
  { key: "train14", title: "Train for 14 days", description: "Do any workout every day for two weeks — at your own level.", category: "fitness", difficulty: "hard", durationDays: 14, tasks: ["Do a workout"] },
  { key: "eat30", title: "Eat clean for 30 days", description: "Build balanced meals every day for a month.", category: "health", difficulty: "hard", durationDays: 30, tasks: ["Eat balanced meals today"] },
  { key: "breathe", title: "5 calm minutes", description: "Take five minutes to breathe or meditate, phone away.", category: "mindfulness", difficulty: "easy", durationDays: 7, tasks: ["5 minutes of quiet breathing"] },
];
