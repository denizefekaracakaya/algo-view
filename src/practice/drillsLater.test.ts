import { afterEach, describe, expect, it } from 'vitest'
import {
  bfsDrill,
  bfsDrillGraph,
  dfsDrill,
  dfsDrillGraph,
  dijkstraDrill,
  dijkstraDrillGraph,
  FINISH,
  gsDrill,
  gsDrillInput,
  HASH_N,
  hashDrill,
  huffmanDrill,
  huffmanDrillInput,
  kruskalDrill,
  kruskalDrillGraph,
  LATER_DRILL_LESSON,
  lcsDrill,
  lcsDrillInput,
} from './drillsLater'
import { DRILLS } from './drills'
import { bfsDistances, dfsTimes } from '../engines/graphSearch'
import { dijkstraTrace } from '../engines/shortestPaths'
import { lcs } from '../engines/dp'
import { huffmanTrace } from '../engines/greedy'
import { mstBrute } from '../engines/mst'
import { blockingPairs, galeShapleyTrace } from '../engines/stableMatching'
import { setCurrentLang, type Lang } from '../i18n/lang'

afterEach(() => setCurrentLang('tr'))

const SEEDS = Array.from({ length: 60 }, (_, i) => i * 37 + 1)

describe('later hand-tracing drills agree with the engines', () => {
  it('hashing puts every key in its bucket, in insertion order', () => {
    for (const seed of SEEDS) {
      const { steps, keys, final, a, b } = hashDrill(seed)
      expect(steps).toHaveLength(keys.length)
      expect(final.flat().sort((x, y) => x - y)).toEqual([...keys].sort((x, y) => x - y))
      keys.forEach((x, k) => expect(steps[k].answer).toBe(((a * x + b) % 13) % HASH_N))
    }
  })
  it('BFS processes nodes in order of distance and finds the BFS distances', () => {
    for (const seed of SEEDS) {
      const g = bfsDrillGraph(seed)
      const { steps, dist, order } = bfsDrill(g)
      const ref = bfsDistances(g, 's')
      for (const v of Object.keys(ref)) expect(dist[v] ?? null).toBe(ref[v])
      const ds = order.map((v) => dist[v])
      expect(ds).toEqual([...ds].sort((x, y) => x - y))
      for (const st of steps) expect(st.options[st.answer]).toBeDefined()
    }
  })
  it('DFS events reproduce the engine’s discovery and finish times', () => {
    for (const seed of SEEDS) {
      const g = dfsDrillGraph(seed)
      const { steps, d, f } = dfsDrill(g)
      expect(steps).toHaveLength(12)
      expect(dfsTimes(g)).toEqual({ d, f })
      expect(new Set(g.edges.map((e) => [e.u, e.v].sort().join(''))).size).toBe(8)
      for (const st of steps) expect(st.answer).toBeGreaterThanOrEqual(0)
      expect(steps.filter((st) => st.options[st.answer] === FINISH)).toHaveLength(6)
    }
  })
  it('Dijkstra drill distances match the engine, and every pick is unambiguous', () => {
    for (const seed of SEEDS) {
      const g = dijkstraDrillGraph(seed)
      const { steps, dist } = dijkstraDrill(g)
      expect(dist).toEqual(dijkstraTrace(g, 's').d)
      expect(steps).toHaveLength(2 * (g.nodes.length - 1))
      for (const st of steps) {
        expect(st.answer).toBeGreaterThanOrEqual(0)
        expect(new Set(st.options).size).toBe(st.options.length)
        if (st.kind === 'dist') expect(Number(st.options[st.answer])).toBe(dist[st.node!])
      }
    }
  })
  it('the LCS table ends with the LCS length', () => {
    for (const seed of SEEDS) {
      const { X, Y } = lcsDrillInput(seed)
      const { steps, table } = lcsDrill(X, Y)
      expect(steps).toHaveLength(X.length * Y.length)
      expect(table[X.length][Y.length]).toBe(lcs(X, Y).length)
      for (const st of steps) expect(st.answer).toBeLessThanOrEqual(Math.min(st.i, st.j))
    }
  })
  it('Huffman picks have no ties and the cost matches the engine', () => {
    for (const seed of SEEDS) {
      const chars = huffmanDrillInput(seed)
      const { steps, cost, root } = huffmanDrill(chars)
      expect(steps).toHaveLength(2 * (chars.length - 1))
      const total = chars.reduce((s, [, f]) => s + f, 0)
      expect(root.freq).toBe(total)
      expect(cost).toBeCloseTo(huffmanTrace(chars).cost * total, 9)
    }
  })
  it('Kruskal builds a minimum spanning tree', () => {
    for (const seed of SEEDS) {
      const g = kruskalDrillGraph(seed)
      const { steps, weight, tree } = kruskalDrill(g)
      expect(steps).toHaveLength(g.edges.length)
      expect(tree).toHaveLength(g.nodes.length - 1)
      expect(weight).toBe(mstBrute(g))
    }
  })
  it('Gale–Shapley drill ends in the engine’s stable matching', () => {
    for (const seed of SEEDS) {
      const p = gsDrillInput(seed)
      const { steps, match } = gsDrill(p)
      expect(match).toEqual(galeShapleyTrace(p).match)
      expect(blockingPairs(p, match)).toEqual([])
      expect(steps.length).toBeLessThanOrEqual(16)
    }
  })
})

describe.each<Lang>(['tr', 'en'])('later drill texts (%s)', (lang) => {
  it('hints and explanations are filled in and translated', () => {
    setCurrentLang(lang)
    const all = [
      ...hashDrill(3).steps,
      ...bfsDrill(bfsDrillGraph(3)).steps,
      ...dfsDrill(dfsDrillGraph(3)).steps,
      ...dijkstraDrill(dijkstraDrillGraph(3)).steps,
      ...lcsDrill('ABCA', 'BACAB').steps,
      ...huffmanDrill(huffmanDrillInput(3)).steps,
      ...kruskalDrill(kruskalDrillGraph(3)).steps,
      ...gsDrill(gsDrillInput(3)).steps,
    ]
    for (const st of all)
      for (const t of [st.hint, st.why]) {
        expect(t.trim().length).toBeGreaterThan(0)
        expect(t).not.toMatch(/undefined|NaN|\$/)
        if (lang === 'en') expect(t).not.toMatch(/[çğışöüÇĞİŞÖÜ]/)
      }
    for (const d of DRILLS) if (lang === 'en') expect(d.title() + d.blurb()).not.toMatch(/[çğışöüÇĞİŞÖÜ]/)
  })
  it('every later drill is in the catalogue', () => {
    expect(Object.keys(LATER_DRILL_LESSON).every((id) => DRILLS.some((d) => d.id === id))).toBe(true)
  })
})
