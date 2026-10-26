import type { Lecture } from '../types'
import { SRC } from '../sources'
import { BFS_CODE, DFS_CODE } from '../../engines/graphSearch'

export const lecture9: Lecture = {
  n: 9,
  title: 'Graphs and BFS and DFS',
  titleEn: 'Graphs and BFS and DFS',
  date: 'February 4, 2026',
  blurb: 'Storing and traversing graphs: depth-first and breadth-first search, both $O(n + m)$.',
  lessons: [
    {
      id: 'l9-graphs',
      lecture: 9,
      title: 'Graph representations and breadth-first search (BFS)',
      titleEn: 'Graph representations and breadth-first search (BFS)',
      summary: 'Adjacency lists and matrices; BFS layers and unweighted shortest paths.',
      minutes: 45,
      objectives: [
        'Compare the memory and query costs of adjacency lists and adjacency matrices.',
        'Watch BFS discover nodes layer by layer, in order of distance from the source.',
        'Explain the induction proof of the proposition $L_i = \\{x : d(s, x) = i\\}$.',
        'Show that BFS runs in $O(n + m)$ time.',
      ],
      prerequisites: ['Induction', 'Queue and stack data structures'],
      sections: [
        {
          kind: 'intuition',
          title: 'Intuition: graphs are everywhere',
          label: 'intuition',
          body: `A **graph** $G = (V, E)$ consists of nodes and the edges connecting them. Roads and junctions, friendship networks, web pages and links, course prerequisites… all of them are graphs. In an undirected graph an edge goes both ways; in a directed graph $(u, v)$ only goes from $u$ to $v$.

From this lecture on we write $n = |V|$ and $m = |E|$. A graph has at most $n^2$ edges; if it has far fewer, it is **sparse**, if it has close to that many, it is **dense**.

First question: starting from one node, how do we find everything reachable from it, visiting the nodes closest to the source first?`,
        },
        {
          kind: 'formal',
          title: 'Representation: list or matrix?',
          box: 'info',
          label: 'formal',
          body: `- **Adjacency matrix:** an $n \\times n$ table with $A[u][v] = 1 \\iff (u, v) \\in E$. “Is $(u, v)$ an edge?” takes $O(1)$; but memory is always $\\Theta(n^2)$ and listing a node’s neighbors takes $\\Theta(n)$.
- **Adjacency list:** for every $u$, the list of its neighbors. Memory $\\Theta(n + m)$; listing the neighbors of $u$ takes $O(\\deg(u))$; but “is $(u, v)$ an edge?” takes $O(\\deg(u))$. For directed graphs it helps to keep two lists, of out-neighbors and in-neighbors.

**Rule of thumb:** lists for sparse graphs ($m \\ll n^2$), a matrix for very dense ones. The algorithms in this lecture assume adjacency lists.`,
          check: [
            {
              id: 'c1',
              kind: 'mcq',
              prompt: 'Which representation suits a social network with $n = 10^6$ users and about 100 friendships each?',
              options: [
                'Adjacency matrix, because edge queries take $O(1)$.',
                'Adjacency list: a matrix would need $10^{12}$ cells, a list only $\\approx 10^8$ entries.',
                'Both use the same memory.',
                'Neither; the graph cannot be stored.',
              ],
              answer: 1,
              hint: 'The matrix has $n^2$ cells; the list has about $n + 2m$ entries.',
              explanation: '$m \\approx 5 \\cdot 10^7$ edges, so the graph is very sparse. A matrix needs $10^{12}$ cells (terabytes) while a list makes do with $n + 2m \\approx 10^8$ entries.',
            },
          ],
        },
        {
          kind: 'pseudocode',
          title: 'BFS(s) (notes, Algorithm 5)',
          code: BFS_CODE,
          body: `BFS discovers every node at distance $k$ from the source **before** any node at distance $k + 1$. The sets $L_i$ are the layers; $p(x)$ is the node that discovered $x$, and the $p$ pointers form a **BFS tree**.`,
        },
        {
          kind: 'viz',
          title: 'BFS visualizer',
          viz: 'bfs',
          tasks: [
            'Run BFS from $s$ on the layered graph: which nodes make up each layer?',
            'Change the source (try $g$). How do the layers change?',
            'Follow the green tree edges: how many edges does the tree path from the source to each node have?',
            'In **prediction mode**, guess which layer each newly discovered node joins.',
          ],
          body: `The label under each node is its layer number ($L_i$ = distance $i$ from the source). The edge being scanned is yellow; the edges of the BFS tree are green. In undirected graphs every edge is scanned from both ends.`,
          check: [
            {
              id: 'c2',
              kind: 'numeric',
              prompt: 'In the layered graph of the visualizer, which layer does BFS from $s$ put node $g$ in? (Type the number only.)',
              answer: 3,
              hint: 'Is there a shorter path than $s \\to b \\to e \\to g$?',
              explanation: '$L_1 = \\{a, b, c\\}$, $L_2 = \\{d, e\\}$, $L_3 = \\{f, g\\}$. The shortest path to $g$ has 3 edges.',
            },
          ],
        },
        {
          kind: 'correctness',
          title: 'BFS finds shortest paths (Proposition 1)',
          label: 'formalProof',
          proof: [
            { title: 'Claim', body: 'For every $i$, $L_i = \\{x : d(s, x) = i\\}$. $d(s, x)$: the length of a path from $s$ to $x$ with the fewest edges.' },
            { title: 'Base case', body: '$i = 0$: $L_0 = \\{s\\}$, and $s$ is the only node at distance 0.' },
            { title: 'Hypothesis', body: 'Assume $L_j = \\{x : d(s, x) = j\\}$ for every $j \\le i$ (strong induction).' },
            { title: '(1) Added to the right layer', body: 'If $y$ was added to $L_{i+1}$ through $x \\in L_i$, then $d(s, y) \\le d(s, x) + 1 = i + 1$. Since $y$ is in no $L_j$ with $j \\le i$, the hypothesis gives $d(s, y) > i$. So $d(s, y) = i + 1$.' },
            { title: '(2) Distance i + 1 gets added', body: 'Let $d(s, y) = i + 1$ and let $x$ be the node before $y$ on a shortest $s \\to y$ path. The part $s \\to x$ is shortest and has length $i$, so $x \\in L_i$ by the hypothesis. When $x$ is processed, $(x, y)$ is scanned; if $y$ was not seen yet it is added to $L_{i+1}$, and if it was, another node of $L_i$ already added it to $L_{i+1}$.' },
          ],
        },
        {
          kind: 'complexity',
          title: 'Running time: O(n + m)',
          body: `Initialization is $O(n)$. Each node is removed from a layer once: $O(1)$ per node. When a node is processed all its neighbors are scanned; each edge is scanned once in a directed graph and twice in an undirected one: $O(1)$ per edge. In total
$$O(\\#\\text{visits} + \\#\\text{edge scans}) = O(n + m).$$
That is the time it takes to read the input: we cannot do better.`,
        },
        {
          kind: 'text',
          title: 'In practice: where is BFS used?',
          body: `- **Unweighted shortest paths:** fewest transfers on a metro line, “how many hops away?” in a social network, fewest moves in puzzles and games (every state is a node).
- **Web crawlers** visit pages layer by layer, by link distance.
- **Testing bipartiteness:** color the BFS layers with two colors; an edge between two nodes of the same layer means the graph is not bipartite.
- **Weighted graphs** need more than BFS: in Lecture 11, Dijkstra takes over once weights appear.`,
          check: [
            {
              id: 'c3',
              kind: 'mcq',
              prompt: 'In a road network whose edges have different lengths (weights), what can be said about the path BFS finds?',
              options: ['It is always the path of shortest total length.', 'It is the path with the fewest **edges**; it may not be shortest by total length.', 'It is the longest path.', 'It is a random path.'],
              answer: 1,
              hint: 'What do the BFS layers count?',
              explanation: 'BFS minimizes the number of edges. One long edge can be worse than two short ones; that requires Dijkstra.',
            },
          ],
        },
        {
          kind: 'steps',
          title: 'Worked example: testing bipartiteness with BFS',
          label: 'formal',
          body: `An undirected graph is **bipartite** if its nodes can be colored with two colors so that every edge joins different colors (for example students and courses). The layers of BFS test this directly.`,
          proof: [
            { title: 'Coloring', body: 'Run BFS from $s$ and color every node by whether $d(s, v)$ is even or odd. An edge joins either two neighboring layers or the same layer (by Proposition 1 it cannot skip a layer).' },
            { title: 'First case', body: 'If no edge joins two nodes of the same layer, the coloring is valid: the graph is bipartite.' },
            { title: 'Second case', body: 'If an edge $(u, v)$ joins two nodes of the same layer, the two equally long paths from $s$ to $u$ and to $v$ together with $(u, v)$ contain an **odd cycle**. An odd cycle cannot be two-colored: the graph is not bipartite.' },
            { title: 'Conclusion', body: 'A graph is bipartite if and only if it has no odd cycle, and we test this in $O(n + m)$. A cycle of length 6, for example, is bipartite; a cycle of length 5 is not.' },
          ],
          check: [
            {
              id: 'c4',
              kind: 'mcq',
              prompt: 'Which of these graphs is bipartite?',
              options: ['A cycle on 5 nodes', 'A cycle on 6 nodes', 'A triangle', 'The complete graph on 4 nodes'],
              answer: 1,
              hint: 'Look for an odd cycle.',
              explanation: 'On a cycle of length 6 the colors alternate. All the others contain an odd cycle (of length 5 or 3).',
            },
          ],
        },
        {
          kind: 'mistakes',
          title: 'Common mistakes',
          body: `- Marking a node as visited when it is **removed** from the queue: then the same node enters the queue several times. A node must be marked when it is first **seen** (the notes’ $vis[x] = $ true).
- Believing BFS also finds shortest paths in weighted graphs.
- Thinking the running time is $O(n \\cdot m)$ or $O(n^2)$: with adjacency lists every edge is scanned a constant number of times, $O(n + m)$ in total. With an adjacency **matrix** it becomes $O(n^2)$.
- Forgetting nodes unreachable from the source: BFS never discovers them; their distance stays $\\infty$.`,
        },
      ],
      quiz: [
        {
          id: 'q1',
          kind: 'mcq',
          prompt: 'What is the running time of BFS on a graph stored as adjacency lists?',
          options: ['$O(n)$', '$O(n + m)$', '$O(n \\log n + m)$', '$O(n^2)$'],
          answer: 1,
          hint: 'How much work per node and per edge?',
          explanation: 'Every node is processed once and every edge is scanned at most twice: $O(n + m)$.',
          feedback: { 3: 'That is the running time with an adjacency matrix.' },
        },
        {
          id: 'q2',
          kind: 'mcq',
          prompt: 'BFS added node $y$ to $L_4$. Which of the following is certainly true?',
          options: ['$d(s, y) \\le 3$', '$d(s, y) = 4$', '$d(s, y) \\ge 5$', 'The degree of $y$ is 4'],
          answer: 1,
          hint: 'Proposition 1.',
          explanation: '$L_i$ is exactly the set of nodes at distance $i$.',
        },
        {
          id: 'q3',
          kind: 'mcq',
          prompt: 'BFS and DFS share the same skeleton; which data structure makes the difference?',
          options: ['BFS uses a stack, DFS a queue.', 'BFS uses a queue (FIFO), DFS a stack (LIFO).', 'Both use a priority queue.', 'BFS uses a hash table, DFS an array.'],
          answer: 1,
          hint: 'Do we process the oldest or the newest discovered node first?',
          explanation: 'A queue returns the oldest (closest) node first: breadth. A stack returns the newest node: depth.',
        },
        {
          id: 'q4',
          kind: 'numeric',
          prompt: 'In an undirected graph with $n = 100$ nodes, at most how many (non-empty) layers, including $L_0$, can BFS create?',
          answer: 100,
          hint: 'In which graph does every layer contain a single node?',
          explanation: 'In a path graph with the source at one end every layer has one node: $L_0, \\dots, L_{99}$, 100 layers in total.',
        },
      ],
      practice: [
        {
          id: 'p1',
          prompt: `Our own example: nodes 1–8, undirected edges 1–2, 1–3, 2–4, 3–4, 4–5, 5–6, 5–7, 6–8, 7–8. Run BFS from 1 (scan neighbors from smallest to largest). Write the layers and the BFS tree. How many edges does a shortest path to 8 have?`,
          hints: ['$L_1 = \\{2, 3\\}$.', '4 is reached from both 2 and 3; which one becomes its parent?'],
          solution: `$L_0 = \\{1\\}$, $L_1 = \\{2, 3\\}$, $L_2 = \\{4\\}$ ($p(4) = 2$, since 2 is processed first), $L_3 = \\{5\\}$, $L_4 = \\{6, 7\\}$, $L_5 = \\{8\\}$ ($p(8) = 6$). Tree edges: 1–2, 1–3, 2–4, 4–5, 5–6, 5–7, 6–8. A shortest path to 8 has 5 edges (1–2–4–5–6–8).`,
        },
        {
          id: 'p2',
          prompt: `Our own example: an undirected road network with 10 000 nodes and 30 000 edges. How many cells does an adjacency matrix hold? How many neighbor entries do adjacency lists hold? What is the running time of BFS with each representation?`,
          hints: ['Matrix: $n^2$ cells.', 'In an undirected graph each edge appears in two lists.'],
          solution: `The matrix holds $n^2 = 10^8$ cells; the lists hold $2m = 60\\,000$ neighbor entries (plus 10 000 list heads). With a matrix BFS scans every node’s whole row: $\\Theta(n^2) = 10^8$ steps. With lists it takes on the order of $O(n + m) = 40\\,000$. For sparse graphs ($m \\ll n^2$) lists win clearly in both memory and time; a matrix makes sense when you need to answer “is $(u, v)$ an edge?” in $O(1)$ or the graph is dense.`,
        },
      ],
      sources: [SRC.l9.notes, SRC.l9.slides, SRC.l9.pre, SRC.l9.notebook, SRC.l9.concept],
    },
    {
      id: 'l9-dfs',
      lecture: 9,
      title: 'Depth-first search (DFS) and its applications',
      titleEn: 'Depth-first search (DFS) and its applications',
      summary: 'Discovery and finish times, connected components and topological sorting.',
      minutes: 45,
      objectives: [
        'Run DFS step by step with discovery times $d(v)$ and finish times $f(v)$.',
        'Explain the meaning of the white/gray/black colors and why DFS takes $O(n + m)$.',
        'Find the connected components of an undirected graph with DFS.',
        'See that in a DAG, decreasing finish time is a topological order.',
      ],
      prerequisites: ['BFS and graph representations', 'Recursion'],
      sections: [
        {
          kind: 'intuition',
          title: 'Intuition: following a thread through a maze',
          label: 'intuition',
          body: `Imagine walking through a maze holding a ball of thread: you go as far as you can; at a dead end or at a place you have already been, you follow the thread back to the first unexplored turn and take it. That is exactly DFS: **deep first**, back only when needed.

We add two timestamps to DFS: the moment we first arrive at a node, $d(v)$ (**discovery**), and the moment we are completely done with it, $f(v)$ (**finish**). These times are the key to many graph algorithms (topological sorting, strongly connected components).`,
        },
        {
          kind: 'pseudocode',
          title: 'DFS(s, t) and DFS(G) (notes, Algorithms 2 and 4)',
          code: DFS_CODE,
          body: `**White:** not discovered yet. **Gray:** discovered but not finished (on the recursion stack). **Black:** finished. In the notes, time advances by one at every discovery and at every return; so every node gets an interval $[d(v), f(v)]$.`,
          check: [
            {
              id: 'c1',
              kind: 'numeric',
              prompt: 'In the notes’ DFS example (a→b, b→c, c→a, c→d, e→f), starting from $a$, what is $f(a)$?',
              answer: 8,
              hint: '$d(a) = 1, d(b) = 2, d(c) = 3, d(d) = 4$; then the returns.',
              explanation: '$f(d) = 5$, $f(c) = 6$, $f(b) = 7$, $f(a) = 8$. Then a new DFS from $e$: $(9, 12)$, and $(10, 11)$ for $f$.',
            },
          ],
        },
        {
          kind: 'viz',
          title: 'DFS visualizer',
          viz: 'dfs',
          tasks: [
            'Play the notes’ example and compare the $d/f$ values under each node with the notes.',
            'What color is $a$ when the edge $c \\to a$ is scanned? What does that tell you about the graph?',
            'Run DFS on the layered graph as well: how do the tree edges differ from the BFS tree?',
            'In **prediction mode**, answer “go into it or skip it?” for every edge.',
          ],
          body: `The $d/f$ labels under the nodes are discovery and finish times. The recursion stack is shown below the picture. In a directed graph an edge into a gray node is a **back edge** and signals a cycle.`,
        },
        {
          kind: 'correctness',
          title: 'Parenthesis structure and running time',
          label: 'proofIdea',
          proof: [
            { title: 'Each node once', body: 'DFS only visits white nodes and immediately colors them gray; no node ever becomes white again. $n$ visits.' },
            { title: 'Each edge a constant number of times', body: '$(u, v)$ is scanned only while $u$ (in the undirected case $u$ or $v$) is visited: once if directed, twice if undirected. Total $O(n + m)$.' },
            { title: 'Nested intervals', body: 'If $v$ is discovered while $u$ is gray, all of $v$’s work ends before $u$ finishes: $d(u) < d(v) < f(v) < f(u)$. Two intervals are either nested or disjoint (parenthesis structure).' },
            { title: 'Reachability', body: 'When DFS($s$) returns, every node reachable from $s$ is black and the unreachable ones are still white.' },
          ],
          check: [
            {
              id: 'c4',
              kind: 'mcq',
              prompt: 'Which pair **cannot** be the $[d, f]$ intervals of two vertices in the same DFS?',
              options: ['$[1, 8]$ and $[2, 5]$', '$[1, 4]$ and $[5, 8]$', '$[1, 6]$ and $[3, 9]$', '$[2, 7]$ and $[3, 4]$'],
              answer: 2,
              hint: 'Two intervals are either nested or disjoint.',
              explanation: '$[1, 6]$ and $[3, 9]$ overlap, but neither contains the other. The vertex discovered at time 3 is a descendant of the one discovered at 1 and must finish before it: $f \\le 5$. The other three pairs are nested or disjoint.',
            },
          ],
        },
        {
          kind: 'viz',
          title: 'Applications: connected components and topological order',
          viz: 'dfsApps',
          tasks: [
            'In **Components** mode play the three-component graph: when does a new component start?',
            'Switch to **Topological order**: how is the order built? Check that every edge goes from left to right.',
          ],
          body: `**Connected components:** DFS($G$) starts a new search from every white node; in an undirected graph each search colors exactly one component. Total time is still $O(n + m)$.

**Topological order:** in a directed acyclic graph (DAG), every edge $u \\to v$ has $f(u) > f(v)$. Listing the nodes by **decreasing** finish time gives an ordering in which every edge points forward (for example, an order in which to take courses with prerequisites).`,
          check: [
            {
              id: 'c2',
              kind: 'mcq',
              prompt: 'In a DAG, why **can’t** $v$ be gray when DFS scans the edge $u \\to v$?',
              options: [
                'Because DFS skips gray nodes.',
                'A gray $v$ is an ancestor of $u$ on the stack, so $v \\leadsto u \\to v$ would be a cycle.',
                'Because $v$ has degree zero.',
                'It can; the topological order still comes out right.',
              ],
              answer: 1,
              hint: 'Gray nodes are the ones on the recursion stack.',
              explanation: 'Every node on the stack has a path to $u$. If $v$ is gray, $v \\leadsto u \\to v$ is a cycle, impossible in a DAG. So $v$ is either white (then it finishes before $u$) or black (already finished): in both cases $f(v) < f(u)$.',
            },
          ],
        },
        {
          kind: 'complexity',
          title: 'BFS and DFS side by side',
          body: `Same skeleton: a start node, a “frontier” structure, adding undiscovered neighbors. A **queue** (FIFO) returns the oldest node → BFS; a **stack** (LIFO) returns the newest → DFS (the recursion stack is a stack too).

- **Time:** both $O(n + m)$.
- **BFS gives:** layers and unweighted distances → paths with the fewest steps.
- **DFS gives:** $d/f$ times and cycle detection → topological order, strongly connected components (Lecture 10).`,
          check: [
            {
              id: 'c5',
              kind: 'mcq',
              prompt: 'In an unweighted graph, which one finds a path from $s$ to $t$ with the **fewest edges**?',
              options: ['Only BFS', 'Only DFS', 'Both', 'Neither'],
              answer: 0,
              hint: 'DFS follows a branch all the way down.',
              explanation: 'BFS proceeds layer by layer, and the layer where it first finds $t$ is the distance. DFS also finds a path to $t$, but it may be long: on a cycle with an $s$–$t$ edge, DFS may first walk around the other side of the cycle.',
            },
          ],
        },
        {
          kind: 'text',
          title: 'In practice: where does DFS show up?',
          body: `- **Build tools and package managers:** dependencies between modules or packages form a DAG; the build order is a topological order. If a cycle is found, they report a “circular dependency” error.
- **Spreadsheets** evaluate a cell after the cells it depends on.
- **Garbage collectors** (mark-and-sweep) run DFS from the root references to mark reachable objects; unmarked ones are freed.
- **Maze and puzzle** solvers use backtracking, a special case of DFS.`,
        },
        {
          kind: 'steps',
          title: 'Worked example: a topological order from finish times',
          label: 'formal',
          body: `Our own small DAG: $a \\to c$, $b \\to c$, $c \\to d$, $c \\to e$ (like courses and their prerequisites). Let us run DFS(G), trying the nodes in alphabetical order.`,
          proof: [
            { title: 'Start at a', body: '$a$: $d = 1$. Its neighbor $c$: $d = 2$. The neighbors of $c$ are $d$ ($d = 3$, $f = 4$) and $e$ ($d = 5$, $f = 6$). Then $c$ finishes ($f = 7$) and $a$ finishes ($f = 8$).' },
            { title: 'Continue at b', body: '$b$ is still white: $d = 9$. Its only neighbor $c$ is already black; $b$ finishes ($f = 10$).' },
            { title: 'Decreasing finish time', body: '$b$ (10), $a$ (8), $c$ (7), $e$ (6), $d$ (4). Since $f(u) > f(v)$ for every edge $u \\to v$, this is a topological order: $b, a, c, e, d$.' },
            { title: 'Not unique', body: '$a$ and $b$ may swap, and so may $d$ and $e$: this DAG has exactly 4 topological orders. Which one DFS finds depends on the order in which it tries the nodes.' },
          ],
          check: [
            {
              id: 'c3',
              kind: 'numeric',
              prompt: 'How many different topological orders does this DAG ($a \\to c$, $b \\to c$, $c \\to d$, $c \\to e$) have?',
              answer: 4,
              hint: '$c$ has to be in the middle.',
              explanation: '$a$ and $b$ before $c$ (2 orders), then $d$ and $e$ (2 orders): $2 \\cdot 2 = 4$.',
            },
          ],
        },
        {
          kind: 'mistakes',
          title: 'Common mistakes',
          body: `- Assigning the finish time at discovery: $f(v)$ is assigned after **all** of $v$’s neighbors have been scanned.
- Listing the topological order by **increasing** finish time: the right order is decreasing.
- Taking the edge back to the parent in an undirected graph for a cycle: in an undirected graph the edge $u$–$p(u)$ is scanned twice, which is not a cycle.
- Believing DFS($s$) visits the whole graph: it only visits what is reachable from $s$; the whole graph needs DFS($G$).`,
        },
      ],
      quiz: [
        {
          id: 'q1',
          kind: 'numeric',
          prompt: 'In the notes’ DFS example the second search starts at $e$. What is $d(e)$?',
          answer: 9,
          hint: '$f(a) = 8$; the DFS($G$) loop then increments $t$ by one.',
          explanation: 'The search from $a$ ends at 8 and $t$ becomes 9: $d(e) = 9$, $d(f) = 10$, $f(f) = 11$, $f(e) = 12$.',
        },
        {
          id: 'q2',
          kind: 'mcq',
          prompt: 'During DFS on a directed graph, an edge into a **gray** node is found. What does it show?',
          options: ['The graph is a tree.', 'The graph has a directed cycle.', 'The graph is disconnected.', 'Nothing; it is a normal situation.'],
          answer: 1,
          hint: 'Gray nodes are on the current path.',
          explanation: 'A gray $v$ is an ancestor on the stack; $v \\leadsto u \\to v$ is a cycle (a back edge).',
        },
        {
          id: 'q3',
          kind: 'order',
          prompt: 'Our own example: in the DAG with edges a→b, a→c, b→d, c→d, c→e, d→f, e→f, run DFS from $a$ scanning neighbors alphabetically, and write the resulting topological order.',
          items: ['a', 'c', 'e', 'b', 'd', 'f'],
          hint: 'Finish order: first f, then d, b, e, c, a.',
          explanation: 'Finish times (with the notes’ time rule): $f$ 5, $d$ 6, $b$ 7, $e$ 10, $c$ 11, $a$ 12. In decreasing order: a, c, e, b, d, f. Every edge goes from left to right. You can follow the same graph in the visualizer’s “Topological order” mode.',
        },
        {
          id: 'q4',
          kind: 'mcq',
          prompt: 'What is the fastest way to count the connected components of an undirected graph?',
          options: ['BFS for every pair of nodes: $O(n^2(n+m))$', 'DFS($G$): every new search is a component, $O(n + m)$ in total', 'Sorting the edges: $O(m \\log m)$', 'The determinant of the adjacency matrix'],
          answer: 1,
          hint: 'Each search colors a whole component.',
          explanation: 'DFS($G$) starts a new search from every node that is still white; the number of searches is the number of components. Time $O(n + m)$.',
        },
      ],
      practice: [
        {
          id: 'p1',
          prompt: `Our own example: course prerequisites Calculus → Probability, Calculus → Linear Algebra, Discrete Math → Algorithms, Probability → Algorithms, Linear Algebra → Machine Learning, Algorithms → Machine Learning. Show that this graph is a DAG and find a topological order with DFS.`,
          hints: ['Start DFS at Calculus, then at Discrete Math, which is still white.', 'Write the nodes by decreasing finish time.'],
          solution: `DFS from Calculus (neighbors alphabetically: Linear Algebra, Probability): Linear Algebra → Machine Learning finishes; Linear Algebra finishes; Probability → Algorithms (Machine Learning is already black) finishes; Probability finishes; Calculus finishes. Then Discrete Math (Algorithms is black) finishes. Finish order: ML, LA, Alg, Prob, Calc, DM. Decreasing: **Discrete Math, Calculus, Probability, Algorithms, Linear Algebra, Machine Learning.** DFS never saw an edge into a gray node, so the graph is acyclic.`,
        },
        {
          id: 'p2',
          prompt: `Our own example: directed edges $a \\to b$, $b \\to c$, $c \\to d$, $d \\to b$, $a \\to e$. Start DFS at $a$ (neighbors in alphabetical order) and write down the times $d$ and $f$ of every node. Does the graph have a cycle? How does DFS notice it?`,
          hints: ['What color is $b$ when the edge $d \\to b$ is examined?', 'An edge into a gray node is a **back edge**.'],
          solution: `$a$: 1/10, $b$: 2/7, $c$: 3/6, $d$: 4/5, $e$: 8/9. While $d$ is processed, the edge $d \\to b$ leads to $b$, which is **gray**: $b$ is still on the stack, so $b \\leadsto d \\to b$ is a cycle ($b \\to c \\to d \\to b$). The rule: a directed graph has a cycle if and only if DFS finds a back edge. That is why DFS gives both a cycle test and (when there is no cycle) a topological order in $O(n + m)$.`,
        },
      ],
      sources: [SRC.l9.notes, SRC.l9.slides, SRC.l9.notebook, SRC.l9.concept],
    },
  ],
}
