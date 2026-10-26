import { describe, expect, it } from 'vitest'
import { makeRng, randInt } from './random'
import * as G from './graph'
import type { Graph } from './graph'
import { applyHash, birthdayThreshold, buildTable, expectedCollidingPairs, familyCollisionProbability, hashTrace, makeHash, noCollisionBound, noCollisionProbability } from './hashing'
import { bfsDistances, bfsTrace, componentCount, dfsTimes, dfsTrace, topoOrder } from './graphSearch'
import { sccByReachability, sccTrace } from './scc'
import { bellmanFordTrace, dijkstraTrace, floydTrace } from './shortestPaths'
import { NOTES_ITEMS, knapsack01, knapsack01Trace, knapsackUnbounded, knapsackUnboundedTrace, lcs, lcsTable, lcsTrace, MWIS_EXAMPLE, mwisBrute, mwisTrace, type WTree } from './dp'
import { ACTIVITIES, activityTrace, HUFFMAN_EXAMPLE, huffmanTrace, maxActivitiesBrute, ratioOrder, weightedCompletion, type Activity, type Job } from './greedy'
import { kruskalTrace, mstBrute, primTrace } from './mst'
import { fordFulkersonTrace, minCutBrute } from './maxFlow'
import { allStableMatchings, blockingPairs, galeShapleyTrace, MATCHING_AGREE, MATCHING_CASCADE, MATCHING_EXAMPLE, type Prefs } from './stableMatching'

/** Random graph with nodes a, b, c, … (positions irrelevant). */
function randomGraph(seed: number, n: number, m: number, directed: boolean, wLo = 1, wHi = 9): Graph {
  const rng = makeRng(seed)
  const names = 'abcdefghij'.slice(0, n).split('')
  const seen = new Set<string>()
  const edges: G.GEdge[] = []
  for (let tries = 0; edges.length < m && tries < 500; tries++) {
    const u = names[randInt(rng, 0, n - 1)]
    const v = names[randInt(rng, 0, n - 1)]
    if (u === v) continue
    const key = directed ? u + v : [u, v].sort().join('')
    if (seen.has(key) || (directed && seen.has(v + u))) continue
    seen.add(key)
    edges.push({ u, v, w: randInt(rng, wLo, wHi) })
  }
  return { directed, nodes: names.map((id) => ({ id, x: 0, y: 0 })), edges }
}

describe('Lecture 8: hashing', () => {
  it('reproduces the notes’ example h(x) = 13x + 2 mod 5', () => {
    const h = makeHash('notes', 5)
    expect(buildTable([1, 2, 4, 7, 8], h)).toEqual([[1], [8], [], [2, 7], [4]])
    expect(applyHash(h, 1)).toBe(0)
  })
  it('the family h_{a,b} is universal: every pair collides with probability ≤ 1/n', () => {
    for (const [x1, x2, n] of [
      [3, 8, 5],
      [0, 100, 10],
      [17, 42, 7],
      [5, 10, 5],
    ])
      expect(familyCollisionProbability(x1, x2, 101, n)).toBeLessThanOrEqual(1 / n + 1e-12)
  })
  it('the trace ends with the same table and counts chain comparisons', () => {
    const h = makeHash('mod', 5)
    const { trace, buckets } = hashTrace([5, 10, 15, 3], [20, 15], h)
    expect(buckets).toEqual([[5, 10, 15], [], [], [3], []])
    expect(trace.at(-1)!.state.buckets).toEqual(buckets)
    // inserts: 0+1+2+0 comparisons, lookups 20: 3, 15: 3 → 9
    expect(trace.at(-1)!.counters![Object.keys(trace.at(-1)!.counters!)[0]]).toBe(9)
    for (const s of trace) if (s.predict) expect(s.predict.options[s.predict.answer]).toBe(String(s.state.bucket))
  })
  it('birthday numbers', () => {
    expect(birthdayThreshold(365)).toBe(23)
    expect(noCollisionProbability(23, 365)).toBeLessThan(0.5)
    expect(noCollisionProbability(23, 365)).toBeLessThanOrEqual(noCollisionBound(23, 365))
    expect(expectedCollidingPairs(23, 365)).toBeCloseTo(253 / 365)
  })
})

