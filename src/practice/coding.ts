/**
 * In-browser coding exercises. The learner writes a JavaScript function; it runs in a Web
 * Worker (so an infinite loop can be stopped) against test cases whose expected outputs are
 * computed here by reference implementations.
 */
import { makeRng, randInt, type Rng } from '../engines/random'
import { masterTheorem, type MasterResult } from '../engines/recurrence'
import { merge } from '../engines/mergeSort'
import { radixSort } from '../engines/bucketSort'
import { bstInsert } from '../engines/bst'
import { isBST, type TNode } from '../engines/tree'
import { inversionPairs, lomutoPartition } from './generators'
import { tx } from '../i18n/lang'
import { LATER_EXERCISES } from './codingLater'

/**
 * How the result is checked: 'return' compares the return value; 'inPlace' compares the
 * returned array, or the first argument if nothing was returned; 'returnAndArg0' compares
 * [return value, first argument after the call].
 */
export type CheckMode = 'return' | 'inPlace' | 'returnAndArg0'

export interface TestCase {
  args: unknown[]
  expected: unknown
  /** Short description shown instead of a huge input. */
  label?: string
}

export interface Exercise {
  id: string
  lessonId: string
  fnName: string
  mode: CheckMode
  title: () => string
  prompt: () => string
  starter: () => string
  hints: () => string[]
  solution: string
  tests: () => TestCase[]
}

const sorted = (A: readonly number[]) => [...A].sort((x, y) => x - y)
const randArr = (rng: Rng, n: number, lo: number, hi: number) => Array.from({ length: n }, () => randInt(rng, lo, hi))

/** Fixed edge cases plus seeded random arrays (same tests on every run, so results are comparable). */
function arrayCases(f: (A: number[]) => unknown, extra: number[][] = [], big = 0): TestCase[] {
  const rng = makeRng(161)
  const inputs = [[], [7], [2, 1], [1, 2, 3, 4, 5], [5, 4, 3, 2, 1], [3, 1, 3, 2, 1, 3], [-4, 10, 0, -4, 8], ...extra]
  for (let i = 0; i < 6; i++) inputs.push(randArr(rng, randInt(rng, 5, 12), -20, 60))
  const cases: TestCase[] = inputs.map((A) => ({ args: [A], expected: f([...A]) }))
  if (big) {
    const A = randArr(rng, big, 0, 1_000_000)
    cases.push({ args: [A], expected: f([...A]), label: tx(`rastgele dizi, ${big.toLocaleString('tr')} eleman`, `random array, ${big.toLocaleString('en')} elements`) })
  }
  return cases
}

const node = (key: number, left: TNode | null = null, right: TNode | null = null): TNode => ({ key, left, right })

function bstFrom(keys: number[]): TNode | null {
  let t: TNode | null = null
  for (const k of keys) t = bstInsert(t, k)
  return t
}

function rotateLeft(x: TNode): TNode {
  const y = x.right!
  return { ...y, left: { ...x, right: y.left } }
}

