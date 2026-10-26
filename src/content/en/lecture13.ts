import type { Lecture } from '../types'
import { SRC } from '../sources'
import { KNAPSACK01_CODE, LCS_CODE, MWIS_CODE } from '../../engines/dp'

export const lecture13: Lecture = {
  n: 13,
  title: 'More Dynamic Programming: LCS, Knapsack, Independent Set',
  titleEn: 'More Dynamic Programming: LCS, Knapsack, Independent Set',
  date: 'February 23, 2026',
  blurb: 'A recipe for finding the subproblem: prefixes, capacities and subtrees.',
  lessons: [
    {
      id: 'l13-lcs',
      lecture: 13,
      title: 'Longest common subsequence (LCS)',
      titleEn: 'Longest common subsequence (LCS)',
      summary: 'A table of prefixes, one value from three neighbours, and a walk back.',
      minutes: 45,
      objectives: [
        'List the five steps of designing a DP algorithm.',
        'Derive the prefix subproblems for LCS and the recurrence for $C[i, j]$.',
        'Fill the table and recover a common subsequence by tracing back.',
        'Show that the time is $O(mn)$ and the traceback $O(m + n)$.',
      ],
      prerequisites: ['The idea of dynamic programming (Lecture 12)'],
      sections: [
        {
          kind: 'intuition',
          title: 'Intuition: the common skeleton of two sequences',
          label: 'intuition',
          body: `$Z$ is a **subsequence** of $X$ if it can be obtained from $X$ by **deleting** symbols (letters keep their order but need not be adjacent): “baab” is a subsequence of “abracadabra”. The **longest common subsequence** (LCS) of two sequences is the longest sequence that is a subsequence of both. The example in the notes: the LCS of abracadabra and bxqrabry is “brabr”.

Applications: spellchecking, file comparison tools such as \`diff\`, similarity of DNA sequences.

Trying all subsequences is exponential ($2^m$ subsequences). The DP idea: split the problem into **prefixes**. Looking at the last letters of $X$ and $Y$ reduces the problem to shorter prefixes.`,
        },
        {
          kind: 'steps',
          title: 'How to design a DP algorithm (Lecture 13 notes)',
          body: `1. **Identify optimal substructure:** how does an optimal solution split into optimal solutions of subproblems? The subproblems should overlap.
2. **Define the value of an optimum recursively.**
3. **Find the optimal value:** turn the recurrence into an algorithm that fills a table.
4. **Find the optimal solution itself:** keep enough information in the table to trace back.
5. **Tweak the implementation:** memory and time (CS161 goes into this step only a little).`,
        },
        {
          kind: 'formal',
          title: 'The recurrence',
          box: 'formal',
          label: 'formal',
          body: `$C[i, j]$ = the length of the LCS of $X[1..i]$ and $Y[1..j]$.

- **If the last letters are equal** ($x_i = y_j = \\ell$): every LCS ends with $\\ell$ (otherwise $\\ell$ could be appended to it). $C[i, j] = C[i-1, j-1] + 1$.
- **If they differ:** the last letter of the LCS differs from $x_i$ or from $y_j$; one of them cannot be used in the LCS: $C[i, j] = \\max(C[i-1, j],\\ C[i, j-1])$.
- **Base case:** $C[i, 0] = C[0, j] = 0$.

Every cell looks at only three neighbours: above, left, and the upper-left diagonal.`,
          check: [
            {
              id: 'c1',
              kind: 'numeric',
              prompt: 'What is the length of the LCS of “abracadabra” and “bxqrabry”?',
              answer: 5,
              hint: 'The example in the notes: “brabr”.',
              explanation: '“brabr” is a subsequence of both and no longer common subsequence exists: $C[11, 8] = 5$.',
            },
          ],
        },
        {
          kind: 'viz',
          title: 'LCS table visualizer',
          viz: 'lcs',
          tasks: [
            'Fill the table for the default input: what is the last cell $C[7, 6]$?',
            'During the traceback, at which steps do we go diagonally, and at which left or up?',
            'Enter two words of your own (e.g. your first and last name). What is the LCS?',
            'In **prediction mode**, compute some cells in advance.',
          ],
          body: `Rows are the letters of $X$, columns the letters of $Y$. The yellow cell is being computed, the blue cell is the neighbour it uses. Once the table is full, we walk back from $C[m, n]$; the green cells are the traceback path.`,
          check: [
            {
              id: 'c2',
              kind: 'numeric',
              prompt: 'For X = ABCBDAB and Y = BDCABA, what is the length of the LCS?',
              answer: 4,
              hint: 'The default input of the visualizer.',
              explanation: '$C[7, 6] = 4$; for example BCBA and BDAB are both common subsequences of length 4. The LCS need not be unique.',
            },
          ],
        },
        {
          kind: 'pseudocode',
          title: 'lenLCS and the traceback (notes, Algorithms 1–2)',
          code: LCS_CODE,
          body: `Traceback: if $X[i] = Y[j]$, prepend the letter and go diagonally; otherwise go in the direction the table says (where the value came from). At every step $i + j$ drops by at least 1.`,
        },
        {
          kind: 'complexity',
          title: 'Running time',
          body: `The table has $(m + 1)(n + 1)$ cells, each $O(1)$: **$O(mn)$**. The traceback is $O(m + n)$. If only the length is needed, two rows suffice: $O(\\min(m, n))$ memory.

This simple algorithm is the best known: improving $O(mn)$ by a polynomial factor would refute an important complexity assumption (the strong exponential time hypothesis for SAT).`,
        },
        {
          kind: 'text',
          title: 'In practice: diff and DNA',
          body: `- **\`diff\` and version control:** the longest common subsequence of the lines of two files is found; lines not in it are shown as “deleted/added”. The algorithms used by Git (Myers) solve the same problem a different way, very fast when there are few changes.
- **Bioinformatics:** aligning DNA and protein sequences (Needleman–Wunsch, Smith–Waterman) uses the same table structure with scores.
- **Edit distance:** how many insertions/deletions/substitutions turn “book” into “bookshelf”? Almost the same table; spelling suggestions work this way.`,
          check: [
            {
              id: 'c3',
              kind: 'mcq',
              prompt: 'Two files have 10 000 and 12 000 lines. About how many cells does the LCS table contain?',
              options: ['$2.2 \\cdot 10^4$', '$1.2 \\cdot 10^8$', '$10^{12}$', '$2^{10000}$'],
              answer: 1,
              hint: '$(m + 1)(n + 1)$.',
              explanation: '$\\approx 1.2 \\cdot 10^8$ cells: fast, but costly to keep in memory. That is why real tools use algorithms specialized for the case where the difference is small.',
            },
          ],
        },
        {
          kind: 'steps',
          title: 'Worked example: a related problem, edit distance',
          label: 'formal',
          body: `The same design recipe (subproblems, recurrence, table) applies to other sequence problems. **Edit distance** (Levenshtein): the fewest insertions, deletions and substitutions that turn $X$ into $Y$. Spell checkers find their “did you mean…?” suggestions this way.`,
          proof: [
            { title: 'Subproblem', body: '$E[i][j]$: the cost of turning the first $i$ letters of $X$ into the first $j$ letters of $Y$. Base: $E[i][0] = i$ ($i$ deletions), $E[0][j] = j$ ($j$ insertions).' },
            { title: 'Recurrence', body: 'If the last letters agree, $E[i][j] = E[i-1][j-1]$. Otherwise the cheapest of three options: $1 + \\min(E[i-1][j]$ (delete), $E[i][j-1]$ (insert), $E[i-1][j-1]$ (substitute)$)$. Almost the same “two cases” as in LCS.' },
            { title: 'Example', body: 'SUNDAY → SATURDAY: S stays; A and T are inserted; U stays; N is replaced by R; D, A, Y stay. 3 operations in total, and fewer is impossible: the bottom-right cell of the table is 3.' },
            { title: 'Time', body: 'Again $(m + 1)(n + 1)$ cells at $O(1)$ each: $O(mn)$. Tracing back gives the list of operations.' },
          ],
          check: [
            {
              id: 'c4',
              kind: 'numeric',
              prompt: 'What is the edit distance between CAT and CUT?',
              answer: 1,
              hint: 'Which letters differ?',
              explanation: 'Only the middle letter differs: A → U, a single substitution.',
            },
          ],
        },
        {
          kind: 'mistakes',
          title: 'Common mistakes',
          body: `- Confusing a subsequence with a **substring** (contiguous).
- Continuing from $C[i-1, j-1]$ when the letters differ: the right value is the larger of the upper and left neighbours.
- Trying to trace back from the start ($i = 1$): the table is read from the end backwards.
- Assuming the LCS is unique: several LCSs of the same length may exist; the tie rule in the traceback decides which one is found.`,
        },
      ],
      quiz: [
        {
          id: 'q1',
          kind: 'mcq',
          prompt: 'How is $C[i, j]$ computed when $x_i \\ne y_j$?',
          options: ['$C[i-1, j-1] + 1$', '$\\max(C[i-1, j], C[i, j-1])$', '$C[i-1, j-1]$', '$\\min(C[i-1, j], C[i, j-1])$'],
          answer: 1,
          hint: 'One of the last letters cannot be used in the LCS.',
          explanation: 'Either $x_i$ or $y_j$ is dropped; whichever gives the longer LCS is chosen.',
        },
        {
          id: 'q2',
          kind: 'numeric',
          prompt: 'What is the length of the LCS of the words “algorithm” and “logarithm”?',
          answer: 7,
          hint: 'Both end in “…rithm”.',
          explanation: 'For example “lgrithm” or “lorithm”: 7 letters. You can check it by entering “algorithm” and “logarithm” in the visualizer.',
        },
        {
          id: 'q3',
          kind: 'mcq',
          prompt: 'How long does filling the LCS table take ($|X| = m$, $|Y| = n$)?',
          options: ['$O(m + n)$', '$O(mn)$', '$O(2^{m})$', '$O(mn \\log n)$'],
          answer: 1,
          hint: 'Number of cells × work per cell.',
          explanation: '$(m+1)(n+1)$ cells, each looks at three neighbours: $O(mn)$.',
          feedback: { 2: 'That is the time of trying every subsequence one by one.' },
        },
        {
          id: 'q4',
          kind: 'mcq',
          prompt: 'If $X$ has length 0, what is the length of the LCS?',
          options: ['0', '$|Y|$', '1', 'Undefined'],
          answer: 0,
          hint: 'The base case.',
          explanation: 'The LCS of the empty sequence with anything is empty: $C[0, j] = 0$.',
        },
      ],
      practice: [
        {
          id: 'p1',
          prompt: `Our own example: X = “KARTAL”, Y = “KATAR”. Fill the LCS table and find an LCS by tracing back.`,
          hints: ['The first row (K) and the first column (K) start with a match.', 'The answer has length 4.'],
          solution: `Rows K, A, R, T, A, L; columns K, A, T, A, R. The last cell of the table is $C[6, 5] = 4$. The traceback gives “KATA”: letters 1, 2, 4, 5 of X and letters 1, 2, 3, 4 of Y. “KAR” is a common subsequence too, but it cannot be extended: in X only T, A, L follow the R, while in Y the R is the last letter. Check it in the visualizer with X = KARTAL, Y = KATAR.`,
        },
        {
          id: 'p2',
          prompt: `Our own example: if only **insertions and deletions** are allowed (no substitutions), how many operations does it take to turn SUNDAY into SATURDAY? How do you compute this with LCS?`,
          hints: ['The letters of an LCS stay in place; every other letter is deleted or inserted.', 'LCS(SUNDAY, SATURDAY) = SUDAY.'],
          solution: `The letters of the LCS stay untouched; the remaining letters of $X$ are deleted and the remaining letters of $Y$ are inserted. The number of operations is $|X| + |Y| - 2\\,|LCS|$. LCS = SUDAY (length 5): $6 + 8 - 10 = 4$ operations (delete N; insert A, T, R). With substitutions allowed, one delete + insert pair (N → R) becomes a single operation and the edit distance is 3. The Unix diff tool uses exactly this insert/delete version.`,
        },
      ],
      sources: [SRC.l13.notes, SRC.l13.slides, SRC.l13.concept],
    },
    {
      id: 'l13-knapsack',
      lecture: 13,
      title: 'Knapsack and independent set in a tree',
      titleEn: 'Knapsack and independent set in a tree',
      summary: 'Subproblems by capacity, “take it or leave it”, and two values per subtree.',
      minutes: 50,
      objectives: [
        'Write the subproblems and recurrences of unbounded and 0/1 knapsack.',
        'Explain why 0/1 knapsack needs a second dimension (the number of items).',
        'Explain why $O(nW)$ is “pseudo-polynomial”.',
        'Find a maximum-weight independent set in a tree in linear time with the values $A(u)$ and $B(u)$.',
      ],
      prerequisites: ['LCS and the DP recipe'],
      sections: [
        {
          kind: 'intuition',
          title: 'Intuition: which items do we take?',
          label: 'intuition',
          body: `Each of $n$ items has a weight $w_i$ and a value $v_i$; the knapsack holds at most $W$. We want the largest total value. The example in the notes ($W = 10$): A (6, 25), B (3, 13), C (4, 15), D (2, 8).

- **Unbounded knapsack:** as many copies of each item as we like. The best is 2 B + 2 D: weight 10, value 42.
- **0/1 knapsack:** at most one of each item. The best is A + C: weight 10, value 40.

The greedy rule “take the best value/weight ratio first” can be wrong here (see the second example in the visualizer); DP is always right.`,
        },
        {
          kind: 'formal',
          title: 'Recurrences',
          box: 'formal',
          label: 'formal',
          body: `**Unbounded:** $K(x)$ = the best value of a knapsack of capacity $x$. If the best knapsack contains item $i$, the rest is the best for capacity $x - w_i$:
$$K(x) = \\max_{i:\\ w_i \\le x} \\big(K(x - w_i) + v_i\\big),\\quad K(0) = 0.$$

**0/1:** since each item can now be used once, we must also remember “which items are still available?”. $K(x, j)$ = capacity $x$, only the first $j$ items:
$$K(x, j) = \\max\\big(K(x, j-1),\\ K(x - w_j, j-1) + v_j\\big)$$
(the second option only when $w_j \\le x$). The first term is “skip $j$”, the second “take $j$”.`,
          check: [
            {
              id: 'c1',
              kind: 'numeric',
              prompt: 'With the notes’ items ($W = 10$), what is the best value of the **unbounded** knapsack?',
              answer: 42,
              hint: 'B and D have high value/weight ratios.',
              explanation: '2 B + 2 D: $2 \\cdot 13 + 2 \\cdot 8 = 42$, weight $6 + 4 = 10$. The best for the 0/1 version with the same items is 40 (A + C).',
            },
          ],
        },
        {
          kind: 'viz',
          title: 'Knapsack table visualizer',
          viz: 'knapsack',
          tasks: [
            'Fill the notes’ example in the 0/1 version. In which row does the value jump from 25 to 40?',
            'Switch to the unbounded version: what is $K[10]$? Which $K[x]$ values does it come from?',
            'In the “Ratio-greedy fails” example, what does taking the best-ratio item (P) give, and what does DP find?',
          ],
          body: `In the 0/1 version rows are “the first $j$ items” and columns are capacities $x$. The yellow cell is being computed; the blue cells are the ones read by the “skip” option (directly above) and the “take” option (one row up, $w_j$ to the left). At the end the green path shows which items were taken.`,
          check: [
            {
              id: 'c2',
              kind: 'numeric',
              prompt: 'In the “Ratio-greedy fails” example (W = 8; P: 5 kg, 10; Q: 4 kg, 7; R: 4 kg, 7), what is the best value of the 0/1 knapsack?',
              answer: 14,
              hint: 'Taking P leaves 3 kg.',
              explanation: 'Q + R: 8 kg, value 14. Taking P, the best ratio (2.0), gives only 10.',
            },
          ],
        },
        {
          kind: 'pseudocode',
          title: 'ZeroOneKnapsack (notes, Algorithm 4)',
          code: KNAPSACK01_CODE,
          body: `The table has $(W + 1)(n + 1)$ cells, each $O(1)$: **$O(nW)$**. The chosen items are found by tracing back: if $K(x, j) \\ne K(x, j - 1)$, item $j$ was taken and $x$ drops by $w_j$.`,
        },
        {
          kind: 'complexity',
          title: 'Pseudo-polynomial time',
          body: `$O(nW)$ looks polynomial, but the input size does not contain $W$ itself — only the $\\log W$ bits needed to write it down. If $W = 2^{60}$, the table is unusable. Such algorithms are called **pseudo-polynomial**.

Knapsack is NP-hard: a truly polynomial algorithm would also solve many famous problems in polynomial time. In practice, when $W$ is small, DP works perfectly well.`,
          check: [
            {
              id: 'c3',
              kind: 'mcq',
              prompt: 'Why isn’t the $O(nW)$ knapsack algorithm considered “polynomial”?',
              options: [
                'Because $n$ can be very large.',
                'Because the input size depends on $\\log W$; $W$ is exponential in its number of bits.',
                'Because the algorithm can give a wrong answer.',
                'Because filling a table is always exponential.',
              ],
              answer: 1,
              hint: 'How many bits does it take to write the number $W$?',
              explanation: '$W$ is written with about $\\log_2 W$ bits; since $W = 2^{\\text{bits}}$, the time can be exponential in the length of the input.',
            },
          ],
        },
        {
          kind: 'formal',
          title: 'Maximum-weight independent set in a tree',
          box: 'formal',
          label: 'formal',
          body: `A set $S \\subseteq V$ is **independent** if no edge joins two of its nodes. Finding an independent set of largest total weight is NP-hard in general graphs, but in **trees** it is solved in linear time.

Root the tree at a node $r$; $T_u$ is the subtree of $u$. Keep two values:

- $A(u)$ = the heaviest independent set in $T_u$,
- $B(u)$ = the heaviest independent set in $T_u \\setminus \\{u\\}$ = $\\sum_{v \\text{ child}} A(v)$.

If $u$ is not in the set, the children are free: $\\sum A(v)$. If $u$ is in the set, its children cannot be: $w_u + \\sum B(v)$. So
$$A(u) = \\max\\Big(\\sum_{v} A(v),\\ w_u + \\sum_{v} B(v)\\Big).$$
Values are computed from the leaves up (post-order); the answer is $A(r)$.`,
        },
        {
          kind: 'viz',
          title: 'Independent set visualizer',
          viz: 'mwis',
          tasks: [
            'Follow the $A$ and $B$ values of each node from the leaves to the root.',
            'At the root, does “take $a$” or “leave $a$” win? Why?',
            'In **prediction mode**, compute the $A$ value of the internal nodes in advance.',
          ],
          body: `The number inside a node is its weight; under every processed node its $A$ and $B$ are shown. At the end the green nodes form the set found.`,
          check: [
            {
              id: 'c4',
              kind: 'numeric',
              prompt: 'What is the weight of the heaviest independent set in the visualizer’s tree?',
              answer: 25,
              hint: 'At the root: $\\max(\\sum A, 5 + \\sum B)$.',
              explanation: '$A(a) = \\max(11 + 2 + 9,\\ 5 + 11 + 0 + 9) = 25$: the set $\\{a, e, i, g, h\\}$.',
            },
          ],
        },
        {
          kind: 'pseudocode',
          title: 'MaxWeightIndependentSet (notes, Algorithm 5)',
          code: MWIS_CODE,
          body: `Every node is processed once and sums its children’s values; every edge is counted once: **$O(|V|)$**.`,
        },
        {
          kind: 'steps',
          title: 'Worked example: why greedy is not enough',
          label: 'formal',
          body: `The first rule that comes to mind: start with the item of highest value per weight. Our own example: capacity $W = 10$; A (weight 6, value 30), B (5, 20), C (5, 20).`,
          proof: [
            { title: 'Greedy', body: 'Ratios: A 5, B 4, C 4. A is taken first (weight 6); in the remaining 4 units neither B nor C fits. Value: 30.' },
            { title: 'Optimal', body: 'Skipping A and taking B and C gives weight exactly 10 and value 40. The greedy choice (A) is in no optimal solution: the exchange argument fails here.' },
            { title: 'Why DP saves us', body: '$K[i][x]$ keeps the best value for every capacity $x$ and tries both options, “take A” and “skip A”. The table finds $K[3][10] = 40$.' },
            { title: 'The fractional version', body: 'If items could be split (powder, liquid), the greedy rule would be optimal: all of A and 4/5 of B, value $30 + 16 = 46$. The integrality constraint is what makes the problem hard.' },
          ],
          check: [
            {
              id: 'c5',
              kind: 'numeric',
              prompt: 'In this example (W = 10; A 6/30, B 5/20, C 5/20), what is the optimal 0/1 knapsack value?',
              answer: 40,
              hint: 'Try the options without A too.',
              explanation: 'B + C: weight 10, value 40. With A at most 30 (A + B or A + C exceeds the capacity).',
            },
          ],
        },
        {
          kind: 'mistakes',
          title: 'Common mistakes',
          body: `- Trying to solve 0/1 knapsack with a one-dimensional $K(x)$: the same item gets counted several times.
- Trusting the greedy ratio rule (it is right for the fractional knapsack, not for 0/1).
- In the independent set, forgetting to use $B(v)$ when $u$ is taken: $B$ saves us from solving the grandchild subproblems separately.
- Taking $O(nW)$ for a truly polynomial time.`,
        },
      ],
      quiz: [
        {
          id: 'q1',
          kind: 'numeric',
          prompt: 'With the notes’ items ($W = 10$), what is the best value of the **0/1** knapsack?',
          answer: 40,
          hint: 'A and C weigh 10 together.',
          explanation: 'A + C: 25 + 15 = 40. B + C + D (9 kg) gives only 36.',
        },
        {
          id: 'q2',
          kind: 'mcq',
          prompt: 'In 0/1 knapsack, which cell does the “take” option of $K(x, j)$ read?',
          options: ['$K(x - w_j, j)$', '$K(x - w_j, j - 1)$', '$K(x, j - 1)$', '$K(x - 1, j)$'],
          answer: 1,
          hint: 'If item $j$ was taken, which items can the rest be?',
          explanation: '$j$ was used once; the remaining capacity $x - w_j$ is filled with the first $j - 1$ items only. $K(x - w_j, j)$ is how the unbounded version behaves.',
        },
        {
          id: 'q3',
          kind: 'mcq',
          prompt: 'What is the running time of the maximum-weight independent set algorithm on a tree?',
          options: ['$O(|V|)$', '$O(|V|\\log|V|)$', '$O(|V|^2)$', '$O(2^{|V|})$'],
          answer: 0,
          hint: 'Each node once.',
          explanation: 'A post-order traversal; at each node, work proportional to its number of children: $O(|V|)$ in total.',
          feedback: { 3: 'That is the time of trying every subset; the tree structure allows DP.' },
        },
        {
          id: 'q4',
          kind: 'numeric',
          prompt: 'In a path graph (a chain) of 4 nodes with weights 4, 1, 1, 4 in order, what is the weight of the heaviest independent set?',
          answer: 8,
          hint: 'The two end nodes are not adjacent.',
          explanation: 'The ends $\\{1, 4\\}$: $4 + 4 = 8$. Greedy “take the heaviest” works here, but examples like 1, 3, 3, 1 need care.',
        },
      ],
      practice: [
        {
          id: 'p1',
          prompt: `Our own example: W = 7 and items X (3 kg, 9), Y (4 kg, 11), Z (2 kg, 5). Find the best value and the choice for both the 0/1 and the unbounded knapsack.`,
          hints: ['0/1: X + Y is exactly 7 kg.', 'Unbounded: X + X + ? or X + Z + Z?'],
          solution: `**0/1:** X + Y = 7 kg, value 20 (X + Z = 14, Y + Z = 16). **Unbounded:** $K(2) = 5$, $K(3) = 9$, $K(4) = 11$, $K(5) = 14$, $K(6) = 18$ (X + X) and $K(7) = \\max(K(4) + 9,\\ K(3) + 11,\\ K(5) + 5) = \\max(20, 20, 19) = 20$, i.e. X + Y again. Taking copies does not help here.`,
        },
        {
          id: 'p2',
          prompt: `Our own example: the same items (A 6/30, B 5/20, C 5/20), but now each item is available in **unlimited** quantity, $W = 10$. What is the optimal value? What if $W = 11$?`,
          hints: ['The recurrence of the unbounded version: $K[x] = \\max_i (K[x - w_i] + v_i)$.', 'Can you take two copies of B?'],
          solution: `$W = 10$: B twice (weight 10, value 40) or B + C, again 40; with A at most 30 (only 4 units remain after A). Optimal: 40. $W = 11$: A + B (weight 11, value 50) is best; two Bs give 40, one A gives 30. The table: $K[x] = 0$ ($x < 5$), $20$ ($5 \\le x < 6$), $30$ ($6 \\le x < 10$), $40$ ($x = 10$), $50$ ($x = 11$). Increasing the capacity by one unit can change the optimal solution completely; a greedy rule cannot capture that.`,
        },
      ],
      sources: [SRC.l13.notes, SRC.l13.slides, SRC.l13.concept],
    },
  ],
}
