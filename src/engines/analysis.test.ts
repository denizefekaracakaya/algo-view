import { describe, expect, it } from 'vitest'
import { makeRng, randomArray } from './random'
import { select, selectTrace, validateK, type PivotStrategy } from './select'
import { multiply, multiplyTrace, gradeSchoolOps } from './karatsuba'
import { masterTheorem, analyzeRecurrence, recursionLevels, substitution, generalMaster, parseRecurrence } from './recurrence'
import { buildDecisionTree, factorial, log2Factorial, runWithOracle, permutations } from './decisionTree'

describe('Select', () => {
  const strategies: PivotStrategy[] = ['first', 'random', 'mom']
  it('returns the k-th smallest for every k on random arrays (with duplicates)', () => {
    const rng = makeRng(21)
    for (let t = 0; t < 120; t++) {
      const a = randomArray(rng, 1 + Math.floor(rng() * 40), -20, 20)
      const s = [...a].sort((x, y) => x - y)
      for (const strat of strategies) for (let k = 1; k <= a.length; k++) expect(select(a, k, strat, t + 1)).toBe(s[k - 1])
    }
  })
  it('validates k (1-based)', () => {
    expect(validateK(5, 0)).not.toBeNull()
    expect(validateK(5, 6)).not.toBeNull()
    expect(validateK(5, 2.5)).not.toBeNull()
    expect(validateK(0, 1)).not.toBeNull()
    expect(validateK(5, 5)).toBeNull()
    expect(() => select([1, 2], 3)).toThrow(RangeError)
  })
  it('trace result matches and eliminated elements never include the answer', () => {
    const rng = makeRng(22)
    for (let t = 0; t < 60; t++) {
      const a = randomArray(rng, 1 + Math.floor(rng() * 25), 0, 99)
      const k = 1 + Math.floor(rng() * a.length)
      for (const strat of strategies) {
        const tr = selectTrace(a, k, strat, 4)
        const last = tr[tr.length - 1].state
        const answer = [...a].sort((x, y) => x - y)[k - 1]
        expect(last.result).toBe(answer)
        // In every snapshot, at least one non-eliminated element holds the answer value.
        for (const st of tr) {
          const alive = st.state.values.filter((_, i) => st.state.roles[i] !== 'eliminated')
          expect(alive).toContain(answer)
        }
        // Prediction answers agree with the branch actually taken.
        tr.forEach((st, idx) => {
          if (!st.predict) return
          const next = tr[idx + 1]
          const chosen = next.line === 5 ? 0 : next.line === 6 ? 1 : 2
          expect(st.predict.answer).toBe(chosen)
        })
      }
    }
  })
  it('median-of-medians subproblem is at most 7n/10 + 5', () => {
    const rng = makeRng(23)
    for (let t = 0; t < 40; t++) {
      const n = 10 + Math.floor(rng() * 200)
      const a = Array.from({ length: n }, (_, i) => i).sort(() => rng() - 0.5)
      const tr = selectTrace(a, 1 + Math.floor(rng() * n), 'mom', 1)
      for (const st of tr) {
        const s = st.state.sizes
        if (s && st.line === 4) {
          const m = s.less + s.equal + s.greater
          expect(s.less).toBeLessThanOrEqual((7 * m) / 10 + 5)
          expect(s.greater).toBeLessThanOrEqual((7 * m) / 10 + 5)
        }
      }
    }
  })
})

describe('Karatsuba / Mult1', () => {
  it('computes exact products', () => {
    const rng = makeRng(31)
    for (let t = 0; t < 200; t++) {
      const x = BigInt(Math.floor(rng() * 1e8))
      const y = BigInt(Math.floor(rng() * 1e8))
      expect(multiply(x, y, 'karatsuba').product).toBe(x * y)
      expect(multiply(x, y, 'mult1').product).toBe(x * y)
    }
    expect(multiply(123456789012345678901234567890n, 987654321098765432109876543210n, 'karatsuba').product).toBe(
      123456789012345678901234567890n * 987654321098765432109876543210n,
    )
  })
  it('one-digit multiplication counts follow 4^s and 3^s for n = 2^s with no carries', () => {
    expect(multiply(1111n, 1111n, 'mult1').ops).toBe(16)
    expect(multiply(1111n, 1111n, 'karatsuba').ops).toBe(9)
    expect(multiply(11111111n, 11111111n, 'karatsuba').ops).toBe(27)
    expect(gradeSchoolOps(1234n, 5678n)).toBe(16)
  })
  it('trace final result matches', () => {
    const t = multiplyTrace(1234n, 5678n, 'karatsuba')
    expect(t[t.length - 1].state.nodes[0].result).toBe((1234n * 5678n).toString())
    const t2 = multiplyTrace(1234n, 5678n, 'mult1')
    expect(t2[t2.length - 1].state.nodes[0].result).toBe((1234n * 5678n).toString())
    expect(t2[t2.length - 1].counters?.['tek basamaklı çarpma']).toBe(16)
  })
})