describe('Lecture 9: DFS and BFS', () => {
  it('DFS timestamps match the notes’ example', () => {
    const { d, f } = dfsTimes(G.DFS_EXAMPLE)
    expect([d.a, f.a, d.b, f.b, d.c, f.c, d.d, f.d, d.e, f.e, d.f, f.f]).toEqual([1, 8, 2, 7, 3, 6, 4, 5, 9, 12, 10, 11])
  })
  it('BFS layers are exactly the distance classes (Proposition 1)', () => {
    for (let seed = 1; seed <= 40; seed++) {
      const g = randomGraph(seed, 8, 11, seed % 2 === 0)
      const last = bfsTrace(g, 'a').at(-1)!.state
      const dist = bfsDistances(g, 'a')
      // Reference: Bellman–Ford with unit weights.
      const unit = { ...g, edges: g.edges.map((e) => ({ ...e, w: 1 })) }
      const bf = bellmanFordTrace(unit, 'a').d
      for (const v of G.ids(g)) {
        expect(last.layer[v]).toBe(dist[v])
        expect(dist[v] ?? Infinity).toBe(bf[v])
      }
    }
  })
  it('components and topological order', () => {
    expect(componentCount(G.COMPONENTS_EXAMPLE)).toBe(3)
    const order = topoOrder(G.DAG_EXAMPLE)
    for (const e of G.DAG_EXAMPLE.edges) expect(order.indexOf(e.u)).toBeLessThan(order.indexOf(e.v))
    expect(dfsTrace(G.BFS_EXAMPLE).length).toBeGreaterThan(10)
  })
})

describe('Lecture 10: strongly connected components', () => {
  it('two-pass DFS agrees with mutual reachability on the example and on random graphs', () => {
    const groups = (leader: Record<string, string>) => {
      const m = new Map<string, string[]>()
      for (const [v, l] of Object.entries(leader)) m.set(l, [...(m.get(l) ?? []), v].sort())
      return [...m.values()].map((c) => c.join('')).sort()
    }
    const ref = (g: Graph) => sccByReachability(g).map((c) => [...c].sort().join('')).sort()
    expect(groups(sccTrace(G.SCC_EXAMPLE).leader)).toEqual(['abc', 'de', 'fgh', 'i'])
    for (let seed = 1; seed <= 60; seed++) {
      const g = randomGraph(seed, 8, 12, true)
      expect(groups(sccTrace(g).leader)).toEqual(ref(g))
    }
  })
})

describe('Lectures 11–12: shortest paths', () => {
  it('Dijkstra = Bellman–Ford = Floyd–Warshall on random non-negative graphs', () => {
    for (let seed = 1; seed <= 60; seed++) {
      const g = randomGraph(seed, 7, 13, true, 0, 9)
      const dj = dijkstraTrace(g, 'a').d
      const bf = bellmanFordTrace(g, 'a')
      const fw = floydTrace(g).matrix
      expect(bf.negativeCycle).toBe(false)
      G.ids(g).forEach((v, j) => {
        expect(dj[v]).toBe(bf.d[v])
        expect(fw[0][j]).toBe(bf.d[v])
      })
    }
  })
  it('example values; Dijkstra goes wrong with a negative edge; negative cycles are detected', () => {
    expect(dijkstraTrace(G.DIJKSTRA_EXAMPLE, 's').d).toEqual({ s: 0, a: 3, b: 1, c: 8, d: 9, t: 10 })
    expect(dijkstraTrace(G.NEGATIVE_EDGE_EXAMPLE, 's').d.t).toBe(3)
    expect(bellmanFordTrace(G.NEGATIVE_EDGE_EXAMPLE, 's').d.t).toBe(2)
    expect(bellmanFordTrace(G.NEGATIVE_CYCLE_EXAMPLE, 's').negativeCycle).toBe(true)
    const fw = floydTrace(G.FLOYD_EXAMPLE).matrix
    expect(fw).toEqual([
      [0, 3, 5, 6],
      [8, 0, 2, 3],
      [6, 0, 0, 1],
      [5, -1, 1, 0],
    ])
    expect(floydTrace(G.NEGATIVE_CYCLE_EXAMPLE).matrix.some((r, i) => r[i] < 0)).toBe(true)
  })
  it('Bellman–Ford rows: d(k) is the best path with at most k edges', () => {
    const rows = bellmanFordTrace(G.DIJKSTRA_EXAMPLE, 's').trace.at(-1)!.state.rows
    expect(rows[1]).toMatchObject({ a: 4, b: 1, t: Infinity })
    expect(rows[2]).toMatchObject({ a: 3, d: 9 })
  })
})

