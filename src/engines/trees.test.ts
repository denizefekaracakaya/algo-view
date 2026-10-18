import { describe, expect, it } from 'vitest'
import { makeRng, randomPermutation } from './random'
import { bstFromSequence, bstOperationTrace, bstDelete, searchCost } from './bst'
import { RBTree, rbInsertTrace, rbFromSequence } from './redBlack'
import { checkRedBlack, height, inorder, isBST, isRedBlack, size, toggleColor, blackHeight, type TNode } from './tree'

const sortedUnique = (a: number[]) => [...new Set(a)].sort((x, y) => x - y)

describe('BST', () => {
  it('insert builds a valid BST whose inorder is sorted', () => {
    const rng = makeRng(41)
    for (let t = 0; t < 100; t++) {
      const keys = Array.from({ length: Math.floor(rng() * 30) }, () => Math.floor(rng() * 60))
      const tree = bstFromSequence(keys)
      expect(isBST(tree)).toBe(true)
      expect(inorder(tree)).toEqual(sortedUnique(keys))
    }
  })
  it('traced insert equals plain insert and ignores duplicates', () => {
    const tree = bstFromSequence([5, 3, 7, 1, 4])
    const r = bstOperationTrace(tree, 'insert', 6)
    expect(r.result).toEqual(bstFromSequence([5, 3, 7, 1, 4, 6]))
    const d = bstOperationTrace(tree, 'insert', 3)
    expect(d.result).toEqual(tree)
  })
  it('search returns found or would-be parent (Claim 7 in the notes)', () => {
    const tree = bstFromSequence([4, 2, 6, 1, 3, 5, 8, 7])
    expect(bstOperationTrace(tree, 'search', 5).message).toContain('bulundu')
    expect(bstOperationTrace(tree, 'search', 4.5).message).toContain('(5)')
    // Remark 8: searching 4.5 → 5, but in notes' example search(4) on a tree without 4 could return 2
    expect(searchCost(tree, 7)).toBe(4)
  })
  it('delete keeps BST property for every key in random trees (all three cases)', () => {
    const rng = makeRng(42)
    for (let t = 0; t < 60; t++) {
      const keys = randomPermutation(rng, 1 + Math.floor(rng() * 20))
      let tree: TNode | null = bstFromSequence(keys)
      const order = randomPermutation(rng, keys.length)
      const remaining = new Set(keys)
      for (const k of order) {
        tree = bstDelete(tree, k)
        remaining.delete(k)
        expect(isBST(tree)).toBe(true)
        expect(inorder(tree)).toEqual([...remaining].sort((a, b) => a - b))
      }
      expect(tree).toBeNull()
    }
  })
  it('min / max', () => {
    const tree = bstFromSequence([5, 3, 9, 1, 4, 6])
    expect(bstOperationTrace(tree, 'min', 0).message).toContain('1')
    expect(bstOperationTrace(tree, 'max', 0).message).toContain('9')
  })
  it('sorted insertion order gives height n − 1', () => {
    expect(height(bstFromSequence([1, 2, 3, 4, 5, 6, 7]))).toBe(6)
    expect(height(bstFromSequence([4, 2, 6, 1, 3, 5, 7]))).toBe(2)
  })
})

describe('Red-black tree', () => {
  it('all five properties hold after every insertion (random, sorted and reversed orders)', () => {
    const rng = makeRng(51)
    const orders: number[][] = [
      Array.from({ length: 64 }, (_, i) => i),
      Array.from({ length: 64 }, (_, i) => 64 - i),
      ...Array.from({ length: 60 }, () => randomPermutation(rng, 1 + Math.floor(rng() * 50))),
      Array.from({ length: 40 }, (_, i) => (i % 2 ? 100 - i : i)), // zig-zag
    ]
    for (const keys of orders) {
      const t = new RBTree()
      for (let i = 0; i < keys.length; i++) {
        t.insert(keys[i])
        const s = t.snapshot()
        expect(isRedBlack(s)).toBe(true)
        expect(size(s)).toBe(i + 1)
        expect(height(s)).toBeLessThanOrEqual(2 * Math.log2(i + 2))
      }
      expect(inorder(t.snapshot())).toEqual([...keys].sort((a, b) => a - b))
    }
  })
  it('duplicate insert is rejected', () => {
    const t = new RBTree()
    expect(t.insert(5)).toBe(true)
    expect(t.insert(5)).toBe(false)
  })
  it('traced insert reaches the same tree as the plain insert; every case is exercised', () => {
    const rng = makeRng(52)
    const seen = new Set<number>()
    for (let rep = 0; rep < 30; rep++) {
      const keys = randomPermutation(rng, 25)
      let tree: TNode | null = null
      for (const k of keys) {
        const r = rbInsertTrace(tree, k)
        for (const st of r.trace) if (st.state.caseNo) seen.add(st.state.caseNo)
        tree = r.result
        expect(isRedBlack(tree)).toBe(true)
        // final step's tree is the result
        expect(r.trace[r.trace.length - 1].state.root).toEqual(tree)
      }
      expect(tree).toEqual(rbFromSequence(keys))
    }
    expect([...seen].sort()).toEqual([1, 2, 3])
  })
  it('sequence 1..3 triggers a rotation (Case 3) and gives root 2', () => {
    const r = rbFromSequence([1, 2, 3])!
    expect(r.key).toBe(2)
    expect(r.color).toBe('B')
    expect(r.left!.color).toBe('R')
  })
  it('invariant checker detects each kind of violation', () => {
    const valid = rbFromSequence([10, 5, 15, 3])!
    expect(checkRedBlack(valid).every((p) => p.holds)).toBe(true)
    // red root
    const redRoot = toggleColor(valid, valid.key)
    expect(checkRedBlack(redRoot)[1].holds).toBe(false)
    // red-red: 3 is red child of 5 (black). make 5 red → 5 red with red child 3
    const redRed = toggleColor(valid, 5)
    const res = checkRedBlack(redRed)
    expect(res[3].holds).toBe(false)
    expect(res[3].offenders).toEqual(expect.arrayContaining([5, 3]))
    // black-height: make 15 red → paths through 15 have one fewer black
    const bh = toggleColor(valid, 15)
    expect(checkRedBlack(bh)[4].holds).toBe(false)
  })
  it('notes Example 11: B root with black children where one side is deeper violates property 5', () => {
    const t: TNode = {
      key: 2, color: 'B',
      left: { key: 1, color: 'B', left: null, right: null },
      right: { key: 3, color: 'B', left: null, right: { key: 4, color: 'B', left: null, right: null } },
    }
    expect(checkRedBlack(t)[4].holds).toBe(false)
    const ok: TNode = { ...t, right: { ...t.right!, right: { key: 4, color: 'R', left: null, right: null } } }
    expect(isRedBlack(ok)).toBe(true)
    expect(blackHeight(ok)).toBe(2)
  })
})
