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
      minutes: 40,
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
          title: 'Intuition: binary search in an unsorted array',
          label: 'intuition',
          body: `Choose a pivot $p$ and split the array into the elements smaller than $p$ ($A_<$) and larger than $p$ ($A_>$). Once we know $|A_<|$, we know for sure which side the $k$-th element is on — we can **throw away** the other side entirely. It resembles binary search; but the array is not sorted, so we partition at every step.

Special case $k = 1$ (the minimum): one scan in $O(n)$ suffices, and since every deterministic algorithm must look at every element, $\\Omega(n)$ is needed. Is $O(n)$ possible for general $k$ too? Yes!`,
        },
        {
          kind: 'formal',
          title: 'Problem and algorithm',
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
          label: 'formalProof',
          proof: [
            { title: 'Hypothesis', body: 'For every array of size $n$ and $k \\in \\{1..n\\}$, Select returns the $k$-th smallest.' },
            { title: 'Base (n = 1)', body: '$k$ must be 1; the single element is returned — correct.' },
            { title: 'Step', body: 'Let the hypothesis hold for $n < i$ and let $|A| = i$. Three cases: (1) $|A_<| = k-1$: exactly $k-1$ elements are smaller than $p$, so $p$ is the answer. (2) $|A_<| > k-1$: the $k$-th smallest is in $A_<$; since $|A_<| < i$, the hypothesis applies. (3) $|A_<| < k-1$: the answer is the element of rank $k - |A_<| - 1$ in $A_>$; $1 \\le k - |A_<| - 1 \\le |A_>|$ and $|A_>| < i$.' },
            { title: 'Pivot rule', body: 'No step used how $p$ was chosen: ChoosePivot affects only the running time, not correctness.' },
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
