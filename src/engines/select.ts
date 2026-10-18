import type { Trace, TraceStep } from '../trace/types'
import { makeRng, randInt, type Rng } from './random'

/**
 * Select(A, k) from the Lecture 4 notes: k is 1-based (k ∈ {1,…,n}), returns the k-th smallest.
 * The notes assume distinct elements; to stay correct with duplicates we also form
 * A= = {elements equal to p}, which reduces to the notes' version when keys are distinct.
 */
export type PivotStrategy = 'first' | 'random' | 'mom'

export const SELECT_CODE = [
  'Select(A, n, k):',
  '    if n == 1: return A[1]',
  '    p = ChoosePivot(A, n)',
  '    A< = {A[i] | A[i] < p};  A= = {A[i] | A[i] == p};  A> = {A[i] | A[i] > p}',
  '    if |A<| >= k:            return Select(A<, |A<|, k)',
  '    else if |A<| + |A=| >= k: return p',
  '    else:                    return Select(A>, |A>|, k − |A<| − |A=|)',
]

export const CHOOSE_PIVOT_MOM_CODE = [
  'ChoosePivot(A, n):          # median of medians',
  '    split A into g = ⌈n/5⌉ groups p_1..p_g (of ≤ 5 elements)',
  '    for i = 1..g: p_i = MergeSort(p_i)',
  '    C = {median of p_i | i = 1..g}',
  '    p = Select(C, g, ⌈g/2⌉)',
  '    return p',
]

interface Item {
  id: number // original index
  v: number
}

/** Median of medians pivot (lower median for an even-sized remainder group). */
function momPivot(items: Item[], rng: Rng): { pivot: Item; groups: Item[][]; medians: Item[] } {
  const groups: Item[][] = []
  for (let i = 0; i < items.length; i += 5) groups.push(items.slice(i, i + 5).sort((x, y) => x.v - y.v || x.id - y.id))
  const medians = groups.map((g) => g[Math.floor((g.length - 1) / 2)])
  const kth = Math.ceil(medians.length / 2)
  const pivotValue = selectItems(medians, kth, 'mom', rng)
  const pivot = medians.find((m) => m.v === pivotValue)!
  return { pivot, groups, medians }
}

function choosePivot(items: Item[], strategy: PivotStrategy, rng: Rng): Item {
  if (strategy === 'first') return items[0]
  if (strategy === 'random') return items[randInt(rng, 0, items.length - 1)]
  return momPivot(items, rng).pivot
}

function selectItems(items: Item[], k: number, strategy: PivotStrategy, rng: Rng): number {
  if (items.length === 1) return items[0].v
  const p = choosePivot(items, strategy, rng)
  const less = items.filter((x) => x.v < p.v)
  const equal = items.filter((x) => x.v === p.v)
  const greater = items.filter((x) => x.v > p.v)
  if (less.length >= k) return selectItems(less, k, strategy, rng)
  if (less.length + equal.length >= k) return p.v
  return selectItems(greater, k - less.length - equal.length, strategy, rng)
}

export function validateK(n: number, k: number): string | null {
  if (n === 0) return 'Dizi boş; seçilecek eleman yok.'
  if (!Number.isInteger(k)) return 'k bir tam sayı olmalı.'
  if (k < 1 || k > n) return `k, 1 ile n = ${n} arasında olmalı (1 tabanlı sıra: k = 1 en küçük eleman).`
  return null
}

export function select(A: readonly number[], k: number, strategy: PivotStrategy = 'mom', seed = 1): number {
  const err = validateK(A.length, k)
  if (err) throw new RangeError(err)
  return selectItems(
    A.map((v, id) => ({ id, v })),
    k,
    strategy,
    makeRng(seed),
  )
}

export type SelectRole = 'candidate' | 'eliminated' | 'pivot' | 'less' | 'equal' | 'greater' | 'found'

export interface SelectState {
  values: number[]
  roles: SelectRole[]
  k: number
  depth: number
  /** Ids (original indices) in the current subproblem, in subproblem order. */
  current: number[]
  pivotId: number | null
  groups: number[][] | null
  medianIds: number[] | null
  result: number | null
  sizes: { less: number; equal: number; greater: number } | null
}

