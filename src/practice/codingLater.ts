/**
 * Coding exercises for Lectures 8–17. Same contract as coding.ts. Graphs are passed in plain JavaScript
 * shapes (nodes 0…n−1, adjacency lists or [u, v, w] edge lists); expected outputs come from the reference
 * implementations below, which `codingLater.test.ts` cross-checks against the engines behind the visualizers.
 */
import type { Exercise, TestCase } from './coding'
import { makeRng, randInt, type Rng } from '../engines/random'
import { tx } from '../i18n/lang'

type Edge = [number, number, number]
const NONE = null

/* ───────────── Reference implementations ───────────── */

export function refHasPair(A: number[], target: number): boolean {
  const seen = new Set<number>()
  for (const x of A) {
    if (seen.has(target - x)) return true
    seen.add(x)
  }
  return false
}

export function refBfs(adj: number[][], s: number): number[] {
  const d = adj.map(() => -1)
  d[s] = 0
  const q = [s]
  for (let h = 0; h < q.length; h++)
    for (const v of adj[q[h]])
      if (d[v] === -1) {
        d[v] = d[q[h]] + 1
        q.push(v)
      }
  return d
}

export function refHasCycle(adj: number[][]): boolean {
  const color = adj.map(() => 0)
  const visit = (u: number): boolean => {
    color[u] = 1
    for (const v of adj[u]) if (color[v] === 1 || (color[v] === 0 && visit(v))) return true
    color[u] = 2
    return false
  }
  return adj.some((_, u) => color[u] === 0 && visit(u))
}

export function refCountScc(adj: number[][]): number {
  const n = adj.length
  const reach = (s: number) => {
    const seen = new Set([s])
    const st = [s]
    while (st.length)
      for (const v of adj[st.pop()!])
        if (!seen.has(v)) {
          seen.add(v)
          st.push(v)
        }
    return seen
  }
  const R = Array.from({ length: n }, (_, u) => reach(u))
  const leader = Array.from({ length: n }, (_, u) => Array.from({ length: n }, (_, v) => v).find((v) => R[u].has(v) && R[v].has(u))!)
  return new Set(leader).size
}

export function refBellmanFord(n: number, edges: Edge[], s: number): (number | null)[] | null {
  const d: (number | null)[] = Array(n).fill(NONE)
  d[s] = 0
  for (let k = 0; k < n; k++) {
    let changed = false
    for (const [u, v, w] of edges)
      if (d[u] !== null && (d[v] === null || d[u]! + w < d[v]!)) {
        d[v] = d[u]! + w
        changed = true
      }
    if (!changed) return d
  }
  return null
}

export function refFloyd(n: number, edges: Edge[]): (number | null)[][] {
  const D: (number | null)[][] = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 0 : NONE)))
  for (const [u, v, w] of edges) if (D[u][v] === null || w < D[u][v]!) D[u][v] = w
  for (let k = 0; k < n; k++)
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) if (D[i][k] !== null && D[k][j] !== null && (D[i][j] === null || D[i][k]! + D[k][j]! < D[i][j]!)) D[i][j] = D[i][k]! + D[k][j]!
  return D
}

export function refLcs(X: string, Y: string): number {
  let prev = Array(Y.length + 1).fill(0)
  for (let i = 1; i <= X.length; i++) {
    const cur = [0]
    for (let j = 1; j <= Y.length; j++) cur[j] = X[i - 1] === Y[j - 1] ? prev[j - 1] + 1 : Math.max(prev[j], cur[j - 1])
    prev = cur
  }
  return prev[Y.length]
}

export function refKnapsack(items: [number, number][], W: number): number {
  const K = Array(W + 1).fill(0)
  for (const [w, v] of items) for (let x = W; x >= w; x--) K[x] = Math.max(K[x], K[x - w] + v)
  return K[W]
}

export function refActivities(acts: [number, number][]): number {
  let last = -Infinity
  let count = 0
  for (const [s, f] of [...acts].sort((a, b) => a[1] - b[1]))
    if (s >= last) {
      count++
      last = f
    }
  return count
}

export function refHuffmanCost(freqs: number[]): number {
  const f = [...freqs]
  let cost = 0
  while (f.length > 1) {
    f.sort((a, b) => a - b)
    const m = f.shift()! + f.shift()!
    cost += m
    f.push(m)
  }
  return cost
}

export function refMstWeight(n: number, edges: Edge[]): number {
  const parent = Array.from({ length: n }, (_, i) => i)
  const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x])))
  let total = 0
  for (const [u, v, w] of [...edges].sort((a, b) => a[2] - b[2])) {
    const a = find(u)
    const b = find(v)
    if (a !== b) {
      parent[a] = b
      total += w
    }
  }
  return total
}

export function refMaxFlow(n: number, edges: Edge[], s: number, t: number): number {
  const cap = Array.from({ length: n }, () => Array(n).fill(0))
  for (const [u, v, c] of edges) cap[u][v] += c
  let flow = 0
  for (;;) {
    const prev = Array(n).fill(-1)
    prev[s] = s
    const q = [s]
    for (let h = 0; h < q.length && prev[t] === -1; h++)
      for (let v = 0; v < n; v++)
        if (prev[v] === -1 && cap[q[h]][v] > 0) {
          prev[v] = q[h]
          q.push(v)
        }
    if (prev[t] === -1) return flow
    let F = Infinity
    for (let v = t; v !== s; v = prev[v]) F = Math.min(F, cap[prev[v]][v])
    for (let v = t; v !== s; v = prev[v]) {
      cap[prev[v]][v] -= F
      cap[v][prev[v]] += F
    }
    flow += F
  }
}

export function refGaleShapley(dPref: number[][], hPref: number[][]): number[] {
  const n = dPref.length
  const rank = hPref.map((list) => {
    const r: number[] = []
    list.forEach((d, i) => (r[d] = i))
    return r
  })
  const holder: number[] = Array(n).fill(-1)
  const next = Array(n).fill(0)
  const free = Array.from({ length: n }, (_, d) => d)
  while (free.length) {
    const d = free.shift()!
    const h = dPref[d][next[d]++]
    if (holder[h] === -1) holder[h] = d
    else if (rank[h][d] < rank[h][holder[h]]) {
      free.push(holder[h])
      holder[h] = d
    } else free.push(d)
  }
  const match: number[] = Array(n).fill(-1)
  holder.forEach((d, h) => (match[d] = h))
  return match
}

