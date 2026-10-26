/**
 * Hand-tracing drills for Lectures 8–17. Same contract as drills.ts: each builder runs the algorithm on a
 * seeded input and returns every decision (with the state shown before it), so the UI only compares choices.
 */
import type { DrillStepBase } from './drills'
import { adjacency, BFS_EXAMPLE, DIJKSTRA_EXAMPLE, ids, MST_SMALL, type GEdge, type Graph } from '../engines/graph'
import { makeRng, randInt, randomPermutation, type Rng } from '../engines/random'
import { distinctInts } from './generators'
import { tx } from '../i18n/lang'

export type LaterDrillId = 'hash' | 'bfs' | 'dfs' | 'dijkstra' | 'lcs' | 'huffman' | 'kruskal' | 'gale-shapley'

export const LATER_DRILL_LESSON: Record<LaterDrillId, string> = {
  hash: 'l8-hashing',
  bfs: 'l9-graphs',
  dfs: 'l9-dfs',
  dijkstra: 'l11-dijkstra',
  lcs: 'l13-lcs',
  huffman: 'l14-huffman',
  kruskal: 'l15-mst',
  'gale-shapley': 'l17-stable-matching',
}

export const LATER_DRILLS: { id: LaterDrillId; title: () => string; blurb: () => string }[] = [
  { id: 'hash', title: () => tx('Hash tablosuna ekleme', 'Hash table insertion'), blurb: () => tx('Her anahtarın kovasını hesapla ve zincirine ekle.', 'Compute the bucket of every key and add it to the chain.') },
  { id: 'bfs', title: () => 'BFS', blurb: () => tx('Kuyruktan sıradaki düğüm hangisi? Katmanları takip et.', 'Which node leaves the queue next? Keep track of the layers.') },
  { id: 'dfs', title: () => 'DFS', blurb: () => tx('Her an sıradaki olay: yeni bir düğüm mü keşfedilir, yoksa biri mi biter?', 'At every moment, the next event: is a new node discovered or does one finish?') },
  { id: 'dijkstra', title: () => 'Dijkstra', blurb: () => tx('Sıradaki kesinleşen düğümü ve uzaklığını bul.', 'Find the next node to be finalized and its distance.') },
  { id: 'lcs', title: () => tx('LCS tablosu', 'LCS table'), blurb: () => tx('Tabloyu hücre hücre doldur.', 'Fill in the table cell by cell.') },
  { id: 'huffman', title: () => 'Huffman', blurb: () => tx('Her turda en küçük iki anahtarı seç.', 'Each round, pick the two smallest keys.') },
  { id: 'kruskal', title: () => 'Kruskal', blurb: () => tx('Kenarlar artan ağırlıkla gelir: ekle mi, atla mı?', 'Edges come in increasing weight: add or skip?') },
  { id: 'gale-shapley', title: () => 'Gale–Shapley', blurb: () => tx('Her başvuruda hastane kabul mü eder, reddeder mi?', 'At every application, does the hospital accept or reject?') },
]

const shuffle = <T>(rng: Rng, xs: readonly T[]): T[] => randomPermutation(rng, xs.length).map((i) => xs[i - 1])

/* ───────────── Hashing with chaining ───────────── */

export const HASH_P = 13
export const HASH_N = 5

export interface HashStep extends DrillStepBase {
  a: number
  b: number
  keys: number[]
  pos: number
  buckets: number[][]
}

export function hashDrill(seed: number): { steps: HashStep[]; a: number; b: number; keys: number[]; final: number[][] } {
  const rng = makeRng(seed)
  const a = randInt(rng, 2, 12)
  const b = randInt(rng, 0, 12)
  const keys = distinctInts(rng, 7, 1, 40)
  const buckets: number[][] = Array.from({ length: HASH_N }, () => [])
  const steps: HashStep[] = keys.map((x, pos) => {
    const inner = (a * x + b) % HASH_P
    const i = inner % HASH_N
    const step: HashStep = {
      a,
      b,
      keys,
      pos,
      buckets: buckets.map((c) => [...c]),
      answer: i,
      hint: tx(`Önce ${a}·${x} + ${b} değerini ${HASH_P}’e göre mod al, sonra sonucu ${HASH_N}’e göre.`, `First take ${a}·${x} + ${b} mod ${HASH_P}, then the result mod ${HASH_N}.`),
      why: tx(
        `${a}·${x} + ${b} = ${a * x + b}; mod ${HASH_P} = ${inner}; mod ${HASH_N} = ${i}.${buckets[i].length ? ` Kova ${i} dolu: zincirin sonuna eklenir (çakışma).` : ''}`,
        `${a}·${x} + ${b} = ${a * x + b}; mod ${HASH_P} = ${inner}; mod ${HASH_N} = ${i}.${buckets[i].length ? ` Bucket ${i} is not empty: it goes to the end of the chain (a collision).` : ''}`,
      ),
    }
    buckets[i].push(x)
    return step
  })
  return { steps, a, b, keys, final: buckets }
}

