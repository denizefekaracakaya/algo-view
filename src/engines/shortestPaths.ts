import type { Trace, TraceStep } from '../trace/types'
import { adjacency, ids, type Graph } from './graph'
import { tx } from '../i18n/lang'

/** Lectures 11–12: Dijkstra, Bellman–Ford (as a DP over the number of edges) and Floyd–Warshall. */

const INF = Infinity
export const fmt = (x: number) => (x === INF ? '∞' : x === -INF ? '−∞' : String(x).replace('-', '−'))

export const DIJKSTRA_CODE = [
  'Dijkstra(G, s):',
  '    d[t] = ∞ for all t; d[s] = 0',
  '    F = V; D = ∅',
  '    while F is not empty:',
  '        x = the node of F with the smallest d[x]',
  '        for (x, y) in E:',
  '            d[y] = min(d[y], d[x] + w(x, y))     # relax',
  '        F = F − {x}; D = D + {x}',
]

export interface DijkstraState {
  d: Record<string, number>
  parent: Record<string, string | null>
  done: string[]
  current: string | null
  relaxing: number | null
  /** Edge indices of the current shortest-path tree. */
  tree: number[]
}

export function dijkstraTrace(g: Graph, source: string): { trace: Trace<DijkstraState>; d: Record<string, number> } {
  const adj = adjacency(g)
  const all = ids(g)
  const d: Record<string, number> = Object.fromEntries(all.map((v) => [v, INF]))
  const parent: Record<string, string | null> = Object.fromEntries(all.map((v) => [v, null]))
  const parentEdge: Record<string, number | null> = Object.fromEntries(all.map((v) => [v, null]))
  d[source] = 0
  const F = new Set(all)
  const done: string[] = []
  const trace: Trace<DijkstraState> = []
  let relaxations = 0
  const push = (current: string | null, relaxing: number | null, step: Omit<TraceStep<DijkstraState>, 'state'>) =>
    trace.push({
      ...step,
      state: { d: { ...d }, parent: { ...parent }, done: [...done], current, relaxing, tree: Object.values(parentEdge).filter((e): e is number => e !== null) },
      counters: { [tx('gevşetme', 'relaxations')]: relaxations, D: done.length },
    })
  push(null, null, { line: 2, phase: tx('Başlangıç', 'Start'), explain: tx(`d[${source}] = 0, diğer tüm tahminler ∞.`, `d[${source}] = 0, every other estimate is ∞.`) })
  while (F.size) {
    let x: string | null = null
    for (const v of all) if (F.has(v) && (x === null || d[v] < d[x])) x = v
    const cand = all.filter((v) => F.has(v))
    if (d[x!] === INF) {
      push(null, null, { line: 4, phase: tx('Bitti', 'Done'), explain: tx(`F'de kalanların (${cand.join(', ')}) tahmini ∞: kaynaktan ulaşılamazlar.`, `The remaining nodes of F (${cand.join(', ')}) have estimate ∞: they are unreachable from the source.`) })
      break
    }
    const opts = [...new Set([x!, ...cand.filter((v) => v !== x).sort((a, b) => d[a] - d[b]).slice(0, 2)])]
    push(x, null, {
      line: 5,
      phase: tx(`${x} seçildi`, `${x} chosen`),
      explain: tx(`F içinde en küçük tahmin d[${x}] = ${fmt(d[x!])}. ${x} kesinleşiyor: bu değer artık gerçek uzaklık d(s, ${x}).`, `The smallest estimate in F is d[${x}] = ${fmt(d[x!])}. ${x} is finalized: this value is now the true distance d(s, ${x}).`),
      predict:
        opts.length > 1
          ? {
              question: tx('F içinden hangi düğüm seçilir?', 'Which node of F is chosen?'),
              options: opts,
              answer: 0,
              why: tx(`Tahmini en küçük olan: d[${x}] = ${fmt(d[x!])}.`, `The one with the smallest estimate: d[${x}] = ${fmt(d[x!])}.`),
            }
          : undefined,
    })
    for (const { v, w, e } of adj[x!]) {
      relaxations++
      const nd = d[x!] + w
      const better = nd < d[v]
      const old = d[v]
      if (better) {
        d[v] = nd
        parent[v] = x
        parentEdge[v] = e
      }
      push(x, e, {
        line: 7,
        phase: tx(`${x} seçildi`, `${x} chosen`),
        explain: better
          ? tx(`Gevşet ${x}→${v}: d[${x}] + ${fmt(w)} = ${fmt(nd)} < ${fmt(old)}, d[${v}] = ${fmt(nd)}.`, `Relax ${x}→${v}: d[${x}] + ${fmt(w)} = ${fmt(nd)} < ${fmt(old)}, so d[${v}] = ${fmt(nd)}.`)
          : tx(`Gevşet ${x}→${v}: ${fmt(nd)} ≥ d[${v}] = ${fmt(old)}, değişiklik yok.`, `Relax ${x}→${v}: ${fmt(nd)} ≥ d[${v}] = ${fmt(old)}, no change.`),
      })
    }
    F.delete(x!)
    done.push(x!)
  }
  push(null, null, { line: 8, phase: tx('Bitti', 'Done'), explain: tx(`Uzaklıklar: ${all.map((v) => `${v}: ${fmt(d[v])}`).join(', ')}.`, `Distances: ${all.map((v) => `${v}: ${fmt(d[v])}`).join(', ')}.`) })
  return { trace, d }
}

