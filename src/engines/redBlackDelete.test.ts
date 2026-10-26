import { describe, expect, it } from 'vitest'
import { rbFromSequence } from './redBlack'
import { rbDelete, rbDeleteTrace } from './redBlackDelete'
import { inorder, isRedBlack } from './tree'
import { makeRng, randomPermutation } from './random'

describe('red-black deletion', () => {
  it('keeps every red-black property for random insert/delete sequences', () => {
    for (let seed = 1; seed <= 150; seed++) {
      const rng = makeRng(seed)
      const keys = randomPermutation(rng, 25)
      let t = rbFromSequence(keys)
      const alive = new Set(keys)
      for (const k of randomPermutation(rng, 25)) {
        const r = rbDeleteTrace(t, k)
        expect(r.deleted).toBe(true)
        expect(r.result).toEqual(rbDelete(t, k))
        t = r.result
        alive.delete(k)
        expect(isRedBlack(t), `seed ${seed} after deleting ${k}`).toBe(true)
        expect(inorder(t)).toEqual([...alive].sort((a, b) => a - b))
        // The last snapshot of the trace is the final tree.
        expect(r.trace.at(-1)!.state.root).toEqual(t)
      }
      expect(t).toBeNull()
    }
  })

  it('reaches all four fix-up cases and leaves the tree unchanged for a missing key', () => {
    const seen = new Set<number>()
    for (let seed = 1; seed <= 60; seed++) {
      const rng = makeRng(seed)
      let t = rbFromSequence(randomPermutation(rng, 20))
      for (const k of randomPermutation(rng, 20)) {
        const r = rbDeleteTrace(t, k)
        for (const s of r.trace) if (s.state.caseNo) seen.add(s.state.caseNo)
        t = r.result
      }
    }
    expect([...seen].sort()).toEqual([1, 2, 3, 4])
    const start = rbFromSequence([1, 2, 3])
    const miss = rbDeleteTrace(start, 9)
    expect(miss.deleted).toBe(false)
    expect(miss.result).toEqual(start)
  })

  it('deleting a red leaf needs no fix-up', () => {
    // 10,5,15,3,7,1 → 1 is a red leaf.
    const r = rbDeleteTrace(rbFromSequence([10, 5, 15, 3, 7, 1]), 1)
    expect(r.trace.some((s) => s.state.caseNo !== null)).toBe(false)
    expect(isRedBlack(r.result)).toBe(true)
  })
})
