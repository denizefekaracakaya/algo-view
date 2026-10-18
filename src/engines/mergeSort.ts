import type { Trace, TraceStep } from '../trace/types'
import { tx } from '../i18n/lang'

/**
 * MergeSort as in the Lecture 2 notes (Python slicing, n/2 = floor). The notes' Merge
 * pseudocode is intentionally incomplete (it does not handle an exhausted list); the
 * version below handles that case and uses `<=` so equal keys keep their order (stable).
 */
export const MERGE_SORT_CODE = [
  'def MergeSort(A):',
  '    n = len(A)',
  '    if n <= 1: return A',
  '    L = MergeSort(A[:n//2])',
  '    R = MergeSort(A[n//2:])',
  '    return Merge(L, R)',
  '',
  'def Merge(L, R):',
  '    S = []; i = 0; j = 0',
  '    for k in range(len(L) + len(R)):',
  '        if j == len(R) or (i < len(L) and L[i] <= R[j]):',
  '            S.append(L[i]); i += 1',
  '        else:',
  '            S.append(R[j]); j += 1',
  '    return S',
]

export function merge(L: readonly number[], R: readonly number[]): number[] {
  const S: number[] = []
  let i = 0
  let j = 0
  for (let k = 0; k < L.length + R.length; k++) {
    if (j === R.length || (i < L.length && L[i] <= R[j])) S.push(L[i++])
    else S.push(R[j++])
  }
  return S
}

export function mergeSort(A: readonly number[]): number[] {
  if (A.length <= 1) return [...A]
  const mid = Math.floor(A.length / 2)
  return merge(mergeSort(A.slice(0, mid)), mergeSort(A.slice(mid)))
}

/** Number of key comparisons L[i] <= R[j] performed (comparisons against an exhausted list are not counted). */
export function mergeSortComparisons(A: readonly number[]): number {
  let count = 0
  const rec = (X: number[]): number[] => {
    if (X.length <= 1) return X
    const mid = Math.floor(X.length / 2)
    const L = rec(X.slice(0, mid))
    const R = rec(X.slice(mid))
    const S: number[] = []
    let i = 0
    let j = 0
    while (i < L.length || j < R.length) {
      if (j === R.length) S.push(L[i++])
      else if (i === L.length) S.push(R[j++])
      else {
        count++
        if (L[i] <= R[j]) S.push(L[i++])
        else S.push(R[j++])
      }
    }
    return S
  }
  rec([...A])
  return count
}

export type MSStatus = 'waiting' | 'active' | 'split' | 'base' | 'merging' | 'done'

export interface MSNode {
  id: string
  lo: number
  hi: number // exclusive
  depth: number
  /** Values currently held by this call (input slice before merge, sorted result after). */
  values: number[]
  status: MSStatus
}

export interface MergeView {
  nodeId: string
  L: number[]
  R: number[]
  i: number
  j: number
  S: number[]
  /** Which side was taken in this step (for highlighting). */
  took?: 'L' | 'R'
}

export interface MergeSortState {
  nodes: MSNode[]
  merge: MergeView | null
  activeId: string | null
  maxDepth: number
}

