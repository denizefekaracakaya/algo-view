import { describe, expect, it } from 'vitest'
import { makeRng, randomArray } from './random'
import { insertionSort, insertionSortComparisons, insertionSortTrace } from './insertionSort'
import { merge, mergeSort, mergeSortComparisons, mergeSortTrace } from './mergeSort'
import { quickSort, quickSortTrace, expectedComparisons, type QSPivot } from './quickSort'
import { countingSort, radixSort, bucketSortTrace, digitCount } from './bucketSort'

const sorted = (a: readonly number[]) => [...a].sort((x, y) => x - y)
const edgeCases: number[][] = [[], [5], [2, 1], [1, 2], [3, 3, 3], [5, 4, 3, 2, 1], [1, 2, 3, 4, 5], [0, -1, 7, -1, 0, 3], [Number.MAX_SAFE_INTEGER, -Number.MAX_SAFE_INTEGER, 0]]

function randomCases(count: number, seed: number, maxLen = 40, lo = -50, hi = 50) {
  const rng = makeRng(seed)
  return Array.from({ length: count }, () => randomArray(rng, Math.floor(rng() * maxLen), lo, hi))
}

describe('InsertionSort', () => {
  it.each(edgeCases)('sorts edge case %#', (...a) => expect(insertionSort(a)).toEqual(sorted(a)))
  it('sorts random arrays (permutation + order)', () => {
    for (const a of randomCases(300, 1)) expect(insertionSort(a)).toEqual(sorted(a))
  })
  it('does not mutate its input', () => {
    const a = [3, 1, 2]
    insertionSort(a)
    expect(a).toEqual([3, 1, 2])
  })
  it('trace ends sorted, keeps invariant and counts comparisons like the plain version', () => {
    for (const a of randomCases(100, 2, 12)) {
      const t = insertionSortTrace(a)
      const last = t[t.length - 1]
      expect(last.state.done).toBe(true)
      expect(last.state.a).toEqual(sorted(a))
      expect(last.counters?.['karşılaştırma']).toBe(insertionSortComparisons(a))
      // Loop invariant: whenever a step ends an iteration (line 8), the prefix is sorted.
      for (const s of t) if (s.line === 8) {
        const prefix = s.state.a.slice(0, s.state.sortedEnd + 1)
        expect(prefix).toEqual(sorted(prefix))
      }
    }
  })
  it('worst case uses n(n-1)/2 comparisons on reversed input', () => {
    expect(insertionSortComparisons([6, 5, 4, 3, 2, 1])).toBe(15)
  })
  it('prediction answers point to the real final index', () => {
    const a = [5, 2, 4, 6, 1, 3]
    const t = insertionSortTrace(a)
    for (let k = 0; k < t.length; k++) {
      const p = t[k].predict
      if (!p) continue
      const i = t[k].state.i!
      // find end of this iteration
      const end = t.slice(k).find((s) => s.line === 8 && s.state.i === i)!
      const finalIndex = end.state.a.indexOf(t[k].state.current!)
      expect(p.options[p.answer]).toBe(`indeks ${end.state.j! + 1}`)
      expect(end.state.a[end.state.j! + 1]).toBe(t[k].state.current)
      expect(finalIndex).toBeGreaterThanOrEqual(0)
    }
  })
})

describe('MergeSort', () => {
  it('merge handles exhausted lists and duplicates', () => {
    expect(merge([], [1, 2])).toEqual([1, 2])
    expect(merge([1, 2], [])).toEqual([1, 2])
    expect(merge([1, 3, 3], [2, 3, 4])).toEqual([1, 2, 3, 3, 3, 4])
  })
  it.each(edgeCases)('sorts edge case %#', (...a) => expect(mergeSort(a)).toEqual(sorted(a)))
  it('sorts random arrays', () => {
    for (const a of randomCases(300, 3)) expect(mergeSort(a)).toEqual(sorted(a))
  })
  it('comparisons are at most n⌈log2 n⌉', () => {
    for (const a of randomCases(100, 4, 64)) {
      const n = a.length
      if (n < 2) continue
      expect(mergeSortComparisons(a)).toBeLessThanOrEqual(n * Math.ceil(Math.log2(n)))
    }
  })
  it('trace: root node ends with the sorted array and every merged node is sorted', () => {
    for (const a of randomCases(60, 5, 16)) {
      const t = mergeSortTrace(a)
      const last = t[t.length - 1].state
      if (a.length) expect(last.nodes.find((x) => x.id === 'r')!.values).toEqual(sorted(a))
      for (const x of last.nodes) expect(x.values).toEqual(sorted(x.values))
      expect(last.maxDepth).toBe(a.length <= 1 ? 0 : Math.ceil(Math.log2(a.length)))
      expect(t[t.length - 1].counters?.['karşılaştırma'] ?? 0).toBe(mergeSortComparisons(a))
    }
  })
})

