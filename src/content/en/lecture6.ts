import type { Lecture } from '../types'
import { SRC } from '../sources'

export const lecture6: Lecture = {
  n: 6,
  title: 'BucketSort and Lower Bounds for Sorting',
  titleEn: 'BucketSort and Lower Bounds for Sorting',
  date: 'January 26, 2026',
  blurb: 'The Ω(n log n) lower bound in the comparison model — and going beyond it by using the values: CountingSort and RadixSort.',
  lessons: [
    {
      id: 'l6-lower-bound',
      lecture: 6,
      title: 'Lower bound for comparison-based sorting',
      titleEn: 'Lower bound for comparison-based sorting',
      summary: 'Every comparison-based algorithm is a decision tree; $n!$ leaves $\\Rightarrow$ height $\\Omega(n\\log n)$.',
      minutes: 30,
      objectives: [
        'Explain why the model of computation matters: which operations are allowed?',
        'See that every deterministic comparison-based algorithm can be represented as a decision tree.',
        'Prove that the worst-case running time is bounded by the tree height, and the height by $\\log_2(n!) = \\Omega(n\\log n)$.',
        'Tell which algorithms the lower bound applies to and which it does not.',
      ],
      prerequisites: ['MergeSort and QuickSort', 'Binary trees', 'Logarithms'],
      sections: [
        {
          kind: 'intuition',
          title: 'Intuition: “StickSort” and the model of computation',
          label: 'intuition',
          body: `The joke in the slides: drop sticks upright on a table and they are “sorted” by length — $O(1)$! The lesson: a lower bound is only meaningful in a particular **model of computation**.

**The comparison-based model:** you cannot access the values of the items directly; you can only ask a “genie” “is $x$ greater than $y$?”. InsertionSort, MergeSort and QuickSort live in this model.`,
        },
        {
          kind: 'formal',
          title: 'Theorem (Lecture 6 slides)',
          box: 'formal',
          label: 'formal',
          body: `- Every **deterministic** comparison-based sorting algorithm takes $\\Omega(n\\log n)$ steps in the worst case.
- Every **randomized** comparison-based sorting algorithm takes $\\Omega(n\\log n)$ steps **in expectation**. (Its proof is outside the scope of this lesson.)

Consequence: in the comparison model MergeSort is **asymptotically optimal**.`,
        },
        {
          kind: 'viz',
          title: 'Decision tree explorer',
          viz: 'decisionTree',
          body: `The trees below were built by actually running the selected algorithm: every possible input ordering was run with an oracle and the questions asked were recorded. Change the hidden input; the length of the highlighted path is the number of comparisons on that input. Compare the number of leaves and the height with $\\lceil\\log_2 n!\\rceil$.`,
        },
        {
          kind: 'correctness',
          title: 'Proof',
          label: 'formalProof',
          proof: [
            { title: 'Algorithm = decision tree', body: 'A deterministic algorithm chooses its next question based on the answers so far. Internal nodes are questions, the two children are the YES/NO answers, and the leaves are outputs. Running on an input is a path from the root to a leaf.' },
            { title: 'Running time ≥ path length', body: 'Each question is at least one step; so the worst-case running time ≥ the longest path = the height $h$ of the tree.' },
            { title: 'At least n! leaves', body: '$n$ distinct items have $n!$ orderings; each needs a different output. If two different orderings ended at the same leaf, the algorithm would give a wrong output on one of them.' },
            { title: 'Height', body: 'A binary tree of height $h$ has at most $2^h$ leaves: $2^h \\ge n!$, i.e. $h \\ge \\log_2(n!)$.' },
            { title: 'Stirling', body: '$\\log_2(n!) \\ge \\log_2\\big((n/2)^{n/2}\\big) = \\frac n2\\log_2\\frac n2 = \\Omega(n\\log n)$. (Slides: $n! \\approx (n/e)^n$.)' },
          ],
        },
        {
          kind: 'complexity',
          title: 'What does the lower bound say, and what doesn’t it?',
          body: `- It applies only to algorithms **in the comparison model**. Algorithms that use the values directly (e.g. as a bucket index) are outside this model — the next lesson.
- It is a **lower bound** (Ω): it says “no comparison algorithm can be faster”; it doesn’t say any particular algorithm is fast.
- It is about the worst case: on some inputs (e.g. InsertionSort on a sorted array) far fewer comparisons may be made; but every algorithm has at least one “bad” input.`,
        },
        {
          kind: 'mistakes',
          title: 'Common mistakes',
          body: `- “Every sorting algorithm needs $\\Omega(n\\log n)$.” — False: CountingSort/RadixSort can run in $O(n)$ in a different model.
- Thinking $\\log_2(n!)$ is much smaller than $n\\log n$: $\\log_2(n!) = \\Theta(n\\log n)$.
- Skipping the link between “every leaf is a different ordering” and “at least $n!$ leaves” in the proof.`,
        },
      ],
      quiz: [
        {
          id: 'q1',
          kind: 'numeric',
          prompt: 'What is the minimum height of the decision tree of a comparison algorithm that sorts $n = 4$ items?',
          answer: 5,
          hint: '$\\lceil \\log_2 24 \\rceil$.',
          explanation: '$4! = 24$, $2^4 = 16 < 24 \\le 32 = 2^5$: the height is at least 5.',
        },
        {
          id: 'q2',
          kind: 'mcq',
          prompt: 'Using a “3-sort” function that sorts only 3 items, how many calls are needed at least to sort $n$ items (the asymptotically largest lower bound)?',
          options: ['$\\Omega(\\log n)$', '$\\Omega(\\sqrt n)$', '$\\Omega(n)$', '$\\Omega(n\\log n)$'],
          answer: 3,
          hint: 'How many different outcomes can one call have? The decision tree is now $6$-ary.',
          explanation: 'Each call gives one of $3! = 6$ outcomes: $6^h \\ge n!$ ⇒ $h \\ge \\log_6 n! = \\Omega(n\\log n)$.',
        },
        {
          id: 'q3',
          kind: 'mcq',
          prompt: 'Which one is **not** affected by the comparison-based lower bound?',
          options: ['MergeSort', 'Randomized QuickSort', 'RadixSort', 'InsertionSort'],
          answer: 2,
          hint: 'Which one uses the value (the digits) of the key directly?',
          explanation: 'RadixSort uses digit values as bucket indices; it is not in the comparison model.',
        },
        {
          id: 'q4',
          kind: 'mcq',
          prompt: 'Is a comparison-only data structure that supports $O(1)$ insert, $O(1)$ delete and $O(1)$ “return the minimum” possible?',
          options: ['Possible', 'Impossible'],
          answer: 1,
          hint: 'How would you sort $n$ items with such a structure?',
          explanation: 'If it were possible: $n$ inserts, then $n$ times “return minimum + delete” would give a comparison-based sort in $O(n)$ — contradicting the lower bound.',
        },
      ],
      practice: [
        {
          id: 'p1',
          prompt: `Our own example: a student claims that the algorithm “compare the first two elements, then insert the rest with binary search” makes 6 comparisons in the worst case for $n = 5$. Is that possible?`,
          hints: ['$5! = 120$ and $2^6 = 64$.'],
          solution: `No. A decision tree with 6 comparisons has at most $2^6 = 64$ leaves, but $5! = 120$ different orderings must be distinguished. At least $\\lceil\\log_2 120\\rceil = 7$ comparisons are needed.`,
        },
      ],
      sources: [SRC.l6.pre, SRC.l6.slides, SRC.l6.notes, SRC.l6.blum, SRC.l6.concept, SRC.sec.s4],
    },
    {
      id: 'l6-bucketsort',
      lecture: 6,
      title: 'BucketSort: CountingSort and RadixSort',
      titleEn: 'BucketSort: CountingSort and RadixSort',
      summary: 'Use values as bucket indices: $O(n + r)$ and $O(d(n + r))$.',
      minutes: 35,
      objectives: [
        'Run CountingSort (one FIFO bucket per key) and explain its $O(n + r)$ time.',
        'Define stability and show why it matters.',
        'Prove LSD RadixSort correct with the invariant “sorted by the first $k$ digits”.',
        'Assess how the choice of base $r$ affects the $O(d(n + r))$ time, and the assumptions.',
      ],
      prerequisites: ['The lower-bound lesson', 'Linked lists', 'Number bases'],
      sections: [
        {
          kind: 'intuition',
          title: 'Intuition: sorting by birth month',
          label: 'intuition',
          body: `Pre-lecture exercise: sort $n$ students by birth month. MergeSort takes $O(n\\log n)$. But if you open 12 boxes, drop each student into the box of their birth month, then concatenate the boxes from January to December, it is $O(n + 12) = O(n)$! We made no comparisons at all: we used **the value directly as an index**.

The “BucketSort” in the lecture title is this bucket idea; the notes and slides develop it as **CountingSort** and **RadixSort**, built on top of it.`,
        },
        {
          kind: 'formal',
          title: 'Algorithms and assumptions',
          box: 'formal',
          label: 'formal',
          body: `**CountingSort** (keys in $\\{0, \\dots, r-1\\}$): create $r$ empty FIFO buckets (linked lists); append each item to the **end** of its key’s bucket; concatenate the buckets in the order $0, 1, \\dots, r-1$. **Worst case** $O(n + r)$.

**Stability:** if $x$ comes before $y$ in the input and they have the same key, $x$ also comes first in the output. FIFO buckets guarantee this.

**RadixSort** ($d$ digits, base $r$): for $t = 1, \\dots, d$ (starting from the least significant digit) apply CountingSort keyed on digit $t$. **Worst case** $O(d(n + r))$; if the largest value is $M$, $d = \\lfloor\\log_r M\\rfloor + 1$.

**Assumptions (slides):** we can access values directly; the possible values are known in advance; there are not too many possible values.`,
        },
        {
          kind: 'viz',
          title: 'Bucket visualizer',
          viz: 'bucketSort',
          body: `Start with CountingSort, then switch to RadixSort. The subscripts show the input order: watch the order of items with equal keys being preserved. In RadixSort, change the base (2, 10, 16…) and see how the number of passes and buckets changes. In prediction mode, guess each item’s bucket.`,
        },
        {
          kind: 'correctness',
          title: 'Correctness of RadixSort',
          label: 'formalProof',
          proof: [
            { title: 'Hypothesis', body: 'After iteration $k$, the array is sorted by its $k$ least significant digits.' },
            { title: 'Base', body: '$k = 0$: “sorted by 0 digits” is true of every array.' },
            { title: 'Step: different k-th digit', body: 'Let $x < y$ by their last $k$ digits. If $x_k < y_k$, $x$ goes into an earlier bucket and comes first in the output.' },
            { title: 'Step: same k-th digit', body: 'If $x_k = y_k$, then $x < y$ on the last $k-1$ digits; by the hypothesis $x$ comes before $y$. They go into the same bucket, and since CountingSort is **stable**, $x$ stays in front.' },
            { title: 'Conclusion', body: 'After $d$ iterations the array is sorted by all digits, i.e. completely. Without stability the second case would collapse!' },
          ],
        },
        {
          kind: 'complexity',
          title: 'Choosing the base',
          body: `- Sorting $n$ numbers in $\\{1..n\\}$ with base 10: $d = \\lfloor\\log_{10} n\\rfloor + 1$ → $O(n\\log n)$ — no better than MergeSort.
- Base $r = n$: $O\\big((\\log_n M + 1)(n + n)\\big)$. If $M \\le n^c$ ($c$ constant), that is $O(n)$ — beating MergeSort and QuickSort.
- If $M = 2^n$, then $d \\approx n/\\log n$ → $O(n^2/\\log n)$: we don’t use RadixSort in this regime.
- A large $r$ means more buckets (time/memory), a small $r$ means more digits: a **trade-off**.`,
        },
        {
          kind: 'mistakes',
          title: 'Common mistakes',
          body: `- Starting RadixSort from the most significant digit and re-bucketing the whole array on every pass: gives a wrong result.
- Using the buckets like LIFO stacks: stability breaks and RadixSort sorts incorrectly.
- Using CountingSort when $r \\gg n$: in $O(n + r)$ the dominant term becomes $r$.
- Negative numbers: this version assumes non-negative keys (it can be extended with an offset).`,
        },
      ],
      quiz: [
        {
          id: 'q1',
          kind: 'mcq',
          prompt: 'What is the array after the **first** pass of base-10 RadixSort on $[21, 345, 13, 101, 50, 234, 1]$?',
          options: ['$[50, 21, 101, 1, 13, 234, 345]$', '$[1, 13, 21, 50, 101, 234, 345]$', '$[101, 1, 13, 21, 234, 345, 50]$', '$[21, 101, 1, 50, 13, 234, 345]$'],
          answer: 0,
          hint: 'Ones digits: 1, 5, 3, 1, 0, 4, 1. The order within a bucket is preserved.',
          explanation: 'Bucket 0: 50; bucket 1: 21, 101, 1 (in input order); bucket 3: 13; bucket 4: 234; bucket 5: 345.',
        },
        {
          id: 'q2',
          kind: 'mcq',
          prompt: 'Which base is best for RadixSort when sorting $n$ integers in the range $[1, n^3)$?',
          options: ['2', '10', '$n$', '$n^2$'],
          answer: 2,
          hint: '$O(d(n + r))$ and $d = \\lfloor\\log_r M\\rfloor + 1$.',
          explanation: '$r = n$: $d \\le 3$ (or 4), time $O(n)$. With $r = n^2$ there are $O(n^2)$ buckets; with $r = 2$ or $10$, $d = \\Theta(\\log n)$.',
        },
        {
          id: 'q3',
          kind: 'mcq',
          prompt: 'What is CountingSort’s running time for $n$ integers in the range $[1, n^3)$?',
          options: ['$\\Theta(n)$', '$\\Theta(n\\log n)$', '$\\Theta(n^2)$', '$\\Theta(n^3)$'],
          answer: 3,
          hint: '$r = n^3$.',
          explanation: '$O(n + r) = O(n + n^3) = \\Theta(n^3)$ — creating and scanning the buckets dominates.',
        },
        {
          id: 'q4',
          kind: 'mcq',
          prompt: 'Which property of CountingSort does the correctness proof of RadixSort rely on?',
          options: ['Being in place', 'Being stable', 'Being randomized', 'Using comparisons'],
          answer: 1,
          hint: 'What should the relative order of two numbers with the same digit be?',
          explanation: 'Items with the same $k$-th digit must keep the order of the previous pass; that is stability.',
        },
      ],
      practice: [
        {
          id: 'p1',
          prompt: `Our own example: apply base-10 LSD RadixSort to $[170, 45, 75, 90, 802, 24, 2, 66]$; write the array after each pass.`,
          hints: ['There are three digits (802); numbers like 45 have a hundreds digit of 0.'],
          solution: `Pass 1 (ones): $[170, 90, 802, 2, 24, 45, 75, 66]$. Pass 2 (tens): $[802, 2, 24, 45, 66, 170, 75, 90]$. Pass 3 (hundreds): $[2, 24, 45, 66, 75, 90, 170, 802]$. Compare with the “Duplicates” example in the visualizer.`,
        },
      ],
      sources: [SRC.l6.pre, SRC.l6.notes, SRC.l6.slides, SRC.l6.notebook, SRC.l6.concept],
    },
    {
      id: 'l6-compare',
      lecture: 6,
      title: 'Comparing the sorting algorithms so far',
      titleEn: 'Comparing the sorting algorithms so far',
      summary: 'Model, kind of guarantee and assumptions: which one when?',
      minutes: 15,
      objectives: [
        'Compare the sorting algorithms of Lectures 2–6 by model, worst case, expected time and assumptions.',
        'Distinguish worst-case, expected and input-distribution-dependent performance.',
        'Choose a suitable algorithm for a scenario and justify it.',
      ],
      prerequisites: ['The sorting lessons of Lectures 2–6'],
      sections: [
        {
          kind: 'viz',
          title: 'Comparison table and scenarios',
          viz: 'sortComparison',
          body: `Pick a scenario; the suitable algorithms and the reasoning are highlighted. Pay special attention to the “kind of guarantee” column in the table.`,
        },
        {
          kind: 'text',
          title: 'Three different kinds of guarantee',
          body: `- **Worst case (deterministic):** holds for every input (MergeSort $O(n\\log n)$, CountingSort $O(n + r)$).
- **Expected (randomized algorithm):** for every input, an expectation over the algorithm’s random choices (randomized QuickSort $O(n\\log n)$). A single run may be worse.
- **Depends on the input distribution (average case):** under the assumption that inputs arrive at random (e.g. fixed-pivot QuickSort doing well on random permutations). An adversary can break this assumption.`,
        },
      ],
      quiz: [
        {
          id: 'q1',
          kind: 'mcq',
          prompt: 'In a setting where an adversary picks the inputs and only comparisons are allowed, which algorithm gives a **worst-case** $O(n\\log n)$ guarantee?',
          options: ['Randomized QuickSort', 'MergeSort', 'InsertionSort', 'CountingSort'],
          answer: 1,
          hint: 'What kind of guarantee does randomized QuickSort have?',
          explanation: 'MergeSort is deterministic and $O(n\\log n)$ in the worst case. Randomized QuickSort’s guarantee is for the expected time.',
        },
        {
          id: 'q2',
          kind: 'mcq',
          prompt: 'For QuickSort with a fixed pivot (the first element), what kind of guarantee is the claim “$O(n\\log n)$ on average over random permutations”?',
          options: ['Worst case', 'Expected, over the algorithm’s randomness', 'Dependent on the input distribution (average case)', 'A lower bound'],
          answer: 2,
          hint: 'Does the randomness come from the algorithm or from the input?',
          explanation: 'There is no randomness in the algorithm; the claim rests on the assumption that the inputs are random. On sorted input it is $\\Theta(n^2)$.',
        },
      ],
      practice: [
        {
          id: 'p1',
          prompt: `Our own example: you need to sort 10 million product records by a category code between 0 and 999, **without disturbing the existing order of records within the same category**. Which algorithm would you choose? Why?`,
          hints: ['Which property does “without disturbing the existing order” ask for?', '$r = 1000 \\ll n$.'],
          solution: `CountingSort ($r = 1000$ buckets): $O(n + r) = O(n)$ and stable — records in the same category keep their input order. MergeSort is stable too, but $O(n\\log n)$; QuickSort is not stable.`,
        },
      ],
      sources: [SRC.l6.slides, SRC.l5.slides, SRC.l2.notes],
    },
  ],
}
