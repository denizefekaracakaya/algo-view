import type { Trace, TraceStep } from '../trace/types'
import { adjacency, ids, type Graph } from './graph'
import { tx } from '../i18n/lang'

/** Lecture 15: Prim’s and Kruskal’s algorithms (both are instances of the “add a light edge across a cut” template). */

export const PRIM_CODE = [
  'Prim(G, r):',
  '    key(v) = ∞, p(v) = NIL for all v; key(r) = 0',
  '    Q = all vertices; A = ∅',
  '    while Q is not empty:',
  '        u = ExtractMin(Q)',
  '        if u ≠ r: A = A ∪ {(p(u), u)}',
  '        for each neighbor v of u:',
  '            if v ∈ Q and w(u, v) < key(v):',
  '                key(v) = w(u, v); p(v) = u',
  '    return A',
]

export const KRUSKAL_CODE = [
  'Kruskal(G):',
  '    A = ∅; E′ = edges sorted by weight',
  '    for v in V: makeset(v)',
  '    for (u, v) in E′:',
  '        if find(u) ≠ find(v):',
  '            A = A ∪ {(u, v)}; union(u, v)',
  '    return A',
]

export interface MstState {
  /** Edge indices in A. */
  tree: number[]
  /** Edge being examined. */
  edge: number | null
  rejected: number[]
  /** Prim: vertices already in the tree, keys and parents. */
  inTree: string[]
  key: Record<string, number>
  parent: Record<string, string | null>
  /** Kruskal: the current sets (each sorted). */
  sets: string[][]
  current: string | null
}

const base = (): MstState => ({ tree: [], edge: null, rejected: [], inTree: [], key: {}, parent: {}, sets: [], current: null })

const fmt = (x: number) => (x === Infinity ? '∞' : String(x))

export function primTrace(g: Graph, r: string): { trace: Trace<MstState>; weight: number; tree: number[] } {
  const adj = adjacency(g)
  const all = ids(g)
  const s = base()
  s.key = Object.fromEntries(all.map((v) => [v, v === r ? 0 : Infinity]))
  s.parent = Object.fromEntries(all.map((v) => [v, null]))
  const parentEdge: Record<string, number | null> = Object.fromEntries(all.map((v) => [v, null]))
  const Q = new Set(all)
  const trace: Trace<MstState> = []
  let weight = 0
  const push = (step: Omit<TraceStep<MstState>, 'state'>) =>
    trace.push({ ...step, state: { ...s, tree: [...s.tree], rejected: [...s.rejected], inTree: [...s.inTree], key: { ...s.key }, parent: { ...s.parent } }, counters: { [tx('ağaç ağırlığı', 'tree weight')]: weight } })
  push({ line: 2, phase: tx('Başlangıç', 'Start'), explain: tx(`key(${r}) = 0, diğer anahtarlar ∞. Ağaç ${r}'den büyüyecek.`, `key(${r}) = 0, every other key is ∞. The tree will grow from ${r}.`) })
  while (Q.size) {
    let u: string | null = null
    for (const v of all) if (Q.has(v) && (u === null || s.key[v] < s.key[u])) u = v
    const cand = all.filter((v) => Q.has(v) && v !== u).sort((a, b) => s.key[a] - s.key[b])
    Q.delete(u!)
    s.inTree.push(u!)
    s.current = u
    if (u !== r && parentEdge[u!] !== null) {
      s.tree.push(parentEdge[u!]!)
      weight += s.key[u!]
    }
    s.edge = parentEdge[u!]
    push({
      line: u === r ? 5 : 6,
      phase: tx(`${u} eklendi`, `${u} added`),
      explain:
        u === r
          ? tx(`ExtractMin: ${r} (key 0). Ağaç yalnızca ${r}.`, `ExtractMin: ${r} (key 0). The tree is just ${r}.`)
          : tx(
              `ExtractMin: ${u} (key ${s.key[u!]}). (${s.parent[u!]}, ${u}) ağaçtan dışarı çıkan en hafif kenar; kesme özelliğine göre güvenli, A'ya eklendi.`,
              `ExtractMin: ${u} (key ${s.key[u!]}). (${s.parent[u!]}, ${u}) is the lightest edge leaving the tree; by the cut property it is safe and is added to A.`,
            ),
      predict:
        u !== r && cand.length
          ? {
              question: tx('Sıradaki ExtractMin hangi düğümü verir?', 'Which vertex does the next ExtractMin return?'),
              options: [u!, ...cand.slice(0, 2)],
              answer: 0,
              why: tx(`Q'da en küçük anahtar ${u}'da: ${s.key[u!]}.`, `The smallest key in Q is at ${u}: ${s.key[u!]}.`),
            }
          : undefined,
    })
    for (const { v, w, e } of adj[u!]) {
      if (!Q.has(v)) continue
      if (w < s.key[v]) {
        const old = s.key[v]
        s.key[v] = w
        s.parent[v] = u
        parentEdge[v] = e
        s.edge = e
        push({ line: 9, phase: tx(`${u} eklendi`, `${u} added`), explain: tx(`${u}–${v} (${w}) < key(${v}) = ${fmt(old)}: key(${v}) = ${w}, p(${v}) = ${u}.`, `${u}–${v} (${w}) < key(${v}) = ${fmt(old)}: key(${v}) = ${w}, p(${v}) = ${u}.`) })
      }
    }
    s.edge = null
  }
  s.current = null
  push({ line: 10, phase: tx('Bitti', 'Done'), explain: tx(`Minimum yayılan ağaç: ${s.tree.length} kenar, toplam ağırlık ${weight}.`, `Minimum spanning tree: ${s.tree.length} edges, total weight ${weight}.`) })
  return { trace, weight, tree: s.tree }
}

