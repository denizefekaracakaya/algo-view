/**
 * Hand-tracing drills: the learner performs each decision of an algorithm themselves. Every
 * builder returns the full list of decisions (with the state shown before each one) computed
 * by running the algorithm, so the UI only has to compare the learner's choice to `answer`.
 */
import type { TNode } from '../engines/tree'
import { bstInsert } from '../engines/bst'
import { digitCount, digitOf } from '../engines/bucketSort'
import { makeRng, randomPermutation } from '../engines/random'
import { distinctInts } from './generators'
import { tx } from '../i18n/lang'
import { LATER_DRILL_LESSON, LATER_DRILLS, type LaterDrillId } from './drillsLater'

export interface DrillStepBase {
  /** Index of the correct choice. */
  answer: number
  /** Shown after a wrong choice; must not give the answer away. */
  hint: string
  /** Shown after the right choice. */
  why: string
}

/** Drills over a plain array of numbers (Lectures 2–7); their inputs come from `drillInput`. */
export type ArrayDrillId = 'insertion' | 'merge' | 'partition' | 'select-mom' | 'radix' | 'bst'

export type DrillId = ArrayDrillId | LaterDrillId

export const DRILL_LESSON: Record<DrillId, string> = {
  insertion: 'l2-insertion',
  merge: 'l2-mergesort',
  'select-mom': 'l4-select',
  partition: 'l5-quicksort',
  radix: 'l6-bucketsort',
  bst: 'l7-bst',
  ...LATER_DRILL_LESSON,
}

/** Drill catalogue, in course order. */
export const DRILLS: { id: DrillId; title: () => string; blurb: () => string }[] = [
  { id: 'insertion', title: () => 'InsertionSort', blurb: () => tx('Her turda current’in sıralı kısımda nereye yerleşeceğini seç.', 'Each round, pick where current lands in the sorted part.') },
  { id: 'merge', title: () => 'Merge', blurb: () => tx('İki sıralı listeden sıradaki elemanı sen seç.', 'Pick the next element from the two sorted lists.') },
  { id: 'select-mom', title: () => tx('Medyanların medyanı', 'Median of medians'), blurb: () => tx('Her 5’li grubun medyanını, sonra pivotu bul.', 'Find the median of every group of 5, then the pivot.') },
  { id: 'partition', title: () => 'Partition', blurb: () => tx('Her A[j] için takas mı, bekle mi? Sonunda pivotu yerleştir.', 'For each A[j]: swap or skip? Then place the pivot.') },
  { id: 'radix', title: () => 'RadixSort', blurb: () => tx('Her elemanı bu geçişin basamağına göre kovasına at.', 'Drop each element into the bucket of this pass’s digit.') },
  { id: 'bst', title: () => tx('BST’ye ekleme', 'BST insertion'), blurb: () => tx('Her düğümde sola mı sağa mı ineceğine karar ver.', 'At every node decide whether to go left or right.') },
  ...LATER_DRILLS,
]

/* ───────────── InsertionSort: where does `current` land? ───────────── */

export interface InsertionStep extends DrillStepBase {
  array: number[]
  i: number
  current: number
}

export function insertionDrill(input: readonly number[]): { steps: InsertionStep[]; final: number[] } {
  const A = [...input]
  const steps: InsertionStep[] = []
  for (let i = 1; i < A.length; i++) {
    const current = A[i]
    const before = [...A]
    let j = i - 1
    while (j >= 0 && A[j] > current) {
      A[j + 1] = A[j]
      j--
    }
    A[j + 1] = current
    const shifts = i - (j + 1)
    steps.push({
      array: before,
      i,
      current,
      answer: j + 1,
      hint: tx(
        `current = ${current}. Sıralı kısımda (0…${i - 1}) sağdan sola git: ${current}’ten büyük her eleman bir sağa kayar; ilk küçük-ya-da-eşit elemanda durulur.`,
        `current = ${current}. Walk the sorted part (0…${i - 1}) from right to left: every element larger than ${current} shifts right; stop at the first one that is smaller or equal.`,
      ),
      why:
        shifts === 0
          ? tx(`A[${i - 1}] = ${before[i - 1]} ≤ ${current}: kaydırma yok, ${current} yerinde kalır.`, `A[${i - 1}] = ${before[i - 1]} ≤ ${current}: no shift, ${current} stays where it is.`)
          : tx(
              `${shifts} eleman (${before.slice(j + 1, i).join(', ')}) birer sağa kaydı; ${current} indeks ${j + 1}’e yerleşti.`,
              `${shifts} element(s) (${before.slice(j + 1, i).join(', ')}) shifted right by one; ${current} landed at index ${j + 1}.`,
            ),
    })
  }
  return { steps, final: A }
}

/* ───────────── Merge: which head goes next? ───────────── */

export interface MergeStep extends DrillStepBase {
  L: number[]
  R: number[]
  i: number
  j: number
  S: number[]
}