export const EXERCISES: Exercise[] = [
  {
    id: 'insertion-sort',
    lessonId: 'l2-insertion',
    fnName: 'insertionSort',
    mode: 'inPlace',
    title: () => 'InsertionSort',
    prompt: () =>
      tx(
        '`insertionSort(A)` diziyi **yerinde** artan sırada sıralasın (diziyi döndürmek isteğe bağlı). Ders 2’deki gibi: her `A[i]`’yi soldaki sıralı kısımda, kendisinden büyükleri sağa kaydırarak yerine yerleştir.',
        '`insertionSort(A)` should sort the array **in place** in increasing order (returning it is optional). As in Lecture 2: insert every `A[i]` into the sorted part on its left by shifting larger elements right.',
      ),
    starter: () => tx('function insertionSort(A) {\n  // A[0..i-1] sıralı; A[i]\'yi yerine yerleştir\n  for (let i = 1; i < A.length; i++) {\n\n  }\n  return A\n}\n', 'function insertionSort(A) {\n  // A[0..i-1] is sorted; put A[i] in its place\n  for (let i = 1; i < A.length; i++) {\n\n  }\n  return A\n}\n'),
    hints: () => [
      tx('`current = A[i]`, `j = i - 1` ile başla.', 'Start with `current = A[i]`, `j = i - 1`.'),
      tx('`j >= 0 && A[j] > current` olduğu sürece `A[j + 1] = A[j]; j--`.', 'While `j >= 0 && A[j] > current`: `A[j + 1] = A[j]; j--`.'),
      tx('Döngü bitince `A[j + 1] = current`.', 'After the loop, `A[j + 1] = current`.'),
    ],
    solution: 'function insertionSort(A) {\n  for (let i = 1; i < A.length; i++) {\n    const current = A[i]\n    let j = i - 1\n    while (j >= 0 && A[j] > current) {\n      A[j + 1] = A[j]\n      j--\n    }\n    A[j + 1] = current\n  }\n  return A\n}\n',
    tests: () => arrayCases(sorted),
  },
  {
    id: 'merge',
    lessonId: 'l2-mergesort',
    fnName: 'merge',
    mode: 'return',
    title: () => 'Merge',
    prompt: () =>
      tx(
        '`merge(L, R)` iki **sıralı** diziyi alıp elemanlarının hepsini içeren yeni bir sıralı dizi döndürsün. Doğrusal zamanda çalışmalı: iki göstergeyle ilerle.',
        '`merge(L, R)` takes two **sorted** arrays and returns a new sorted array with all their elements. It should run in linear time: walk with two pointers.',
      ),
    starter: () => 'function merge(L, R) {\n  const S = []\n  let i = 0, j = 0\n\n  return S\n}\n',
    hints: () => [
      tx('`i < L.length && j < R.length` iken küçük olanı `S`’e ekle.', 'While `i < L.length && j < R.length`, push the smaller one to `S`.'),
      tx('Biri bitince diğerinin kalanını ekle (`slice`).', 'When one runs out, append the rest of the other (`slice`).'),
    ],
    solution: 'function merge(L, R) {\n  const S = []\n  let i = 0, j = 0\n  while (i < L.length && j < R.length) {\n    if (L[i] <= R[j]) S.push(L[i++])\n    else S.push(R[j++])\n  }\n  return S.concat(L.slice(i), R.slice(j))\n}\n',
    tests: () => {
      const rng = makeRng(7)
      const pairs: [number[], number[]][] = [
        [[], []],
        [[1, 2], []],
        [[], [3]],
        [[1, 3, 5], [2, 4, 6]],
        [[1, 2, 3], [4, 5]],
        [[5, 6], [1, 2, 3]],
        [[1, 1, 2], [1, 2, 2]],
      ]
      for (let i = 0; i < 5; i++) pairs.push([sorted(randArr(rng, randInt(rng, 1, 8), 0, 30)), sorted(randArr(rng, randInt(rng, 1, 8), 0, 30))])
      return pairs.map(([L, R]) => ({ args: [L, R], expected: merge(L, R) }))
    },
  },
  {
    id: 'merge-sort',
    lessonId: 'l2-mergesort',
    fnName: 'mergeSort',
    mode: 'return',
    title: () => 'MergeSort',
    prompt: () =>
      tx(
        '`mergeSort(A)` sıralı **yeni** bir dizi döndürsün: diziyi ikiye böl, iki yarıyı özyinelemeyle sırala, sonra birleştir. İçinde kendi `merge` fonksiyonunu tanımlayabilirsin. Son test 100.000 elemanlı.',
        '`mergeSort(A)` should return a **new** sorted array: split in half, sort both halves recursively, then merge. You may define your own `merge` inside. The last test has 100,000 elements.',
      ),
    starter: () => tx('function mergeSort(A) {\n  if (A.length <= 1) return A.slice()\n  const mid = Math.floor(A.length / 2)\n  // iki yarıyı sırala ve birleştir\n\n}\n', 'function mergeSort(A) {\n  if (A.length <= 1) return A.slice()\n  const mid = Math.floor(A.length / 2)\n  // sort both halves and merge them\n\n}\n'),
    hints: () => [
      tx('`const L = mergeSort(A.slice(0, mid))`, `R` için de aynısı.', '`const L = mergeSort(A.slice(0, mid))`, the same for `R`.'),
      tx('Merge alıştırmasındaki birleştirmeyi kullan.', 'Use the merge from the Merge exercise.'),
    ],
    solution:
      'function mergeSort(A) {\n  if (A.length <= 1) return A.slice()\n  const mid = Math.floor(A.length / 2)\n  const L = mergeSort(A.slice(0, mid))\n  const R = mergeSort(A.slice(mid))\n  const S = []\n  let i = 0, j = 0\n  while (i < L.length && j < R.length) S.push(L[i] <= R[j] ? L[i++] : R[j++])\n  return S.concat(L.slice(i), R.slice(j))\n}\n',
    tests: () => arrayCases(sorted, [], 100_000),
  },
  {
    id: 'count-inversions',
    lessonId: 'l2-insertion',
    fnName: 'countInversions',
    mode: 'return',
    title: () => tx('Ters çiftleri say', 'Count inversions'),
    prompt: () =>
      tx(
        '`countInversions(A)`, `i < j` ve `A[i] > A[j]` olan çiftlerin sayısını döndürsün (InsertionSort’un kaydırma sayısı). Önce $O(n^2)$ yaz; sonra MergeSort’u değiştirerek $O(n \\log n)$’e indir: birleştirirken R’den bir eleman alındığında L’de kalan her eleman onunla ters çift oluşturur. Son test 50.000 elemanlı.',
        '`countInversions(A)` should return the number of pairs `i < j` with `A[i] > A[j]` (the number of shifts InsertionSort makes). Write $O(n^2)$ first; then get to $O(n \\log n)$ by modifying MergeSort: whenever merging takes an element from R, every element left in L forms an inversion with it. The last test has 50,000 elements.',
      ),
    starter: () => 'function countInversions(A) {\n  let count = 0\n\n  return count\n}\n',
    hints: () => [
      tx('Kaba kuvvet: iki iç içe döngü.', 'Brute force: two nested loops.'),
      tx('Hızlı sürüm: `sortCount(A)` hem sıralı diziyi hem sayıyı döndürsün; toplam = sol + sağ + birleştirme sırasında bulunanlar.', 'Fast version: let `sortCount(A)` return both the sorted array and the count; total = left + right + those found while merging.'),
      tx('Birleştirirken `R[j] < L[i]` ise `count += L.length - i`.', 'While merging, if `R[j] < L[i]` then `count += L.length - i`.'),
    ],
    solution:
      'function countInversions(A) {\n  function sortCount(A) {\n    if (A.length <= 1) return [A.slice(), 0]\n    const mid = Math.floor(A.length / 2)\n    const [L, a] = sortCount(A.slice(0, mid))\n    const [R, b] = sortCount(A.slice(mid))\n    const S = []\n    let i = 0, j = 0, c = a + b\n    while (i < L.length && j < R.length) {\n      if (L[i] <= R[j]) S.push(L[i++])\n      else { c += L.length - i; S.push(R[j++]) }\n    }\n    return [S.concat(L.slice(i), R.slice(j)), c]\n  }\n  return sortCount(A)[1]\n}\n',
    tests: () => {
      const fast = (A: number[]): number => {
        const go = (B: number[]): [number[], number] => {
          if (B.length <= 1) return [B, 0]
          const m = B.length >> 1
          const [L, a] = go(B.slice(0, m))
          const [R, b] = go(B.slice(m))
          const S: number[] = []
          let i = 0
          let j = 0
          let c = a + b
          while (i < L.length && j < R.length) {
            if (L[i] <= R[j]) S.push(L[i++])
            else {
              c += L.length - i
              S.push(R[j++])
            }
          }
          return [[...S, ...L.slice(i), ...R.slice(j)], c]
        }
        return go(A)[1]
      }
      const cases = arrayCases((A) => inversionPairs(A).length)
      const rng = makeRng(99)
      const big = randArr(rng, 50_000, 0, 1_000_000)
      cases.push({ args: [big], expected: fast(big), label: tx('rastgele dizi, 50.000 eleman', 'random array, 50,000 elements') })
      return cases
    },
  },
  {
    id: 'master-case',
    lessonId: 'l3-master',
    fnName: 'masterCase',
    mode: 'return',
    title: () => tx('Master teoremi', 'Master theorem'),
    prompt: () =>
      tx(
        '`masterCase(a, b, d)`, $T(n) = a\\,T(n/b) + O(n^d)$ için hangi durumun geçerli olduğunu döndürsün: `"equal"` ($a = b^d$, sonuç $O(n^d \\log n)$), `"top"` ($a < b^d$, sonuç $O(n^d)$) ya da `"leaves"` ($a > b^d$, sonuç $O(n^{\\log_b a})$).',
        '`masterCase(a, b, d)` should return which case applies to $T(n) = a\\,T(n/b) + O(n^d)$: `"equal"` ($a = b^d$, giving $O(n^d \\log n)$), `"top"` ($a < b^d$, giving $O(n^d)$) or `"leaves"` ($a > b^d$, giving $O(n^{\\log_b a})$).',
      ),
    starter: () => 'function masterCase(a, b, d) {\n\n}\n',
    hints: () => [tx('`b ** d` hesapla ve `a` ile karşılaştır.', 'Compute `b ** d` and compare it with `a`.')],
    solution: "function masterCase(a, b, d) {\n  const bd = b ** d\n  if (a === bd) return 'equal'\n  return a < bd ? 'top' : 'leaves'\n}\n",
    tests: () => {
      const triples: [number, number, number][] = [
        [2, 2, 1],
        [1, 2, 0],
        [4, 2, 1],
        [3, 2, 1],
        [1, 2, 1],
        [7, 2, 2],
        [8, 2, 3],
        [9, 3, 2],
        [2, 4, 1],
        [16, 4, 2],
        [5, 3, 1],
        [1, 3, 0],
      ]
      return triples.map(([a, b, d]) => ({ args: [a, b, d], expected: (masterTheorem(a, b, d) as MasterResult).case }))
    },
  },
  {
    id: 'select',
    lessonId: 'l4-select',
    fnName: 'select',
    mode: 'return',
    title: () => 'Select',
    prompt: () =>
      tx(
        '`select(A, k)`, `A`’nın `k`. en küçük elemanını döndürsün (`k = 1` en küçük). Sıralamadan yap: bir pivot seç, `L` / `E` / `R` olarak böl ve yalnızca cevabın bulunduğu tarafa in. Rastgele pivot beklenen $O(n)$ verir; medyanların medyanı en kötü durumda $O(n)$.',
        '`select(A, k)` should return the `k`-th smallest element of `A` (`k = 1` is the smallest). Do it without sorting: pick a pivot, split into `L` / `E` / `R` and recurse only into the side holding the answer. A random pivot gives expected $O(n)$; median of medians gives worst-case $O(n)$.',
      ),
    starter: () => 'function select(A, k) {\n  const p = A[Math.floor(Math.random() * A.length)]\n\n}\n',
    hints: () => [
      tx('`L = A.filter(x => x < p)`, `E = A.filter(x => x === p)`, `R = A.filter(x => x > p)`.', '`L = A.filter(x => x < p)`, `E = A.filter(x => x === p)`, `R = A.filter(x => x > p)`.'),
      tx('`k <= L.length` ise `L`’de ara; `k <= L.length + E.length` ise cevap `p`; değilse `R`’de `k - L.length - E.length`. elemanı ara.', 'If `k <= L.length` look in `L`; if `k <= L.length + E.length` the answer is `p`; otherwise look for element `k - L.length - E.length` in `R`.'),
    ],
    solution:
      'function select(A, k) {\n  const p = A[Math.floor(Math.random() * A.length)]\n  const L = A.filter((x) => x < p)\n  const E = A.filter((x) => x === p)\n  const R = A.filter((x) => x > p)\n  if (k <= L.length) return select(L, k)\n  if (k <= L.length + E.length) return p\n  return select(R, k - L.length - E.length)\n}\n',
    tests: () => {
      const rng = makeRng(4)
      const cases: TestCase[] = [
        { args: [[5], 1], expected: 5 },
        { args: [[3, 1, 2], 1], expected: 1 },
        { args: [[3, 1, 2], 3], expected: 3 },
        { args: [[4, 4, 4, 1], 2], expected: 4 },
      ]
      for (let i = 0; i < 8; i++) {
        const A = randArr(rng, randInt(rng, 3, 15), -10, 40)
        const k = randInt(rng, 1, A.length)
        cases.push({ args: [A, k], expected: sorted(A)[k - 1] })
      }
      const big = randArr(rng, 200_000, 0, 1_000_000_000)
      cases.push({ args: [big, 100_000], expected: sorted(big)[99_999], label: tx('200.000 eleman, k = 100.000', '200,000 elements, k = 100,000') })
      return cases
    },
  },
  {
    id: 'partition',
    lessonId: 'l5-quicksort',
    fnName: 'partition',
    mode: 'returnAndArg0',
    title: () => tx('Partition (Lomuto)', 'Partition (Lomuto)'),
    prompt: () =>
      tx(
        '`partition(A, lo, hi)`, `A[hi]`’yi pivot alarak `A[lo..hi]` aralığını **yerinde** bölsün ve pivotun son indeksini döndürsün. Ders 5’teki Lomuto şemasını izle (test, dizinin son halini de karşılaştırır): `i = lo`; her `j` için `A[j] < pivot` ise `A[i]` ile takas et ve `i++`; sonunda `A[i]` ile `A[hi]`’yi takas et.',
        '`partition(A, lo, hi)` should partition `A[lo..hi]` **in place** around the pivot `A[hi]` and return the pivot’s final index. Follow the Lomuto scheme of Lecture 5 (the test also compares the final array): `i = lo`; for each `j`, if `A[j] < pivot` swap it with `A[i]` and `i++`; finally swap `A[i]` and `A[hi]`.',
      ),
    starter: () => 'function partition(A, lo, hi) {\n  const pivot = A[hi]\n  let i = lo\n\n  return i\n}\n',
    hints: () => [
      tx('`for (let j = lo; j < hi; j++)`', '`for (let j = lo; j < hi; j++)`'),
      tx('Takas: `[A[i], A[j]] = [A[j], A[i]]`.', 'Swap: `[A[i], A[j]] = [A[j], A[i]]`.'),
    ],
    solution: 'function partition(A, lo, hi) {\n  const pivot = A[hi]\n  let i = lo\n  for (let j = lo; j < hi; j++) {\n    if (A[j] < pivot) {\n      [A[i], A[j]] = [A[j], A[i]]\n      i++\n    }\n  }\n  [A[i], A[hi]] = [A[hi], A[i]]\n  return i\n}\n',
    tests: () => {
      const rng = makeRng(5)
      const inputs: number[][] = [[1], [2, 1], [1, 2], [3, 8, 2, 5, 1, 4, 7, 6], [5, 5, 5, 5], [9, 8, 7, 6, 5]]
      for (let i = 0; i < 6; i++) inputs.push(randArr(rng, randInt(rng, 3, 10), 0, 40))
      const cases: TestCase[] = inputs.map((A) => {
        const r = lomutoPartition(A)
        return { args: [A, 0, A.length - 1], expected: [r.index, r.array] }
      })
      // A sub-range: the elements outside lo..hi must not move.
      const A = [9, 1, 7, 3, 8, 2, 6, 0]
      const mid = lomutoPartition(A.slice(2, 7))
      cases.push({ args: [A, 2, 6], expected: [2 + mid.index, [...A.slice(0, 2), ...mid.array, ...A.slice(7)]] })
      return cases
    },
  },
  {
    id: 'quick-sort',
    lessonId: 'l5-quicksort',
    fnName: 'quickSort',
    mode: 'inPlace',
    title: () => 'QuickSort',
    prompt: () =>
      tx(
        '`quickSort(A)` diziyi **yerinde** sıralasın. Rastgele bir pivot seçip sona taşı, Partition yap, iki tarafı özyinelemeyle sırala. Son test 100.000 elemanlı ve **zaten sıralı**: sabit pivot burada $O(n^2)$ olur (ve çağrı yığını taşabilir).',
        '`quickSort(A)` should sort the array **in place**. Pick a random pivot and move it to the end, partition, and sort both sides recursively. The last test has 100,000 elements and is **already sorted**: a fixed pivot is $O(n^2)$ there (and the call stack may overflow).',
      ),
    starter: () => tx('function quickSort(A, lo = 0, hi = A.length - 1) {\n  if (lo >= hi) return A\n  // rastgele pivotu sona taşı, böl, iki tarafı sırala\n\n  return A\n}\n', 'function quickSort(A, lo = 0, hi = A.length - 1) {\n  if (lo >= hi) return A\n  // move a random pivot to the end, partition, sort both sides\n\n  return A\n}\n'),
    hints: () => [
      tx('`const r = lo + Math.floor(Math.random() * (hi - lo + 1))`, sonra `A[r]` ile `A[hi]`’yi takas et.', '`const r = lo + Math.floor(Math.random() * (hi - lo + 1))`, then swap `A[r]` and `A[hi]`.'),
      tx('Partition alıştırmasındaki döngüyü kullan; sonra `quickSort(A, lo, p - 1)` ve `quickSort(A, p + 1, hi)`.', 'Reuse the loop of the Partition exercise; then `quickSort(A, lo, p - 1)` and `quickSort(A, p + 1, hi)`.'),
    ],
    solution:
      'function quickSort(A, lo = 0, hi = A.length - 1) {\n  if (lo >= hi) return A\n  const r = lo + Math.floor(Math.random() * (hi - lo + 1));\n  [A[r], A[hi]] = [A[hi], A[r]]\n  let i = lo\n  for (let j = lo; j < hi; j++) {\n    if (A[j] < A[hi]) { [A[i], A[j]] = [A[j], A[i]]; i++ }\n  }\n  [A[i], A[hi]] = [A[hi], A[i]]\n  quickSort(A, lo, i - 1)\n  quickSort(A, i + 1, hi)\n  return A\n}\n',
    tests: () => {
      const cases = arrayCases(sorted)
      const big = Array.from({ length: 100_000 }, (_, i) => i)
      cases.push({ args: [big], expected: big, label: tx('zaten sıralı 100.000 eleman', 'already sorted, 100,000 elements') })
      return cases
    },
  },
  {
    id: 'radix-sort',
    lessonId: 'l6-bucketsort',
    fnName: 'radixSort',
    mode: 'return',
    title: () => 'RadixSort',
    prompt: () =>
      tx(
        '`radixSort(A, r)` negatif olmayan tam sayıları taban `r` ile sıralayıp **yeni** bir dizi döndürsün. Her geçişte en az anlamlı basamaktan başlayarak elemanları `r` kovaya **sırayla** at, sonra kovaları 0’dan `r - 1`’e topla. Karşılaştırma (`<`) kullanmadan yap!',
        '`radixSort(A, r)` should sort non-negative integers with base `r` and return a **new** array. In each pass, starting from the least significant digit, drop the elements **in order** into `r` buckets, then collect the buckets from 0 to `r - 1`. Do it without comparisons (`<`) between elements!',
      ),
    starter: () => 'function radixSort(A, r) {\n  let cur = A.slice()\n\n  return cur\n}\n',
    hints: () => [
      tx('Basamak sayısını en büyük elemandan bul: `max` 0 olana kadar `r`’ye böl.', 'Get the number of digits from the largest element: divide `max` by `r` until it is 0.'),
      tx('`t`. basamak: `Math.floor(x / r ** t) % r`.', 'Digit `t`: `Math.floor(x / r ** t) % r`.'),
      tx('Kovalar: `Array.from({ length: r }, () => [])`; toplamak için `buckets.flat()`.', 'Buckets: `Array.from({ length: r }, () => [])`; collect with `buckets.flat()`.'),
    ],
    solution:
      'function radixSort(A, r) {\n  if (A.length === 0) return []\n  let max = Math.max(...A), d = 1\n  while (max >= r) { max = Math.floor(max / r); d++ }\n  let cur = A.slice()\n  for (let t = 0; t < d; t++) {\n    const buckets = Array.from({ length: r }, () => [])\n    for (const x of cur) buckets[Math.floor(x / r ** t) % r].push(x)\n    cur = buckets.flat()\n  }\n  return cur\n}\n',
    tests: () => {
      const rng = makeRng(6)
      const cases: TestCase[] = [
        { args: [[], 10], expected: [] },
        { args: [[0], 10], expected: [0] },
        { args: [[170, 45, 75, 90, 802, 24, 2, 66], 10], expected: radixSort([170, 45, 75, 90, 802, 24, 2, 66], 10) },
        { args: [[5, 3, 5, 1, 0], 2], expected: [0, 1, 3, 5, 5] },
      ]
      for (const r of [2, 8, 10, 16]) {
        const A = randArr(rng, randInt(rng, 5, 12), 0, 5000)
        cases.push({ args: [A, r], expected: radixSort(A, r) })
      }
      return cases
    },
  },
  {
    id: 'bst-insert',
    lessonId: 'l7-bst',
    fnName: 'insert',
    mode: 'return',
    title: () => tx('BST’ye ekleme', 'BST insertion'),
    prompt: () =>
      tx(
        'Düğümler `{ key, left, right }` biçiminde (boş çocuk `null`). `insert(root, key)` anahtarı ekleyip ağacın kökünü döndürsün; ağaç boşsa (`root === null`) yeni düğüm kök olur. Anahtar zaten varsa ağaç değişmez.',
        'Nodes look like `{ key, left, right }` (an empty child is `null`). `insert(root, key)` should insert the key and return the root of the tree; if the tree is empty (`root === null`) the new node becomes the root. If the key is already present the tree does not change.',
      ),
    starter: () => 'function insert(root, key) {\n  if (root === null) return { key, left: null, right: null }\n\n  return root\n}\n',
    hints: () => [
      tx('`key < root.key` ise `root.left = insert(root.left, key)`.', 'If `key < root.key` then `root.left = insert(root.left, key)`.'),
      tx('Eşitse hiçbir şey yapma.', 'If equal, do nothing.'),
    ],
    solution: 'function insert(root, key) {\n  if (root === null) return { key, left: null, right: null }\n  if (key < root.key) root.left = insert(root.left, key)\n  else if (key > root.key) root.right = insert(root.right, key)\n  return root\n}\n',
    tests: () => {
      const rng = makeRng(8)
      const cases: TestCase[] = [
        { args: [null, 5], expected: node(5) },
        { args: [node(5), 3], expected: node(5, node(3)) },
        { args: [node(5), 8], expected: node(5, null, node(8)) },
        { args: [bstFrom([5, 3, 8]), 5], expected: bstFrom([5, 3, 8]) },
      ]
      for (let i = 0; i < 6; i++) {
        const keys = randArr(rng, randInt(rng, 3, 9), 1, 60)
        const k = randInt(rng, 1, 60)
        cases.push({ args: [bstFrom(keys), k], expected: bstInsert(bstFrom(keys), k) })
      }
      return cases
    },
  },
  {
    id: 'is-bst',
    lessonId: 'l7-bst',
    fnName: 'isBST',
    mode: 'return',
    title: () => tx('Geçerli bir BST mi?', 'Is it a valid BST?'),
    prompt: () =>
      tx(
        '`isBST(root)`, her düğüm için **sol alt ağacın tamamındaki** anahtarlar küçük ve **sağ alt ağacın tamamındaki** anahtarlar büyükse `true` döndürsün (anahtarlar farklı). Dikkat: yalnızca çocuklara bakmak yetmez!',
        '`isBST(root)` should return `true` if, for every node, all keys in its **whole left subtree** are smaller and all keys in its **whole right subtree** are larger (keys are distinct). Careful: checking only the children is not enough!',
      ),
    starter: () => 'function isBST(root) {\n\n}\n',
    hints: () => [
      tx('Yardımcı fonksiyona izin verilen aralığı geçir: `check(t, lo, hi)`.', 'Pass the allowed range to a helper: `check(t, lo, hi)`.'),
      tx('Sola inerken üst sınır `t.key` olur, sağa inerken alt sınır `t.key`.', 'Going left the upper bound becomes `t.key`; going right the lower bound becomes `t.key`.'),
    ],
    solution: 'function isBST(root, lo = -Infinity, hi = Infinity) {\n  if (root === null) return true\n  if (root.key <= lo || root.key >= hi) return false\n  return isBST(root.left, lo, root.key) && isBST(root.right, root.key, hi)\n}\n',
    tests: () => {
      const trees: (TNode | null)[] = [
        null,
        node(1),
        node(5, node(3), node(8)),
        node(5, node(8), node(3)),
        node(10, node(5, node(2), node(12)), node(15)), // 12 is in the left subtree of 10
        node(10, node(5), node(15, node(6), node(20))), // 6 is in the right subtree of 10
        bstFrom([50, 30, 70, 20, 40, 60, 80]),
        node(5, node(5)),
      ]
      const rng = makeRng(9)
      for (let i = 0; i < 3; i++) trees.push(bstFrom(randArr(rng, 8, 1, 99)))
      return trees.map((t) => ({ args: [t], expected: isBST(t) && !hasDuplicateKey(t) }))
    },
  },
  {
    id: 'rotate-left',
    lessonId: 'l7-redblack',
    fnName: 'rotateLeft',
    mode: 'return',
    title: () => tx('Sola rotasyon', 'Left rotation'),
    prompt: () =>
      tx(
        '`rotateLeft(x)`, `x` ve sağ çocuğu `y` üzerinde sola rotasyon yapıp alt ağacın **yeni kökünü** (`y`) döndürsün. Rotasyondan sonra `x`, `y`’nin sol çocuğu olur ve `y`’nin eski sol alt ağacı (β) `x`’in sağ çocuğu olur. Düğümler `{ key, left, right }`.',
        '`rotateLeft(x)` should rotate left at `x` and its right child `y` and return the **new root** of the subtree (`y`). After the rotation `x` is the left child of `y`, and `y`’s old left subtree (β) becomes `x`’s right child. Nodes look like `{ key, left, right }`.',
      ),
    starter: () => 'function rotateLeft(x) {\n  const y = x.right\n\n  return y\n}\n',
    hints: () => [tx('Yalnızca iki işaretçi değişir: `x.right = y.left` ve `y.left = x`. Sıra önemli!', 'Only two pointers change: `x.right = y.left` and `y.left = x`. The order matters!')],
    solution: 'function rotateLeft(x) {\n  const y = x.right\n  x.right = y.left\n  y.left = x\n  return y\n}\n',
    tests: () => {
      const trees = [node(1, null, node(2)), node(2, node(1), node(4, node(3), node(5))), bstFrom([10, 5, 20, 15, 25, 12, 17]), bstFrom([4, 2, 6, 1, 3, 5, 7])]
      return trees.map((t) => ({ args: [t], expected: rotateLeft(t!) }))
    },
  },
  {
    id: 'karatsuba',
    lessonId: 'l1-karatsuba',
    fnName: 'karatsuba',
    mode: 'return',
    title: () => 'Karatsuba',
    prompt: () =>
      tx(
        '`karatsuba(x, y)` iki negatif olmayan tam sayının çarpımını döndürsün; ama `x * y`’yi yalnızca ikisi de tek basamaklıyken kullan. Sayıları $10^m$’de böl: $x = a \\cdot 10^m + b$, $y = c \\cdot 10^m + d$. Üç özyinelemeli çarpma yeter: $ac$, $bd$ ve $(a+b)(c+d)$.',
        '`karatsuba(x, y)` should return the product of two non-negative integers, but use `x * y` only when both are single digits. Split at $10^m$: $x = a \\cdot 10^m + b$, $y = c \\cdot 10^m + d$. Three recursive multiplications suffice: $ac$, $bd$ and $(a+b)(c+d)$.',
      ),
    starter: () => 'function karatsuba(x, y) {\n  if (x < 10 && y < 10) return x * y\n  const n = Math.max(String(x).length, String(y).length)\n  const m = Math.floor(n / 2)\n\n}\n',
    hints: () => [
      tx('`const p = 10 ** m; const a = Math.floor(x / p), b = x % p` (y için de c, d).', '`const p = 10 ** m; const a = Math.floor(x / p), b = x % p` (and c, d for y).'),
      tx('$ad + bc = (a+b)(c+d) - ac - bd$.', '$ad + bc = (a+b)(c+d) - ac - bd$.'),
      tx('Sonuç: `ac * 10 ** (2 * m) + (ad + bc) * p + bd`.', 'Result: `ac * 10 ** (2 * m) + (ad + bc) * p + bd`.'),
    ],
    solution:
      'function karatsuba(x, y) {\n  if (x < 10 && y < 10) return x * y\n  const n = Math.max(String(x).length, String(y).length)\n  const m = Math.floor(n / 2)\n  const p = 10 ** m\n  const a = Math.floor(x / p), b = x % p\n  const c = Math.floor(y / p), d = y % p\n  const ac = karatsuba(a, c)\n  const bd = karatsuba(b, d)\n  const mid = karatsuba(a + b, c + d) - ac - bd\n  return ac * 10 ** (2 * m) + mid * p + bd\n}\n',
    tests: () => {
      const rng = makeRng(10)
      const pairs: [number, number][] = [
        [0, 0],
        [7, 8],
        [12, 34],
        [1234, 5678],
        [99, 1],
        [10, 10],
        [123456, 7],
      ]
      for (let i = 0; i < 5; i++) pairs.push([randInt(rng, 0, 9_999_999), randInt(rng, 0, 9_999_999)])
      return pairs.map(([x, y]) => ({ args: [x, y], expected: x * y }))
    },
  },
  ...LATER_EXERCISES,
]

