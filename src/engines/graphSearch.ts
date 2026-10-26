import type { Trace, TraceStep } from '../trace/types'
import { adjacency, ids, type Graph } from './graph'
import { tx } from '../i18n/lang'

/** Lecture 9: DFS with discovery/finish times, BFS layers, connected components and topological order. */

export type Color = 'white' | 'gray' | 'black'

export interface SearchState {
  color: Record<string, Color>
  d: Record<string, number | null>
  f: Record<string, number | null>
  parent: Record<string, string | null>
  /** BFS: layer index of each discovered node. */
  layer: Record<string, number | null>
  /** Edge index being scanned, and the tree edges so far. */
  scanning: number | null
  tree: number[]
  current: string | null
  /** DFS: call stack (bottom → top). BFS: current layer then next layer. */
  stack: string[]
  queue: string[][]
  /** Connected components: component number of each node. */
  comp: Record<string, number | null>
  /** Topological order built so far (reverse finishing order). */
  order: string[]
}

export const DFS_CODE = [
  'DFS(s, t):              # s is white, t = time',
  '    color(s) = gray; d(s) = t; t = t + 1',
  '    for v in N(s):',
  '        if color(v) == white:',
  '            p(v) = s',
  '            t = DFS(v, t); t = t + 1',
  '    f(s) = t; color(s) = black',
  '    return f(s)',
  '',
  'DFS(G): t = 1; for v in G: if white: t = DFS(v, t); t = t + 1',
]

export const BFS_CODE = [
  'BFS(s):',
  '    vis[v] = false for all v; L0 = {s}; vis[s] = true',
  '    for i = 0, 1, …:',
  '        if Li is empty: exit',
  '        while Li is not empty:',
  '            u = Li.pop()',
  '            for x in N(u):',
  '                if not vis[x]:',
  '                    vis[x] = true; L(i+1).insert(x); p(x) = u',
]

const empty = (g: Graph): SearchState => {
  const all = ids(g)
  const o = <T,>(v: T) => Object.fromEntries(all.map((k) => [k, v])) as Record<string, T>
  return { color: o<Color>('white'), d: o<number | null>(null), f: o<number | null>(null), parent: o<string | null>(null), layer: o<number | null>(null), scanning: null, tree: [], current: null, stack: [], queue: [], comp: o<number | null>(null), order: [] }
}

const clone = (s: SearchState): SearchState => ({
  ...s,
  color: { ...s.color },
  d: { ...s.d },
  f: { ...s.f },
  parent: { ...s.parent },
  layer: { ...s.layer },
  tree: [...s.tree],
  stack: [...s.stack],
  queue: s.queue.map((q) => [...q]),
  comp: { ...s.comp },
  order: [...s.order],
})

type Step = Omit<TraceStep<SearchState>, 'state'>

export type DfsMode = 'dfs' | 'components' | 'topo'