/* ───────────── BFS: which node leaves the queue next? ───────────── */

export interface BfsStep extends DrillStepBase {
  dist: Record<string, number>
  done: string[]
  /** Discovered but not yet processed (alphabetical); `answer` indexes into this. */
  options: string[]
}

export function bfsDrillGraph(seed: number): Graph {
  const rng = makeRng(seed)
  const drop = shuffle(rng, BFS_EXAMPLE.edges.map((_, i) => i)).slice(0, 2)
  return { ...BFS_EXAMPLE, edges: BFS_EXAMPLE.edges.filter((_, i) => !drop.includes(i)) }
}

export function bfsDrill(g: Graph, source = 's'): { steps: BfsStep[]; dist: Record<string, number>; order: string[] } {
  const adj = adjacency(g)
  const dist: Record<string, number> = { [source]: 0 }
  const done: string[] = []
  const q = [source]
  const steps: BfsStep[] = []
  const process = (u: string) => {
    const found: string[] = []
    for (const { v } of adj[u])
      if (dist[v] === undefined) {
        dist[v] = dist[u] + 1
        q.push(v)
        found.push(v)
      }
    done.push(u)
    return found
  }
  process(q.shift()!)
  while (q.length) {
    const u = q[0]
    const options = [...q].sort()
    const before = { dist: { ...dist }, done: [...done] }
    q.shift()
    const found = process(u)
    steps.push({
      ...before,
      options,
      answer: options.indexOf(u),
      hint: tx(
        'Kuyruk ilk giren ilk çıkar: önce küçük katmandakiler çıkar; aynı katmanda, daha önce keşfedilen önce çıkar (komşular alfabetik sırayla taranır).',
        'The queue is first in, first out: lower layers leave first; within a layer, the one discovered earlier leaves first (neighbors are scanned alphabetically).',
      ),
      why: found.length
        ? tx(`${u} (katman ${dist[u]}) kuyruğun başındaydı. Beyaz komşuları ${found.join(', ')} keşfedildi: katman ${dist[u] + 1}.`, `${u} (layer ${dist[u]}) was at the front of the queue. Its white neighbors ${found.join(', ')} are discovered: layer ${dist[u] + 1}.`)
        : tx(`${u} (katman ${dist[u]}) kuyruğun başındaydı. Yeni komşusu yok.`, `${u} (layer ${dist[u]}) was at the front of the queue. It has no new neighbors.`),
    })
  }
  return { steps, dist, order: done }
}

/* ───────────── DFS: the next event ───────────── */

export const FINISH = '⊣'

export interface DfsStep extends DrillStepBase {
  d: Record<string, number>
  f: Record<string, number>
  stack: string[]
  time: number
  /** White nodes (alphabetical), then FINISH when the stack is not empty. */
  options: string[]
}

/** A directed graph on a–f drawn on a hexagon, with 8 random edges and no antiparallel pairs. */
export function dfsDrillGraph(seed: number): Graph {
  const rng = makeRng(seed)
  const v = 'abcdef'.split('')
  const nodes = v.map((id, i) => ({ id, x: Math.round(50 + 44 * Math.cos(Math.PI + (i * Math.PI) / 3)), y: Math.round(50 + 44 * Math.sin(Math.PI + (i * Math.PI) / 3)) }))
  const pairs: [string, string][] = []
  for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++) pairs.push([v[i], v[j]])
  const edges: GEdge[] = shuffle(rng, pairs)
    .slice(0, 8)
    .map(([a, b]) => (rng() < 0.5 ? { u: a, v: b } : { u: b, v: a }))
  return { directed: true, nodes, edges }
}

