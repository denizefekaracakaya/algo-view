import type { Trace, TraceStep } from '../trace/types'

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
      counters: { 'karşılaştırma': comparisons },
    })
  }
  const set = (id: string, patch: Partial<MSNode>) => nodes.set(id, { ...nodes.get(id)!, ...patch })

  if (input.length === 0) {
    trace.push({ state: { nodes: [], merge: null, activeId: null, maxDepth: 0 }, line: 3, explain: 'Boş dizi: n = 0 ≤ 1, hemen döndürülür.' })
    return trace
  }

  const rec = (id: string): number[] => {
    const node = nodes.get(id)!
    const n = node.hi - node.lo
    set(id, { status: 'active' })
    if (n <= 1) {
      set(id, { status: 'base' })
      push({ line: 3, phase: 'Taban durumu', explain: `[${node.values.join(', ')}] dizisinin uzunluğu ${n} ≤ 1: zaten sıralı, olduğu gibi döndürülür.`, vars: { n } }, null, id)
      set(id, { status: 'done' })
      return [...node.values]
    }
    const mid = Math.floor(n / 2)
    set(id, { status: 'split' })
    push(
      {
        line: 4,
        phase: 'Bölme',
        explain: `n = ${n}: dizi A[:${mid}] = [${node.values.slice(0, mid).join(', ')}] ve A[${mid}:] = [${node.values.slice(mid).join(', ')}] olarak ikiye bölünür; önce sol yarı özyinelemeli olarak sıralanır.`,
        vars: { n, 'n//2': mid },
      },
      null,
      id,
    )
    const L = rec(id + 'L')
    push({ line: 5, phase: 'Bölme', explain: `Sol yarı sıralandı: L = [${L.join(', ')}]. Şimdi sağ yarı özyinelemeli olarak sıralanıyor.`, vars: { n } }, null, id)
    const R = rec(id + 'R')
    set(id, { status: 'merging' })
    const mv: MergeView = { nodeId: id, L, R, i: 0, j: 0, S: [] }
    push({ line: 9, phase: 'Birleştirme', explain: `İki sıralı yarı hazır: L = [${L.join(', ')}], R = [${R.join(', ')}]. Merge, her adımda iki listenin önündeki en küçük elemanı S'e ekler.`, vars: { i: 0, j: 0 } }, mv, id)
    for (let k = 0; k < L.length + R.length; k++) {
      const i = mv.i
      const j = mv.j
      let takeL: boolean
      let explain: string
      let predict: TraceStep<MergeSortState>['predict']
      if (j === R.length) {
        takeL = true
        explain = `R tükendi (j = ${j} = len(R)); kalan L[${i}] = ${L[i]} doğrudan S'e eklenir.`
      } else if (i === L.length) {
        takeL = false
        explain = `L tükendi (i = ${i} = len(L)); kalan R[${j}] = ${R[j]} doğrudan S'e eklenir.`
      } else {
        comparisons++
        takeL = L[i] <= R[j]
        explain = takeL
          ? `L[${i}] = ${L[i]} ≤ R[${j}] = ${R[j]}: daha küçük (veya eşit) olan L[${i}] S'e eklenir.`
          : `L[${i}] = ${L[i]} > R[${j}] = ${R[j]}: daha küçük olan R[${j}] S'e eklenir.`
        predict = {
          question: `L[${i}] = ${L[i]} ve R[${j}] = ${R[j]}. S'e sıradaki hangi değer eklenir?`,
          options: [`L[${i}] = ${L[i]}`, `R[${j}] = ${R[j]}`],
          answer: takeL ? 0 : 1,
          why: takeL
            ? `${L[i]} ≤ ${R[j]}; iki liste de sıralı olduğundan kalan elemanların en küçüğü L[${i}].${L[i] === R[j] ? ' Eşitlikte L tercih edilir; bu, sıralamayı kararlı (stable) yapar.' : ''}`
            : `${R[j]} < ${L[i]}; iki liste de sıralı olduğundan kalan elemanların en küçüğü R[${j}].`,
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
      push({ line: takeL ? 12 : 14, phase: 'Birleştirme', explain, vars: { k, i: mv.i, j: mv.j }, predict }, mv, id)
    }
    set(id, { status: 'done', values: [...mv.S] })
    push({ line: 15, phase: 'Birleştirme', explain: `Merge tamamlandı: [${mv.S.join(', ')}] sıralı olarak döndürülür. (Özyineleme değişmezi: MergeSort her zaman sıralı bir dizi döndürür.)` }, null, id)
    return mv.S
  }
  const result = rec('r')
  push({ line: 6, phase: 'Bitti', explain: `Sonuç: [${result.join(', ')}]. Toplam ${comparisons} anahtar karşılaştırması; özyineleme ağacında ${maxDepth + 1} seviye var.` }, null, null)
  return trace
}
