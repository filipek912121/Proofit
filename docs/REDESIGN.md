# PROOFIT redesign — game-first, friends-first

Branch: `redesign` (not deployed to production).

## 1. Audit — why the old app didn't pull people back

| Problem | Where | Effect |
|---|---|---|
| Dark "neon" SaaS look: glass cards, gradients, glows | every screen | Felt like an AI template, not a game; low warmth |
| Home was a dashboard (level card, stats, shortcuts grid, referral, daily, activity) | `/dashboard` | No single answer to "what do I do now?" |
| 11 equal-weight destinations, bottom bar mixed Ranking + Profile + Explore | nav | Friends/duels/squads scattered across 3 screens |
| Check-in = checkboxes + small card result | challenge page | The payoff moment had no weight |
| Day progress = small numbered squares | challenge page | Hard to feel "how close am I to finishing?" |
| Create = one long form with 12+ controls | `/create` | Starting a mission felt like paperwork |
| No first-run flow (signup → dashboard) | auth | No first value in the first minute |
| Category glyphs = generic outline icons | everywhere | No visual identity per "world" |
| Global ranking was the default | `/leaderboard` | Comparing strangers ≠ motivating |

Kept as-is (working, tested): auth, data model, XP ledger + anti-abuse caps, proofs + review, duels, squads, invites, referrals, PROXI unlock logic, Stripe structure, i18n, RLS.

## 2. Design system

**Direction:** flat, bright, chunky, friendly. Depth comes from 2px borders and solid "lips" under buttons — never from blur, glow or gradients.

### Tokens (`src/app/globals.css`)
| Token | Light | Dark | Use |
|---|---|---|---|
| `ink` / `ink-2` | #ffffff | #121722 | background / cards (flat) |
| `ink-3` | #f1f2f6 | #1d2432 | inputs, tracks, quiet fills |
| `line` / `line-strong` | #e5e7ee / #d2d6e0 | #2a3345 / #3a4559 | 2px borders, button lips |
| `violet` / `violet-dark` | #7b5cff / #5a3ee0 | #8f76ff / #6a50e6 | brand, selection, primary |
| `green` / `green-dark` | #3cc13b / #2a9a29 | same | PROOF / done / main CTA |
| `flame` | #ff8a1f | same | streak |
| `gold` / `gold-dark` | #ffb81c / #e09400 | same | XP, trophies |
| `red` | #ff4f5e | same | duels, alerts, badges |
| `electric` | #1e9bf0 | same | squads, info |

- **Type:** Nunito 500–900. Headlines 900 (28px), section titles 800 (19px), buttons 800 UPPERCASE.
- **Radius:** 16px controls/cards, 24px hero blocks, full for nodes/avatars.
- **Border width:** 2px everywhere.
- **Button depth:** `--btn-depth: 4px` solid lip (`.btn-3d`); on press the button moves down by the depth and the lip disappears. Tiles use `.tile` (3px lip).
- **Motion:** entrances 250–500ms with `backwards` fill (no lingering transforms); celebration = confetti + pop; all motion disabled under `prefers-reduced-motion`.
- **Themes:** Light (default) and Dark. Legacy cookies `neon`/`midnight` map to Dark.

### Components
`Button`/`LinkButton` (primary, success, secondary, ghost, danger, gold) · `ProgressBar` (thick track + highlight strip) · `CategoryIcon` (12 worlds) · `NavIcon` (tab illustrations) · `StreakFlame` · `MissionPath` · `StatTile` · `ProxiAvatar` with `prop` (headphones, dumbbell, book, bottle, pencil, sleep cap, trophy).

## 3. Information architecture

Bottom bar: **Today · Challenges · PROXI · Friends · Profile**.
- Phone header = game HUD: streak, XP, create (+), notifications.
- Friends hub (`/friends`) gathers friend streaks, weekly league position ("X XP to pass Y"), invites, duels, squads, recent proofs, invite link.
- League (`/leaderboard`) defaults to **friends** + weekly, with a reset countdown; global is one tap away.

## 4. Screens rebuilt
- **Today:** state-driven headline (new / empty / open / all done / back after a break) + PROXI with mission gear → today's missions (category icon, day dots, one green PROOF button on the first open mission) → week streak strip → crew pulse → quick mission.
- **Challenge:** mission header → today's goal + PROOF → zig-zag path of days ending in a trophy → players ranked by check-ins → duel/leave.
- **PROOF result:** full-screen "Day complete!/Mission complete!" with PROXI, three stat tiles, XP bar, one Continue button; level-up/evolution/new items follow as a second beat.
- **Create:** quick-start presets + 4-step wizard (What → Rules → Who's playing → Go). Same form, same server validation.
- **Onboarding (`/welcome`):** meet PROXI → choose an area → join a real official mission → optional invite → straight to today's PROOF.
- **Landing:** PROXI, "Don't just say it. PROOF it.", one button.

Data: new categories `health, creativity, music, mindfulness, custom` — additive migration `20261127000007_categories.sql` (widens a CHECK constraint, no data change).

## 5. Asset specification (still to be illustrated by a designer)

Coded now as vector SVG (production-ready, scalable): category icons, tab icons, streak flame, logo, PROXI props, mission path nodes. Still wanted from an illustrator, in the same flat two-tone style (solid fills, darker bottom lip, no gradients, 48px grid, 4px corner radius language):
1. **Empty states (4):** no missions, no friends, no duels, nothing to review — PROXI in a matching pose, 240×200.
2. **Onboarding scenes (3):** PROXI waving, PROXI pointing at a map of worlds, PROXI high-fiving a friend.
3. **Achievement medals (12):** one per badge, bronze/silver/gold/legend frames.
4. **PROXI room:** floor + wall backdrop with 6 placeable items (plant, poster, speaker, dumbbell rack, bookshelf, trophy shelf).
5. **Rive/Lottie PROXI states:** idle, wave, cheer, proud, sleepy, surprised, celebrate (≤ 60 KB each).

## 6. Next steps (need backend work — not faked)
- Audio/video proofs (storage bucket + MIME validation + review UI).
- Friend reactions / "high five" on proofs (new `reactions` table + RLS).
- Shared friend streaks and friend quests (new tables + daily job).
- Weekly summary screen (aggregate query, Monday push).
- Tiered leagues with promotion zones (weekly cohort job).
- PROXI room (persisted placement of unlocked items).
