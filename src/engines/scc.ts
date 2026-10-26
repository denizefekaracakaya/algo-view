import type { Trace, TraceStep } from '../trace/types'
import { adjacency, ids, reverse, type Graph } from './graph'
import { tx } from '../i18n/lang'

/**
 * Lecture 10: strongly connected components with two passes of DFS-Loop (the notes’ Algorithms 1–3):
 * pass 1 on G_rev computes finishing times f(v); pass 2 on G processes vertices in decreasing f(v)
 * and every DFS call collects exactly one SCC under a common leader.
 */
export const SCC_CODE = [
  'SCC(G):',
  '    Grev = G with every arc reversed',
  '    DFS-Loop(Grev)              # computes f(v)',
  '    DFS-Loop(G) in decreasing order of f(v)   # assigns leaders',
  '    SCCs = groups of vertices with the same leader',
  '',
  'DFS-Loop(G): t = 0',
  '    for i = n down to 1: if i not explored: s = i; DFS(G, i)',
  'DFS(G, i): mark i explored; leader(i) = s',
  '    for each arc (i, j): if j not explored: DFS(G, j)',
  '    t = t + 1; f(i) = t',
]

export interface SccState {
  pass: 1 | 2
  explored: Record<string, boolean>
  f: Record<string, number | null>
  leader: Record<string, string | null>
  current: string | null
  scanning: number | null
  stack: string[]
  /** Processing order of pass 2 (decreasing f). */
  order: string[]
}