describe('Lecture 13: dynamic programming', () => {
  it('LCS: notes’ examples, traceback and brute-force check', () => {
    expect(lcs('abracadabra', 'bxqrabry')).toBe('brabr')
    expect(lcsTable('abracadabra', 'bxqrabry')[11][8]).toBe(5)
    const t = lcsTrace('ABCBDAB', 'BDCABA')
    expect(t.at(-1)!.state.result!.length).toBe(4)
    const isSub = (z: string, x: string) => {
      let i = 0
      for (const c of x) if (c === z[i]) i++
      return i === z.length
    }
    const rng = makeRng(3)
    for (let k = 0; k < 50; k++) {
      const rs = (n: number) => Array.from({ length: n }, () => 'ab c'[randInt(rng, 0, 3)].trim() || 'd').join('')
      const x = rs(6)
      const y = rs(5)
      const z = lcs(x, y)
      expect(isSub(z, x) && isSub(z, y)).toBe(true)
      // brute force: longest subsequence of y that is a subsequence of x
      let best = 0
      for (let mask = 0; mask < 1 << y.length; mask++) {
        const sub = [...y].filter((_, i) => mask & (1 << i)).join('')
        if (isSub(sub, x)) best = Math.max(best, sub.length)
      }
      expect(z.length).toBe(best)
    }
  })
  it('knapsack: the notes’ numbers (0/1 → 40 with A, C; unbounded → 42)', () => {
    expect(knapsack01(NOTES_ITEMS, 10)).toMatchObject({ value: 40, take: ['A', 'C'] })
    expect(knapsackUnbounded(NOTES_ITEMS, 10).value).toBe(42)
    expect(knapsack01Trace(NOTES_ITEMS, 10).at(-1)!.state.result).toBe('A, C')
    expect(knapsackUnboundedTrace(NOTES_ITEMS, 10).at(-1)!.state.table[0][10]).toBe(42)
  })
  it('max-weight independent set in a tree equals brute force', () => {
    const r = mwisTrace(MWIS_EXAMPLE)
    expect(r.best).toBe(mwisBrute(MWIS_EXAMPLE))
    expect(r.chosen.reduce((s, v) => s + MWIS_EXAMPLE.weight[v], 0)).toBe(r.best)
    const rng = makeRng(9)
    for (let k = 0; k < 40; k++) {
      const names = 'abcdefghij'.split('')
      const t: WTree = { root: 'a', children: Object.fromEntries(names.map((v) => [v, [] as string[]])), weight: Object.fromEntries(names.map((v) => [v, randInt(rng, 1, 9)])) }
      for (let i = 1; i < names.length; i++) t.children[names[randInt(rng, 0, i - 1)]].push(names[i])
      expect(mwisTrace(t).best).toBe(mwisBrute(t))
    }
  })
})

describe('Lecture 14: greedy', () => {
  it('activity selection is optimal', () => {
    expect(activityTrace(ACTIVITIES).chosen.length).toBe(maxActivitiesBrute(ACTIVITIES))
    const rng = makeRng(5)
    for (let k = 0; k < 60; k++) {
      const acts: Activity[] = Array.from({ length: 9 }, (_, i) => {
        const s = randInt(rng, 0, 12)
        return { name: String(i), s, f: s + randInt(rng, 1, 5) }
      })
      expect(activityTrace(acts).chosen.length).toBe(maxActivitiesBrute(acts))
    }
  })
  it('scheduling by l/w is optimal (all permutations of 5 jobs)', () => {
    const rng = makeRng(11)
    for (let k = 0; k < 30; k++) {
      const jobs: Job[] = Array.from({ length: 5 }, (_, i) => ({ name: String(i), l: randInt(rng, 1, 6), w: randInt(rng, 1, 6) }))
      let best = Infinity
      const perm = (rest: Job[], acc: Job[]) => {
        if (!rest.length) best = Math.min(best, weightedCompletion(acc))
        rest.forEach((j, i) => perm([...rest.slice(0, i), ...rest.slice(i + 1)], [...acc, j]))
      }
      perm(jobs, [])
      expect(weightedCompletion(ratioOrder(jobs))).toBe(best)
    }
    expect(weightedCompletion([{ name: '1', l: 1, w: 1 }, { name: '2', l: 2, w: 1 }, { name: '3', l: 3, w: 1 }])).toBe(10)
  })
  it('Huffman: the notes’ frequencies cost 2.24 bits per character and the code is prefix-free', () => {
    const r = huffmanTrace(HUFFMAN_EXAMPLE)
    expect(r.cost).toBeCloseTo(2.24)
    const codes = Object.values(r.codes)
    for (const a of codes) for (const b of codes) if (a !== b) expect(b.startsWith(a)).toBe(false)
    expect(r.codes.a.length).toBe(1)
    expect(r.codes.e.length).toBe(4)
  })
})

