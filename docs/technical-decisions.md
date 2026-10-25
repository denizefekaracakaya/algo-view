# Technical decisions

## Stack
The workspace was empty, so the default stack from the brief was used: React 19 + TypeScript (strict, `noImplicitReturns`) + Vite 8, plain CSS with custom-property tokens (no Tailwind — the design needs few utilities and many algorithm-state tokens), lucide-react icons, KaTeX for math, Vitest + Testing Library, Playwright, oxlint. `HashRouter` + `base: './'` let `dist/` work from any static host or a subfolder without server rewrites.

## Layers
1. **Engines** (`src/engines`): pure functions, no React. Each algorithm has a plain version (used for experiments and as a test oracle) and a `…Trace` generator. Inputs are never mutated.
2. **Trace model** (`src/trace/types.ts`): `TraceStep<S> = { state, line?, explain, phase?, vars?, counters?, predict? }`. `state` is a complete, self-contained snapshot (arrays/trees are copied at every step), so **Previous** simply shows the previous snapshot — nothing is undone or recomputed. State shapes are algorithm-specific (array + markers for sorts, node list for the MergeSort/Karatsuba call trees, immutable `TNode` trees for BST/RB, buckets for CountingSort).
3. **Player** (`src/trace/player.ts`): a pure reducer (`next/prev/goto/reset/end/play/pause/load`) plus a hook that schedules auto-play with `setTimeout` keyed on the index (no runaway intervals; stops at the end). A guard callback lets the viewer pause auto-play for prediction questions.
4. **Visualization components**: `TraceViewer` (generic controls, explanation with `aria-live`, variables, counters, highlighted pseudocode, prediction mode, keyboard ←/→), `ArrayView` (bars or boxes; every state has a glyph + label so color is never the only cue), `TreeView` (SVG, in-order layout, CSS-transition positions so rotations animate; color + text label for RB nodes), `LineChart` (single axis, log option, hover read-out, legend, dashed = theory / dots = measurement).
5. **Content** (`src/content`): typed lesson data; prose in a tiny markup (`$…$`, `$$…$$`, `**`, lists) rendered by `Rich`. Visualizers are referenced by string keys (`viz: 'select'`) resolved by `src/viz/registry.tsx`, so adding a lecture means adding data + (optionally) a visualizer — no layout changes.
6. **App UI** (`src/pages`): dashboard (progress, continue, search, status filter), lesson page (fixed section order, numbered; sidebar TOC that collapses on mobile), sources, settings.

## Languages (Turkish / English)
- `src/i18n/lang.ts` keeps the active language in a module variable and exposes `tx(tr, en)`. Pure engines call `tx` for trace explanations, so no React context has to reach them.
- The language is a persisted preference (`prefs.lang`). `ProgressProvider` sets the module variable synchronously during render, and `App` keys the page tree on the language, so switching remounts the pages and every memoized trace is regenerated in the new language (visualizer state resets, which is acceptable).
- Lesson content is duplicated per language (`src/content/lecture*.ts` and `src/content/en/lecture*.ts`) rather than interleaved, so each file reads naturally. `content.test.ts` asserts that both languages have identical structure (ids, section kinds, visualizers, pseudocode, quiz answers, sources) and that the English files contain no Turkish text.
- Section labels are language-neutral keys (`intuition`, `formal`, `proofIdea`, `formalProof`) rendered via a lookup; source links carry `label` and `labelEn`.

## Theme
The header button toggles between light and dark based on the *effective* theme (an explicit choice, or the system setting while the preference is `system`). Settings still offer “follow system”. An inline script in `index.html` applies the saved theme and language before first paint.

## Lesson structure: in-text checks, guided tasks, read tracking
- A section may carry `check` (ungraded “try it yourself” questions shown right after it) and `tasks` (guided instructions before its visualizer). Check results live only in page state and feed a per-section summary at the end of the lesson; the graded mini quiz is unchanged.
- Sections count as read when a sentinel at their end scrolls into view (IntersectionObserver); read sections are persisted per lesson (`progress.read`) and shown in the in-lesson table of contents with a progress bar.
- Select is the first lesson using the full format (motivation, lower bound, pivot-quality chart, median-of-medians grid, group-size trees, “in practice”); the computations behind the new figures live in `src/engines/selectAnalysis.ts` and are unit-tested.

## Animation
Movement is slower than UI feedback (`--move: 560ms` vs `--dur`), and TraceViewer sets `--anim-ms` from the playback speed so fast playback never queues animations. `ArrayView` diffs consecutive snapshots: a value that moved glides from its old index along a small arc (swaps and shifts read as movement), a new value pops in, a state change pulses once. Tree nodes glide to new positions and edges are `<path>`s whose `d` transitions with them; new nodes pop in and the current node’s ring pulses. The explanation text and the active pseudocode line animate on every step. Everything is disabled under `prefers-reduced-motion`.

