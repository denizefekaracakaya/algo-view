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
import { MATCHING_EXAMPLE, allStableMatchings, blockingPairs, galeShapleyTrace } from '../engines/stableMatching'

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
