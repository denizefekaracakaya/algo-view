import type { Lecture } from '../types'
import { SRC } from '../sources'
import { FF_CODE } from '../../engines/maxFlow'

export const lecture16: Lecture = {
  n: 16,
  title: 'Max-Flow and the Ford-Fulkerson Algorithm',
  titleEn: 'Max-Flow and the Ford-Fulkerson Algorithm',
  date: 'March 4, 2026',
  blurb: 'The largest flow through a network equals the capacity of its narrowest cut.',
  lessons: [
    {
      id: 'l16-maxflow',
      lecture: 16,
      title: 'Max flow, min cut and Ford–Fulkerson',
      titleEn: 'Max flow, min cut and Ford–Fulkerson',
      summary: 'Flow constraints, the residual graph, augmenting paths and the max-flow min-cut theorem.',
      minutes: 60,
      objectives: [
        'Define a flow (capacity and conservation constraints) and an $s$–$t$ cut.',
        'Show that every flow is at most every cut (Lemma 2).',
        'Build the residual graph and push flow along an augmenting path.',
        'Explain why Ford–Fulkerson is correct and the max-flow min-cut theorem.',
        'Turn bipartite matching into a flow problem.',
      ],
      prerequisites: ['BFS and DFS (Lecture 9)', 'Directed graphs'],
      sections: [
        {
          kind: 'intuition',
          title: 'Intuition: the most water through the pipes',
          label: 'intuition',
          body: `Imagine carrying water from a source ($s$) to a target ($t$) through pipes; each pipe has a **capacity**. Water cannot pile up at intermediate points: what goes in must come out. How much water per second can we send at most?

Look at it the other way round: think of a “knife cut” that splits the network in two ($s$ on one side, $t$ on the other). The total capacity of the pipes going from $s$’s side to $t$’s side limits the water that can get through. The narrowest such **cut** determines the largest flow — and, surprisingly, that limit can always be reached.

History: during the Cold War, the US Air Force studied which lines of the Soviet railway network to cut to reduce the flow of supplies the most, with exactly these questions.`,
        },
        {
          kind: 'formal',
          title: 'Flows and cuts (Lecture 16 notes)',
          box: 'formal',
          label: 'formal',
          body: `A directed $G = (V, E)$, capacities $c: E \\to \\mathbb{R}_{\\ge 0}$, a source $s$ and a target $t$. A **flow** $f: E \\to \\mathbb{R}_{\\ge 0}$ satisfies:

1. **Capacity:** $0 \\le f(u, v) \\le c(u, v)$ for every $(u, v) \\in E$.
2. **Conservation:** for every $v$ other than $s$ and $t$, $\\sum_{x} f(x, v) = \\sum_{y} f(v, y)$ (in = out).

The **value** $|f|$ of the flow is the total flow out of $s$ (minus what enters it). An **$s$–$t$ cut** is $V = S \\cup T$ with $s \\in S$, $t \\in T$; its capacity is
$$c(S, T) = \\sum_{x \\in S,\\ y \\in T} c(x, y)$$
— only edges from $S$ to $T$ count.

**Lemma 2:** for every flow $f$ and every cut $(S, T)$, $|f| \\le c(S, T)$. Proof idea: by conservation, $|f|$ equals the flow crossing the cut from $S$ to $T$ minus the flow crossing from $T$ to $S$; this is at most the capacity of the $S \\to T$ edges.`,
          check: [
            {
              id: 'c1',
              kind: 'numeric',
              prompt: 'In the visualizer’s classic network, what is the capacity of the cut $S = \\{s\\}$? ($s \\to a$: 16, $s \\to b$: 13)',
              answer: 29,
              hint: 'Only the edges leaving $s$.',
              explanation: '$16 + 13 = 29$. This is an upper bound; the true maximum flow is smaller (23), because a narrower cut exists.',
            },
          ],
        },
        {
          kind: 'formal',
          title: 'The residual graph',
          box: 'info',
          label: 'formal',
          body: `How do we improve a current flow $f$? The **residual capacity** is
$$c_f(u, v) = \\begin{cases} c(u, v) - f(u, v) & (u, v) \\in E \\\\ f(v, u) & (v, u) \\in E \\\\ 0 & \\text{otherwise} \\end{cases}$$
The first line is “how much more can I send along this edge?”, the second “how much of what I sent along this edge can I **take back**?”. Taking back is crucial: the paths we picked first may be wrong.

The **residual graph** $G_f$ consists of the edges with $c_f(u, v) > 0$. A path from $s$ to $t$ in $G_f$ is called an **augmenting path**. (As in the notes, we assume $G$ does not contain both $(u, v)$ and $(v, u)$; if it does, a new node is inserted in between.)`,
        },
        {
          kind: 'pseudocode',
          title: 'Ford–Fulkerson (notes, Algorithm 1)',
          code: FF_CODE,
          body: `Augmenting: let $F$ be the smallest residual capacity on $P$. Increase the flow by $F$ on the forward edges of $P$, and decrease it by $F$ on the edges of $G$ matching the backward ones. The new flow is still valid and its value grows by $F > 0$ (Lemma 6).`,
        },
        {
          kind: 'viz',
          title: 'Ford–Fulkerson visualizer',
          viz: 'maxFlow',
          tasks: [
            'Play the classic network with BFS path choice: what is the bottleneck of each augmenting path? The final flow value?',
            'When the algorithm stops, look at the set $S$ (blue nodes) and the red edges: do the capacities of the red edges add up to the flow?',
            'Tick **Show the residual graph**: when do the backward (dashed purple) edges appear? Does some path use a backward edge?',
            'On the “Bad path choice trap” network, compare how many augmentations BFS and DFS make.',
            'On the “Bipartite matching” network, which matching do the saturated middle edges of the final flow give?',
          ],
          body: `Edge labels are **flow/capacity**. The yellow path is the current augmenting path; green edges are saturated (flow = capacity). Before each augmentation the residual graph is shown. At the end, the nodes reachable from $s$ in the residual graph form $S$ (blue), the others $T$ (orange).`,
          check: [
            {
              id: 'c2',
              kind: 'numeric',
              prompt: 'What is the value of the maximum flow in the classic network?',
              answer: 23,
              hint: 'Read $|f|$ when the algorithm stops, or find the narrowest cut.',
              explanation: 'The maximum flow is 23; the final cut $S = \\{s, a, b, d\\}$ has capacity $a \\to c$ (12) + $d \\to c$ (7) + $d \\to t$ (4) = 23.',
            },
          ],
        },
        {
          kind: 'correctness',
          title: 'The max-flow min-cut theorem',
          label: 'formalProof',
          proof: [
            { title: 'Lemma 6 (augmenting helps)', body: 'If $G_f$ has an $s \\to t$ path, the flow $f\'$ augmented by $F = \\min_{e \\in P} c_f(e) > 0$ is valid: no capacity is exceeded ($F \\le c_f$) and at every intermediate node the inflow and outflow change by the same amount. $|f\'| = |f| + F$.' },
            { title: 'Lemma 5 (no path means maximum)', body: 'If $t$ is unreachable from $s$ in $G_f$, let $S$ = the reachable nodes, $T = V - S$. Every edge of $G$ from $S$ to $T$ is saturated ($c_f = 0$ ⇒ $f = c$), and every edge from $T$ to $S$ carries 0 flow (otherwise there would be a backward residual edge).' },
            { title: 'Equality', body: 'By the computation of Lemma 2, $|f| = \\sum_{S \\to T} f - \\sum_{T \\to S} f = c(S, T) - 0$.' },
            { title: 'Conclusion (Theorem 4)', body: 'Since every flow is at most every cut (Lemma 2), a flow with $|f| = c(S, T)$ is maximum and the cut is minimum. When Ford–Fulkerson stops it has found exactly such a pair: **max flow = min cut**.' },
          ],
          check: [
            {
              id: 'c5',
              kind: 'mcq',
              prompt: 'In a network you found a flow of value 7 and an $s$–$t$ cut of capacity 7. What can you conclude?',
              options: ['The flow is maximum and the cut is minimum.', 'Only that the flow is maximum.', 'Nothing; there may be a larger flow.', 'The network has an edge of negative capacity.'],
              answer: 0,
              hint: 'Lemma 2: every flow is at most every cut.',
              explanation: 'No flow can exceed 7 (this cut blocks it) and no cut can be below 7 (this flow rules it out). Both are optimal; even without running the algorithm, this pair is a **certificate**.',
            },
          ],
        },
        {
          kind: 'complexity',
          title: 'How many augmentations?',
          body: `Each augmenting path is found in $O(m)$ (BFS/DFS). The question is how many augmentations happen.

- **Integer capacities, any path:** each augmentation adds at least 1 → at most $|f^*|$ augmentations, $O(|f^*| \\cdot m)$. With large capacities this can be very slow; with irrational capacities the algorithm may not even stop.
- **Shortest path (BFS) — Edmonds–Karp:** distances in the residual graph never decrease; each edge “disappears” at most $n/2$ times. At most $O(nm)$ augmentations → $O(nm(n + m))$.
- **Fattest path:** choosing the path with the largest bottleneck → $O(m \\log |f^*|)$ augmentations.

**Integrality:** if the capacities are integers, the maximum flow found by Ford–Fulkerson is integral too. The matching application relies on this.`,
          check: [
            {
              id: 'c3',
              kind: 'mcq',
              prompt: 'Four edges of capacity 100 and one middle edge of capacity 1 (the trap network in the visualizer). With the worst choices of paths, how many augmentations can Ford–Fulkerson make?',
              options: ['2', '4', '200', 'Infinitely many'],
              answer: 2,
              hint: 'What if every chosen path uses the middle edge of capacity 1 (once forward, once backward)?',
              explanation: 'Each augmentation adds just 1 unit, and 200 augmentations are needed until the flow reaches 200. BFS (shortest path) finishes with 2 augmentations.',
            },
          ],
        },
        {
          kind: 'formal',
          title: 'Application: bipartite matching',
          box: 'info',
          label: 'formal',
          body: `In a bipartite graph (edges between $V_1$ and $V_2$), a **matching** is a set of edges with no common endpoints. To find a largest matching:

1. Direct all edges from $V_1$ to $V_2$.
2. Add a new $s$ with an edge $s \\to x$ to every $x \\in V_1$; add a new $t$ with an edge $y \\to t$ from every $y \\in V_2$.
3. All capacities are 1. Find a maximum flow.

By integrality the flow on every edge is 0 or 1; at most 1 unit enters each $x$, so it is matched by at most one edge. Flow value = size of a largest matching; if $|V_1| = |V_2| = n$ and the flow is $n$, there is a **perfect matching**. (If several sources or targets are needed, a single super-source/target is added with infinite-capacity edges.)`,
        },
        {
          kind: 'text',
          title: 'In practice',
          body: `- **Transport and logistics:** the largest amount a road or pipe network can carry.
- **Assignment problems:** assigning students to projects, jobs to machines, doctors to shifts (bipartite matching and its variants).
- **Image segmentation:** separating foreground from background is solved as a minimum cut problem.
- **Network reliability:** at least how many links must be cut to disconnect two computers? A minimum cut.
- **Sports elimination:** “Can this team still finish first?” can be turned into a flow problem.`,
        },
        {
          kind: 'steps',
          title: 'Worked example: why reverse edges are needed',
          label: 'formal',
          body: `Without reverse edges, a greedy algorithm that just says “find a path that is not full and fill it” can get stuck. Our own example, every capacity 1: $s \\to a$, $s \\to b$, $a \\to c$, $a \\to d$, $b \\to c$, $c \\to t$, $d \\to t$.`,
          proof: [
            { title: 'An unlucky first path', body: '$s \\to a \\to c \\to t$ is chosen: flow 1. Now $s \\to a$ and $c \\to t$ are full. The only way out of $b$ is $b \\to c$, but $c \\to t$ is full: without reverse edges there is no other path. The greedy algorithm stops at 1.' },
            { title: 'The residual graph', body: 'With reverse edges $c \\to a$ (undoing flow) is available: $s \\to b \\to c \\to a \\to d \\to t$. This path cancels the flow on $a \\to c$ and reroutes the flow of $a$ to $d$.' },
            { title: 'Result', body: 'Flow 2: $s \\to a \\to d \\to t$ and $s \\to b \\to c \\to t$. The cut $\\{s\\}$ has capacity $1 + 1 = 2$: this is the maximum.' },
            { title: 'The lesson', body: 'Reverse edges are the ability to **undo** earlier decisions. That is why Ford–Fulkerson reaches the maximum whichever paths it picks, while greedy “fill and forget” falls into a local trap.' },
          ],
          check: [
            {
              id: 'c4',
              kind: 'numeric',
              prompt: 'In this example, if reverse edges are not used and the first path is $s \\to a \\to c \\to t$, at what flow value does the greedy algorithm get stuck?',
              answer: 1,
              hint: 'Once $c \\to t$ is full, is there still a path from $b$ to $t$?',
              explanation: 'The only exit of $b$ is $c$, and the only exit of $c$ is full: the flow stays at 1. With reverse edges it rises to 2.',
            },
          ],
        },
        {
          kind: 'mistakes',
          title: 'Common mistakes',
          body: `- Forgetting the backward (undo) edges: without them, greedy path choices can get stuck at a non-optimal flow.
- Adding the edges from $T$ to $S$ to the capacity of a cut: only $S \\to T$ edges count.
- Taking the bottleneck to be the largest capacity on the path: it is the **smallest** residual capacity.
- Believing Ford–Fulkerson always runs in polynomial time: the path selection rule matters.`,
        },
      ],
      quiz: [
        {
          id: 'q1',
          kind: 'mcq',
          prompt: 'Which is always true for any flow $f$ and any $s$–$t$ cut $(S, T)$?',
          options: ['$|f| \\ge c(S, T)$', '$|f| \\le c(S, T)$', '$|f| = c(S, T)$', 'There is no relation'],
          answer: 1,
          hint: 'Lemma 2.',
          explanation: 'All of the flow must cross the cut in the $S \\to T$ direction; the capacity of those edges cannot be exceeded. Equality holds only for a maximum flow and a minimum cut.',
        },
        {
          id: 'q2',
          kind: 'mcq',
          prompt: 'In the residual graph the backward edge $(v, u)$ has capacity $f(u, v)$. What does it mean?',
          options: ['A new pipe from $v$ to $u$', 'The part of the flow sent along $(u, v)$ that can be taken back', 'Where flow gets lost', 'An edge crossing the cut'],
          answer: 1,
          hint: 'Taking back flow already sent.',
          explanation: '“Sending” flow along the backward edge means reducing the flow on $(u, v)$. This is how earlier bad choices are corrected.',
        },
        {
          id: 'q3',
          kind: 'numeric',
          prompt: 'In a matching network with all capacities 1, $|V_1| = |V_2| = 5$ and the maximum flow is 4. How many edges does a largest matching have?',
          answer: 4,
          hint: 'Flow value = matching size.',
          explanation: 'Units of flow are disjoint $s \\to x \\to y \\to t$ paths; each is one matching edge. 4 edges: there is no perfect matching.',
        },
        {
          id: 'q4',
          kind: 'mcq',
          prompt: 'If all capacities are integers, what can be said about the maximum flow found by Ford–Fulkerson?',
          options: ['The flow on every edge is an integer.', 'The flow can be fractional.', 'The flow is always 1.', 'The algorithm might not stop.'],
          answer: 0,
          hint: 'Bottlenecks are always integers.',
          explanation: 'Every bottleneck is an integer, so every augmentation keeps the flow integral; the algorithm stops after at most $|f^*|$ steps.',
        },
      ],
      practice: [
        {
          id: 'p1',
          prompt: `Our own example: edges s→a (3), s→b (2), a→b (1), a→t (2), b→t (3). Run Ford–Fulkerson by hand (with paths of your choice). Find the maximum flow and a minimum cut.`,
          hints: ['First s→a→t and s→b→t.', 'With the remaining residual capacities, is s→a→b→t possible?'],
          solution: `s→a→t: bottleneck 2, $|f| = 2$. s→b→t: bottleneck 2, $|f| = 4$. s→a→b→t: residual capacities 1, 1, 1 → $|f| = 5$. Both edges leaving $s$ are now saturated: $S = \\{s\\}$, capacity $3 + 2 = 5 = |f|$. The maximum flow is 5; $(\\{s\\}, \\{a, b, t\\})$ is a minimum cut ($\\{s, a, b\\}$, with capacity $2 + 3 = 5$, is another one).`,
        },
        {
          id: 'p2',
          prompt: `Our own example: in this network ($s \\to a$, $s \\to b$, $a \\to t$, $b \\to t$ with capacity $C = 100$, $a \\to b$ with capacity 1) list every $s$–$t$ cut (by which of $a$ and $b$ join the $s$ side). Which ones are minimum?`,
          hints: ['Four cuts: $\\{s\\}$, $\\{s, a\\}$, $\\{s, b\\}$, $\\{s, a, b\\}$.', 'Only edges from the $s$ side to the $t$ side count.'],
          solution: `$\\{s\\}$: $s \\to a$ + $s \\to b$ = 200. $\\{s, a\\}$: $s \\to b$ + $a \\to t$ + $a \\to b$ = 201. $\\{s, b\\}$: $s \\to a$ + $b \\to t$ = 200 ($a \\to b$ points backwards and does not count). $\\{s, a, b\\}$: $a \\to t$ + $b \\to t$ = 200. Three cuts are minimum (200), and in line with the max-flow min-cut theorem the maximum flow is 200 too. At the end of Ford–Fulkerson, the nodes reachable from $s$ in the residual graph give one of these minimum cuts: here $\\{s\\}$.`,
        },
      ],
      sources: [SRC.l16.notes, SRC.l16.slides, SRC.l16.pre, SRC.l16.concept],
    },
  ],
}
