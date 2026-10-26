import { describe, expect, it } from 'vitest'
import { makeRng, randInt } from '../engines/random'
import type { Graph } from '../engines/graph'
import { bfsDistances } from '../engines/graphSearch'
import { sccByReachability } from '../engines/scc'
import { bellmanFordTrace, dijkstraTrace, floydTrace } from '../engines/shortestPaths'
import { knapsack01, lcs } from '../engines/dp'
import { activityTrace, huffmanTrace } from '../engines/greedy'
import { mstBrute } from '../engines/mst'
import { minCutBrute } from '../engines/maxFlow'
import { allStableMatchings, galeShapleyTrace } from '../engines/stableMatching'
import {
  LATER_EXERCISES,
  randEdges,
  refActivities,
  refBellmanFord,
  refBfs,
  refCountScc,
  refFloyd,
  refGaleShapley,
  refHasCycle,
  refHuffmanCost,
  refKnapsack,
  refLcs,
  refMaxFlow,
  refMstWeight,
  toAdj,
} from './codingLater'

type Edge = [number, number, number]
const toGraph = (n: number, edges: Edge[], directed: boolean): Graph => ({
  directed,
  nodes: Array.from({ length: n }, (_, i) => ({ id: 'v' + i, x: 0, y: 0 })),
  edges: edges.map(([u, v, w]) => ({ u: 'v' + u, v: 'v' + v, w })),
})
const fromRecord = (n: number, d: Record<string, number | null>) => Array.from({ length: n }, (_, i) => (d['v' + i] === undefined || d['v' + i] === null || !Number.isFinite(d['v' + i]!) ? null : d['v' + i]))