describe('Lecture 15: minimum spanning trees', () => {
  it('Prim and Kruskal give weight 37 on the notes’ graph and match brute force on small graphs', () => {
    expect(primTrace(G.MST_EXAMPLE, 'a').weight).toBe(37)
    expect(kruskalTrace(G.MST_EXAMPLE).weight).toBe(37)
    expect(primTrace(G.MST_SMALL, 'a').weight).toBe(mstBrute(G.MST_SMALL))
    for (let seed = 1; seed <= 25; seed++) {
      const g = randomGraph(seed, 6, 10, false)
      if (componentCount(g) !== 1) continue
      const best = mstBrute(g)
      expect(primTrace(g, 'a').weight).toBe(best)
      expect(kruskalTrace(g).weight).toBe(best)
    }
  })
  it('Kruskal follows the notes’ order on the example', () => {
    const r = kruskalTrace(G.MST_EXAMPLE)
    const names = r.tree.map((i) => G.MST_EXAMPLE.edges[i].u + G.MST_EXAMPLE.edges[i].v)
    expect(names).toEqual(['gh', 'ci', 'fg', 'ab', 'cf', 'cd', 'ah', 'de'])
  })
})

describe('Lecture 16: max flow', () => {
  it('max flow = min cut (examples and random networks), with both path rules', () => {
    expect(fordFulkersonTrace(G.FLOW_EXAMPLE, 's', 't').value).toBe(23)
    expect(fordFulkersonTrace(G.MATCHING_FLOW, 's', 't').value).toBe(3)
    for (let seed = 1; seed <= 40; seed++) {
      const g0 = randomGraph(seed, 6, 11, true, 1, 9)
      const g = { ...g0, nodes: g0.nodes.map((n, i) => ({ ...n, id: i === 0 ? 's' : i === 5 ? 't' : n.id })), edges: g0.edges.map((e) => ({ ...e, u: e.u === 'a' ? 's' : e.u === 'f' ? 't' : e.u, v: e.v === 'a' ? 's' : e.v === 'f' ? 't' : e.v })) }
      const cut = minCutBrute(g, 's', 't')
      for (const rule of ['bfs', 'dfs'] as const) {
        const r = fordFulkersonTrace(g, 's', 't', rule)
        expect(r.value).toBe(cut)
        // capacity and conservation constraints
        g.edges.forEach((e, i) => {
          expect(r.flow[i]).toBeGreaterThanOrEqual(0)
          expect(r.flow[i]).toBeLessThanOrEqual(e.w!)
        })
        for (const v of G.ids(g)) {
          if (v === 's' || v === 't') continue
          const inflow = g.edges.reduce((s2, e, i) => s2 + (e.v === v ? r.flow[i] : 0), 0)
          const outflow = g.edges.reduce((s2, e, i) => s2 + (e.u === v ? r.flow[i] : 0), 0)
          expect(inflow).toBe(outflow)
        }
      }
    }
  })
})

describe('Lecture 17: stable matching', () => {
  it('the notes’ example gives the doctor-optimal stable matching', () => {
    const r = galeShapleyTrace(MATCHING_EXAMPLE)
    expect(r.match).toEqual({ X: 'Can', Y: 'Ada', Z: 'Bora' })
    expect(blockingPairs(MATCHING_EXAMPLE, r.match)).toEqual([])
    expect(blockingPairs(MATCHING_EXAMPLE, { X: 'Bora', Y: 'Can', Z: 'Ada' })).toContainEqual(['Ada', 'X'])
    expect(allStableMatchings(MATCHING_EXAMPLE)).toHaveLength(2)
  })
  it('the result is stable and doctor-optimal on random instances', () => {
    const rng = makeRng(21)
    const shuffle = <T,>(a: T[]) => {
      const b = [...a]
      for (let i = b.length - 1; i > 0; i--) {
        const j = randInt(rng, 0, i)
        ;[b[i], b[j]] = [b[j], b[i]]
      }
      return b
    }
    for (const fixed of [MATCHING_AGREE, MATCHING_CASCADE]) expect(blockingPairs(fixed, galeShapleyTrace(fixed).match)).toEqual([])
    for (let k = 0; k < 40; k++) {
      const D = ['d1', 'd2', 'd3', 'd4']
      const H = ['h1', 'h2', 'h3', 'h4']
      const p: Prefs = { doctors: D, hospitals: H, dPref: Object.fromEntries(D.map((d) => [d, shuffle(H)])), hPref: Object.fromEntries(H.map((h) => [h, shuffle(D)])) }
      const m = galeShapleyTrace(p).match
      expect(blockingPairs(p, m)).toEqual([])
      const hospOf = (mm: Record<string, string>, d: string) => Object.keys(mm).find((h) => mm[h] === d)!
      for (const other of allStableMatchings(p))
        for (const d of D) expect(p.dPref[d].indexOf(hospOf(m, d))).toBeLessThanOrEqual(p.dPref[d].indexOf(hospOf(other, d)))
    }
  })
})
