# Dino Discovery — design (not yet built)

**Goal:** give the child something to look forward to across all 45 days. They do this by **discovering** dinosaurs, and every discovery is earned by learning. There's no luck involved.

Art: [new-dinos.png](new-dinos.png) · Screen mock-up: [discovery-book.png](discovery-book.png)

---

## 1. Principles

| Do | Don't (guardrails from the game plan) |
|---|---|
| Every dino is earned by a **clear, visible learning goal** | No random eggs, loot boxes or "rare drop" chances |
| The child always knows **what to do next** (clue + progress bar) | No timers or "only today!" pressure |
| Discoveries are spread over the whole plan | Nothing to buy; Stars and Eggs stay the only currencies |
| Each dino teaches a little (fact + one maths question) | No streak penalties; nothing is ever lost |

---

## 2. The roster — 18 dinos

6 dinos already in the game, plus 12 new ones. Each new dino is linked to a world or to a good learning habit.

| # | Dino | Species | Found by | Why it fits |
|---|---|---|---|---|
| 1 | Rexy | T. rex | Starting companion | — |
| 2 | Compy | Compsognathus | Play on **3 Adventure Days** | A tiny dino for a quick first win |
| 3 | Brachio | Brachiosaurus | Master 3 Number Jungle skills *(existing)* | — |
| 4 | Diplo | Diplodocus | Win the **Number Crystal** | Long tail, like long number lines |
| 5 | Tricera | Triceratops | Master 3 Volcano Valley skills *(existing)* | — |
| 6 | Iguano | Iguanodon | Master 2 **Dino Nest** skills | Thumb spike for counting in groups |
| 7 | Stego | Stegosaurus | **Pattern Spotter** badge ×3 | Its plates make a pattern |
| 8 | Ptero | Pteranodon | Master 2 Shape Caves skills *(existing)* | — |
| 9 | Parasaur | Parasaurolophus | Master 2 **Time Mountain** skills | Its crest "toots" like a clock alarm |
| 10 | Spino | Spinosaurus | Master 2 Treasure Market skills *(existing)* | — |
| 11 | Ankylo | Ankylosaurus | Master 2 **measuring** skills (length, weight, capacity, temperature) | Heavy armour for weighing |
| 12 | Raptor | Velociraptor | Master 3 Puzzle Forest skills *(existing)* | — |
| 13 | Dilo | Dilophosaurus | Master 2 **logic** skills (coding, analogy, Venn) | Its crests look like puzzle pieces |
| 14 | Pachy | Pachycephalosaurus | **"Never Give Up"** badge ×5 | Hard-headed and keeps trying |
| 15 | Mosa | Mosasaurus | Finish **Training Camp 5 times** | A deep dive into tricky skills |
| 16 | Archie | Archaeopteryx | Do **3 Real-World Missions** (parent ticks "done") | Learning flies out into the real world |
| 17 | Ovi | Oviraptor | Earn **25 Dino Eggs** in total | The egg collector |
| 18 | ⭐ Golden Rex | Legendary T. rex | Win the **Olympiad Crystal**, or score 75% in a full mock | The finale |

*(Mosasaurus, Pteranodon and Archaeopteryx aren't strictly dinosaurs. Their fact cards will say so. That's a nice fact in itself.)*

---

## 3. How a discovery feels

Each dino moves through 4 states in the **Dino Discovery Book**:

1. **Hidden:** a grey silhouette with "?" and a clue, e.g. "I live in Puzzle Forest and love tricky codes!"
2. **Footprints spotted!** At 75% towards the goal, footprints appear on the card and on the Adventure Map, with a gold progress bar and the exact next step ("Master 1 more Dino Nest skill").
3. **Egg found:** the goal is reached. A wobbling egg appears on the home screen: "You found a new egg! 🥚"
4. **Hatched:** the child spends 🥚 2 to hatch it. This reuses the existing hatching scene in the dino's own shape and colour, then shows the fact card.

---

## 4. Fact card + Dino Maths

Every dino gets a short fact (read aloud) and **one maths question built from the fact**, matched to the syllabus:

| Dino | Fact | Dino Maths |
|---|---|---|
| Stego | 17 plates and 4 tail spikes | 2 Stegos: how many tail spikes? (8) |
| Diplo | About 26 metres long, as long as 2 buses | Half of 26? (13) |
| Tricera | 3 horns | 5 Triceras: how many horns? (15) |
| Ankylo | Weighed about 6,000 kg | Which is heavier: Ankylo or a car? |
| Parasaur | Tooted its crest every hour | It tooted at 3 o'clock. When was the next toot? |
| Compy | About the size of a chicken | Is Compy longer than 1 metre or shorter? |
| Ovi | Laid eggs in a circle | 4 eggs in each nest, 3 nests: how many eggs? (12) |

Answering is optional. It gives ⭐ +2 and it never blocks the hatch.

---

## 5. Pacing (45-day plan from 12 Oct)

Roughly **one discovery every 3 days**, following the world order in the plan:

| Week | Likely discoveries |
|---|---|
| 1 (12–18 Oct) | Compy, Brachio |
| 2 (19–25 Oct) | Diplo, Tricera, Iguano |
| 3 (26 Oct–1 Nov) | Stego, Ptero, Pachy |
| 4 (2–8 Nov) | Parasaur, Spino, Ankylo, Ovi |
| 5 (9–15 Nov) | Raptor, Dilo, Archie |
| 6 (16–25 Nov) | Mosa (Training Camp in Final Preparation), Golden Rex (castle finale or mock) |

**Eggs budget:** about 1 egg per mission + 2 per boss + 3 per crystal gives roughly 55–60 eggs over the plan. Hatching 17 dinos costs 34, which leaves enough for the wardrobe.

---

## 6. Screens

- **Dino Discovery Book** (replaces the "Dino Collection" grid on My Dinos; see mock-up): progress "8 of 18", tabs by world plus "Special", and cards in the 4 states. Tapping a found dino opens its fact card with **Make my buddy** (choose as companion).
- **Adventure Map:** footprints appear on the world where the next dino is hiding.
- **Home:** a "New egg found!" banner when an egg is waiting to hatch.
- **Parent dashboard:** a small "Dinos found" list with dates, plus what the child is working towards next. Parents tick off Real-World Missions here (needed for Archie).

---

## 7. Data and code changes (for later)

- **Catalog:** `DinoInfo` gains `unlock` (one of: `skills` / `crystal` / `badge` / `days` / `camps` / `eggs` / `realWorld` / `mock`, plus a target), `clue`, `fact`, `mathFact { question, options, answer }`, `world`, and `legendary?`.
- **Drawings:** add the 12 new species to `SPECIES` in `src/components/Dino.tsx`, each with its face and accessory anchor points, like the current six.
- **State:** `realWorldDone: string[]` (dates the parent confirmed) and `factsAnswered: DinoId[]`. Badges, camps, eggs earned and days are already tracked, though "eggs earned in total" needs a lifetime counter.
- **Engine:** `discoveryProgress(state, dino)` returns 0–1 for the footprints and progress bar. `readyToHatch` uses it.
- **Tests:** each unlock rule, footprints at 75%, no dino becoming available by chance, and the 45-day simulation discovering about 15+ dinos.

---

## 8. Decisions needed before building

1. **18 dinos, or fewer?** Could start with 6 of the new ones.
2. **Should Golden Rex count a full mock at 75%,** or only the castle crystal?
3. **Is a parent tick OK for Real-World Missions** (Archie)?
4. **Should Dino Maths answers count towards skill mastery,** or just be for fun?
