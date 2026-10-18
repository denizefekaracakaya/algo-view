import { describe, expect, it } from 'vitest'
import { groupRecurrenceRatio, medianOfMediansLayout, pivotSizes, substitutionConstant } from './selectAnalysis'
import { makeRng, randomPermutation } from './random'

describe('pivot quality simulation', () => {
  it('bad pivot shrinks by one each call (n = 48, k = 15 → sum 1176, as stated in the lesson)', () => {
    const s = pivotSizes(48, 15, 'bad')
    expect(s).toEqual(Array.from({ length: 48 }, (_, i) => 48 - i))
    expect(s.reduce((a, b) => a + b, 0)).toBe(1176)
  })
  it('median pivot halves the size and stays below 2n', () => {
    for (const n of [16, 48, 100, 128]) for (const k of [1, Math.ceil(n / 2), n]) expect(pivotSizes(n, k, 'median').reduce((a, b) => a + b, 0)).toBeLessThan(2 * n)
  })
  it('every rule ends at the target and sizes strictly decrease', () => {
    for (const rule of ['bad', 'median', 'random'] as const)
      for (let seed = 1; seed < 20; seed++) {
        const s = pivotSizes(40, (seed % 40) + 1, rule, seed)
        for (let i = 1; i < s.length; i++) expect(s[i]).toBeLessThan(s[i - 1])
      }
  })
})

describe('median-of-medians layout', () => {
  it('certain sides are really on that side, respect the lemma, and the 7n/10 + 5 bound holds', () => {
    for (let seed = 1; seed <= 200; seed++) {
      const n = 5 + (seed % 41)
      const a = randomPermutation(makeRng(seed), 99).slice(0, n)
      const L = medianOfMediansLayout(a)
      for (const c of L.columns)
        c.values.forEach((v, i) => {
          if (c.classes[i] === 'smaller') expect(v).toBeLessThan(L.pivot)
          if (c.classes[i] === 'greater') expect(v).toBeGreaterThan(L.pivot)
        })
      expect(L.certainSmaller).toBeGreaterThanOrEqual(L.lemmaBound)
      expect(L.certainGreater).toBeGreaterThanOrEqual(L.lemmaBound)
      expect(L.less).toBeLessThanOrEqual((7 * n) / 10 + 5)
      expect(L.greater).toBeLessThanOrEqual((7 * n) / 10 + 5)
    }
  })
  it('55 elements in 11 full groups: 17 certainly smaller (lesson check question)', () => {
    const L = medianOfMediansLayout(randomPermutation(makeRng(7), 55))
    expect(L.certainSmaller).toBe(17)
    expect(L.certainGreater).toBe(17)
  })
})

describe('group size analysis', () => {
  it('substitution constants: none for 3, 10 for 5, 7 for 7, 6 for 9', () => {
    expect(substitutionConstant(3)).toBeNull()
    expect(substitutionConstant(5)).toBeCloseTo(10)
    expect(substitutionConstant(7)).toBeCloseTo(7)
    expect(substitutionConstant(9)).toBeCloseTo(6)
  })
  it('the groups-of-3 model keeps growing while groups of 5 stay bounded', () => {
    expect(groupRecurrenceRatio(3, 1e7)).toBeGreaterThan(groupRecurrenceRatio(3, 1e4) + 5)
    expect(groupRecurrenceRatio(5, 1e7)).toBeLessThan(10)
    expect(groupRecurrenceRatio(7, 1e7)).toBeLessThan(7)
  })
})
