/**
 * Question generators: each one builds a fresh question from a seed, and computes the answer
 * with the same engines the visualizers use, so the question bank never runs out and every
 * answer is checked by code rather than written by hand.
 */
import type { MCQ, Question } from '../content/types'
import { makeRng, randInt, randomPermutation, type Rng } from '../engines/random'
import { masterTheorem, type MasterResult } from '../engines/recurrence'
import { merge } from '../engines/mergeSort'
import { expectedComparisons } from '../engines/quickSort'
import { digitCount, digitOf } from '../engines/bucketSort'
import { bstFromSequence, searchCost } from '../engines/bst'
import { height } from '../engines/tree'
import { factorial } from '../engines/decisionTree'
import { tx } from '../i18n/lang'
import { LATER_GENERATORS } from './generatorsLater'

export interface Generator {
  id: string
  lessonId: string
  title: () => string
  make: (rng: Rng) => Question
}

const pick = <T,>(rng: Rng, xs: readonly T[]): T => xs[randInt(rng, 0, xs.length - 1)]

/** n distinct integers from [lo, hi], in random order. */
export function distinctInts(rng: Rng, n: number, lo: number, hi: number): number[] {
  const out: number[] = []
  while (out.length < n) {
    const v = randInt(rng, lo, hi)
    if (!out.includes(v)) out.push(v)
  }
  return out
}

/** Shuffle MCQ options, keeping the answer index (and per-option feedback) attached to the right option. */
function shuffleOptions(rng: Rng, q: Omit<MCQ, 'id'>): Omit<MCQ, 'id'> {
  const order = randomPermutation(rng, q.options.length).map((x) => x - 1)
  const feedback: MCQ['feedback'] = {}
  order.forEach((from, to) => {
    const f = q.feedback?.[from]
    if (f) feedback[to] = f
  })
  return { ...q, options: order.map((i) => q.options[i]), answer: order.indexOf(q.answer), feedback }
}

const list = (xs: readonly number[]) => `[${xs.join(', ')}]`

/** Number of pairs i < j with A[i] > A[j]; equals the number of shifts InsertionSort makes. */
export function inversionPairs(A: readonly number[]): [number, number][] {
  const out: [number, number][] = []
  for (let i = 0; i < A.length; i++) for (let j = i + 1; j < A.length; j++) if (A[i] > A[j]) out.push([A[i], A[j]])
  return out
}

/** Comparisons Merge makes on two sorted lists (ties go to L, as in the engine). */
export function mergeComparisons(L: readonly number[], R: readonly number[]): number {
  let i = 0
  let j = 0
  let c = 0
  while (i < L.length && j < R.length) {
    c++
    if (L[i] <= R[j]) i++
    else j++
  }
  return c
}

/** Lomuto partition with the last element as pivot, exactly as in the QuickSort engine. */
export function lomutoPartition(input: readonly number[]): { array: number[]; index: number } {
  const A = [...input]
  const hi = A.length - 1
  let i = 0
  for (let j = 0; j < hi; j++) {
    if (A[j] < A[hi]) {
      ;[A[i], A[j]] = [A[j], A[i]]
      i++
    }
  }
  ;[A[i], A[hi]] = [A[hi], A[i]]
  return { array: A, index: i }
}

/** One stable bucket pass of RadixSort on base-r digit t. */
export function radixPass(A: readonly number[], t: number, r: number): number[] {
  const B: number[][] = Array.from({ length: r }, () => [])
  for (const x of A) B[digitOf(x, t, r)].push(x)
  return B.flat()
}

const texN = (e: number): string => (e === 0 ? '1' : e === 1 ? 'n' : `n^{${e}}`)
const texNLog = (e: number): string => (e === 0 ? '\\log n' : e === 1 ? 'n \\log n' : `n^{${e}} \\log n`)

/** Growth-rate ladder for the asymptotics generator: same rank ⇔ same Θ class. */
const GROWTH: { tex: string; rank: number; note?: [string, string] }[] = [
  { tex: '100', rank: 0 },
  { tex: '\\log n', rank: 1 },
  { tex: '\\log(n^2)', rank: 1, note: ['$\\log(n^2) = 2\\log n$', '$\\log(n^2) = 2\\log n$'] },
  { tex: '\\log_{10} n', rank: 1, note: ['$\\log_{10} n = \\log_2 n / \\log_2 10$; taban yalnızca sabit çarpan değiştirir', '$\\log_{10} n = \\log_2 n / \\log_2 10$; the base only changes a constant factor'] },
  { tex: '\\sqrt{n}', rank: 2 },
  { tex: 'n', rank: 3 },
  { tex: '5n + 3', rank: 3 },
  { tex: '2^{\\log_2 n}', rank: 3, note: ['$2^{\\log_2 n} = n$', '$2^{\\log_2 n} = n$'] },
  { tex: 'n \\log n', rank: 4 },
  { tex: '\\log(n!)', rank: 4, note: ['$\\log(n!) = \\Theta(n \\log n)$ (Ders 6’daki alt sınır hesabı)', '$\\log(n!) = \\Theta(n \\log n)$ (the lower-bound computation of Lecture 6)'] },
  { tex: 'n^2', rank: 5 },
  { tex: 'n^2 + 10n', rank: 5 },
  { tex: '\\tbinom{n}{2}', rank: 5, note: ['$\\binom{n}{2} = n(n-1)/2$', '$\\binom{n}{2} = n(n-1)/2$'] },
  { tex: 'n^3', rank: 6 },
  { tex: '2^n', rank: 7 },
  { tex: '3^n', rank: 8, note: ['$3^n / 2^n = 1.5^n \\to \\infty$, yani $3^n \\neq O(2^n)$', '$3^n / 2^n = 1.5^n \\to \\infty$, so $3^n \\neq O(2^n)$'] },
  { tex: 'n!', rank: 9 },
]