export function kruskalTrace(g: Graph): { trace: Trace<MstState>; weight: number; tree: number[] } {
  const s = base()
  const parent: Record<string, string> = Object.fromEntries(ids(g).map((v) => [v, v]))
  const find = (x: string): string => (parent[x] === x ? x : (parent[x] = find(parent[x])))
  const sets = () => {
    const m = new Map<string, string[]>()
    for (const v of ids(g)) m.set(find(v), [...(m.get(find(v)) ?? []), v])
    return [...m.values()].sort((a, b) => a[0].localeCompare(b[0]))
  }
  const order = g.edges.map((e, i) => ({ e, i })).sort((a, b) => (a.e.w ?? 1) - (b.e.w ?? 1) || a.i - b.i)
  const trace: Trace<MstState> = []
  let weight = 0
  const push = (step: Omit<TraceStep<MstState>, 'state'>) => trace.push({ ...step, state: { ...s, tree: [...s.tree], rejected: [...s.rejected], sets: sets() }, counters: { [tx('ağaç ağırlığı', 'tree weight')]: weight } })
  push({ line: 3, phase: tx('Başlangıç', 'Start'), explain: tx(`Kenarlar ağırlığa göre sıralandı: ${order.map(({ e }) => `${e.u}${e.v}(${e.w})`).join(', ')}. Her düğüm kendi kümesinde.`, `Edges sorted by weight: ${order.map(({ e }) => `${e.u}${e.v}(${e.w})`).join(', ')}. Every vertex is in its own set.`) })
  for (const { e, i } of order) {
    if (s.tree.length === g.nodes.length - 1) break
    s.edge = i
    const a = find(e.u)
    const b = find(e.v)
    const ok = a !== b
    const setOf = (x: string) => '{' + sets().find((c) => c.includes(x))!.join(', ') + '}'
    if (ok) {
      s.tree.push(i)
      weight += e.w ?? 1
      const sa = setOf(e.u)
      const sb = setOf(e.v)
      parent[a] = b
      push({
        line: 6,
        phase: tx('Kenar inceleniyor', 'Examining edges'),
        explain: tx(`${e.u}–${e.v} (${e.w}): ${sa} ve ${sb} farklı kümeler; kenar iki ağacı birleştiren en hafif kenar → A'ya eklendi, kümeler birleşti.`, `${e.u}–${e.v} (${e.w}): ${sa} and ${sb} are different sets; it is the lightest edge joining two trees → added to A, sets merged.`),
        predict: {
          question: tx(`${e.u}–${e.v} (${e.w}) ağaca eklenir mi?`, `Is ${e.u}–${e.v} (${e.w}) added to the tree?`),
          options: [tx('Evet', 'Yes'), tx('Hayır, döngü oluşturur', 'No, it would form a cycle')],
          answer: 0,
          why: tx('Uçları farklı bileşenlerde.', 'Its endpoints are in different components.'),
        },
      })
    } else {
      s.rejected.push(i)
      push({
        line: 5,
        phase: tx('Kenar inceleniyor', 'Examining edges'),
        explain: tx(`${e.u}–${e.v} (${e.w}): iki uç da ${setOf(e.u)} içinde; eklemek döngü oluşturur → atlandı.`, `${e.u}–${e.v} (${e.w}): both ends are in ${setOf(e.u)}; adding it would form a cycle → skipped.`),
        predict: {
          question: tx(`${e.u}–${e.v} (${e.w}) ağaca eklenir mi?`, `Is ${e.u}–${e.v} (${e.w}) added to the tree?`),
          options: [tx('Evet', 'Yes'), tx('Hayır, döngü oluşturur', 'No, it would form a cycle')],
          answer: 1,
          why: tx('Uçları zaten aynı bileşende.', 'Its endpoints are already in the same component.'),
        },
      })
    }
  }
  s.edge = null
  push({ line: 7, phase: tx('Bitti', 'Done'), explain: tx(`Tek küme kaldı: ${s.tree.length} kenar, toplam ağırlık ${weight}. Sıralama O(m log n), union-find işlemleri neredeyse sabit.`, `One set is left: ${s.tree.length} edges, total weight ${weight}. Sorting is O(m log n); union-find operations are nearly constant.`) })
  return { trace, weight, tree: s.tree }
}

/** Brute force minimum spanning tree weight over all (n−1)-edge subsets (small graphs only; for tests). */
export function mstBrute(g: Graph): number {
  const n = g.nodes.length
  const m = g.edges.length
  let best = Infinity
  const pick: number[] = []
  const rec = (start: number) => {
    if (pick.length === n - 1) {
      const parent: Record<string, string> = Object.fromEntries(ids(g).map((v) => [v, v]))
      const find = (x: string): string => (parent[x] === x ? x : (parent[x] = find(parent[x])))
      let ok = true
      for (const i of pick) {
        const a = find(g.edges[i].u)
        const b = find(g.edges[i].v)
        if (a === b) ok = false
        parent[a] = b
      }
      if (ok) best = Math.min(best, pick.reduce((s, i) => s + (g.edges[i].w ?? 1), 0))
      return
    }
    for (let i = start; i < m; i++) {
      pick.push(i)
      rec(i + 1)
      pick.pop()
    }
  }
  rec(0)
  return best
}
