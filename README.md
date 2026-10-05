# Mathosaur – Olympiad Adventure 🦖

**Learn. Play. Think. Conquer.**

A child-first maths adventure website that prepares a Class 2 learner for the Math Olympiad on **26 November 2026** through short daily missions (10–15 minutes). It's built from the *Mathosaur Class 2 Olympiad Game Design* specification.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # generator + mastery-model tests
npm run build      # static site in dist/ (works from any folder or host)
```

Progress is saved in the browser's `localStorage`, so there's no server or account to set up. Parents can export and import progress from the dashboard.

## What's included

| Spec area | Where |
|---|---|
| Story, 8 worlds, crystals, Professor Zero | `src/engine/catalog.ts`, Adventure Map |
| Daily loop: story → mini-games → recall → HOTS → treasure / mini-boss → reward → stop | `src/engine/session.ts`, `src/pages/child/Mission.tsx` |
| 32 skills × 5 invisible difficulty levels, procedurally generated | `src/engine/generators.ts` |
| Mini-games: Dino Run, Feed the Dino, Egg Match, Number Train, Treasure Shop, Pattern Cave, plus Mystery Dino, Lava Crossing, picture choice | `src/components/games/Games.tsx` |
| Three-stage rescue (retry → visual hint → guided steps), then a similar follow-up problem | `src/components/QuestionPlayer.tsx` |
| Mastery model (independent 1.0 / retry 0.8 / hint 0.6 / guided 0.35, recency-weighted) | `src/engine/mastery.ts` |
| Anti-frustration (−1 level after 2 errors, +1 after 3 independent) and confidence mix | `mastery.ts`, `session.ts` |
| Spaced-repetition revision queue → Training Camp | `mastery.ts`, `/camp` |
| Stars + Dino Eggs only; dino collection, hatching, evolution, wardrobe, badges | `src/pages/child/Dinos.tsx`, `src/engine/rewards.ts` |
| Read to Me (speech synthesis) and highlighted clues | `src/components/RichText.tsx` |
| “How did you solve it?” prompts (occasional) | `QuestionPlayer.tsx` |
| Adventure Days (no fragile streaks), Real-World Missions, Parent Challenges | Mission summary |
| Preparation phases, castle appearing 7 days out, light day-before mission, exam-day screen | `src/engine/dates.ts`, `session.ts` |
| Olympiad Arena: timed mock, flag, back/next, palette, review, child + parent analytics | `src/pages/child/Arena.tsx` |
| Parent gate (hold 3 s + adult sum) and dashboard: overview, skill map, training needs, activity, mock results, settings | `src/pages/parent/` |
| Guardrails: daily mission cap, no leaderboards, no failure sounds, optional sound, reduced-motion support | throughout |

### Parent tools

Open **🔒 Grown-ups** at the bottom of the home screen. Under **Settings** you can:

- turn sound on or off
- let your child choose any world
- open or hide the Olympiad Arena
- **preview a date**, to see how the plan changes in each phase and in the final week
- export, import, or reset progress

## Not built yet (from the plan's “later” list)

- Server-side accounts and multiple child profiles (the plan suggests Next.js + Supabase)
- An admin question editor
- Family challenge mode
- Advanced animations