const LADDER = '1 \\ll \\log n \\ll \\sqrt n \\ll n \\ll n\\log n \\ll n^2 \\ll n^3 \\ll 2^n \\ll 3^n \\ll n!'

/** Sorting algorithms and the properties the comparison lesson tabulates. */
const SORTS = [
  { name: 'InsertionSort', stable: true, inPlace: true, nlogn: false, comparison: true },
  { name: 'MergeSort', stable: true, inPlace: false, nlogn: true, comparison: true },
  { name: 'QuickSort', stable: false, inPlace: true, nlogn: false, comparison: true },
  { name: 'CountingSort', stable: true, inPlace: false, nlogn: false, comparison: false },
  { name: 'RadixSort', stable: true, inPlace: false, nlogn: false, comparison: false },
]

export const GENERATORS: Generator[] = [
  {
    id: 'karatsuba-mults',
    lessonId: 'l1-karatsuba',
    title: () => tx('Karatsuba: tek basamaklı çarpma sayısı', 'Karatsuba: single-digit multiplications'),
    make: (rng) => {
      const k = randInt(rng, 1, 5)
      const n = 2 ** k
      return {
        id: '',
        kind: 'numeric',
        answer: 3 ** k,
        prompt: tx(
          `Karatsuba, $n$ basamaklı iki sayıyı her adımda yarıya bölerek ve 3 özyinelemeli çarpma yaparak çarpıyor; 1 basamağa inince doğrudan çarpıyor. $n = ${n}$ için toplam kaç tek basamaklı çarpma yapılır?`,
          `Karatsuba multiplies two $n$-digit numbers by halving them and making 3 recursive multiplications; at 1 digit it multiplies directly. For $n = ${n}$, how many single-digit multiplications are made in total?`,
        ),
        hint: tx(`Her seviyede çağrı sayısı 3 katına çıkar; $n = ${n}$ sayısı kaç kez yarıya bölünüp 1’e iner?`, `The number of calls triples on every level; how many halvings take $n = ${n}$ down to 1?`),
        explanation: tx(
          `$\\log_2 ${n} = ${k}$ seviye vardır ve her seviye çağrı sayısını 3 ile çarpar: $3^{${k}} = ${3 ** k}$. Dört çarpmalı yöntem $4^{${k}} = ${4 ** k} = n^2$ çarpma yapardı.`,
          `There are $\\log_2 ${n} = ${k}$ levels and each multiplies the number of calls by 3: $3^{${k}} = ${3 ** k}$. The four-multiplication method would make $4^{${k}} = ${4 ** k} = n^2$.`,
        ),
      }
    },
  },
  {
    id: 'inversions',
    lessonId: 'l2-insertion',
    title: () => tx('InsertionSort: kaydırma sayısı', 'InsertionSort: number of shifts'),
    make: (rng) => {
      const n = randInt(rng, 5, 7)
      const A = randomPermutation(rng, n)
      const inv = inversionPairs(A)
      const shown = inv.length <= 10 ? ': ' + inv.map(([a, b]) => `(${a}, ${b})`).join(', ') : ''
      return {
        id: '',
        kind: 'numeric',
        answer: inv.length,
        prompt: tx(
          `InsertionSort $${list(A)}$ dizisini sıralarken kaç kez kaydırma ($A[j+1] = A[j]$) yapar?`,
          `How many shifts ($A[j+1] = A[j]$) does InsertionSort make while sorting $${list(A)}$?`,
        ),
        hint: tx('Her kaydırma, yer değiştiren iki elemandan oluşan tam bir ters çifti düzeltir. Ters çiftleri say.', 'Each shift fixes exactly one inverted pair. Count the inversions.'),
        explanation: tx(
          `Kaydırma sayısı = ters çift sayısı = ${inv.length}${shown}.`,
          `Number of shifts = number of inversions = ${inv.length}${shown}.`,
        ),
      }
    },
  },
  {
    id: 'merge-comparisons',
    lessonId: 'l2-mergesort',
    title: () => tx('Merge: karşılaştırma sayısı', 'Merge: number of comparisons'),
    make: (rng) => {
      const a = randInt(rng, 3, 5)
      const b = randInt(rng, 3, 5)
      const all = distinctInts(rng, a + b, 1, 40)
      const L = all.slice(0, a).sort((x, y) => x - y)
      const R = all.slice(a).sort((x, y) => x - y)
      const c = mergeComparisons(L, R)
      const left = a + b - c
      return {
        id: '',
        kind: 'numeric',
        answer: c,
        prompt: tx(
          `Merge, sıralı $L = ${list(L)}$ ve $R = ${list(R)}$ listelerini birleştiriyor. Kaç karşılaştırma yapar?`,
          `Merge combines the sorted lists $L = ${list(L)}$ and $R = ${list(R)}$. How many comparisons does it make?`,
        ),
        hint: tx('Her karşılaştırma S’e tam bir eleman ekler; listelerden biri bitince kalanlar karşılaştırmasız eklenir.', 'Each comparison appends exactly one element to S; once one list runs out the rest is appended without comparisons.'),
        explanation: tx(
          `Sonuç $${list(merge(L, R))}$. Bir liste bittiğinde diğerinde ${left} eleman kalır ve bunlar karşılaştırmasız eklenir: $${a + b} - ${left} = ${c}$.`,
          `The result is $${list(merge(L, R))}$. When one list runs out, ${left} elements remain in the other and are appended without comparisons: $${a + b} - ${left} = ${c}$.`,
        ),
      }
    },
  },
  {
    id: 'growth',
    lessonId: 'l2-asymptotics',
    title: () => tx('Büyüme hızlarını karşılaştır', 'Compare growth rates'),
    make: (rng) => {
      const f = pick(rng, GROWTH)
      const same = GROWTH.filter((g) => g.rank === f.rank && g !== f)
      const g = same.length && rng() < 0.35 ? pick(rng, same) : pick(rng, GROWTH.filter((x) => x.rank !== f.rank))
      const answer = f.rank < g.rank ? 0 : f.rank > g.rank ? 1 : 2
      const notes = [f.note, g.note].filter((x): x is [string, string] => !!x).map((x) => tx(x[0], x[1]))
      return {
        id: '',
        kind: 'mcq',
        prompt: tx(`$f(n) = ${f.tex}$ ve $g(n) = ${g.tex}$ için hangisi doğrudur?`, `For $f(n) = ${f.tex}$ and $g(n) = ${g.tex}$, which is true?`),
        options: [
          tx('$f = O(g)$, ama $g \\neq O(f)$', '$f = O(g)$, but $g \\neq O(f)$'),
          tx('$g = O(f)$, ama $f \\neq O(g)$', '$g = O(f)$, but $f \\neq O(g)$'),
          '$f = \\Theta(g)$',
        ],
        answer,
        hint: tx('Sabit çarpanları ve düşük dereceli terimleri at; logaritma tabanı da yalnızca sabit çarpandır.', 'Drop constant factors and lower-order terms; a logarithm base is only a constant factor too.'),
        explanation:
          (notes.length ? notes.join('; ') + '. ' : '') +
          tx(`Sıralama: $${LADDER}$.`, `Ordering: $${LADDER}$.`),
      }
    },
  },
  {
    id: 'master',
    lessonId: 'l3-master',
    title: () => tx('Master teoremi', 'Master theorem'),
    make: (rng) => {
      // Pick the case first so the three cases come up equally often.
      const want = pick(rng, ['equal', 'top', 'leaves'] as const)
      let r: MasterResult
      for (;;) {
        const b = pick(rng, [2, 3, 4])
        const d = pick(rng, [0, 1, 2])
        const a = randInt(rng, 1, 9)
        const res = masterTheorem(a, b, d)
        if (res.ok && (res.case === want || rng() < 0.05)) {
          r = res
          break
        }
      }
      const { a, b, d } = r
      const k = Math.round(r.logba)
      const leaves = Math.abs(r.logba - k) < 1e-9 ? texN(k) : `n^{\\log_{${b}} ${a}} \\approx n^{${r.logba.toFixed(2)}}`
      const rec = `T(n) = ${a === 1 ? '' : a + '\\,'}T(n/${b}) + O(${texN(d)})`
      const answer = r.case === 'equal' ? 0 : r.case === 'top' ? 1 : 2
      return {
        id: '',
        kind: 'mcq',
        prompt: tx(`$${rec}$ için Master teoremi ne verir?`, `What does the Master theorem give for $${rec}$?`),
        options: [
          tx(`Her seviye eşit: $O(${texNLog(d)})$`, `Every level equal: $O(${texNLog(d)})$`),
          tx(`Kök baskın: $O(${texN(d)})$`, `Root dominates: $O(${texN(d)})$`),
          tx(`Yapraklar baskın: $O(${leaves})$`, `Leaves dominate: $O(${leaves})$`),
        ],
        answer,
        hint: tx(`$a = ${a}$ ile $b^d = ${b}^{${d}} = ${b ** d}$ sayılarını karşılaştır.`, `Compare $a = ${a}$ with $b^d = ${b}^{${d}} = ${b ** d}$.`),
        explanation: `$a = ${a}$, $b^d = ${b ** d}$. ${r.explanation}`,
      }
    },
  },
  {
    id: 'recursion-leaves',
    lessonId: 'l3-master',
    title: () => tx('Özyineleme ağacındaki yaprak sayısı', 'Leaves of the recursion tree'),
    make: (rng) => {
      const a = randInt(rng, 2, 4)
      const b = pick(rng, [2, 3])
      const k = randInt(rng, 2, 4)
      const n = b ** k
      return {
        id: '',
        kind: 'numeric',
        answer: a ** k,
        prompt: tx(
          `$T(n) = ${a}\\,T(n/${b}) + n$, $T(1) = 1$. $n = ${n}$ için özyineleme ağacında kaç yaprak ($T(1)$ çağrısı) vardır?`,
          `$T(n) = ${a}\\,T(n/${b}) + n$, $T(1) = 1$. For $n = ${n}$, how many leaves ($T(1)$ calls) does the recursion tree have?`,
        ),
        hint: tx(`Ağacın derinliği $\\log_${b} n$; her seviyede düğüm sayısı ${a} katına çıkar.`, `The tree has depth $\\log_${b} n$; every level has ${a} times as many nodes.`),
        explanation: tx(
          `Derinlik $\\log_${b} ${n} = ${k}$, yaprak sayısı $${a}^{${k}} = ${a ** k}$ $(= n^{\\log_${b} ${a}})$.`,
          `Depth $\\log_${b} ${n} = ${k}$, number of leaves $${a}^{${k}} = ${a ** k}$ $(= n^{\\log_${b} ${a}})$.`,
        ),
      }
    },
  },
  {
    id: 'exact-recurrence',
    lessonId: 'l3-substitution',
    title: () => tx('Yinelemeyi tam hesapla', 'Evaluate a recurrence exactly'),
    make: (rng) => {
      const a = pick(rng, [1, 2, 4])
      const k = randInt(rng, 2, 6)
      const n = 2 ** k
      const T = (m: number): number => (m === 1 ? 1 : a * T(m / 2) + m)
      const closed = a === 1 ? '2n - 1' : a === 2 ? 'n \\log_2 n + n' : '2n^2 - n'
      return {
        id: '',
        kind: 'numeric',
        answer: T(n),
        prompt: tx(
          `$T(n) = ${a === 1 ? '' : a + '\\,'}T(n/2) + n$ ve $T(1) = 1$. $T(${n})$ kaçtır?`,
          `$T(n) = ${a === 1 ? '' : a + '\\,'}T(n/2) + n$ and $T(1) = 1$. What is $T(${n})$?`,
        ),
        hint: tx('Küçükten başla: $T(2)$, $T(4)$, … ya da kapalı formu tahmin edip yerine koyarak doğrula.', 'Start small: $T(2)$, $T(4)$, … or guess a closed form and verify it by substitution.'),
        explanation: tx(
          `Kapalı form $T(n) = ${closed}$ (yerine koyma ile doğrulanır). $n = ${n}$ için $T(${n}) = ${T(n)}$.`,
          `The closed form is $T(n) = ${closed}$ (verified by substitution). For $n = ${n}$, $T(${n}) = ${T(n)}$.`,
        ),
      }
    },
  },
  {
    id: 'mom-pivot',
    lessonId: 'l4-select',
    title: () => tx('Medyanların medyanı pivotu', 'Median-of-medians pivot'),
    make: (rng) => {
      const A = distinctInts(rng, 15, 1, 99)
      const groups = [0, 5, 10].map((s) => A.slice(s, s + 5).sort((x, y) => x - y))
      const medians = groups.map((g) => g[2])
      const pivot = [...medians].sort((x, y) => x - y)[1]
      return {
        id: '',
        kind: 'numeric',
        answer: pivot,
        prompt: tx(
          `$A = ${list(A)}$. Elemanları sırayla 5’erli gruplara ayır, her grubun medyanını bul ve bu medyanların medyanını pivot seç. Pivot kaçtır?`,
          `$A = ${list(A)}$. Split the elements into groups of 5 in order, find each group's median and pick the median of those medians as the pivot. What is the pivot?`,
        ),
        hint: tx('Gruplar: ilk 5, sonraki 5, son 5 eleman. 5 elemanın medyanı sıralayınca ortadaki (3.) elemandır.', 'Groups: the first 5, the next 5, the last 5 elements. The median of 5 is the middle (3rd) one after sorting.'),
        explanation: tx(
          `Sıralı gruplar ${groups.map((g) => '$' + list(g) + '$').join(', ')}; medyanlar ${medians.join(', ')}; bunların medyanı ${pivot}.`,
          `Sorted groups ${groups.map((g) => '$' + list(g) + '$').join(', ')}; medians ${medians.join(', ')}; their median is ${pivot}.`,
        ),
      }
    },
  },
  {
    id: 'select-side',
    lessonId: 'l4-select',
    title: () => tx('Select: hangi tarafa inilir?', 'Select: which side to recurse on?'),
    make: (rng) => {
      const A = distinctInts(rng, 9, 1, 60)
      const p = pick(rng, A)
      const k = randInt(rng, 1, 9)
      const L = A.filter((x) => x < p)
      const R = A.filter((x) => x > p)
      const answer = k <= L.length ? 0 : k === L.length + 1 ? 1 : 2
      const kR = k - L.length - 1
      return {
        id: '',
        kind: 'mcq',
        prompt: tx(
          `$A = ${list(A)}$ içinde $k = ${k}$. en küçüğü arıyoruz ve pivot $p = ${p}$. Bölmeden sonra ne olur?`,
          `We want the $k = ${k}$-th smallest of $A = ${list(A)}$ and the pivot is $p = ${p}$. What happens after partitioning?`,
        ),
        options: [
          tx(`$L$ (pivottan küçükler) içinde ${k}. en küçük aranır`, `Recurse on $L$ (smaller than the pivot) for the ${k}-th smallest`),
          tx(`Cevap pivotun kendisi: ${p}`, `The answer is the pivot itself: ${p}`),
          tx(`$R$ (pivottan büyükler) içinde $(k - |L| - 1)$. en küçük aranır`, `Recurse on $R$ (larger than the pivot) for the $(k - |L| - 1)$-th smallest`),
        ],
        answer,
        hint: tx('$|L|$’yi say ve $k$ ile karşılaştır.', 'Count $|L|$ and compare it with $k$.'),
        explanation: tx(
          `$L = ${list(L)}$, $|L| = ${L.length}$; $R = ${list(R)}$. ` +
            (answer === 0 ? `$k = ${k} \\le |L|$, cevap $L$ içinde.` : answer === 1 ? `$k = |L| + 1 = ${k}$, pivot tam ${k}. sıradadır.` : `$k = ${k} > |L| + 1$, $R$ içinde ${kR}. en küçük aranır.`),
          `$L = ${list(L)}$, $|L| = ${L.length}$; $R = ${list(R)}$. ` +
            (answer === 0 ? `$k = ${k} \\le |L|$, so the answer is in $L$.` : answer === 1 ? `$k = |L| + 1 = ${k}$: the pivot has rank exactly ${k}.` : `$k = ${k} > |L| + 1$: look for the ${kR}-th smallest in $R$.`),
        ),
      }
    },
  },
  {
    id: 'pivot-index',
    lessonId: 'l5-quicksort',
    title: () => tx('Partition: pivotun son yeri', 'Partition: final pivot position'),
    make: (rng) => {
      const A = distinctInts(rng, 7, 1, 50)
      const { array, index } = lomutoPartition(A)
      return {
        id: '',
        kind: 'numeric',
        answer: index,
        prompt: tx(
          `QuickSort, $${list(A)}$ dizisinde son elemanı (${A[6]}) pivot seçip Partition yapıyor. Partition bitince pivot hangi indekste olur? (İndeksler 0’dan başlar.)`,
          `QuickSort partitions $${list(A)}$ around its last element (${A[6]}). At which index is the pivot after Partition? (Indices start at 0.)`,
        ),
        hint: tx('Pivottan önce yalnızca pivottan küçük elemanlar kalır.', 'Only the elements smaller than the pivot end up before it.'),
        explanation: tx(
          `Pivottan küçük ${index} eleman var, bu yüzden pivot ${index}. indekse gider. Partition sonrası dizi: $${list(array)}$.`,
          `${index} elements are smaller than the pivot, so the pivot lands at index ${index}. The array after Partition: $${list(array)}$.`,
        ),
      }
    },
  },
  {
    id: 'sorted-worst',
    lessonId: 'l5-quicksort',
    title: () => tx('QuickSort’un en kötü durumu', 'QuickSort’s worst case'),
    make: (rng) => {
      const n = randInt(rng, 5, 20)
      const c = (n * (n - 1)) / 2
      return {
        id: '',
        kind: 'numeric',
        answer: c,
        prompt: tx(
          `Pivot her zaman son eleman seçiliyor. QuickSort zaten sıralı $[1, 2, …, ${n}]$ dizisinde toplam kaç karşılaştırma yapar?`,
          `The pivot is always the last element. How many comparisons does QuickSort make in total on the already sorted array $[1, 2, …, ${n}]$?`,
        ),
        hint: tx('Pivot her seferinde en büyük elemandır; bölümlerden biri boş kalır.', 'The pivot is the largest element every time; one side stays empty.'),
        explanation: tx(
          `Boyutlar $${n}, ${n - 1}, …, 2$ olan Partition’lar $(${n}-1) + (${n}-2) + … + 1 = \\tfrac{${n}\\cdot${n - 1}}{2} = ${c}$ karşılaştırma yapar.`,
          `Partitions of sizes $${n}, ${n - 1}, …, 2$ make $(${n}-1) + (${n}-2) + … + 1 = \\tfrac{${n}\\cdot${n - 1}}{2} = ${c}$ comparisons.`,
        ),
      }
    },
  },
  {
    id: 'pair-probability',
    lessonId: 'l5-expected',
    title: () => tx('İki eleman karşılaştırılır mı?', 'Are two elements compared?'),
    make: (rng) => {
      const n = randInt(rng, 6, 12)
      const i = randInt(rng, 1, n - 1)
      const j = randInt(rng, i + 1, n)
      const p = 2 / (j - i + 1)
      return {
        id: '',
        kind: 'numeric',
        answer: Math.round(p * 1000) / 1000,
        tolerance: 0.006,
        prompt: tx(
          `Rastgele pivotlu QuickSort $n = ${n}$ farklı eleman sıralıyor. ${i}. en küçük ile ${j}. en küçük elemanın karşılaştırılma olasılığı nedir? (Ondalık sayı, ör. 0.25)`,
          `Randomized QuickSort sorts $n = ${n}$ distinct elements. What is the probability that the ${i}-th smallest and the ${j}-th smallest are compared? (A decimal, e.g. 0.25)`,
        ),
        hint: tx('Aradaki değerlerden ($i$ ile $j$ dahil) ilk seçilen pivot hangisi olursa olsun, sadece o $i$ ya da $j$ ise karşılaştırma olur.', 'Of the values between them (including $i$ and $j$), they are compared only if the first one picked as a pivot is $i$ or $j$.'),
        explanation: tx(
          `Aralıkta $${j} - ${i} + 1 = ${j - i + 1}$ değer var; ilk seçilen pivotun bunlardan ${i}. ya da ${j}. olması gerekir: $2/${j - i + 1} \\approx ${p.toFixed(3)}$.`,
          `The range holds $${j} - ${i} + 1 = ${j - i + 1}$ values; the first pivot among them must be the ${i}-th or the ${j}-th: $2/${j - i + 1} \\approx ${p.toFixed(3)}$.`,
        ),
      }
    },
  },
  {
    id: 'expected-comparisons',
    lessonId: 'l5-expected',
    title: () => tx('Beklenen karşılaştırma sayısı', 'Expected number of comparisons'),
    make: (rng) => {
      const n = randInt(rng, 2, 6)
      const e = expectedComparisons(n)
      return {
        id: '',
        kind: 'numeric',
        answer: Math.round(e * 100) / 100,
        tolerance: 0.011,
        prompt: tx(
          `Rastgele pivotlu QuickSort $n = ${n}$ farklı eleman üzerinde beklenen kaç karşılaştırma yapar? (İki ondalık basamakla)`,
          `How many comparisons does randomized QuickSort make in expectation on $n = ${n}$ distinct elements? (Two decimal places)`,
        ),
        hint: tx('Tüm $i < j$ çiftleri için $2/(j-i+1)$ olasılıklarını topla.', 'Sum the probabilities $2/(j-i+1)$ over all pairs $i < j$.'),
        explanation: tx(
          `$E[C] = \\sum_{i<j} \\tfrac{2}{j-i+1} = 2(n+1)H_n - 4n \\approx ${e.toFixed(2)}$.`,
          `$E[C] = \\sum_{i<j} \\tfrac{2}{j-i+1} = 2(n+1)H_n - 4n \\approx ${e.toFixed(2)}$.`,
        ),
      }
    },
  },
  {
    id: 'sort-lower-bound',
    lessonId: 'l6-lower-bound',
    title: () => tx('Karar ağacı alt sınırı', 'Decision-tree lower bound'),
    make: (rng) => {
      const n = randInt(rng, 3, 12)
      const f = factorial(n)
      const h = Math.ceil(Math.log2(f) - 1e-12)
      return {
        id: '',
        kind: 'numeric',
        answer: h,
        prompt: tx(
          `Karşılaştırma tabanlı herhangi bir algoritma $n = ${n}$ elemanı sıralarken en kötü durumda en az kaç karşılaştırma yapmak zorundadır?`,
          `At least how many comparisons must any comparison-based algorithm make in the worst case to sort $n = ${n}$ elements?`,
        ),
        hint: tx('Karar ağacında en az $n!$ yaprak olmalı; yüksekliği $h$ olan ikili ağaçta en çok $2^h$ yaprak vardır.', 'The decision tree needs at least $n!$ leaves; a binary tree of height $h$ has at most $2^h$ leaves.'),
        explanation: tx(
          `$${n}! = ${f.toLocaleString('tr')}$ ve $2^h \\ge ${n}!$ olmalı: $h \\ge \\lceil \\log_2 ${n}! \\rceil = ${h}$.`,
          `$${n}! = ${f.toLocaleString('en')}$ and we need $2^h \\ge ${n}!$: $h \\ge \\lceil \\log_2 ${n}! \\rceil = ${h}$.`,
        ),
      }
    },
  },
  {
    id: 'radix-passes',
    lessonId: 'l6-bucketsort',
    title: () => tx('RadixSort: geçiş sayısı', 'RadixSort: number of passes'),
    make: (rng) => {
      const r = pick(rng, [2, 8, 10, 16])
      const max = randInt(rng, 20, 5000)
      const d = digitCount(max, r)
      return {
        id: '',
        kind: 'numeric',
        answer: d,
        prompt: tx(
          `En büyük anahtarı ${max} olan bir diziyi taban $r = ${r}$ ile RadixSort yapıyoruz. Kaç geçiş (CountingSort turu) gerekir?`,
          `We RadixSort an array whose largest key is ${max} using base $r = ${r}$. How many passes (CountingSort rounds) are needed?`,
        ),
        hint: tx(`${max} sayısının ${r} tabanında kaç basamağı var?`, `How many digits does ${max} have in base ${r}?`),
        explanation: tx(
          `${max} sayısı ${r} tabanında ${max.toString(r).toUpperCase()} yazılır: ${d} basamak, yani ${d} geçiş.`,
          `In base ${r}, ${max} is written ${max.toString(r).toUpperCase()}: ${d} digits, so ${d} passes.`,
        ),
      }
    },
  },
  {
    id: 'radix-first-pass',
    lessonId: 'l6-bucketsort',
    title: () => tx('RadixSort: ilk geçişten sonra', 'RadixSort: after the first pass'),
    make: (rng) => {
      for (;;) {
        const A = distinctInts(rng, 6, 10, 99)
        const right = radixPass(A, 0, 10)
        const byTens = radixPass(A, 1, 10)
        const sorted = [...A].sort((x, y) => x - y)
        // Same buckets, but equal digits kept in reverse order: what an unstable pass could produce.
        const unstable = [...A].reverse().sort((x, y) => (x % 10) - (y % 10))
        const opts = [right, byTens, sorted, unstable].map(list)
        if (new Set(opts).size < 4) continue
        return {
          id: '',
          ...shuffleOptions(rng, {
            kind: 'mcq',
            prompt: tx(
              `RadixSort (taban 10) $${list(A)}$ dizisinde ilk geçişi (birler basamağına göre) bitirdi. Dizi şimdi nasıl görünür?`,
              `RadixSort (base 10) has finished its first pass (on the ones digit) over $${list(A)}$. What does the array look like now?`,
            ),
            options: opts.map((o) => '$' + o + '$'),
            answer: 0,
            feedback: {
              1: tx('Bu, onlar basamağına göre sıralama; RadixSort en az anlamlı basamaktan başlar.', 'That sorts by the tens digit; RadixSort starts with the least significant digit.'),
              2: tx('Tam sıralı dizi ancak son geçişten sonra elde edilir.', 'The fully sorted array only appears after the last pass.'),
              3: tx('Birler basamağı doğru ama aynı basamaklı elemanların sırası bozulmuş; geçişler kararlı (stable) olmalı.', 'The ones digits are right, but elements with the same digit changed order; the passes must be stable.'),
            },
            hint: tx('Elemanları sırayla birler basamağının kovasına at, sonra kovaları 0’dan 9’a topla.', 'Drop the elements in order into the bucket of their ones digit, then collect the buckets from 0 to 9.'),
            explanation: tx(
              `Kararlı geçiş, aynı birler basamağına sahip elemanların giriş sırasını korur: $${list(right)}$.`,
              `A stable pass keeps elements with the same ones digit in input order: $${list(right)}$.`,
            ),
          }),
        } as Question
      }
    },
  },
  {
    id: 'sort-properties',
    lessonId: 'l6-compare',
    title: () => tx('Sıralama algoritmalarının özellikleri', 'Properties of sorting algorithms'),
    make: (rng) => {
      const props = [
        {
          q: tx('Hangisi kararlı (stable) değildir?', 'Which one is not stable?'),
          ok: (s: (typeof SORTS)[number]) => !s.stable,
          why: tx('Partition, eşit elemanları birbirinin üzerinden atlayarak takas edebilir.', 'Partition can swap equal elements past each other.'),
        },
        {
          q: tx('Hangisi karşılaştırma tabanlıdır ve en kötü durumda $O(n \\log n)$ çalışır?', 'Which one is comparison-based and runs in $O(n \\log n)$ in the worst case?'),
          ok: (s: (typeof SORTS)[number]) => s.nlogn,
          why: tx('MergeSort her zaman yarıya böler: $T(n) = 2T(n/2) + O(n)$.', 'MergeSort always halves: $T(n) = 2T(n/2) + O(n)$.'),
        },
        {
          q: tx('Hangisi hem yerinde ($O(1)$ ek bellek) hem kararlıdır?', 'Which one is both in place ($O(1)$ extra memory) and stable?'),
          ok: (s: (typeof SORTS)[number]) => s.inPlace && s.stable,
          why: tx('InsertionSort yalnızca komşu kaydırmalar yapar ve eşit elemanları geçmez.', 'InsertionSort only makes neighbouring shifts and never moves past an equal element.'),
        },
        {
          q: tx('Hangisi elemanları karşılaştırmadan sıralar?', 'Which one sorts without comparing elements?'),
          ok: (s: (typeof SORTS)[number]) => !s.comparison,
          why: tx('Anahtarları kovalara indeks olarak kullanır; bu yüzden $\\Omega(n \\log n)$ alt sınırı ona uygulanmaz.', 'It uses keys as bucket indices, so the $\\Omega(n \\log n)$ lower bound does not apply to it.'),
        },
      ]
      const p = pick(rng, props)
      const right = pick(rng, SORTS.filter(p.ok))
      const wrong = SORTS.filter((s) => !p.ok(s))
      const distract = randomPermutation(rng, wrong.length)
        .slice(0, 3)
        .map((i) => wrong[i - 1])
      return {
        id: '',
        ...shuffleOptions(rng, {
          kind: 'mcq',
          prompt: p.q,
          options: [right, ...distract].map((s) => s.name),
          answer: 0,
          hint: tx('Karşılaştırma tablosunu hatırla: kararlılık, ek bellek, en kötü durum, karşılaştırma kullanımı.', 'Recall the comparison table: stability, extra memory, worst case, use of comparisons.'),
          explanation: p.why,
        }),
      } as Question
    },
  },
  {
    id: 'bst-height',
    lessonId: 'l7-bst',
    title: () => tx('BST yüksekliği', 'BST height'),
    make: (rng) => {
      const keys = distinctInts(rng, 7, 1, 50)
      const t = bstFromSequence(keys)
      const h = height(t)
      return {
        id: '',
        kind: 'numeric',
        answer: h,
        prompt: tx(
          `Boş bir BST’ye sırayla $${list(keys)}$ ekleniyor. Ağacın yüksekliği (kökten en derin yaprağa kenar sayısı) kaçtır?`,
          `The keys $${list(keys)}$ are inserted in this order into an empty BST. What is the height of the tree (edges from the root to the deepest leaf)?`,
        ),
        hint: tx(`İlk anahtar ${keys[0]} köktür; her anahtar için kökten başlayarak küçükse sola, büyükse sağa in.`, `The first key ${keys[0]} is the root; for every key go left if smaller, right if larger, starting at the root.`),
        explanation: tx(
          `Ağacı kurunca en uzun kök–yaprak yolu ${h} kenardır. ${keys.length} düğümle mümkün en küçük yükseklik ${Math.floor(Math.log2(keys.length))}, en büyüğü ${keys.length - 1}.`,
          `Building the tree, the longest root-to-leaf path has ${h} edges. With ${keys.length} nodes the smallest possible height is ${Math.floor(Math.log2(keys.length))} and the largest is ${keys.length - 1}.`,
        ),
      }
    },
  },
  {
    id: 'bst-search',
    lessonId: 'l7-bst',
    title: () => tx('BST’de arama maliyeti', 'Search cost in a BST'),
    make: (rng) => {
      const keys = distinctInts(rng, 8, 1, 60)
      const t = bstFromSequence(keys)
      const target = pick(rng, keys.slice(1))
      const c = searchCost(t, target)
      return {
        id: '',
        kind: 'numeric',
        answer: c,
        prompt: tx(
          `Boş bir BST’ye sırayla $${list(keys)}$ ekleniyor. Ardından ${target} aranıyor. Arama kaç düğümle karşılaştırma yapar (bulduğu düğüm dahil)?`,
          `The keys $${list(keys)}$ are inserted in this order into an empty BST. Then ${target} is searched for. How many nodes does the search compare against (including the one it finds)?`,
        ),
        hint: tx(`${target} anahtarının derinliği + 1.`, `The depth of ${target} plus 1.`),
        explanation: tx(
          `${target}, ${c - 1} derinliğinde; kökten itibaren ${c} düğüme bakılır.`,
          `${target} sits at depth ${c - 1}; the search looks at ${c} nodes starting from the root.`,
        ),
      }
    },
  },
  {
    id: 'rb-height-bound',
    lessonId: 'l7-redblack',
    title: () => tx('Kırmızı-siyah ağaç yükseklik sınırı', 'Red-black height bound'),
    make: (rng) => {
      const n = pick(rng, [7, 15, 31, 100, 1000, 4095, 1_000_000])
      const bound = Math.floor(2 * Math.log2(n + 1) + 1e-9)
      return {
        id: '',
        kind: 'numeric',
        answer: bound,
        prompt: tx(
          `$n = ${n.toLocaleString('tr')}$ düğümlü bir kırmızı-siyah ağacın yüksekliği en fazla kaç olabilir? ($h \\le 2\\log_2(n+1)$ sınırının tam sayı kısmını gir.)`,
          `At most how tall can a red-black tree with $n = ${n.toLocaleString('en')}$ nodes be? (Enter the integer part of the bound $h \\le 2\\log_2(n+1)$.)`,
        ),
        hint: tx('Siyah yükseklik $b$ ise en az $2^b - 1$ düğüm vardır ve $h \\le 2b$.', 'With black height $b$ there are at least $2^b - 1$ nodes, and $h \\le 2b$.'),
        explanation: tx(
          `$2\\log_2(${n} + 1) \\approx ${(2 * Math.log2(n + 1)).toFixed(2)}$, yani yükseklik en çok ${bound}.`,
          `$2\\log_2(${n} + 1) \\approx ${(2 * Math.log2(n + 1)).toFixed(2)}$, so the height is at most ${bound}.`,
        ),
      }
    },
  },
  {
    id: 'rb-min-nodes',
    lessonId: 'l7-redblack',
    title: () => tx('Siyah yükseklik ve düğüm sayısı', 'Black height and node count'),
    make: (rng) => {
      const b = randInt(rng, 2, 7)
      return {
        id: '',
        kind: 'numeric',
        answer: 2 ** b - 1,
        prompt: tx(
          `Kökün siyah yüksekliği $b = ${b}$ olan bir kırmızı-siyah ağaçta en az kaç (NIL olmayan) düğüm vardır?`,
          `At least how many (non-NIL) nodes does a red-black tree whose root has black height $b = ${b}$ contain?`,
        ),
        hint: tx('En az düğüm, yalnızca siyah düğümlerden oluşan tam bir ikili ağaçla elde edilir.', 'The fewest nodes come from a complete binary tree made only of black nodes.'),
        explanation: tx(
          `Kökten her NIL’e giden yolda ${b} siyah düğüm var; yalnızca siyahlardan oluşan tam ağaç $2^{${b}} - 1 = ${2 ** b - 1}$ düğüm içerir ve daha azı mümkün değildir.`,
          `Every root-to-NIL path has ${b} black nodes; the complete all-black tree has $2^{${b}} - 1 = ${2 ** b - 1}$ nodes, and fewer is impossible.`,
        ),
      }
    },
  },
  ...LATER_GENERATORS,
]

export const generatorsFor = (lessonId: string | null): Generator[] => (lessonId ? GENERATORS.filter((g) => g.lessonId === lessonId) : GENERATORS)

/** Builds the question for a generator and seed; the id makes per-question UI state reset. */
export function generate(gen: Generator, seed: number): Question {
  return { ...gen.make(makeRng(seed)), id: `${gen.id}-${seed}` }
}