/** `order` is the vertex labelling 1…n of pass 1: DFS-Loop scans it from the end (i = n down to 1). */
export function sccTrace(g: Graph, order: string[] = ids(g)): { trace: Trace<SccState>; leader: Record<string, string> } {
  const trace: Trace<SccState> = []
  const all = ids(g)
  const s: SccState = {
    pass: 1,
    explored: Object.fromEntries(all.map((v) => [v, false])),
    f: Object.fromEntries(all.map((v) => [v, null])),
    leader: Object.fromEntries(all.map((v) => [v, null])),
    current: null,
    scanning: null,
    stack: [],
    order: [],
  }
  const push = (step: Omit<TraceStep<SccState>, 'state'>) =>
    trace.push({ ...step, state: { ...s, explored: { ...s.explored }, f: { ...s.f }, leader: { ...s.leader }, stack: [...s.stack], order: [...s.order] } })

  const run = (graph: Graph, seq: string[], pass: 1 | 2) => {
    const adj = adjacency(graph)
    let t = 0
    let src: string | null = null
    const dfs = (i: string) => {
      s.explored[i] = true
      if (pass === 2) s.leader[i] = src
      s.stack.push(i)
      s.current = i
      s.scanning = null
      push({
        line: 9,
        phase: pass === 1 ? tx('1. geçiş (Grev)', 'Pass 1 (Grev)') : tx('2. geçiş (G)', 'Pass 2 (G)'),
        explain:
          pass === 1
            ? tx(`${i} keşfedildi (ters grafikte).`, `${i} is explored (in the reversed graph).`)
            : tx(`${i} keşfedildi; lideri ${src}.`, `${i} is explored; its leader is ${src}.`),
      })
      for (const { v, e } of adj[i]) {
        s.scanning = e
        s.current = i
        if (!s.explored[v]) {
          push({ line: 10, phase: pass === 1 ? tx('1. geçiş (Grev)', 'Pass 1 (Grev)') : tx('2. geçiş (G)', 'Pass 2 (G)'), explain: tx(`${i}→${v}: ${v} keşfedilmedi, içine in.`, `${i}→${v}: ${v} is unexplored, go into it.`) })
          dfs(v)
          s.current = i
        }
      }
      s.scanning = null
      s.stack.pop()
      if (pass === 1) {
        t++
        s.f[i] = t
        push({ line: 11, phase: tx('1. geçiş (Grev)', 'Pass 1 (Grev)'), explain: tx(`${i}'den ulaşılabilen her şey bitti: f(${i}) = ${t}.`, `Everything reachable from ${i} is done: f(${i}) = ${t}.`) })
      }
    }
    for (const i of seq) {
      if (s.explored[i]) continue
      src = i
      s.current = i
      push({
        line: 8,
        phase: pass === 1 ? tx('1. geçiş (Grev)', 'Pass 1 (Grev)') : tx('2. geçiş (G)', 'Pass 2 (G)'),
        explain:
          pass === 1
            ? tx(`${i} keşfedilmemiş: buradan yeni bir DFS başlıyor.`, `${i} is unexplored: a new DFS starts here.`)
            : tx(`Kalan en büyük f değeri ${i}'de (f = ${s.f[i]}): buradan başlayan DFS tam olarak bir SCC toplayacak; lider ${i}.`, `The largest remaining f value is at ${i} (f = ${s.f[i]}): the DFS from here collects exactly one SCC; leader ${i}.`),
        predict:
          pass === 2
            ? {
                question: tx(`2. geçişte sıradaki DFS hangi düğümden başlar?`, `Which vertex does the next DFS of pass 2 start from?`),
                options: [...new Set([i, ...seq.filter((v) => !s.explored[v] && v !== i).slice(-2)])],
                answer: 0,
                why: tx('Keşfedilmemiş düğümler arasında bitiş zamanı en büyük olandan başlanır.', 'We start from the unexplored vertex with the largest finishing time.'),
              }
            : undefined,
      })
      dfs(i)
    }
  }

  push({ line: 2, phase: tx('Hazırlık', 'Setup'), explain: tx('Önce her kenar ters çevrilir (Grev). G ile Grev aynı SCC’lere sahiptir.', 'First every arc is reversed (Grev). G and Grev have the same SCCs.') })
  run(reverse(g), [...order].reverse(), 1)
  s.pass = 2
  for (const v of all) s.explored[v] = false
  s.order = [...all].sort((a, b) => s.f[b]! - s.f[a]!)
  s.current = null
  push({ line: 4, phase: tx('2. geçiş (G)', 'Pass 2 (G)'), explain: tx(`Kenarlar eski yönüne döndü. Düğümler f'ye göre azalan sırada işlenecek: ${s.order.join(', ')}.`, `The arcs are back to their original direction. Vertices are processed in decreasing f: ${s.order.join(', ')}.`) })
  run(g, s.order, 2)
  s.current = null
  const groups = new Map<string, string[]>()
  for (const v of all) groups.set(s.leader[v]!, [...(groups.get(s.leader[v]!) ?? []), v])
  push({
    line: 5,
    phase: tx('Bitti', 'Done'),
    explain: tx(
      `${groups.size} güçlü bağlı bileşen: ${[...groups.values()].map((c) => '{' + c.join(', ') + '}').join(', ')}. İki DFS geçişi: O(n + m).`,
      `${groups.size} strongly connected components: ${[...groups.values()].map((c) => '{' + c.join(', ') + '}').join(', ')}. Two DFS passes: O(n + m).`,
    ),
  })
  return { trace, leader: s.leader as Record<string, string> }
}

/** Reference: SCCs by mutual reachability (O(n·(n+m)); used to check the two-pass algorithm). */
export function sccByReachability(g: Graph): string[][] {
  const adj = adjacency(g)
  const reach = (s: string) => {
    const seen = new Set([s])
    const st = [s]
    while (st.length)
      for (const { v } of adj[st.pop()!])
        if (!seen.has(v)) {
          seen.add(v)
          st.push(v)
        }
    return seen
  }
  const R = Object.fromEntries(ids(g).map((v) => [v, reach(v)]))
  const done = new Set<string>()
  const out: string[][] = []
  for (const v of ids(g)) {
    if (done.has(v)) continue
    const c = ids(g).filter((u) => R[v].has(u) && R[u].has(v))
    c.forEach((u) => done.add(u))
    out.push(c)
  }
  return out
}
