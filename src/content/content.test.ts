import { describe, expect, it } from 'vitest'
import { LECTURES_BY_LANG } from './curriculum'
import type { Lesson } from './types'
import { VIZ } from '../viz/registry'
import { multiply } from '../engines/karatsuba'
import { insertionSortComparisons } from '../engines/insertionSort'
import { rbFromSequence } from '../engines/redBlack'
import { bstFromSequence } from '../engines/bst'
import { height } from '../engines/tree'
import { substitution } from '../engines/recurrence'
import { log2Factorial } from '../engines/decisionTree'
import { digitCount, radixSort } from '../engines/bucketSort'
import { mergeSortComparisons } from '../engines/mergeSort'
import { expectedComparisons, quickSort } from '../engines/quickSort'
import { buildDecisionTree } from '../engines/decisionTree'
import { searchCost } from '../engines/bst'
import { countingSort } from '../engines/bucketSort'
import { blackHeight } from '../engines/tree'

describe.each(['tr', 'en'] as const)('curriculum integrity (%s)', (lang) => {
  const LECTURES = LECTURES_BY_LANG[lang]
  const ALL_LESSONS = LECTURES.flatMap((l) => l.lessons)
  it('covers the lectures in course order without gaps', () => {
    expect(LECTURES.map((l) => l.n)).toEqual(LECTURES.map((_, i) => i + 1))
  })
  it('lesson ids are unique and every lesson has the required parts', () => {
    const ids = ALL_LESSONS.map((l) => l.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const l of ALL_LESSONS) {
      expect(l.objectives.length).toBeGreaterThan(0)
      expect(l.sections.length).toBeGreaterThan(0)
      expect(l.quiz.length).toBeGreaterThan(0)
      expect(l.sources.length).toBeGreaterThan(0)
      expect(l.sections.some((s) => s.viz)).toBe(true)
    }
  })
  it('every viz key is registered', () => {
    for (const l of ALL_LESSONS) for (const s of l.sections) if (s.viz) expect(VIZ[s.viz], `${l.id}: ${s.viz}`).toBeDefined()
  })
  it('quiz and in-text check questions are well-formed (answers in range, unique ids, hints and explanations present)', () => {
    for (const l of ALL_LESSONS) {
      const qids = l.quiz.map((q) => q.id)
      expect(new Set(qids).size).toBe(qids.length)
      const cids = l.sections.flatMap((s) => (s.check ?? []).map((q) => q.id))
      expect(new Set(cids).size).toBe(cids.length)
      for (const q of [...l.quiz, ...l.sections.flatMap((s) => s.check ?? [])]) {
        expect(q.hint.length).toBeGreaterThan(5)
        expect(q.explanation.length).toBeGreaterThan(5)
        if (q.kind === 'mcq') {
          expect(q.answer).toBeGreaterThanOrEqual(0)
          expect(q.answer).toBeLessThan(q.options.length)
          expect(new Set(q.options).size).toBe(q.options.length)
        }
        if (q.kind === 'order') expect(new Set(q.items).size).toBe(q.items.length)
      }
    }
  })
  it('sources link to the official course site (or the reading it lists)', () => {
    for (const l of ALL_LESSONS)
      for (const s of l.sources) expect(s.url).toMatch(/^https?:\/\/(stanford-cs161\.github\.io|colab\.research\.google\.com\/github\/stanford-cs161|www\.cs\.cmu\.edu\/~avrim)/)
  })
  it('every lesson belongs to the lecture it is listed under', () => {
    for (const lec of LECTURES) for (const l of lec.lessons) expect(l.lecture).toBe(lec.n)
  })
})