export function dfsDrill(g: Graph): { steps: DfsStep[]; d: Record<string, number>; f: Record<string, number> } {
  const adj = adjacency(g)
  const d: Record<string, number> = {}
  const f: Record<string, number> = {}
  const stack: string[] = []
  const steps: DfsStep[] = []
  let time = 1
  const white = () => ids(g).filter((v) => d[v] === undefined).sort()
  for (;;) {
    const top = stack.at(-1)
    const next = top === undefined ? white()[0] : adj[top].find((a) => d[a.v] === undefined)?.v
    if (top === undefined && next === undefined) break
    const options = [...white(), ...(stack.length ? [FINISH] : [])]
    const discover = next !== undefined
    steps.push({
      d: { ...d },
      f: { ...f },
      stack: [...stack],
      time,
      options,
      answer: options.indexOf(discover ? next : FINISH),
      hint:
        top === undefined
          ? tx('Yığın boş: DFS(G) sıradaki beyaz düğümden (alfabetik) yeni bir arama başlatır.', 'The stack is empty: DFS(G) starts a new search from the next white node (alphabetically).')
          : tx(`Yığının tepesi ${top}. Komşularını alfabetik sırayla tara: beyaz biri varsa ona in; yoksa ${top} biter.`, `The top of the stack is ${top}. Scan its neighbors alphabetically: if one is white, go to it; otherwise ${top} finishes.`),
      why: discover
        ? top === undefined
          ? tx(`Yeni arama ${next}’den başlıyor: d(${next}) = ${time}.`, `A new search starts from ${next}: d(${next}) = ${time}.`)
          : tx(`${top}→${next} kenarı beyaz bir düğüme gidiyor: d(${next}) = ${time}.`, `The edge ${top}→${next} leads to a white node: d(${next}) = ${time}.`)
        : tx(`${top}’nun beyaz komşusu kalmadı: f(${top}) = ${time}.`, `${top} has no white neighbor left: f(${top}) = ${time}.`),
    })
    if (discover) {
      d[next] = time
      stack.push(next)
    } else f[stack.pop()!] = time
    time++
  }
  return { steps, d, f }
}

/* ───────────── Dijkstra: next node and its distance ───────────── */

export interface DijkstraStep extends DrillStepBase {
  kind: 'pick' | 'dist'
  /** Finalized nodes with their distances (in order). */
  final: [string, number][]
  /** 'pick': unfinished nodes; 'dist': candidate distances as text. */
  options: string[]
  /** The node being asked about in a 'dist' step. */
  node: string | null
}

export function dijkstraDrillGraph(seed: number): Graph {
  const rng = makeRng(seed)
  for (;;) {
    const g: Graph = { ...DIJKSTRA_EXAMPLE, edges: DIJKSTRA_EXAMPLE.edges.map((e) => ({ ...e, w: randInt(rng, 1, 9) })) }
    // Retry until every extraction is unambiguous (no ties for the minimum).
    if (dijkstraOrder(g).unique) return g
  }
}

function dijkstraOrder(g: Graph, source = 's') {
  const adj = adjacency(g)
  const dist: Record<string, number> = { [source]: 0 }
  const pred: Record<string, string | null> = { [source]: null }
  const done: [string, number][] = []
  let unique = true
  for (;;) {
    const open = Object.keys(dist).filter((v) => !done.some(([x]) => x === v))
    if (!open.length) break
    open.sort((x, y) => dist[x] - dist[y])
    if (open.length > 1 && dist[open[0]] === dist[open[1]]) unique = false
    const u = open[0]
    done.push([u, dist[u]])
    for (const { v, w } of adj[u])
      if (!done.some(([x]) => x === v) && (dist[v] === undefined || dist[u] + w < dist[v])) {
        dist[v] = dist[u] + w
        pred[v] = u
      }
  }
  return { done, pred, unique }
}

