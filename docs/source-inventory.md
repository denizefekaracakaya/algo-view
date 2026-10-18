# Source inventory

All sources are public pages/files of Stanford CS161, Winter 2026 (inspected 18 Oct 2026). PDFs were downloaded to a temporary scratch folder and converted to text with `pdftotext` for reading; nothing from them is bundled in the app. Lecture videos (Canvas/Panopto) require Stanford authentication and were **not** accessed.

Legend — **Read**: text read in full. **Skimmed**: headings/key passages read. **Linked only**: link recorded, contents not inspected.

## Course pages

| Source | URL | Use |
|---|---|---|
| Lectures page | https://stanford-cs161.github.io/winter2026/lectures/ | Lecture titles, dates, list of resources per lecture (parsed in full) |
| Schedule | https://stanford-cs161.github.io/winter2026/schedule/ | Confirmed order: L1 Jan 5 … L7 Jan 28, L8 Hashing Feb 2 (out of scope); midterm covers through L7 |
| Homework | https://stanford-cs161.github.io/winter2026/homework/ | HW1–4 release/due dates relative to L1–7 |
| Sections | https://stanford-cs161.github.io/winter2026/sections/ | Section handout list |

## Lectures 1–7

| Lecture | Exact title | Resource | URL (under `stanford-cs161.github.io`) | Status | Topics extracted → how used |
|---|---|---|---|---|---|
| 1 | Why are you here? | Lecture notes | `/winter2026/assets/files/lecture1-notes.pdf` | Read | Why algorithms (fundamental / useful / fun); running time as scaling; 10⁴·n^1.6 vs n² thought experiment; precomputation infeasible; D&C split x=10^{n/2}a+b; T(n)=4T(n/2) (Mult1) vs Karatsuba 3T(n/2) → n^{log₂3}; history (Toom–Cook … Harvey–van der Hoeven); etymology (al-Khwarizmi) → lessons `l1-why`, `l1-karatsuba`, `HandVsComputer`, `KaratsubaViz` |
| 1 | | Slides | `/winter2026/assets/files/Lecture1.pdf` | Linked only (text extracted, not used) | — |
| 1 | | Notebook (Karatsuba) | colab `lecture1_karatsuba.ipynb` | Linked only | — |
| 1 | | Concept check “Multiplication” | `/winter2025-bank/multiplication.pdf` | Read | n² digit pairs; t subproblems → n^{log₂t}; t<4 beats grade school; Karatsuba t=3 → quiz q1–q2 of `l1-karatsuba` (reworded) |
| 2 | Asymptotics, Worst-Case Analysis, and MergeSort | Lecture notes | `/winter2026/assets/files/lecture2-notes.pdf` | Read | InsertionSort Python code + loop-invariant proof; MergeSort/Merge pseudocode (incomplete on purpose); recursion invariant; recursion tree 11n per level, 11n log n + 11n; worst-case (adversary) analysis; O/Ω/Θ definitions; polynomial claim and nᵏ≠O(nᵏ⁻¹) proofs → `l2-*` lessons, engines `insertionSort.ts`, `mergeSort.ts` |
| 2 | | “Proof that InsertionSort is Correct” | `/winter2026/assets/files/CS161Lecture02_handout.pdf` | Skimmed | Rigorous induction format → proof stepper in `l2-insertion` |
| 2 | | Pre-lecture exercise | `/winter2026/assets/files/lecture2-pre.pdf` | Linked only (text extracted) | — |
| 2 | | Slides, notebooks (`lecture2_pre`, `lecture2_sorting`) | `/winter2026/assets/files/Lecture2.pdf`, colab | Linked only | — |
| 2 | | Concept checks “Asymptotics”, “Sorting” | `/winter2025-bank/asymptotics.pdf`, `sorting.pdf` | Skimmed | Style of asymptotic / sorting questions (inspiration only) |
| 3 | Solving Recurrences and the Master Theorem | Lecture notes | `/winter2026/assets/files/lecture3-notes.pdf` | Read | Recurrence definition; Mult1/Karatsuba/MergeSort recurrences; Master Theorem (a≥1, b>1, d) and recursion-tree proof; examples; general version (Theorem 3); substitution method → `l3-master`, `l3-substitution`, `recurrence.ts` |
| 3 | | Slides | `/winter2026/assets/files/lecture3-slides.pdf` | Linked only (text extracted) | — |
| 3 | | Pre-lecture | `/winter2026/assets/files/lecture3-pre.pdf` | Linked only | — |
| 3 | | Concept check “Recurrence Relations” | `/winter2025-bank/recurrence.pdf` | Read | 5T(n/4)+2n level counts; 3T(n/81)+n^{1/4}; 2T(n/2)+3T(n/3)+n² → 6n² → quiz items (re-verified by tests) |
| 4 | Median and Selection | Lecture notes | `/winter2026/assets/files/lecture4-notes.pdf` | Read | Selection problem (k∈{1..n}); SelectMin and Ω(n); Select(A,n,k) with A</A>; bad pivot Θ(n²); median pivot O(n); random pivot expected O(n); median of medians, Lemma 7n/10+5; T(n)≤T(n/5)+T(7n/10)+cn by substitution (d=10c); failed guesses; correctness by strong induction → `l4-select`, `select.ts` |
| 4 | | Slides, pre-lecture, notebook (`lecture4_select`) | `/winter2026/assets/files/lecture4-slides.pdf`, … | Linked only | — |
| 4 | | Concept check “Selection” | `/winter2025-bank/select.pdf` | Read | Groups of 7 → T(n/7)+T(5n/7); groups of 3 → Θ(n log n) → quiz q4–q5 |
| 5 | Randomized Algorithms and QuickSort | Lecture notes | `/winter2026/assets/files/lecture5-notes.pdf` | Read | QuickSort description; T(n)≤cn+T(k−1)+T(n−k); worst/median/random pivot; expected vs worst case (worst-case input, randomness of algorithm); indicator X_{i,j}, P=2/(j−i+1), E[C]≤2n ln n; alternative recurrence proof → `l5-*`, `quickSort.ts` |
| 5 | | Slides | `/winter2026/assets/files/lecture5-slides.pdf` | Skimmed (grep) | In-place partition idea “choose pivot randomly, swap it with the last one”; QuickSort vs MergeSort table (in-place, stable) → Lomuto implementation, comparison table |
| 5 | | Pre-lecture, notebook (`lecture5_quicksort`) | | Linked only | — |
| 5 | | Concept check “Randomized Algorithms” | `/winter2025-bank/random.pdf` | Read | Coupon collector; QuickSelect worst Θ(n²), expected Θ(n) → wording of “expected vs worst” quiz items |
| 6 | BucketSort and Lower Bounds for Sorting | Lecture notes | `/winter2026/assets/files/lecture6-notes.pdf` | Read | (Lower bound “see website”); CountingSort with r linked-list buckets, O(n+r), stability; RadixSort LSD with correctness induction; O(d(n+r)); base choice r=n; M≤nᶜ vs M=2ⁿ → `l6-bucketsort`, `bucketSort.ts` |
| 6 | | Slides | `/winter2026/assets/files/lecture6-slides.pdf` | Read (first ~50 slides) | StickSort/model of computation; comparison model with genie; decision trees, n! leaves, depth log(n!) = Ω(n log n); deterministic + randomized theorems; CountingSort assumptions; RadixSort example 21,345,13,101,50,234,1; base 10 vs base 100 → `l6-lower-bound`, `decisionTree.ts`, presets |
| 6 | | Pre-lecture | `/winter2026/assets/files/lecture6-pre.pdf` | Read | Sorting people by birth month → intuition section & preset |
| 6 | | Avrim Blum’s notes | http://www.cs.cmu.edu/~avrim/451f11/lectures/lect0913.pdf | Linked only | Listed as additional reading |
| 6 | | Notebook (`lecture6_bucketsort`) | colab | Linked only | — |
| 6 | | Concept check “Sorting Models” | `/winter2025-bank/sortingmodels.pdf` | Read | 3-sort lower bound; O(1) min-structure impossible; CountingSort/RadixSort on [1,n³) → quiz items |
| 7 | Binary Search Trees and Red-Black Trees | Lecture notes | `/winter2026/assets/files/lecture7-notes.pdf` | Read | (Heaps section — not in slides, not visualized); BST definition, search returning would-be parent (Claim 7, Remark 8), insert, delete (3 cases, successor), O(height); RB definition (5 properties), Claim 16 proof (black height, h ≤ 2 log(n+1)), rotations, insert_rb + recolor cases 1/2/3 → `l7-*`, `bst.ts`, `redBlack.ts`, `tree.ts` |
| 7 | | Slides | `/winter2026/assets/files/lecture7-slides.pdf` | Skimmed | Height = longest root-to-leaf path in edges; in-order traversal; INSERT cases 1–3; divide-and-conquer wrap-up |
| 7 | | Pre-lecture (+ solutions on the same PDF) | `/winter2026/assets/files/lecture7-pre.pdf` | Read | Tree 5;3,9;1,4,6; insert 7/8; delete 4 and 3 → preset “Ön alıştırma ağacı”, quiz q3 |
| 7 | | Pre-lecture solutions (separate file) | `/winter2026/assets/files/lecture7-pre-sol.pdf` | **Unavailable** (HTTP error on download) | Solutions are included at the end of `lecture7-pre.pdf` |
| 7 | | Concept check “Binary Search Trees” | `/winter2025-bank/bst.pdf` | Read | In-order invariance, relationships A/B/C, RB validity, path length 100 question, root rank → quiz items (reworded/original numbers) |

