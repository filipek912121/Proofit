/** Contextual gear PROXI brings to a mission (drawn in components/proxi/proxi-avatar). Shared by server and client. */
export type ProxiProp = "headphones" | "dumbbell" | "book" | "bottle" | "trophy" | "pencil" | "pajamas";

/** Map a challenge category to the gear PROXI brings along. */
export function propForCategory(category: string | undefined): ProxiProp | undefined {
  switch (category) {
    case "music":
      return "headphones";
    case "fitness":
      return "dumbbell";
    case "learning":
      return "book";
    case "health":
      return "bottle";
    case "creativity":
      return "pencil";
    case "discipline":
      return "pajamas";
    default:
      return undefined;
  }
}