/* ───────────── Random inputs (seeded, so every run sees the same tests) ───────────── */

const perm = (rng: Rng, n: number) => {
  const a = Array.from({ length: n }, (_, i) => i)
  for (let i = n - 1; i > 0; i--) {
    const j = randInt(rng, 0, i)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Random graph on n nodes with m distinct ordered (or unordered) pairs. */
export function randEdges(rng: Rng, n: number, m: number, directed: boolean, wLo: number, wHi: number, connected = false): Edge[] {
  const edges: Edge[] = []
  const key = (u: number, v: number) => (directed || u < v ? `${u},${v}` : `${v},${u}`)
  const seen = new Set<string>()
  const add = (u: number, v: number) => {
    if (u === v || seen.has(key(u, v))) return false
    seen.add(key(u, v))
    edges.push([u, v, randInt(rng, wLo, wHi)])
    return true
  }
  if (connected) {
    const order = perm(rng, n)
    for (let i = 1; i < n; i++) add(order[randInt(rng, 0, i - 1)], order[i])
  }
  for (let tries = 0; edges.length < m && tries < 50 * m; tries++) add(randInt(rng, 0, n - 1), randInt(rng, 0, n - 1))
  return edges
}

export const toAdj = (n: number, edges: Edge[], directed: boolean): number[][] => {
  const adj: number[][] = Array.from({ length: n }, () => [])
  for (const [u, v] of edges) {
    adj[u].push(v)
    if (!directed) adj[v].push(u)
  }
  return adj
}

const many = <T>(seed: number, count: number, make: (rng: Rng, k: number) => T): T[] => {
  const rng = makeRng(seed)
  return Array.from({ length: count }, (_, k) => make(rng, k))
}

/* ───────────── Exercises ───────────── */

export const LATER_EXERCISES: Exercise[] = [
  {
    id: 'two-sum',
    lessonId: 'l8-hashing',
    fnName: 'hasPairWithSum',
    mode: 'return',
    title: () => tx('Toplamı hedefe eşit çift', 'Pair with a given sum'),
    prompt: () =>
      tx(
        '`hasPairWithSum(A, target)`, dizide farklı iki konumda duran ve toplamı `target` olan iki eleman varsa `true`, yoksa `false` döndürsün. İki iç içe döngü $O(n^2)$ olur; bir hash tablosu (`Set`) ile beklenen $O(n)$ zamana in: her `x` için `target - x` daha önce görüldü mü? Son test 200.000 elemanlı.',
        '`hasPairWithSum(A, target)` should return `true` if two elements at different positions add up to `target`, and `false` otherwise. Two nested loops take $O(n^2)$; get down to expected $O(n)$ with a hash table (`Set`): for each `x`, has `target - x` been seen already? The last test has 200,000 elements.',
      ),
    starter: () => tx('function hasPairWithSum(A, target) {\n  const seen = new Set()\n  // her x için: target - x görüldü mü?\n\n  return false\n}\n', 'function hasPairWithSum(A, target) {\n  const seen = new Set()\n  // for each x: has target - x been seen?\n\n  return false\n}\n'),
    hints: () => [
      tx('`for (const x of A)` ile dolaş.', 'Loop with `for (const x of A)`.'),
      tx('Önce `seen.has(target - x)` kontrol et, sonra `seen.add(x)`: sıra önemli, yoksa `x + x` yanlışlıkla sayılır.', 'First check `seen.has(target - x)`, then `seen.add(x)`: the order matters, otherwise `x + x` is counted by mistake.'),
    ],
    solution: `function hasPairWithSum(A, target) {
  const seen = new Set()
  for (const x of A) {
    if (seen.has(target - x)) return true
    seen.add(x)
  }
  return false
}
`,
    tests: () => {
      const fixed: [number[], number][] = [
        [[], 5],
        [[5], 10],
        [[5, 5], 10],
        [[1, 2, 3, 9], 8],
        [[1, 2, 4, 4], 8],
        [[-3, 7, 1], 4],
        [[0, 0], 0],
      ]
      const rand = many(81, 6, (rng) => {
        const A = Array.from({ length: randInt(rng, 4, 10) }, () => randInt(rng, -20, 40))
        return [A, randInt(rng, -10, 60)] as [number[], number]
      })
      const cases: TestCase[] = [...fixed, ...rand].map(([A, t]) => ({ args: [A, t], expected: refHasPair(A, t) }))
      const big = many(82, 1, (rng) => Array.from({ length: 200_000 }, () => randInt(rng, 0, 1_000_000_000) * 2))[0]
      cases.push({ args: [big, 3], expected: false, label: tx('200.000 çift sayı, hedef 3', '200,000 even numbers, target 3') })
      return cases
    },
  },
  {
    id: 'bfs',
    lessonId: 'l9-graphs',
    fnName: 'bfs',
    mode: 'return',
    title: () => tx('BFS ile uzaklıklar', 'Distances with BFS'),
    prompt: () =>
      tx(
        'Yönsüz bir grafik komşuluk listesiyle verilir: düğümler `0 … n−1`, `adj[u]` u’nun komşuları. `bfs(adj, s)`, her düğümün s’ye kenar sayısı cinsinden uzaklığını içeren bir dizi döndürsün; ulaşılamayan düğümler için `-1`. $O(n + m)$ zamanda çalışmalı.',
        'An undirected graph is given as adjacency lists: nodes `0 … n−1`, `adj[u]` holds the neighbors of u. `bfs(adj, s)` should return an array with the distance (number of edges) of every node from s, and `-1` for nodes that cannot be reached. It should run in $O(n + m)$ time.',
      ),
    starter: () => 'function bfs(adj, s) {\n  const dist = adj.map(() => -1)\n  const queue = [s]\n\n  return dist\n}\n',
    hints: () => [
      tx('`dist[s] = 0` ile başla.', 'Start with `dist[s] = 0`.'),
      tx('`shift()` yavaş olabilir: kuyruğun başını bir `head` indeksiyle tut.', '`shift()` can be slow: keep the front of the queue as a `head` index.'),
      tx('Kuyruktan çıkan her u için `dist[v] === -1` olan komşulara `dist[u] + 1` ver ve kuyruğa ekle.', 'For every u taken from the queue, give each neighbor with `dist[v] === -1` the distance `dist[u] + 1` and enqueue it.'),
    ],
    solution: `function bfs(adj, s) {
  const dist = adj.map(() => -1)
  dist[s] = 0
  const queue = [s]
  for (let head = 0; head < queue.length; head++) {
    const u = queue[head]
    for (const v of adj[u]) {
      if (dist[v] === -1) {
        dist[v] = dist[u] + 1
        queue.push(v)
      }
    }
  }
  return dist
}
`,
    tests: () => {
      const fixed: [number[][], number][] = [
        [[[]], 0],
        [[[1], [0, 2], [1]], 2],
        [[[1], [0], []], 0],
      ]
      const rand = many(91, 8, (rng, k) => {
        const n = randInt(rng, 5, 12)
        return [toAdj(n, randEdges(rng, n, randInt(rng, n - 2, 2 * n), false, 1, 1, k % 2 === 0), false), randInt(rng, 0, n - 1)] as [number[][], number]
      })
      return [...fixed, ...rand].map(([adj, s]) => ({ args: [adj, s], expected: refBfs(adj, s) }))
    },
  },
  {
    id: 'has-cycle',
    lessonId: 'l9-dfs',
    fnName: 'hasCycle',
    mode: 'return',
    title: () => tx('Yönlü grafikte döngü', 'A cycle in a directed graph'),
    prompt: () =>
      tx(
        '`hasCycle(adj)`, yönlü grafikte (düğümler `0 … n−1`, `adj[u]` u’dan çıkan kenarların hedefleri) bir döngü varsa `true` döndürsün. DFS kullan: beyaz / gri / siyah renkleri tut; gri bir düğüme giden kenar bir geri kenardır ve döngü demektir. Grafik bağlı olmayabilir.',
        '`hasCycle(adj)` should return `true` if the directed graph (nodes `0 … n−1`, `adj[u]` lists the heads of the edges leaving u) has a cycle. Use DFS: keep white / gray / black colors; an edge into a gray node is a back edge and means a cycle. The graph may be disconnected.',
      ),
    starter: () => tx('function hasCycle(adj) {\n  const color = adj.map(() => 0) // 0 beyaz, 1 gri, 2 siyah\n\n  return false\n}\n', 'function hasCycle(adj) {\n  const color = adj.map(() => 0) // 0 white, 1 gray, 2 black\n\n  return false\n}\n'),
    hints: () => [
      tx('Özyinelemeli `visit(u)`: `color[u] = 1`, komşuları dolaş, sonunda `color[u] = 2`.', 'A recursive `visit(u)`: `color[u] = 1`, go through the neighbors, then `color[u] = 2`.'),
      tx('Komşu gri ise döngü bulundu; beyazsa ona in.', 'If a neighbor is gray, a cycle is found; if it is white, go into it.'),
      tx('Her beyaz düğümden ayrı bir `visit` başlat (DFS(G)).', 'Start a separate `visit` from every white node (DFS(G)).'),
    ],
    solution: `function hasCycle(adj) {
  const color = adj.map(() => 0)
  function visit(u) {
    color[u] = 1
    for (const v of adj[u]) {
      if (color[v] === 1) return true
      if (color[v] === 0 && visit(v)) return true
    }
    color[u] = 2
    return false
  }
  for (let u = 0; u < adj.length; u++) if (color[u] === 0 && visit(u)) return true
  return false
}
`,
    tests: () => {
      const fixed: number[][][] = [[[]], [[0]], [[1], []], [[1], [0]], [[1], [2], [0]], [[1, 2], [2], []], [[], [2], [3], [1]]]
      const rand = many(101, 8, (rng) => {
        const n = randInt(rng, 4, 9)
        const edges = randEdges(rng, n, randInt(rng, n - 2, n + 2), true, 1, 1)
        // Half the time keep only edges u → v with u < v: a DAG.
        return toAdj(n, rng() < 0.5 ? edges.filter(([u, v]) => u < v) : edges, true)
      })
      return [...fixed, ...rand].map((adj) => ({ args: [adj], expected: refHasCycle(adj) }))
    },
  },
  {
    id: 'scc-count',
    lessonId: 'l10-scc',
    fnName: 'countSCC',
    mode: 'return',
    title: () => tx('Güçlü bağlı bileşen sayısı', 'Number of strongly connected components'),
    prompt: () =>
      tx(
        '`countSCC(adj)`, yönlü grafiğin (`adj[u]` u’dan çıkan kenarların hedefleri) güçlü bağlı bileşenlerinin sayısını döndürsün. Dersteki iki geçişli algoritma: önce bir grafikte DFS ile bitiş sırasını bul, sonra öbür grafikte azalan bitiş sırasıyla DFS yap; ikinci geçişteki her yeni ağaç bir bileşendir.',
        '`countSCC(adj)` should return the number of strongly connected components of the directed graph (`adj[u]` lists the heads of the edges leaving u). The two-pass algorithm from the lecture: first find a finishing order with DFS on one graph, then run DFS on the other graph in decreasing finishing order; every new tree in the second pass is a component.',
      ),
    starter: () => 'function countSCC(adj) {\n  const n = adj.length\n  const rev = adj.map(() => [])\n  for (let u = 0; u < n; u++) for (const v of adj[u]) rev[v].push(u)\n\n  return 0\n}\n',
    hints: () => [
      tx('Birinci geçiş: ters grafikte (`rev`) DFS(G); her düğüm bittiğinde bir `order` dizisine ekle.', 'First pass: DFS(G) on the reversed graph (`rev`); push every node to an `order` array when it finishes.'),
      tx('İkinci geçiş: `order`’ı sondan başa dolaş; ziyaret edilmemiş her düğümden asıl grafikte (`adj`) bir DFS başlat ve sayacı artır.', 'Second pass: go through `order` from the end; from every unvisited node start a DFS on the original graph (`adj`) and increase the counter.'),
    ],
    solution: `function countSCC(adj) {
  const n = adj.length
  const rev = adj.map(() => [])
  for (let u = 0; u < n; u++) for (const v of adj[u]) rev[v].push(u)
  const seen = Array(n).fill(false)
  const order = []
  function dfs1(u) {
    seen[u] = true
    for (const v of rev[u]) if (!seen[v]) dfs1(v)
    order.push(u)
  }
  for (let u = 0; u < n; u++) if (!seen[u]) dfs1(u)
  const done = Array(n).fill(false)
  function dfs2(u) {
    done[u] = true
    for (const v of adj[u]) if (!done[v]) dfs2(v)
  }
  let count = 0
  for (let k = n - 1; k >= 0; k--) {
    if (!done[order[k]]) {
      dfs2(order[k])
      count++
    }
  }
  return count
}
`,
    tests: () => {
      const fixed: number[][][] = [[[]], [[], []], [[1], [0]], [[1], [2], [0]], [[1], [2], []], [[1], [0, 2], [3], [2]]]
      const rand = many(111, 8, (rng) => {
        const n = randInt(rng, 5, 10)
        return toAdj(n, randEdges(rng, n, randInt(rng, n, 2 * n), true, 1, 1), true)
      })
      return [...fixed, ...rand].map((adj) => ({ args: [adj], expected: refCountScc(adj) }))
    },
  },
  {
    id: 'dijkstra',
    lessonId: 'l11-dijkstra',
    fnName: 'dijkstra',
    mode: 'return',
    title: () => 'Dijkstra',
    prompt: () =>
      tx(
        '`dijkstra(n, edges, s)`: yönlü grafik, düğümler `0 … n−1`, `edges` dizisinin her elemanı `[u, v, w]` (negatif olmayan ağırlıklı u→v kenarı). s’den her düğüme en kısa yol uzunluğunu içeren dizi döndür; ulaşılamayan düğümler için `null`. Önceliği bir dizide en küçüğü arayarak tutman yeterli ($O(n^2 + m)$).',
        '`dijkstra(n, edges, s)`: a directed graph with nodes `0 … n−1`, where every element of `edges` is `[u, v, w]` (an edge u→v with non-negative weight). Return the array of shortest-path lengths from s to every node, with `null` for unreachable nodes. Finding the minimum by scanning an array is enough ($O(n^2 + m)$).',
      ),
    starter: () => tx('function dijkstra(n, edges, s) {\n  const adj = Array.from({ length: n }, () => [])\n  for (const [u, v, w] of edges) adj[u].push([v, w])\n  const d = Array(n).fill(Infinity)\n  const done = Array(n).fill(false)\n  d[s] = 0\n  // n kez: en küçük d’li kesinleşmemiş düğümü al, komşularını gevşet\n\n  return d.map((x) => (x === Infinity ? null : x))\n}\n', 'function dijkstra(n, edges, s) {\n  const adj = Array.from({ length: n }, () => [])\n  for (const [u, v, w] of edges) adj[u].push([v, w])\n  const d = Array(n).fill(Infinity)\n  const done = Array(n).fill(false)\n  d[s] = 0\n  // n times: take the unfinished node with the smallest d, relax its edges\n\n  return d.map((x) => (x === Infinity ? null : x))\n}\n'),
    hints: () => [
      tx('Kesinleşmemişler arasında `d[u]` en küçük olan u’yu bul; `d[u] === Infinity` ise dur.', 'Find the unfinished u with the smallest `d[u]`; stop if `d[u] === Infinity`.'),
      tx('`done[u] = true`; her `[v, w]` için `d[v] = Math.min(d[v], d[u] + w)`.', '`done[u] = true`; for every `[v, w]`, `d[v] = Math.min(d[v], d[u] + w)`.'),
    ],
    solution: `function dijkstra(n, edges, s) {
  const adj = Array.from({ length: n }, () => [])
  for (const [u, v, w] of edges) adj[u].push([v, w])
  const d = Array(n).fill(Infinity)
  const done = Array(n).fill(false)
  d[s] = 0
  for (let k = 0; k < n; k++) {
    let u = -1
    for (let x = 0; x < n; x++) if (!done[x] && (u === -1 || d[x] < d[u])) u = x
    if (d[u] === Infinity) break
    done[u] = true
    for (const [v, w] of adj[u]) d[v] = Math.min(d[v], d[u] + w)
  }
  return d.map((x) => (x === Infinity ? null : x))
}
`,
    tests: () => {
      const fixed: [number, Edge[], number][] = [
        [1, [], 0],
        [3, [[0, 1, 4], [0, 2, 1], [2, 1, 2]], 0],
        [3, [[1, 2, 5]], 0],
        [4, [[0, 1, 0], [1, 2, 0], [2, 3, 7]], 0],
      ]
      const rand = many(121, 8, (rng) => {
        const n = randInt(rng, 5, 10)
        return [n, randEdges(rng, n, randInt(rng, n, 3 * n), true, 0, 12), randInt(rng, 0, n - 1)] as [number, Edge[], number]
      })
      return [...fixed, ...rand].map(([n, edges, s]) => ({ args: [n, edges, s], expected: refBellmanFord(n, edges, s) }))
    },
  },
  {
    id: 'bellman-ford',
    lessonId: 'l12-bellman-ford',
    fnName: 'bellmanFord',
    mode: 'return',
    title: () => 'Bellman–Ford',
    prompt: () =>
      tx(
        '`bellmanFord(n, edges, s)`: Dijkstra alıştırmasıyla aynı girdi, ama ağırlıklar **negatif** olabilir. s’den uzaklıkları döndür (ulaşılamayanlar `null`). s’den ulaşılabilen bir negatif döngü varsa uzaklıklar tanımsızdır: o zaman dizi yerine `null` döndür.',
        '`bellmanFord(n, edges, s)`: the same input as the Dijkstra exercise, but weights may be **negative**. Return the distances from s (`null` for unreachable nodes). If a negative cycle is reachable from s the distances are undefined: return `null` instead of an array.',
      ),
    starter: () => 'function bellmanFord(n, edges, s) {\n  const d = Array(n).fill(Infinity)\n  d[s] = 0\n\n  return d.map((x) => (x === Infinity ? null : x))\n}\n',
    hints: () => [
      tx('n − 1 tur boyunca her `[u, v, w]` kenarını gevşet: `d[u] + w < d[v]` ise `d[v] = d[u] + w`.', 'For n − 1 rounds relax every edge `[u, v, w]`: if `d[u] + w < d[v]` then `d[v] = d[u] + w`.'),
      tx('Bir tur daha yap: hâlâ bir şey değişiyorsa negatif döngü vardır.', 'Do one more round: if something still changes, there is a negative cycle.'),
      tx('`Infinity + (-3)` yine `Infinity` olduğundan ulaşılamayan düğümler sorun çıkarmaz.', '`Infinity + (-3)` is still `Infinity`, so unreachable nodes cause no trouble.'),
    ],
    solution: `function bellmanFord(n, edges, s) {
  const d = Array(n).fill(Infinity)
  d[s] = 0
  for (let k = 0; k < n - 1; k++)
    for (const [u, v, w] of edges) if (d[u] + w < d[v]) d[v] = d[u] + w
  for (const [u, v, w] of edges) if (d[u] + w < d[v]) return null
  return d.map((x) => (x === Infinity ? null : x))
}
`,
    tests: () => {
      const fixed: [number, Edge[], number][] = [
        [1, [], 0],
        [3, [[0, 1, 2], [0, 2, 5], [2, 1, -4]], 0],
        [3, [[0, 1, 1], [1, 2, -2], [2, 1, 1]], 0],
        [4, [[1, 2, -1], [2, 1, -1], [0, 3, 2]], 0],
      ]
      const rand = many(131, 10, (rng) => {
        const n = randInt(rng, 4, 8)
        return [n, randEdges(rng, n, randInt(rng, n, 2 * n), true, -3, 9), randInt(rng, 0, n - 1)] as [number, Edge[], number]
      })
      return [...fixed, ...rand].map(([n, edges, s]) => ({ args: [n, edges, s], expected: refBellmanFord(n, edges, s) }))
    },
  },
  {
    id: 'floyd-warshall',
    lessonId: 'l12-floyd',
    fnName: 'floydWarshall',
    mode: 'return',
    title: () => 'Floyd–Warshall',
    prompt: () =>
      tx(
        '`floydWarshall(n, edges)`: yönlü grafik, kenarlar `[u, v, w]`, negatif ağırlık olabilir ama negatif döngü yok. `D[i][j]` = i’den j’ye en kısa yol olan bir n×n matris döndür; yol yoksa `null`, köşegen 0. Üç iç içe döngü: en dıştaki k, “ara düğümler 0…k arasından”.',
        '`floydWarshall(n, edges)`: a directed graph with edges `[u, v, w]`; weights may be negative but there is no negative cycle. Return an n×n matrix with `D[i][j]` = the shortest path from i to j, `null` if there is no path, and 0 on the diagonal. Three nested loops: the outermost k means “intermediate nodes among 0…k”.',
      ),
    starter: () => 'function floydWarshall(n, edges) {\n  const D = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 0 : Infinity)))\n  for (const [u, v, w] of edges) D[u][v] = Math.min(D[u][v], w)\n\n  return D.map((row) => row.map((x) => (x === Infinity ? null : x)))\n}\n',
    hints: () => [
      tx('`for k`, `for i`, `for j`: `D[i][j] = Math.min(D[i][j], D[i][k] + D[k][j])`.', '`for k`, `for i`, `for j`: `D[i][j] = Math.min(D[i][j], D[i][k] + D[k][j])`.'),
      tx('k en dışta olmalı: önce “yalnızca 0’dan geçen” yollar, sonra “0 ya da 1’den geçen” yollar…', 'k must be the outermost loop: first paths “through 0 only”, then “through 0 or 1”, …'),
    ],
    solution: `function floydWarshall(n, edges) {
  const D = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 0 : Infinity)))
  for (const [u, v, w] of edges) D[u][v] = Math.min(D[u][v], w)
  for (let k = 0; k < n; k++)
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) if (D[i][k] + D[k][j] < D[i][j]) D[i][j] = D[i][k] + D[k][j]
  return D.map((row) => row.map((x) => (x === Infinity ? null : x)))
}
`,
    tests: () => {
      const fixed: [number, Edge[]][] = [
        [1, []],
        [2, [[0, 1, 3]]],
        [4, [[0, 1, 3], [1, 2, 2], [2, 3, 1], [3, 0, 5], [0, 2, 8], [3, 1, -1]]],
      ]
      // Random DAG-like graphs (edges u → v with u < v, so no negative cycle) plus non-negative cyclic ones.
      const rand = many(141, 8, (rng, k) => {
        const n = randInt(rng, 4, 7)
        const edges = randEdges(rng, n, randInt(rng, n, 2 * n), true, k % 2 ? -4 : 0, 9)
        return [n, k % 2 ? edges.filter(([u, v]) => u < v) : edges] as [number, Edge[]]
      })
      return [...fixed, ...rand].map(([n, edges]) => ({ args: [n, edges], expected: refFloyd(n, edges) }))
    },
  },
  {
    id: 'lcs-length',
    lessonId: 'l13-lcs',
    fnName: 'lcsLength',
    mode: 'return',
    title: () => tx('LCS uzunluğu', 'LCS length'),
    prompt: () =>
      tx(
        '`lcsLength(X, Y)`, iki dizginin en uzun ortak altdizisinin uzunluğunu döndürsün. Dinamik programlama: $C[i][j]$ = X’in ilk i, Y’nin ilk j karakterinin LCS uzunluğu. Son test 3000’er karakterlik; özyinelemeli kaba kuvvet orada yetişmez.',
        '`lcsLength(X, Y)` should return the length of the longest common subsequence of two strings. Dynamic programming: $C[i][j]$ = the LCS length of the first i characters of X and the first j characters of Y. The last test has 3000 characters each; brute-force recursion cannot keep up there.',
      ),
    starter: () => 'function lcsLength(X, Y) {\n  const C = Array.from({ length: X.length + 1 }, () => Array(Y.length + 1).fill(0))\n\n  return C[X.length][Y.length]\n}\n',
    hints: () => [
      tx('`X[i - 1] === Y[j - 1]` ise `C[i][j] = C[i - 1][j - 1] + 1`.', 'If `X[i - 1] === Y[j - 1]` then `C[i][j] = C[i - 1][j - 1] + 1`.'),
      tx('Değilse `C[i][j] = Math.max(C[i - 1][j], C[i][j - 1])`.', 'Otherwise `C[i][j] = Math.max(C[i - 1][j], C[i][j - 1])`.'),
    ],
    solution: `function lcsLength(X, Y) {
  const C = Array.from({ length: X.length + 1 }, () => Array(Y.length + 1).fill(0))
  for (let i = 1; i <= X.length; i++)
    for (let j = 1; j <= Y.length; j++)
      C[i][j] = X[i - 1] === Y[j - 1] ? C[i - 1][j - 1] + 1 : Math.max(C[i - 1][j], C[i][j - 1])
  return C[X.length][Y.length]
}
`,
    tests: () => {
      const fixed: [string, string][] = [
        ['', ''],
        ['abc', ''],
        ['abc', 'abc'],
        ['abc', 'def'],
        ['abracadabra', 'bxqrabry'],
        ['ACCGGTCGAG', 'GTCGTTCGGA'],
      ]
      const word = (rng: Rng, n: number, abc: string) => Array.from({ length: n }, () => abc[randInt(rng, 0, abc.length - 1)]).join('')
      const rand = many(151, 5, (rng) => [word(rng, randInt(rng, 3, 12), 'ABC'), word(rng, randInt(rng, 3, 12), 'ABC')] as [string, string])
      const cases: TestCase[] = [...fixed, ...rand].map(([X, Y]) => ({ args: [X, Y], expected: refLcs(X, Y) }))
      const [X, Y] = many(152, 2, (rng) => word(rng, 3000, 'ACGT'))
      cases.push({ args: [X, Y], expected: refLcs(X, Y), label: tx('iki rastgele DNA dizgisi, 3000’er karakter', 'two random DNA strings, 3000 characters each') })
      return cases
    },
  },
  {
    id: 'knapsack',
    lessonId: 'l13-knapsack',
    fnName: 'knapsack01',
    mode: 'return',
    title: () => tx('0/1 sırt çantası', '0/1 knapsack'),
    prompt: () =>
      tx(
        '`knapsack01(items, W)`: her eşya `[ağırlık, değer]`, her biri en çok bir kez alınabilir. Toplam ağırlığı en çok `W` olan seçimlerin en büyük toplam değerini döndür. $O(nW)$ zamanlı bir tablo yeter.',
        '`knapsack01(items, W)`: every item is `[weight, value]` and can be taken at most once. Return the largest total value of a selection whose total weight is at most `W`. A table with $O(nW)$ time is enough.',
      ),
    starter: () => tx('function knapsack01(items, W) {\n  const K = Array(W + 1).fill(0) // K[x] = kapasite x ile en iyi değer\n\n  return K[W]\n}\n', 'function knapsack01(items, W) {\n  const K = Array(W + 1).fill(0) // K[x] = best value with capacity x\n\n  return K[W]\n}\n'),
    hints: () => [
      tx('Eşyaları sırayla ele al; her eşya için kapasiteyi **büyükten küçüğe** dolaş.', 'Take the items one by one; for each item go through the capacities **from large to small**.'),
      tx('`K[x] = Math.max(K[x], K[x - w] + v)`; küçükten büyüğe gidersen aynı eşya birden çok kez alınır (sınırsız sürüm olur).', '`K[x] = Math.max(K[x], K[x - w] + v)`; going from small to large would take the same item several times (the unbounded version).'),
    ],
    solution: `function knapsack01(items, W) {
  const K = Array(W + 1).fill(0)
  for (const [w, v] of items)
    for (let x = W; x >= w; x--) K[x] = Math.max(K[x], K[x - w] + v)
  return K[W]
}
`,
    tests: () => {
      const fixed: [[number, number][], number][] = [
        [[], 10],
        [[[5, 10]], 4],
        [[[5, 10]], 5],
        [
          [
            [6, 20],
            [3, 14],
            [4, 16],
            [2, 9],
          ],
          10,
        ],
        [
          [
            [5, 10],
            [4, 7],
            [4, 7],
          ],
          8,
        ],
      ]
      const rand = many(161, 7, (rng) => [Array.from({ length: randInt(rng, 3, 8) }, () => [randInt(rng, 1, 9), randInt(rng, 1, 30)] as [number, number]), randInt(rng, 5, 25)] as [[number, number][], number])
      return [...fixed, ...rand].map(([items, W]) => ({ args: [items, W], expected: refKnapsack(items, W) }))
    },
  },
  {
    id: 'activity-selection',
    lessonId: 'l14-greedy',
    fnName: 'maxActivities',
    mode: 'return',
    title: () => tx('Etkinlik seçimi', 'Activity selection'),
    prompt: () =>
      tx(
        '`maxActivities(acts)`: her etkinlik `[başlangıç, bitiş]`. Çakışmayan en fazla kaç etkinlik seçilebilir? Bir etkinlik bittiği anda bir sonraki başlayabilir (`bitiş ≤ başlangıç` ise uyumlu). Açgözlü seçim: hep en erken biteni al.',
        '`maxActivities(acts)`: every activity is `[start, finish]`. What is the largest number of non-overlapping activities? The next one may start the moment the previous one finishes (compatible if `finish ≤ start`). The greedy choice: always take the one that finishes first.',
      ),
    starter: () => 'function maxActivities(acts) {\n  let count = 0\n\n  return count\n}\n',
    hints: () => [
      tx('Kopyayı bitiş zamanına göre sırala: `[...acts].sort((a, b) => a[1] - b[1])`.', 'Sort a copy by finish time: `[...acts].sort((a, b) => a[1] - b[1])`.'),
      tx('Son seçilenin bitişini tut; başlangıcı ondan küçük olmayan ilk etkinliği al.', 'Keep the finish time of the last chosen one; take the next activity whose start is not smaller than it.'),
    ],
    solution: `function maxActivities(acts) {
  let count = 0
  let last = -Infinity
  for (const [s, f] of [...acts].sort((a, b) => a[1] - b[1])) {
    if (s >= last) {
      count++
      last = f
    }
  }
  return count
}
`,
    tests: () => {
      const fixed: [number, number][][] = [
        [],
        [[1, 4]],
        [
          [1, 4],
          [4, 6],
        ],
        [
          [1, 10],
          [2, 3],
          [3, 4],
          [4, 5],
        ],
        [
          [0, 6],
          [1, 4],
          [3, 5],
          [5, 7],
          [3, 9],
          [5, 9],
          [6, 10],
          [8, 11],
          [8, 12],
          [2, 14],
          [12, 16],
        ],
      ]
      const rand = many(171, 7, (rng) =>
        Array.from({ length: randInt(rng, 4, 12) }, () => {
          const s = randInt(rng, 0, 20)
          return [s, s + randInt(rng, 1, 7)] as [number, number]
        }),
      )
      return [...fixed, ...rand].map((acts) => ({ args: [acts], expected: refActivities(acts) }))
    },
  },
  {
    id: 'huffman-cost',
    lessonId: 'l14-huffman',
    fnName: 'huffmanCost',
    mode: 'return',
    title: () => tx('Huffman maliyeti', 'Huffman cost'),
    prompt: () =>
      tx(
        '`huffmanCost(freqs)`, sıklıkları verilen karakterler için Huffman kodunun toplam maliyetini döndürsün: $\\sum_x f(x) \\cdot \\text{derinlik}(x)$. Bu toplam, Huffman’ın her turda birleştirdiği iki anahtarın toplamlarının toplamına eşittir. Tek karakter varsa maliyet 0.',
        '`huffmanCost(freqs)` should return the total cost of the Huffman code for characters with the given frequencies: $\\sum_x f(x) \\cdot \\text{depth}(x)$. This total equals the sum of the merged keys over all rounds of Huffman. With a single character the cost is 0.',
      ),
    starter: () => 'function huffmanCost(freqs) {\n  const keys = [...freqs]\n  let cost = 0\n\n  return cost\n}\n',
    hints: () => [
      tx('`keys.length > 1` olduğu sürece: en küçük iki anahtarı çıkar, toplamlarını `cost`’a ekle ve geri koy.', 'While `keys.length > 1`: remove the two smallest keys, add their sum to `cost` and put the sum back.'),
      tx('Her turda sıralamak yeterli; bir öncelik kuyruğu $O(n \\log n)$ verir.', 'Sorting in every round is enough here; a priority queue gives $O(n \\log n)$.'),
    ],
    solution: `function huffmanCost(freqs) {
  const keys = [...freqs]
  let cost = 0
  while (keys.length > 1) {
    keys.sort((a, b) => a - b)
    const merged = keys.shift() + keys.shift()
    cost += merged
    keys.push(merged)
  }
  return cost
}
`,
    tests: () => {
      const fixed: number[][] = [[7], [1, 1], [45, 13, 12, 16, 9, 5], [1, 2, 4, 8, 16], [5, 5, 5, 5]]
      const rand = many(181, 7, (rng) => Array.from({ length: randInt(rng, 3, 10) }, () => randInt(rng, 1, 50)))
      return [...fixed, ...rand].map((f) => ({ args: [f], expected: refHuffmanCost(f) }))
    },
  },
  {
    id: 'mst-weight',
    lessonId: 'l15-mst',
    fnName: 'mstWeight',
    mode: 'return',
    title: () => tx('Kruskal ile MST', 'MST with Kruskal'),
    prompt: () =>
      tx(
        '`mstWeight(n, edges)`: bağlı, yönsüz grafik; düğümler `0 … n−1`, kenarlar `[u, v, w]`. Minimum yayılan ağacın toplam ağırlığını döndür. Kruskal: kenarları ağırlığa göre sırala, döngü kapatmayanları ekle; döngüyü birleşim-bul (union-find) ile denetle.',
        '`mstWeight(n, edges)`: a connected undirected graph with nodes `0 … n−1` and edges `[u, v, w]`. Return the total weight of a minimum spanning tree. Kruskal: sort the edges by weight and add those that do not close a cycle; detect cycles with union-find.',
      ),
    starter: () => 'function mstWeight(n, edges) {\n  const parent = Array.from({ length: n }, (_, i) => i)\n  function find(x) {\n    return parent[x] === x ? x : (parent[x] = find(parent[x]))\n  }\n  let total = 0\n\n  return total\n}\n',
    hints: () => [
      tx('`[...edges].sort((a, b) => a[2] - b[2])` ile dolaş.', 'Go through `[...edges].sort((a, b) => a[2] - b[2])`.'),
      tx('`find(u) !== find(v)` ise kenarı al: `parent[find(u)] = find(v)`, `total += w`.', 'If `find(u) !== find(v)`, take the edge: `parent[find(u)] = find(v)`, `total += w`.'),
    ],
    solution: `function mstWeight(n, edges) {
  const parent = Array.from({ length: n }, (_, i) => i)
  function find(x) {
    return parent[x] === x ? x : (parent[x] = find(parent[x]))
  }
  let total = 0
  for (const [u, v, w] of [...edges].sort((a, b) => a[2] - b[2])) {
    const a = find(u), b = find(v)
    if (a !== b) {
      parent[a] = b
      total += w
    }
  }
  return total
}
`,
    tests: () => {
      const fixed: [number, Edge[]][] = [
        [1, []],
        [2, [[0, 1, 5]]],
        [3, [[0, 1, 1], [1, 2, 2], [0, 2, 3]]],
        [4, [[0, 1, 4], [1, 2, 4], [2, 3, 4], [3, 0, 4]]],
      ]
      const rand = many(191, 8, (rng) => {
        const n = randInt(rng, 5, 10)
        return [n, randEdges(rng, n, randInt(rng, n, 2 * n), false, 1, 20, true)] as [number, Edge[]]
      })
      return [...fixed, ...rand].map(([n, edges]) => ({ args: [n, edges], expected: refMstWeight(n, edges) }))
    },
  },
  {
    id: 'max-flow',
    lessonId: 'l16-maxflow',
    fnName: 'maxFlow',
    mode: 'return',
    title: () => tx('Maksimum akış', 'Maximum flow'),
    prompt: () =>
      tx(
        '`maxFlow(n, edges, s, t)`: düğümler `0 … n−1`, her kenar `[u, v, kapasite]` (yönlü). s’den t’ye maksimum akışın değerini döndür. Ford–Fulkerson: artık grafikte s’den t’ye yol bul (BFS ile: Edmonds–Karp), darboğaz kadar akış gönder, ters kenarlara ekle; yol kalmayınca dur.',
        '`maxFlow(n, edges, s, t)`: nodes `0 … n−1`, every edge `[u, v, capacity]` (directed). Return the value of a maximum flow from s to t. Ford–Fulkerson: find an s–t path in the residual graph (with BFS: Edmonds–Karp), push the bottleneck along it, add it to the backward edges; stop when no path is left.',
      ),
    starter: () => tx('function maxFlow(n, edges, s, t) {\n  // cap[u][v] = artık kapasite\n  const cap = Array.from({ length: n }, () => Array(n).fill(0))\n  for (const [u, v, c] of edges) cap[u][v] += c\n  let flow = 0\n\n  return flow\n}\n', 'function maxFlow(n, edges, s, t) {\n  // cap[u][v] = residual capacity\n  const cap = Array.from({ length: n }, () => Array(n).fill(0))\n  for (const [u, v, c] of edges) cap[u][v] += c\n  let flow = 0\n\n  return flow\n}\n'),
    hints: () => [
      tx('Döngü: BFS ile `cap[u][v] > 0` olan kenarlardan s’den t’ye bir yol ara; her düğümün `prev`’ini tut.', 'Loop: search for an s–t path with BFS over edges with `cap[u][v] > 0`, remembering every node’s `prev`.'),
      tx('Yol yoksa `flow`’u döndür. Varsa darboğazı F bul; yol boyunca `cap[u][v] -= F`, `cap[v][u] += F`, `flow += F`.', 'If there is no path return `flow`. Otherwise find the bottleneck F; along the path `cap[u][v] -= F`, `cap[v][u] += F`, `flow += F`.'),
    ],
    solution: `function maxFlow(n, edges, s, t) {
  const cap = Array.from({ length: n }, () => Array(n).fill(0))
  for (const [u, v, c] of edges) cap[u][v] += c
  let flow = 0
  for (;;) {
    const prev = Array(n).fill(-1)
    prev[s] = s
    const queue = [s]
    for (let h = 0; h < queue.length && prev[t] === -1; h++) {
      const u = queue[h]
      for (let v = 0; v < n; v++) {
        if (prev[v] === -1 && cap[u][v] > 0) {
          prev[v] = u
          queue.push(v)
        }
      }
    }
    if (prev[t] === -1) return flow
    let F = Infinity
    for (let v = t; v !== s; v = prev[v]) F = Math.min(F, cap[prev[v]][v])
    for (let v = t; v !== s; v = prev[v]) {
      cap[prev[v]][v] -= F
      cap[v][prev[v]] += F
    }
    flow += F
  }
}
`,
    tests: () => {
      const fixed: [number, Edge[], number, number][] = [
        [2, [], 0, 1],
        [2, [[0, 1, 7]], 0, 1],
        [6, [[0, 1, 16], [0, 2, 13], [1, 3, 12], [2, 1, 4], [3, 2, 9], [2, 4, 14], [4, 3, 7], [3, 5, 20], [4, 5, 4]], 0, 5],
        [4, [[0, 1, 100], [0, 2, 100], [1, 2, 1], [1, 3, 100], [2, 3, 100]], 0, 3],
      ]
      const rand = many(201, 8, (rng) => {
        const n = randInt(rng, 4, 8)
        return [n, randEdges(rng, n, randInt(rng, n, 3 * n), true, 1, 15), 0, n - 1] as [number, Edge[], number, number]
      })
      return [...fixed, ...rand].map(([n, edges, s, t]) => ({ args: [n, edges, s, t], expected: refMaxFlow(n, edges, s, t) }))
    },
  },
  {
    id: 'gale-shapley',
    lessonId: 'l17-stable-matching',
    fnName: 'galeShapley',
    mode: 'return',
    title: () => 'Gale–Shapley',
    prompt: () =>
      tx(
        '`galeShapley(dPref, hPref)`: n doktor ve n hastane, ikisi de `0 … n−1`. `dPref[d]` doktor d’nin hastaneleri en çok istenenden aza sıraladığı liste; `hPref[h]` hastane h’nin doktor listesi. Doktorların başvurduğu kabulü erteleme algoritmasını çalıştır ve `match[d]` = d’nin hastanesi olan diziyi döndür (doktorlar için en iyi kararlı eşleşme).',
        '`galeShapley(dPref, hPref)`: n doctors and n hospitals, both `0 … n−1`. `dPref[d]` lists the hospitals from doctor d’s most to least preferred; `hPref[h]` is hospital h’s list of doctors. Run deferred acceptance with doctors applying and return the array with `match[d]` = d’s hospital (the doctor-optimal stable matching).',
      ),
    starter: () => 'function galeShapley(dPref, hPref) {\n  const n = dPref.length\n  const holder = Array(n).fill(-1) // holder[h] = doctor\n  const next = Array(n).fill(0)\n\n  const match = Array(n).fill(-1)\n  return match\n}\n',
    hints: () => [
      tx('Hastaneler için bir sıra tablosu kur: `rank[h][d]` = d’nin h’nin listesindeki yeri.', 'Build a rank table for the hospitals: `rank[h][d]` = the position of d on h’s list.'),
      tx('Boştaki doktorları bir kuyrukta tut. d sıradaki hastanesi h’ye başvurur: h boşsa ya da d’yi mevcut doktoruna tercih ediyorsa kabul eder (eskisi kuyruğa döner), yoksa d kuyruğa döner.', 'Keep the free doctors in a queue. d applies to the next hospital h: h accepts if it is empty or prefers d to its current doctor (who goes back to the queue); otherwise d goes back to the queue.'),
      tx('Sonda `holder`’ı ters çevir: `match[holder[h]] = h`.', 'At the end invert `holder`: `match[holder[h]] = h`.'),
    ],
    solution: `function galeShapley(dPref, hPref) {
  const n = dPref.length
  const rank = hPref.map((list) => {
    const r = []
    list.forEach((d, i) => (r[d] = i))
    return r
  })
  const holder = Array(n).fill(-1)
  const next = Array(n).fill(0)
  const free = Array.from({ length: n }, (_, d) => d)
  while (free.length) {
    const d = free.shift()
    const h = dPref[d][next[d]++]
    if (holder[h] === -1) holder[h] = d
    else if (rank[h][d] < rank[h][holder[h]]) {
      free.push(holder[h])
      holder[h] = d
    } else free.push(d)
  }
  const match = Array(n).fill(-1)
  holder.forEach((d, h) => (match[d] = h))
  return match
}
`,
    tests: () => {
      const fixed: [number[][], number[][]][] = [
        [[[0]], [[0]]],
        [
          [
            [1, 0, 2],
            [0, 1, 2],
            [0, 1, 2],
          ],
          [
            [0, 2, 1],
            [2, 0, 1],
            [1, 2, 0],
          ],
        ],
      ]
      const rand = many(211, 8, (rng) => {
        const n = randInt(rng, 3, 7)
        return [Array.from({ length: n }, () => perm(rng, n)), Array.from({ length: n }, () => perm(rng, n))] as [number[][], number[][]]
      })
      return [...fixed, ...rand].map(([dP, hP]) => ({ args: [dP, hP], expected: refGaleShapley(dP, hP) }))
    },
  },
]