## Algorithmic choices
- **InsertionSort / MergeSort** follow the Lecture 2 Python code. Merge handles exhausted lists (the notes leave this as an exercise) and uses `<=` (stable).
- **Karatsuba** uses BigInt and splits at m = ⌊n/2⌋ low digits; cost = one-digit multiplications, matching the Lecture 1 cost model.
- **Select** is 1-based in k. To stay correct with duplicates it forms `A=`; with distinct keys this is exactly the notes’ algorithm. Median of medians: groups of 5, lower median for even groups, pivot = `Select(C, ⌈g/2⌉)`; the inner call is collapsed into one trace step.
- **QuickSort** uses the slides’ “pick a pivot, swap it to the end” + Lomuto partition, iteratively in the fast version (no stack overflow on sorted input). Pivot rules: last, first, seeded random, median (ideal).
- **Randomness** comes from a seeded mulberry32 PRNG (`src/engines/random.ts`); the same seed reproduces a run exactly. The random-input buttons just generate new inputs.
- **CountingSort / RadixSort** use FIFO bucket lists as in the notes; items carry their input position so stability is visible and testable.
- **Decision trees** are not hand-drawn: every ordering of n items is run through the real comparison algorithm with an oracle; equal answer histories are merged into one tree (the builder throws if an algorithm were non-deterministic).
- **Red-black insertion** follows the notes’ case numbering (1: parent black; 2: red uncle → recolor and continue; 3: black uncle → optional inner rotation, recolor, rotate) with the mirror cases from CLRS. Snapshots are taken between recolor and rotation, so transient violations are visible and the invariant checker shows them.
- **Master Theorem tool** compares a with b^d (relative tolerance 1e-9), validates a ≥ 1 integer, b > 1, d ≥ 0, and refuses (with an explanation and a suggested method) for different-size subproblems, T(n−c), and the log-factor gap case. The general version (Theorem 3) is applied to f(n) = n^d log^k n including the regularity condition.
- **Substitution tool** uses exact rational arithmetic (`Frac`) so D = c/(1 − Σ kαᵖ) is printed exactly; floors/ceilings are ignored as in the notes.

## Practice lab
`src/practice/drills.ts` turns an algorithm run into a list of decisions (`answer`, `hint`, `why`, plus the state to draw before the decision); `HandTrace.tsx` only compares the learner's choice to `answer`, so the UI never re-implements an algorithm. `src/practice/generators.ts` builds questions from a seed (mulberry32), computing answers with the engines; tests run every generator over 150 seeds in both languages (no NaN/undefined, balanced `$`, distinct MCQ options, no Turkish letters in English) and cross-check answers against the engines (QuickSort comparisons, Select, RadixSort, Merge).

## Coding exercises
The learner's code runs in a throwaway Web Worker built from a Blob (`runner.ts`); the worker is terminated after 5 s, which stops infinite loops and rejects algorithms that are far too slow for the large tests. The harness is kept as source text (`HARNESS_SRC`) so the same code runs in the worker and, in unit tests, through `new Function`. Arguments are deep-copied per test so mutating them cannot affect the expected values; expected outputs come from reference implementations (the engines where possible). Tests check that every sample solution passes and every starter fails.

## Exam mode
`exam.ts` mixes fixed questions (lesson quiz + in-text checks) and generated ones, about half each; grading is pure (`grade`) and per-lesson scores feed the result page. Only a summary of each exam is stored (time, score, duration, lessons), newest first, capped at 20.

## Notes
Per-lesson plain-text notes, autosaved 600 ms after typing stops, collected on `#/notlar` with a Markdown export. A progress reset keeps them, since they are the learner's own writing.

## Persistence
`localStorage` key `algoview:progress:v1`, versioned JSON: lesson status (in-progress on visit, completed on explicit click), quiz records (correct once ⇒ stays correct, attempts counted), last lesson, practice stats (`drills`: runs / perfect runs per drill; `gen`: solved / attempts per generator), notes, exam history, coding drafts and solved flags, preferences (theme, speed, prediction mode). All access is wrapped in try/catch; corrupt or foreign-version data falls back to an empty state. Reset requires confirmation in a modal dialog and keeps preferences (language, theme, speed, prediction mode).

Backup and sync: Settings → *Save your work* downloads the whole object as `{ app: 'algo-view', exportedAt, progress }` JSON and restores such a file (or a bare progress object) after showing a summary and asking for confirmation. Stored and imported data both go through `parseProgress`, which rejects other versions and replaces malformed fields with empty values. A `storage` event listener adopts data saved by another open tab so two tabs do not overwrite each other. A failed write (private window, quota) is surfaced as a warning in Settings; the page can also call `navigator.storage.persist()` on request so the browser does not evict the data.

## Accessibility
Semantic landmarks, skip link, visible focus rings, labelled controls, `aria-live` explanations and quiz feedback, keyboard stepping, keyboard-operable tree nodes in the color playground, `prefers-reduced-motion` disables transitions, all algorithm states carry glyphs/labels in addition to color, light/dark themes with separately chosen tokens. Code fonts disable ligatures so `<|`, `>=` render literally.

## Testing strategy
- `src/engines/*.test.ts`: correctness on edge cases (empty, single, duplicates, negatives, extreme values) and hundreds of seeded random inputs; trace-consistency checks (final snapshot sorted, loop/partition invariants at the right lines, counters equal to the untraced versions, prediction answers equal the branch actually taken); RB invariants after **every** insertion for sorted, reversed, zig-zag and random orders, plus height ≤ 2 log₂(n+1); BST delete across all cases; decision trees have n! leaves and height ≥ ⌈log₂ n!⌉; Master/substitution results for every example used in the lessons.
- `src/content/content.test.ts`: curriculum integrity (lectures 1–7 only, unique ids, valid answers, registered viz keys, official links) and every computed number quoted in practice solutions.
- `src/ui.test.tsx`: player reducer, persistence round-trip, TraceViewer next/prev/reset/end/keyboard/auto-play/prediction mode, quiz feedback for all question kinds, input validation, lesson page and dashboard state.
- `e2e/smoke.spec.ts` (Playwright, desktop 1366×900 and Pixel 7): navigation, controls, invalid input, quiz + persistence across reload, reset confirmation, RB insert, every lesson renders without console errors or horizontal overflow (in both languages), and the theme toggle survives a reload.
