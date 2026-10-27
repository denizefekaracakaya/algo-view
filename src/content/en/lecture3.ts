import type { Lecture } from '../types'
import { SRC } from '../sources'

export const lecture3: Lecture = {
  n: 3,
  title: 'Solving Recurrences and the Master Theorem',
  titleEn: 'Solving Recurrences and the Master Theorem',
  date: 'January 12, 2026',
  blurb: 'Recursion trees, the three cases of the Master Theorem, and guess-and-check: the substitution method.',
  lessons: [
    {
      id: 'l3-master',
      lecture: 3,
      title: 'Recursion trees and the Master Theorem',
      titleEn: 'Recursion trees and the Master Theorem',
      summary: 'A geometric series of level sums: constant, decreasing or increasing?',
      minutes: 50,
      objectives: [
        'Write the running time of divide-and-conquer algorithms as a recurrence relation.',
        'Compute the number of subproblems, their size and the total work per level of a recursion tree.',
        'Check the conditions of the Master Theorem, choose the right case and bound, and explain why that case applies.',
        'Recognize recurrences to which the Master Theorem does not apply.',
      ],
      prerequisites: ['The MergeSort recursion tree', 'Geometric series', 'Logarithm rules'],
      sections: [
        {
          kind: 'intuition',
          title: 'Intuition: a race between forces',
          check: [
            {
              id: 'c1',
              kind: 'mcq',
              prompt: 'For $T(n) = 4T(n/2) + n^2$, what is the total work on level $j$ of the recursion tree?',
              options: ['$n^2$ (the same on every level)', '$n^2 / 2^j$', '$4^j n^2$', '$n^2 \\log n$'],
              answer: 0,
              hint: 'Compute $a^j \\cdot (n/b^j)^d$ with $a = 4$, $b = 2$, $d = 2$.',
              explanation: '$4^j (n/2^j)^2 = n^2$: the ratio $a/b^d = 1$, every level does equal work and the result is $O(n^2\\log n)$.',
            },
          ],
          label: 'intuition',
          body: `In an algorithm of the form $T(n) = a\\,T(n/b) + O(n^d)$ two forces compete:

- **Branching** $a$: the number of subproblems grows by a factor $a$ per level.
- **Shrinking** $b^d$: the non-recursive work of each subproblem drops by a factor $b^d$.

The total work on level $j$ is $c\\,n^d (a/b^d)^j$. If the ratio is $1$, every level does equal work (MergeSort); if it is $<1$ the root dominates; if it is $>1$ the leaves dominate (Karatsuba).`,
        },
        {
          kind: 'formal',
          title: 'The Master Theorem (Lecture 3 notes, Theorem 1)',
          check: [
            {
              id: 'c2',
              kind: 'mcq',
              prompt: 'Which one is **not** a condition of the Master Theorem (Theorem 1)?',
              options: ['$a \\ge 1$ is an integer', '$b > 1$', 'All subproblems have the same size ($n/b$)', '$d$ must be an integer'],
              answer: 3,
              hint: 'Think of recurrences like $T(n) = 4T(n/2) + n^{1.5}$.',
              explanation: '$d \\ge 0$ can be any real number (e.g. $d = 1/4$ or $2.5$). $a$ is an integer because it counts subproblems.',
            },
          ],
          box: 'formal',
          label: 'formal',
          body: `Let $a \\ge 1$ (an integer), $b > 1$, $d \\ge 0$ be constants and $T(n) = a\\cdot T\\!\\left(\\frac{n}{b}\\right) + O(n^d)$, $T(1) = O(1)$. Then
$$T(n) = \\begin{cases} O(n^d \\log n) & a = b^d \\\\ O(n^d) & a < b^d \\\\ O(n^{\\log_b a}) & a > b^d. \\end{cases}$$

**Conditions:** all subproblems have the **same size** ($n/b$), there are a constant number of them, and $b > 1$. (Remark 2: small differences such as $\\lfloor n/b\\rfloor$, $\\lceil n/b\\rceil$ or $n/b + 1$ do not change the result.)

**General version (Theorem 3):** for $T(n) = aT(n/b) + f(n)$: if $f(n) = O(n^{\\log_b a - \\varepsilon})$ then $\\Theta(n^{\\log_b a})$; if $f(n) = \\Theta(n^{\\log_b a})$ then $\\Theta(n^{\\log_b a}\\log n)$; if $f(n) = \\Omega(n^{\\log_b a + \\varepsilon})$ and the regularity condition $a f(n/b) \\le c f(n)$ ($c<1$) holds, then $\\Theta(f(n))$.`,
        },
        {
          kind: 'viz',
          title: 'Master Theorem explorer and recurrence playground',
          tasks: [
            'In the **Parameters** tab start with $a = 2$, $b = 2$; set $d$ to $0.5$, $1$ and $2$. Which case is picked each time and how does the level table change?',
            'In the **Write a recurrence** tab, try the “Select (MoM)” and “T(n−1)” examples. Why does the tool refuse to solve them, and what does it suggest?',
            'Run the “Gap case” example: what does the general version (Theorem 3) say?',
            'Grow $n$ with the tree-depth slider: how does the “Relative” column show which level dominates?',
          ],
          viz: 'master',
          body: `In the **Parameters** tab enter $a$, $b$, $d$ separately; in the **Write a recurrence** tab type your own recurrence. The tool checks the conditions, picks the case, shows why, and lists the level sums of the recursion tree. If the conditions fail (different-size subproblems, $T(n-1)$, the log-factor gap case) it does not silently make up an answer; it explains why.`,
        },
        {
          kind: 'correctness',
          title: 'Proof idea: the recursion tree',
          check: [
            {
              id: 'c3',
              kind: 'numeric',
              prompt: 'For $a = 8$, $b = 2$, $d = 2$, what is the ratio $a/b^d$ between consecutive level sums?',
              answer: 2,
              hint: '$b^d = 4$.',
              explanation: '$8/4 = 2 > 1$: the level work doubles on every level and the leaves dominate: $O(n^{\\log_2 8}) = O(n^3)$.',
            },
          ],
          label: 'formalProof',
          proof: [
            { title: 'Setup', body: 'Assume $T(1) = 1$ and that $n$ is a power of $b$. For some $c > 0$, $T(n) \\le a\\,T(n/b) + c\\,n^d$.' },
            { title: 'Level j', body: '$a^j$ subproblems, each of size $n/b^j$ with at most $c(n/b^j)^d$ non-recursive work: the level sum is $a^j c (n/b^j)^d = c\\,n^d (a/b^d)^j$.' },
            { title: 'Total', body: '$\\log_b n + 1$ levels: $T(n) \\le c\\,n^d \\sum_{j=0}^{\\log_b n} (a/b^d)^j$.' },
            { title: 'Case a = b^d', body: 'Every term is 1: the total is $(\\log_b n + 1)\\,c\\,n^d = O(n^d\\log n)$.' },
            { title: 'Case a < b^d', body: 'A decreasing geometric series, bounded by the infinite sum $\\frac{1}{1 - a/b^d}$ (a constant): $O(n^d)$. The root level dominates.' },
            {
              title: 'Case a > b^d',
              body: 'An increasing geometric series, dominated by the last term: $O\\!\\left(n^d (a/b^d)^{\\log_b n}\\right) = O\\!\\left(n^d \\cdot \\frac{a^{\\log_b n}}{n^d}\\right) = O(a^{\\log_b n}) = O(n^{\\log_b a})$. The leaves dominate.',
            },
          ],
        },
        {
          kind: 'complexity',
          title: 'Examples from the lecture',
          body: `- **Mult1:** $T(n) = 4T(n/2) + O(n)$, $a = 4 > 2^1$ → $O(n^{\\log_2 4}) = O(n^2)$.
- **Karatsuba:** $T(n) = 3T(n/2) + O(n)$, $a = 3 > 2$ → $O(n^{\\log_2 3}) \\approx O(n^{1.59})$.
- **MergeSort:** $T(n) = 2T(n/2) + O(n)$, $a = 2 = 2^1$ → $O(n\\log n)$.
- **Example:** $T(n) = 2T(n/2) + O(n^2)$, $a = 2 < 4$ → $O(n^2)$.`,
        },
        {
          kind: 'text',
          title: 'In practice: familiar algorithms through the Master Theorem',
          body: `- **Binary search:** $T(n) = T(n/2) + O(1)$; $a = 1 = 2^0 = b^d$ → $O(\\log n)$.
- **Strassen matrix multiplication:** $T(n) = 7T(n/2) + O(n^2)$; $7 > 4$ → $O(n^{\\log_2 7}) \\approx O(n^{2.81})$. Plain recursive matrix multiplication is $8T(n/2) + O(n^2) = O(n^3)$.
- **FFT** (polynomial multiplication, signal processing) and **closest pair of points:** $T(n) = 2T(n/2) + O(n)$ → $O(n\\log n)$.
- **Tree-based aggregation** (e.g. visiting every node of a complete binary tree once): $T(n) = 2T(n/2) + O(1)$ → $O(n)$.

If the subproblems have different sizes the Master Theorem is not enough; use the substitution method or the more general **Akra–Bazzi** theorem. As a quick sanity check, computing the recurrence numerically with a small program and looking at $T(n)/f(n)$ is a good habit.`,
          check: [
            {
              id: 'c4',
              kind: 'mcq',
              prompt: 'Which case of the Master Theorem does binary search’s recurrence $T(n) = T(n/2) + O(1)$ fall into?',
              options: ['$a = b^d$ → $O(\\log n)$', '$a < b^d$ → $O(1)$', '$a > b^d$ → $O(n)$', 'It does not apply'],
              answer: 0,
              hint: '$a = 1$, $b = 2$, $d = 0$.',
              explanation: '$b^d = 2^0 = 1 = a$: $O(n^0\\log n) = O(\\log n)$.',
            },
            {
              id: 'c5',
              kind: 'numeric',
              prompt: 'Plain recursive matrix multiplication $T(n) = 8T(n/2) + O(n^2)$ solves to $O(n^k)$. What is $k$?',
              answer: 3,
              hint: '$\\log_2 8$.',
              explanation: '$8 > 2^2$ → $O(n^{\\log_2 8}) = O(n^3)$: splitting alone gains nothing; Strassen lowers the exponent with 7 sub-products.',
            },
          ],
        },
        {
          kind: 'steps',
          title: 'When the theorem does not apply: $T(n) = 2T(n/2) + n\\log_2 n$',
          label: 'proofIdea',
          proof: [
            { title: 'Why it does not fit', body: 'The work term $n\\log n$ is not $\\Theta(n^d)$ for any $d$: it grows faster than $n$ and slower than every $n^{1+\\varepsilon}$. The condition of Theorem 1 fails; the recursion tree still works.' },
            { title: 'Level j', body: '$2^j$ subproblems, each of size $n/2^j$ doing $\\frac{n}{2^j}\\log_2\\frac{n}{2^j}$ work: the level total is $n(\\log_2 n - j)$.' },
            { title: 'Total', body: 'With $L = \\log_2 n$: $\\sum_{j=0}^{L-1} n(L - j) = n\\,(L + (L-1) + \\dots + 1) = n\\frac{L(L+1)}{2}$.' },
            { title: 'Conclusion', body: '$T(n) = \\Theta(n\\log^2 n)$: neither $n\\log n$ nor $n^{1+\\varepsilon}$. The levels are not equal but shrink slowly, so the total stays of the order “number of levels × root”.' },
          ],
          check: [
            {
              id: 'c6',
              kind: 'numeric',
              prompt: 'For $n = 8$, what is the sum of the level totals without the leaves, $\\sum_{j=0}^{2} n(\\log_2 n - j)$?',
              answer: 48,
              hint: '$8 \\cdot 3 + 8 \\cdot 2 + 8 \\cdot 1$.',
              explanation: '$24 + 16 + 8 = 48 = 8 \\cdot \\frac{3 \\cdot 4}{2}$.',
            },
          ],
        },
        {
          kind: 'mistakes',
          title: 'Common mistakes',
          body: `- Applying the Master Theorem to subproblems of **different sizes**, like $T(n) = T(n/5) + T(7n/10) + n$. (In Lecture 4 this is exactly Select’s recurrence; it is solved with the substitution method.)
- Applying it to $T(n) = T(n-1) + n$: the size is not divided by a constant.
- Comparing $a$ with $b$ instead of $a$ with $b^d$.
- “Solving” $T(n) = 2T(n/2) + n\\log n$ as “$a = b^d$, the answer is $n\\log n$”: the work term is not of the form $n^d$; it falls into the gap between the three cases.`,
        },
      ],
      quiz: [
        {
          id: 'q1',
          kind: 'mcq',
          prompt: 'How many subproblems are on level 4 of the recursion tree of $T(n) = 5T(n/4) + 2n$? (The root is level 0.)',
          options: ['$625$', '$125$', '$1024$', '$4096$'],
          answer: 0,
          hint: 'Level $j$ has $a^j$ subproblems.',
          explanation: '$5^4 = 625$. Each has size $n/4^4 = n/256$.',
        },
        {
          id: 'q2',
          kind: 'mcq',
          prompt: 'For $T(n) = 5T(n/4) + 2n$, what is the total work on level $i$?',
          options: ['$(4/5)^i \\cdot 2n$', '$(5/4)^i \\cdot 2n$', '$5^i \\cdot 2n$', '$2n$'],
          answer: 1,
          hint: '$a^i \\cdot 2\\,(n/b^i)$.',
          explanation: '$5^i \\cdot 2n/4^i = (5/4)^i\\,2n$; since the ratio is $>1$ the leaves dominate: $\\Theta(n^{\\log_4 5})$.',
        },
        {
          id: 'q3',
          kind: 'mcq',
          prompt: 'Which is true for $T(n) = 3T(n/81) + 10\\,n^{1/4}$?',
          options: ['$\\Theta(n)$', '$\\Theta(n^{1/4}\\log n)$', '$\\Theta(n^{1/4})$', 'The Master Theorem does not apply.'],
          answer: 1,
          hint: 'What is $b^d = 81^{1/4}$?',
          explanation: '$81^{1/4} = 3 = a$, so $a = b^d$: $\\Theta(n^{1/4}\\log n)$.',
        },
        {
          id: 'q4',
          kind: 'mcq',
          prompt: 'To which recurrence can the Master Theorem be applied **directly**?',
          options: ['$T(n) = T(n/3) + T(2n/3) + n$', '$T(n) = T(n-1) + 1$', '$T(n) = 7T(n/2) + O(n^2)$', '$T(n) = 2T(n/2) + n\\log n$ (basic version)'],
          answer: 2,
          hint: 'Look for same-size subproblems and work of the form $n^d$.',
          explanation: '$a = 7$, $b = 2$, $d = 2$: $7 > 4$ → $O(n^{\\log_2 7}) \\approx O(n^{2.81})$. The others don’t meet the conditions.',
        },
        {
          id: 'q5',
          kind: 'numeric',
          prompt: 'For $T(n) = 2T(n/2) + O(n)$ with $n = 64$, how many levels does the recursion tree have?',
          answer: 7,
          hint: 'The levels are $0, 1, \\dots, \\log_2 n$.',
          explanation: '$\\log_2 64 + 1 = 7$.',
        },
      ],
      practice: [
        {
          id: 'p1',
          prompt: `Our own example: an algorithm splits a problem of size $n$ into **9** subproblems of size $n/3$, and combining takes $O(n^2)$. Write the recurrence, check the Master Theorem’s conditions, and find the result. What changes if combining drops to $O(n)$?`,
          hints: ['$a = 9$, $b = 3$. Compute $b^d$ for both values of $d$.'],
          solution: `$T(n) = 9T(n/3) + O(n^2)$: $a = 9$, $b^d = 3^2 = 9$ → $a = b^d$ → $O(n^2\\log n)$. If combining is $O(n)$ then $b^d = 3 < 9$ → the leaves dominate: $O(n^{\\log_3 9}) = O(n^2)$. Speeding up the combine step only saves the $\\log n$ factor; the bottleneck is now the number of subproblems.`,
        },
        {
          id: 'p2',
          prompt: `Our own example: solve $T(n) = 4T(n/2) + n^2\\sqrt{n}$. Which level(s) dominate?`,
          hints: ['$d = 2.5$.'],
          solution: `$a = 4$, $b^d = 2^{2.5} \\approx 5.66 > 4$ → the root dominates: $O(n^{2.5})$. The level sums decrease with ratio $(4/5.66)^j \\approx 0.71^j$.`,
        },
      ],
      sources: [SRC.l3.pre, SRC.l3.notes, SRC.l3.slides, SRC.l3.concept, SRC.sec.s2, SRC.hw.hw2],
    },
    {
      id: 'l3-substitution',
      lecture: 3,
      title: 'The substitution method',
      titleEn: 'The substitution method',
      summary: 'Guess a bound, verify it by induction — when the Master Theorem doesn’t help.',
      minutes: 40,
      objectives: [
        'List the steps of the substitution method: guess, base case, inductive hypothesis, substitute, simplify, choose the constant.',
        'Prove a linear (or polynomial) bound for recurrences with subproblems of different sizes.',
        'Tell why a guess can fail (wrong bound or wrong form).',
      ],
      prerequisites: ['Strong induction', 'The Master Theorem lesson'],
      sections: [
        {
          kind: 'intuition',
          title: 'Intuition',
          check: [
            {
              id: 'c1',
              kind: 'mcq',
              prompt: 'When is the constant $D$ fixed in the substitution method?',
              options: ['At the very start, chosen at random', 'At the end, from the conditions that come up while writing the proof', 'Separately on every level', 'It is never needed'],
              answer: 1,
              hint: 'First we look at what the step requires.',
              explanation: 'The inductive step gives a condition on $D$ (e.g. $D \\ge 10c$); we combine it with the base case and pick one constant. It cannot change with $n$ or with the level.',
            },
          ],
          label: 'intuition',
          body: `When the recursion tree gets messy (subproblems of different sizes) we **guess** the answer and verify it by induction. The guess has the form $T(n) \\le D\\cdot g(n)$; we don’t know $D$ in advance — we **discover** which condition $D$ must satisfy while writing the proof.`,
        },
        {
          kind: 'formal',
          title: 'The method (Lecture 3–4 notes)',
          check: [
            {
              id: 'c2',
              kind: 'numeric',
              prompt: 'For $T(n) \\le T(n/2) + T(n/4) + n$, $T(1) = 1$, with which smallest $D$ does the inductive step of the guess $T(n) \\le Dn$ work?',
              answer: 4,
              hint: '$\\tfrac{D}{2} + \\tfrac{D}{4} + 1 \\le D$.',
              explanation: '$\\tfrac34 D + 1 \\le D \\iff D \\ge 4$; together with the base $D \\ge 1$, $D = 4$.',
            },
          ],
          box: 'formal',
          label: 'formal',
          body: `For $T(n) \\le f(n) + \\sum_{i=1}^k T(n_i)$, guess $T(n) \\le D\\,g(n)$ ($n \\ge n_0$).

1. **Base:** $D$ can be chosen so that $T(n_0) \\le D\\,g(n_0)$ (e.g. $T(1) = 1 \\le D$).
2. **Hypothesis:** $T(m) \\le D\\,g(m)$ for every $m < n$.
3. **Step:** find $D$ such that $f(n) + \\sum_i D\\,g(n_i) \\le D\\,g(n)$.

First derive the condition on $D$ from the inductive step, then combine it with the base case.`,
        },
        {
          kind: 'viz',
          title: 'Step-by-step substitution',
          tasks: [
            'In the “Original example”, reveal the steps one at a time and try to solve the condition in step 6 yourself before comparing with step 7.',
            'In the “Failed guess: 2T(n/2)+n” example, read the contradiction step. Why is the guess too small?',
            'Enter your own terms: $T(n/2) + T(n/3) + T(n/6) + n$. What is the sum of the ratios? What does the tool say?',
          ],
          viz: 'substitution',
          body: `Pick one of the ready-made examples or enter your own terms. For the guess $T(n) \\le D\\,n^p$ the tool shows every algebraic step and either finds a valid $D$ or explains why the guess fails.`,
        },
        {
          kind: 'steps',
          title: 'Original worked example: $T(n) \\le T(n/3) + T(n/2) + n$',
          label: 'formalProof',
          proof: [
            { title: 'Guess', body: '$T(n) \\le D\\,n$ (linear). Why linear? The subproblem sizes sum to $n/3 + n/2 = 5n/6 < n$: the levels of the tree shrink geometrically.' },
            { title: 'Base', body: 'Holds if $T(1) = 1 \\le D$.' },
            { title: 'Hypothesis', body: '$T(m) \\le D\\,m$ for $m < n$.' },
            { title: 'Substitute', body: '$T(n) \\le D\\frac{n}{3} + D\\frac{n}{2} + n = \\left(\\frac{5}{6}D + 1\\right) n$.' },
            { title: 'Condition', body: '$\\left(\\frac{5}{6}D + 1\\right)n \\le D\\,n \\iff 1 \\le \\frac{D}{6} \\iff D \\ge 6$.' },
            { title: 'Conclusion', body: '$D = \\max(1, 6) = 6$ satisfies both the base and the step: $T(n) \\le 6n$, i.e. $T(n) = O(n)$.' },
          ],
          check: [
            {
              id: 'c5',
              kind: 'numeric',
              prompt: 'Apply the same method to $T(n) \\le T(n/4) + T(n/2) + n$. What is the smallest $D$ for which the step $T(n) \\le D\\,n$ works?',
              answer: 4,
              hint: 'The subproblems add up to $n/4 + n/2 = 3n/4$.',
              explanation: '$D\\frac{n}{4} + D\\frac{n}{2} + n = \\left(\\frac{3}{4}D + 1\\right)n \\le D\\,n \\iff D \\ge 4$. The base case also needs $D \\ge 1$: $D = 4$, so $T(n) \\le 4n$.',
            },
          ],
        },
        {
          kind: 'text',
          title: 'In practice: which method for which recurrence?',
          body: `When you meet a recurrence, it helps to think in this order:

1. **Are all subproblems the same size ($aT(n/b)$)?** Master Theorem; if the work term has a log factor, the general version.
2. **Different sizes, ratios summing to $< 1$?** (e.g. $T(n/5) + T(7n/10)$) Substitution with a linear guess: $D = c/(1 - \\sum)$.
3. **Ratios summing to exactly $1$?** (e.g. $T(n/4) + T(3n/4) + n$) Every level does $\\approx n$ work: guess $n\\log n$ and substitute, or use a recursion tree.
4. **Does the size drop by a constant ($T(n-1)$)?** Unroll the recurrence and sum.
5. **Not sure?** Compute the recurrence numerically with a small program and see whether $T(n)/g(n)$ stays bounded; then prove it.`,
          check: [
            {
              id: 'c3',
              kind: 'mcq',
              prompt: 'Which approach suits $T(n) = T(n/4) + T(3n/4) + n$ best?',
              options: [
                'The Master Theorem',
                'Substitution with $T(n) \\le Dn$',
                'Substitution with the guess $T(n) \\le Dn\\log n$ (or a recursion tree)',
                'Unrolling it like $T(n-1)$',
              ],
              answer: 2,
              hint: '$\\tfrac14 + \\tfrac34 = 1$.',
              explanation: 'The ratios sum to 1, so every full level does $n$ work and there are $\\Theta(\\log n)$ levels: $\\Theta(n\\log n)$. A linear guess needs $\\tfrac{D}{4}n + \\tfrac{3D}{4}n + n \\le Dn$ — impossible.',
            },
          ],
        },
        {
          kind: 'steps',
          title: 'A classic trap: putting Big-O inside the induction',
          label: 'proofIdea',
          proof: [
            { title: 'False claim', body: '“If $T(n) = 2T(n/2) + n$ then $T(n) = O(n)$.” In fact $T(n) = \\Theta(n\\log n)$, so the proof below must contain an error.' },
            { title: 'Fake proof', body: 'Hypothesis: $T(m) = O(m)$ for $m < n$. Then $T(n) = 2\\,O(n/2) + n = O(n) + n = O(n)$.' },
            { title: 'The error', body: 'Every $O$ on these lines hides a different constant. Written with an explicit constant, $T(m) \\le c\\,m$, the step gives $T(n) \\le cn + n = (c + 1)n$: we did not get $T(n) \\le cn$ with the **same** $c$ as in the hypothesis.' },
            { title: 'The constant grows', body: 'The constant goes up by 1 per level: $c, c + 1, c + 2, \\dots$; after $\\log_2 n$ levels it is $c + \\log_2 n$. That is not a constant, and it is exactly the $n\\log n$ we see.' },
            { title: 'The rule', body: 'Always write the induction hypothesis **with an explicit constant** ($T(m) \\le D\\,m$) and get the same $D$ back at the end of the step. Use $O(\\cdot)$ only in the final sentence.' },
          ],
          check: [
            {
              id: 'c4',
              kind: 'mcq',
              prompt: 'For $T(n) = T(n-1) + n$ a student writes “hypothesis $T(n-1) = O(n)$, so $T(n) = O(n) + n = O(n)$”. Which is true?',
              options: [
                'The proof is right: $T(n) = O(n)$',
                'The proof is wrong; in fact $T(n) = \\Theta(n^2)$, and the error is that $O$ hides a different constant at every step',
                'The proof is right but the base case is missing',
                'The proof is wrong; in fact $T(n) = \\Theta(n\\log n)$',
              ],
              answer: 1,
              hint: 'Unroll the recurrence: $n + (n-1) + \\dots$',
              explanation: '$T(n) = n + (n-1) + \\dots + 1 = \\Theta(n^2)$. With an explicit constant: if $T(n-1) \\le c(n-1)$ then $T(n) \\le cn - c + n$, which exceeds $cn$ unless $c \\ge n$; $c$ cannot stay constant.',
            },
          ],
        },
        {
          kind: 'mistakes',
          title: 'Failed guesses (examples from the notes)',
          body: `- **Wrong bound:** for $T(n) = 2T(n/2) + n$, trying $T(n) \\le Dn$ requires $n + Dn \\le Dn$ — impossible. The guess is too small; the right answer is $\\Theta(n\\log n)$.
- **Right bound, wrong form:** for $T(n) \\le 2T(n/2) + 1$, trying $T(n) \\le cn$ requires $cn + 1 \\le cn$ — it fails. But trying $T(n) \\le cn - 1$ gives $2(cn/2 - 1) + 1 = cn - 1$ ✓. Subtracting a lower-order term rescues the induction.
- Changing $D$ step by step (growing it a little on every level): $D$ must be a single constant.`,
        },
      ],
      quiz: [
        {
          id: 'q1',
          kind: 'order',
          prompt: 'Put the steps of the substitution method in order.',
          items: [
            'Guess a bound: $T(n) \\le D\\,g(n)$',
            'Write the base case',
            'Set up the inductive hypothesis (for $m < n$)',
            'Substitute the hypothesis into the recurrence and simplify',
            'Solve for the condition on $D$ and choose $D$',
          ],
          hint: 'Without a guess there is no hypothesis; $D$ is fixed at the end.',
          explanation: 'Guess → base → hypothesis → substitute → choose $D$ (together with the base condition).',
        },
        {
          id: 'q2',
          kind: 'mcq',
          prompt: 'What is the tightest guess for $T(n) = 2T(n/2) + 3T(n/3) + n^2$ that can be proven by induction?',
          options: ['$T(n) \\le 12n$', '$T(n) \\le n^3$', '$T(n) \\le 6n^2$', '$T(n) \\le 2n^2$'],
          answer: 2,
          hint: 'Plug in $T(n) \\le Dn^2$: $2D/4 + 3D/9 + 1 \\le D$.',
          explanation: '$\\frac{D}{2} + \\frac{D}{3} + 1 \\le D \\iff D \\ge 6$. $2n^2$ is too small, $n^3$ is loose, and $12n$ cannot cover the $n^2$ term.',
        },
        {
          id: 'q3',
          kind: 'numeric',
          prompt: 'For Select’s recurrence $T(n) \\le T(n/5) + T(7n/10) + cn$ the guess is $T(n) \\le Dn$. If $c = 3$, what is the smallest $D$ needed?',
          answer: 30,
          hint: '$\\frac{D}{5} + \\frac{7D}{10} + c \\le D$.',
          explanation: '$\\frac{9}{10}D + c \\le D \\iff D \\ge 10c = 30$.',
        },
        {
          id: 'q4',
          kind: 'mcq',
          prompt: 'For $T(n) \\le 2T(n/2) + 1$ the guess $T(n) \\le cn$ fails in the induction. What does this mean?',
          options: [
            '$T(n)$ is not $O(n)$.',
            'The bound may be right, but the form of the guess doesn’t suit the induction; a stronger hypothesis like $cn - 1$ should be tried.',
            'The substitution method never works for this recurrence.',
            'The base case was chosen wrongly.',
          ],
          answer: 1,
          hint: 'Remember the second failed example in the notes.',
          explanation: '$T(n) = O(n)$ is true. The hypothesis $cn - 1$ gives $2(cn/2 - 1) + 1 = cn - 1$ and the induction goes through.',
        },
      ],
      practice: [
        {
          id: 'p1',
          prompt: `Our own example: $T(n) \\le T(n/4) + T(n/2) + T(n/8) + n$, $T(1) = 1$. Show by substitution that $T(n) = O(n)$ and find a suitable $D$.`,
          hints: ['$1/4 + 1/2 + 1/8 = ?$', 'The condition is $D(1 - s) \\ge 1$.'],
          solution: `$s = \\frac14 + \\frac12 + \\frac18 = \\frac78$. Step: $\\frac78 D n + n \\le Dn \\iff D \\ge 8$. Base: $D \\ge 1$. Choose $D = 8$: $T(n) \\le 8n$. (Check by running the tool with these terms.)`,
        },
        {
          id: 'p2',
          prompt: `Our own example: $T(n) = 4T(n/2) + n$, $T(1) = 1$. Why does the guess $T(n) \\le cn^2$ get stuck in the induction? Prove $T(n) = O(n^2)$ by strengthening the hypothesis.`,
          hints: ['Substitute: $4c(n/2)^2 + n = ?$', 'Try $T(n) \\le cn^2 - dn$.'],
          solution: `$4c\\frac{n^2}{4} + n = cn^2 + n > cn^2$: the extra $n$ cannot be absorbed. The stronger hypothesis $T(m) \\le cm^2 - dm$ gives $4\\left(c\\frac{n^2}{4} - d\\frac{n}{2}\\right) + n = cn^2 - 2dn + n \\le cn^2 - dn \\iff d \\ge 1$. Base case $T(1) = 1 \\le c - d$; for example $d = 1$, $c = 2$. So $T(n) \\le 2n^2 - n = O(n^2)$; in fact equality holds when $n$ is a power of two ($T(2) = 6$, $T(4) = 28$). The Master Theorem agrees: $a = 4 > b^d = 2$ gives $\\Theta(n^2)$.`,
        },
      ],
      sources: [SRC.l3.notes, SRC.l3.slides, SRC.l4.notes, SRC.l3.concept, SRC.sec.s2],
    },
  ],
}