describe('Master theorem & recurrences', () => {
  it('matches the examples in the Lecture 3 notes', () => {
    const m1 = masterTheorem(4, 2, 1)
    const k = masterTheorem(3, 2, 1)
    const ms = masterTheorem(2, 2, 1)
    const sq = masterTheorem(2, 2, 2)
    expect(m1.ok && m1.case).toBe('leaves')
    expect(m1.ok && m1.bound).toBe('n^{2}')
    expect(k.ok && k.case).toBe('leaves')
    expect(k.ok && Math.abs(k.logba - Math.log2(3))).toBeLessThan(1e-12)
    expect(ms.ok && ms.case).toBe('equal')
    expect(ms.ok && ms.bound).toBe('n \\log n')
    expect(sq.ok && sq.case).toBe('top')
  })
  it('rejects invalid parameters', () => {
    expect(masterTheorem(0, 2, 1).ok).toBe(false)
    expect(masterTheorem(2, 1, 1).ok).toBe(false)
    expect(masterTheorem(2.5, 2, 1).ok).toBe(false)
    expect(masterTheorem(2, 2, -1).ok).toBe(false)
  })
  it('handles the concept-check recurrence T(n) = 3T(n/81) + n^{1/4} (a = b^d)', () => {
    const r = masterTheorem(3, 81, 0.25)
    expect(r.ok && r.case).toBe('equal')
  })
  it('parses and classifies recurrences', () => {
    const a = analyzeRecurrence('T(n) = 2T(n/2) + O(n)')
    expect(a.kind).toBe('master')
    if (a.kind === 'master') expect(a.result.case).toBe('equal')
    expect(analyzeRecurrence('T(n) = 3T(n/2) + 5n').kind).toBe('master')
    expect(analyzeRecurrence('T(n)=T(n/2)+T(n/2)+n^2').kind).toBe('master')
    expect(analyzeRecurrence('T(n) = T(n/5) + T(7n/10) + n').kind).toBe('unsupported')
    expect(analyzeRecurrence('T(n) = T(n-1) + n').kind).toBe('unsupported')
    expect(analyzeRecurrence('T(n) = 2T(n) + n').kind).toBe('error')
    expect(analyzeRecurrence('T(n) = 2T(2n) + n').kind).toBe('error')
    expect(analyzeRecurrence('T(n) = 2T(n/2) + banana').kind).toBe('error')
    expect(analyzeRecurrence('').kind).toBe('error')
    const sq = analyzeRecurrence('T(n) = 4T(n/16) + sqrt(n)')
    expect(sq.kind === 'master' && sq.result.case).toBe('equal')
  })
  it('general version handles log factors and reports the gap case', () => {
    const p = parseRecurrence('T(n) = 2T(n/2) + n log n')
    expect(typeof p).not.toBe('string')
    if (typeof p !== 'string') expect(generalMaster(2, 2, p.work).applies).toBe(false)
    const q = parseRecurrence('T(n) = T(n/2) + n log n')
    if (typeof q !== 'string') {
      const g = generalMaster(1, 2, q.work)
      expect(g.applies && g.caseNo).toBe(3)
    }
    const r = parseRecurrence('T(n) = 8T(n/2) + n^2 log n')
    if (typeof r !== 'string') expect(generalMaster(8, 2, r.work).caseNo).toBe(1)
  })
  it('recursion levels: MergeSort does n work on each of log n + 1 levels', () => {
    const lv = recursionLevels(2, 2, 1, 64)
    expect(lv).toHaveLength(7)
    for (const l of lv) expect(l.total).toBeCloseTo(64)
    const cc = recursionLevels(5, 4, 1, 4 ** 5, 2) // concept check: T(n) = 5T(n/4) + 2n
    expect(cc[4].count).toBe(625)
    expect(cc[3].total).toBeCloseTo((5 / 4) ** 3 * 2 * 4 ** 5)
  })
  it('substitution method: select recurrence gives D = 10c; MergeSort guess fails', () => {
    const sel = substitution([{ k: 1, num: 1, den: 5 }, { k: 1, num: 7, den: 10 }], 1, 3, 1)
    expect(sel.works).toBe(true)
    expect(sel.D!.value()).toBe(30)
    const cc = substitution([{ k: 2, num: 1, den: 2 }, { k: 3, num: 1, den: 3 }], 2, 1, 1) // concept check → 6n^2
    expect(cc.works && cc.D!.value()).toBe(6)
    const ms = substitution([{ k: 2, num: 1, den: 2 }], 1, 1, 1)
    expect(ms.works).toBe(false)
  })
})

describe('Decision trees', () => {
  it.each(['insertion', 'merge', 'quick'] as const)('%s: n! reachable leaves, correct outputs, height ≥ ⌈log2 n!⌉', (algo) => {
    for (const n of [2, 3, 4]) {
      const dt = buildDecisionTree(algo, n)
      expect(dt.leaves).toBe(factorial(n))
      expect(dt.height).toBeGreaterThanOrEqual(Math.ceil(log2Factorial(n)))
      for (const ranks of permutations(n)) {
        const { output } = runWithOracle(algo, ranks)
        expect(output.map((x) => ranks[x])).toEqual([...Array(n).keys()])
      }
    }
  })
  it('insertion sort on 3 items has height 3', () => {
    expect(buildDecisionTree('insertion', 3).height).toBe(3)
  })
})
