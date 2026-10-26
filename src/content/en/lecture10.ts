import type { Lecture } from '../types'
import { SRC } from '../sources'
import { SCC_CODE } from '../../engines/scc'

export const lecture10: Lecture = {
  n: 10,
  title: 'Strongly Connected Components',
  titleEn: 'Strongly Connected Components',
  date: 'February 9, 2026',
  blurb: 'Splitting a directed graph into its strongly connected components with two DFS passes: $O(n + m)$.',
  lessons: [
    {
      id: 'l10-scc',
      lecture: 10,
      title: 'Strongly connected components (SCC)',
      titleEn: 'Strongly connected components (SCC)',
      summary: 'The meta-graph of the components is a DAG; finishing times in the reversed graph peel off the SCCs one by one.',
      minutes: 55,
      objectives: [
        'Define connected components of undirected graphs and strongly connected components (SCCs) of directed graphs.',
        'Explain why the meta-graph of the SCCs is acyclic.',
        'Run the two-pass algorithm (first $G_{rev}$, then $G$ in decreasing order of $f$) step by step.',
        'Explain the Key Lemma and the inductive step of the correctness proof.',
      ],
      prerequisites: ['DFS and finishing times (Lecture 9)', 'Equivalence relations'],
      sections: [
        {
          kind: 'intuition',
          title: 'Intuition: mutual reachability',
          label: 'intuition',
          body: `Finding components in an undirected graph was easy: search from a node, and everything you reach is one component (Lecture 9).

In a directed graph “I can get from $u$ to $v$” and “I can get from $v$ to $u$” are different things. A **strongly connected component** is a **maximal** set of nodes in which every node has a directed path to every other. Clusters of web pages that link to each other, districts of a city with one-way streets that you can drive around in… all of them are SCCs.

One DFS is not enough: a search from $u$ may leak **outside** $u$’s SCC. The fix is to run DFS twice, in the right order.`,
        },
        {
          kind: 'formal',
          title: 'Definitions (Lecture 10 notes)',
          box: 'formal',
          label: 'formal',
          body: `- **Connected component (undirected):** $u \\sim v \\iff$ there is a path from $u$ to $v$. This is an equivalence relation; its equivalence classes are the components.
- **Strongly connected component (directed):** $u \\sim v \\iff$ there is a path from $u$ to $v$ **and** one from $v$ to $u$. Again reflexive, symmetric and transitive: the SCCs are equivalence classes, and every node is in exactly one SCC.
- **Weakly connected component:** a component of the undirected graph obtained by forgetting the directions.

**Meta-graph:** shrink every SCC to a single node; draw an arc from $C_h$ to $C_\\ell$ if there is at least one edge between them. This meta-graph is **acyclic (a DAG)**: if it had a cycle, all SCCs on the cycle would be mutually reachable, i.e. one single SCC.`,
          check: [
            {
              id: 'c1',
              kind: 'mcq',
              prompt: 'How many strongly connected components does a DAG with $n$ nodes have?',
              options: ['1', '$n$', '$n - 1$', 'It depends on the number of edges'],
              answer: 1,
              hint: 'Can two distinct nodes of a DAG be mutually reachable?',
              explanation: 'Two distinct mutually reachable nodes would form a cycle. A DAG has no cycle: every node is an SCC on its own, $n$ in total.',
            },
          ],
        },
        {
          kind: 'pseudocode',
          title: 'The two-pass algorithm (notes, Algorithms 1–3)',
          code: SCC_CODE,
          body: `The notes first run DFS on the **reversed graph** ($G_{rev}$) to compute finishing times, then process the nodes of $G$ in decreasing order of $f$. CLRS and the lecture use the opposite order (first $G$, then $G_{rev}$); since $G$ and $G_{rev}$ have the same SCCs, both versions find the same decomposition (Remark 4).`,
        },
        {
          kind: 'viz',
          title: 'SCC visualizer',
          viz: 'scc',
          tasks: [
            'Watch pass 1: which node gets the largest finishing time in the reversed graph?',
            'In pass 2, which node does the first DFS start from and which nodes does it collect? Is that set an SCC?',
            'Looking at the meta-graph of the colored components, explain why each new DFS cannot leak out of its SCC.',
            'In **prediction mode**, guess the start node of every DFS in pass 2.',
          ],
          body: `In pass 1 the edges are drawn reversed and the finishing time $f$ is written under each node. In pass 2 the edges point their original way again; every color is one SCC and ★ marks its leader (where the DFS started).`,
          check: [
            {
              id: 'c2',
              kind: 'numeric',
              prompt: 'How many strongly connected components does the graph in the visualizer have?',
              answer: 4,
              hint: '$a, b, c$ form a cycle; $d$ and $e$ point to each other; $f, g, h$ form a cycle.',
              explanation: '$\\{a, b, c\\}$, $\\{d, e\\}$, $\\{f, g, h\\}$ and the lone $\\{i\\}$: four SCCs. Meta-graph: $\\{a,b,c\\} \\to \\{d,e\\} \\to \\{f,g,h\\}$ and $\\{a,b,c\\} \\to \\{i\\}$.',
            },
          ],
        },
        {
          kind: 'correctness',
          title: 'The Key Lemma (Lemma 5)',
          label: 'formalProof',
          proof: [
            { title: 'Claim', body: '$C_1$ and $C_2$ are SCCs and $G$ has an edge $(i, j)$ with $i \\in C_1$, $j \\in C_2$. Let $f$ be the finishing times of DFS-Loop on $G_{rev}$. Then $\\max_{v \\in C_1} f(v) < \\max_{v \\in C_2} f(v)$.' },
            { title: 'Setup', body: 'In $G_{rev}$ the edge becomes $(j, i)$: $C_2 \\to C_1$. $G$ and $G_{rev}$ have the same SCCs. Let $v$ be the first node of $C_1 \\cup C_2$ that DFS-Loop visits.' },
            { title: 'Case 1: v ∈ C1', body: 'Since the meta-graph is acyclic, $G_{rev}$ has no path from $v$ to $C_2$. DFS discovers everything reachable and nothing more: it finishes $C_1$ without touching $C_2$. All finishing times in $C_1$ are smaller than those in $C_2$.' },
            { title: 'Case 2: v ∈ C2', body: 'From $v$ all of $C_1 \\cup C_2$ is reachable (everywhere inside $C_2$, then into $C_1$ through $(j, i)$). The DFS call at $v$ does not end before finishing all of them: $f(v)$ is the largest finishing time in $C_1 \\cup C_2$.' },
            { title: 'Conclusion', body: 'In both cases the largest $f$ of $C_1$ is smaller than that of $C_2$. So every edge of $G$ from one SCC to another **increases** the largest $f$ value.' },
          ],
        },
        {
          kind: 'correctness',
          title: 'Correctness: peeling the SCCs like an onion',
          label: 'proofIdea',
          proof: [
            { title: 'Hypothesis', body: 'Before DFS is called on $v$ in pass 2, the set $S$ of already explored nodes is a union of SCCs.' },
            { title: 'At least its own SCC', body: 'Let $C$ be $v$’s SCC. Since $v \\notin S$ and $S$ is a union of SCCs, $C \\cap S = \\emptyset$: the call explores all of $C$.' },
            { title: 'But nothing more', body: 'By the Key Lemma, every edge $(i, j)$ leaving $C$ goes to an SCC $C\'$ whose largest $f$ exceeds $f(v)$. Nodes are processed in decreasing $f$, so that node was processed earlier, i.e. $C\' \\subseteq S$. The call cannot enter $C\'$.' },
            { title: 'Conclusion', body: 'Every call collects exactly one SCC and $S$ stays a union of SCCs. The nodes sharing a leader are exactly the SCCs.' },
          ],
        },
        {
          kind: 'complexity',
          title: 'Running time',
          body: `Building the reversed graph takes $O(n + m)$; the two DFS-Loop calls take $O(n + m)$; the order of pass 2 needs no sorting: append nodes to a list as they finish in pass 1 and read the list backwards. Total **$O(n + m)$**, i.e. linear.`,
        },
        {
          kind: 'text',
          title: 'In practice: what are SCCs good for?',
          body: `- **The structure of the web:** the web graph consists of a giant central SCC plus sets of pages that lead into it and out of it (the “bow-tie” structure).
- **2-SAT:** in an “implication graph” with a node for every variable and its negation, the formula is unsatisfiable exactly when some $x$ and $\\neg x$ are in the same SCC; this is decided in linear time.
- **Code analysis:** in the graph of which function calls which, SCCs are groups of mutually recursive functions; compilers and loaders process them together.
- **Condensation:** shrinking every SCC to one node turns the graph into a DAG; on a DAG, problems like topological order or longest paths become easy.`,
          check: [
            {
              id: 'c3',
              kind: 'mcq',
              prompt: 'Suppose that after shrinking the SCCs of a graph you find a cycle in the meta-graph. What does it mean?',
              options: ['The meta-graph was built wrongly: the components on the cycle should have been a single SCC.', 'The graph has a negative cycle.', 'The graph is undirected.', 'That is normal; meta-graphs can have cycles.'],
              answer: 0,
              hint: 'Are any two components on the cycle mutually reachable?',
              explanation: 'Along the cycle everybody can reach everybody; those components are really one SCC. A correctly built meta-graph is always a DAG.',
            },
          ],
        },
        {
          kind: 'steps',
          title: 'Worked example: the SCC graph (condensation)',
          label: 'formal',
          body: `Our own example: $a \\to b$, $b \\to c$, $c \\to a$, $c \\to d$, $d \\to e$, $e \\to d$, $e \\to f$. What do we get if we shrink every SCC to a single node?`,
          proof: [
            { title: 'The components', body: '$a \\to b \\to c \\to a$ is a cycle: $\\{a, b, c\\}$. $d \\leftrightarrow e$: $\\{d, e\\}$. Nothing is reachable from $f$: $\\{f\\}$. 3 SCCs in total.' },
            { title: 'Condensation', body: 'Every SCC becomes one node and the edges between SCCs stay: $\\{a,b,c\\} \\to \\{d,e\\} \\to \\{f\\}$. This graph is **always a DAG**: if the SCC graph had a cycle, the components on it would be mutually reachable and would merge into one SCC.' },
            { title: 'Link to the algorithm', body: 'The first DFS of the two-pass algorithm finds a topological order of this DAG (through finish times): the largest finish time lies in a source component. The second pass runs on the reversed graph in that order, so each time it “peels off” exactly one component.' },
            { title: 'Adding an edge', body: 'Adding $f \\to a$ creates the cycle $a \\leadsto f \\to a$ and everything merges into a single SCC. Adding $f \\to d$ merges only $\\{d, e, f\\}$: 2 SCCs.' },
          ],
          check: [
            {
              id: 'c4',
              kind: 'numeric',
              prompt: 'How many SCCs remain after the edge $f \\to d$ is added to this graph?',
              answer: 2,
              hint: 'Are $d$, $e$ and $f$ now mutually reachable? And $a$?',
              explanation: '$\\{a, b, c\\}$ and $\\{d, e, f\\}$: there is still no edge from $\\{d, e, f\\}$ back to $\\{a, b, c\\}$.',
            },
          ],
        },
        {
          kind: 'mistakes',
          title: 'Common mistakes',
          body: `- Processing the nodes of pass 2 in **increasing** finishing time: then the first DFS may start in a “source” SCC and collect several SCCs at once.
- Running both passes on the same graph: one of them must be on $G_{rev}$.
- Believing the node with the largest finishing time is an SCC on its own; we only know that its SCC sits at one end of the meta-graph.
- Mixing up weak and strong connectivity: a single edge $a \\to b$ makes $a$ and $b$ weakly but not strongly connected.`,
        },
      ],
      quiz: [
        {
          id: 'q1',
          kind: 'mcq',
          prompt: 'How long does it take to find the SCCs of a directed graph given as adjacency lists?',
          options: ['$O(n + m)$', '$O((n + m)\\log n)$', '$O(n \\cdot m)$', '$O(n^3)$'],
          answer: 0,
          hint: 'How many DFS passes are made?',
          explanation: 'Building the reversed graph and two DFS passes, all linear: $O(n + m)$.',
          feedback: { 2: 'A separate search from every node would take this long; the two-pass algorithm is faster.' },
        },
        {
          id: 'q2',
          kind: 'numeric',
          prompt: 'A directed cycle on 10 nodes ($1 \\to 2 \\to \\dots \\to 10 \\to 1$) gets an extra edge $1 \\to 5$. How many SCCs are there?',
          answer: 1,
          hint: 'On a cycle, can everybody reach everybody?',
          explanation: 'The cycle already makes all nodes mutually reachable; a new edge cannot break that. A single SCC.',
        },
        {
          id: 'q3',
          kind: 'mcq',
          prompt: 'In the two-pass algorithm, why does the first DFS of pass 2 collect only **one** SCC?',
          options: [
            'Because DFS can never leave an SCC.',
            'Because in $G$ no edge leaves the SCC of the node with the largest $f$ (Key Lemma).',
            'Because all edges are deleted in pass 2.',
            'Because pass 1 colored every node black.',
          ],
          answer: 1,
          hint: 'If an edge did leave it, what would the Lemma say about the largest $f$ of the target SCC?',
          explanation: 'A leaving edge $(i, j)$ would go to an SCC with a larger maximum $f$ — but we started at the node with the largest $f$ overall. So no such edge exists.',
        },
        {
          id: 'q4',
          kind: 'mcq',
          prompt: 'How do the SCCs change if the edge $h \\to a$ is added to the graph in the visualizer?',
          options: ['They do not change.', '$\\{a, b, c, d, e, f, g, h\\}$ becomes one SCC and $\\{i\\}$ stays separate.', 'All nodes become one SCC.', '$\\{f, g, h\\}$ splits in two.'],
          answer: 1,
          hint: 'In the meta-graph the arc $\\{f,g,h\\} \\to \\{a,b,c\\}$ closes a cycle.',
          explanation: 'The cycle $\\{a,b,c\\} \\to \\{d,e\\} \\to \\{f,g,h\\} \\to \\{a,b,c\\}$ merges the three components. Nothing leaves $i$, so it stays separate.',
        },
      ],
      practice: [
        {
          id: 'p1',
          prompt: `Our own example: edges 1→2, 2→3, 3→1, 3→4, 4→5, 5→6, 6→4, 6→7. Run the two-pass algorithm by hand (in pass 1 try the nodes of $G_{rev}$ from 7 down to 1). Write the finishing times, the order of pass 2 and the SCCs.`,
          hints: ['DFS from 7 in $G_{rev}$: 7 → 6 → 5 → 4 → 3 → 2 → 1.', 'Pass 2 starts from the largest $f$; where can you go from that node in $G$?'],
          solution: `Edges of $G_{rev}$: 2→1, 3→2, 1→3, 4→3, 5→4, 6→5, 4→6, 7→6. DFS from 7 discovers 7, 6, 5, 4, 3, 2, 1 in that order (4’s neighbors are 3 and 6; 6 is already explored). Finishing times: 1 → 1, 2 → 2, 3 → 3, 4 → 4, 5 → 5, 6 → 6, 7 → 7. Order of pass 2: 7, 6, 5, 4, 3, 2, 1. In $G$ nothing leaves 7: $\\{7\\}$. From 6: 6 → 4 → 5 (7 is explored): $\\{4, 5, 6\\}$. Then from 3: 3 → 1 → 2: $\\{1, 2, 3\\}$. Three SCCs; meta-graph $\\{1,2,3\\} \\to \\{4,5,6\\} \\to \\{7\\}$.`,
        },
        {
          id: 'p2',
          prompt: `Our own example: we want to make the graph above ($a \\to b \\to c \\to a$, $c \\to d$, $d \\leftrightarrow e$, $e \\to f$) strongly connected by adding **a single edge**. Which edges work? Why?`,
          hints: ['The SCC graph is a chain: $\\{a,b,c\\} \\to \\{d,e\\} \\to \\{f\\}$.', 'The new edge has to go from the end of the chain back to its start.'],
          solution: `Since the SCC graph is a chain, the single edge must go from the **last** component (\\{f\\}) to the **first** one (\\{a, b, c\\}): $f \\to a$, $f \\to b$ or $f \\to c$. All three put every node on one cycle. $f \\to d$ only merges the last two components; $e \\to a$ leaves $\\{f\\}$ outside ($f$ has no outgoing edge). In general, one edge is enough when the SCC graph is a chain with one source and one sink; with many sources or sinks more edges are needed.`,
        },
      ],
      sources: [SRC.l10.notes, SRC.l10.slides, SRC.l10.pre, SRC.l10.notebook, SRC.l10.concept],
    },
  ],
}
