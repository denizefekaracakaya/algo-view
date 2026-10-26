import type { Trace, TraceStep } from '../trace/types'
import { ids, type Graph } from './graph'
import { tx } from '../i18n/lang'

/**
 * Lecture 16: Ford–Fulkerson. Augmenting paths are found in the residual graph either by BFS
 * (the shortest-path rule, Edmonds–Karp) or by DFS. Assumes no pair of antiparallel edges, as the notes do.
 */
export const FF_CODE = [
  'maxflow(G, s, t):',
  '    f = all-zero flow; Gf = G',
  '    while t is reachable from s in Gf:',
  '        P = a path from s to t in Gf',
  '        F = min residual capacity on P',
  '        push F along P (forward: +F, backward: −F)',
  '        update Gf',
  '    return f        # S = nodes reachable from s: a min cut',
]

export type PathRule = 'bfs' | 'dfs'

export interface ResidualEdge {
  u: string
  v: string
  cap: number
  /** Index of the original edge and whether this residual edge runs along it (true) or against it (false). */
  e: number
  forward: boolean
}

export interface FlowState {
  flow: number[]
  value: number
  path: ResidualEdge[] | null
  bottleneck: number | null
  /** Set S of the min cut, once the algorithm stops. */
  cut: string[] | null
  showResidual: boolean
}

export function residualEdges(g: Graph, flow: number[]): ResidualEdge[] {
  const out: ResidualEdge[] = []
  g.edges.forEach((ed, e) => {
    const c = ed.w ?? 0
    if (c - flow[e] > 0) out.push({ u: ed.u, v: ed.v, cap: c - flow[e], e, forward: true })
    if (flow[e] > 0) out.push({ u: ed.v, v: ed.u, cap: flow[e], e, forward: false })
  })
  return out
}

function findPath(g: Graph, flow: number[], s: string, t: string, rule: PathRule): { path: ResidualEdge[] | null; reach: Set<string> } {
  const res = residualEdges(g, flow)
  const out: Record<string, ResidualEdge[]> = Object.fromEntries(ids(g).map((v) => [v, []]))
  for (const r of res) out[r.u].push(r)
  for (const k of Object.keys(out)) out[k].sort((a, b) => a.v.localeCompare(b.v) || a.e - b.e)
  const prev: Record<string, ResidualEdge | null> = {}
  const reach = new Set([s])
  if (rule === 'bfs') {
    const q = [s]
    while (q.length) {
      const u = q.shift()!
      for (const r of out[u])
        if (!reach.has(r.v)) {
          reach.add(r.v)
          prev[r.v] = r
          q.push(r.v)
        }
    }
  } else {
    const dfs = (u: string) => {
      for (const r of out[u])
        if (!reach.has(r.v)) {
          reach.add(r.v)
          prev[r.v] = r
          dfs(r.v)
        }
    }
    dfs(s)
  }
  if (!reach.has(t)) return { path: null, reach }
  const path: ResidualEdge[] = []
  for (let v = t; v !== s; v = prev[v]!.u) path.unshift(prev[v]!)
  return { path, reach }
}

export function fordFulkersonTrace(g: Graph, s: string, t: string, rule: PathRule = 'bfs'): { trace: Trace<FlowState>; value: number; cut: string[]; flow: number[] } {
  const flow = g.edges.map(() => 0)
  let value = 0
  let rounds = 0
  const trace: Trace<FlowState> = []
  const push = (path: ResidualEdge[] | null, bottleneck: number | null, cut: string[] | null, showResidual: boolean, step: Omit<TraceStep<FlowState>, 'state'>) =>
    trace.push({ ...step, state: { flow: [...flow], value, path, bottleneck, cut, showResidual }, counters: { [tx('artırma', 'augmentations')]: rounds, '|f|': value } })
  push(null, null, null, false, { line: 2, phase: tx('Başlangıç', 'Start'), explain: tx('Akış her kenarda 0. Artık grafik Gf = G.', 'The flow is 0 on every edge. The residual graph Gf = G.') })
  const pathText = (p: ResidualEdge[]) => [p[0].u, ...p.map((r) => r.v)].join('→')
  for (;;) {
    const { path, reach } = findPath(g, flow, s, t, rule)
    if (!path) {
      const S = ids(g).filter((v) => reach.has(v))
      const cutCap = g.edges.reduce((sum, ed) => sum + (reach.has(ed.u) && !reach.has(ed.v) ? (ed.w ?? 0) : 0), 0)
      push(null, null, S, false, {
        line: 8,
        phase: tx('Bitti', 'Done'),
        explain: tx(
          `Gf'de s'den t'ye yol yok. S = {${S.join(', ')}} (s'den ulaşılabilenler). S'den T'ye giden kenarların kapasite toplamı ${cutCap} = |f| = ${value}: akış maksimum, (S, T) minimum kesme.`,
          `There is no s→t path in Gf. S = {${S.join(', ')}} (the nodes reachable from s). The capacities of the edges from S to T add up to ${cutCap} = |f| = ${value}: the flow is maximum and (S, T) is a minimum cut.`,
        ),
      })
      return { trace, value, cut: S, flow }
    }
    const F = Math.min(...path.map((r) => r.cap))
    const back = path.some((r) => !r.forward)
    push(path, F, null, true, {
      line: 5,
      phase: tx(`Artırma ${rounds + 1}`, `Augmentation ${rounds + 1}`),
      explain: tx(
        `Artık grafikte yol: ${pathText(path)}${back ? ' (ters bir kenar kullanıyor: daha önce gönderilen akışın bir kısmı geri alınacak)' : ''}. Darboğaz F = min(${path.map((r) => r.cap).join(', ')}) = ${F}.`,
        `A path in the residual graph: ${pathText(path)}${back ? ' (it uses a backward edge: some earlier flow will be undone)' : ''}. Bottleneck F = min(${path.map((r) => r.cap).join(', ')}) = ${F}.`,
      ),
      predict: {
        question: tx(`${pathText(path)} yolunun darboğazı nedir?`, `What is the bottleneck of the path ${pathText(path)}?`),
        options: [...new Set([F, ...path.map((r) => r.cap)])].sort((a, b) => a - b).slice(0, 4).map(String),
        answer: [...new Set([F, ...path.map((r) => r.cap)])].sort((a, b) => a - b).slice(0, 4).indexOf(F),
        why: tx('Yoldaki en küçük artık kapasite.', 'The smallest residual capacity on the path.'),
      },
    })
    for (const r of path) flow[r.e] += r.forward ? F : -F
    value += F
    rounds++
    push(path, F, null, false, {
      line: 6,
      phase: tx(`Artırma ${rounds}`, `Augmentation ${rounds}`),
      explain: tx(`Yol boyunca ${F} birim gönderildi: ileri kenarlarda akış +${F}${back ? `, ters kenarın karşılığı olan kenarda −${F}` : ''}. |f| = ${value}.`, `${F} units pushed along the path: +${F} on forward edges${back ? `, −${F} on the edge matching the backward one` : ''}. |f| = ${value}.`),
    })
  }
}

/** Value of the minimum s–t cut by brute force over all subsets (for tests). */
export function minCutBrute(g: Graph, s: string, t: string): number {
  const others = ids(g).filter((v) => v !== s && v !== t)
  let best = Infinity
  for (let mask = 0; mask < 1 << others.length; mask++) {
    const S = new Set([s, ...others.filter((_, i) => mask & (1 << i))])
    best = Math.min(best, g.edges.reduce((sum, ed) => sum + (S.has(ed.u) && !S.has(ed.v) ? (ed.w ?? 0) : 0), 0))
  }
  return best
}
