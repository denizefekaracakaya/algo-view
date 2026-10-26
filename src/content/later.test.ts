import { describe, expect, it } from 'vitest'
import * as G from '../engines/graph'
import { applyHash, birthdayThreshold, expectedCollidingPairs, familyCollisionProbability, makeHash } from '../engines/hashing'
import { bfsDistances, dfsTimes, topoOrder } from '../engines/graphSearch'
import { sccTrace } from '../engines/scc'
import { bellmanFordTrace, dijkstraTrace, floydTrace } from '../engines/shortestPaths'
import { MWIS_EXAMPLE, NOTES_ITEMS, knapsack01, knapsackUnbounded, lcs, lcsTable, mwisTrace } from '../engines/dp'
import { ACTIVITIES, HUFFMAN_EXAMPLE, activityTrace, huffmanTrace, weightedCompletion } from '../engines/greedy'
import { kruskalTrace, primTrace } from '../engines/mst'
import { fordFulkersonTrace } from '../engines/maxFlow'
import { MATCHING_AGREE, MATCHING_EXAMPLE, allStableMatchings, blockingPairs, galeShapleyTrace } from '../engines/stableMatching'
import { sccByReachability } from '../engines/scc'
import { bstFromSequence } from '../engines/bst'
import { height, type TNode } from '../engines/tree'
import { maxActivitiesBrute } from '../engines/greedy'
import { minCutBrute } from '../engines/maxFlow'

/** Numbers quoted in the content of Lectures 8–17 (checks, quiz answers, practice solutions). */

const g = (directed: boolean, edges: [string, string, number][]): G.Graph => {
  const names = [...new Set(edges.flatMap(([u, v]) => [u, v]))]
  return { directed, nodes: names.map((id) => ({ id, x: 0, y: 0 })), edges: edges.map(([u, v, w]) => ({ u, v, w })) }
}

const leaders = (leader: Record<string, string>) => new Set(Object.values(leader)).size

/** Number of bits that change when a binary counter goes from 0 to `n`. */
function counterFlips(n: number): number {
  let total = 0
  for (let i = 0; i < n; i++) {
    let x = i ^ (i + 1)
    while (x) {
      total += x & 1
      x >>= 1
    }
  }
  return total
}