describe('English content mirrors the Turkish content', () => {
  const tr = LECTURES_BY_LANG.tr.flatMap((l) => l.lessons)
  const en = LECTURES_BY_LANG.en.flatMap((l) => l.lessons)
  const shape = (l: Lesson) => ({
    id: l.id,
    lecture: l.lecture,
    minutes: l.minutes,
    objectives: l.objectives.length,
    prerequisites: l.prerequisites.length,
    sections: l.sections.map((s) => [
      s.kind,
      s.viz ?? null,
      s.box ?? null,
      s.label ?? null,
      s.code?.join('|') ?? null,
      s.proof?.length ?? 0,
      !!s.body,
      s.tasks?.length ?? 0,
      (s.check ?? []).map((q) => [q.id, q.kind, q.kind === 'mcq' ? [q.answer, q.options.length] : q.kind === 'numeric' ? q.answer : q.items.length]),
    ]),
    quiz: l.quiz.map((q) => [q.id, q.kind, q.kind === 'mcq' ? [q.answer, q.options.length, Object.keys(q.feedback ?? {})] : q.kind === 'numeric' ? [q.answer, q.tolerance ?? null] : q.items.length]),
    practice: l.practice.map((p) => [p.id, p.hints.length]),
    sources: l.sources.map((s) => s.url),
  })
  it('same lessons, sections, visualizers, answers and sources in both languages', () => {
    expect(en.map(shape)).toEqual(tr.map(shape))
    expect(LECTURES_BY_LANG.en.map((l) => [l.n, l.lessons.length])).toEqual(LECTURES_BY_LANG.tr.map((l) => [l.n, l.lessons.length]))
  })
  it('English content contains no Turkish-specific letters', () => {
    // Source labels carry both languages; proper names like Schönhage are fine.
    const text = JSON.stringify(LECTURES_BY_LANG.en, (k, v) => (k === 'label' ? undefined : v)).replace(/Schönhage/g, '')
    expect(text.match(/\S*[çğışöüÇĞİŞÖÜ]\S*/g) ?? []).toEqual([])
  })
})

