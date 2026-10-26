import type { Lecture } from '../types'
import { SRC } from '../sources'
import { KRUSKAL_CODE, PRIM_CODE } from '../../engines/mst'

export const lecture15: Lecture = {
  n: 15,
  title: 'Minimum Spanning Trees',
  titleEn: 'Minimum Spanning Trees',
  date: 'March 2, 2026',
  blurb: 'The lightest edge crossing a cut is always safe: Prim and Kruskal are two implementations of this one idea.',
  lessons: [
    {
      id: 'l15-mst',
      lecture: 15,
      title: 'Minimum spanning trees: Prim and Kruskal',
      titleEn: 'Minimum spanning trees: Prim and Kruskal',
      summary: 'Cuts, light edges, the cut property; priority queues and union-find.',
      minutes: 60,
      objectives: [
        'State the minimum spanning tree (MST) problem and the general “add a safe edge” template.',
        'Define cuts, respecting a set and light edges; prove the cut property (Theorem 1).',
        'Run Prim’s algorithm step by step, in a Dijkstra-like way.',
        'Run Kruskal’s algorithm with union-find and compare the running times.',
      ],
      prerequisites: ['Greedy algorithms (Lecture 14)', 'Dijkstra (Lecture 11)', 'Graphs (Lecture 9)'],
      sections: [
        {
          kind: 'intuition',
          title: 'Intuition: the cheapest connecting network',
          label: 'intuition',
          body: `We want to connect several cities with fiber cable; every possible link has a cost. Every city must be able to reach every other one (perhaps through others), and the total cost must be as small as possible.

This is the **minimum spanning tree** (MST) problem on an undirected weighted graph: a subgraph that connects all nodes, has no cycle (a **tree**) and has the smallest total edge weight. A cycle is wasted money: dropping the heaviest edge of a cycle keeps everything connected.

Good news: this problem is solved by greedy algorithms, in polynomial time and very intuitively.`,
        },
        {
          kind: 'formal',
          title: 'Cuts and light edges (Lecture 15 notes)',
          box: 'formal',
          label: 'formal',
          body: `- A **cut** $(S, V - S)$ splits the nodes into two disjoint sets. An edge with one end in $S$ and the other in $V - S$ **crosses the cut**.
- A cut **respects** a set of edges $A$ if no edge of $A$ crosses it.
- Among the edges crossing the cut, one of minimum weight is called a **light edge**.

**Template:** start with $A = \\emptyset$; while $A$ is not a spanning tree, add a “safe” edge. Invariant: some MST contains $A$.

**Theorem 1 (cut property):** let $A$ be part of some MST, $(S, V - S)$ a cut that respects $A$, and $(u, v)$ a light edge crossing it. Then some MST contains $A \\cup \\{(u, v)\\}$.`,
          check: [
            {
              id: 'c1',
              kind: 'numeric',
              prompt: 'How many edges does every spanning tree of a connected graph with 9 nodes have?',
              answer: 8,
              hint: 'A tree: connected and acyclic.',
              explanation: 'A tree on $n$ nodes has exactly $n - 1 = 8$ edges.',
            },
          ],
        },
        {
          kind: 'correctness',
          title: 'Proof of the cut property',
          label: 'formalProof',
          proof: [
            { title: 'Setup', body: 'Let $T$ be an MST containing $A$. If $(u, v) \\in T$ we are done. Otherwise adding $(u, v)$ to $T$ creates a cycle.' },
            { title: 'Another edge crossing the cut', body: '$T$ has a path $p$ from $u$ to $v$; since $u$ and $v$ are on different sides of the cut, $p$ contains an edge $(x, y)$ that crosses the cut. The cut respects $A$, so $(x, y) \\notin A$.' },
            { title: 'Exchange', body: '$T\' = T - \\{(x, y)\\} \\cup \\{(u, v)\\}$. Removing $(x, y)$ splits $T$ into two pieces and $(u, v)$ joins them again: $T\'$ is a spanning tree containing $A \\cup \\{(u, v)\\}$.' },
            { title: 'Still minimum', body: '$(u, v)$ is light, so $w(u, v) \\le w(x, y)$: $w(T\') \\le w(T)$. Since $T$ is minimum, equality holds: $T\'$ is an MST too.' },
          ],
        },
        {
          kind: 'pseudocode',
          title: 'Prim (notes, Algorithm 2)',
          code: PRIM_CODE,
          body: `Prim’s set $A$ is **a single tree**: it starts at the root $r$ and at every step adds a new node with the lightest edge leaving the tree. The cut is (nodes in the tree, the rest); it respects $A$ and the chosen edge is light → Theorem 1. $key(v)$ is the weight of the lightest edge connecting $v$ to the tree; it is very much like Dijkstra’s $d[v]$, but it is the weight of a **single edge**, not a path length.`,
        },
        {
          kind: 'pseudocode',
          title: 'Kruskal (notes, Algorithm 3)',
          code: KRUSKAL_CODE,
          body: `Kruskal’s set $A$ is a **forest** (disjoint trees). Edges are examined from light to heavy; an edge joining two different trees is added, an edge between two nodes of the same tree is skipped (it would close a cycle). The cut: (the tree of one end of the edge, the rest); every lighter edge was already examined, so this edge is light. The **union-find** (disjoint sets) data structure answers “same tree?” ($find$) and merges ($union$) in nearly constant time.`,
        },
        {
          kind: 'viz',
          title: 'MST visualizer',
          viz: 'mst',
          tasks: [
            'Play Kruskal on the notes’ graph: which edges are skipped because they would close a cycle? What is the total weight?',
            'Switch to Prim: how do the $key$ values under the nodes change? In a tie ($c$ and $h$, both 8) which one is chosen?',
            'Did the two algorithms find the same set of edges? The same total weight?',
            'In **prediction mode**, guess whether each edge is added by Kruskal.',
          ],
          body: `Green edges are in the tree, the yellow edge is being examined, faint dashed edges were skipped. In Kruskal, nodes of the same color are in the same set (union-find); the side panel lists the sets. In Prim, blue nodes are in the queue with a finite key.`,
          check: [
            {
              id: 'c2',
              kind: 'numeric',
              prompt: 'What is the total weight of the minimum spanning tree of the notes’ example graph (a…i)?',
              answer: 37,
              hint: 'Edges added by Kruskal: gh 1, ci 2, fg 2, ab 4, cf 4, cd 7, ah 8, de 9.',
              explanation: '$1 + 2 + 2 + 4 + 4 + 7 + 8 + 9 = 37$. Prim finds the same total (the edges may differ because of ties).',
            },
          ],
        },
        {
          kind: 'complexity',
          title: 'Running times',
          body: `- **Prim:** a modification of Dijkstra. With a red-black tree or a binary heap, ExtractMin and DecreaseKey take $O(\\log n)$ → $O(m \\log n)$. With a Fibonacci heap, $O(m + n \\log n)$.
- **Kruskal:** sorting the edges takes $O(m \\log n)$ (with small integer weights, $O(m)$ by RadixSort). With union-find, $m$ operations take $O(m\\,\\alpha(n))$; $\\alpha$ is the inverse Ackermann function and $\\alpha(n) \\le 4$ for every $n$ below the number of atoms in the universe. Nearly linear in practice.
- **Newer ones:** Karger–Klein–Tarjan (1995), randomized expected $O(n + m)$; Chazelle (2000), deterministic $O(m\\,\\alpha(n))$.`,
        },
        {
          kind: 'text',
          title: 'In practice: where are MSTs used?',
          body: `- **Network design:** building electricity, water, fiber or road networks at minimum cost.
- **Clustering:** stopping Kruskal when $k$ sets are left gives “single-linkage clustering”: groups by nearest-neighbor relations between points.
- **Approximation algorithms:** for the metric travelling salesman problem (NP-hard), an MST is used to build a tour at most twice as long as optimal.
- **Image segmentation:** pixels are nodes and color differences are edge weights; Kruskal-like merges find regions.`,
          check: [
            {
              id: 'c3',
              kind: 'mcq',
              prompt: 'What do we get if Kruskal is stopped when $k$ sets are left instead of 1?',
              options: ['A meaningless forest', 'A clustering that splits the points into $k$ groups by their shortest connections', 'A shortest-path tree', 'A random tree'],
              answer: 1,
              hint: 'Kruskal always merges the two closest groups.',
              explanation: 'This is single-linkage clustering: the shortest edge between different clusters is as long as possible.',
            },
          ],
        },
        {
          kind: 'steps',
          title: 'Worked example: the cycle property and a cheaper edge',
          label: 'formal',
          body: `The cut property says which edges are **safe**. Its mirror image says which edges are **never** needed: the (unique) heaviest edge on a cycle is in no MST. Let us see it on the “small example” graph (ab 3, ad 1, bd 4, bc 5, be 2, ce 6, cf 2, de 7, ef 1; MST weight 9).`,
          proof: [
            { title: 'The cycle property', body: 'If $e$ is the unique heaviest edge of a cycle $C$ and $e$ were in a tree $T$: removing $e$ splits $T$ in two, and another edge of $C$ reconnects the two parts more cheaply. A lighter spanning tree: a contradiction.' },
            { title: 'In the example', body: 'The cycle $a - d - e - b - a$: ad 1, de 7, eb 2, ba 3. Its heaviest edge de 7 is not in the MST. Kruskal skips it too, because it “would create a cycle”.' },
            { title: 'If an edge gets cheaper', body: 'Let bd drop from 4 to 0. Adding bd to the old MST creates the cycle $b - d - a - b$ (bd 0, ad 1, ab 3); by the cycle property the heaviest edge ab 3 leaves. The new MST weighs $9 - 3 + 0 = 6$.' },
            { title: 'The lesson', body: 'When an edge weight decreases there is no need to recompute the MST from scratch: add the edge and remove the heaviest edge on the single cycle it creates, in $O(n)$.' },
          ],
          check: [
            {
              id: 'c4',
              kind: 'mcq',
              prompt: 'The small example has the cycle $b - c - f - e - b$ (bc 5, cf 2, fe 1, eb 2). Which edge can be in no MST?',
              options: ['cf', 'ef', 'bc', 'be'],
              answer: 2,
              hint: 'The unique heaviest edge of the cycle.',
              explanation: 'bc 5 is the unique heaviest edge of the cycle; by the cycle property it is in no MST.',
            },
          ],
        },
        {
          kind: 'mistakes',
          title: 'Common mistakes',
          body: `- Confusing Prim with Dijkstra: in Prim, $key(v)$ is the weight of **one edge**, not a distance from the source. An MST is not a shortest-path tree.
- Forgetting the cycle check in Kruskal, or doing it with a DFS every time (union-find is much faster).
- Believing the MST is always unique: with equal weights there can be several MSTs; if all weights are distinct, it is unique.
- Thinking these algorithms also work on directed graphs: the directed version (arborescences) is a different problem.`,
        },
      ],
      quiz: [
        {
          id: 'q1',
          kind: 'mcq',
          prompt: 'What does the cut property say?',
          options: [
            'The heaviest edge crossing a cut is in no MST.',
            'A light edge crossing a cut that respects $A$ can be added to $A$ and $A$ is still part of an MST.',
            'Every cut contains exactly one MST edge.',
            'The MST is always unique.',
          ],
          answer: 1,
          hint: 'Theorem 1.',
          explanation: 'This is the basis of the correctness of both Prim and Kruskal.',
        },
        {
          id: 'q2',
          kind: 'mcq',
          prompt: 'Which step dominates the running time of Kruskal (with union-find)?',
          options: ['The union-find operations', 'Sorting the edges: $O(m \\log n)$', 'Looking for cycles with DFS', 'Building the adjacency lists'],
          answer: 1,
          hint: '$\\alpha(n) \\le 4$.',
          explanation: 'Union-find operations are constant in practice; comparison sorting takes $O(m \\log m) = O(m \\log n)$.',
        },
        {
          id: 'q3',
          kind: 'numeric',
          prompt: 'What is the MST weight of the “Small example” graph in the visualizer?',
          answer: 9,
          hint: 'The lightest edges: ad 1, ef 1, be 2, cf 2…',
          explanation: 'ad 1, ef 1, be 2, cf 2, ab 3: $1 + 1 + 2 + 2 + 3 = 9$; 5 edges, 6 nodes.',
        },
        {
          id: 'q4',
          kind: 'mcq',
          prompt: 'What can be said if all edge weights of a graph are distinct?',
          options: ['The MST is unique.', 'There is no MST.', 'Prim and Kruskal find different weights.', 'The heaviest edge is always in the MST.'],
          answer: 0,
          hint: 'In the cut property the light edge is then always unique.',
          explanation: 'With distinct weights every cut has a unique light edge; two different MSTs would lead to a contradiction. (The heaviest edge is not in the MST unless it is a bridge.)',
        },
      ],
      practice: [
        {
          id: 'p1',
          prompt: `Our own example (the “Small example” in the visualizer): edges ab 3, ad 1, bd 4, bc 5, be 2, ce 6, cf 2, de 7, ef 1. Run Kruskal by hand: write “added / skipped” for every edge and track the sets. Then run Prim starting from $a$.`,
          hints: ['Sorted edges: ad 1, ef 1, be 2, cf 2, ab 3, bd 4, bc 5, ce 6, de 7.', 'Prim: after $a$ comes $d$ (1), then $b$ (3)…'],
          solution: `**Kruskal:** ad 1 added {a,d}; ef 1 added {e,f}; be 2 added {b,e,f}; cf 2 added {b,c,e,f}; ab 3 added {a,b,c,d,e,f} — 5 edges, done. Total 9. (bd 4, bc 5, ce 6, de 7 would now close cycles.) **Prim (from $a$):** $a$; key(b) = 3, key(d) = 1 → add $d$ (ad 1); key(e) = 7 → $b$ (ab 3); key(c) = 5, key(e) = 2 → $e$ (be 2); key(f) = 1, key(c) = 5 → $f$ (ef 1); key(c) = 2 → $c$ (cf 2). The same tree, weight 9.`,
        },
        {
          id: 'p2',
          prompt: `Our own example: four cities $p, q, r, s$ and a connection cost for every pair: pq 1, pr 4, ps 3, qr 2, qs 5, rs 6. Find the MST with Kruskal. Then use the cycle property to justify which edges can be in no MST.`,
          hints: ['Sorted edges: pq 1, qr 2, ps 3, pr 4, qs 5, rs 6.', '$n - 1 = 3$ edges are enough.'],
          solution: `Kruskal: pq 1 added, qr 2 added, ps 3 added: 3 edges, done. Weight $1 + 2 + 3 = 6$. The others: pr 4 is the heaviest edge of the cycle $p - q - r - p$ (1, 2, 4); qs 5 of the cycle $q - p - s - q$ (1, 3, 5); rs 6 of the cycle $r - q - p - s - r$ (2, 1, 3, 6). None of the three can be in an MST, and since all weights differ the MST is unique.`,
        },
      ],
      sources: [SRC.l15.notes, SRC.l15.slides, SRC.l15.pre, SRC.l15.notebook, SRC.l15.concept],
    },
  ],
}
