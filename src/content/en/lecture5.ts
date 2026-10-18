import type { Lecture } from '../types'
import { SRC } from '../sources'
import { QUICKSORT_CODE } from '../../engines/quickSort'

export const lecture5: Lecture = {
  n: 5,
  title: 'Randomized Algorithms and QuickSort',
  titleEn: 'Randomized Algorithms and QuickSort',
  date: 'January 21, 2026',
  blurb: 'Random pivots, the difference between worst-case and expected time, and the 2n ln n bound via indicator variables.',
  lessons: [
    {
      id: 'l5-quicksort',
      lecture: 5,
      title: 'QuickSort and pivot selection',
      titleEn: 'QuickSort and pivot selection',
      summary: 'Partition, put the pivot in place, recurse on both sides.',
      minutes: 30,
      objectives: [
        'Trace QuickSort’s partition step and its in-place implementation.',
        'See how the choice of pivot determines the running time: $T(n) \\le cn + T(k-1) + T(n-k)$.',
        'Explain why a deterministic pivot gives $\\Theta(n^2)$ in the worst case while a median pivot gives $O(n\\log n)$.',
        'See that randomized algorithms can be run reproducibly with a seed.',
      ],
      prerequisites: ['The Select lesson', 'MergeSort', 'The Master Theorem'],
      sections: [
        {
          kind: 'intuition',
          title: 'Intuition',
          label: 'intuition',
          body: `QuickSort is very similar to Select: choose a pivot $x$ and rearrange the array as $[A_<,\\ x,\\ A_>]$. The difference: Select recurses on one side only, while QuickSort sorts **both** sides. After partitioning, the pivot is in its **final position** and never moves again.

The notes assume distinct elements (without loss of generality). In the in-place version here, elements equal to the pivot go to the right side; it also sorts correctly with repeated keys.`,
        },
        {
          kind: 'viz',
          title: 'QuickSort visualizer',
          viz: 'quickSort',
          body: `Choose the pivot rule and (for the random rule) the seed. The same seed reproduces the same run exactly; use “New seed” to compare different pivot choices. In the tree below, every node is the pivot of one call — an unbalanced tree = deep recursion = many comparisons. Try the “Last element” rule on the “Sorted” example.`,
        },
        {
          kind: 'pseudocode',
          title: 'Pseudocode (in-place partition)',
          code: QUICKSORT_CODE,
          body: `The “better partition” idea from the Lecture 5 slides: pick the pivot at random, move it to the end of the subarray, then scan left to right gathering the smaller elements at the front. The notes leave the details of the in-place version to CLRS; the version here is the Lomuto partition.`,
        },
        {
          kind: 'correctness',
          title: 'Correctness',
          label: 'proofIdea',
          proof: [
            { title: 'Partition invariant', body: 'At every step of the loop, $A[lo..i-1] <$ pivot $\\le A[i..j-1]$. Both regions start empty; each step adds one element to the right region.' },
            { title: 'Pivot in place', body: 'When the loop ends we swap the pivot with $A[i]$: everything to its left is smaller, everything to its right is greater or equal. The pivot is at its position in the sorted array.' },
            { title: 'Strong induction', body: 'Both parts are shorter; by the hypothesis the recursive calls sort them. Since left part < pivot ≤ right part, the combination is sorted. Base: length ≤ 1.' },
          ],
        },
        {
          kind: 'complexity',
          title: 'Pivot choice and running time',
          body: `If the pivot is the $k$-th smallest element: $T(n) \\le cn + T(k-1) + T(n-k)$.

- **Worst pivot (min/max):** $T(n) = T(n-1) + O(n) = \\Theta(n^2)$. On sorted input the “first/last element” rule does this every time.
- **Median pivot (via Select):** $T(n) \\le cn + 2T(n/2) = O(n\\log n)$ — a **deterministic worst case**, but not practical because Select’s constants are large.
- **Random pivot:** the worst case is still $\\Theta(n^2)$ (the worst choice every time), but the **expected** time **for every input** is $O(n\\log n)$ — the topic of the next lesson.

The comparison in the slides: QuickSort (random pivot) is easy to implement in place and is not stable; MergeSort is $O(n\\log n)$ in the worst case and stable.`,
        },
        {
          kind: 'mistakes',
          title: 'Common mistakes',
          body: `- “Randomized QuickSort is always $O(n\\log n)$.” — No: the guarantee is for the **expected** time; a single run can be bad.
- “Expected time is an average over random inputs.” — No: the input is chosen as a worst case; the average is only over the algorithm’s own random choices.
- Including the pivot in the recursive calls after partitioning (leads to infinite recursion or wasted work).
- Forgetting about many equal keys: in this version an array of all-equal values is split unevenly every time (see the repeated-keys question in Homework 3 — we don’t give its solution here).`,
        },
      ],
      quiz: [
        {
          id: 'q1',
          kind: 'mcq',
          prompt: 'After partitioning $[8, 7, 1, 3, 5, 6, 4]$ around pivot 4, what is the pivot’s index (0-based)?',
          options: ['2', '3', '4', '6'],
          answer: 0,
          hint: 'How many elements are smaller than 4?',
          explanation: 'Only two elements are smaller than 4 (1 and 3). After partitioning they occupy indices 0 and 1, and the pivot lands at index 2 — whatever partition method is used, the pivot’s final position equals the number of elements smaller than it.',
        },
        {
          id: 'q2',
          kind: 'mcq',
          prompt: 'How many comparisons does QuickSort with the deterministic “last element” pivot make on an already sorted array of $n$ elements?',
          options: ['$n - 1$', '$n\\log_2 n$', '$n(n-1)/2$', '$2n\\ln n$'],
          answer: 2,
          hint: 'In every call the pivot is the largest element of the subarray.',
          explanation: 'On each level the partition makes $m - 1$ comparisons and the right part is empty: $(n-1) + (n-2) + \\dots + 1 = n(n-1)/2$.',
        },
        {
          id: 'q3',
          kind: 'mcq',
          prompt: 'In “the expected running time of QuickSort with a random pivot is $O(n\\log n)$”, what is the expectation taken over?',
          options: [
            'Over all possible inputs (the input is random).',
            'Over the algorithm’s random pivot choices, for a fixed (worst-case) input.',
            'Over measurements on different computers.',
            'Over both the input and the pivots; both are needed.',
          ],
          answer: 1,
          hint: 'The notes: “We still consider the running time for a worst-case input…”',
          explanation: 'The guarantee holds for every input; the randomness comes only from the algorithm’s own coin flips.',
        },
      ],
      practice: [
        {
          id: 'p1',
          prompt: `Our own example: what would the running time be if the pivot were always chosen at the “10th percentile” of the subarray (i.e. $k \\approx n/10$)? Write the recurrence and estimate it with a recursion tree.`,
          hints: ['$T(n) \\le cn + T(n/10) + T(9n/10)$.', 'The total work per level is at most $cn$; how many levels does the longest branch have?'],
          solution: `The total work on each level is at most $cn$ (the part sizes sum to $\\le n$). The deepest branch multiplies the size by $9/10$ each time: $\\log_{10/9} n = O(\\log n)$ levels. Total $O(n\\log n)$. Any split with a constant ratio — however unbalanced — gives $O(n\\log n)$; the problem is only a “constant offset” like $k = O(1)$.`,
        },
      ],
      sources: [SRC.l5.pre, SRC.l5.notes, SRC.l5.slides, SRC.l5.notebook, SRC.hw.hw3],
    },
    {
      id: 'l5-expected',
      lecture: 5,
      title: 'Expected running time via indicator variables',
      titleEn: 'Expected running time via indicator variables',
      summary: 'How often is each pair compared? $E[C] \\le 2n\\ln n$ by linearity of expectation.',
      minutes: 35,
      objectives: [
        'Apply random variables, expectation and indicator variables to QuickSort.',
        'Explain why each pair $(z_i, z_j)$ is compared at most once.',
        'Derive $P[z_i, z_j\\ \\text{compared}] = \\frac{2}{j-i+1}$.',
        'Reach the bound $E[C] \\le 2n\\ln n$ via linearity of expectation.',
        'Recognize that an experiment (a measurement) does not prove the expected-time theorem.',
      ],
      prerequisites: ['The QuickSort lesson', 'Basic probability: expectation', 'The harmonic series $\\sum 1/k \\approx \\ln n$'],
      sections: [
        {
          kind: 'formal',
          title: 'Setup (Lecture 5 notes)',
          box: 'formal',
          label: 'formal',
          body: `Let $z_1 < z_2 < \\dots < z_n$ be the elements of the sorted array. $X_{i,j}$: the number of times $z_i$ and $z_j$ are compared. Every comparison is made with the pivot, and the pivot is not part of later calls; so $X_{i,j} \\in \\{0, 1\\}$ — an **indicator variable**.

$$C = \\sum_{i<j} X_{i,j}, \\qquad E[C] = \\sum_{i<j} E[X_{i,j}] = \\sum_{i<j} P[z_i, z_j \\text{ compared}].$$

The second equality is **linearity of expectation**: it holds even though the $X_{i,j}$ are not independent. Computing the distribution of $C$ is very hard; computing its expectation is easy.`,
        },
        {
          kind: 'viz',
          title: 'Interactive: which pairs are compared, and how often?',
          viz: 'pairProbability',
        },
        {
          kind: 'correctness',
          title: 'Derivation',
          label: 'formalProof',
          proof: [
            { title: 'The window idea', body: 'Look at the window $\\{z_i, \\dots, z_j\\}$. Until an element of this window is chosen as a pivot, they all stay in the same subarray.' },
            { title: 'The first pivot decides', body: 'If the first pivot chosen from the window is $z_i$ or $z_j$, the two are compared. If it is some $z_k$ in between ($i<k<j$), $z_i$ and $z_j$ are separated to different sides and never compared.' },
            { title: 'Probability', body: 'The window has $j - i + 1$ elements and each is equally likely to be chosen first: $P = \\frac{1}{j-i+1} + \\frac{1}{j-i+1} = \\frac{2}{j-i+1}$.' },
            { title: 'Sum', body: '$E[C] = \\sum_{i=1}^{n}\\sum_{j=i+1}^{n}\\frac{2}{j-i+1} \\le \\sum_{i=1}^{n} 2\\left(\\frac12 + \\frac13 + \\dots + \\frac1n\\right) \\le 2n\\ln n$.' },
            { title: 'Running time', body: 'Each call of size $k$ makes $k-1$ comparisons and does $O(k)$ work; there are at most $n$ one-element calls. The total time is $O(C + n)$, so the expected time is $O(n\\log n)$ — **for every input**.' },
          ],
        },
        {
          kind: 'viz',
          title: 'Experiment: comparison counts with different seeds',
          viz: 'quickExperiment',
        },
        {
          kind: 'text',
          title: 'Alternative proof (summary)',
          body: `The notes also show a second route: if $T(n)$ is the expected number of comparisons, then
$$T(n) = n - 1 + \\frac{2}{n}\\sum_{i=1}^{n-1} T(i)$$
and strong induction proves $T(n) \\le 2n\\ln n$ (bounding the sum from above by $\\int 2x\\ln x\\,dx$).`,
        },
        {
          kind: 'mistakes',
          title: 'Common mistakes',
          body: `- Thinking $E[C]$ is “the most likely value of $C$”.
- Thinking linearity requires independence — it doesn’t.
- Thinking of $P[z_i, z_j\\ \\text{compared}]$ in terms of **positions** in the original array; what matters is the distance in **sorted** order ($j - i$).
- Counting the theorem as “proven” because the mean of the histogram is close to the theoretical value.`,
        },
      ],
      quiz: [
        {
          id: 'q1',
          kind: 'numeric',
          prompt: 'For $n = 10$, what is the probability that $z_3$ and $z_7$ are compared? (Decimal, e.g. 0.4)',
          answer: 0.4,
          tolerance: 0.001,
          hint: '$\\frac{2}{j - i + 1}$.',
          explanation: '$\\frac{2}{7 - 3 + 1} = \\frac{2}{5} = 0.4$. The result does not depend on $n$.',
        },
        {
          id: 'q2',
          kind: 'mcq',
          prompt: 'What is the probability that two elements adjacent in sorted order ($z_i$ and $z_{i+1}$) are compared?',
          options: ['$1/2$', '$1$', '$2/n$', '$1/n$'],
          answer: 1,
          hint: 'The window has only two elements.',
          explanation: '$\\frac{2}{2} = 1$: there is no element between them that could separate them, so they are always compared (otherwise the algorithm could not know their order).',
        },
        {
          id: 'q3',
          kind: 'mcq',
          prompt: 'Why is $X_{i,j} \\in \\{0, 1\\}$, i.e. why is a pair compared at most once?',
          options: [
            'Because QuickSort looks at each element only once.',
            'Because comparisons are always with the pivot, and the pivot is not part of later recursive calls.',
            'Because the elements are distinct.',
            'Because the pivot is chosen at random.',
          ],
          answer: 1,
          hint: 'At the moment of their first comparison, one of the two is the pivot.',
          explanation: 'At their first meeting one of them is the pivot; the pivot does not enter the subarrays, so the two can never meet again.',
        },
        {
          id: 'q4',
          kind: 'mcq',
          prompt: 'A student runs QuickSort with 1000 seeds and observes that the mean is below $2n\\ln n$. Which interpretation is correct?',
          options: [
            'The expected-time theorem has been proven.',
            'The observation is consistent with the theorem; the proof comes from the indicator-variable argument.',
            'The worst case is now $O(n \\log n)$.',
            'The same numbers will come out on other inputs.',
          ],
          answer: 1,
          hint: 'The difference between finitely many experiments and a mathematical guarantee.',
          explanation: 'The experiment is only for that input and those seeds. The theorem is a statement about the expectation that holds for every input, and it needs a proof.',
        },
      ],
      practice: [
        {
          id: 'p1',
          prompt: `Our own example: for $n = 4$, compute $E[C] = \\sum_{i<j} \\frac{2}{j-i+1}$ exactly and compare it with $n = 4$ in the experiment panel.`,
          hints: ['There are 3 pairs at distance 1, 2 pairs at distance 2 and 1 pair at distance 3.'],
          solution: `$3\\cdot\\frac22 + 2\\cdot\\frac23 + 1\\cdot\\frac24 = 3 + \\frac43 + \\frac12 = \\frac{29}{6} \\approx 4.83$. With the formula $2(n+1)H_n - 4n$: $H_4 = \\frac{25}{12}$, $2\\cdot5\\cdot\\frac{25}{12} - 16 = \\frac{125}{6} - 16 = \\frac{29}{6}$ ✓.`,
        },
      ],
      sources: [SRC.l5.notes, SRC.l5.slides, SRC.l5.concept, SRC.sec.s3, SRC.hw.hw3],
    },
  ],
}
