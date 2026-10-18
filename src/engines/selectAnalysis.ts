/** Pure helpers behind the Select analysis figures (pivot comparison, median-of-medians grid, group sizes). */
import { makeRng } from './random'

export type PivotRule = 'bad' | 'median' | 'random'

/**
 * Sizes of the subarrays Select recurses on while searching for rank k among n distinct keys.
 * Only ranks matter, so the simulation works on the interval [lo, hi] of ranks still in play.
 * 'bad' always picks the extreme on the far side of k, so k stays in the larger part.
 */
export function pivotSizes(n: number, k: number, rule: PivotRule, seed = 1): number[] {
  const rng = makeRng(seed)
  const sizes: number[] = []
  let lo = 1
  let hi = n
  while (lo <= hi) {
    const size = hi - lo + 1
    sizes.push(size)
    if (size === 1) break
    const p = rule === 'median' ? lo + Math.floor((size - 1) / 2) : rule === 'random' ? lo + Math.floor(rng() * size) : k - lo < hi - k ? hi : lo
    if (p === k) break
    if (k < p) hi = p - 1
    else lo = p + 1
  }
  return sizes
}

export type MomClass = 'smaller' | 'greater' | 'pivot' | 'unknown'

export interface MomColumn {
  /** Original group index (0-based, in input order). */
  group: number
  /** Group values sorted ascending. */
  values: number[]
  /** Index of the (lower) median inside `values`. */
  medianIdx: number
  classes: MomClass[]
}

export interface MomLayout {
  columns: MomColumn[]
  /** Columns ordered by their median (the order used in the figure). */
  order: number[]
  pivot: number
  certainSmaller: number
  certainGreater: number
  /** Actual partition sizes around the pivot. */
  less: number
  greater: number
  /** The bound 3·(⌈g/2⌉ − 2) from the lemma (at least this many are certainly on each side). */
  lemmaBound: number
}

/** Groups of `size`, each sorted; pivot = lower median of the group medians; certain sides classified. */
export function medianOfMediansLayout(a: readonly number[], size = 5): MomLayout {
  const columns: MomColumn[] = []
  for (let i = 0; i < a.length; i += size) {
    const values = a.slice(i, i + size).sort((x, y) => x - y)
    columns.push({ group: columns.length, values, medianIdx: Math.floor((values.length - 1) / 2), classes: [] })
  }
  const order = columns.map((_, i) => i).sort((x, y) => columns[x].values[columns[x].medianIdx] - columns[y].values[columns[y].medianIdx] || x - y)
  const pivotCol = order[Math.ceil(order.length / 2) - 1]
  const pivot = columns[pivotCol].values[columns[pivotCol].medianIdx]
  let certainSmaller = 0
  let certainGreater = 0
  for (const c of columns) {
    const m = c.values[c.medianIdx]
    c.classes = c.values.map((_, i) => {
      if (c.group === pivotCol) return i === c.medianIdx ? 'pivot' : i < c.medianIdx ? 'smaller' : 'greater'
      if (m < pivot && i <= c.medianIdx) return 'smaller'
      if (m > pivot && i >= c.medianIdx) return 'greater'
      return 'unknown'
    })
    certainSmaller += c.classes.filter((x) => x === 'smaller').length
    certainGreater += c.classes.filter((x) => x === 'greater').length
  }
  const g = columns.length
  return {
    columns,
    order,
    pivot,
    certainSmaller,
    certainGreater,
    less: a.filter((v) => v < pivot).length,
    greater: a.filter((v) => v > pivot).length,
    lemmaBound: Math.max(0, 3 * (Math.ceil(g / 2) - 2)),
  }
}

/** Fractions in the simplified recurrence T(n) ≤ T(n/q) + T(f·n) + n for groups of q (q odd). */
export function groupFractions(q: number): { pivot: number; rest: number } {
  // About (q+1)/(4q)·n elements are certainly on each side of the pivot.
  return { pivot: 1 / q, rest: 1 - (q + 1) / (4 * q) }
}

/** U(n)/n for U(n) = n + U(⌊n/q⌋) + U(⌊f·n⌋), U(n) = 1 for n ≤ 10, with f from groupFractions. */
export function groupRecurrenceRatio(q: number, n: number): number {
  const { rest } = groupFractions(q)
  const memo = new Map<number, number>()
  const U = (m: number): number => {
    if (m <= 10) return 1
    const hit = memo.get(m)
    if (hit !== undefined) return hit
    const v = m + U(Math.floor(m / q)) + U(Math.floor(rest * m + 1e-9))
    memo.set(m, v)
    return v
  }
  return U(n) / n
}

/** Smallest C for which the substitution step C·n/q + C·f·n + n ≤ C·n works: C = 1/(1 − 1/q − f). */
export function substitutionConstant(q: number): number | null {
  const { pivot, rest } = groupFractions(q)
  const s = pivot + rest
  return s >= 1 - 1e-12 ? null : 1 / (1 - s)
}
