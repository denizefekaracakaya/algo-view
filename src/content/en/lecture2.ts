import type { Lecture } from '../types'
import { SRC } from '../sources'
import { INSERTION_SORT_CODE } from '../../engines/insertionSort'
import { MERGE_SORT_CODE } from '../../engines/mergeSort'

export const lecture2: Lecture = {
  n: 2,
  title: 'Asymptotics, Worst-Case Analysis, and MergeSort',
  titleEn: 'Asymptotics, Worst-Case Analysis, and MergeSort',
  date: 'January 7, 2026',
  blurb: 'Correctness of InsertionSort, divide and conquer with MergeSort, the recursion tree, and Big-O / Ω / Θ.',
  lessons: [
    {
      id: 'l2-insertion',
      lecture: 2,
      title: 'InsertionSort and loop invariants',
      titleEn: 'InsertionSort and loop invariants',
      summary: 'Proving by induction that a simple sorting algorithm is correct.',
      minutes: 25,
      objectives: [
        'Trace and predict what InsertionSort does at each step.',
        'State the loop invariant “after each iteration A[:i+1] is sorted”.',
        'Prove the invariant by induction and connect it to correctness.',
        'See that about $n^2/2$ operations are performed in the worst case.',
      ],
      prerequisites: ['Arrays and loops', 'Mathematical induction'],
      sections: [
        {
          kind: 'intuition',
          title: 'Intuition',
          label: 'intuition',
          body: `Like sorting the playing cards in your hand: the cards on the left are already sorted; you take a new card from the right (\`current\`) and slide each larger card to its left one position right until \`current\` fits. Each round the sorted region grows by one.`,
        },
        {
          kind: 'viz',
          title: 'Sorting visualizer (InsertionSort ↔ MergeSort)',
          viz: 'sortingLab',
          body: `Enter your own array or pick an example. If you turn on **prediction mode**, before each round you are asked where \`current\` will land. Use the selector at the top to switch to MergeSort on the same input and compare the comparison counts.`,
        },
        {
          kind: 'pseudocode',
          title: 'Pseudocode (the Python version from the Lecture 2 notes)',
          code: INSERTION_SORT_CODE,
        },
        {
          kind: 'correctness',
          title: 'Correctness: the loop invariant',
          label: 'formalProof',
          body: `**Invariant (inductive hypothesis):** after iteration $i$, $A[:i+1]$ is sorted. Reveal the proof step by step; before seeing each step, think about what it has to say.`,
          proof: [
            { title: 'Base case (i = 0)', body: 'Before entering the loop, $A[:1]$ has one element; every one-element list is sorted.' },
            {
              title: 'Inductive step: assumption',
              body: 'Assume $A[:i]$ is sorted after iteration $i-1$. In iteration $i$, $A[i]$ is taken (`current`).',
            },
            {
              title: 'Effect of the inner loop',
              body: 'Let $j^*$ be the largest index in $\\{0,\\dots,i-1\\}$ with $A[j^*] \\le A[i]$ (or $-1$ if none). The inner loop shifts $A[j^*+1..i-1]$ one place right and writes `current` at position $j^*+1$.',
            },
            {
              title: 'The new prefix is sorted',
              body: '`current` is greater than or equal to every element on its left (since $A[j^*] \\le$ `current` and the prefix is sorted) and smaller than every element on its right (by the choice of $j^*$). The order of the other elements did not change. Hence $A[:i+1]$ is sorted.',
            },
            { title: 'Conclusion', body: 'The invariant also holds for $i = n-1$: $A[:n]$ — the whole array — is sorted when the algorithm ends.' },
          ],
        },
        {
          kind: 'complexity',
          title: 'Running time',
          body: `In iteration $i$ at most $i$ elements are shifted: in total $\\sum_{i=1}^{n-1} i = \\frac{n(n-1)}{2}$ comparisons and shifts — about $n^2/2$ **in the worst case** (reverse-sorted input). The course wants to go further: can we sort asymptotically faster than $n^2$? (Answer: MergeSort, $n\\log n$.)

**Note:** On nearly sorted input InsertionSort does little work; but worst-case analysis gives a guarantee that holds for every input.`,
        },
        {
          kind: 'mistakes',
          title: 'Common mistakes',
          body: `- Thinking the invariant is “$A[:i+1]$ contains the $i+1$ smallest elements of the array”. No: it is only sorted **among itself**; smaller elements may still be waiting on the right.
- Skipping the base case, or not making the “when the loop ends $i = n-1$” connection in the conclusion.
- Writing the loop comparison as \`A[j] >= current\`: the algorithm still sorts, but the order of equal keys is broken (stability is lost).`,
        },
      ],
      quiz: [
        {
          id: 'q1',
          kind: 'mcq',
          prompt: 'For $A = [5, 2, 4, 6, 1, 3]$, what is $A$ right after iteration $i = 2$ finishes?',
          options: ['$[2, 4, 5, 6, 1, 3]$', '$[2, 5, 4, 6, 1, 3]$', '$[1, 2, 4, 5, 6, 3]$', '$[2, 4, 5, 1, 3, 6]$'],
          answer: 0,
          hint: 'After $i = 1$ it is $[2,5,4,\\dots]$; at $i = 2$, 4 is inserted.',
          explanation: '$i=1$: 2 is inserted → $[2,5,4,6,1,3]$. $i=2$: 4 moves to the left of 5 → $[2,4,5,6,1,3]$.',
        },
        {
          id: 'q2',
          kind: 'mcq',
          prompt: 'Which invariant is used in the correctness proof of InsertionSort?',
          options: [
            'After iteration $i$, $A[:i+1]$ are the $i+1$ smallest elements of the array.',
            'After iteration $i$, $A[:i+1]$ is sorted.',
            'After iteration $i$, $A[i:]$ is sorted.',
            'At least one swap is made in every iteration.',
          ],
          answer: 1,
          hint: 'The elements on the right have not been looked at yet.',
          explanation: 'The prefix is sorted, but smaller elements may be on the right; that is why the “smallest elements” claim is false.',
          feedback: { 0: 'False: e.g. for $[5, 1]$, after $i=0$ we have $A[:1] = [5]$ but the smallest element is 1.' },
        },
        {
          id: 'q3',
          kind: 'numeric',
          prompt: 'How many comparisons (`A[j] > current`) does InsertionSort make on a reverse-sorted array of 8 elements?',
          answer: 28,
          hint: 'For each $i$, `current` travels all the way to the front: $i$ comparisons.',
          explanation: '$\\sum_{i=1}^{7} i = 28 = \\frac{8\\cdot 7}{2}$.',
        },
      ],
      practice: [
        {
          id: 'p1',
          prompt: `Our own example: if we change the loop condition to \`while j >= 0 and A[j] >= current\`, does the algorithm still sort? What changes on the input \`[(3,a), (1,b), (3,c)]\` with equal keys (key, label)?`,
          hints: ['How would you change the condition $A[j^*] \\le$ `current` in the correctness proof?', 'When the second 3 (c) is inserted, does it jump in front of the earlier 3 (a)?'],
          solution: `Yes, it still sorts (it is enough to define $j^*$ in the proof as “the largest index with $A[j^*] < $ current”). But equal keys now overtake each other: the output becomes $[(1,b), (3,c), (3,a)]$. The original \`>\` version gives $[(1,b), (3,a), (3,c)]$ and is **stable**. Stability becomes critical for RadixSort in Lecture 6.`,
        },
      ],
      sources: [SRC.l2.pre, SRC.l2.notes, SRC.l2.slides, SRC.l2.proof, SRC.l2.notebook, SRC.l2.conceptSort],
    },
    {
      id: 'l2-mergesort',
      lecture: 2,
      title: 'MergeSort and the recursion tree',
      titleEn: 'MergeSort and the recursion tree',
      summary: 'Divide, recurse, merge — with equal work on every level: $O(n\\log n)$.',
      minutes: 30,
      objectives: [
        'Trace the split and merge phases of MergeSort step by step.',
        'See that Merge combines two sorted lists in linear time, and handle the case of an exhausted list.',
        'Explain correctness with a recursion invariant.',
        'Build the recursion-tree argument “$O(n)$ work per level, $\\log n + 1$ levels”.',
      ],
      prerequisites: ['The InsertionSort lesson', 'Recursion', '$\\log_2$'],
      sections: [
        {
          kind: 'intuition',
          title: 'Intuition',
          label: 'intuition',
          body: `Split the array in two, sort the two halves (magically, by recursion), then zip the two sorted halves together. Merging is easy: you take the smaller of the two front elements.

The pessimist’s view: the number of calls doubles on every level. The optimist’s view: the subproblem size halves on every level. As the notes say, “today the optimists win”.`,
        },
        {
          kind: 'viz',
          title: 'MergeSort visualizer',
          viz: 'mergeSort',
          body: `Each row is a recursion level; the boxes show the subarrays in their original positions. During Merge the bottom panel shows the L, R pointers (i, j) and the list S being built. In prediction mode, guess which element is appended to S before each merge step.`,
        },
        {
          kind: 'pseudocode',
          title: 'Pseudocode',
          code: MERGE_SORT_CODE,
          body: `The Merge pseudocode in the notes is deliberately incomplete (it doesn’t say what happens when L or R runs out). The version here handles that case and picks L on ties (\`<=\`), which makes MergeSort stable.`,
        },
        {
          kind: 'correctness',
          title: 'Correctness: the recursion invariant',
          label: 'proofIdea',
          proof: [
            { title: 'Hypothesis', body: '“MergeSort returns a sorted array on every input of length $< i$.”' },
            { title: 'Base case', body: 'An array of length 0 or 1 is already sorted and is returned unchanged.' },
            { title: 'Step', body: 'If the length is $i \\ge 2$, both halves have length $< i$; by the hypothesis $L$ and $R$ are sorted.' },
            { title: 'Correctness of Merge', body: 'Merge takes two sorted lists and returns a sorted list containing all their elements (proved by a separate induction; see CLRS 2.3.1). So MergeSort is also correct for length $i$.' },
          ],
        },
        {
          kind: 'complexity',
          title: 'Running time: the recursion tree',
          label: 'formalProof',
          body: `Assume $n$ is a power of 2 (the justification in the notes: padding the array with $\\infty$ up to the nearest power of 2 at most doubles its size). A call on size $m$ does at most $11m$ operations (base-case check, copying, Merge).

- Level $t$ has $2^t$ subproblems, each of size $n/2^t$.
- Total work on level $t$: $2^t \\cdot 11\\,\\frac{n}{2^t} = 11n$ — **independent of the level**.
- There are $\\log_2 n + 1$ levels.

$$\\text{Total} \\le 11n(\\log_2 n + 1) = 11n\\log_2 n + 11n = O(n\\log n).$$

This is a **worst-case** bound: it holds whatever the input is. As a recurrence: $T(n) = 2T(n/2) + O(n)$ (we also solve it with the Master Theorem in Lecture 3).`,
        },
        {
          kind: 'mistakes',
          title: 'Common mistakes',
          body: `- Reading past the end of a list in Merge once it is exhausted (the gap the notes’ pseudocode leaves on purpose).
- Thinking there are $\\log n$ levels: there are $\\log_2 n + 1$ (from 0 to $\\log_2 n$).
- “MergeSort sorts sorted input faster.” — No; it runs all the levels regardless of the input. That is a “feature” of the worst-case guarantee.`,
        },
      ],
      quiz: [
        {
          id: 'q1',
          kind: 'mcq',
          prompt: 'When merging $L = [1, 4, 7]$ and $R = [2, 3, 9]$ (ties prefer L), what is the 4th value appended to S?',
          options: ['3', '4', '7', '9'],
          answer: 1,
          hint: 'S grows as 1, 2, 3, …',
          explanation: 'S = 1, 2, 3, 4, 7, 9. The fourth value appended is 4.',
        },
        {
          id: 'q2',
          kind: 'mcq',
          prompt: 'For $n = 16$, how many levels does the MergeSort recursion tree have, and how many subproblems are on level 2?',
          options: ['4 levels, 4 subproblems', '5 levels, 4 subproblems', '5 levels, 8 subproblems', '16 levels, 2 subproblems'],
          answer: 1,
          hint: 'The levels are $0, 1, \\dots, \\log_2 16$.',
          explanation: '$\\log_2 16 + 1 = 5$ levels; level $t$ has $2^t$ subproblems → 4 subproblems on level 2, each with 4 elements.',
        },
        {
          id: 'q3',
          kind: 'mcq',
          prompt: 'In the MergeSort analysis, why doesn’t the total work on level $t$ depend on $t$?',
          options: [
            'Because Merge takes constant time.',
            'The number of subproblems grows by a factor $2^t$ while each one shrinks by $2^t$, and the Merge work is linear in the size.',
            'Because there is only one level.',
            'Because no work is done on sorted input.',
          ],
          answer: 1,
          hint: 'Simplify $2^t \\cdot c\\,\\frac{n}{2^t}$.',
          explanation: '$2^t \\cdot 11\\frac{n}{2^t} = 11n$: the two effects balance exactly (in Lecture 3 this will be the “$a = b^d$” case).',
        },
        {
          id: 'q4',
          kind: 'order',
          prompt: 'Order the events that happen while MergeSort([3, 1, 2]) runs.',
          items: ['[3] returns as a base case', '[1, 2] is split in two', '[1] and [2] are merged into [1, 2]', '[3] and [1, 2] are merged into [1, 2, 3]'],
          hint: '$n//2 = 1$: left half [3], right half [1, 2].',
          explanation: 'First the left half ([3]) is processed completely, then the right half ([1,2]) is split and merged, and finally the root merge happens.',
        },
      ],
      practice: [
        {
          id: 'p1',
          prompt: `Our own example: a friend changes MergeSort to split the array into **three** equal parts (three recursive calls + a linear Merge3 that combines three lists). Find the running time with the recursion-tree argument. Is this an asymptotic improvement?`,
          hints: ['How many subproblems are on level $t$, and of what size?', 'How many levels are there? How are $\\log_3 n$ and $\\log_2 n$ related?'],
          solution: `Level $t$ has $3^t$ subproblems of size $n/3^t$; since Merge3 is linear, the work per level is $c\\cdot 3^t \\cdot n/3^t = cn$. There are $\\log_3 n + 1$ levels → $O(n\\log_3 n) = O(n \\log n)$, because $\\log_3 n = \\log_2 n / \\log_2 3$ differs only by a constant factor. It is **not** an asymptotic improvement.`,
        },
      ],
      sources: [SRC.l2.notes, SRC.l2.slides, SRC.l2.notebook, SRC.l2.conceptSort, SRC.hw.hw2],
    },
    {
      id: 'l2-asymptotics',
      lecture: 2,
      title: 'Worst-case analysis and asymptotic notation',
      titleEn: 'Worst-case analysis and asymptotic notation',
      summary: 'Big-O, Big-Ω and Big-Θ: why and how do we ignore constants and lower-order terms?',
      minutes: 30,
      objectives: [
        'Explain worst-case analysis as a game against an adversary.',
        'Write and apply the definitions of Big-O, Big-Ω and Big-Θ with witnesses $c$ and $n_0$.',
        'Distinguish theoretical growth functions from empirical measurements.',
      ],
      prerequisites: ['Functions and inequalities', 'The MergeSort lesson'],
      sections: [
        {
          kind: 'intuition',
          title: 'Worst-case analysis',
          label: 'intuition',
          body: `Imagine playing a game against an adversary: we name an algorithm and a time bound $T(n)$; the adversary picks the input of size $n$ that slows our algorithm down the most. If the time never exceeds $T(n)$ whatever the adversary picks, we win. This is a very strong guarantee that holds **for every input**.

Average-case analysis (which assumes a distribution over inputs) is harder and needs strong assumptions about the input; this course mostly works with the worst case.`,
        },
        {
          kind: 'formal',
          title: 'Asymptotic notation (Lecture 2 notes)',
          box: 'formal',
          label: 'formal',
          body: `Let $T(n)$ and $f(n)$ be non-negative functions.

$$T(n) = O(f(n)) \\iff \\exists\\, c > 0,\\ n_0 \\ \\text{such that}\\ \\forall n \\ge n_0:\\ 0 \\le T(n) \\le c\\,f(n)$$
$$T(n) = \\Omega(f(n)) \\iff \\exists\\, c > 0,\\ n_0 \\ \\text{such that}\\ \\forall n \\ge n_0:\\ 0 \\le c\\,f(n) \\le T(n)$$
$$T(n) = \\Theta(f(n)) \\iff T(n) = O(f(n)) \\text{ and } T(n) = \\Omega(f(n))$$

Intuitively: O is an **upper bound**, Ω a **lower bound**, and Θ a **tight** bound.`,
        },
        {
          kind: 'viz',
          title: 'Growth-rate explorer',
          viz: 'growth',
          body: `Pick functions and watch them diverge as $n$ grows. A logarithmic axis shows very different magnitudes on one chart.`,
        },
        {
          kind: 'viz',
          title: 'Witness (c, n₀) checker',
          viz: 'bigO',
          body: `Choose a $T(n)$, a claim, and $c$, $n_0$. The tool checks whether the condition holds for $n \\le 2000$ and shows the first counterexample. For example, for $3n^2 + 5n + 10 = O(n^2)$, which $n_0$ works with $c = 4$? What about $c = 30, n_0 = 1$ (the $c = (k+1)\\max_i|a_i|$ method from the notes: $k = 2$, $\\max_i|a_i| = 10$)? Which $c$ could rescue the claim $11n\\log_2 n + 11n = O(n)$?`,
        },
        {
          kind: 'correctness',
          title: 'Two example proofs (claims from the notes)',
          label: 'formalProof',
          proof: [
            {
              title: 'Claim: polynomials of degree $k$ are $O(n^k)$',
              body: 'Let $T(n) = a_k n^k + \\dots + a_0$ and $a = \\max_i |a_i|$. For $n \\ge 1$, each $a_i n^i \\le a\\,n^k$. There are $k+1$ terms, so $T(n) \\le (k+1)a\\,n^k$. Witness: $c = (k+1)a$, $n_0 = 1$.',
            },
            {
              title: 'Claim: $n^k$ is not $O(n^{k-1})$',
              body: 'Contradiction: suppose $n^k \\le c\\,n^{k-1}$ for all $n \\ge n_0$. Simplifying gives $n \\le c$ — but that is false for $n = \\max(n_0, \\lceil c \\rceil + 1)$. Since $c$ is a constant, contradiction.',
            },
          ],
        },
        {
          kind: 'viz',
          title: 'Empirical measurement: comparison counts',
          viz: 'empiricalSorting',
        },
        {
          kind: 'mistakes',
          title: 'Common mistakes',
          body: `- Using $O$ to mean “exactly”: $n = O(n^2)$ is true but not tight; use $\\Theta$ for tightness.
- Choosing $c$ depending on $n$ in a witness (like $c = n$): $c$ must be a constant.
- Concluding “this algorithm is $O(n\\log n)$” from a few measurements: a measurement is not a proof.
- Confusing the worst case with the “average input”.`,
        },
      ],
      quiz: [
        {
          id: 'q1',
          kind: 'mcq',
          prompt: 'Which one is **false**?',
          options: ['$n\\log n = O(n^2)$', '$n^2 = \\Omega(n \\log n)$', '$2^{n+1} = O(2^n)$', '$n^2 = O(n\\log n)$'],
          answer: 3,
          hint: 'Try to find $c$ and $n_0$ for each.',
          explanation: '$n^2 \\le c\\,n\\log n \\iff n \\le c\\log n$, false for large $n$. The others are true ($2^{n+1} = 2\\cdot 2^n$, witness $c = 2$).',
        },
        {
          id: 'q2',
          kind: 'mcq',
          prompt: 'For $T(n) = 3n^2 + 5n + 10$, from which $n_0$ on does $T(n) \\le 4n^2$ hold for every $n$?',
          options: ['$n_0 = 1$', '$n_0 = 4$', '$n_0 = 7$', 'For no $n_0$'],
          answer: 2,
          hint: 'When is $4n^2 - T(n) = n^2 - 5n - 10 \\ge 0$?',
          explanation: '$n^2 - 5n - 10 \\ge 0$: at $n = 6$ it is $-4$, at $n = 7$ it is $4$. So $n_0 = 7$ (witness $c = 4$).',
        },
        {
          id: 'q3',
          kind: 'mcq',
          prompt: 'What does worst-case analysis guarantee?',
          options: [
            'The expected time on a random input.',
            'That the algorithm runs in at most $T(n)$ time on every input of size $n$.',
            'The time on the fastest input.',
            'The time in seconds on a particular computer.',
          ],
          answer: 1,
          hint: 'The adversary picks the input after we have named the algorithm.',
          explanation: 'The bound holds for every input the adversary could pick; that is why a worst-case guarantee needs no assumptions about the input.',
        },
        {
          id: 'q4',
          kind: 'mcq',
          prompt: 'On the chart, the measured points of InsertionSort came out close to the curve $n^2/4$. What can we conclude?',
          options: [
            'The worst case of InsertionSort is $\\Theta(n^2/4)$, proven.',
            'The measurements are consistent with behavior on the $n^2$ scale on these random inputs; they are not a proof.',
            'InsertionSort makes exactly $n^2/4$ comparisons on every input.',
            'It is always slower than MergeSort.',
          ],
          answer: 1,
          hint: 'Think about the difference between an empirical observation and a mathematical guarantee.',
          explanation: 'Finitely many measurements show consistency with a claim but prove no asymptotic statement. (Also, on sorted input InsertionSort makes only $n-1$ comparisons.)',
        },
      ],
      practice: [
        {
          id: 'p1',
          prompt: `Our own example: show with witnesses that $T(n) = 11n\\log_2 n + 11n$ is $\\Theta(n\\log n)$ ($n \\ge 2$).`,
          hints: ['Upper bound: for $n \\ge 2$, $n \\le n\\log_2 n$.', 'For the lower bound try $c = 11$.'],
          solution: `**O:** for $n \\ge 2$, $\\log_2 n \\ge 1$, so $11n \\le 11n\\log_2 n$; hence $T(n) \\le 22\\,n\\log_2 n$. Witness $c = 22$, $n_0 = 2$.

**Ω:** $T(n) \\ge 11\\,n\\log_2 n$ for every $n \\ge 1$. Witness $c = 11$, $n_0 = 1$.

Together they give $T(n) = \\Theta(n\\log n)$.`,
        },
      ],
      sources: [SRC.l2.notes, SRC.l2.slides, SRC.l2.conceptAsym, SRC.sec.s1, SRC.hw.hw2],
    },
  ],
}
