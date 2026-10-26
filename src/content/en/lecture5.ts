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
      minutes: 45,
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
          check: [
            {
              id: 'c1',
              kind: 'mcq',
              prompt: 'Right after the partition, which is **always** true of the pivot?',
              options: [
                'The pivot is in the middle of the array.',
                'The pivot is in its final position in the sorted array; everything to its left is smaller, everything to its right greater or equal.',
                'The left and right parts are sorted.',
                'The left part is longer than the right part.',
              ],
              answer: 1,
              hint: 'How many elements are exactly to the left of the pivot?',
              explanation: 'Everything smaller than the pivot is to its left, so its position equals its position in the sorted array and it never moves again. The parts themselves are not sorted yet.',
            },
          ],
          label: 'intuition',
          body: `QuickSort is very similar to Select: choose a pivot $x$ and rearrange the array as $[A_<,\\ x,\\ A_>]$. The difference: Select recurses on one side only, while QuickSort sorts **both** sides. After partitioning, the pivot is in its **final position** and never moves again.

The notes assume distinct elements (without loss of generality). In the in-place version here, elements equal to the pivot go to the right side; it also sorts correctly with repeated keys.`,
        },
        {
          kind: 'viz',
          title: 'QuickSort visualizer',
          tasks: [
            'Run the “Sorted” example with the **Last element** rule and jump to the end: what does the recursion tree look like, how many comparisons were made?',
            'Try the same input with **Random** and press **New seed** a few times. How much does the comparison count vary?',
            'Look at the shape of the tree with the **Median (ideal)** rule: why is it balanced?',
            'In **prediction mode**, predict which region each element goes to.',
          ],
          viz: 'quickSort',
          body: `Choose the pivot rule and (for the random rule) the seed. The same seed reproduces the same run exactly; use “New seed” to compare different pivot choices. In the tree below, every node is the pivot of one call — an unbalanced tree = deep recursion = many comparisons. Try the “Last element” rule on the “Sorted” example.`,
        },
        {
          kind: 'pseudocode',
          title: 'Pseudocode (in-place partition)',
          check: [
            {
              id: 'c2',
              kind: 'numeric',
              prompt: 'How many key comparisons does the Lomuto partition make on a subarray of 10 elements (pivot included)?',
              answer: 9,
              hint: 'Every element other than the pivot is compared with the pivot once.',
              explanation: '$m - 1$ comparisons on a subarray of $m$ elements: $10 - 1 = 9$.',
            },
          ],
          code: QUICKSORT_CODE,
          body: `The “better partition” idea from the Lecture 5 slides: pick the pivot at random, move it to the end of the subarray, then scan left to right gathering the smaller elements at the front. The notes leave the details of the in-place version to CLRS; the version here is the Lomuto partition.`,
        },
        {
          kind: 'correctness',
          title: 'Correctness',
          check: [
            {
              id: 'c3',
              kind: 'mcq',
              prompt: 'What can happen if, after partitioning, the pivot is included in one of the recursive calls (e.g. `QuickSort(A, lo, i)`)?',
              options: ['Nothing; it just gets a little slower.', 'If the pivot is the largest of the subarray, a call of the same size can repeat over and over: infinite recursion.', 'The array is sorted in reverse.', 'It becomes stable.'],
              answer: 1,
              hint: 'Does the subproblem get smaller?',
              explanation: 'The correctness proof relies on every call being on a shorter part. If the pivot is included the part may not shrink and the recursion may not terminate.',
            },
          ],
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
          check: [
            {
              id: 'c4',
              kind: 'numeric',
              prompt: 'How many comparisons in total does QuickSort with the “last element” pivot make on an already sorted array of 10 elements?',
              answer: 45,
              hint: '$9 + 8 + \\dots + 1$.',
              explanation: 'In every call the pivot is the largest element and one element drops out: $\\frac{10 \\cdot 9}{2} = 45$.',
            },
          ],
          body: `If the pivot is the $k$-th smallest element: $T(n) \\le cn + T(k-1) + T(n-k)$.

- **Worst pivot (min/max):** $T(n) = T(n-1) + O(n) = \\Theta(n^2)$. On sorted input the “first/last element” rule does this every time.
- **Median pivot (via Select):** $T(n) \\le cn + 2T(n/2) = O(n\\log n)$ — a **deterministic worst case**, but not practical because Select’s constants are large.
- **Random pivot:** the worst case is still $\\Theta(n^2)$ (the worst choice every time), but the **expected** time **for every input** is $O(n\\log n)$ — the topic of the next lesson.

The comparison in the slides: QuickSort (random pivot) is easy to implement in place and is not stable; MergeSort is $O(n\\log n)$ in the worst case and stable.`,
        },
        {
          kind: 'text',
          title: 'In practice: QuickSort in libraries',
          body: `- **Introsort** (most C++ \`std::sort\` implementations): starts with QuickSort, switches to **HeapSort** if the recursion depth exceeds about $2\\log_2 n$ (an $O(n\\log n)$ worst-case guarantee), and uses InsertionSort on small parts.
- **Java:** **dual-pivot QuickSort** for arrays of primitives, and **Timsort** for object arrays because it is stable.
- **Why so popular?** It works in place (no extra array) and accesses memory sequentially, which makes it very cache-friendly.
- **Attacks:** if the pivot rule is fixed (e.g. “first element” or “median of three”), someone who knows the rule can construct inputs that take $\\Theta(n^2)$; this has been used as a denial-of-service tool. A random pivot or introsort removes the risk.`,
          check: [
            {
              id: 'c5',
              kind: 'mcq',
              prompt: 'Why does introsort switch to HeapSort when the recursion gets too deep?',
              options: [
                'Because HeapSort is always faster',
                'To guarantee $O(n\\log n)$ in the worst case',
                'To make the sort stable',
                'To use more memory',
              ],
              answer: 1,
              hint: 'Deep recursion is a sign of bad pivots.',
              explanation: 'If the depth exceeds $O(\\log n)$, QuickSort is heading for $\\Theta(n^2)$ with bad pivots; switching to HeapSort bounds the total by $O(n\\log n)$.',
            },
            {
              id: 'c6',
              kind: 'mcq',
              prompt: 'Why does Java use Timsort instead of QuickSort for object arrays?',
              options: ['Objects cannot be compared.', 'Sorting objects calls for stability, and QuickSort is not stable.', 'QuickSort does not work with objects.', 'Timsort works in place.'],
              answer: 1,
              hint: 'Think of sorting by name, then by department.',
              explanation: 'Objects with equal keys must keep their previous order (stability). Timsort is stable; QuickSort is not. For primitive numbers equal values are indistinguishable, so stability does not matter.',
            },
          ],
        },
        {
          kind: 'text',
          title: 'Equal keys and three-way partitioning',
          body: `Lomuto partitioning puts the elements **equal** to the pivot on the right. If all elements are equal, the left side stays empty in every partition, the pivot moves to the far left and the recursion continues with $n - 1$ elements: $T(n) = T(n-1) + (n-1)$, that is $\\Theta(n^2)$. A random pivot does not help, because whichever element is chosen, they are all the same.

The fix is **three-way partitioning** (Dijkstra’s “Dutch national flag” problem): the array is split into $< p$, $= p$ and $> p$, and the recursion continues only on the first and last parts. An all-equal array is done in one pass: $\\Theta(n)$. Heavily repeated keys (ages, city codes, grades) are common in real data, so library sorts use this idea.`,
          check: [
            {
              id: 'c7',
              kind: 'numeric',
              prompt: 'How many comparisons does QuickSort with Lomuto partitioning make in total when all 10 elements are equal?',
              answer: 45,
              hint: 'The calls have sizes 10, 9, …, 2, and a call of size $k$ makes $k - 1$ comparisons.',
              explanation: '$9 + 8 + \\dots + 1 = 45 = \\binom{10}{2}$: the same as the worst case on a sorted array.',
            },
          ],
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
        {
          id: 'q4',
          kind: 'mcq',
          prompt: 'How long does QuickSort with three-way partitioning take on an array whose $n$ elements are all equal?',
          options: ['$\\Theta(1)$', '$\\Theta(n)$', '$\\Theta(n\\log n)$', '$\\Theta(n^2)$'],
          answer: 1,
          hint: 'After the first partition, how large are the $< p$ and $> p$ parts?',
          explanation: 'One linear partition puts every element into the $= p$ part; both sides are empty and the recursion stops at once: $\\Theta(n)$.',
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
      minutes: 50,
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
          kind: 'intuition',
          title: 'Intuition: counting with indicators',
          label: 'intuition',
          body: `At a cloakroom the hats of $n$ people get mixed up and everybody gets a random hat back. On average, how many people get **their own** hat?

Computing it directly is hard, because who gets which hat is all connected. But we can split the question: let $X_i$ be 1 if person $i$ gets their own hat and 0 otherwise. The total is $X = X_1 + \\dots + X_n$, and $E[X_i] = P(X_i = 1) = \\frac1n$ for each of them. By linearity of expectation
$$E[X] = \\sum_{i=1}^n E[X_i] = n \\cdot \\frac1n = 1.$$
The $X_i$ are **not** independent, but linearity does not need independence. The analysis of QuickSort follows the same pattern: we write the number of comparisons as a sum of one indicator variable per pair.`,
          check: [
            {
              id: 'c5',
              kind: 'numeric',
              prompt: 'With $n = 100$ people, how many get their own hat on average?',
              answer: 1,
              hint: '$n$ indicators, each with probability $1/n$.',
              explanation: '$100 \\cdot \\frac{1}{100} = 1$: the answer does not depend on $n$.',
            },
          ],
        },
        {
          kind: 'formal',
          title: 'Setup (Lecture 5 notes)',
          check: [
            {
              id: 'c1',
              kind: 'mcq',
              prompt: 'Does $E[X + Y] = E[X] + E[Y]$ require $X$ and $Y$ to be independent?',
              options: ['Yes, always', 'No, linearity of expectation always holds', 'Only for indicator variables', 'Only if $X = Y$'],
              answer: 1,
              hint: 'The $X_{i,j}$ are not independent, yet the analysis works.',
              explanation: 'Linearity needs no independence. Independence is needed for $E[XY] = E[X]E[Y]$.',
            },
          ],
          box: 'formal',
          label: 'formal',
          body: `Let $z_1 < z_2 < \\dots < z_n$ be the elements of the sorted array. $X_{i,j}$: the number of times $z_i$ and $z_j$ are compared. Every comparison is made with the pivot, and the pivot is not part of later calls; so $X_{i,j} \\in \\{0, 1\\}$ — an **indicator variable**.

$$C = \\sum_{i<j} X_{i,j}, \\qquad E[C] = \\sum_{i<j} E[X_{i,j}] = \\sum_{i<j} P[z_i, z_j \\text{ compared}].$$

The second equality is **linearity of expectation**: it holds even though the $X_{i,j}$ are not independent. Computing the distribution of $C$ is very hard; computing its expectation is easy.`,
        },
        {
          kind: 'viz',
          title: 'Interactive: which pairs are compared, and how often?',
          tasks: [
            'Click the cells closest to the diagonal (adjacent pairs): why is the probability 1?',
            'Pick $z_1$ and $z_{10}$: why is the probability only $0.2$?',
            'Compare the simulated rate with the formula. How far apart are they? Why not exactly equal?',
          ],
          viz: 'pairProbability',
        },
        {
          kind: 'correctness',
          title: 'Derivation',
          check: [
            {
              id: 'c2',
              kind: 'numeric',
              prompt: 'For $n = 10$, what is the probability that $z_2$ and $z_9$ are compared? (Decimal.)',
              answer: 0.25,
              tolerance: 0.001,
              hint: 'The window has $9 - 2 + 1$ elements.',
              explanation: '$\\frac{2}{8} = 0.25$.',
            },
          ],
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
          tasks: [
            'With the “Sorted array” input and $n = 100$, compare the measured mean of the random pivot with the deterministic “last element” pivot.',
            'Set the number of runs to 1000: how widely does the histogram spread around the theoretical value?',
            'Grow $n$ and check that the mean stays below the $2n\\ln n$ bound.',
          ],
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
          kind: 'text',
          title: 'In practice: randomized algorithms',
          body: `- **Las Vegas and Monte Carlo:** randomized QuickSort always gives the correct result; only its running time is random (**Las Vegas**). Some randomized algorithms are always fast but may answer wrongly with small probability (**Monte Carlo**; e.g. primality tests).
- **How reliable is the expectation?** QuickSort’s comparison count concentrates around its expectation: the probability of taking several times the expectation shrinks quickly as $n$ grows. The histogram in the experiment panel shows this.
- **Neutralizing the adversary:** randomness is the cheapest defense against a malicious adversary who picks the input; the hash tables of Lecture 8 use the same idea.
- **Reproducibility:** with seeded generators a random run can be replayed exactly for debugging — every random visualizer in this app works this way.`,
          check: [
            {
              id: 'c3',
              kind: 'mcq',
              prompt: 'What kind of randomized algorithm is QuickSort with a random pivot?',
              options: ['Las Vegas: always correct, random running time', 'Monte Carlo: always fast, sometimes wrong', 'Deterministic', 'An approximation algorithm'],
              answer: 0,
              hint: 'Is the output sorted whatever the pivots are?',
              explanation: 'Correctness does not depend on the pivots; only the number of comparisons is random.',
            },
            {
              id: 'c4',
              kind: 'numeric',
              prompt: 'For $n = 3$, what is randomized QuickSort’s expected number of comparisons $E[C] = \\sum_{i<j} \\frac{2}{j-i+1}$? (Two decimals.)',
              answer: 2.67,
              tolerance: 0.01,
              hint: '2 pairs at distance 1, 1 pair at distance 2.',
              explanation: '$2 \\cdot 1 + 1 \\cdot \\frac23 = \\frac83 \\approx 2.67$. Check: $2(n+1)H_n - 4n = 8 \\cdot \\frac{11}{6} - 12 = \\frac83$.',
            },
          ],
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
        {
          id: 'p2',
          prompt: `Our own example: in a random permutation, call an element a “record” if it is larger than everything before it (the first element is always a record). What is the expected number of records for $n = 4$? For general $n$?`,
          hints: ['$R_i$: 1 if element $i$ is a record. What is $P(R_i = 1)$?', 'Think about the probability that the largest of the first $i$ elements is in position $i$.'],
          solution: `Element $i$ is a record if it is the largest of the first $i$ elements; by symmetry this has probability $\\frac1i$. By linearity $E[R] = 1 + \\frac12 + \\frac13 + \\frac14 = \\frac{25}{12} \\approx 2.08$. In general $H_n = \\sum_{i=1}^n \\frac1i \\approx \\ln n$: the same harmonic sum as in the QuickSort analysis.`,
        },
      ],
      sources: [SRC.l5.notes, SRC.l5.slides, SRC.l5.concept, SRC.sec.s3, SRC.hw.hw3],
    },
  ],
}
