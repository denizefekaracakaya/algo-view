import type { Lecture } from '../types'
import { SRC } from '../sources'
import { BELLMAN_FORD_CODE, FLOYD_CODE } from '../../engines/shortestPaths'

export const lecture12: Lecture = {
  n: 12,
  title: 'Dynamic Programming: Bellman-Ford and Floyd-Warshall',
  titleEn: 'Dynamic Programming: Bellman-Ford and Floyd-Warshall',
  date: 'February 18, 2026',
  blurb: 'Storing the answers to small subproblems in a table: shortest paths with negative edges and all-pairs shortest paths.',
  lessons: [
    {
      id: 'l12-bellman-ford',
      lecture: 12,
      title: 'Bellman–Ford and the idea of dynamic programming',
      titleEn: 'Bellman–Ford and the idea of dynamic programming',
      summary: '$d^{(k)}[v]$: the shortest path with at most $k$ edges. Filling the table row by row.',
      minutes: 45,
      objectives: [
        'Explain the meaning of $d^{(k)}[v]$ and the recurrence $d^{(k)}[v] = \\min_u (d^{(k-1)}[u] + w(u, v))$.',
        'Show why Bellman–Ford makes $n - 1$ rounds and how it detects a negative cycle.',
        'Recognize the two conditions of dynamic programming (optimal substructure, overlapping subproblems).',
        'Tell bottom-up and top-down (memoization) implementations apart.',
      ],
      prerequisites: ['Dijkstra (Lecture 11)', 'Induction'],
      sections: [
        {
          kind: 'intuition',
          title: 'Intuition: raising the edge budget one at a time',
          label: 'intuition',
          body: `Dijkstra went wrong with negative edges because it finalized a node too early, believing “nothing shorter exists”. Bellman–Ford never finalizes anything early; instead it makes the question smaller:

> What is the cheapest way from $s$ to $v$ using at most $k$ edges?

For $k = 0$ the answer is obvious: only $s$ itself (cost 0). A best path with $k$ edges whose last edge is $(u, v)$ is **a best path with at most $k - 1$ edges plus one edge**. So each row is computed from the previous one. Without negative cycles shortest paths are simple (no repeated node) and have at most $n - 1$ edges: $n - 1$ rows suffice.`,
        },
        {
          kind: 'pseudocode',
          title: 'Bellman–Ford (Lecture 12 notes, Algorithm 1)',
          code: BELLMAN_FORD_CODE,
          body: `$d^{(k)}[v]$: the cost of a shortest path from $s$ to $v$ with **at most $k$ edges**. Each row depends only on the previous one, so keeping two rows in memory is enough. The last loop tries one more round: if some edge still improves, there is a reachable negative cycle.`,
          check: [
            {
              id: 'c1',
              kind: 'numeric',
              prompt: 'In the visualizer’s “Non-negative weights” graph, what is $d^{(1)}[a]$? (The direct edge $s \\to a$ weighs 4, while $s \\to b \\to a$ costs $1 + 2$.)',
              answer: 4,
              hint: '$k = 1$: single-edge paths only.',
              explanation: 'With one edge, $a$ is reached only by $s \\to a$ (4). $d^{(2)}[a] = 3$, because the two-edge path $s \\to b \\to a$ now counts.',
            },
          ],
        },
        {
          kind: 'viz',
          title: 'Bellman–Ford visualizer',
          viz: 'bellmanFord',
          tasks: [
            'Fill the table row by row for the “Non-negative weights” graph. After which round does no value change any more?',
            'On the “One negative edge” graph, is the final value of $t$ Dijkstra’s 3 or 2?',
            'Switch to the “Negative cycle” graph: which edge still improves in the final check?',
          ],
          body: `The table $d^{(k)}[v]$ grows at the bottom: row $k$ holds the best values reachable with paths of at most $k$ edges. Yellow cells improved in that round. The graph above shows each node’s current value and the edge being examined.`,
        },
        {
          kind: 'correctness',
          title: 'Correctness (Lecture 11 notes, Claims 3 and 4)',
          label: 'formalProof',
          proof: [
            { title: 'Hypothesis', body: '$d^{(k)}[v]$ is the smallest cost of an $s \\to v$ path with at most $k$ edges. Base case $k = 0$: $d^{(0)}[s] = 0$, all others $\\infty$.' },
            { title: 'Step', body: 'Let $P$ be a cheapest $s \\to v$ path with at most $k$ edges and $u$ the node before $v$. The $s \\to u$ part of $P$ has at most $k - 1$ edges and by the hypothesis costs $\\ge d^{(k-1)}[u]$. In round $k$, $d^{(k)}[v] \\le d^{(k-1)}[u] + w(u, v) \\le w(P)$. Since the algorithm only writes values of real paths, the inequality is an equality.' },
            { title: 'n − 1 rounds suffice', body: 'Without negative cycles, any cycle on a shortest path can be removed (a positive one shortens the path, a zero one does not change it): shortest paths are simple and have at most $n - 1$ edges. So $d^{(n-1)}[v] = d(s, v)$.' },
            { title: 'A negative cycle is detected', body: 'Let $v_1 \\to \\dots \\to v_k \\to v_1$ be a reachable negative cycle and suppose the final check finds nothing: $d[v_{i+1}] \\le d[v_i] + w(v_i, v_{i+1})$ for every $i$. Summing around the cycle, the $d$ terms cancel and $0 \\le \\sum w(v_i, v_{i+1})$ — contradicting that the cycle is negative.' },
          ],
        },
        {
          kind: 'formal',
          title: 'The dynamic programming recipe',
          box: 'info',
          label: 'formal',
          body: `A problem suits dynamic programming thanks to two properties:

- **Optimal substructure:** an optimal solution is built from optimal solutions to smaller subproblems. (Every piece of a shortest path is a shortest path.)
- **Overlapping subproblems:** the same subproblem is needed again and again; if we store its answer in a **table**, each one is computed only once. (In divide and conquer the subproblems are independent, each solved once.)

The two implementations are equivalent: **bottom-up** (fill the table in some order, starting from the small subproblems) and **top-down** (write it recursively, store every result in the table and read it from there when needed again — memoization).

About the name: “programming” here means a **plan**, not a computer program; Richard Bellman recalled choosing the name to hide his work from an official who disliked research.`,
          check: [
            {
              id: 'c2',
              kind: 'mcq',
              prompt: 'What would happen if Bellman–Ford’s recurrence were written directly as a recursive function (without a table)?',
              options: [
                'The same value $d^{(k-1)}[u]$ would be recomputed for every edge; the time could be exponential.',
                'The result would be wrong.',
                'It would run faster.',
                'It would not work with negative edges.',
              ],
              answer: 0,
              hint: 'Overlapping subproblems.',
              explanation: 'Each $d^{(k)}[v]$ calls many $d^{(k-1)}[u]$, which call the same subproblems again. The table makes sure every subproblem is solved once: $O(nm)$ in total.',
            },
          ],
        },
        {
          kind: 'complexity',
          title: 'Running time and memory',
          body: `$n - 1$ rounds, $m$ edges per round: **$O(nm)$**. The final check is $O(m)$. It is slower than Dijkstra but works with negative edges, detects negative cycles and is very simple to implement.

Memory: although the table is $n \\times n$, only the last two rows are needed: $O(n)$. If a round changes no value, the algorithm can stop early.`,
        },
        {
          kind: 'text',
          title: 'In practice: where is Bellman–Ford used?',
          body: `- **Distance-vector routing (RIP):** every router updates its table using only the distance tables of its neighbors — a distributed Bellman–Ford. No central map is needed; when an edge weight changes, local updates spread.
- **Arbitrage detection:** with exchange rates $r$ and weights $-\\log r$, a negative cycle is a currency loop that returns more money than you started with.
- **Constraint systems:** a system of inequalities of the form $x_j - x_i \\le c$ is solvable exactly when a certain graph has no negative cycle.`,
        },
        {
          kind: 'mistakes',
          title: 'Common mistakes',
          body: `- Thinking $n$ or $m$ rounds are needed instead of $n - 1$: a simple path has at most $n - 1$ edges.
- Confusing a negative cycle with a negative edge: negative edges are fine, reachable negative cycles make shortest paths undefined.
- Expecting a negative cycle unreachable from $s$ to be detected: the values there stay $\\infty$, the check does not catch it (and it does not affect the results).
- Thinking dynamic programming is just “recursion + a table”: first the subproblem and the recurrence must be defined correctly.`,
        },
      ],
      quiz: [
        {
          id: 'q1',
          kind: 'mcq',
          prompt: 'What is Bellman–Ford’s running time?',
          options: ['$O(n + m)$', '$O(m \\log n)$', '$O(nm)$', '$O(n^3)$'],
          answer: 2,
          hint: 'How many rounds, how many edges per round?',
          explanation: '$n - 1$ rounds × $m$ edges = $O(nm)$.',
        },
        {
          id: 'q2',
          kind: 'mcq',
          prompt: 'In the final check, an edge $(u, v)$ still has $d[v] > d[u] + w(u, v)$. What follows?',
          options: ['One more round is needed.', 'There is a negative cycle reachable from $s$.', '$v$ is unreachable from $s$.', 'The graph is undirected.'],
          answer: 1,
          hint: 'Claim 3.',
          explanation: 'Without a negative cycle, after $n - 1$ rounds all values are correct and no edge can improve. An improvement means a negative cycle.',
        },
        {
          id: 'q3',
          kind: 'mcq',
          prompt: 'Which property distinguishes dynamic programming from divide and conquer?',
          options: ['Using recursion', 'Subproblems overlap, and each is solved once and stored', 'Using randomness', 'Always taking $O(n^2)$ time'],
          answer: 1,
          hint: 'Do MergeSort’s subproblems ever repeat?',
          explanation: 'Divide and conquer solves independent subproblems once each; in DP the same subproblems are needed repeatedly and the table removes the repetition.',
        },
        {
          id: 'q4',
          kind: 'numeric',
          prompt: 'If a graph with 5 nodes has no negative cycle, at most how many rounds does the main loop of Bellman–Ford make?',
          answer: 4,
          hint: 'At most how many edges does a simple path have?',
          explanation: '$n - 1 = 4$. Any longer path repeats a node and, without negative cycles, is not shorter.',
        },
      ],
      practice: [
        {
          id: 'p1',
          prompt: `Our own example: nodes $s, a, b, c$ and edges s→a (4), s→b (3), a→b (−2), b→c (2), a→c (5). Processing the edges in this order, write the rows $d^{(0)}, d^{(1)}, d^{(2)}, d^{(3)}$. What would Dijkstra find for $b$ and $c$ on this graph?`,
          hints: ['$d^{(1)}$: only the edges leaving $s$.', '$d^{(2)}[b] = \\min(3, d^{(1)}[a] - 2)$.'],
          solution: `$d^{(0)} = (s{:}\\,0, a{:}\\,\\infty, b{:}\\,\\infty, c{:}\\,\\infty)$. $d^{(1)} = (0, 4, 3, \\infty)$. $d^{(2)}$: $b = \\min(3, 4 - 2) = 2$, $c = \\min(\\infty, 3 + 2, 4 + 5) = 5$ → $(0, 4, 2, 5)$. $d^{(3)}$: $c = \\min(5, 2 + 2) = 4$ → $(0, 4, 2, 4)$. The final check finds no improvement: no negative cycle. Dijkstra first finalizes $b$ with 3 and sets $c = 5$; when $a$ is processed next, $b$’s value drops to 2, but since $b$ is already finished, $c$ is not relaxed again: $c$ stays 5 (the right answer is 4).`,
        },
      ],
      sources: [SRC.l12.notes, SRC.l12.slides, SRC.l12.pre, SRC.l11.notes, SRC.l12.notebook, SRC.l12.concept],
    },
    {
      id: 'l12-floyd',
      lecture: 12,
      title: 'Floyd–Warshall: all-pairs shortest paths',
      titleEn: 'Floyd–Warshall: all-pairs shortest paths',
      summary: '$d_k(u, v)$: the shortest path whose intermediate nodes are in $\\{1, \\dots, k\\}$. $O(n^3)$, three nested loops.',
      minutes: 35,
      objectives: [
        'State the all-pairs shortest paths (APSP) problem.',
        'Explain the two cases of the recurrence $d_k(u, v) = \\min(d_{k-1}(u, v),\\ d_{k-1}(u, k) + d_{k-1}(k, v))$.',
        'Detect a negative cycle from negative values on the diagonal.',
        'Compare Floyd–Warshall with running Dijkstra $n$ times.',
      ],
      prerequisites: ['Bellman–Ford and dynamic programming'],
      sections: [
        {
          kind: 'intuition',
          title: 'Intuition: opening up intermediate stops one at a time',
          label: 'intuition',
          body: `Now we want the shortest path between **every** pair of nodes. Number the nodes $1, \\dots, n$ and ask a restricted question:

> What is the cheapest way from $u$ to $v$ using only the nodes $\\{1, \\dots, k\\}$ as **intermediate stops**?

At $k = 0$ there are no intermediate stops: direct edges only. At each step one more node is “allowed as a stop”. Opening $k$ can bring two things: the best path does not use $k$ (the old value stays), or it does — then the path splits into $u \\to k$ and $k \\to v$, and both parts have their intermediate stops in $\\{1, \\dots, k - 1\\}$.`,
        },
        {
          kind: 'pseudocode',
          title: 'Floyd–Warshall (notes, Algorithm 2)',
          code: FLOYD_CODE,
          body: `In round $k$, $d_k(u, v)$ is the weight of a shortest $u \\to v$ path with intermediate nodes in $\\{1, \\dots, k\\}$. **Case 1:** the path goes through $k$ → $d_{k-1}(u, k) + d_{k-1}(k, v)$. **Case 2:** it does not → $d_{k-1}(u, v)$. Without negative cycles shortest paths are simple, so $k$ appears at most once on the path.`,
          check: [
            {
              id: 'c1',
              kind: 'numeric',
              prompt: 'In the visualizer’s graph (1→2: 3, 2→3: 2, 3→4: 1, 4→1: 5, 1→3: 8, 4→2: −1), what is $d(1, 3)$ when Floyd–Warshall finishes?',
              answer: 5,
              hint: 'The direct edge is 8; what about via 2?',
              explanation: '$1 \\to 2 \\to 3 = 3 + 2 = 5 < 8$. This value is found in round $k = 2$.',
            },
          ],
        },
        {
          kind: 'viz',
          title: 'Floyd–Warshall visualizer',
          viz: 'floyd',
          tasks: [
            'Watch which cells improve in each round (purple $k$). Why are only row and column $k$ used?',
            'In which round, and why, does $d(3, 2)$ drop to 0?',
            'Look at the diagonal of the final matrix: is there a negative cycle?',
          ],
          body: `The matrix $d_k$ is below, the graph above. The purple node is the $k$ opened as an intermediate stop in that round. Blue cells are row and column $k$: new values are computed from them only. A yellow cell is an improved value.`,
          check: [
            {
              id: 'c2',
              kind: 'numeric',
              prompt: 'In the same graph, what is $d(3, 2)$?',
              answer: 0,
              hint: '$3 \\to 4 \\to 2$.',
              explanation: '$1 + (-1) = 0$. There is a negative edge but no negative cycle: the diagonal stays 0.',
            },
          ],
        },
        {
          kind: 'complexity',
          title: 'Time, memory and comparison',
          body: `The table has $n \\cdot n \\cdot n$ cells and each is computed in $O(1)$ from at most two earlier cells: **$O(n^3)$**. Each round only uses the previous matrix, so two matrices (or even one, updated in place) suffice: $O(n^2)$ memory.

**Negative cycle:** if $d_n(u, u) < 0$ for some $u$, a negative cycle passes through $u$.

**Compared with Dijkstra $n$ times:** with non-negative weights, $n$ runs of Dijkstra take $O(nm + n^2\\log n)$; on sparse graphs that beats $O(n^3)$. Floyd–Warshall’s strengths: a three-line implementation, and it works with negative edges. (Johnson’s method reweights the edges so that Dijkstra can be run $n$ times even with negative edges.)

**Why doesn’t DP solve the longest simple path?** The pieces of a longest path $s \\to k \\to t$ need not be longest paths, and the two pieces may not share nodes: the subproblems are not independent. The problem is NP-hard.`,
        },
        {
          kind: 'text',
          title: 'In practice',
          body: `- **Distance tables:** distances between all junctions of a city map, tables precomputed for pathfinding in games, network latency matrices.
- **Transitive closure (Warshall):** asking “is it reachable?” instead of weights, the same three loops work with “or”/“and” instead of $\\min$/$+$.
- Problems like the **widest bottleneck path** or the **most reliable path** fit the same pattern with different operations.`,
        },
        {
          kind: 'mistakes',
          title: 'Common mistakes',
          body: `- Getting the loop order wrong: $k$ must be the **outermost** loop. With $u, v$ outside, the $d_{k-1}$ values may not be ready yet.
- Leaving $d_0(u, u)$ at $\\infty$: the distance to oneself is 0.
- Believing Floyd–Warshall gives correct distances when negative cycles exist: it only detects them.
- Assuming Floyd–Warshall is the fastest option even for large sparse graphs with non-negative weights.`,
        },
      ],
      quiz: [
        {
          id: 'q1',
          kind: 'mcq',
          prompt: 'What is Floyd–Warshall’s running time?',
          options: ['$O(n^2)$', '$O(nm)$', '$O(n^3)$', '$O(n^2 \\log n)$'],
          answer: 2,
          hint: 'Three nested loops.',
          explanation: 'Three loops over $k$, $u$, $v$, each step $O(1)$: $O(n^3)$.',
        },
        {
          id: 'q2',
          kind: 'mcq',
          prompt: 'When Floyd–Warshall finishes, $d(4, 4) = -2$. What does it mean?',
          options: ['The shortest path from 4 to itself is −2; all is fine.', 'A negative cycle passes through 4.', 'The algorithm has a bug.', '4 cannot reach any node.'],
          answer: 1,
          hint: 'What is the distance to oneself normally?',
          explanation: '$d(u, u) < 0$ happens only if a negative cycle passes through $u$.',
        },
        {
          id: 'q3',
          kind: 'mcq',
          prompt: 'On a sparse graph ($m = O(n)$) with non-negative weights, which is asymptotically faster for all-pairs shortest paths?',
          options: ['Floyd–Warshall: $O(n^3)$', 'Dijkstra $n$ times: $O(nm + n^2 \\log n) = O(n^2 \\log n)$', 'They are the same', 'Bellman–Ford $n$ times: $O(n^2 m)$'],
          answer: 1,
          hint: 'Plug in $m = O(n)$.',
          explanation: '$O(n^2 \\log n) \\ll O(n^3)$. Floyd–Warshall is chosen for its simplicity and its support for negative edges.',
        },
        {
          id: 'q4',
          kind: 'numeric',
          prompt: 'On a graph with $n = 100$ nodes, how many times does Floyd–Warshall compute $\\min(d(u, v), d(u, k) + d(k, v))$?',
          answer: 1000000,
          hint: '$k$, $u$ and $v$ each take $n$ values.',
          explanation: '$100^3 = 10^6$.',
        },
      ],
      practice: [
        {
          id: 'p1',
          prompt: `Our own example: 3 nodes, edges 1→2 (4), 2→3 (−1), 1→3 (5), 3→1 (2). Write the matrices $d_0, d_1, d_2, d_3$. Is there a negative cycle?`,
          hints: ['$d_0$: direct edges, diagonal 0.', 'At $k = 2$, $d(1, 3) = \\min(5, 4 - 1)$.'],
          solution: `$d_0$: rows (0, 4, 5), (∞, 0, −1), (2, ∞, 0). $k = 1$: $d(3, 2) = 2 + 4 = 6$ → (2, 6, 0). $k = 2$: $d(1, 3) = \\min(5, 3) = 3$. $k = 3$: $d(2, 1) = -1 + 2 = 1$; nothing else changes. $d_3$: (0, 4, 3), (1, 0, −1), (2, 6, 0). The diagonal is 0: no negative cycle (the cycle 1→2→3→1 weighs $4 - 1 + 2 = 5$).`,
        },
      ],
      sources: [SRC.l12.notes, SRC.l12.slides, SRC.l12.notebook, SRC.l12.concept],
    },
  ],
}
