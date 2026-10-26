import type { Lecture } from '../types'
import { SRC } from '../sources'
import { DIJKSTRA_CODE } from '../../engines/shortestPaths'

export const lecture11: Lecture = {
  n: 11,
  title: 'Dijkstra and Bellman-Ford',
  titleEn: 'Dijkstra and Bellman-Ford',
  date: 'February 11, 2026',
  blurb: 'Single-source shortest paths with non-negative weights: Dijkstra; groundwork for Bellman–Ford with negative edges.',
  lessons: [
    {
      id: 'l11-dijkstra',
      lecture: 11,
      title: 'Dijkstra’s algorithm',
      titleEn: 'Dijkstra’s algorithm',
      summary: 'Relaxing estimates, finalizing the smallest estimate, and choosing a priority queue.',
      minutes: 55,
      objectives: [
        'State Dijkstra’s two invariants ($d[t] \\ge d(s, t)$; equality for finished nodes).',
        'Run the algorithm step by step and explain the relax operation.',
        'Show where the correctness proof uses non-negative weights, and see it fail with a negative edge.',
        'Compare running times with an array, a red-black tree and a Fibonacci heap.',
        'Explain amortized time with the binary counter example.',
      ],
      prerequisites: ['BFS (Lecture 9)', 'Red-black trees (Lecture 7)'],
      sections: [
        {
          kind: 'intuition',
          title: 'Intuition: a weighted BFS',
          label: 'intuition',
          body: `BFS minimizes the **number** of edges. But in road networks, network delays or flight prices edges have different **weights**: one long edge can cost more than two short ones.

Dijkstra’s idea: grow outward from the source, always picking the **closest** node that is not yet final. Keep an **estimate** $d[t]$ for every node; when you pick a node, improve (**relax**) its neighbors’ estimates using its outgoing edges. If the weights are non-negative, the estimate of the picked node is now final.

In this lesson all weights are **non-negative**: $w(u, v) \\ge 0$.`,
        },
        {
          kind: 'pseudocode',
          title: 'Dijkstra(G, s) (notes, Algorithm 1)',
          code: DIJKSTRA_CODE,
          body: `$F$: nodes not yet final, $D$: final nodes. Relaxing: $d[y] \\leftarrow \\min(d[y],\\ d[x] + w(x, y))$. To remember the paths, set $p(y) = x$ whenever $d[y]$ changes; the $p$ pointers form a **shortest-path tree**.`,
          check: [
            {
              id: 'c1',
              kind: 'mcq',
              prompt: 'Which invariant does Dijkstra maintain at all times?',
              options: [
                '$d[t] \\le d(s, t)$ for every $t$',
                '$d[t] \\ge d(s, t)$ for every $t$; when $t$ is finished, $d[t] = d(s, t)$',
                '$d[t]$ changes only once',
                '$d[t]$ is the number of edges to $t$',
              ],
              answer: 1,
              hint: 'An estimate is the weight of a path that really exists.',
              explanation: 'Every finite $d[t]$ is the weight of a real path from $s$ to $t$ (Claim 1), so it cannot be smaller than a shortest path. When a node is finalized equality holds (Claim 2).',
            },
          ],
        },
        {
          kind: 'viz',
          title: 'Dijkstra visualizer',
          viz: 'dijkstra',
          tasks: [
            'Play the “Non-negative weights” graph: in which order are the nodes finalized? Is that order increasing in distance?',
            'How many times does $a$’s estimate change, and why?',
            'Switch to the “One negative edge” graph: compare Dijkstra’s value for $t$ with the true distance in the side panel.',
            'In **prediction mode**, guess which node of $F$ is chosen at each step.',
          ],
          body: `The current estimate $d$ is written under each node. Green nodes are final ($D$), blue ones have a finite estimate. The edge being relaxed is yellow, the edges of the shortest-path tree are green; negative edges are red.`,
          check: [
            {
              id: 'c2',
              kind: 'numeric',
              prompt: 'In the visualizer’s first graph, what is $d(s, t)$?',
              answer: 10,
              hint: 'The path $s \\to b \\to a$ is shorter than $s \\to a$.',
              explanation: '$s \\to b \\to a \\to d \\to t$: $1 + 2 + 6 + 1 = 10$. ($s \\to b \\to a \\to c \\to t$ costs $1 + 2 + 5 + 3 = 11$.)',
            },
          ],
        },
        {
          kind: 'correctness',
          title: 'Why is it correct? (Claims 1 and 2)',
          label: 'formalProof',
          proof: [
            { title: 'Claim 1', body: 'At all times $d[u] \\ge d(s, u)$. Induction: initially $d[s] = 0$ and the rest are $\\infty$. When $d[u]$ is set to $d[x] + w(x, u)$, by the hypothesis there is a path from $s$ to $x$ of weight $d[x]$; with the edge $(x, u)$ we get a path to $u$ of weight $d[u]$. A path cannot weigh less than a shortest path.' },
            { title: 'Claim 2: setup', body: '$x$ is the node of $F$ with the smallest estimate and is being moved to $D$. Assume $d[y] = d(s, y)$ for every $y \\in D$. $p$: a shortest path from $s$ to $x$. $z$: the node on $p$ closest to $x$ with $d[z] = d(s, z)$ ($s$ at least qualifies).' },
            { title: 'If z = x', body: 'Then $d[x] = d(s, x)$ already: done.' },
            { title: 'If z ≠ x', body: 'Let $z\'$ be the node after $z$ on $p$. $d[z] = d(s, z) \\le d(s, x) \\le d[x]$. The first inequality comes from the part of the path from $z$ to $x$ having **non-negative** weight. If equality holds, $d[x] = d(s, x)$ and we are done.' },
            { title: 'Contradiction', body: 'If $d[z] < d[x]$, then since $x$ has the smallest estimate, $z \\notin F$, so $z \\in D$: the edge $(z, z\')$ was already relaxed and $d[z\'] \\le d(s, z) + w(z, z\') = d(s, z\')$. That contradicts the choice of $z$. So $d[x] = d(s, x)$.' },
          ],
        },
        {
          kind: 'formal',
          title: 'Negative edges and negative cycles',
          box: 'warn',
          label: 'formal',
          body: `The proof used $w \\ge 0$ in two places. With a negative edge, Dijkstra can finalize a node **too early**: in the visualizer’s second graph, $a$ is finalized with $d[a] = 2$, although the path $s \\to b \\to a$ costs $5 - 4 = 1$; the true distance of $t$ is 2 but Dijkstra finds 3.

The bigger problem is **negative cycles**: if a cycle has negative total weight, going around it makes a path as cheap as we like; shortest paths are undefined. Without negative cycles, negative edges are fine — but instead of Dijkstra we need **Bellman–Ford** (Lecture 12): it detects a negative cycle or finds the correct distances, in $O(nm)$ time.`,
          check: [
            {
              id: 'c3',
              kind: 'numeric',
              prompt: 'In the visualizer’s “One negative edge” graph, what is the weight of the **true** shortest path from $s$ to $t$?',
              answer: 2,
              hint: 'Try the path $s \\to b \\to a \\to t$.',
              explanation: '$5 + (-4) + 1 = 2$. Dijkstra finds 3 because it finalizes $a$ early with $d[a] = 2$ and finishes $t$ before it.',
            },
          ],
        },
        {
          kind: 'complexity',
          title: 'Implementation: choosing the priority queue',
          body: `Total work: $n$ times FindMin + DeleteMin, at most $m$ times DecreaseKey:
$$n \\cdot (T_{\\text{FindMin}} + T_{\\text{DeleteMin}}) + m \\cdot T_{\\text{DecreaseKey}}.$$

- **Array:** DecreaseKey $O(1)$, FindMin/DeleteMin $O(n)$ → $O(n^2 + m) = O(n^2)$. Good for dense graphs.
- **Red-black tree (or binary heap):** all $O(\\log n)$ (DecreaseKey = delete + reinsert) → $O((n + m)\\log n)$. Good for sparse graphs; slower than the array when $m = \\Theta(n^2)$.
- **Fibonacci heap:** DecreaseKey and FindMin in **amortized** $O(1)$, DeleteMin amortized $O(\\log n)$ → $O(m + n\\log n)$.

**Amortized time:** if any $L$ operations starting from an empty structure take $O(L \\cdot t(n))$ in total, the amortized time per operation is $t(n)$; a single operation may be expensive, but not the average. Example: incrementing a binary counter $n$ times. Some increments ($0111 \\to 1000$) flip many bits, but with the accounting method that attaches a “credit” to every 1, the total work is $O(n)$, amortized $O(1)$ per increment.`,
          check: [
            {
              id: 'c4',
              kind: 'numeric',
              prompt: 'A binary counter starting at 0 is incremented 16 times. How many bits change in total (0→1 and 1→0 included)?',
              answer: 31,
              hint: 'The lowest bit changes every time, the next one every second time…',
              explanation: '$16 + 8 + 4 + 2 + 1 = 31 < 2 \\cdot 16$. Fewer than 2 per increment on average: amortized $O(1)$.',
            },
          ],
        },
        {
          kind: 'text',
          title: 'In practice: shortest paths',
          body: `- **Navigation apps** use accelerated variants of Dijkstra: A*, which steers toward the target, searching from both ends at once, and precomputed “shortcut” edges (contraction hierarchies). Routes across a continent are found in milliseconds.
- **Internet routing:** in the OSPF protocol every router knows the map of the network and computes shortest paths with Dijkstra.
- **Negative weights:** with weights $-\\log(\\text{rate})$ on currency exchange rates, a negative cycle is a profitable arbitrage opportunity; Bellman–Ford detects it.`,
        },
        {
          kind: 'steps',
          title: 'Worked example: distances and parents',
          label: 'formal',
          body: `Our own example: $s \\to a$ (4), $s \\to b$ (1), $b \\to a$ (2), $a \\to c$ (1), $b \\to c$ (5). While running Dijkstra, every time $d[v]$ is updated we also record the **parent** of $v$ ($\\pi[v]$, the node that made the update); we read the paths off these later.`,
          proof: [
            { title: 's is finalized (d = 0)', body: '$d[a] = 4$ ($\\pi[a] = s$), $d[b] = 1$ ($\\pi[b] = s$).' },
            { title: 'b is finalized (d = 1)', body: '$a$: $1 + 2 = 3 < 4$ → $d[a] = 3$, $\\pi[a] = b$. $c$: $1 + 5 = 6$ → $d[c] = 6$, $\\pi[c] = b$.' },
            { title: 'a is finalized (d = 3)', body: '$c$: $3 + 1 = 4 < 6$ → $d[c] = 4$, $\\pi[c] = a$. Finally $c$ is finalized ($d = 4$).' },
            { title: 'Reading the path back', body: 'Follow the parents from $c$: $c \\leftarrow a \\leftarrow b \\leftarrow s$. Reversed: $s \\to b \\to a \\to c$, length $1 + 2 + 1 = 4$. Together the parent edges form a **shortest-path tree**: one parent per node is enough because every prefix of a shortest path is itself a shortest path.' },
          ],
          check: [
            {
              id: 'c5',
              kind: 'numeric',
              prompt: 'In this example, how many times is $d[c]$ updated (counting the change from infinity to its first value)?',
              answer: 2,
              hint: 'First from $b$, then from $a$.',
              explanation: '$\\infty \\to 6$ (when $b$ is finalized) and $6 \\to 4$ (when $a$ is finalized). The final parent is $\\pi[c] = a$.',
            },
          ],
        },
        {
          kind: 'mistakes',
          title: 'Common mistakes',
          body: `- Using Dijkstra on graphs with negative edges (it can be wrong even without a negative cycle).
- Treating a node as final when its estimate **first changes**: it becomes final when it is **chosen** from $F$.
- Memorizing the running time as “$O(m\\log n)$” without context: it depends on the priority queue; $O(n^2)$ with an array, $O(m + n\\log n)$ with a Fibonacci heap.
- Confusing amortized time with average-case time (random input): amortized analysis involves no randomness; the total is guaranteed for every sequence of operations.`,
        },
      ],
      quiz: [
        {
          id: 'q1',
          kind: 'mcq',
          prompt: 'What is Dijkstra’s running time if the set $F$ is kept in a red-black tree?',
          options: ['$O(n + m)$', '$O((n + m)\\log n)$', '$O(n^2)$', '$O(nm)$'],
          answer: 1,
          hint: '$n + m$ operations, each $O(\\log n)$.',
          explanation: 'FindMin, DeleteMin and DecreaseKey (delete + insert) take $O(\\log n)$; $O(n)$ + $O(m)$ operations: $O((n + m)\\log n)$.',
          feedback: { 3: 'That is Bellman–Ford’s running time.' },
        },
        {
          id: 'q2',
          kind: 'mcq',
          prompt: 'On a dense graph ($m = \\Theta(n^2)$), which choice gives Dijkstra the best asymptotic running time?',
          options: ['Red-black tree', 'Unsorted array', 'Linked list, sorted every time', 'It makes no difference'],
          answer: 1,
          hint: 'Compare $(n + m)\\log n$ with $n^2$ for $m = n^2$.',
          explanation: 'With an array it is $O(n^2)$ = the size of the input; with a red-black tree $O(n^2 \\log n)$. (A Fibonacci heap also gives $O(n^2)$ but is far more complicated.)',
        },
        {
          id: 'q3',
          kind: 'mcq',
          prompt: 'In Dijkstra’s correctness proof, what does the inequality “$d(s, z) \\le d(s, x)$” rely on?',
          options: ['$z$ being in $D$', 'The weights being non-negative', 'The graph being undirected', 'The priority queue being a red-black tree'],
          answer: 1,
          hint: '$z$ lies on a shortest $s \\to x$ path, before $x$.',
          explanation: 'The part of the path from $z$ to $x$ has weight $\\ge 0$, so a prefix cannot be heavier than the whole path. A negative edge breaks this step.',
        },
        {
          id: 'q4',
          kind: 'numeric',
          prompt: 'A binary counter starting at 0 is incremented $n = 1000$ times. What upper bound on the total number of bit changes does the credit (accounting) argument of the notes give?',
          answer: 2000,
          hint: 'Each increment deposits 2 credits.',
          explanation: 'Accounting method: each increment brings 2 credits and each bit change spends 1; the total is at most $2n = 2000$. (The true value is a bit smaller: $\\sum_i \\lfloor 1000/2^i \\rfloor = 1994$.)',
        },
      ],
      practice: [
        {
          id: 'p1',
          prompt: `Our own example: directed edges s→a (7), s→b (2), b→a (3), a→c (1), b→c (8), c→t (2), b→t (9). Run Dijkstra from $s$ by hand: write the chosen node and the estimates at every step. Draw the final shortest-path tree.`,
          hints: ['First $s$ is chosen, then $b$ (estimate 2).', '$a$’s estimate drops from 7 to 5.'],
          solution: `Initially $d = (s: 0, a: \\infty, b: \\infty, c: \\infty, t: \\infty)$. Choose $s$: $a = 7$, $b = 2$. Choose $b$ (2): $a = \\min(7, 5) = 5$, $c = 10$, $t = 11$. Choose $a$ (5): $c = \\min(10, 6) = 6$. Choose $c$ (6): $t = \\min(11, 8) = 8$. Choose $t$ (8). Result: $s$ 0, $b$ 2, $a$ 5, $c$ 6, $t$ 8. Tree: s→b, b→a, a→c, c→t.`,
        },
        {
          id: 'p2',
          prompt: `Our own example: in the graph above ($s \\to a$ 4, $s \\to b$ 1, $b \\to a$ 2, $a \\to c$ 1, $b \\to c$ 5) the weight of $b \\to a$ rises from 2 to 4. How do the distances and the shortest-path tree change? What happens with ties?`,
          hints: ['$s \\to a$ directly is 4; $s \\to b \\to a$ is now $1 + 4 = 5$.', 'For $c$ compare the two paths $s \\to a \\to c$ and $s \\to b \\to c$.'],
          solution: `Now $d[a] = 4$ ($\\pi[a] = s$, the direct edge). For $c$: $s \\to a \\to c = 4 + 1 = 5$ and $s \\to b \\to c = 1 + 5 = 6$, so $d[c] = 5$, $\\pi[c] = a$. The new tree: $s \\to a$, $s \\to b$, $a \\to c$. With a tie (say $b \\to a$ of weight 3: $1 + 3 = 4$) both paths would be shortest; Dijkstra updates only on a **strict improvement** ($<$), so which parent stays depends on the processing order. The distances are unique either way.`,
        },
      ],
      sources: [SRC.l11.notes, SRC.l11.slides, SRC.l11.pre, SRC.l11.notebook, SRC.l11.concept],
    },
  ],
}