export function dijkstraDrill(g: Graph, source = 's'): { steps: DijkstraStep[]; dist: Record<string, number> } {
  const { done, pred } = dijkstraOrder(g, source)
  const steps: DijkstraStep[] = []
  const weight = (u: string, v: string) => g.edges.find((e) => e.u === u && e.v === v)!.w!
  for (let k = 1; k < done.length; k++) {
    const [u, du] = done[k]
    const final = done.slice(0, k)
    const options = ids(g)
      .filter((v) => !final.some(([x]) => x === v))
      .sort()
    steps.push({
      kind: 'pick',
      final,
      options,
      node: null,
      answer: options.indexOf(u),
      hint: tx(
        'Kesinleşmemiş her düğüm için geçici uzaklığı hesapla: kesinleşmiş bir p’den gelen kenarlarla en küçük d(p) + w(p, v). En küçüğü kesinleşir.',
        'For every unfinished node compute its tentative distance: the smallest d(p) + w(p, v) over edges from finalized nodes p. The smallest one is finalized.',
      ),
      why: tx(`${u}’nun geçici uzaklığı kesinleşmemişler arasında en küçüğü.`, `${u} has the smallest tentative distance among the unfinished nodes.`),
    })
    const p = pred[u]!
    const cands = new Set<number>([du])
    for (const [x, dx] of final) {
      const e = g.edges.find((ed) => ed.u === x && ed.v === u)
      if (e) cands.add(dx + e.w!)
    }
    for (const delta of [1, -1, 2, 3]) if (du + delta > 0) cands.add(du + delta)
    const nums = [...cands].slice(0, 4).sort((x, y) => x - y)
    steps.push({
      kind: 'dist',
      final,
      options: nums.map(String),
      node: u,
      answer: nums.indexOf(du),
      hint: tx(`${u}’ya kesinleşmiş düğümlerden gelen her kenar için d(p) + w(p, ${u}) değerini hesapla; en küçüğünü al.`, `For each edge into ${u} from a finalized node p compute d(p) + w(p, ${u}); take the smallest.`),
      why: tx(`d(${u}) = d(${p}) + w(${p}, ${u}) = ${done.find(([x]) => x === p)![1]} + ${weight(p, u)} = ${du}.`, `d(${u}) = d(${p}) + w(${p}, ${u}) = ${done.find(([x]) => x === p)![1]} + ${weight(p, u)} = ${du}.`),
    })
  }
  return { steps, dist: Object.fromEntries(done) }
}

/* ───────────── LCS: fill the table ───────────── */

export interface LcsStep extends DrillStepBase {
  X: string
  Y: string
  /** (n+1)×(m+1) table; null = not filled yet. */
  table: (number | null)[][]
  i: number
  j: number
}

export function lcsDrillInput(seed: number): { X: string; Y: string } {
  const rng = makeRng(seed)
  const word = (n: number) => Array.from({ length: n }, () => 'ABCD'[randInt(rng, 0, 3)]).join('')
  return { X: word(4), Y: word(5) }
}

export function lcsDrill(X: string, Y: string): { steps: LcsStep[]; table: number[][] } {
  const C: (number | null)[][] = Array.from({ length: X.length + 1 }, (_, i) => Array.from({ length: Y.length + 1 }, (_, j) => (i === 0 || j === 0 ? 0 : null)))
  const steps: LcsStep[] = []
  for (let i = 1; i <= X.length; i++)
    for (let j = 1; j <= Y.length; j++) {
      const match = X[i - 1] === Y[j - 1]
      const up = C[i - 1][j]!
      const left = C[i][j - 1]!
      const v = match ? C[i - 1][j - 1]! + 1 : Math.max(up, left)
      steps.push({
        X,
        Y,
        table: C.map((r) => [...r]),
        i,
        j,
        answer: v,
        hint: match
          ? tx(`X[${i}] = Y[${j}] = ${X[i - 1]}: harfler eşleşiyor, sol üst çapraz hücreye bak.`, `X[${i}] = Y[${j}] = ${X[i - 1]}: the letters match, look at the upper-left diagonal cell.`)
          : tx(`X[${i}] = ${X[i - 1]}, Y[${j}] = ${Y[j - 1]}: eşleşmiyor; üstteki ve soldaki hücreye bak.`, `X[${i}] = ${X[i - 1]}, Y[${j}] = ${Y[j - 1]}: no match; look at the cells above and to the left.`),
        why: match
          ? tx(`Eşleşme: C[${i}][${j}] = C[${i - 1}][${j - 1}] + 1 = ${v}.`, `A match: C[${i}][${j}] = C[${i - 1}][${j - 1}] + 1 = ${v}.`)
          : tx(`Eşleşme yok: C[${i}][${j}] = max(${up}, ${left}) = ${v}.`, `No match: C[${i}][${j}] = max(${up}, ${left}) = ${v}.`),
      })
      C[i][j] = v
    }
  return { steps, table: C as number[][] }
}

