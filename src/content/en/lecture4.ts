import type { Lecture } from '../types'
import { SRC } from '../sources'
import { SELECT_CODE } from '../../engines/select'

export const lecture4: Lecture = {
  n: 4,
  title: 'Median and Selection',
  titleEn: 'Median and Selection',
  date: 'January 14, 2026',
  blurb: 'Finding the k-th smallest element in linear time: split around a pivot, recurse on one side, median of medians.',
  lessons: [
    {
      id: 'l4-select',
      lecture: 4,
      title: 'Select: the k-th smallest element',
      titleEn: 'Select: the k-th smallest element',
      summary: 'Finding an order statistic in linear time, without sorting.',
      minutes: 55,
      objectives: [
        'Define the selection problem with a 1-based $k$ and compare it with the sorting-based $O(n\\log n)$ solution.',
        'Explain why, after partitioning around a pivot, recursing on **one** side is enough; compute how $k$ is updated.',
        'See that the choice of pivot affects only the running time, not correctness.',
        'Explain the median-of-medians guarantee $|A_<|, |A_>| \\le 7n/10 + 5$ and the result $T(n) \\le T(n/5) + T(7n/10) + cn = O(n)$.',
        'Distinguish worst case, expected time and a deterministic guarantee.',
      ],
      prerequisites: ['The substitution method', 'MergeSort', 'Strong induction'],
      sections: [
        {
          kind: 'intuition',
          title: 'Why selection? Medians and order statistics',
          label: 'intuition',
          body: `A delivery company looks at the delivery times of the 50,000 parcels it delivered in one day. To say “half of the parcels arrive in under X hours” it needs the **median**; to say “95% of the parcels arrive in under Y hours” it needs the **95th percentile**. Both are instances of the same question: which value would sit at position $k$ if the array were sorted?

- In this course the **median** is the $\\lceil n/2 \\rceil$-th smallest element. If $n$ is even we take the smaller of the two middle elements (the lower median); in algorithms we want an element of the array, not the average of two.
- The median is **robust to outliers**: if a single parcel wrongly appears to have taken 900 hours, the mean jumps, while the median barely moves.
- Percentiles (e.g. the p99 response time of a web service) are the selection problem with $k = \\lceil 0.99\\,n \\rceil$.

The first idea is to sort the array and take the $k$-th element: $O(n\\log n)$. But sorting answers $n$ questions at once, and we only need one. Can we do less work?`,
          check: [
            {
              id: 'c1',
              kind: 'mcq',
              prompt: 'What is the median of $A = [14, 3, 8, 21, 5, 11]$ by this course’s definition ($k = \\lceil n/2 \\rceil$)?',
              options: ['$8$', '$11$', '$9.5$', '$14$'],
              answer: 0,
              hint: 'Sorted it is $[3, 5, 8, 11, 14, 21]$; for $n = 6$, $k = 3$.',
              explanation: 'The $\\lceil 6/2 \\rceil = 3$rd smallest element is $8$ (the lower median).',
              feedback: { 2: '$9.5$ is the statistician’s “average of the two middle values”. In the selection problem we take an element of the array: the lower median.', 1: '$11$ is the upper median; this course uses the $\\lceil n/2 \\rceil$-th element.' },
            },
          ],
        },
        {
          kind: 'intuition',
          title: 'Intuition: binary search in an unsorted array',
          check: [
            {
              id: 'c2',
              kind: 'numeric',
              prompt: 'The elements are distinct and for pivot $p$ we have $|A_<| = 9$. Which order statistic is $p$ (the how-many-th smallest)?',
              answer: 10,
              hint: 'How many elements are smaller than $p$?',
              explanation: 'Exactly 9 elements are smaller than $p$, so $p$ is the 10th smallest. In general the pivot’s rank is $|A_<| + 1$.',
            },
          ],
          label: 'intuition',
          body: `Choose a pivot $p$ and split the array into the elements smaller than $p$ ($A_<$) and larger than $p$ ($A_>$). Once we know $|A_<|$, we know for sure which side the $k$-th element is on — we can **throw away** the other side entirely. It resembles binary search; but the array is not sorted, so we partition at every step.

Special case $k = 1$ (the minimum): one scan in $O(n)$ suffices, and since every deterministic algorithm must look at every element, $\\Omega(n)$ is needed. Is $O(n)$ possible for general $k$ too? Yes!`,
        },
        {
          kind: 'text',
          title: 'Small k and a lower bound',
          label: 'proofIdea',
          body: `**k = 1 (the minimum).** Scanning the array once while keeping the smallest value so far makes $n-1$ comparisons. Fewer is impossible: every element other than the minimum must have come out “larger” in at least one comparison. If some element never lost, we could replace it with a value smaller than everything; the algorithm would ask the same questions, get the same answers and give the same — now wrong — output. Each comparison has a single loser, so $n-1$ losers need at least $n-1$ comparisons.

**Small k.** If we keep the $k$ smallest elements so far in a sorted list, each new element needs at most $k$ comparisons: $O(kn)$. That is linear for constant $k$, but for the median ($k \\approx n/2$) it becomes $O(n^2)$ — worse than sorting.

**Every algorithm needs $\\Omega(n)$.** If a correct algorithm answered without ever reading some element, we could change that element so that the answer’s rank shifts (for instance by making it smaller than everything). Since the algorithm never read it, it would give the same answer and be wrong. So every element must be looked at; an $O(n)$ selection algorithm is asymptotically optimal.`,
          check: [
            {
              id: 'c3',
              kind: 'numeric',
              prompt: 'At least how many comparisons must any comparison-only algorithm make in the worst case to find the minimum of 50 distinct numbers?',
              answer: 49,
              hint: 'Every element other than the minimum must “lose” at least once.',
              explanation: '49 elements must each lose at least once, and each comparison has one loser: at least $n - 1 = 49$ comparisons. A simple scan makes exactly that many.',
            },
          ],
        },
        {
          kind: 'formal',
          title: 'Problem and algorithm',
          check: [
            {
              id: 'c4',
              kind: 'mcq',
              prompt: '$A = [15, 4, 22, 9, 31, 7, 18, 2]$, $k = 6$, and pivot $9$ is chosen. What does Select do next?',
              options: ['Select$(A_>, 2)$', 'Select$(A_>, 3)$', 'Select$(A_<, 6)$', 'Returns $9$'],
              answer: 0,
              hint: '$A_< = [4, 7, 2]$, $A_> = [15, 22, 31, 18]$.',
              explanation: '$|A_<| + 1 = 4 < 6$, so the target is in $A_>$. The $3 + 1 = 4$ discarded elements are smaller than the target: $k\' = 6 - 4 = 2$. Indeed the sorted array is $2, 4, 7, 9, 15, 18, \\dots$ and its 6th element, $18$, is the 2nd smallest of $A_>$.',
              feedback: { 1: 'Don’t forget to count the pivot too: $6 - 3 - 1 = 2$.' },
            },
          ],
          box: 'formal',
          label: 'formal',
          body: `**Input:** an array $A$ of $n$ numbers and $k \\in \\{1, \\dots, n\\}$. **Output:** the $k$-th smallest element of $A$.

The notes assume distinct elements. So that the version below also works with repeated values, it also builds the set $A_= = \\{A[i] = p\\}$; with distinct elements $A_= = \\{p\\}$ and it is the same as the algorithm in the notes:

- If $|A_<| \\ge k$, the answer is the $k$-th element of $A_<$.
- If $|A_<| < k \\le |A_<| + |A_=|$, the answer is $p$.
- Otherwise the answer is the $(k - |A_<| - |A_=|)$-th element of $A_>$.`,
        },
        {
          kind: 'viz',
          title: 'Selection visualizer',
          tasks: [
            'Pick the “Sorted (bad for first-element)” example, set the pivot rule to **First element** and use **Jump to end** to see the total number of Select calls. Repeat with **Median of medians**.',
            'Turn on **prediction mode**: after each partition, look at $|A_<|$, $|A_=|$ and $k$ and predict which branch is taken.',
            'In the **Duplicates** example find a step with $|A_=| > 1$ and explain why the answer can be $p$ directly.',
            'Try $k = 1$ and $k = n$ on your own array. With the random pivot, how does the number of calls change when you change the seed?',
          ],
          viz: 'select',
          body: `Enter an array and $k$ and choose a pivot strategy. Eliminated elements are hatched and marked ✕; they keep their positions in the original array. In **prediction mode**, after each partition guess which branch the algorithm takes. On the “sorted” example, compare how many calls the “first element” strategy makes with “median of medians”.`,
        },
        {
          kind: 'pseudocode',
          title: 'Pseudocode',
          code: SELECT_CODE,
        },
        {
          kind: 'steps',
          title: 'Why is it safe to throw one side away?',
          label: 'proofIdea',
          body: `Exactly $|A_<|$ elements are smaller than the pivot $p$. In the sorted array, the elements of $A_<$ occupy the first $|A_<|$ positions, the elements equal to $p$ the next $|A_=|$ positions, and $A_>$ the remaining ones. The $k$-th position we are looking for falls into exactly one of these three blocks; no element of the other blocks can be in position $k$. When moving into $A_>$, all $|A_<| + |A_=|$ discarded elements are smaller than (or equal to) the target, so the rank becomes $k' = k - |A_<| - |A_=|$.`,
        },
        {
          kind: 'correctness',
          title: 'Correctness (strong induction, Lecture 4 notes)',
          check: [
            {
              id: 'c5',
              kind: 'mcq',
              prompt: 'A student picks the pivot as “halfway between the smallest and the largest value” (which may not be in the array). What does the algorithm return for $A = [1, 2, 10]$ and $k = 3$?',
              options: ['$5.5$ — a wrong answer', '$10$', 'It loops forever', '$2$'],
              answer: 0,
              hint: 'With $p = 5.5$, $A_< = [1, 2]$; is $|A_<| = k - 1$?',
              explanation: '$|A_<| = 2 = k - 1$, so the algorithm returns $p = 5.5$ — a value not even in the array. The proof used $p \\in A$ ($n = |A_<| + 1 + |A_>|$); when that fails, correctness fails too.',
            },
          ],
          label: 'formalProof',
          proof: [
            { title: 'Hypothesis', body: 'For every array of size $n$ and $k \\in \\{1..n\\}$, Select returns the $k$-th smallest.' },
            { title: 'Base (n = 1)', body: '$k$ must be 1; the single element is returned — correct.' },
            { title: 'Step', body: 'Let the hypothesis hold for $n < i$ and let $|A| = i$. Three cases: (1) $|A_<| = k-1$: exactly $k-1$ elements are smaller than $p$, so $p$ is the answer. (2) $|A_<| > k-1$: the $k$-th smallest is in $A_<$; since $|A_<| < i$, the hypothesis applies. (3) $|A_<| < k-1$: the answer is the element of rank $k - |A_<| - 1$ in $A_>$; $1 \\le k - |A_<| - 1 \\le |A_>|$ and $|A_>| < i$.' },
            { title: 'Pivot rule', body: 'No step used how $p$ was chosen: ChoosePivot affects only the running time, not correctness.' },
          ],
        },
        {
          kind: 'viz',
          title: 'Pivot quality: the sizes of the successive calls',
          viz: 'pivotCompare',
          body: `The partition does work proportional to the array size in every call, and $k$ decides which side the recursion goes to — we cannot choose. So the total work is proportional to the **sum of the sizes** of the successive calls.

- If the pivot is always the smallest or largest element, the size drops by only 1 each step: $n + (n-1) + \\dots + 1 = \\Theta(n^2)$.
- If the pivot shrinks the size by a constant **factor** each time (say to at most $\\tfrac34$), the total is a geometric series: $n\\big(1 + \\tfrac34 + (\\tfrac34)^2 + \\dots\\big) = 4n$. Even with a factor of $\\tfrac{99}{100}$ the total is bounded by $100n$; what matters is a constant factor.
- A random pivot comes from the “middle half” with probability about one half and then cuts the size to at most $\\tfrac34$; so the expected total stays linear too (the exact computation is in Lecture 5).

Below, each bar is one call; its length is the array size in that call.`,
          tasks: [
            'With **Bad pivot**, n = 48, k = 15: how many calls, and what is the sum of the sizes? Compare with $n(n+1)/2$.',
            'Switch to **Exact median**: why does the total stay below $2n$?',
            'With **Random**, press **New seed** a few times. The total changes each time; does it ever get close to the bad pivot?',
          ],
          check: [
            {
              id: 'c6',
              kind: 'numeric',
              prompt: 'With the “bad pivot” rule, $n = 48$ and $k = 15$, what is the sum of the sizes of the successive calls? (Compute it without the tool, then check.)',
              answer: 1176,
              hint: 'The size drops by 1 each step, all the way down to 1.',
              explanation: '$48 + 47 + \\dots + 1 = \\frac{48 \\cdot 49}{2} = 1176$ — $\\Theta(n^2)$ behavior.',
            },
            {
              id: 'c7',
              kind: 'mcq',
              prompt: 'A pivot rule finds the pivot in $O(n)$ time and keeps the larger of the two parts at most $\\tfrac34 n$ in every step. What is Select’s worst-case running time?',
              options: ['$\\Theta(n)$', '$\\Theta(n\\log n)$', '$\\Theta(n^2)$', '$\\Theta(\\log n)$'],
              answer: 0,
              hint: '$T(n) \\le T(3n/4) + cn$; the level work shrinks geometrically.',
              explanation: '$cn(1 + \\tfrac34 + \\tfrac{9}{16} + \\dots) = 4cn$. The lower bound is $\\Omega(n)$, so $\\Theta(n)$.',
            },
          ],
        },
        {
          kind: 'viz',
          title: 'Median of medians, step by step',
          viz: 'momGrid',
          label: 'proofIdea',
          body: `Median of medians chooses the pivot like this: split the array, in order, into groups of 5, sort each group, and find the median of the small array of group medians **by calling Select recursively**. It looks circular (Select calls itself to find its pivot), but the inner call has only $\\lceil n/5\\rceil$ elements.

Why is it a good pivot? Imagine ordering the columns by their medians. In every full column whose median is smaller than the pivot, the median and the two elements above it are smaller than the pivot: at least 3 elements per column. Those columns are about half of the groups, so about $\\tfrac12\\cdot\\tfrac35 = \\tfrac{3}{10}$ of the elements are **certainly** smaller than the pivot, and symmetrically $\\tfrac{3}{10}$ are certainly larger. Both parts therefore have at most about $\\tfrac{7}{10}n$ elements (the exact statement is the Lemma: $7n/10 + 5$).`,
          tasks: [
            'Step through the stages one at a time; say in your own words what changes on screen at each step.',
            'At the last step, compare the number of “certainly smaller” elements with the lemma’s lower bound. Where does the difference come from?',
            'Set the array size to 45 and try a few random arrays: does the actual $|L|$ or $|R|$ ever exceed $7n/10 + 5$?',
          ],
          check: [
            {
              id: 'c8',
              kind: 'numeric',
              prompt: 'An array of 55 elements is split into 11 full groups of 5 and the pivot is the median of medians. At least how many elements are **certainly** smaller than the pivot (counting those in the pivot’s own group)?',
              answer: 17,
              hint: 'The number of medians smaller than the pivot is $\\lceil 11/2 \\rceil - 1$; each gives 3 elements. Plus 2 from the pivot’s group.',
              explanation: '$\\lceil 11/2\\rceil - 1 = 5$ groups × 3 = 15, plus the 2 elements below the pivot in its own group: 17.',
            },
          ],
        },
        {
          kind: 'complexity',
          title: 'Complexity: the pivot choice changes everything',
          body: `**Parameter:** $n$ = array size; cost: comparisons/basic operations.

- **Bad pivot (the min or max every time):** $T(n) = T(n-1) + \\Theta(n) = \\Theta(n^2)$ — **worst case**. On a sorted array the “first element” rule does exactly this.
- **Perfect pivot (the exact median):** $T(n) \\le T(n/2) + cn \\le 2cn = O(n)$ — but finding the median is the very problem we are trying to solve.
- **Random pivot:** the worst case is still $\\Theta(n^2)$ (very unlucky choices), but the **expected** time **for every input** is $O(n)$ (the notes state the result; the Lecture 5 concept check studies it as QuickSelect).
- **Median of medians (Blum–Floyd–Pratt–Rivest–Tarjan, 1973):** **deterministic worst case** $O(n)$.

**Lemma (notes):** $|A_<| \\le \\frac{7n}{10} + 5$ and $|A_>| \\le \\frac{7n}{10} + 5$. Intuition: about half of the groups have a median smaller than $p$, and in each of those groups at least 3 elements are smaller than $p$ → about 30% of the elements are smaller than $p$, so $A_>$ is at most ~70%.

Recurrence: $T(n) \\le cn + T(n/5) + T(7n/10)$ (simplified). The Master Theorem does not apply (different sizes), but substitution gives $T(n) \\le Dn$ with $D = \\max(1, 10c)$ ⇒ $O(n)$. The key: $\\frac15 + \\frac{7}{10} = \\frac{9}{10} < 1$.`,
        },
        {
          kind: 'viz',
          title: 'Why groups of 5?',
          viz: 'groupTree',
          body: `With groups of $q$ elements ($q$ odd) the pivot is certainly larger than about $\\tfrac{q+1}{4q}n$ elements and certainly smaller than as many. The two recursive calls then have sizes $n/q$ (finding the pivot) and about $\\big(1 - \\tfrac{q+1}{4q}\\big)n$ (continuing the search).

- $q = 3$: $\\tfrac13 + \\tfrac23 = 1$ → every full level does $\\approx n$ work; this analysis only gives an $O(n\\log n)$ upper bound.
- $q = 5$: $\\tfrac15 + \\tfrac{7}{10} = \\tfrac{9}{10}$ → $O(n)$; substitution needs $C \\ge 10$.
- $q = 7$: $\\tfrac17 + \\tfrac57 = \\tfrac67$ → $O(n)$; $C \\ge 7$, but sorting groups of 7 costs more.

What decides it is not the number of calls but the **total size** on a level. 5 is the smallest odd group size for which this simple analysis guarantees linear time.`,
          tasks: ['Switch the group size between 3, 5, 7 and 9; watch whether the level totals shrink or stay the same.', 'Use the sum of the ratios to explain why the column for groups of 3 in the table keeps growing.'],
          check: [
            {
              id: 'c9',
              kind: 'mcq',
              prompt: 'For groups of 9, take the simplified model $T(n) = T(n/9) + T(\\tfrac{13}{18}n) + n$. For which smallest $C$ does the inductive step of the proof of $T(n) \\le Cn$ work?',
              options: ['$6$', '$9$', '$10$', 'No $C$ is enough'],
              answer: 0,
              hint: '$\\tfrac{C}{9} + \\tfrac{13C}{18} + 1 \\le C$.',
              explanation: '$\\tfrac19 + \\tfrac{13}{18} = \\tfrac{15}{18} = \\tfrac56$, so $\\tfrac{C}{6} \\ge 1 \\iff C \\ge 6$.',
            },
          ],
        },
        {
          kind: 'text',
          title: 'In practice: libraries and applications',
          body: `Median of medians is $O(n)$ in the worst case, but its constants are large (sorting the groups, copying the medians, two recursions). Real systems usually use:

- **Quickselect** (Hoare, 1961): Select with a random pivot. Expected time $O(n)$, a small constant, and the partition is done in place.
- **Introselect** (Musser, 1997): starts like Quickselect; if the parts do not shrink fast enough it switches to median of medians. Fast in practice and linear in the worst case.
- **Libraries:** C++ \`std::nth_element\`, NumPy \`np.partition\` and \`np.median\` belong to this family.

Where selection is used:

- **Percentiles:** p50, p95, p99 latency measurements.
- **Top k:** to list the $k$ best-selling products, select the $k$-th largest, separate the larger ones in one scan and sort only those: $O(n + k\\log k)$.
- **Image processing:** a median filter replaces noisy pixels with the median of their neighbors.
- **Data structures:** k-d trees split the points at the median on every level.
- **QuickSort:** finding the true median with Select as the pivot gives QuickSort a worst-case $O(n\\log n)$ guarantee (Lecture 5).`,
          check: [
            {
              id: 'c10',
              kind: 'mcq',
              prompt: 'A monitoring service computes the p95 of millions of measurements. It should be as fast as possible on ordinary inputs, yet guarantee linear time even on malicious inputs. Which is most suitable?',
              options: ['Sort the array and take the $\\lceil 0.95n \\rceil$-th element', 'Select that always takes the first element as the pivot', 'Median of medians alone', 'Introselect'],
              answer: 3,
              hint: 'Which hybrid method satisfies both requirements at once?',
              explanation: 'Introselect is as fast as Quickselect on average, and by switching to median of medians when things go badly it stays $O(n)$ in the worst case.',
            },
          ],
        },
        {
          kind: 'mistakes',
          title: 'Common mistakes',
          body: `- Forgetting to update $k$ when recursing into $A_>$ (or forgetting to subtract $|A_=|$ instead of 1).
- Mixing up 0-based and 1-based $k$: in this course $k = 1$ is the smallest element.
- Saying “a random pivot is $O(n)$ in the worst case”: no, the guarantee is for the **expected** time.
- Thinking the median of medians is the true median: it is only guaranteed to be “central enough”.
- With groups of 5 the proof works because $\\frac15 + \\frac{7}{10} < 1$; with groups of 3, $\\frac13 + \\frac23 = 1$ and the linear bound is lost.`,
        },
      ],
      quiz: [
        {
          id: 'q1',
          kind: 'mcq',
          prompt: '$n = 20$, $k = 12$. After partitioning around the pivot, $|A_<| = 7$, $|A_>| = 12$ (distinct elements). What does the algorithm do?',
          options: ['Select($A_<$, 12)', 'Returns p', 'Select($A_>$, 4)', 'Select($A_>$, 5)'],
          answer: 2,
          hint: '$|A_<| + 1 = 8 < 12$; 8 elements are discarded.',
          explanation: '$k' + "'" + ' = 12 - 7 - 1 = 4$: we look for the 4th smallest element in $A_>$.',
          feedback: { 3: 'Don’t forget to discard the pivot too: $12 - 7 - 1 = 4$.' },
        },
        {
          id: 'q2',
          kind: 'mcq',
          prompt: 'What happens if $|A_<| = k - 1$ after partitioning?',
          options: ['Recurse into $A_<$', 'The pivot $p$ is the answer', 'Recurse into $A_>$ with $k$', 'The algorithm fails'],
          answer: 1,
          hint: 'How many elements are smaller than $p$?',
          explanation: 'Exactly $k-1$ elements are smaller than $p$, so $p$ itself is the $k$-th smallest.',
        },
        {
          id: 'q3',
          kind: 'mcq',
          prompt: 'Which is true for Select with a random pivot?',
          options: [
            'The worst case is $O(n)$.',
            'The expected time is $O(n)$ for every input; the worst case is $\\Theta(n^2)$.',
            'It returns the correct result only on random inputs.',
            'The expected time is $O(n \\log n)$.',
          ],
          answer: 1,
          hint: 'The expectation is over the algorithm’s own random choices; correctness does not depend on the pivot.',
          explanation: 'Very unlucky choices can give $\\Theta(n^2)$, but that is unlikely; the expected time is $O(n)$ for every input. Correctness is always guaranteed.',
        },
        {
          id: 'q4',
          kind: 'mcq',
          prompt: 'If we write Select with groups of 7, what is the recurrence ($T(n) = O(n) + T(n/a) + T(bn/c)$) with the smallest integers?',
          options: ['$T(n/7) + T(5n/7)$', '$T(n/7) + T(6n/7)$', '$T(n/5) + T(7n/10)$', '$T(n/7) + T(4n/7)$'],
          answer: 0,
          hint: 'In half of the groups at least 4 elements are smaller than the pivot: $\\frac12 \\cdot \\frac{n}{7}\\cdot 4 = \\frac{2n}{7}$.',
          explanation: 'The pivot is larger (and smaller) than at least $\\approx 2n/7$ elements, so the other side has at most $\\approx 5n/7$. $\\frac17 + \\frac57 = \\frac67 < 1$ → still $O(n)$.',
        },
        {
          id: 'q5',
          kind: 'mcq',
          prompt: 'With groups of 3, Select’s recurrence becomes $T(n) = n + T(n/3) + T(2n/3)$. Which is true?',
          options: ['$T(n) = \\Theta(n)$', '$T(n) = \\Theta(n\\log n)$', '$T(n) = \\Theta(n^2)$', '$T(n) = \\Theta(\\log n)$'],
          answer: 1,
          hint: 'The subproblem sizes sum to exactly $n$; every level of the recursion tree does $\\approx n$ work.',
          explanation: '$\\frac13 + \\frac23 = 1$: every level does $n$ work and there are about $\\log_{3/2} n$ levels → $\\Theta(n\\log n)$.',
        },
      ],
      practice: [
        {
          id: 'p1',
          prompt: `Our own example: $A = [9, 3, 15, 1, 12, 7, 4, 11, 6, 2, 14, 8]$ and $k = 6$. If 8 is chosen as the first pivot, what are $A_<$, $A_>$ and the new $k$? And if pivot 4 is then chosen inside $A_<$?`,
          hints: ['Smaller than 8: 3, 1, 7, 4, 6, 2.', '$|A_<| = 6 \\ge k = 6$ → stay in $A_<$.'],
          solution: `$A_< = [3, 1, 7, 4, 6, 2]$, $|A_<| = 6 \\ge 6$ → $k$ is unchanged, continue in $A_<$. Pivot 4: $A_< = [3, 1, 2]$ ($|A_<| = 3$), $A_> = [7, 6]$. $3 + 1 = 4 < 6$ → go into $A_>$ with $k' = 6 - 3 - 1 = 2$. The 2nd smallest of $A_> = [7, 6]$ is **7**. Check: sorted $A$ = 1 2 3 4 6 **7** 8 9 11 12 14 15 ✓. (Try this array in the visualizer.)`,
        },
        {
          id: 'p2',
          prompt: `Our own example: how would you return **all** elements smaller than the $k$-th smallest (in any order) in $O(n)$ time?`,
          hints: ['First find the $k$-th element.'],
          solution: `Find $x$ = the $k$-th smallest element with Select in $O(n)$, then scan the array once and collect the elements smaller than $x$: $O(n) + O(n) = O(n)$.`,
        },
      ],
      sources: [SRC.l4.pre, SRC.l4.notes, SRC.l4.slides, SRC.l4.notebook, SRC.l4.concept, SRC.sec.s2, SRC.hw.hw3],
    },
  ],
}
