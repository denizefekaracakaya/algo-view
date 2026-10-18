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

## Persistence
`localStorage` key `algoview:progress:v1`, versioned JSON: lesson status (in-progress on visit, completed on explicit click), quiz records (correct once ⇒ stays correct, attempts counted), last lesson, preferences (theme, speed, prediction mode). All access is wrapped in try/catch; corrupt or foreign-version data falls back to an empty state. Reset requires confirmation in a modal dialog and keeps preferences (language, theme, speed, prediction mode).

## Accessibility
Semantic landmarks, skip link, visible focus rings, labelled controls, `aria-live` explanations and quiz feedback, keyboard stepping, keyboard-operable tree nodes in the color playground, `prefers-reduced-motion` disables transitions, all algorithm states carry glyphs/labels in addition to color, light/dark themes with separately chosen tokens. Code fonts disable ligatures so `<|`, `>=` render literally.

## Testing strategy
- `src/engines/*.test.ts`: correctness on edge cases (empty, single, duplicates, negatives, extreme values) and hundreds of seeded random inputs; trace-consistency checks (final snapshot sorted, loop/partition invariants at the right lines, counters equal to the untraced versions, prediction answers equal the branch actually taken); RB invariants after **every** insertion for sorted, reversed, zig-zag and random orders, plus height ≤ 2 log₂(n+1); BST delete across all cases; decision trees have n! leaves and height ≥ ⌈log₂ n!⌉; Master/substitution results for every example used in the lessons.
- `src/content/content.test.ts`: curriculum integrity (lectures 1–7 only, unique ids, valid answers, registered viz keys, official links) and every computed number quoted in practice solutions.
- `src/ui.test.tsx`: player reducer, persistence round-trip, TraceViewer next/prev/reset/end/keyboard/auto-play/prediction mode, quiz feedback for all question kinds, input validation, lesson page and dashboard state.
- `e2e/smoke.spec.ts` (Playwright, desktop 1366×900 and Pixel 7): navigation, controls, invalid input, quiz + persistence across reload, reset confirmation, RB insert, every lesson renders without console errors or horizontal overflow (in both languages), and the theme toggle survives a reload.
