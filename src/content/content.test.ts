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

describe.each(['tr', 'en'] as const)('curriculum integrity (%s)', (lang) => {
  const LECTURES = LECTURES_BY_LANG[lang]
  const ALL_LESSONS = LECTURES.flatMap((l) => l.lessons)
  it('covers exactly lectures 1–7 in order', () => {
    expect(LECTURES.map((l) => l.n)).toEqual([1, 2, 3, 4, 5, 6, 7])
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
  it('no out-of-scope topics leak into lesson titles', () => {
    for (const l of ALL_LESSONS) expect(l.title + l.titleEn).not.toMatch(/hash|dijkstra|dynamic programming|greedy|BFS|DFS/i)
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
})
