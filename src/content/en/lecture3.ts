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
      minutes: 35,
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
          label: 'intuition',
          body: `In an algorithm of the form $T(n) = a\\,T(n/b) + O(n^d)$ two forces compete:

- **Branching** $a$: the number of subproblems grows by a factor $a$ per level.
- **Shrinking** $b^d$: the non-recursive work of each subproblem drops by a factor $b^d$.

The total work on level $j$ is $c\\,n^d (a/b^d)^j$. If the ratio is $1$, every level does equal work (MergeSort); if it is $<1$ the root dominates; if it is $>1$ the leaves dominate (Karatsuba).`,
        },
        {
          kind: 'formal',
          title: 'The Master Theorem (Lecture 3 notes, Theorem 1)',
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
          viz: 'master',
          body: `In the **Parameters** tab enter $a$, $b$, $d$ separately; in the **Write a recurrence** tab type your own recurrence. The tool checks the conditions, picks the case, shows why, and lists the level sums of the recursion tree. If the conditions fail (different-size subproblems, $T(n-1)$, the log-factor gap case) it does not silently make up an answer; it explains why.`,
        },
        {
          kind: 'correctness',
          title: 'Proof idea: the recursion tree',
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
      minutes: 25,
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
          label: 'intuition',
          body: `When the recursion tree gets messy (subproblems of different sizes) we **guess** the answer and verify it by induction. The guess has the form $T(n) \\le D\\cdot g(n)$; we don’t know $D$ in advance — we **discover** which condition $D$ must satisfy while writing the proof.`,
        },
        {
          kind: 'formal',
          title: 'The method (Lecture 3–4 notes)',
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
      ],
      sources: [SRC.l3.notes, SRC.l3.slides, SRC.l4.notes, SRC.l3.concept, SRC.sec.s2],
    },
  ],
}