export const BELLMAN_FORD_CODE = [
  'Bellman-Ford(G, s):',
  '    d(0)[v] = ∞ for all v; d(0)[s] = 0',
  '    for k = 1, …, n − 1:',
  '        d(k)[v] = d(k−1)[v] for all v',
  '        for (u, v) in E:',
  '            d(k)[v] = min(d(k)[v], d(k−1)[u] + w(u, v))',
  '    for (u, v) in E:                  # one more round',
  '        if d[v] > d[u] + w(u, v): return "negative cycle"',
  '    return d(n−1)',
]

export interface BellmanFordState {
  /** rows[k][v] = d(k)[v]; rows grow as the algorithm runs. */
  rows: Record<string, number>[]
  k: number
  edge: number | null
  changed: string | null
  negativeCycle: boolean | null
  parent: Record<string, string | null>
}

/** Bellman–Ford as in the Lecture 12 notes: d(k)[v] = cost of a shortest s→v path with at most k edges. */
export function bellmanFordTrace(g: Graph, source: string): { trace: Trace<BellmanFordState>; d: Record<string, number>; negativeCycle: boolean } {
  const all = ids(g)
  const rows: Record<string, number>[] = [Object.fromEntries(all.map((v) => [v, v === source ? 0 : INF]))]
  const parent: Record<string, string | null> = Object.fromEntries(all.map((v) => [v, null]))
  const trace: Trace<BellmanFordState> = []
  let relax = 0
  const push = (k: number, edge: number | null, changed: string | null, negativeCycle: boolean | null, step: Omit<TraceStep<BellmanFordState>, 'state'>) =>
    trace.push({ ...step, state: { rows: rows.map((r) => ({ ...r })), k, edge, changed, negativeCycle, parent: { ...parent } }, counters: { [tx('gevşetme', 'relaxations')]: relax } })
  push(0, null, null, null, { line: 2, phase: 'k = 0', explain: tx(`d(0): yalnızca ${source}'ye 0 kenarla ulaşılır.`, `d(0): only ${source} is reachable with 0 edges.`) })
  const n = all.length
  // Undirected edges can be used in both directions.
  const arcs = g.edges.flatMap((ed, e) => (g.directed ? [{ ed, e }] : [{ ed, e }, { ed: { ...ed, u: ed.v, v: ed.u }, e }]))
  for (let k = 1; k <= n - 1; k++) {
    const prev = rows[k - 1]
    const cur = { ...prev }
    rows.push(cur)
    push(k, null, null, null, { line: 4, phase: `k = ${k}`, explain: tx(`d(${k}) önce d(${k - 1})’in kopyası: en fazla ${k} kenarlı yollar, en fazla ${k - 1} kenarlıları da içerir.`, `d(${k}) starts as a copy of d(${k - 1}): paths with at most ${k} edges include those with at most ${k - 1}.`) })
    arcs.forEach(({ ed, e }) => {
      relax++
      const w = ed.w ?? 1
      const nd = prev[ed.u] + w
      if (nd < cur[ed.v]) {
        const old = cur[ed.v]
        cur[ed.v] = nd
        parent[ed.v] = ed.u
        push(k, e, ed.v, null, {
          line: 6,
          phase: `k = ${k}`,
          explain: tx(`${ed.u}→${ed.v}: d(${k - 1})[${ed.u}] + ${fmt(w)} = ${fmt(nd)} < ${fmt(old)}; d(${k})[${ed.v}] = ${fmt(nd)}.`, `${ed.u}→${ed.v}: d(${k - 1})[${ed.u}] + ${fmt(w)} = ${fmt(nd)} < ${fmt(old)}; d(${k})[${ed.v}] = ${fmt(nd)}.`),
        })
      }
    })
    const same = all.every((v) => cur[v] === prev[v])
    push(k, null, null, null, {
      line: 3,
      phase: `k = ${k}`,
      explain: same
        ? tx(`d(${k}) = d(${k - 1}): bu turda hiçbir tahmin değişmedi (sonraki turlar da değiştirmeyecek).`, `d(${k}) = d(${k - 1}): no estimate changed in this round (later rounds will not change anything either).`)
        : tx(`Tur ${k} bitti: d(${k})[v], en fazla ${k} kenarlı en kısa s→v yolunun maliyeti.`, `Round ${k} is over: d(${k})[v] is the cost of a shortest s→v path with at most ${k} edges.`),
    })
  }
  const last = rows[rows.length - 1]
  let neg = false
  let witness: number | null = null
  arcs.forEach(({ ed, e }) => {
    if (!neg && last[ed.u] + (ed.w ?? 1) < last[ed.v]) {
      neg = true
      witness = e
    }
  })
  push(n - 1, witness, null, neg, {
    line: neg ? 8 : 9,
    phase: tx('Negatif döngü kontrolü', 'Negative cycle check'),
    explain: neg
      ? tx(`Bir tur daha: ${g.edges[witness!].u}→${g.edges[witness!].v} hâlâ iyileşiyor. n − 1 kenardan uzun bir yol daha kısa olamazdı; ulaşılabilir bir negatif döngü var.`, `One more round: ${g.edges[witness!].u}→${g.edges[witness!].v} still improves. A path longer than n − 1 edges could not be shorter otherwise; there is a reachable negative cycle.`)
      : tx('Bir tur daha: hiçbir kenar iyileşmiyor, negatif döngü yok. d(n−1) gerçek uzaklıklardır.', 'One more round: no edge improves, so there is no negative cycle. d(n−1) holds the true distances.'),
  })
  return { trace, d: last, negativeCycle: neg }
}