export function mergeSortTrace(input: readonly number[]): Trace<MergeSortState> {
  const trace: Trace<MergeSortState> = []
  const nodes = new Map<string, MSNode>()
  let comparisons = 0
  let maxDepth = 0
  const order: string[] = []

  // Pre-compute the full recursion tree so every level can be drawn from the start.
  const build = (lo: number, hi: number, depth: number, id: string) => {
    nodes.set(id, { id, lo, hi, depth, values: input.slice(lo, hi), status: 'waiting' })
    order.push(id)
    maxDepth = Math.max(maxDepth, depth)
    if (hi - lo <= 1) return
    const mid = lo + Math.floor((hi - lo) / 2)
    build(lo, mid, depth + 1, id + 'L')
    build(mid, hi, depth + 1, id + 'R')
  }
  if (input.length > 0) build(0, input.length, 0, 'r')

  const snapshot = (): MSNode[] => order.map((id) => ({ ...nodes.get(id)!, values: [...nodes.get(id)!.values] }))
  const push = (step: Omit<TraceStep<MergeSortState>, 'state'>, merge: MergeView | null, activeId: string | null) => {
    trace.push({
      ...step,
      state: { nodes: snapshot(), merge: merge ? { ...merge, L: [...merge.L], R: [...merge.R], S: [...merge.S] } : null, activeId, maxDepth },
      counters: { [tx('karşılaştırma', 'comparisons')]: comparisons },
    })
  }
  const set = (id: string, patch: Partial<MSNode>) => nodes.set(id, { ...nodes.get(id)!, ...patch })

  if (input.length === 0) {
    trace.push({ state: { nodes: [], merge: null, activeId: null, maxDepth: 0 }, line: 3, explain: tx('Boş dizi: n = 0 ≤ 1, hemen döndürülür.', 'Empty array: n = 0 ≤ 1, returned immediately.') })
    return trace
  }

  const rec = (id: string): number[] => {
    const node = nodes.get(id)!
    const n = node.hi - node.lo
    set(id, { status: 'active' })
    if (n <= 1) {
      set(id, { status: 'base' })
      push({ line: 3, phase: tx('Taban durumu', 'Base case'), explain: tx(`[${node.values.join(', ')}] dizisinin uzunluğu ${n} ≤ 1: zaten sıralı, olduğu gibi döndürülür.`, `[${node.values.join(', ')}] has length ${n} ≤ 1: already sorted, returned as is.`), vars: { n } }, null, id)
      set(id, { status: 'done' })
      return [...node.values]
    }
    const mid = Math.floor(n / 2)
    set(id, { status: 'split' })
    push(
      {
        line: 4,
        phase: tx('Bölme', 'Split'),
        explain: tx(`n = ${n}: dizi A[:${mid}] = [${node.values.slice(0, mid).join(', ')}] ve A[${mid}:] = [${node.values.slice(mid).join(', ')}] olarak ikiye bölünür; önce sol yarı özyinelemeli olarak sıralanır.`, `n = ${n}: the array is split into A[:${mid}] = [${node.values.slice(0, mid).join(', ')}] and A[${mid}:] = [${node.values.slice(mid).join(', ')}]; the left half is sorted recursively first.`),
        vars: { n, 'n//2': mid },
      },
      null,
      id,
    )
    const L = rec(id + 'L')
    push({ line: 5, phase: tx('Bölme', 'Split'), explain: tx(`Sol yarı sıralandı: L = [${L.join(', ')}]. Şimdi sağ yarı özyinelemeli olarak sıralanıyor.`, `Left half sorted: L = [${L.join(', ')}]. Now the right half is sorted recursively.`), vars: { n } }, null, id)
    const R = rec(id + 'R')
    set(id, { status: 'merging' })
    const mv: MergeView = { nodeId: id, L, R, i: 0, j: 0, S: [] }
    push({ line: 9, phase: tx('Birleştirme', 'Merge'), explain: tx(`İki sıralı yarı hazır: L = [${L.join(', ')}], R = [${R.join(', ')}]. Merge, her adımda iki listenin önündeki en küçük elemanı S'e ekler.`, `Both sorted halves are ready: L = [${L.join(', ')}], R = [${R.join(', ')}]. At each step Merge appends the smaller of the two front elements to S.`), vars: { i: 0, j: 0 } }, mv, id)
    for (let k = 0; k < L.length + R.length; k++) {
      const i = mv.i
      const j = mv.j
      let takeL: boolean
      let explain: string
      let predict: TraceStep<MergeSortState>['predict']
      if (j === R.length) {
        takeL = true
        explain = tx(`R tükendi (j = ${j} = len(R)); kalan L[${i}] = ${L[i]} doğrudan S'e eklenir.`, `R is exhausted (j = ${j} = len(R)); the remaining L[${i}] = ${L[i]} is appended to S directly.`)
      } else if (i === L.length) {
        takeL = false
        explain = tx(`L tükendi (i = ${i} = len(L)); kalan R[${j}] = ${R[j]} doğrudan S'e eklenir.`, `L is exhausted (i = ${i} = len(L)); the remaining R[${j}] = ${R[j]} is appended to S directly.`)
      } else {
        comparisons++
        takeL = L[i] <= R[j]
        explain = takeL
          ? tx(`L[${i}] = ${L[i]} ≤ R[${j}] = ${R[j]}: daha küçük (veya eşit) olan L[${i}] S'e eklenir.`, `L[${i}] = ${L[i]} ≤ R[${j}] = ${R[j]}: the smaller (or equal) L[${i}] is appended to S.`)
          : tx(`L[${i}] = ${L[i]} > R[${j}] = ${R[j]}: daha küçük olan R[${j}] S'e eklenir.`, `L[${i}] = ${L[i]} > R[${j}] = ${R[j]}: the smaller R[${j}] is appended to S.`)
        predict = {
          question: tx(`L[${i}] = ${L[i]} ve R[${j}] = ${R[j]}. S'e sıradaki hangi değer eklenir?`, `L[${i}] = ${L[i]} and R[${j}] = ${R[j]}. Which value is appended to S next?`),
          options: [`L[${i}] = ${L[i]}`, `R[${j}] = ${R[j]}`],
          answer: takeL ? 0 : 1,
          why: takeL
            ? tx(`${L[i]} ≤ ${R[j]}; iki liste de sıralı olduğundan kalan elemanların en küçüğü L[${i}].${L[i] === R[j] ? ' Eşitlikte L tercih edilir; bu, sıralamayı kararlı (stable) yapar.' : ''}`, `${L[i]} ≤ ${R[j]}; since both lists are sorted, the smallest remaining element is L[${i}].${L[i] === R[j] ? ' On ties L is preferred; this makes the sort stable.' : ''}`)
            : tx(`${R[j]} < ${L[i]}; iki liste de sıralı olduğundan kalan elemanların en küçüğü R[${j}].`, `${R[j]} < ${L[i]}; since both lists are sorted, the smallest remaining element is R[${j}].`),
        }
      }
      if (takeL) {
        mv.S.push(L[mv.i])
        mv.i++
      } else {
        mv.S.push(R[mv.j])
        mv.j++
      }
      mv.took = takeL ? 'L' : 'R'
      push({ line: takeL ? 12 : 14, phase: tx('Birleştirme', 'Merge'), explain, vars: { k, i: mv.i, j: mv.j }, predict }, mv, id)
    }
    set(id, { status: 'done', values: [...mv.S] })
    push({ line: 15, phase: tx('Birleştirme', 'Merge'), explain: tx(`Merge tamamlandı: [${mv.S.join(', ')}] sıralı olarak döndürülür. (Özyineleme değişmezi: MergeSort her zaman sıralı bir dizi döndürür.)`, `Merge finished: [${mv.S.join(', ')}] is returned sorted. (Recursion invariant: MergeSort always returns a sorted array.)`) }, null, id)
    return mv.S
  }
  const result = rec('r')
  push({ line: 6, phase: tx('Bitti', 'Done'), explain: tx(`Sonuç: [${result.join(', ')}]. Toplam ${comparisons} anahtar karşılaştırması; özyineleme ağacında ${maxDepth + 1} seviye var.`, `Result: [${result.join(', ')}]. ${comparisons} key comparisons in total; the recursion tree has ${maxDepth + 1} levels.`) }, null, null)
  return trace
}