/** Full DFS(G) as in the Lecture 9 notes (Algorithms 2 and 4), with the notes’ timestamp convention. */
export function dfsTrace(g: Graph, mode: DfsMode = 'dfs', startOrder?: string[]): Trace<SearchState> {
  const adj = adjacency(g)
  const s = empty(g)
  const trace: Trace<SearchState> = []
  let scans = 0
  let comp = 0
  const push = (step: Step) => trace.push({ ...step, state: clone(s), counters: { [tx('kenar taraması', 'edge scans')]: scans, [tx('zaman', 'time')]: t } })
  let t = 1
  const visit = (u: string) => {
    s.color[u] = 'gray'
    s.d[u] = t
    if (mode === 'components') s.comp[u] = comp
    s.stack.push(u)
    s.current = u
    s.scanning = null
    push({ line: 2, phase: 'DFS', explain: tx(`${u} keşfedildi (gri): d(${u}) = ${t}.`, `${u} is discovered (gray): d(${u}) = ${t}.`) })
    t++
    for (const { v, e } of adj[u]) {
      scans++
      s.scanning = e
      s.current = u
      if (s.color[v] === 'white') {
        push({
          line: 4,
          phase: 'DFS',
          explain: tx(`${u}→${v} taranıyor: ${v} beyaz, oradan derine iniyoruz.`, `Scanning ${u}→${v}: ${v} is white, so we go deeper from it.`),
          predict: {
            question: tx(`${u}→${v} kenarı taranıyor. Ne olur?`, `Edge ${u}→${v} is scanned. What happens?`),
            options: [tx(`${v}'den DFS çağrılır`, `DFS is called on ${v}`), tx('Kenar atlanır', 'The edge is skipped')],
            answer: 0,
            why: tx(`${v} henüz keşfedilmedi (beyaz).`, `${v} has not been discovered yet (white).`),
          },
        })
        s.parent[v] = u
        s.tree.push(e)
        t = visitRet(v)
        t++
        s.current = u
        s.scanning = null
        push({ line: 6, phase: 'DFS', explain: tx(`${v} bitti; ${u}'ya geri dönüldü, zaman ${t}.`, `${v} is finished; back at ${u}, time ${t}.`) })
      } else {
        push({
          line: 4,
          phase: 'DFS',
          explain:
            s.color[v] === 'gray'
              ? tx(`${u}→${v} taranıyor: ${v} gri (hâlâ yığında), atlanır. Yönlü grafikte bu bir geri kenardır: bir döngü var.`, `Scanning ${u}→${v}: ${v} is gray (still on the stack) and is skipped. In a directed graph this is a back edge: there is a cycle.`)
              : tx(`${u}→${v} taranıyor: ${v} zaten bitmiş (siyah), atlanır.`, `Scanning ${u}→${v}: ${v} is already finished (black) and is skipped.`),
          predict: {
            question: tx(`${u}→${v} kenarı taranıyor. Ne olur?`, `Edge ${u}→${v} is scanned. What happens?`),
            options: [tx(`${v}'den DFS çağrılır`, `DFS is called on ${v}`), tx('Kenar atlanır', 'The edge is skipped')],
            answer: 1,
            why: tx(`${v} beyaz değil: daha önce keşfedildi.`, `${v} is not white: it was discovered before.`),
          },
        })
      }
    }
    s.f[u] = t
    s.color[u] = 'black'
    s.stack.pop()
    s.scanning = null
    if (mode === 'topo') s.order.unshift(u)
    push({
      line: 7,
      phase: 'DFS',
      explain:
        mode === 'topo'
          ? tx(`${u}'nun tüm komşuları bitti: f(${u}) = ${t}, siyah. Sıralamanın başına eklenir (bitiş zamanına göre azalan sıra).`, `All neighbors of ${u} are done: f(${u}) = ${t}, black. It goes to the front of the order (decreasing finish time).`)
          : tx(`${u}'nun tüm komşuları tarandı: f(${u}) = ${t}, ${u} siyah.`, `All neighbors of ${u} have been scanned: f(${u}) = ${t}, ${u} is black.`),
    })
    return t
  }
  const visitRet = (u: string) => visit(u)
  push({ line: 10, phase: tx('Başlangıç', 'Start'), explain: tx('Tüm düğümler beyaz; t = 1.', 'All nodes are white; t = 1.') })
  for (const v of startOrder ?? ids(g)) {
    if (s.color[v] !== 'white') continue
    s.current = v
    push({
      line: 10,
      phase: mode === 'components' ? tx(`Bileşen ${comp + 1}`, `Component ${comp + 1}`) : 'DFS(G)',
      explain:
        mode === 'components'
          ? tx(`${v} hâlâ beyaz: yeni bir bağlı bileşen bulundu, ${v}'den arama başlıyor.`, `${v} is still white: a new connected component; a search starts from ${v}.`)
          : tx(`${v} beyaz: DFS(${v}, ${t}) çağrılıyor.`, `${v} is white: calling DFS(${v}, ${t}).`),
    })
    t = visit(v)
    t++
    if (mode === 'components') comp++
  }
  s.current = null
  push({
    line: 10,
    phase: tx('Bitti', 'Done'),
    explain:
      mode === 'components'
        ? tx(`${comp} bağlı bileşen bulundu. Toplam iş O(n + m).`, `${comp} connected component(s) found. Total work O(n + m).`)
        : mode === 'topo'
          ? tx(`Topolojik sıra: ${s.order.join(', ')}. Her kenar u→v için f(u) > f(v) olduğundan, bitiş zamanına göre azalan sıra geçerlidir.`, `Topological order: ${s.order.join(', ')}. Every edge u→v has f(u) > f(v), so decreasing finish time is a valid order.`)
          : tx('Tüm düğümler siyah. Her düğüm bir kez ziyaret edildi, her kenar en çok iki kez tarandı: O(n + m).', 'All nodes are black. Every node was visited once and every edge scanned at most twice: O(n + m).'),
  })
  return trace
}

