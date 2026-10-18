import type { Trace, TraceStep } from '../trace/types'
import { makeRng, randInt, type Rng } from './random'
import { tx } from '../i18n/lang'

/**
 * In-place QuickSort as sketched in the Lecture 5 slides: choose a pivot, swap it to the end,
 * then partition (Lomuto scheme) so that A[lo..i-1] < pivot ≤ A[i+1..hi].
 */
export type QSPivot = 'last' | 'first' | 'random' | 'median'

export const QUICKSORT_CODE = [
  'QuickSort(A, lo, hi):',
  '    if hi − lo + 1 <= 1: return',
  '    p = ChoosePivot(A, lo, hi); swap A[p], A[hi]',
  '    i = lo',
  '    for j = lo .. hi − 1:',
  '        if A[j] < A[hi]:',
  '            swap A[i], A[j]; i += 1',
  '    swap A[i], A[hi]        # pivot reaches its final position',
  '    QuickSort(A, lo, i − 1)',
  '    QuickSort(A, i + 1, hi)',
]

function pickPivot(A: number[], lo: number, hi: number, strategy: QSPivot, rng: Rng): number {
  switch (strategy) {
    case 'last':
      return hi
    case 'first':
      return lo
    case 'random':
      return randInt(rng, lo, hi)
    case 'median': {
      const idx = Array.from({ length: hi - lo + 1 }, (_, t) => lo + t).sort((x, y) => A[x] - A[y] || x - y)
      return idx[Math.floor((idx.length - 1) / 2)]
    }
  }
}

/** Fast version: returns the sorted array and the number of comparisons A[j] < pivot. */
export function quickSort(input: readonly number[], strategy: QSPivot = 'random', seed = 1): { sorted: number[]; comparisons: number } {
  const A = [...input]
  const rng = makeRng(seed)
  let comparisons = 0
  // Explicit stack instead of recursion so adversarial inputs cannot overflow the call stack.
  const stack: [number, number][] = [[0, A.length - 1]]
  while (stack.length) {
    const [lo, hi] = stack.pop()!
    if (hi - lo + 1 <= 1) continue
    const p = pickPivot(A, lo, hi, strategy, rng)
    ;[A[p], A[hi]] = [A[hi], A[p]]
    let i = lo
    for (let j = lo; j < hi; j++) {
      comparisons++
      if (A[j] < A[hi]) {
        ;[A[i], A[j]] = [A[j], A[i]]
        i++
      }
    }
    ;[A[i], A[hi]] = [A[hi], A[i]]
    stack.push([i + 1, hi], [lo, i - 1])
  }
  return { sorted: A, comparisons }
}

/** Exact expected number of comparisons of randomized QuickSort on n distinct keys: 2(n+1)H_n − 4n. */
export function expectedComparisons(n: number): number {
  if (n <= 1) return 0
  let H = 0
  for (let k = 1; k <= n; k++) H += 1 / k
  return 2 * (n + 1) * H - 4 * n
}

export interface QSCall {
  id: number
  parent: number | null
  lo: number
  hi: number
  depth: number
  pivotValue: number | null
}

export interface QuickSortState {
  a: number[]
  lo: number | null
  hi: number | null
  i: number | null
  j: number | null
  /** Index currently holding the pivot. */
  pivotAt: number | null
  /** Indices whose element is in its final sorted position. */
  fixed: boolean[]
  calls: QSCall[]
  activeCall: number | null
  /** Ranges still waiting on the (conceptual) call stack, innermost last. */
  pending: [number, number][]
  swapped: [number, number] | null
}