export function mergeDrill(L: readonly number[], R: readonly number[]): { steps: MergeStep[]; final: number[] } {
  const steps: MergeStep[] = []
  const S: number[] = []
  let i = 0
  let j = 0
  while (i < L.length && j < R.length) {
    const takeL = L[i] <= R[j]
    steps.push({
      L: [...L],
      R: [...R],
      i,
      j,
      S: [...S],
      answer: takeL ? 0 : 1,
      hint: tx('İki listenin de başındaki (henüz alınmamış ilk) elemanları karşılaştır; küçük olan önce gelir.', 'Compare the first not-yet-taken element of each list; the smaller one comes first.'),
      why: takeL
        ? tx(`${L[i]} ≤ ${R[j]}: L’nin başı alınır.`, `${L[i]} ≤ ${R[j]}: the head of L is taken.`)
        : tx(`${R[j]} < ${L[i]}: R’nin başı alınır.`, `${R[j]} < ${L[i]}: the head of R is taken.`),
    })
    if (takeL) S.push(L[i++])
    else S.push(R[j++])
  }
  return { steps, final: [...S, ...L.slice(i), ...R.slice(j)] }
}

/* ───────────── Partition (Lomuto, last element as pivot) ───────────── */

export interface PartitionStep extends DrillStepBase {
  array: number[]
  /** Boundary: A[0..i-1] < pivot. */
  i: number
  /** Element being examined; equals hi for the final "where does the pivot go" step. */
  j: number
  /** 'compare': answer 0 = smaller (swap to the left), 1 = not smaller. 'place': answer = final index. */
  kind: 'compare' | 'place'
}

export function partitionDrill(input: readonly number[]): { steps: PartitionStep[]; final: number[]; pivotIndex: number } {
  const A = [...input]
  const hi = A.length - 1
  const p = A[hi]
  const steps: PartitionStep[] = []
  let i = 0
  for (let j = 0; j < hi; j++) {
    const less = A[j] < p
    steps.push({
      array: [...A],
      i,
      j,
      kind: 'compare',
      answer: less ? 0 : 1,
      hint: tx(`A[j] = ${A[j]} değerini pivot ${p} ile karşılaştır.`, `Compare A[j] = ${A[j]} with the pivot ${p}.`),
      why: less
        ? i === j
          ? tx(`${A[j]} < ${p}: A[i] ile takas (burada i = j, yer değişmez), i = ${i + 1}.`, `${A[j]} < ${p}: swap with A[i] (here i = j, nothing moves), i = ${i + 1}.`)
          : tx(`${A[j]} < ${p}: A[${i}] = ${A[i]} ile takas edilir, i = ${i + 1}.`, `${A[j]} < ${p}: swapped with A[${i}] = ${A[i]}, i = ${i + 1}.`)
        : tx(`${A[j]} ≥ ${p}: yerinde kalır, i değişmez.`, `${A[j]} ≥ ${p}: it stays, i does not change.`),
    })
    if (less) {
      ;[A[i], A[j]] = [A[j], A[i]]
      i++
    }
  }
  steps.push({
    array: [...A],
    i,
    j: hi,
    kind: 'place',
    answer: i,
    hint: tx('Pivot, kendisinden küçük elemanların hemen sağına gider: i göstergesine bak.', 'The pivot goes right after the elements smaller than it: look at the pointer i.'),
    why: tx(`Pivot A[${i}] ile takas edilir; solunda ${i} küçük eleman var ve pivot artık son yerinde.`, `The pivot is swapped with A[${i}]; ${i} smaller elements are on its left and it is now in its final place.`),
  })
  ;[A[i], A[hi]] = [A[hi], A[i]]
  return { steps, final: A, pivotIndex: i }
}

/* ───────────── Select: medians of groups of 5, then the median of medians ───────────── */

export interface MomStep extends DrillStepBase {
  groups: number[][]
  /** Group being solved, or null for the final median-of-medians step. */
  group: number | null
  medians: number[]
  /** Values to choose from (answer indexes into this). */
  options: number[]
}

export function momDrill(input: readonly number[]): { steps: MomStep[]; pivot: number } {
  const groups: number[][] = []
  for (let s = 0; s < input.length; s += 5) groups.push(input.slice(s, s + 5))
  const steps: MomStep[] = []
  const medians: number[] = []
  groups.forEach((g, gi) => {
    const sorted = [...g].sort((x, y) => x - y)
    const m = sorted[Math.floor((sorted.length - 1) / 2)]
    steps.push({
      groups,
      group: gi,
      medians: [...medians],
      options: [...g],
      answer: g.indexOf(m),
      hint: tx('Grubu kafanda sırala; 5 elemanın medyanı ortadaki (3.) elemandır: 2’si ondan küçük, 2’si büyük.', 'Sort the group in your head; the median of 5 is the middle (3rd) one: 2 smaller, 2 larger.'),
      why: tx(`Sıralı grup [${sorted.join(', ')}]; medyan ${m}.`, `Sorted group [${sorted.join(', ')}]; the median is ${m}.`),
    })
    medians.push(m)
  })
  const ms = [...medians].sort((x, y) => x - y)
  const pivot = ms[Math.ceil(ms.length / 2) - 1]
  steps.push({
    groups,
    group: null,
    medians: [...medians],
    options: [...medians],
    answer: medians.indexOf(pivot),
    hint: tx('Şimdi yalnızca medyanlara bak: onların medyanı hangisi?', 'Now look only at the medians: which one is their median?'),
    why: tx(
      `Medyanlar sıralanınca [${ms.join(', ')}]; ortadaki ${pivot} pivot olur. Garantisi: elemanların kabaca 3/10’u ondan küçük, 3/10’u büyük.`,
      `The medians sorted are [${ms.join(', ')}]; the middle one, ${pivot}, is the pivot. Guarantee: roughly 3/10 of the elements are smaller and 3/10 larger.`,
    ),
  })
  return { steps, pivot }
}

