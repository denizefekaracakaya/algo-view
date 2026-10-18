import type { Trace } from '../trace/types'

/** Pseudocode follows the Python version in the Lecture 2 notes. */
export const INSERTION_SORT_CODE = [
  'def InsertionSort(A):',
  '    for i in range(1, len(A)):',
  '        current = A[i]',
  '        j = i - 1',
  '        while j >= 0 and A[j] > current:',
  '            A[j+1] = A[j]',
  '            j -= 1',
  '        A[j+1] = current',
]

export function insertionSort(input: readonly number[]): number[] {
  const A = [...input]
  for (let i = 1; i < A.length; i++) {
    const current = A[i]
    let j = i - 1
    while (j >= 0 && A[j] > current) {
      A[j + 1] = A[j]
      j--
    }
    A[j + 1] = current
  }
  return A
}

/** Counts comparisons A[j] > current exactly as the pseudocode performs them. */
export function insertionSortComparisons(input: readonly number[]): number {
  const A = [...input]
  let comparisons = 0
  for (let i = 1; i < A.length; i++) {
    const current = A[i]
    let j = i - 1
    while (j >= 0) {
      comparisons++
      if (!(A[j] > current)) break
      A[j + 1] = A[j]
      j--
    }
    A[j + 1] = current
  }
  return comparisons
}

export interface InsertionState {
  /** Array contents; the cell at `hole` holds a stale value and is drawn as empty. */
  a: number[]
  i: number | null
  j: number | null
  current: number | null
  hole: number | null
  /** Indices currently being compared (A[j] vs current). */
  compare: number | null
  /** Prefix A[0..sortedEnd] is sorted (loop invariant). */
  sortedEnd: number
  done: boolean
}

export function insertionSortTrace(input: readonly number[]): Trace<InsertionState> {
  const A = [...input]
  const trace: Trace<InsertionState> = []
  let comparisons = 0
  let shifts = 0
  const push = (
    s: Partial<InsertionState>,
    line: number,
    explain: string,
    extra: { vars?: Record<string, number | string>; predict?: Trace<InsertionState>[number]['predict'] } = {},
  ) => {
    trace.push({
      state: {
        a: [...A],
        i: null,
        j: null,
        current: null,
        hole: null,
        compare: null,
        sortedEnd: 0,
        done: false,
        ...s,
      },
      line,
      explain,
      vars: extra.vars,
      predict: extra.predict,
      counters: { 'karşılaştırma': comparisons, 'kaydırma': shifts },
    })
  }

  push(
    { sortedEnd: A.length === 0 ? -1 : 0 },
    1,
    A.length <= 1
      ? 'Dizide en fazla bir eleman var; böyle bir dizi zaten sıralıdır.'
      : 'Başlangıç: tek elemanlı A[:1] öneki zaten sıralıdır. Döngü değişmezi (loop invariant) i = 0 için sağlanıyor.',
  )

  for (let i = 1; i < A.length; i++) {
    const current = A[i]
    // Where will current end up? Count how many of A[0..i-1] are > current.
    let finalPos = i
    while (finalPos > 0 && A[finalPos - 1] > current) finalPos--
    const optionSet = new Set<number>([finalPos])
    for (const cand of [i, 0, Math.max(0, finalPos - 1), Math.min(i, finalPos + 1), Math.floor(i / 2)]) {
      if (optionSet.size >= 4) break
      optionSet.add(cand)
    }
    const options = [...optionSet].sort((x, y) => x - y)
    push({ i, hole: i, current, sortedEnd: i - 1 }, 3, `i = ${i}: current = A[${i}] = ${current} değerini elimize alıyoruz. A[:${i}] sıralı; current'ı bu önek içinde doğru yere yerleştireceğiz.`, {
      vars: { i, current },
      predict: {
        question: `current = ${current} bu turun sonunda hangi indekse yerleşecek?`,
        options: options.map((o) => `indeks ${o}`),
        answer: options.indexOf(finalPos),
        why: `A[:${i}] içinde ${current}'dan büyük ${i - finalPos} eleman var; her biri bir sağa kayar, böylece current indeks ${finalPos}'e yerleşir.`,
      },
    })
    let j = i - 1
    push({ i, j, hole: i, current, sortedEnd: i - 1 }, 4, `j = i − 1 = ${j}. Soldaki komşudan başlayarak geriye doğru tarayacağız.`, { vars: { i, j, current } })
    while (j >= 0) {
      comparisons++
      const greater = A[j] > current
      push(
        { i, j, hole: j + 1, current, compare: j, sortedEnd: i - 1 },
        5,
        greater
          ? `A[${j}] = ${A[j]} > current = ${current}: ${A[j]} sağa kaydırılmalı.`
          : `A[${j}] = ${A[j]} ≤ current = ${current}: daha sola gitmeye gerek yok, döngü biter.`,
        { vars: { i, j, current, 'A[j]': A[j] } },
      )
      if (!greater) break
      A[j + 1] = A[j]
      shifts++
      push({ i, j, hole: j, current, sortedEnd: i - 1 }, 6, `A[${j + 1}] = A[${j}]: ${A[j]} bir sağa kaydı; boşluk artık indeks ${j}'de.`, { vars: { i, j, current } })
      j--
      push({ i, j, hole: j + 1, current, sortedEnd: i - 1 }, 7, `j = ${j}.${j < 0 ? ' j < 0 olduğu için dizinin başına ulaştık.' : ''}`, { vars: { i, j, current } })
    }
    A[j + 1] = current
    push(
      { i, j, sortedEnd: i },
      8,
      `A[${j + 1}] = current = ${current}. Artık A[:${i + 1}] = [${A.slice(0, i + 1).join(', ')}] sıralı: değişmez i = ${i} için de sağlanıyor.`,
      { vars: { i, j, current } },
    )
  }
  push({ sortedEnd: A.length - 1, done: true }, 2, `Döngü bitti. Değişmez i = n − 1 için geçerli olduğundan A[:n], yani tüm dizi sıralıdır. Toplam ${comparisons} karşılaştırma, ${shifts} kaydırma.`)
  return trace
}