/** BFS(s) as in the Lecture 9 notes (Algorithm 5): explicit layers L0, L1, … */
export function bfsTrace(g: Graph, source: string): Trace<SearchState> {
  const adj = adjacency(g)
  const s = empty(g)
  const trace: Trace<SearchState> = []
  let scans = 0
  const push = (step: Step) => trace.push({ ...step, state: clone(s), counters: { [tx('kenar taraması', 'edge scans')]: scans } })
  s.layer[source] = 0
  s.color[source] = 'gray'
  s.queue = [[source], []]
  push({ line: 2, phase: 'L0', explain: tx(`L0 = {${source}}: kaynak kendine 0 uzaklıkta.`, `L0 = {${source}}: the source is at distance 0 from itself.`) })
  for (let i = 0; ; i++) {
    const cur = s.queue[0]
    if (!cur.length) break
    while (cur.length) {
      const u = cur.shift()!
      s.current = u
      s.color[u] = 'black'
      for (const { v, e } of adj[u]) {
        scans++
        s.scanning = e
        if (s.layer[v] === null) {
          s.layer[v] = i + 1
          s.parent[v] = u
          s.color[v] = 'gray'
          s.tree.push(e)
          s.queue[1].push(v)
          push({
            line: 9,
            phase: `L${i}`,
            explain: tx(`${u}→${v}: ${v} ilk kez görüldü, L${i + 1}'e eklendi. d(s, ${v}) = ${i + 1}, p(${v}) = ${u}.`, `${u}→${v}: ${v} is seen for the first time and added to L${i + 1}. d(s, ${v}) = ${i + 1}, p(${v}) = ${u}.`),
            predict: {
              question: tx(`${u} işleniyor, komşusu ${v} ilk kez görülüyor. ${v} hangi katmana girer?`, `${u} is processed and its neighbor ${v} is seen for the first time. Which layer does ${v} join?`),
              options: [`L${i}`, `L${i + 1}`, `L${i + 2}`],
              answer: 1,
              why: tx(`${u} ∈ L${i}; ${v}'ye ondan bir kenarla ulaşılıyor ve daha önce görülmedi, yani uzaklığı ${i + 1}.`, `${u} ∈ L${i}; ${v} is reached by one edge from it and was not seen before, so its distance is ${i + 1}.`),
            },
          })
        } else {
          push({ line: 8, phase: `L${i}`, explain: tx(`${u}→${v}: ${v} zaten görüldü (L${s.layer[v]}), atlanır.`, `${u}→${v}: ${v} was already seen (L${s.layer[v]}) and is skipped.`) })
        }
      }
      s.scanning = null
    }
    s.queue.shift()
    s.queue.push([])
    const next = s.queue[0]
    push({
      line: 4,
      phase: `L${i + 1}`,
      explain: next.length
        ? tx(`L${i} bitti. L${i + 1} = {${next.join(', ')}}: kaynaktan tam ${i + 1} uzaklıktaki düğümler.`, `L${i} is done. L${i + 1} = {${next.join(', ')}}: the nodes at distance exactly ${i + 1} from the source.`)
        : tx(`L${i + 1} boş: ulaşılabilen her düğüm bulundu. Ulaşılamayanlar beyaz kalır.`, `L${i + 1} is empty: every reachable node has been found. Unreachable ones stay white.`),
    })
  }
  s.current = null
  return trace
}

/** Plain helpers used by tests and generators. */
export function bfsDistances(g: Graph, source: string): Record<string, number | null> {
  const adj = adjacency(g)
  const d: Record<string, number | null> = Object.fromEntries(ids(g).map((v) => [v, null]))
  d[source] = 0
  const q = [source]
  while (q.length) {
    const u = q.shift()!
    for (const { v } of adj[u])
      if (d[v] === null) {
        d[v] = d[u]! + 1
        q.push(v)
      }
  }
  return d
}

export function dfsTimes(g: Graph): { d: Record<string, number>; f: Record<string, number> } {
  const last = dfsTrace(g).at(-1)!.state
  return { d: last.d as Record<string, number>, f: last.f as Record<string, number> }
}

export function topoOrder(g: Graph): string[] {
  return dfsTrace(g, 'topo').at(-1)!.state.order
}

export function componentCount(g: Graph): number {
  const last = dfsTrace(g, 'components').at(-1)!.state
  return new Set(Object.values(last.comp)).size
}