describe('numeric claims made in the lesson content', () => {
  it('Lecture 1 practice: 47 × 83 uses 5 one-digit multiplications in Karatsuba, 4 in Mult1', () => {
    expect(multiply(47n, 83n, 'karatsuba').ops).toBe(5)
    expect(multiply(47n, 83n, 'mult1').ops).toBe(4)
  })
  it('Lecture 2: reversed 8-element InsertionSort makes 28 comparisons', () => {
    expect(insertionSortComparisons([8, 7, 6, 5, 4, 3, 2, 1])).toBe(28)
  })
  it('Lecture 3 practice: T(n/4)+T(n/2)+T(n/8)+n needs D = 8', () => {
    const r = substitution([{ k: 1, num: 1, den: 4 }, { k: 1, num: 1, den: 2 }, { k: 1, num: 1, den: 8 }], 1, 1, 1)
    expect(r.D!.value()).toBe(8)
    const own = substitution([{ k: 1, num: 1, den: 3 }, { k: 1, num: 1, den: 2 }], 1, 1, 1)
    expect(own.D!.value()).toBe(6)
  })
  it('Lecture 6: ⌈log2 4!⌉ = 5 and ⌈log2 5!⌉ = 7; radix practice result', () => {
    expect(Math.ceil(log2Factorial(4))).toBe(5)
    expect(Math.ceil(log2Factorial(5))).toBe(7)
    expect(radixSort([170, 45, 75, 90, 802, 24, 2, 66], 10)).toEqual([2, 24, 45, 66, 75, 90, 170, 802])
  })
  it('Lecture 7 practice: RB insertion of 10,5,15,3,7,1 gives the stated tree', () => {
    const t = rbFromSequence([10, 5, 15, 3, 7, 1])!
    expect([t.key, t.color]).toEqual([10, 'B'])
    expect([t.left!.key, t.left!.color]).toEqual([5, 'R'])
    expect([t.right!.key, t.right!.color]).toEqual([15, 'B'])
    expect([t.left!.left!.key, t.left!.left!.color]).toEqual([3, 'B'])
    expect([t.left!.right!.key, t.left!.right!.color]).toEqual([7, 'B'])
    expect([t.left!.left!.left!.key, t.left!.left!.left!.color]).toEqual([1, 'R'])
  })
  it('Lecture 7: sorted insert of 1..12 → BST height 11; balanced order 4,2,6,1,3,5,7 → height 2', () => {
    expect(height(bstFromSequence([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]))).toBe(11)
    expect(height(bstFromSequence([4, 2, 6, 1, 3, 5, 7]))).toBe(2)
    expect(height(bstFromSequence([4, 6, 2, 7, 5, 3, 1]))).toBe(2)
  })
  it('numbers quoted in the in-text check questions', () => {
    // L2: inversions of [4, 1, 3, 2] = shifts; merging [2,7] with [3,5] costs 3 comparisons (+1 +1 for the halves)
    const inv = (a: number[]) => a.reduce((s, x, i) => s + a.slice(i + 1).filter((y) => y < x).length, 0)
    expect(inv([4, 1, 3, 2])).toBe(4)
    expect(mergeSortComparisons([2, 7, 3, 5])).toBe(5)
    // L5: sorted 10 with the last-element pivot; E[C] for n = 3
    expect(quickSort([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 'last').comparisons).toBe(45)
    expect(expectedComparisons(3)).toBeCloseTo(8 / 3)
    // L6: decision-tree heights and lower bounds, radix passes
    expect(buildDecisionTree('merge', 4).height).toBe(5)
    expect(Math.ceil(log2Factorial(6) - 1e-9)).toBe(10)
    expect(Math.ceil(Math.log2(1_000_001))).toBe(20)
    expect(digitCount(999_999, 10)).toBe(6)
    expect(digitCount(2 ** 32 - 1, 256)).toBe(4)
    // L7: pre-lecture tree search for 7 visits 3 nodes; sorted 1..12 chain averages 6.5 comparisons
    expect(searchCost(bstFromSequence([5, 3, 9, 1, 4, 6]), 7)).toBe(3)
    const chain = bstFromSequence([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
    expect([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].reduce((s, k) => s + searchCost(chain, k), 0) / 12).toBe(6.5)
  })
  it('worked examples and practice problems added to Lectures 1–6', () => {
    const perms = (n: number): number[][] => (n === 0 ? [[]] : perms(n - 1).flatMap((p) => Array.from({ length: n }, (_, i) => [...p.slice(0, i), n, ...p.slice(i)])))
    const inv = (a: number[]) => a.reduce((s, x, i) => s + a.slice(i + 1).filter((y) => y < x).length, 0)
    // L1: all-pairs duplicate check on 10 elements
    let pairs = 0
    for (let i = 0; i < 10; i++) for (let j = i + 1; j < 10; j++) pairs++
    expect(pairs).toBe(45)
    // L2: average inversions for n = 8; sorted input costs n − 1 comparisons; MergeSort worst case for n = 8
    const p8 = perms(8)
    expect(p8.reduce((s, p) => s + inv(p), 0) / p8.length).toBe(14)
    expect(insertionSortComparisons([1, 2, 3, 4, 5, 6, 7, 8])).toBe(7)
    expect(Math.max(...p8.map((p) => mergeSortComparisons(p)))).toBe(17)
    expect(mergeSortComparisons([1, 5, 3, 7, 2, 6, 4, 8])).toBe(17)
    // L2: witnesses for n²/2 − 3n
    const f = (n: number) => n * n / 2 - 3 * n
    const firstFrom = (ok: (n: number) => boolean) => Array.from({ length: 100 }, (_, i) => i + 1).find((n) => Array.from({ length: 200 }, (_, k) => n + k).every(ok))
    expect(firstFrom((n) => f(n) >= (n * n) / 4)).toBe(12)
    expect(firstFrom((n) => f(n) >= (n * n) / 5)).toBe(10)
    // L3: 2T(n/2) + n log n level totals for n = 8; 4T(n/2) + n equals 2n² − n on powers of two
    expect([0, 1, 2].reduce((s, j) => s + 8 * (3 - j), 0)).toBe(48)
    const T = (n: number): number => (n === 1 ? 1 : 4 * T(n / 2) + n)
    for (const n of [1, 2, 4, 8, 16, 32]) expect(T(n)).toBe(2 * n * n - n)
    // L5: QuickSort on 10 equal keys; expected fixed points and records over all permutations
    expect(quickSort(Array(10).fill(5), 'last').comparisons).toBe(45)
    const p6 = perms(6)
    expect(p6.reduce((s, p) => s + p.filter((x, i) => x === i + 1).length, 0) / p6.length).toBeCloseTo(1, 12)
    const p4 = perms(4)
    const records = (p: number[]) => p.filter((x, i) => p.slice(0, i).every((y) => y < x)).length
    expect(p4.reduce((s, p) => s + records(p), 0) / p4.length).toBeCloseTo(25 / 12, 12)
  })
})

describe('second round of worked examples in Lectures 1–7', () => {
  it('Karatsuba counts, complex product, binary InsertionSort', () => {
    const k = (x: string) => multiply(BigInt(x), BigInt(x), 'karatsuba').ops
    expect(k('11111111')).toBe(27)
    expect([8, 16, 32, 64].map((n) => k('9'.repeat(n)))).toEqual([63, 197, 601, 1815])
    expect(multiply(BigInt('9'.repeat(64)), BigInt('9'.repeat(64)), 'mult1').ops).toBe(4096)
    // (3 + 2i)(1 + 4i) with three real products
    const [a, b, c, d] = [3, 2, 1, 4]
    const p1 = a * c
    const p2 = b * d
    const p3 = (a + b) * (c + d)
    expect([p1 - p2, p3 - p1 - p2]).toEqual([a * c - b * d, a * d + b * c])
    expect([p1 - p2, p3 - p1 - p2]).toEqual([-5, 14])
    expect([1, 2, 3, 4, 5, 6, 7].reduce((sum, i) => sum + Math.ceil(Math.log2(i + 1)), 0)).toBe(17)
    expect(insertionSortComparisons([8, 7, 6, 5, 4, 3, 2, 1])).toBe(28)
  })

  it('QuickSort worst-case probability', () => {
    // probability that random-pivot QuickSort makes n(n−1)/2 comparisons
    const pWorst = (n: number): number => (n <= 1 ? 1 : (2 / n) * pWorst(n - 1))
    expect(pWorst(4)).toBeCloseTo(1 / 3, 12)
    const fact = (n: number): number => (n <= 1 ? 1 : n * fact(n - 1))
    for (const n of [4, 10, 20]) expect(pWorst(n) / (2 ** (n - 1) / fact(n))).toBeCloseTo(1, 12)
    expect(pWorst(10)).toBeCloseTo(1.41e-4, 6)
    expect(pWorst(20) / 1e-13).toBeCloseTo(2.15, 2)
    // exhaustive check for n = 4: average over all pivot choices
    const worst = (keys: number[]): number => {
      if (keys.length <= 1) return 1
      return keys.reduce((sum, p) => {
        const lo = keys.filter((x) => x < p)
        const hi = keys.filter((x) => x > p)
        const isWorst = lo.length === 0 || hi.length === 0
        return sum + (isWorst ? worst(lo.length ? lo : hi) : 0)
      }, 0) / keys.length
    }
    expect(worst([1, 2, 3, 4])).toBeCloseTo(1 / 3, 12)
  })

  it('CountingSort with prefix sums, base choice, nearly sorted input', () => {
    const A = [3, 1, 4, 1, 5, 2, 3]
    const C = Array(6).fill(0)
    for (const x of A) C[x]++
    expect(C).toEqual([0, 2, 1, 2, 1, 1])
    const start = C.map((_, k) => C.slice(0, k).reduce((s2, v) => s2 + v, 0))
    expect(start).toEqual([0, 0, 2, 3, 5, 6])
    const out: number[] = Array(A.length)
    const placed = A.map((x) => {
      out[start[x]] = x
      return start[x]++
    })
    expect(placed).toEqual([3, 0, 5, 1, 6, 2, 4])
    expect(out).toEqual(countingSort(A, 6))
    expect(digitCount(10 ** 12 - 1, 10)).toBe(12)
    expect(digitCount(10 ** 12 - 1, 10 ** 6)).toBe(2)
    // every element at most k places from its sorted position ⇒ at most 2kn inversions
    const k = 3
    for (let seed = 1; seed <= 20; seed++) {
      const n = 60
      const a = Array.from({ length: n }, (_, i) => i)
      let r = seed
      for (let i = 0; i + 1 < n; i++) {
        r = (r * 1103515245 + 12345) % 2147483648
        const j = i + 1
        if (r % 2 && Math.abs(a[i] - i) < k && Math.abs(a[j] - j) < k) [a[i], a[j]] = [a[j], a[i]]
      }
      expect(a.every((x, i) => Math.abs(x - i) <= k)).toBe(true)
      const inv = a.reduce((s2, x, i) => s2 + a.slice(i + 1).filter((y) => y < x).length, 0)
      expect(inv).toBeLessThanOrEqual(2 * k * n)
    }
  })

  it('red-black node counts and heights under sorted insertion', () => {
    const r = (n: number) => Array.from({ length: n }, (_, i) => i + 1)
    expect([15, 31].map((n) => height(bstFromSequence(r(n))))).toEqual([14, 30])
    expect([15, 31].map((n) => height(rbFromSequence(r(n))))).toEqual([5, 7])
    for (const n of [7, 15, 31, 100]) {
      const t = rbFromSequence(r(n))
      // blackHeight counts NIL but not the (black) root: the same number as black nodes on a path, root included, NIL excluded
      const b = blackHeight(t)
      expect(height(t) + 1).toBeLessThanOrEqual(2 * Math.log2(n + 1))
      expect(n).toBeGreaterThanOrEqual(2 ** b - 1)
      expect(n).toBeLessThanOrEqual(2 ** (2 * b) - 1)
    }
    expect([2 ** 3 - 1, 2 ** 6 - 1]).toEqual([7, 63])
  })
})

describe('worked examples in the comparison lessons', () => {
  it('sorting a million 32-bit integers (l6-compare)', () => {
    const n = 1e6
    expect(n * Math.log2(n)).toBeGreaterThan(1.9e7)
    expect(n * Math.log2(n)).toBeLessThan(2.1e7)
    const passes = (bits: number, b: number) => digitCount(2 ** bits - 1, 2 ** b)
    expect([8, 11, 16].map((b) => passes(32, b))).toEqual([4, 3, 2])
    expect(passes(48, 16)).toBe(3) // 2 ** 64 - 1 is not exact in floating point
    expect(Math.ceil(64 / 16)).toBe(4)
    expect(4 * (n + 256)).toBeCloseTo(4e6, -4)
    expect(2 * (n + 65536)).toBeCloseTo(2.13e6, -4)
    expect(3 * (n + 2048)).toBeCloseTo(3.01e6, -4)
  })

  it('inserting 1…7 and then 8 into a red-black tree (l7-compare)', () => {
    const ks = [1, 2, 3, 4, 5, 6, 7]
    const rb = rbFromSequence(ks)!
    expect([rb.key, rb.color, rb.left?.key, rb.right?.key, rb.right?.color]).toEqual([2, 'B', 1, 4, 'R'])
    expect([rb.right?.left?.key, rb.right?.right?.key, rb.right?.right?.left?.key, rb.right?.right?.right?.key]).toEqual([3, 6, 5, 7])
    expect(height(rb)).toBe(3)
    expect(ks.map((k) => searchCost(rb, k))).toEqual([2, 1, 3, 2, 4, 3, 4])
    expect(ks.reduce((s, k) => s + searchCost(rb, k), 0)).toBe(19)
    expect(ks.reduce((s, k) => s + searchCost(bstFromSequence(ks), k), 0)).toBe(28)
    const rb8 = rbFromSequence([...ks, 8])!
    expect([rb8.key, rb8.left?.key, rb8.left?.color, rb8.right?.key, rb8.right?.color, height(rb8)]).toEqual([4, 2, 'R', 6, 'R', 3])
    const orders = [ks, [4, 2, 6, 1, 3, 5, 7], [7, 6, 5, 4, 3, 2, 1], [1, 7, 2, 6, 3, 5, 4]]
    expect(orders.map((o) => height(bstFromSequence(o)))).toEqual([6, 2, 6, 6])
  })
})

describe('substitution: T(n) ≤ T(n/4) + T(n/2) + n (l3-substitution c5)', () => {
  it('stays below 4n and the coefficient approaches 4', () => {
    const memo = new Map<number, number>()
    const T = (n: number): number => {
      if (n <= 1) return 1
      if (!memo.has(n)) memo.set(n, T(Math.floor(n / 4)) + T(Math.floor(n / 2)) + n)
      return memo.get(n)!
    }
    let worst = 0
    for (let n = 1; n <= 200_000; n++) worst = Math.max(worst, T(n) / n)
    expect(worst).toBeLessThanOrEqual(4)
    expect(T(2 ** 30) / 2 ** 30).toBeGreaterThan(3.9)
  })
})

describe('try-it-yourself questions added to the comparison lessons and the 4th quiz question', () => {
  it('l1-why q4: an n² program at 3 s for n = 1000 takes 27 s for n = 3000', () => {
    expect(3 * (3000 / 1000) ** 2).toBe(27)
  })
  it('l6-compare c4: InsertionSort on sorted input makes n − 1 comparisons, MergeSort about (n/2) log₂ n', () => {
    const sorted = Array.from({ length: 1000 }, (_, i) => i)
    expect(insertionSortComparisons(sorted)).toBe(999)
    const m = mergeSortComparisons(sorted)
    expect(m).toBeGreaterThan(4500)
    expect(m).toBeLessThan(5500)
  })
  it('l7-compare c4 and q4: RB bound for n = 12, measured height, chain search total for n = 100', () => {
    expect(Math.floor(2 * Math.log2(13))).toBe(7)
    expect(height(rbFromSequence(Array.from({ length: 12 }, (_, i) => i + 1)))).toBe(4)
    const keys = Array.from({ length: 100 }, (_, i) => i + 1)
    const chain = bstFromSequence(keys)
    expect(keys.reduce((s, k) => s + searchCost(chain, k), 0)).toBe(5050)
    expect(2 * Math.log2(101)).toBeLessThan(14)
  })
})