function hasDuplicateKey(t: TNode | null, seen = new Set<number>()): boolean {
  if (!t) return false
  if (seen.has(t.key)) return true
  seen.add(t.key)
  return hasDuplicateKey(t.left, seen) || hasDuplicateKey(t.right, seen)
}

export const exercisesFor = (lessonId: string | null) => (lessonId ? EXERCISES.filter((e) => e.lessonId === lessonId) : EXERCISES)

/**
 * The test harness, as source text: it runs inside the worker and, in unit tests, through
 * `new Function`. Kept free of outside references for that reason.
 */
export const HARNESS_SRC = String.raw`
function harness(code, fnName, tests, mode) {
  var logs = []
  function show(v) {
    if (typeof v === 'string') return v
    try { var s = JSON.stringify(v); return s === undefined ? String(v) : s } catch (e) { return String(v) }
  }
  var con = { log: function () { if (logs.length < 100) logs.push(Array.prototype.map.call(arguments, show).join(' ')) } }
  con.error = con.warn = con.info = con.log
  function clone(v) { return v === undefined ? undefined : JSON.parse(JSON.stringify(v)) }
  function eq(a, b) {
    if (a === b) return true
    if (typeof a === 'number' && typeof b === 'number') return a === b || (a !== a && b !== b)
    if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') return false
    if (Array.isArray(a) !== Array.isArray(b)) return false
    var ka = Object.keys(a).filter(function (k) { return a[k] !== undefined }), kb = Object.keys(b).filter(function (k) { return b[k] !== undefined })
    if (ka.length !== kb.length) return false
    for (var i = 0; i < ka.length; i++) if (!eq(a[ka[i]], b[ka[i]])) return false
    return true
  }
  var fn
  try {
    fn = new Function('console', code + '\n;return typeof ' + fnName + " === 'function' ? " + fnName + ' : undefined')(con)
  } catch (e) {
    return { error: 'syntax', message: String(e && e.message || e), results: [], logs: logs }
  }
  if (typeof fn !== 'function') return { error: 'missing', message: fnName, results: [], logs: logs }
  var results = []
  for (var t = 0; t < tests.length; t++) {
    var args = clone(tests[t].args)
    var t0 = Date.now()
    try {
      var ret = fn.apply(null, args)
      var got = mode === 'inPlace' ? (Array.isArray(ret) ? ret : args[0]) : mode === 'returnAndArg0' ? [ret, args[0]] : ret
      var ok = eq(got, tests[t].expected)
      var shown
      try { shown = got === undefined ? undefined : clone(got) } catch (e) { shown = String(got) }
      results.push({ ok: ok, got: shown, ms: Date.now() - t0 })
    } catch (e) {
      results.push({ ok: false, error: String(e && e.message || e), ms: Date.now() - t0 })
    }
  }
  return { results: results, logs: logs }
}
`

export interface TestResult {
  ok: boolean
  got?: unknown
  error?: string
  ms: number
}

export interface RunOutcome {
  error?: 'syntax' | 'missing' | 'timeout'
  message?: string
  results: TestResult[]
  logs: string[]
}
