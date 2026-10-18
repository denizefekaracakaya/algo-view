import { afterEach, describe, expect, it } from 'vitest'
import { GENERATORS, generate, inversionPairs, lomutoPartition, mergeComparisons, radixPass } from './generators'
import { bstDrill, DRILL_LESSON, DRILLS, drillInput, insertionDrill, mergeDrill, momDrill, partitionDrill, radixDrill } from './drills'
import { insertionSort } from '../engines/insertionSort'
import { merge } from '../engines/mergeSort'
import { quickSort } from '../engines/quickSort'
import { radixSort } from '../engines/bucketSort'
import { select } from '../engines/select'
import { inorder } from '../engines/tree'
import { makeRng, randomPermutation } from '../engines/random'
import { emptyProgress, progressReducer } from '../state/progress'
import { setCurrentLang, type Lang } from '../i18n/lang'
import { LECTURES_BY_LANG } from '../content/curriculum'
import type { Question } from '../content/types'

afterEach(() => setCurrentLang('tr'))

const texts = (q: Question): string[] => [q.prompt, q.hint, q.explanation, ...(q.kind === 'mcq' ? [...q.options, ...Object.values(q.feedback ?? {})] : [])].map(String)

describe.each<Lang>(['tr', 'en'])('question generators (%s)', (lang) => {
  it.each(GENERATORS.map((g) => [g.id, g] as const))('%s builds valid questions for many seeds', (_, g) => {
    setCurrentLang(lang)
    for (let seed = 1; seed <= 150; seed++) {
      const q = generate(g, seed)
      expect(q.id).toBe(`${g.id}-${seed}`)
      for (const t of texts(q)) {
        expect(t.trim().length).toBeGreaterThan(0)
        expect(t).not.toMatch(/undefined|NaN|Infinity|\[object/)
        // Balanced $…$ so KaTeX segments never swallow plain text.
        expect((t.match(/\$/g) ?? []).length % 2).toBe(0)
        if (lang === 'en') expect(t).not.toMatch(/[çğışöüÇĞİŞÖÜ]/)
      }
      if (q.kind === 'numeric') expect(Number.isFinite(q.answer)).toBe(true)
      if (q.kind === 'mcq') {
        expect(q.answer).toBeGreaterThanOrEqual(0)
        expect(q.answer).toBeLessThan(q.options.length)
        expect(new Set(q.options).size).toBe(q.options.length)
      }
    }
  })
})

describe('generators are deterministic and tied to real lessons', () => {
  it('same seed, same question', () => {
    for (const g of GENERATORS) expect(generate(g, 42)).toEqual(generate(g, 42))
  })
  it('every generator and drill points at an existing lesson', () => {
    const ids = new Set(LECTURES_BY_LANG.tr.flatMap((l) => l.lessons.map((x) => x.id)))
    for (const g of GENERATORS) expect(ids.has(g.lessonId)).toBe(true)
    for (const id of Object.values(DRILL_LESSON)) expect(ids.has(id)).toBe(true)
    expect(DRILLS.map((d) => d.id).sort()).toEqual(Object.keys(DRILL_LESSON).sort())
  })
  it('generator ids are unique', () => {
    expect(new Set(GENERATORS.map((g) => g.id)).size).toBe(GENERATORS.length)
  })
})

describe('generator answers agree with the engines', () => {
  const gen = (id: string) => GENERATORS.find((g) => g.id === id)!
  it('inversions = InsertionSort shifts', () => {
    for (let s = 1; s <= 40; s++) {
      const A = randomPermutation(makeRng(s), 7)
      const ins = insertionDrill(A)
      expect(ins.final).toEqual(insertionSort(A))
      expect(inversionPairs(A).length).toBe(ins.steps.reduce((t, st) => t + (st.i - st.answer), 0))
    }
  })
  it('merge comparisons and Lomuto partition', () => {
    expect(mergeComparisons([1, 2, 3], [4, 5, 6])).toBe(3)
    expect(mergeComparisons([1, 4], [2, 3])).toBe(3)
    for (let s = 1; s <= 30; s++) {
      const A = randomPermutation(makeRng(s), 8)
      const { array, index } = lomutoPartition(A)
      expect(array[index]).toBe(A[7])
      expect(index).toBe(A.filter((x) => x < A[7]).length)
      expect(array.slice(0, index).every((x) => x < A[7])).toBe(true)
    }
  })
  it('sorted-worst matches QuickSort with the last element as pivot', () => {
    for (let s = 1; s <= 30; s++) {
      const q = generate(gen('sorted-worst'), s)
      const n = Number(/\$\[1, 2, …, (\d+)\]\$/.exec(q.prompt)![1])
      expect(q.kind === 'numeric' && q.answer).toBe(quickSort(Array.from({ length: n }, (_, i) => i + 1), 'last').comparisons)
    }
  })
  it('mom-pivot matches the median of medians the Select engine would use', () => {
    for (let s = 1; s <= 30; s++) {
      const A = drillInput('select-mom', s)
      expect(momDrill(A).pivot).toBe(select([0, 5, 10].map((o) => select(A.slice(o, o + 5), 3)), 2))
    }
  })
  it('radix first pass is the stable ones-digit pass', () => {
    expect(radixPass([31, 22, 11, 42], 0, 10)).toEqual([31, 11, 22, 42])
  })
})

describe('hand-tracing drills', () => {
  it('replaying every answer reproduces the algorithm', () => {
    for (let s = 1; s <= 40; s++) {
      const ins = insertionDrill(drillInput('insertion', s))
      expect(ins.final).toEqual([...ins.final].sort((x, y) => x - y))
      expect(ins.steps).toHaveLength(6)

      const A = drillInput('merge', s)
      const L = A.slice(0, 4).sort((x, y) => x - y)
      const R = A.slice(4).sort((x, y) => x - y)
      const m = mergeDrill(L, R)
      expect(m.final).toEqual(merge(L, R))
      expect(m.steps).toHaveLength(mergeComparisons(L, R))

      const P = drillInput('partition', s)
      const p = partitionDrill(P)
      const lom = lomutoPartition(P)
      expect(p.final).toEqual(lom.array)
      expect(p.steps[p.steps.length - 1]).toMatchObject({ kind: 'place', answer: lom.index })

      const X = drillInput('radix', s)
      const r = radixDrill(X)
      expect(r.final).toEqual(radixSort(X, 10))
      expect(r.steps).toHaveLength(X.length * 2)

      const keys = drillInput('bst', s)
      const b = bstDrill(keys)
      expect(inorder(b.final)).toEqual([...keys].sort((x, y) => x - y))
      expect(new Set(keys).size).toBe(keys.length)
    }
  })
  it('mom drill answers point at the medians', () => {
    const { steps, pivot } = momDrill([5, 1, 4, 2, 3, 10, 9, 8, 7, 6, 15, 11, 13, 12, 14])
    expect(steps.map((st) => st.options[st.answer])).toEqual([3, 8, 13, 8])
    expect(pivot).toBe(8)
  })
})

describe('progress records practice', () => {
  it('counts drill runs and perfect runs, and generated questions', () => {
    let p = progressReducer(emptyProgress(), { type: 'drill', id: 'merge', mistakes: 0 })
    p = progressReducer(p, { type: 'drill', id: 'merge', mistakes: 2 })
    expect(p.drills.merge).toEqual({ runs: 2, perfect: 1 })
    p = progressReducer(p, { type: 'gen', id: 'master', solved: false })
    p = progressReducer(p, { type: 'gen', id: 'master', solved: true })
    expect(p.gen.master).toEqual({ solved: 1, attempts: 2 })
    expect(progressReducer(p, { type: 'reset' }).drills).toEqual({})
  })
})