export function quickSortTrace(input: readonly number[], strategy: QSPivot, seed = 1): Trace<QuickSortState> {
  const A = [...input]
  const rng = makeRng(seed)
  const trace: Trace<QuickSortState> = []
  const fixed = A.map(() => false)
  const calls: QSCall[] = []
  let comparisons = 0
  let swaps = 0
  const pending: [number, number][] = []

  const push = (s: Partial<QuickSortState>, step: Omit<TraceStep<QuickSortState>, 'state' | 'counters'>) =>
    trace.push({
      ...step,
      state: {
        a: [...A],
        lo: null,
        hi: null,
        i: null,
        j: null,
        pivotAt: null,
        activeCall: null,
        swapped: null,
        ...s,
        fixed: [...fixed],
        calls: calls.map((c) => ({ ...c })),
        pending: pending.map((r) => [r[0], r[1]] as [number, number]),
      },
      counters: { [tx('karşılaştırma', 'comparisons')]: comparisons, [tx('takas', 'swaps')]: swaps },
    })

  const strategyText: Record<QSPivot, string> = {
    last: tx('son eleman (deterministik)', 'last element (deterministic)'),
    first: tx('ilk eleman (deterministik)', 'first element (deterministic)'),
    random: tx('düzgün rastgele bir eleman', 'a uniformly random element'),
    median: tx('alt dizinin medyanı (ideal pivot; Select ile O(n) sürede bulunabilir)', 'the median of the subarray (ideal pivot; Select can find it in O(n))'),
  }

  push({}, { line: 1, explain: tx(`QuickSort(A, 0, ${A.length - 1}) çağrılıyor. Pivot kuralı: ${strategyText[strategy]}.`, `Calling QuickSort(A, 0, ${A.length - 1}). Pivot rule: ${strategyText[strategy]}.`) })

  const rec = (lo: number, hi: number, parent: number | null, depth: number) => {
    const size = hi - lo + 1
    if (size <= 0) return
    const call: QSCall = { id: calls.length, parent, lo, hi, depth, pivotValue: null }
    calls.push(call)
    if (size === 1) {
      fixed[lo] = true
      call.pivotValue = A[lo]
      push({ lo, hi, activeCall: call.id }, { line: 2, explain: tx(`QuickSort(A, ${lo}, ${hi}): tek eleman (${A[lo]}); zaten sıralı, son konumunda.`, `QuickSort(A, ${lo}, ${hi}): a single element (${A[lo]}); already sorted, in its final position.`) })
      return
    }
    const p = pickPivot(A, lo, hi, strategy, rng)
    const pv = A[p]
    call.pivotValue = pv
    push(
      { lo, hi, pivotAt: p, activeCall: call.id },
      { line: 3, phase: tx('Pivot seçimi', 'Pivot choice'), explain: `QuickSort(A, ${lo}, ${hi}): pivot = A[${p}] = ${pv} (${strategyText[strategy]}).`, vars: { lo, hi, pivot: pv } },
    )
    if (p !== hi) {
      ;[A[p], A[hi]] = [A[hi], A[p]]
      swaps++
      push({ lo, hi, pivotAt: hi, activeCall: call.id, swapped: [p, hi] }, { line: 3, phase: tx('Pivot seçimi', 'Pivot choice'), explain: tx(`Pivot ${pv}, A[${hi}] ile takas edilerek alt dizinin sonuna taşındı.`, `Pivot ${pv} was swapped with A[${hi}], moving it to the end of the subarray.`), vars: { lo, hi, pivot: pv } })
    }
    let i = lo
    push({ lo, hi, i, pivotAt: hi, activeCall: call.id }, { line: 4, phase: tx('Bölümleme', 'Partition'), explain: tx(`i = ${lo}. Değişmez: A[${lo}..i−1] < pivot ≤ A[i..j−1].`, `i = ${lo}. Invariant: A[${lo}..i−1] < pivot ≤ A[i..j−1].`), vars: { i, pivot: pv } })
    for (let j = lo; j < hi; j++) {
      comparisons++
      const less = A[j] < pv
      const step: Omit<TraceStep<QuickSortState>, 'state' | 'counters'> = {
        line: 6,
        phase: tx('Bölümleme', 'Partition'),
        explain: less ? tx(`A[${j}] = ${A[j]} < pivot = ${pv}: sol bölgeye (A<) ait.`, `A[${j}] = ${A[j]} < pivot = ${pv}: belongs to the left region (A<).`) : tx(`A[${j}] = ${A[j]} ≥ pivot = ${pv}: sağ bölgede kalır.`, `A[${j}] = ${A[j]} ≥ pivot = ${pv}: stays in the right region.`),
        vars: { i, j, pivot: pv },
        predict: {
          question: tx(`A[${j}] = ${A[j]}, pivot = ${pv}. Bu eleman hangi bölgeye gider?`, `A[${j}] = ${A[j]}, pivot = ${pv}. Which region does this element go to?`),
          options: [tx('Sol bölge (pivot\'tan küçük)', 'Left region (less than pivot)'), tx('Sağ bölge (pivot\'tan büyük veya eşit)', 'Right region (greater than or equal to pivot)')],
          answer: less ? 0 : 1,
          why: less ? tx(`${A[j]} < ${pv}, bu yüzden A[i] ile takas edilip i bir artırılır.`, `${A[j]} < ${pv}, so it is swapped with A[i] and i is incremented.`) : tx(`${A[j]} ≥ ${pv}; hiçbir şey taşınmaz, j ilerler.`, `${A[j]} ≥ ${pv}; nothing moves, j advances.`),
        },
      }
      push({ lo, hi, i, j, pivotAt: hi, activeCall: call.id }, step)
      if (less) {
        if (i !== j) {
          ;[A[i], A[j]] = [A[j], A[i]]
          swaps++
        }
        i++
        push(
          { lo, hi, i, j, pivotAt: hi, activeCall: call.id, swapped: [i - 1, j] },
          { line: 7, phase: tx('Bölümleme', 'Partition'), explain: i - 1 !== j ? tx(`A[${i - 1}] ↔ A[${j}] takas edildi; i = ${i}.`, `Swapped A[${i - 1}] ↔ A[${j}]; i = ${i}.`) : tx(`i = j olduğundan takas gerekmez; i = ${i}.`, `Since i = j no swap is needed; i = ${i}.`), vars: { i, j, pivot: pv } },
        )
      }
    }
    if (i !== hi) {
      ;[A[i], A[hi]] = [A[hi], A[i]]
      swaps++
    }
    fixed[i] = true
    push(
      { lo, hi, i, pivotAt: i, activeCall: call.id, swapped: i !== hi ? [i, hi] : null },
      {
        line: 8,
        phase: tx('Bölümleme', 'Partition'),
        explain: tx(`Pivot ${pv} indeks ${i}'ye yerleşti: solundaki ${i - lo} eleman daha küçük, sağındaki ${hi - i} eleman büyük veya eşit. Pivot artık son konumunda ve bir daha hareket etmeyecek.`, `Pivot ${pv} settled at index ${i}: the ${i - lo} elements to its left are smaller, the ${hi - i} to its right are greater or equal. The pivot is now in its final position and will never move again.`),
        vars: { i, pivot: pv, '|A<|': i - lo, '|A>|': hi - i },
      },
    )
    pending.push([i + 1, hi])
    if (i - 1 >= lo) push({ lo, hi: i - 1, activeCall: call.id }, { line: 9, explain: tx(`Sol parça A[${lo}..${i - 1}] özyinelemeli olarak sıralanacak.`, `The left part A[${lo}..${i - 1}] will be sorted recursively.`) })
    rec(lo, i - 1, call.id, depth + 1)
    pending.pop()
    if (i + 1 <= hi) push({ lo: i + 1, hi, activeCall: call.id }, { line: 10, explain: tx(`Sağ parça A[${i + 1}..${hi}] özyinelemeli olarak sıralanacak.`, `The right part A[${i + 1}..${hi}] will be sorted recursively.`) })
    rec(i + 1, hi, call.id, depth + 1)
  }
  rec(0, A.length - 1, null, 0)
  const height = calls.reduce((m, c) => Math.max(m, c.depth), 0)
  push({}, { line: 1, phase: tx('Bitti', 'Done'), explain: tx(`Sıralandı: [${A.join(', ')}]. ${comparisons} karşılaştırma, ${swaps} takas, özyineleme derinliği ${A.length ? height + 1 : 0} seviye.`, `Sorted: [${A.join(', ')}]. ${comparisons} comparisons, ${swaps} swaps, recursion depth ${A.length ? height + 1 : 0} levels.`) })
  return trace
}