export const FLOYD_CODE = [
  'Floyd-Warshall(G):        # nodes are 1…n',
  '    d0(u, u) = 0; d0(u, v) = w(u, v) if (u, v) ∈ E, else ∞',
  '    for k = 1, …, n:',
  '        for (u, v) in V × V:',
  '            dk(u, v) = min(dk−1(u, v), dk−1(u, k) + dk−1(k, v))',
  '    negative cycle ⇔ dn(u, u) < 0 for some u',
]

export interface FloydState {
  k: number
  /** matrix[i][j] for node order ids(g). */
  matrix: number[][]
  /** Cells improved in this round. */
  improved: [number, number][]
  cell: [number, number] | null
}

export function floydTrace(g: Graph): { trace: Trace<FloydState>; matrix: number[][] } {
  const v = ids(g)
  const n = v.length
  const idx = new Map(v.map((x, i) => [x, i]))
  let m = v.map((_, i) => v.map((_, j) => (i === j ? 0 : INF)))
  for (const ed of g.edges) {
    const [i, j] = [idx.get(ed.u)!, idx.get(ed.v)!]
    m[i][j] = Math.min(m[i][j], ed.w ?? 1)
    if (!g.directed) m[j][i] = Math.min(m[j][i], ed.w ?? 1)
  }
  const trace: Trace<FloydState> = []
  let updates = 0
  const push = (k: number, improved: [number, number][], cell: [number, number] | null, step: Omit<TraceStep<FloydState>, 'state'>) =>
    trace.push({ ...step, state: { k, matrix: m.map((r) => [...r]), improved: [...improved], cell }, counters: { [tx('iyileşen hücre', 'improved cells')]: updates } })
  push(0, [], null, { line: 2, phase: 'k = 0', explain: tx('d0: yalnızca doğrudan kenarlar (ara düğüm yok).', 'd0: only direct edges (no intermediate node).') })
  for (let k = 0; k < n; k++) {
    const prev = m
    const next = prev.map((r) => [...r])
    const improved: [number, number][] = []
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) {
        const via = prev[i][k] + prev[k][j]
        if (via < next[i][j]) {
          next[i][j] = via
          improved.push([i, j])
          updates++
        }
      }
    m = next
    for (const [i, j] of improved)
      push(k + 1, improved.slice(0, improved.findIndex(([a, b]) => a === i && b === j) + 1), [i, j], {
        line: 5,
        phase: `k = ${v[k]}`,
        explain: tx(
          `${v[i]}→${v[j]}: ${v[k]} üzerinden ${fmt(prev[i][k])} + ${fmt(prev[k][j])} = ${fmt(next[i][j])} < ${fmt(prev[i][j])}.`,
          `${v[i]}→${v[j]}: through ${v[k]}, ${fmt(prev[i][k])} + ${fmt(prev[k][j])} = ${fmt(next[i][j])} < ${fmt(prev[i][j])}.`,
        ),
      })
    push(k + 1, improved, null, {
      line: 3,
      phase: `k = ${v[k]}`,
      explain: improved.length
        ? tx(`d${k + 1} hazır: artık ara düğüm olarak {${v.slice(0, k + 1).join(', ')}} kullanılabiliyor. ${improved.length} hücre iyileşti.`, `d${k + 1} is ready: intermediate nodes may now come from {${v.slice(0, k + 1).join(', ')}}. ${improved.length} cell(s) improved.`)
        : tx(`d${k + 1} hazır: ${v[k]} üzerinden geçmek hiçbir yolu kısaltmadı.`, `d${k + 1} is ready: going through ${v[k]} shortened no path.`),
    })
  }
  const neg = m.some((r, i) => r[i] < 0)
  push(n, [], null, {
    line: 6,
    phase: tx('Bitti', 'Done'),
    explain: neg
      ? tx('Köşegende negatif bir değer var: grafikte negatif döngü bulunuyor.', 'There is a negative value on the diagonal: the graph has a negative cycle.')
      : tx(`Köşegen 0: negatif döngü yok. Tablo tüm çiftler arası en kısa yolları veriyor; ${n}³ = ${n ** 3} adımlık iş: O(n³).`, `The diagonal is 0: no negative cycle. The table holds all-pairs shortest paths; ${n}³ = ${n ** 3} steps of work: O(n³).`),
  })
  return { trace, matrix: m }
}