describe('numeric claims in Lectures 8–17', () => {
  it('Lecture 8: hashing', () => {
    expect(applyHash(makeHash('notes', 5), 7)).toBe(3)
    expect(birthdayThreshold(365)).toBe(23)
    expect(expectedCollidingPairs(10, 100)).toBeCloseTo(0.45)
    const h = (a: number, b: number, x: number) => ((a * x + b) % 7) % 3
    expect(h(1, 0, 1)).toBe(h(1, 0, 4))
    expect(h(2, 1, 1)).not.toBe(h(2, 1, 4))
    expect(familyCollisionProbability(1, 4, 7, 3)).toBeLessThanOrEqual(1 / 3)
  })

  it('Lecture 9: BFS and DFS', () => {
    expect(bfsDistances(G.BFS_EXAMPLE, 's').g).toBe(3)
    const p = g(false, [
      ['1', '2', 1],
      ['1', '3', 1],
      ['2', '4', 1],
      ['3', '4', 1],
      ['4', '5', 1],
      ['5', '6', 1],
      ['5', '7', 1],
      ['6', '8', 1],
      ['7', '8', 1],
    ])
    expect(bfsDistances(p, '1')['8']).toBe(5)
    expect(dfsTimes(G.DFS_EXAMPLE).f.a).toBe(8)
    expect(dfsTimes(G.DFS_EXAMPLE).d.e).toBe(9)
    expect(topoOrder(G.DAG_EXAMPLE)).toEqual(['a', 'c', 'e', 'b', 'd', 'f'])
    const t = dfsTimes(G.DAG_EXAMPLE).f
    expect([t.f, t.d, t.b, t.e, t.c, t.a]).toEqual([5, 6, 7, 10, 11, 12])
  })

  it('Lecture 10: SCCs', () => {
    expect(leaders(sccTrace(G.SCC_EXAMPLE).leader)).toBe(4)
    const withHA = { ...G.SCC_EXAMPLE, edges: [...G.SCC_EXAMPLE.edges, { u: 'h', v: 'a' }] }
    expect(leaders(sccTrace(withHA).leader)).toBe(2)
    const p = g(true, [
      ['1', '2', 1],
      ['2', '3', 1],
      ['3', '1', 1],
      ['3', '4', 1],
      ['4', '5', 1],
      ['5', '6', 1],
      ['6', '4', 1],
      ['6', '7', 1],
    ])
    const r = sccTrace(p, ['1', '2', '3', '4', '5', '6', '7'])
    expect(r.trace.at(-1)!.state.f).toEqual({ '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7 })
    expect(leaders(r.leader)).toBe(3)
  })

  it('Lectures 11–12: shortest paths', () => {
    expect(dijkstraTrace(G.DIJKSTRA_EXAMPLE, 's').d.t).toBe(10)
    expect(bellmanFordTrace(G.NEGATIVE_EDGE_EXAMPLE, 's').d.t).toBe(2)
    const p = g(true, [
      ['s', 'a', 7],
      ['s', 'b', 2],
      ['b', 'a', 3],
      ['a', 'c', 1],
      ['b', 'c', 8],
      ['c', 't', 2],
      ['b', 't', 9],
    ])
    expect(dijkstraTrace(p, 's').d).toEqual({ s: 0, a: 5, b: 2, c: 6, t: 8 })
    expect(counterFlips(16)).toBe(31)
    expect(counterFlips(1000)).toBe(1994)
    const rows = bellmanFordTrace(G.DIJKSTRA_EXAMPLE, 's').trace.at(-1)!.state.rows
    expect([rows[1].a, rows[2].a]).toEqual([4, 3])
    const q = g(true, [
      ['s', 'a', 4],
      ['s', 'b', 3],
      ['a', 'b', -2],
      ['b', 'c', 2],
      ['a', 'c', 5],
    ])
    const qr = bellmanFordTrace(q, 's').trace.at(-1)!.state.rows
    expect(qr.map((r) => [r.s, r.a, r.b, r.c])).toEqual([
      [0, Infinity, Infinity, Infinity],
      [0, 4, 3, Infinity],
      [0, 4, 2, 5],
      [0, 4, 2, 4],
    ])
    expect(dijkstraTrace(q, 's').d.c).toBe(5)
    const fw = floydTrace(G.FLOYD_EXAMPLE).matrix
    expect([fw[0][2], fw[2][1]]).toEqual([5, 0])
    const r3 = g(true, [
      ['1', '2', 4],
      ['2', '3', -1],
      ['1', '3', 5],
      ['3', '1', 2],
    ])
    expect(floydTrace(r3).matrix).toEqual([
      [0, 4, 3],
      [1, 0, -1],
      [2, 6, 0],
    ])
  })

  it('Lecture 13: LCS, knapsack, independent set', () => {
    expect(lcsTable('ABCBDAB', 'BDCABA')[7][6]).toBe(4)
    expect(lcs('KARTAL', 'KATAR')).toBe('KATA')
    expect(lcs('algoritma', 'logaritma').length).toBe(7)
    expect(lcs('algorithm', 'logarithm').length).toBe(7)
    expect(knapsack01(NOTES_ITEMS, 10).value).toBe(40)
    expect(knapsackUnbounded(NOTES_ITEMS, 10).value).toBe(42)
    const trap = [
      { name: 'P', w: 5, v: 10 },
      { name: 'Q', w: 4, v: 7 },
      { name: 'R', w: 4, v: 7 },
    ]
    expect(knapsack01(trap, 8).value).toBe(14)
    const own = [
      { name: 'X', w: 3, v: 9 },
      { name: 'Y', w: 4, v: 11 },
      { name: 'Z', w: 2, v: 5 },
    ]
    expect(knapsack01(own, 7).value).toBe(20)
    expect(knapsackUnbounded(own, 7).K).toEqual([0, 0, 5, 9, 11, 14, 18, 20])
    expect(mwisTrace(MWIS_EXAMPLE).best).toBe(25)
    expect(mwisTrace(MWIS_EXAMPLE).chosen.sort()).toEqual(['a', 'e', 'g', 'h', 'i'])
  })

  it('Lecture 14: greedy', () => {
    expect(activityTrace(ACTIVITIES).chosen).toEqual(['a', 'd', 'h', 'k'])
    expect(huffmanTrace(HUFFMAN_EXAMPLE).cost).toBeCloseTo(2.24)
    expect(huffmanTrace([['a', 50], ['b', 25], ['c', 25]]).cost).toBeCloseTo(1.5)
    expect(huffmanTrace([['A', 5], ['B', 2], ['R', 2], ['C', 1], ['D', 1]]).cost * 11).toBeCloseTo(23)
    expect(weightedCompletion([{ name: 'B', l: 1, w: 2 }, { name: 'A', l: 3, w: 1 }])).toBe(6)
    expect(weightedCompletion([{ name: 'Q', l: 1, w: 1 }, { name: 'R', l: 3, w: 3 }, { name: 'P', l: 4, w: 2 }, { name: 'S', l: 2, w: 1 }])).toBe(39)
  })

  it('Lecture 15: MST', () => {
    expect(kruskalTrace(G.MST_EXAMPLE).weight).toBe(37)
    expect(primTrace(G.MST_SMALL, 'a').weight).toBe(9)
    expect(kruskalTrace(G.MST_SMALL).weight).toBe(9)
  })

  it('Lecture 16: max flow', () => {
    const r = fordFulkersonTrace(G.FLOW_EXAMPLE, 's', 't')
    expect(r.value).toBe(23)
    expect(r.cut).toEqual(['s', 'a', 'b', 'd'])
    expect(fordFulkersonTrace(G.FLOW_ZIGZAG, 's', 't').value).toBe(200)
    const own = g(true, [
      ['s', 'a', 3],
      ['s', 'b', 2],
      ['a', 'b', 1],
      ['a', 't', 2],
      ['b', 't', 3],
    ])
    expect(fordFulkersonTrace(own, 's', 't').value).toBe(5)
  })

  it('Lecture 17: stable matching', () => {
    const r = galeShapleyTrace(MATCHING_EXAMPLE)
    expect(r.match).toEqual({ X: 'Can', Y: 'Ada', Z: 'Bora' })
    const last = r.trace.at(-1)!.counters!
    expect(Object.values(last)[0]).toBe(5)
    expect(blockingPairs(MATCHING_EXAMPLE, { X: 'Bora', Y: 'Can', Z: 'Ada' })).toContainEqual(['Ada', 'X'])
    expect(allStableMatchings(MATCHING_EXAMPLE)).toHaveLength(2)
    const p = {
      doctors: ['D1', 'D2', 'D3'],
      hospitals: ['A', 'B', 'C'],
      dPref: { D1: ['A', 'B', 'C'], D2: ['A', 'C', 'B'], D3: ['B', 'A', 'C'] },
      hPref: { A: ['D2', 'D3', 'D1'], B: ['D1', 'D2', 'D3'], C: ['D3', 'D1', 'D2'] },
    }
    const q = galeShapleyTrace(p)
    expect(q.match).toEqual({ A: 'D2', B: 'D1', C: 'D3' })
    expect(Object.values(q.trace.at(-1)!.counters!)[0]).toBe(6)
    expect(blockingPairs(p, q.match)).toEqual([])
  })
})

describe('worked examples and practice problems added to Lectures 7–17', () => {
  const perms = <T,>(a: T[]): T[][] => (a.length <= 1 ? [a] : a.flatMap((x, i) => perms([...a.slice(0, i), ...a.slice(i + 1)]).map((p) => [x, ...p])))
  const nodes = (...names: string[]) => names.map((id) => ({ id, x: 0, y: 0 }))

  it('Lecture 7: insertion order and BST shape', () => {
    const depthSum = (t: TNode | null, d = 0): number => (t ? d + depthSum(t.left, d + 1) + depthSum(t.right, d + 1) : 0)
    const chain = bstFromSequence([1, 2, 3, 4, 5, 6, 7])
    expect(height(chain)).toBe(6)
    expect(depthSum(chain)).toBe(21)
    const balanced = bstFromSequence([4, 2, 6, 1, 3, 5, 7])
    expect(height(balanced)).toBe(2)
    expect(depthSum(balanced)).toBe(10)
    const shape = (t: TNode | null): string => (t ? `(${shape(t.left)}${t.key}${shape(t.right)})` : '')
    const trees = perms([1, 2, 3]).map((p) => bstFromSequence(p))
    expect(new Set(trees.map(shape)).size).toBe(5)
    expect(trees.filter((t) => height(t) === 1)).toHaveLength(2)
  })

  it('Lecture 8: table growth', () => {
    const moves = (start: number, m: number, grow: (n: number) => number) => {
      let size = start
      let total = 0
      for (let count = 0; count < m; count++) {
        if (count === size) {
          total += count
          size = grow(size)
        }
      }
      return total
    }
    expect(moves(1, 16, (n) => 2 * n)).toBe(15)
    expect(moves(100, 1000, (n) => n + 100)).toBe(4500)
    expect(moves(100, 1000, (n) => 2 * n)).toBe(1500)
    expect(moves(100, 10000, (n) => n + 100)).toBe(495000)
    expect(moves(100, 10000, (n) => 2 * n)).toBe(12700)
  })

  it('Lecture 9: bipartiteness, topological orders, back edges', () => {
    const cycle = (k: number) => g(false, Array.from({ length: k }, (_, i): [string, string, number] => [`v${i}`, `v${(i + 1) % k}`, 1]))
    const bipartite = (gr: G.Graph) => {
      const d = bfsDistances(gr, gr.nodes[0].id)
      return gr.edges.every((e) => (d[e.u]! - d[e.v]!) % 2 !== 0)
    }
    expect(bipartite(cycle(6))).toBe(true)
    expect(bipartite(cycle(5))).toBe(false)
    expect(bipartite(cycle(3))).toBe(false)
    const k4 = g(false, [['a', 'b', 1], ['a', 'c', 1], ['a', 'd', 1], ['b', 'c', 1], ['b', 'd', 1], ['c', 'd', 1]])
    expect(bipartite(k4)).toBe(false)

    const dag: G.Graph = { ...g(true, [['a', 'c', 1], ['b', 'c', 1], ['c', 'd', 1], ['c', 'e', 1]]), nodes: nodes('a', 'b', 'c', 'd', 'e') }
    expect(dfsTimes(dag)).toEqual({ d: { a: 1, c: 2, d: 3, e: 5, b: 9 }, f: { d: 4, e: 6, c: 7, a: 8, b: 10 } })
    expect(topoOrder(dag)).toEqual(['b', 'a', 'c', 'e', 'd'])
    const valid = (o: string[]) => dag.edges.every((e) => o.indexOf(e.u) < o.indexOf(e.v))
    expect(perms(['a', 'b', 'c', 'd', 'e']).filter(valid)).toHaveLength(4)

    const cyc: G.Graph = { ...g(true, [['a', 'b', 1], ['b', 'c', 1], ['c', 'd', 1], ['d', 'b', 1], ['a', 'e', 1]]), nodes: nodes('a', 'b', 'c', 'd', 'e') }
    expect(dfsTimes(cyc)).toEqual({ d: { a: 1, b: 2, c: 3, d: 4, e: 8 }, f: { d: 5, c: 6, b: 7, e: 9, a: 10 } })
  })

  it('Lecture 10: condensation', () => {
    const base: [string, string, number][] = [['a', 'b', 1], ['b', 'c', 1], ['c', 'a', 1], ['c', 'd', 1], ['d', 'e', 1], ['e', 'd', 1], ['e', 'f', 1]]
    const count = (extra: [string, string, number][]) => sccByReachability(g(true, [...base, ...extra])).length
    expect(count([])).toBe(3)
    expect(count([['f', 'd', 1]])).toBe(2)
    expect(count([['e', 'a', 1]])).toBe(2)
    // exactly the edges f→a, f→b, f→c make the graph strongly connected
    const names = ['a', 'b', 'c', 'd', 'e', 'f']
    const winners = names.flatMap((u) => names.filter((v) => v !== u && count([[u, v, 1]]) === 1).map((v) => u + v))
    expect(winners).toEqual(['fa', 'fb', 'fc'])
  })

  it('Lectures 11–12: parents, edge order, negative cycles, closure', () => {
    const dg = g(true, [['s', 'a', 4], ['s', 'b', 1], ['b', 'a', 2], ['a', 'c', 1], ['b', 'c', 5]])
    expect(dijkstraTrace(dg, 's').d).toEqual({ s: 0, a: 3, b: 1, c: 4 })
    const dg2 = g(true, [['s', 'a', 4], ['s', 'b', 1], ['b', 'a', 4], ['a', 'c', 1], ['b', 'c', 5]])
    expect(dijkstraTrace(dg2, 's').d).toEqual({ s: 0, a: 4, b: 1, c: 5 })

    // Bellman–Ford on a path with the edges in a given order (an update is used later in the same round)
    const run = (edges: [string, string, number][]) => {
      const d: Record<string, number> = { s: 0, a: Infinity, b: Infinity, c: Infinity, d: Infinity }
      const correctAfter: Record<string, number> = {}
      for (let round = 1; round <= 10; round++) {
        let changed = false
        for (const [u, v, w] of edges) {
          if (d[u] + w < d[v]) {
            d[v] = d[u] + w
            changed = true
          }
        }
        for (const [k, want] of Object.entries({ a: 1, b: 2, c: 3, d: 4 })) if (d[k] === want && !(k in correctAfter)) correctAfter[k] = round
        if (!changed) return { rounds: round, correctAfter }
      }
      throw new Error('no convergence')
    }
    const path: [string, string, number][] = [['s', 'a', 1], ['a', 'b', 1], ['b', 'c', 1], ['c', 'd', 1]]
    expect(run(path)).toEqual({ rounds: 2, correctAfter: { a: 1, b: 1, c: 1, d: 1 } })
    expect(run([...path].reverse())).toEqual({ rounds: 5, correctAfter: { a: 1, b: 2, c: 3, d: 4 } })

    expect(bellmanFordTrace(g(true, [['s', 'a', 2], ['a', 'b', 1], ['b', 'a', -3]]), 's').negativeCycle).toBe(true)

    const m = floydTrace(g(true, [['a', 'b', 1], ['b', 'a', -3]])).matrix
    expect(Math.min(m[0][0], m[1][1])).toBeLessThan(0)
    const closure = floydTrace(g(true, [['a', 'b', 1], ['b', 'c', 1], ['c', 'a', 1], ['c', 'd', 1]])).matrix
    expect(closure.flatMap((row, i) => row.filter((x, j) => i !== j && Number.isFinite(x)))).toHaveLength(9)
  })

  it('Lecture 13: edit distance and knapsack', () => {
    const edit = (x: string, y: string) => {
      const E = Array.from({ length: x.length + 1 }, (_, i) => Array.from({ length: y.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)))
      for (let i = 1; i <= x.length; i++) {
        for (let j = 1; j <= y.length; j++) {
          E[i][j] = x[i - 1] === y[j - 1] ? E[i - 1][j - 1] : 1 + Math.min(E[i - 1][j], E[i][j - 1], E[i - 1][j - 1])
        }
      }
      return E[x.length][y.length]
    }
    expect(edit('SUNDAY', 'SATURDAY')).toBe(3)
    expect(edit('CAT', 'CUT')).toBe(1)
    expect(lcs('SUNDAY', 'SATURDAY')).toBe('SUDAY')
    expect(6 + 8 - 2 * lcsTable('SUNDAY', 'SATURDAY')[6][8]).toBe(4)

    const items = [{ name: 'A', w: 6, v: 30 }, { name: 'B', w: 5, v: 20 }, { name: 'C', w: 5, v: 20 }]
    expect(knapsack01(items, 10).value).toBe(40)
    expect([4, 5, 6, 9, 10, 11].map((W) => knapsackUnbounded(items, W).value)).toEqual([0, 20, 30, 30, 40, 50])
  })

  it('Lecture 14: wrong greedy rules, ratio rule, Huffman', () => {
    type Act = { name: string; s: number; f: number }
    const pick = (acts: Act[], key: (a: Act) => number) => {
      const chosen: Act[] = []
      for (const a of [...acts].sort((x, y) => key(x) - key(y))) if (chosen.every((c) => a.f <= c.s || c.f <= a.s)) chosen.push(a)
      return chosen.length
    }
    const early = [{ name: 'x', s: 0, f: 10 }, { name: 'y', s: 1, f: 2 }, { name: 'z', s: 3, f: 4 }]
    expect(pick(early, (a) => a.s)).toBe(1)
    expect(maxActivitiesBrute(early)).toBe(2)
    const short = [{ name: 'x', s: 0, f: 5 }, { name: 'y', s: 4, f: 6 }, { name: 'z', s: 5, f: 10 }]
    expect(pick(short, (a) => a.f - a.s)).toBe(1)
    expect(maxActivitiesBrute(short)).toBe(2)
    expect(activityTrace(short).chosen).toHaveLength(2)

    const jobs = [{ name: 'A', l: 3, w: 1 }, { name: 'B', l: 1, w: 2 }, { name: 'C', l: 2, w: 2 }]
    const costs = Object.fromEntries(perms(jobs).map((o) => [o.map((j) => j.name).join(''), weightedCompletion(o)]))
    expect(costs).toMatchObject({ BCA: 14, CBA: 16, BAC: 18, ABC: 23 })
    expect(Math.min(...Object.values(costs))).toBe(14)

    expect(huffmanTrace([['a', 8], ['b', 4], ['c', 2], ['d', 1], ['e', 1]]).cost * 16).toBeCloseTo(30)
    expect(huffmanTrace([['a', 5], ['b', 5], ['c', 5], ['d', 5]]).cost * 20).toBeCloseTo(40)
  })

  it('Lecture 15: cycle property', () => {
    const name = (gr: G.Graph, i: number) => gr.edges[i].u + gr.edges[i].v
    const cheaper: G.Graph = { ...G.MST_SMALL, edges: G.MST_SMALL.edges.map((e) => (e.u === 'b' && e.v === 'd' ? { ...e, w: 0 } : e)) }
    expect(kruskalTrace(cheaper).weight).toBe(6)
    const tree = kruskalTrace(G.MST_SMALL).tree.map((i) => name(G.MST_SMALL, i))
    expect(tree).not.toContain('de')
    expect(tree).not.toContain('bc')
    const four = g(false, [['p', 'q', 1], ['p', 'r', 4], ['p', 's', 3], ['q', 'r', 2], ['q', 's', 5], ['r', 's', 6]])
    const k = kruskalTrace(four)
    expect(k.weight).toBe(6)
    expect(k.tree.map((i) => name(four, i)).sort()).toEqual(['pq', 'ps', 'qr'])
  })

  it('Lecture 16: reverse edges and cuts', () => {
    const net = g(true, [['s', 'a', 1], ['s', 'b', 1], ['a', 'c', 1], ['a', 'd', 1], ['b', 'c', 1], ['c', 't', 1], ['d', 't', 1]])
    expect(fordFulkersonTrace(net, 's', 't').value).toBe(2)
    // once s→a→c→t is full, no path of non-full forward edges leads from s to t
    const full = new Set(['sa', 'ac', 'ct'])
    const reach = new Set(['s'])
    let changed = true
    while (changed) {
      changed = false
      for (const e of net.edges) {
        if (reach.has(e.u) && !reach.has(e.v) && !full.has(e.u + e.v)) {
          reach.add(e.v)
          changed = true
        }
      }
    }
    expect(reach.has('t')).toBe(false)

    const cut = (S: string[]) => G.FLOW_ZIGZAG.edges.filter((e) => S.includes(e.u) && !S.includes(e.v)).reduce((sum, e) => sum + e.w!, 0)
    expect([['s'], ['s', 'a'], ['s', 'b'], ['s', 'a', 'b']].map(cut)).toEqual([200, 201, 200, 200])
    expect(minCutBrute(G.FLOW_ZIGZAG, 's', 't')).toBe(200)
  })

  it('Lecture 17: agreement and two stable matchings', () => {
    const r = galeShapleyTrace(MATCHING_AGREE)
    expect(r.match).toEqual({ W: 'Deniz', X: 'Can', Y: 'Bora', Z: 'Ada' })
    expect(Object.values(r.trace.at(-1)!.counters!)[0]).toBe(10)
    expect(allStableMatchings(MATCHING_AGREE)).toHaveLength(1)

    const p = { doctors: ['Ada', 'Bora'], hospitals: ['X', 'Y'], dPref: { Ada: ['X', 'Y'], Bora: ['Y', 'X'] }, hPref: { X: ['Bora', 'Ada'], Y: ['Ada', 'Bora'] } }
    expect(galeShapleyTrace(p).match).toEqual({ X: 'Ada', Y: 'Bora' })
    expect(allStableMatchings(p)).toHaveLength(2)
    expect(blockingPairs(p, { X: 'Bora', Y: 'Ada' })).toEqual([])
  })
})

describe('encoding and decoding with the Huffman code of the notes (l14-huffman)', () => {
  const { codes } = huffmanTrace(HUFFMAN_EXAMPLE)
  const encode = (w: string) => [...w].map((c) => codes[c]).join('')
  const decode = (bits: string) => {
    const byCode = Object.fromEntries(Object.entries(codes).map(([c, k]) => [k, c]))
    let out = ''
    let cur = ''
    for (const b of bits) {
      cur += b
      if (byCode[cur]) {
        out += byCode[cur]
        cur = ''
      }
    }
    return cur ? null : out
  }
  it('matches the worked example', () => {
    expect(codes).toEqual({ a: '0', b: '101', c: '100', d: '111', e: '1100', f: '1101' })
    expect(encode('face')).toBe('110101001100')
    expect(encode('fee').length).toBe(12)
    expect(decode('0101100111')).toBe('abcd')
    expect(decode('1101100111')).toBe('fcd')
    expect(decode('1001100111')).toBe('ced')
  })
})
