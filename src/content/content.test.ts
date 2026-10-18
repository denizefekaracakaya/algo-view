import { describe, expect, it } from 'vitest'
import { ALL_LESSONS, LECTURES } from './curriculum'
import { VIZ } from '../viz/registry'
import { multiply } from '../engines/karatsuba'
import { insertionSortComparisons } from '../engines/insertionSort'
import { rbFromSequence } from '../engines/redBlack'
import { bstFromSequence } from '../engines/bst'
import { height } from '../engines/tree'
import { substitution } from '../engines/recurrence'
import { log2Factorial } from '../engines/decisionTree'
import { radixSort } from '../engines/bucketSort'

describe('curriculum integrity', () => {
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
  it('quiz questions are well-formed (answers in range, unique ids, hints and explanations present)', () => {
    for (const l of ALL_LESSONS) {
      const qids = l.quiz.map((q) => q.id)
      expect(new Set(qids).size).toBe(qids.length)
      for (const q of l.quiz) {
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
})