/* ───────────── RadixSort: drop each element into its bucket ───────────── */

export interface RadixStep extends DrillStepBase {
  pass: number
  passes: number
  /** Order at the start of this pass. */
  order: number[]
  /** Position in `order` of the element being placed. */
  pos: number
  buckets: number[][]
}

export function radixDrill(input: readonly number[], r = 10): { steps: RadixStep[]; final: number[] } {
  const passes = input.length ? digitCount(Math.max(...input), r) : 1
  const steps: RadixStep[] = []
  let order = [...input]
  const place = ['birler', 'onlar', 'yüzler', 'binler']
  const placeEn = ['ones', 'tens', 'hundreds', 'thousands']
  for (let t = 0; t < passes; t++) {
    const buckets: number[][] = Array.from({ length: r }, () => [])
    order.forEach((x, pos) => {
      const dgt = digitOf(x, t, r)
      steps.push({
        pass: t,
        passes,
        order: [...order],
        pos,
        buckets: buckets.map((b) => [...b]),
        answer: dgt,
        hint: tx(`Bu geçişte yalnızca ${place[t] ?? t + '.'} basamağına bakılır.`, `This pass only looks at the ${placeEn[t] ?? 'digit ' + t} digit.`),
        why: tx(`${x} sayısının ${place[t] ?? t + '.'} basamağı ${dgt}: kova ${dgt}’ün sonuna eklenir.`, `The ${placeEn[t] ?? 'digit ' + t} digit of ${x} is ${dgt}: it goes to the end of bucket ${dgt}.`),
      })
      buckets[dgt].push(x)
    })
    order = buckets.flat()
  }
  return { steps, final: order }
}

/* ───────────── BST insertion: left or right at each node ───────────── */

export interface BstStep extends DrillStepBase {
  tree: TNode | null
  key: number
  at: number
  /** Keys already compared on this path (excluding `at`). */
  path: number[]
}

export function bstDrill(keys: readonly number[]): { steps: BstStep[]; final: TNode | null } {
  let t: TNode | null = null
  const steps: BstStep[] = []
  for (const key of keys) {
    let cur = t
    const path: number[] = []
    while (cur) {
      if (key === cur.key) break
      const left = key < cur.key
      steps.push({
        tree: t,
        key,
        at: cur.key,
        path: [...path],
        answer: left ? 0 : 1,
        hint: tx(`${key} ile ${cur.key} değerini karşılaştır: küçükse sol alt ağaç, büyükse sağ alt ağaç.`, `Compare ${key} with ${cur.key}: smaller goes to the left subtree, larger to the right.`),
        why: left
          ? tx(`${key} < ${cur.key}: sola.${cur.left ? '' : ` Sol çocuk boş; ${key} buraya eklenir.`}`, `${key} < ${cur.key}: left.${cur.left ? '' : ` The left child is empty; ${key} is inserted here.`}`)
          : tx(`${key} > ${cur.key}: sağa.${cur.right ? '' : ` Sağ çocuk boş; ${key} buraya eklenir.`}`, `${key} > ${cur.key}: right.${cur.right ? '' : ` The right child is empty; ${key} is inserted here.`}`),
      })
      path.push(cur.key)
      cur = left ? cur.left : cur.right
    }
    t = bstInsert(t, key)
  }
  return { steps, final: t }
}

/* ───────────── Random inputs ───────────── */

export function drillInput(id: ArrayDrillId, seed: number): number[] {
  const rng = makeRng(seed)
  switch (id) {
    case 'insertion':
      return distinctInts(rng, 7, 1, 40)
    case 'merge':
      return distinctInts(rng, 8, 1, 50)
    case 'partition':
      return distinctInts(rng, 8, 1, 50)
    case 'select-mom':
      return distinctInts(rng, 15, 1, 99)
    case 'radix':
      return distinctInts(rng, 6, 10, 99)
    case 'bst': {
      // Distinct keys (multiples of 5 plus a small offset) in random order.
      const keys = randomPermutation(rng, 9).map((x) => x * 5 + Math.floor(rng() * 4))
      return keys.slice(0, 7)
    }
  }
}