## Homework and sections (learning outcomes only)

| Source | URL | Status | Use |
|---|---|---|---|
| HW1 | `/winter2026/assets/files/HW1.pdf` | Skimmed (headings) | Context only (course policies, prerequisite quiz, D&C problems such as “Alien Arithmetic” mentioned in L7 slides) |
| HW2 | `/winter2026/assets/files/HW2.pdf` | Skimmed (headings) | Recurrences, Big-O via induction, modified MergeSort → confirms emphasis of L2–3 lessons |
| HW3 | `/winter2026/assets/files/HW3.pdf` | Skimmed (headings) | Medians, randomized algorithms, QuickSort with duplicates → only mentioned as a pointer; **no solution given** |
| HW4 | `/winter2026/assets/files/HW4.pdf` | Skimmed (headings) | Red-black trees, BST problems → confirms L7 focus |
| Section 1 | `/winter2026/assets/files/Section1.pdf` | Skimmed | Asymptotics via limits, induction |
| Section 2 | `/winter2026/assets/files/Section2.pdf` | Skimmed | D&C, recurrences, Select |
| Section 3 | `/winter2026/assets/files/Section3.pdf` | Skimmed | Power of randomness, expected runtime |
| Section 4 | `/winter2026/assets/files/section4_questions.pdf` | Skimmed | BST vs heaps, randomly built BSTs, min-max comparison lower bound |
| Review session (Induction & Big-O), prerequisite quiz | linked on sections/homework pages | Text extracted, not used | — |

No homework text, homework solution or section solution was reproduced in the app.