/* ───────────── Huffman: the two smallest keys ───────────── */

export interface HTree {
  label: string
  freq: number
}

export interface HuffmanStep extends DrillStepBase {
  forest: HTree[]
  /** Already picked in this round (for the second pick). */
  picked: HTree | null
  /** Indexes into forest. */
  options: number[]
  round: number
}

export function huffmanDrillInput(seed: number): [string, number][] {
  const rng = makeRng(seed)
  for (;;) {
    const chars = 'abcdef'.split('').map((c) => [c, randInt(rng, 2, 30)] as [string, number])
    // Retry until the two smallest keys are unambiguous in every round.
    let forest = chars.map(([, f]) => f)
    let ok = true
    while (forest.length > 1) {
      const s = [...forest].sort((x, y) => x - y)
      if (s[0] === s[1] || (s.length > 2 && s[1] === s[2])) ok = false
      forest = [...s.slice(2), s[0] + s[1]]
    }
    if (ok) return chars
  }
}

export function huffmanDrill(chars: [string, number][]): { steps: HuffmanStep[]; cost: number; root: HTree } {
  let forest: HTree[] = chars.map(([c, f]) => ({ label: c, freq: f }))
  const steps: HuffmanStep[] = []
  let cost = 0
  let round = 1
  while (forest.length > 1) {
    const [x, y] = [...forest].sort((p, q) => p.freq - q.freq)
    const all = forest.map((_, k) => k)
    steps.push({
      forest,
      picked: null,
      options: all,
      round,
      answer: forest.indexOf(x),
      hint: tx('Ormandaki ağaçların köklerindeki anahtarlara bak: en küçüğü hangisi?', 'Look at the keys at the roots of the forest: which is the smallest?'),
      why: tx(`${x.label} (${x.freq}) en küçük anahtar.`, `${x.label} (${x.freq}) is the smallest key.`),
    })
    steps.push({
      forest,
      picked: x,
      options: all.filter((k) => forest[k] !== x),
      round,
      answer: all.filter((k) => forest[k] !== x).indexOf(forest.indexOf(y)),
      hint: tx('Seçtiğin düğüm dışında en küçük anahtar hangisi?', 'Apart from the node you picked, which key is the smallest?'),
      why: tx(`${y.label} (${y.freq}) ikinci en küçük. Birleşince anahtar ${x.freq} + ${y.freq} = ${x.freq + y.freq} olur.`, `${y.label} (${y.freq}) is the second smallest. Merged, the key is ${x.freq} + ${y.freq} = ${x.freq + y.freq}.`),
    })
    cost += x.freq + y.freq
    forest = [...forest.filter((t) => t !== x && t !== y), { label: [...(x.label + y.label)].sort().join(''), freq: x.freq + y.freq }]
    round++
  }
  return { steps, cost, root: forest[0] }
}

/* ───────────── Kruskal: add or skip ───────────── */

export interface KruskalStep extends DrillStepBase {
  /** Edge indices in increasing weight. */
  order: number[]
  pos: number
  tree: number[]
  skipped: number[]
  sets: string[][]
}

export function kruskalDrillGraph(seed: number): Graph {
  const rng = makeRng(seed)
  const w = randomPermutation(rng, MST_SMALL.edges.length)
  return { ...MST_SMALL, edges: MST_SMALL.edges.map((e, i) => ({ ...e, w: w[i] })) }
}

