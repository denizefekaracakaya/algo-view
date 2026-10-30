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
      minutes: 40,
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
          check: [
            {
              id: 'c1',
              kind: 'mcq',
              prompt: 'Which one is an **allowed** operation in the comparison model?',
              options: ['Reading the last digit of $x$', 'Asking “is $x < y$?”', 'Using $x$ as an index into an array', 'Dividing $x$ by 10'],
              answer: 1,
              hint: 'In this model there is no direct access to values.',
              explanation: 'In the comparison model, information about the items comes only from pairwise comparisons. Reading digits or using values as indices belongs to the different model used by CountingSort/RadixSort.',
            },
          ],
          label: 'intuition',
          body: `The joke in the slides: drop sticks upright on a table and they are “sorted” by length — $O(1)$! The lesson: a lower bound is only meaningful in a particular **model of computation**.

**The comparison-based model:** you cannot access the values of the items directly; you can only ask a “genie” “is $x$ greater than $y$?”. InsertionSort, MergeSort and QuickSort live in this model.`,
        },
        {
          kind: 'formal',
          title: 'Theorem (Lecture 6 slides)',
          check: [
            {
              id: 'c2',
              kind: 'mcq',
              prompt: 'What exactly does the lower-bound theorem say?',
              options: [
                'Every sorting algorithm takes $\\Omega(n\\log n)$ steps on every input.',
                'Every deterministic comparison-based algorithm has **at least one** input that needs $\\Omega(n\\log n)$ comparisons.',
                'MergeSort makes exactly $n\\log n$ comparisons on every input.',
                'Sorting cannot be done in $O(n)$.',
              ],
              answer: 1,
              hint: 'It is a worst-case lower bound, and it depends on a model.',
              explanation: 'The bound is about the worst case and holds only in the comparison model. Some inputs (e.g. a sorted array) can be sorted with fewer comparisons, and value-based algorithms are outside the model.',
            },
          ],
          box: 'formal',
          label: 'formal',
          body: `- Every **deterministic** comparison-based sorting algorithm takes $\\Omega(n\\log n)$ steps in the worst case.
- Every **randomized** comparison-based sorting algorithm takes $\\Omega(n\\log n)$ steps **in expectation**. (Its proof is outside the scope of this lesson.)

Consequence: in the comparison model MergeSort is **asymptotically optimal**.`,
        },
        {
          kind: 'viz',
          title: 'Decision tree explorer',
          tasks: [
            'InsertionSort with $n = 3$: compare the number of leaves, the height and $\\lceil\\log_2 3!\\rceil$. Does InsertionSort reach the bound?',
            'Pick MergeSort with $n = 4$: is the height equal to the lower bound ($\\lceil\\log_2 24\\rceil = 5$)?',
            'Change the hidden input to find the shortest and the longest paths. Which inputs are easy, which hard?',
          ],
          viz: 'decisionTree',
          body: `The trees below were built by actually running the selected algorithm: every possible input ordering was run with an oracle and the questions asked were recorded. Change the hidden input; the length of the highlighted path is the number of comparisons on that input. Compare the number of leaves and the height with $\\lceil\\log_2 n!\\rceil$.`,
        },
        {
          kind: 'correctness',
          title: 'Proof',
          check: [
            {
              id: 'c3',
              kind: 'numeric',
              prompt: 'At least how many comparisons must a comparison algorithm sorting 6 distinct items make in the worst case?',
              answer: 10,
              hint: '$6! = 720$; $2^9 = 512$, $2^{10} = 1024$.',
              explanation: '$\\lceil \\log_2 720 \\rceil = 10$: a tree with 9 comparisons has at most 512 leaves and cannot distinguish 720 orderings.',
            },
          ],
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
          check: [
            {
              id: 'c5',
              kind: 'mcq',
              prompt: 'InsertionSort sorts an already sorted array of $n$ elements with $n - 1$ comparisons. Does this contradict the $\\Omega(n\\log n)$ lower bound?',
              options: ['Yes: the lower bound must be wrong.', 'No: the lower bound is about the worst case; InsertionSort has bad inputs too.', 'No: InsertionSort is not comparison-based.', 'Yes, but only for small $n$.'],
              answer: 1,
              hint: 'Does the lower bound talk about “every input” or “some input”?',
              explanation: 'The lower bound says that every comparison algorithm makes $\\Omega(n\\log n)$ comparisons on **at least one** input. A sorted array is an easy input; on a reversed array InsertionSort makes $n(n - 1)/2$ comparisons.',
            },
          ],
        },
        {
          kind: 'text',
          title: 'In practice: where else the decision-tree argument helps',
          body: `The same idea — “number of possible answers ≤ $2^{\\text{number of questions}}$” — gives many lower bounds:

- **Searching a sorted array:** the position (or absence) of a key in a sorted array of $n$ elements is one of $n + 1$ different answers; every comparison-based search makes at least $\\lceil\\log_2(n+1)\\rceil$ comparisons in the worst case. Binary search reaches this bound.
- **Generic libraries:** functions such as \`sorted\` and \`std::sort\` must work with any comparable type, so they live in the comparison model; $\\Omega(n\\log n)$ is a real bound for them.
- **Stepping outside the model:** when keys are small integers or of fixed length (e.g. 32-bit numbers), value-based methods like RadixSort can go below this bound; that is why fast GPU sorting libraries use RadixSort.`,
          check: [
            {
              id: 'c4',
              kind: 'numeric',
              prompt: 'At least how many comparisons does every comparison-based search make in the worst case on a sorted array of 1,000,000 elements?',
              answer: 20,
              hint: '$n + 1$ possible answers; $2^{20} = 1\\,048\\,576$.',
              explanation: '$\\lceil\\log_2 1\\,000\\,001\\rceil = 20$, because $2^{19} = 524\\,288 < 1\\,000\\,001 \\le 2^{20}$. Binary search makes exactly that many.',
            },
          ],
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
        {
          id: 'p2',
          prompt: `Our own example: what lower bound does the decision-tree argument give for finding the largest of $n$ numbers? Is the bound tight?`,
          hints: ['How many different outputs (leaves) are needed?', 'Every element other than the maximum has to lose at least one comparison.'],
          solution: `There are $n$ possible answers, so the tree has at least $n$ leaves: height $\\ge \\lceil\\log_2 n\\rceil$. This bound is **not tight**. A stronger argument: to be sure of its answer, the algorithm must have seen each of the $n - 1$ non-maximum elements lose at least one comparison, and every comparison has only one loser. So at least $n - 1$ comparisons are needed, and a simple scan makes exactly $n - 1$. The decision-tree argument always gives a lower bound, but not always the best one.`,
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
      minutes: 50,
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
          check: [
            {
              id: 'c1',
              kind: 'numeric',
              prompt: 'About how many basic operations ($n + r$) does CountingSort make to sort 1000 students by birth month with 12 buckets?',
              answer: 1012,
              hint: 'Each student goes into a bucket once, each bucket is scanned once.',
              explanation: '$n + r = 1000 + 12 = 1012$: no comparisons, linear time.',
            },
          ],
          label: 'intuition',
          body: `Pre-lecture exercise: sort $n$ students by birth month. MergeSort takes $O(n\\log n)$. But if you open 12 boxes, drop each student into the box of their birth month, then concatenate the boxes from January to December, it is $O(n + 12) = O(n)$! We made no comparisons at all: we used **the value directly as an index**.

The “BucketSort” in the lecture title is this bucket idea; the notes and slides develop it as **CountingSort** and **RadixSort**, built on top of it.`,
        },
        {
          kind: 'formal',
          title: 'Algorithms and assumptions',
          check: [
            {
              id: 'c2',
              kind: 'mcq',
              prompt: 'If the (key, label) pairs $[(2, a), (1, b), (2, c), (1, d)]$ are sorted **stably** by key, what is the output?',
              options: ['$[(1,b), (1,d), (2,a), (2,c)]$', '$[(1,d), (1,b), (2,c), (2,a)]$', '$[(1,b), (1,d), (2,c), (2,a)]$', '$[(1,d), (1,b), (2,a), (2,c)]$'],
              answer: 0,
              hint: 'Items with equal keys keep their input order.',
              explanation: 'The key-1 items come in input order (b, d), then the key-2 items (a, c).',
            },
          ],
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
          tasks: [
            'Run the “Birth month” example in CountingSort and look at the subscripts: is the order of students born in the same month preserved?',
            'Run the “Slide example” in RadixSort with base 10: how many passes? Then set the base to 2: why did the number of passes grow?',
            'Try base 16: explain the trade-off between the number of passes and the number of buckets.',
            'In **prediction mode**, predict each item’s bucket.',
          ],
          viz: 'bucketSort',
          body: `Start with CountingSort, then switch to RadixSort. The subscripts show the input order: watch the order of items with equal keys being preserved. In RadixSort, change the base (2, 10, 16…) and see how the number of passes and buckets changes. In prediction mode, guess each item’s bucket.`,
        },
        {
          kind: 'correctness',
          title: 'Correctness of RadixSort',
          check: [
            {
              id: 'c3',
              kind: 'mcq',
              prompt: 'What happens if RadixSort starts from the **most** significant digit and stably re-buckets the whole array by that digit on every pass?',
              options: ['It still sorts correctly.', 'The last pass sorts only by the ones digit; the order from earlier passes is broken and the result can be wrong.', 'It gets faster.', 'It loops forever.'],
              answer: 1,
              hint: 'Which digit does the last pass sort by?',
              explanation: 'The LSD order matters: the last pass must be on the most significant digit so that ties are resolved by the order of the earlier (less significant) digits. Done the other way, e.g. [21, 12] is sorted by tens and then by ones and stays [21, 12] — wrong.',
            },
          ],
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
          check: [
            {
              id: 'c4',
              kind: 'numeric',
              prompt: 'Integers smaller than $10^6$ are sorted with base-10 RadixSort. At most how many passes are needed?',
              answer: 6,
              hint: 'The largest value is 999,999.',
              explanation: '999,999 has 6 digits: $d = 6$ passes.',
            },
          ],
          body: `- Sorting $n$ numbers in $\\{1..n\\}$ with base 10: $d = \\lfloor\\log_{10} n\\rfloor + 1$ → $O(n\\log n)$ — no better than MergeSort.
- Base $r = n$: $O\\big((\\log_n M + 1)(n + n)\\big)$. If $M \\le n^c$ ($c$ constant), that is $O(n)$ — beating MergeSort and QuickSort.
- If $M = 2^n$, then $d \\approx n/\\log n$ → $O(n^2/\\log n)$: we don’t use RadixSort in this regime.
- A large $r$ means more buckets (time/memory), a small $r$ means more digits: a **trade-off**.`,
        },
        {
          kind: 'text',
          title: 'In practice: buckets and digits',
          body: `- **Fixed-width integers:** 32-bit numbers are sorted in 4 passes with base $2^8 = 256$; each pass is a single counting/distribution scan. GPU sorting libraries (e.g. CUB, Thrust) use RadixSort for this reason.
- **Text:** fixed-length keys (postal codes, dates \`YYYYMMDD\`, IP addresses) suit LSD RadixSort very well; for variable-length strings the recursive variant starting from the most significant digit (MSD) is used.
- **Histograms and grades:** sorting or counting small-range values such as exam scores, ages or months is a single CountingSort scan.
- **Building indexes:** text indexes such as suffix arrays are built by repeatedly RadixSorting ranks of characters.`,
          check: [
            {
              id: 'c5',
              kind: 'numeric',
              prompt: '32-bit unsigned integers are sorted with LSD RadixSort in base $256$ ($8$ bits). How many passes are needed?',
              answer: 4,
              hint: 'Each pass handles 8 bits.',
              explanation: '$32 / 8 = 4$ passes, each $O(n + 256)$: $O(n)$ in total.',
            },
          ],
        },
        {
          kind: 'steps',
          title: 'Worked example: CountingSort without linked lists',
          label: 'formal',
          body: `The version in the notes keeps one bucket (a linked list) per key. In practice two arrays do the same job: counters and prefix sums. Our own example: $A = [3, 1, 4, 1, 5, 2, 3]$, keys $\\{0, \\dots, 5\\}$.`,
          proof: [
            { title: 'Count', body: '$C[k]$ = number of elements with key $k$: $C = [0, 2, 1, 2, 1, 1]$ (from 0 to 5).' },
            { title: 'Prefix sums', body: 'Turn $C[k]$ into “number of keys smaller than $k$”: $[0, 0, 2, 3, 5, 6]$. This is the output index (0-based) of the first element with key $k$.' },
            { title: 'Place', body: 'Walk through $A$ **from left to right**; write $x$ at index $C[x]$ and increase $C[x]$ by one. 3 → 3, 1 → 0, 4 → 5, 1 → 1, 5 → 6, 2 → 2, 3 → 4. The output is $[1, 1, 2, 3, 3, 4, 5]$.' },
            { title: 'Stability', body: 'Equal keys land in their input order (the first 3 at index 3, the second at index 4): the sort is stable, exactly what RadixSort needs. Time $O(n + r)$, extra memory $O(n + r)$.' },
          ],
          check: [
            {
              id: 'c6',
              kind: 'numeric',
              prompt: 'In this example, at which output index (0-based) is the key 4 written?',
              answer: 5,
              hint: 'How many keys are smaller than 4?',
              explanation: 'The keys smaller than 4 are 1, 1, 2, 3, 3: five of them, so index 5.',
            },
          ],
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
        {
          id: 'p2',
          prompt: `Our own example: $n = 10^6$ integers, all in $[0, 10^{12})$. How many passes does RadixSort make in base 10? How many in base $r = n = 10^6$? What is the total work of each?`,
          hints: ['Number of passes = number of digits in base $r$ = $\\lceil \\log_r 10^{12} \\rceil$.', 'Each pass costs $O(n + r)$.'],
          solution: `Base 10: 12 digits, 12 passes at $O(10^6 + 10)$ each: about $1.2 \\cdot 10^7$ steps. Base $10^6$: $10^{12} = (10^6)^2$, so 2 digits, 2 passes at $O(10^6 + 10^6)$ each: about $4 \\cdot 10^6$ steps. Choosing base $r = n$ gives $c$ passes and $O(cn)$ time when the values go up to $n^c$. A comparison sort would make $n \\log_2 n \\approx 2 \\cdot 10^7$ comparisons.`,
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
      minutes: 30,
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
          tasks: [
            'Pick each scenario and read the “kind of guarantee” column of the recommended algorithm. In which scenarios does the model change?',
            'Open the measurement panel and raise $n$ to 512: how many times larger is InsertionSort’s count than MergeSort’s?',
          ],
          viz: 'sortComparison',
          body: `Pick a scenario; the suitable algorithms and the reasoning are highlighted. Pay special attention to the “kind of guarantee” column in the table.`,
          check: [
            {
              id: 'c4',
              kind: 'numeric',
              prompt: 'How many comparisons does InsertionSort make on an already sorted array of $n = 1000$ elements?',
              answer: 999,
              hint: 'Each new element is compared only with its left neighbor and stays where it is.',
              explanation: 'One comparison for each $i = 1, \\dots, n - 1$: $n - 1 = 999$. MergeSort still makes about $\\frac{n}{2}\\log_2 n \\approx 5000$ comparisons on sorted input: InsertionSort’s best case is linear, MergeSort’s is not.',
            },
          ],
        },
        {
          kind: 'text',
          title: 'Three different kinds of guarantee',
          check: [
            {
              id: 'c1',
              kind: 'mcq',
              prompt: 'In a real-time system such as brake-control software, every sort must **never** exceed a time limit. Which is most suitable?',
              options: ['Randomized QuickSort', 'MergeSort (or HeapSort)', 'Fixed-pivot QuickSort', 'InsertionSort'],
              answer: 1,
              hint: 'An expected-time guarantee does not bound a single run.',
              explanation: 'Real-time systems need a worst-case guarantee: MergeSort or HeapSort guarantee $O(n\\log n)$ on every input and every run.',
            },
            {
              id: 'c5',
              kind: 'mcq',
              prompt: 'An adversary reads the **code** of your randomized QuickSort and picks the input accordingly, but does not know the random numbers drawn while it runs. Does the expected $O(n\\log n)$ guarantee still hold?',
              options: [
                'Yes: the expectation is over the algorithm’s random choices, taken separately for every input.',
                'No: the adversary can find an input whose expected time is $\\Theta(n^2)$.',
                'Only if the input is a random permutation.',
                'Only if all keys are distinct.',
              ],
              answer: 0,
              hint: 'For which inputs was $E[C] \\le 2n \\ln n$ proven in Lecture 5?',
              explanation: 'The proof works for every fixed input; the randomness comes from the algorithm, not the input. Only an adversary who knew the random bits in advance could pick a bad input. With fixed-pivot QuickSort, knowing the code is enough: sorted input takes $\\Theta(n^2)$.',
            },
          ],
          body: `- **Worst case (deterministic):** holds for every input (MergeSort $O(n\\log n)$, CountingSort $O(n + r)$).
- **Expected (randomized algorithm):** for every input, an expectation over the algorithm’s random choices (randomized QuickSort $O(n\\log n)$). A single run may be worse.
- **Depends on the input distribution (average case):** under the assumption that inputs arrive at random (e.g. fixed-pivot QuickSort doing well on random permutations). An adversary can break this assumption.`,
        },
        {
          kind: 'text',
          title: 'In practice: the default sorts of programming languages',
          body: `- **Python** \`sorted\` / \`list.sort\`: **Timsort** — stable, $O(n\\log n)$ in the worst case, very fast on nearly sorted data.
- **C++** \`std::sort\`: **introsort** (QuickSort + HeapSort + InsertionSort) — not stable, $O(n\\log n)$ in the worst case. If stability is needed, \`std::stable_sort\` (merge-based).
- **Java** \`Arrays.sort\`: **dual-pivot QuickSort** for primitives, **Timsort** for objects.
- **Databases:** **external MergeSort** for sorts that do not fit in memory.
- **GPUs and large integer arrays:** **RadixSort**.

The common lesson: no algorithm is best in every situation; the model (comparisons or values), the kind of guarantee, stability and memory are weighed together.`,
          check: [
            {
              id: 'c2',
              kind: 'mcq',
              prompt: 'In C++, records must be sorted while keeping the existing order of records with equal keys. Which should be used?',
              options: ['`std::sort`', '`std::stable_sort`', '`std::nth_element`', 'None; you have to write it by hand'],
              answer: 1,
              hint: 'Introsort is not stable.',
              explanation: '`std::stable_sort` guarantees stability (it is merge-based); `std::sort` does not.',
            },
          ],
        },
        {
          kind: 'steps',
          title: 'Worked example: sorting a million integers',
          label: 'formal',
          body: `Our own example: $n = 10^6$ non-negative 32-bit integers. Let us ask the questions of the comparison table in order and compare the candidates with a rough operation count.`,
          proof: [
            { title: 'Model', body: 'The keys are fixed-length integers; we can look at their values directly. So the $\\Omega(n\\log n)$ lower bound for comparison-based sorting does not bind us: RadixSort is a candidate too.' },
            { title: 'Comparison-based', body: 'MergeSort or randomized QuickSort make about $n\\log_2 n \\approx 10^6 \\cdot 20 = 2 \\cdot 10^7$ comparisons.' },
            { title: 'RadixSort, base 256', body: '$r = 2^8$: 32 bits are four bytes, $d = 4$ passes. Each pass is $O(n + r)$: about $4(10^6 + 256) \\approx 4 \\cdot 10^6$ operations in total.' },
            { title: 'RadixSort, base 65536', body: '$r = 2^{16}$: $d = 2$ passes, $2(10^6 + 65\\,536) \\approx 2.1 \\cdot 10^6$ in total. Growing the base further does not help: $r = 2^{32}$ means a single pass but more than 4 billion buckets, and $r$ dominates $O(n + r)$.' },
            { title: 'Conclusion', body: 'In operation count RadixSort is ahead by a factor of 5–10. But these are step counts, not seconds: RadixSort copies the whole array in every pass and needs $O(n + r)$ extra memory. That is why RadixSort is common on GPUs while general-purpose libraries usually use comparison-based sorting. If stability is needed, both work: MergeSort and RadixSort are both stable.' },
          ],
          check: [
            {
              id: 'c3',
              kind: 'numeric',
              prompt: 'For the same 32-bit keys, how many passes does RadixSort make with base $r = 2^{11} = 2048$?',
              answer: 3,
              hint: 'Each pass handles 11 bits.',
              explanation: '$\\lceil 32/11 \\rceil = 3$ passes (11 + 11 + 10 bits). About $3(10^6 + 2048) \\approx 3 \\cdot 10^6$ operations in total.',
            },
          ],
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
        {
          id: 'q3',
          kind: 'numeric',
          prompt: 'In how many passes does RadixSort with base $r = 2^{16}$ sort non-negative 64-bit integers?',
          answer: 4,
          hint: 'Each pass handles one “digit”, i.e. 16 bits.',
          explanation: '$64 / 16 = 4$ passes, each $O(n + 2^{16})$.',
        },
        {
          id: 'q4',
          kind: 'mcq',
          prompt: 'An embedded device has only $O(1)$ extra memory and needs worst-case $O(n\\log n)$ time on every input. The keys can be compared but are not small integers. Which one fits?',
          options: ['MergeSort', 'HeapSort', 'CountingSort', 'Randomized QuickSort'],
          answer: 1,
          hint: 'Rule out each candidate on two criteria: extra memory and kind of guarantee.',
          explanation: 'HeapSort works in place and is $O(n\\log n)$ in the worst case. MergeSort’s merge step needs $O(n)$ extra memory; randomized QuickSort’s guarantee is an expected time; CountingSort needs small integer keys and $O(n + r)$ memory.',
        },
      ],
      practice: [
        {
          id: 'p1',
          prompt: `Our own example: you need to sort 10 million product records by a category code between 0 and 999, **without disturbing the existing order of records within the same category**. Which algorithm would you choose? Why?`,
          hints: ['Which property does “without disturbing the existing order” ask for?', '$r = 1000 \\ll n$.'],
          solution: `CountingSort ($r = 1000$ buckets): $O(n + r) = O(n)$ and stable — records in the same category keep their input order. MergeSort is stable too, but $O(n\\log n)$; QuickSort is not stable.`,
        },
        {
          id: 'p2',
          prompt: `Our own example: a server log arrives **almost** sorted by timestamp: because of network delays every record is at most $k = 3$ places away from its sorted position. Which algorithm would you choose for $n = 10^6$ records, and why?`,
          hints: ['InsertionSort runs in $O(n + I)$, where $I$ is the number of inversions.', 'How many elements can a single element form an inversion with?'],
          solution: `Since every element moved at most $k$ places, it can only be inverted with elements within distance $2k$: $I \\le 2kn = 6 \\cdot 10^6$. InsertionSort runs in $O(n + I) = O(kn)$, a few million steps; MergeSort or HeapSort do not exploit this structure and make about $n \\log_2 n \\approx 2 \\cdot 10^7$ comparisons. Timsort also detects the situation and runs in close to linear time. RadixSort would work since the timestamps are integers, but it is unnecessary: the input is already almost sorted.`,
        },
      ],
      sources: [SRC.l6.slides, SRC.l5.slides, SRC.l2.notes],
    },
  ],
}