export function selectTrace(A: readonly number[], kIn: number, strategy: PivotStrategy, seed = 1): Trace<SelectState> {
  const rng = makeRng(seed)
  const trace: Trace<SelectState> = []
  const n = A.length
  const roles: SelectRole[] = A.map(() => 'candidate')
  let comparisons = 0
  let calls = 0
  const push = (
    s: Partial<SelectState> & { k: number; depth: number; current: number[] },
    step: Omit<TraceStep<SelectState>, 'state' | 'counters'>,
  ) =>
    trace.push({
      ...step,
      state: {
        values: [...A],
        roles: [...roles],
        pivotId: null,
        groups: null,
        medianIds: null,
        result: null,
        sizes: null,
        ...s,
        current: [...s.current],
      },
      counters: { 'karşılaştırma (pivotla)': comparisons, 'Select çağrısı': calls },
    })

  let items: Item[] = A.map((v, id) => ({ id, v }))
  let k = kIn
  let depth = 0
  for (;;) {
    calls++
    const ids = items.map((x) => x.id)
    push(
      { k, depth, current: ids },
      {
        line: 1,
        explain:
          depth === 0
            ? `Select(A, n = ${items.length}, k = ${k}): ${k}. en küçük elemanı arıyoruz. Tüm elemanlar aday.`
            : `Özyinelemeli çağrı: Select(n = ${items.length}, k = ${k}). Aday bölge [${items.map((x) => x.v).join(', ')}].`,
        vars: { n: items.length, k, derinlik: depth },
      },
    )
    if (items.length === 1) {
      roles[items[0].id] = 'found'
      push({ k, depth, current: ids, result: items[0].v }, { line: 2, explain: `n = 1: tek aday ${items[0].v}. k = 1 olmak zorunda olduğundan cevap budur.`, vars: { sonuç: items[0].v } })
      break
    }
    let pivot: Item
    let groups: number[][] | null = null
    let medianIds: number[] | null = null
    if (strategy === 'mom') {
      const r = momPivot(items, rng)
      pivot = r.pivot
      groups = r.groups.map((g) => g.map((x) => x.id))
      medianIds = r.medians.map((x) => x.id)
      push(
        { k, depth, current: ids, groups, medianIds },
        {
          line: 3,
          phase: 'ChoosePivot',
          explain: `Medyanların medyanı: ${items.length} aday ${groups.length} gruba (en fazla 5'li) ayrıldı ve her grup sıralandı. Grup medyanları C = [${r.medians.map((x) => x.v).join(', ')}].`,
          vars: { g: groups.length },
        },
      )
      push(
        { k, depth, current: ids, groups, medianIds, pivotId: pivot.id },
        {
          line: 3,
          phase: 'ChoosePivot',
          explain: `p = Select(C, ${medianIds.length}, ${Math.ceil(medianIds.length / 2)}) = ${pivot.v} (bu iç özyinelemeli çağrı burada tek adımda gösteriliyor). Lemma: |A<| ve |A>| en fazla 7n/10 + 5 olur.`,
          vars: { p: pivot.v },
        },
      )
    } else {
      pivot = choosePivot(items, strategy, rng)
      push(
        { k, depth, current: ids, pivotId: pivot.id },
        {
          line: 3,
          phase: 'ChoosePivot',
          explain:
            strategy === 'first'
              ? `Pivot olarak aday bölgenin ilk elemanı seçildi: p = ${pivot.v}. (Rastgele değil; en kötü durumda Θ(n²) sürer.)`
              : `Pivot, adaylar arasından düzgün (uniform) rastgele seçildi: p = ${pivot.v}.`,
          vars: { p: pivot.v },
        },
      )
    }
    const less = items.filter((x) => x.v < pivot.v)
    const equal = items.filter((x) => x.v === pivot.v)
    const greater = items.filter((x) => x.v > pivot.v)
    comparisons += items.length - 1
    for (const x of less) roles[x.id] = 'less'
    for (const x of greater) roles[x.id] = 'greater'
    for (const x of equal) roles[x.id] = 'equal'
    roles[pivot.id] = 'pivot'
    const sizes = { less: less.length, equal: equal.length, greater: greater.length }
    const where = less.length >= k ? 0 : less.length + equal.length >= k ? 1 : 2
    push(
      { k, depth, current: ids, pivotId: pivot.id, sizes },
      {
        line: 4,
        phase: 'Bölümleme',
        explain: `Her aday p = ${pivot.v} ile karşılaştırıldı (${items.length - 1} karşılaştırma): |A<| = ${less.length}, |A=| = ${equal.length}${equal.length > 1 ? ' (tekrarlı değerler)' : ''}, |A>| = ${greater.length}.`,
        vars: { p: pivot.v, '|A<|': less.length, '|A=|': equal.length, '|A>|': greater.length, k },
        predict: {
          question: `|A<| = ${less.length}, |A=| = ${equal.length}, |A>| = ${greater.length} ve k = ${k}. Algoritma şimdi ne yapar?`,
          options: ['A< içinde k ile özyinele', 'p\'yi döndür', `A> içinde k − |A<| − |A=| ile özyinele`],
          answer: where,
          why:
            where === 0
              ? `${less.length} ≥ k = ${k}: p'den küçük en az k eleman var, aranan eleman A< içinde.`
              : where === 1
                ? `|A<| = ${less.length} < k ≤ |A<| + |A=| = ${less.length + equal.length}: aranan sıra p'nin kopyalarından birine düşüyor.`
                : `|A<| + |A=| = ${less.length + equal.length} < k = ${k}: aranan eleman p'den büyük; A> içinde sırası k − ${less.length + equal.length} = ${k - less.length - equal.length} olur.`,
        },
      },
    )
    if (where === 1) {
      for (const x of [...less, ...greater]) roles[x.id] = 'eliminated'
      for (const x of equal) roles[x.id] = 'eliminated'
      roles[pivot.id] = 'found'
      push(
        { k, depth, current: ids, pivotId: pivot.id, sizes, result: pivot.v },
        { line: 6, explain: `|A<| = ${less.length} < k = ${k} ≤ |A<| + |A=| = ${less.length + equal.length}: tam olarak k − 1'den az eleman p'den küçük, p'nin kopyaları k. sırayı kapsıyor. Cevap p = ${pivot.v}.`, vars: { sonuç: pivot.v } },
      )
      break
    }
    if (where === 0) {
      for (const x of [...equal, ...greater]) roles[x.id] = 'eliminated'
      for (const x of less) roles[x.id] = 'candidate'
      push(
        { k, depth, current: less.map((x) => x.id), sizes },
        { line: 5, explain: `|A<| = ${less.length} ≥ k = ${k}: en küçük k eleman tamamen A< içinde. p dahil p'ye eşit ya da p'den büyük ${equal.length + greater.length} eleman elendi; k değişmez.`, vars: { k } },
      )
      items = less
    } else {
      const newK = k - less.length - equal.length
      for (const x of [...less, ...equal]) roles[x.id] = 'eliminated'
      for (const x of greater) roles[x.id] = 'candidate'
      push(
        { k: newK, depth, current: greater.map((x) => x.id), sizes },
        {
          line: 7,
          explain: `|A<| + |A=| = ${less.length + equal.length} < k = ${k}: aranan eleman A> içinde. Elenen ${less.length + equal.length} eleman, aranandan küçük olduğu için yeni sıra k' = ${k} − ${less.length + equal.length} = ${newK}.`,
          vars: { "k'": newK },
        },
      )
      k = newK
      items = greater
    }
    depth++
  }
  push(
    { k, depth, current: [], result: trace[trace.length - 1].state.result },
    { line: 1, explain: `Sonuç: A'nın ${kIn}. en küçük elemanı ${trace[trace.length - 1].state.result}. (Kontrol: sıralı dizide ${kIn}. eleman ${[...A].sort((x, y) => x - y)[kIn - 1]}.) Toplam ${comparisons} pivot karşılaştırması, ${calls} Select çağrısı (n = ${n}).` },
  )
  return trace
}