describe('QuickSort', () => {
  const strategies: QSPivot[] = ['last', 'first', 'random', 'median']
  it.each(strategies)('sorts edge cases with %s pivot', (s) => {
    for (const a of edgeCases) expect(quickSort(a, s, 7).sorted).toEqual(sorted(a))
  })
  it('random pivot sorts correctly across many seeds', () => {
    const cases = randomCases(50, 6)
    for (let seed = 1; seed <= 20; seed++) for (const a of cases) expect(quickSort(a, 'random', seed).sorted).toEqual(sorted(a))
  })
  it('same seed → identical execution; different seeds may differ', () => {
    const a = randomArray(makeRng(9), 30, 0, 1000)
    expect(quickSort(a, 'random', 42)).toEqual(quickSort(a, 'random', 42))
    const counts = new Set(Array.from({ length: 10 }, (_, s) => quickSort(a, 'random', s + 1).comparisons))
    expect(counts.size).toBeGreaterThan(1)
  })
  it('deterministic last-element pivot is quadratic on sorted input', () => {
    const n = 50
    const a = Array.from({ length: n }, (_, i) => i)
    expect(quickSort(a, 'last').comparisons).toBe((n * (n - 1)) / 2)
  })
  it('average comparisons over many seeds is close to 2(n+1)H_n − 4n', () => {
    const n = 64
    const a = Array.from({ length: n }, (_, i) => (i * 37) % n)
    let total = 0
    const runs = 400
    for (let s = 1; s <= runs; s++) total += quickSort(a, 'random', s).comparisons
    const mean = total / runs
    expect(Math.abs(mean - expectedComparisons(n)) / expectedComparisons(n)).toBeLessThan(0.05)
  })
  it('trace final state is sorted and every element fixed', () => {
    for (const s of strategies)
      for (const a of randomCases(40, 8, 14)) {
        const t = quickSortTrace(a, s, 3)
        const last = t[t.length - 1].state
        expect(last.a).toEqual(sorted(a))
        expect(last.fixed.every(Boolean)).toBe(true)
        expect(t[t.length - 1].counters?.['karşılaştırma']).toBe(quickSort(a, s, 3).comparisons)
      }
  })
  it('partition invariant holds at each line-8 step', () => {
    for (const a of randomCases(40, 10, 14)) {
      for (const st of quickSortTrace(a, 'random', 5)) {
        if (st.line !== 8) continue
        const { a: arr, lo, hi, pivotAt } = st.state
        for (let x = lo!; x < pivotAt!; x++) expect(arr[x]).toBeLessThan(arr[pivotAt!])
        for (let x = pivotAt! + 1; x <= hi!; x++) expect(arr[x]).toBeGreaterThanOrEqual(arr[pivotAt!])
      }
    }
  })
})

describe('CountingSort / RadixSort', () => {
  it('counting sort sorts keys in range and rejects out-of-range keys', () => {
    expect(countingSort([3, 0, 2, 3, 1], 4)).toEqual([0, 1, 2, 3, 3])
    expect(() => countingSort([4], 4)).toThrow()
    expect(() => countingSort([-1], 4)).toThrow()
    expect(countingSort([], 5)).toEqual([])
  })
  it('radix sort sorts non-negative integers in several bases', () => {
    const rng = makeRng(11)
    for (const r of [2, 3, 10, 16, 100]) for (let t = 0; t < 50; t++) {
      const a = randomArray(rng, Math.floor(rng() * 30), 0, 5000)
      expect(radixSort(a, r)).toEqual(sorted(a))
    }
  })
  it('digitCount matches ⌊log_r M⌋ + 1', () => {
    expect(digitCount(0, 10)).toBe(1)
    expect(digitCount(9, 10)).toBe(1)
    expect(digitCount(10, 10)).toBe(2)
    expect(digitCount(1234, 10)).toBe(4)
    expect(digitCount(255, 16)).toBe(2)
    expect(digitCount(256, 16)).toBe(3)
  })
  it('trace is stable: equal keys keep input order', () => {
    const a = [3, 1, 3, 0, 1, 3]
    for (const mode of ['counting', 'radix'] as const) {
      const t = bucketSortTrace(a, mode, mode === 'counting' ? 4 : 2)
      const out = t[t.length - 1].state.output
      expect(out.map((x) => x.key)).toEqual(sorted(a))
      for (let i = 1; i < out.length; i++) if (out[i].key === out[i - 1].key) expect(out[i].tag).toBeGreaterThan(out[i - 1].tag)
    }
  })
  it('radix trace: after pass t the array is sorted by the last t digits', () => {
    const a = [21, 345, 13, 101, 50, 234, 1]
    const t = bucketSortTrace(a, 'radix', 10)
    const ends = t.filter((s) => s.state.output.length === a.length && s.phase?.startsWith('Geçiş'))
    ends.forEach((s, pass) => {
      const mod = 10 ** (pass + 1)
      const keys = s.state.output.map((x) => x.key % mod)
      expect(keys).toEqual([...keys].sort((x, y) => x - y))
    })
    expect(t[t.length - 1].state.output.map((x) => x.key)).toEqual([1, 13, 21, 50, 101, 234, 345])
  })
})