describe('reference solutions of the later coding exercises agree with the engines', () => {
  const rng = makeRng(2026)

  it('BFS, SCC count and cycle detection', () => {
    for (let round = 0; round < 80; round++) {
      const n = randInt(rng, 2, 9)
      const und = randEdges(rng, n, randInt(rng, 1, 2 * n), false, 1, 1)
      const s = randInt(rng, 0, n - 1)
      expect(refBfs(toAdj(n, und, false), s).map((x) => (x === -1 ? null : x))).toEqual(fromRecord(n, bfsDistances(toGraph(n, und, false), 'v' + s)))
      const dir = randEdges(rng, n, randInt(rng, 1, 2 * n), true, 1, 1)
      const sccs = sccByReachability(toGraph(n, dir, true))
      expect(refCountScc(toAdj(n, dir, true))).toBe(sccs.length)
      // A directed graph has a cycle iff some SCC has more than one node or a self-loop (none here).
      expect(refHasCycle(toAdj(n, dir, true))).toBe(sccs.some((c) => c.length > 1))
    }
  })

  it('Dijkstra, Bellman–Ford and Floyd–Warshall', () => {
    for (let round = 0; round < 80; round++) {
      const n = randInt(rng, 2, 7)
      const pos = randEdges(rng, n, randInt(rng, n - 1, 2 * n), true, 0, 9)
      const g = toGraph(n, pos, true)
      expect(refBellmanFord(n, pos, 0)).toEqual(fromRecord(n, dijkstraTrace(g, 'v0').d))
      const neg = randEdges(rng, n, randInt(rng, n - 1, 2 * n), true, -3, 8)
      const bf = bellmanFordTrace(toGraph(n, neg, true), 'v0')
      const ref = refBellmanFord(n, neg, 0)
      expect(ref === null).toBe(bf.negativeCycle)
      if (ref) expect(ref).toEqual(fromRecord(n, bf.d))
      const dag = neg.filter(([u, v]) => u < v)
      const m = floydTrace(toGraph(n, dag, true)).matrix
      expect(refFloyd(n, dag)).toEqual(m.map((row) => row.map((x) => (Number.isFinite(x) ? x : null))))
    }
  })

  it('LCS, knapsack, activities and Huffman', () => {
    for (let round = 0; round < 80; round++) {
      const word = (len: number) => Array.from({ length: len }, () => 'ABC'[randInt(rng, 0, 2)]).join('')
      const X = word(randInt(rng, 0, 9))
      const Y = word(randInt(rng, 0, 9))
      expect(refLcs(X, Y)).toBe(lcs(X, Y).length)
      const items = Array.from({ length: randInt(rng, 1, 6) }, () => [randInt(rng, 1, 8), randInt(rng, 1, 20)] as [number, number])
      const W = randInt(rng, 1, 20)
      expect(refKnapsack(items, W)).toBe(knapsack01(items.map(([w, v], i) => ({ name: 'i' + i, w, v })), W).value)
      const acts = Array.from({ length: randInt(rng, 1, 9) }, () => {
        const s = randInt(rng, 0, 15)
        return [s, s + randInt(rng, 1, 6)] as [number, number]
      })
      expect(refActivities(acts)).toBe(activityTrace(acts.map(([s, f], i) => ({ name: 'a' + i, s, f }))).chosen.length)
      const freqs = Array.from({ length: randInt(rng, 2, 8) }, () => randInt(rng, 1, 40))
      const total = freqs.reduce((a, b) => a + b, 0)
      expect(refHuffmanCost(freqs)).toBeCloseTo(huffmanTrace(freqs.map((f, i) => ['c' + i, f] as [string, number])).cost * total, 6)
    }
  })

  it('MST weight, max flow and Gale–Shapley', () => {
    for (let round = 0; round < 80; round++) {
      const n = randInt(rng, 2, 7)
      const und = randEdges(rng, n, randInt(rng, n - 1, 2 * n), false, 1, 15, true)
      expect(refMstWeight(n, und)).toBe(mstBrute(toGraph(n, und, false)))
      const dir = randEdges(rng, n, randInt(rng, n - 1, 3 * n), true, 1, 12)
      expect(refMaxFlow(n, dir, 0, n - 1)).toBe(minCutBrute(toGraph(n, dir, true), 'v0', 'v' + (n - 1)))
      const m = randInt(rng, 1, 5)
      const ix = Array.from({ length: m }, (_, i) => i)
      const shuffle = () => [...ix].sort(() => rng() - 0.5)
      const dPref = ix.map(shuffle)
      const hPref = ix.map(shuffle)
      const p = {
        doctors: ix.map((i) => 'd' + i),
        hospitals: ix.map((i) => 'h' + i),
        dPref: Object.fromEntries(ix.map((d) => ['d' + d, dPref[d].map((h) => 'h' + h)])),
        hPref: Object.fromEntries(ix.map((h) => ['h' + h, hPref[h].map((d) => 'd' + d)])),
      }
      const match = refGaleShapley(dPref, hPref)
      const asRecord = Object.fromEntries(match.map((h, d) => ['h' + h, 'd' + d]))
      expect(asRecord).toEqual(galeShapleyTrace(p).match)
      expect(allStableMatchings(p)).toContainEqual(asRecord)
    }
  })
})

describe('later coding exercise tests are meaningful', () => {
  const byId = (id: string) => LATER_EXERCISES.find((e) => e.id === id)!.tests().map((t) => t.expected)
  it('cover both outcomes where the answer is yes/no or may be missing', () => {
    expect(new Set(byId('two-sum'))).toEqual(new Set([true, false]))
    expect(new Set(byId('has-cycle'))).toEqual(new Set([true, false]))
    const bf = byId('bellman-ford')
    expect(bf.some((x) => x === null)).toBe(true)
    expect(bf.some((x) => Array.isArray(x) && x.some((d) => d !== null && (d as number) < 0))).toBe(true)
    expect(byId('dijkstra').some((x) => (x as unknown[]).includes(null))).toBe(true)
    expect(byId('bfs').some((x) => (x as number[]).includes(-1))).toBe(true)
  })
  it('a quadratic two-sum would be far too slow on the big test', () => {
    const big = LATER_EXERCISES.find((e) => e.id === 'two-sum')!.tests().at(-1)!
    expect((big.args[0] as number[]).length).toBe(200_000)
  })
})