export function kruskalDrill(g: Graph): { steps: KruskalStep[]; weight: number; tree: number[] } {
  const order = g.edges.map((_, i) => i).sort((a, b) => g.edges[a].w! - g.edges[b].w!)
  const leader: Record<string, string> = Object.fromEntries(ids(g).map((v) => [v, v]))
  const sets = () => {
    const groups: Record<string, string[]> = {}
    for (const v of ids(g)) (groups[leader[v]] ??= []).push(v)
    return Object.values(groups)
      .map((s) => s.sort())
      .sort((a, b) => a[0].localeCompare(b[0]))
  }
  const tree: number[] = []
  const skipped: number[] = []
  const steps: KruskalStep[] = []
  order.forEach((e, pos) => {
    const { u, v, w } = g.edges[e]
    const add = leader[u] !== leader[v]
    steps.push({
      order,
      pos,
      tree: [...tree],
      skipped: [...skipped],
      sets: sets(),
      answer: add ? 0 : 1,
      hint: tx(`${u} ve ${v} aynı kümede mi? Aynı kümedeyse kenar bir döngü kapatır.`, `Are ${u} and ${v} in the same set? If so, the edge would close a cycle.`),
      why: add
        ? tx(`${u}–${v} (${w}) iki farklı kümeyi bağlıyor: ağaca eklenir, kümeler birleşir.`, `${u}–${v} (${w}) joins two different sets: it is added and the sets are merged.`)
        : tx(`${u} ve ${v} zaten aynı kümede: ${u}–${v} (${w}) bir döngü kapatırdı, atlanır.`, `${u} and ${v} are already in the same set: ${u}–${v} (${w}) would close a cycle and is skipped.`),
    })
    if (add) {
      tree.push(e)
      const from = leader[v]
      for (const x of ids(g)) if (leader[x] === from) leader[x] = leader[u]
    } else skipped.push(e)
  })
  return { steps, weight: tree.reduce((s, e) => s + g.edges[e].w!, 0), tree }
}

/* ───────────── Gale–Shapley: accept or reject ───────────── */

export interface GsPrefs {
  doctors: string[]
  hospitals: string[]
  dPref: Record<string, string[]>
  hPref: Record<string, string[]>
}

export interface GsStep extends DrillStepBase {
  /** hospital → doctor */
  match: Record<string, string | null>
  next: Record<string, number>
  d: string
  h: string
}

export function gsDrillInput(seed: number): GsPrefs {
  const rng = makeRng(seed)
  const doctors = ['Ada', 'Bora', 'Can', 'Deniz']
  const hospitals = ['W', 'X', 'Y', 'Z']
  return {
    doctors,
    hospitals,
    dPref: Object.fromEntries(doctors.map((d) => [d, shuffle(rng, hospitals)])),
    hPref: Object.fromEntries(hospitals.map((h) => [h, shuffle(rng, doctors)])),
  }
}

export function gsDrill(p: GsPrefs): { steps: GsStep[]; match: Record<string, string> } {
  const match: Record<string, string | null> = Object.fromEntries(p.hospitals.map((h) => [h, null]))
  const next: Record<string, number> = Object.fromEntries(p.doctors.map((d) => [d, 0]))
  const free = [...p.doctors]
  const steps: GsStep[] = []
  const rank = (h: string, d: string) => p.hPref[h].indexOf(d)
  while (free.length) {
    const d = free[0]
    const h = p.dPref[d][next[d]]
    const cur = match[h]
    const accept = cur === null || rank(h, d) < rank(h, cur)
    steps.push({
      match: { ...match },
      next: { ...next },
      d,
      h,
      answer: accept ? 0 : 1,
      hint: cur === null ? tx(`${h} şu an kimseyle eşleşmemiş.`, `${h} is not matched with anyone right now.`) : tx(`${h}’nin listesinde ${d} ile ${cur}’dan hangisi daha önde?`, `On ${h}’s list, who comes first: ${d} or ${cur}?`),
      why:
        cur === null
          ? tx(`${h} boş: ${d}’yi geçici olarak kabul eder.`, `${h} is empty: it tentatively accepts ${d}.`)
          : accept
            ? tx(`${h}, ${d}’yi ${cur}’a tercih ediyor: ${d} kabul edilir, ${cur} yeniden boşta.`, `${h} prefers ${d} to ${cur}: ${d} is accepted and ${cur} is free again.`)
            : tx(`${h}, ${cur}’ı ${d}’ye tercih ediyor: ${d} reddedilir ve listesindeki sonraki hastaneye geçer.`, `${h} prefers ${cur} to ${d}: ${d} is rejected and moves on to the next hospital on the list.`),
    })
    next[d]++
    if (accept) {
      free.shift()
      if (cur) free.push(cur)
      match[h] = d
    }
  }
  return { steps, match: match as Record<string, string> }
}
