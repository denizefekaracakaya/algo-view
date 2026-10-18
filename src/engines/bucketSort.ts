import type { Trace, TraceStep } from '../trace/types'
import { tx } from '../i18n/lang'

/**
 * Lecture 6 "BucketSort" family: CountingSort with one FIFO bucket (linked list) per key,
 * and LSD RadixSort that runs CountingSort once per digit in base r.
 * Items carry a `tag` so the visualization can show that equal keys keep their order (stability).
 */
export interface Tagged {
  key: number
  tag: number // position in the original input
}

export const COUNTING_SORT_CODE = [
  'CountingSort(A, r):           # keys in {0, …, r−1}',
  '    B = array of r empty FIFO buckets (linked lists)',
  '    for x in A:',
  '        append x to the end of B[key(x)]',
  '    return B[0] + B[1] + … + B[r−1]   # concatenate',
]

export const RADIX_SORT_CODE = [
  'RadixSort(A, r):              # base-r digits, least significant first',
  '    d = number of base-r digits of max(A)',
  '    for t = 1 .. d:',
  '        A = CountingSort(A) using digit t as the key',
  '    return A',
]

export function countingSort(A: readonly number[], r: number): number[] {
  const B: number[][] = Array.from({ length: r }, () => [])
  for (const x of A) {
    if (!Number.isInteger(x) || x < 0 || x >= r) throw new RangeError(tx(`Anahtar ${x}, {0, …, ${r - 1}} aralığında değil.`, `Key ${x} is not in the range {0, …, ${r - 1}}.`))
    B[x].push(x)
  }
  return B.flat()
}

export function digitCount(max: number, r: number): number {
  let d = 1
  let m = Math.floor(max / r)
  while (m > 0) {
    d++
    m = Math.floor(m / r)
  }
  return d
}

export function digitOf(x: number, t: number, r: number): number {
  return Math.floor(x / r ** t) % r
}

export function radixSort(A: readonly number[], r: number): number[] {
  if (r < 2) throw new RangeError(tx('Taban r en az 2 olmalı.', 'The base r must be at least 2.'))
  if (A.length === 0) return []
  let cur = [...A]
  const d = digitCount(Math.max(...A), r)
  for (let t = 0; t < d; t++) {
    const B: number[][] = Array.from({ length: r }, () => [])
    for (const x of cur) B[digitOf(x, t, r)].push(x)
    cur = B.flat()
  }
  return cur
}

export interface BucketState {
  /** Items not yet distributed in this pass (in order). */
  input: Tagged[]
  buckets: Tagged[][]
  output: Tagged[]
  /** Which base-r digit is the key in this pass (0 = least significant); null for plain CountingSort. */
  digit: number | null
  pass: number
  totalPasses: number
  highlight: { tag: number; bucket: number } | null
  r: number
}

export function bucketSortTrace(A: readonly number[], mode: 'counting' | 'radix', r: number): Trace<BucketState> {
  const trace: Trace<BucketState> = []
  let ops = 0
  let current: Tagged[] = A.map((key, tag) => ({ key, tag }))
  const d = mode === 'counting' ? 1 : A.length ? digitCount(Math.max(...A), r) : 1
  const keyOf = (x: Tagged, pass: number) => (mode === 'counting' ? x.key : digitOf(x.key, pass, r))
  const clone = (xs: Tagged[]) => xs.map((x) => ({ ...x }))
  const push = (s: Omit<BucketState, 'r' | 'totalPasses'>, step: Omit<TraceStep<BucketState>, 'state' | 'counters'>) =>
    trace.push({
      ...step,
      state: { ...s, input: clone(s.input), output: clone(s.output), buckets: s.buckets.map(clone), r, totalPasses: d },
      counters: { [tx('temel işlem', 'basic operations')]: ops },
    })

  for (let pass = 0; pass < d; pass++) {
    const buckets: Tagged[][] = Array.from({ length: r }, () => [])
    const remaining = [...current]
    ops += r
    push(
      { input: remaining, buckets, output: [], digit: mode === 'radix' ? pass : null, pass, highlight: null },
      {
        line: mode === 'counting' ? 2 : 4,
        phase: mode === 'radix' ? tx(`Geçiş ${pass + 1}/${d}`, `Pass ${pass + 1}/${d}`) : tx('Kovalar', 'Buckets'),
        explain:
          mode === 'counting'
            ? tx(`${r} boş kova oluşturuldu (her olası anahtar 0…${r - 1} için bir tane). Bu O(r) zaman alır.`, `${r} empty buckets were created (one for each possible key 0…${r - 1}). This takes O(r) time.`)
            : tx(`Geçiş ${pass + 1}: anahtar olarak ${pass === 0 ? 'en anlamsız (birler)' : `${pass + 1}. en anlamsız`} basamak kullanılıyor (taban ${r}). ${r} boş kova hazır.`, `Pass ${pass + 1}: the ${pass === 0 ? 'least significant (ones)' : `${pass + 1}-th least significant`} digit is used as the key (base ${r}). ${r} empty buckets are ready.`),
        vars: mode === 'radix' ? { t: pass + 1, d, r } : { r },
      },
    )
    while (remaining.length) {
      const x = remaining.shift()!
      const b = keyOf(x, pass)
      buckets[b].push(x)
      ops++
      push(
        { input: remaining, buckets, output: [], digit: mode === 'radix' ? pass : null, pass, highlight: { tag: x.tag, bucket: b } },
        {
          line: mode === 'counting' ? 4 : 4,
          phase: mode === 'radix' ? tx(`Geçiş ${pass + 1}/${d}`, `Pass ${pass + 1}/${d}`) : tx('Dağıtma', 'Distribute'),
          explain:
            mode === 'counting'
              ? tx(`${x.key} anahtarlı eleman B[${b}] kovasının SONUNA eklendi (FIFO). Değeri doğrudan indeks olarak kullandık; karşılaştırma yok.`, `The item with key ${x.key} was appended to the END of bucket B[${b}] (FIFO). We used the value directly as an index; no comparisons.`)
              : tx(`${x.key} sayısının ${pass + 1}. basamağı ${b}: eleman B[${b}] kovasının sonuna eklendi.`, `Digit ${pass + 1} of ${x.key} is ${b}: the item was appended to the end of bucket B[${b}].`),
          vars: { anahtar: x.key, kova: b },
          predict:
            mode === 'radix'
              ? {
                  question: tx(`${x.key} sayısı (taban ${r}) hangi kovaya gider?`, `Which bucket does ${x.key} (base ${r}) go to?`),
                  options: uniqueOptions(b, r).map((v) => `B[${v}]`),
                  answer: uniqueOptions(b, r).indexOf(b),
                  why: tx(`⌊${x.key} / ${r}^${pass}⌋ mod ${r} = ${b}; bu geçişte yalnızca bu basamağa bakılır.`, `⌊${x.key} / ${r}^${pass}⌋ mod ${r} = ${b}; this pass looks only at this digit.`),
                }
              : undefined,
        },
      )
    }
    const output = buckets.flat()
    ops += r
    push(
      { input: [], buckets: Array.from({ length: r }, () => []), output, digit: mode === 'radix' ? pass : null, pass, highlight: null },
      {
        line: mode === 'counting' ? 5 : 4,
        phase: mode === 'radix' ? tx(`Geçiş ${pass + 1}/${d}`, `Pass ${pass + 1}/${d}`) : tx('Birleştirme', 'Concatenate'),
        explain:
          mode === 'counting'
            ? tx(`Kovalar B[0], B[1], …, B[${r - 1}] sırasıyla birleştirildi: [${output.map((x) => x.key).join(', ')}]. Eşit anahtarlar girişteki sıralarını korudu (kararlı).`, `The buckets B[0], B[1], …, B[${r - 1}] were concatenated in order: [${output.map((x) => x.key).join(', ')}]. Equal keys kept their input order (stable).`)
            : tx(`Kovalar sırayla birleştirildi: [${output.map((x) => x.key).join(', ')}]. Değişmez: dizi artık son ${pass + 1} basamağa göre sıralı.`, `The buckets were concatenated in order: [${output.map((x) => x.key).join(', ')}]. Invariant: the array is now sorted by its last ${pass + 1} digits.`),
      },
    )
    current = output
  }
  push(
    { input: [], buckets: Array.from({ length: r }, () => []), output: current, digit: null, pass: d - 1, highlight: null },
    {
      line: mode === 'counting' ? 5 : 5,
      phase: tx('Bitti', 'Done'),
      explain:
        mode === 'counting'
          ? tx(`Sıralı çıktı hazır. Çalışma süresi O(n + r) = O(${A.length} + ${r}).`, `The sorted output is ready. Running time O(n + r) = O(${A.length} + ${r}).`)
          : tx(`${d} geçişten sonra dizi tüm basamaklara göre sıralı. Çalışma süresi O(d·(n + r)) = O(${d}·(${A.length} + ${r})).`, `After ${d} passes the array is sorted by all digits. Running time O(d·(n + r)) = O(${d}·(${A.length} + ${r})).`),
    },
  )
  return trace
}

function uniqueOptions(correct: number, r: number): number[] {
  const set = new Set<number>([correct])
  for (const c of [correct - 1, correct + 1, 0, r - 1, (correct + 2) % r]) {
    if (set.size >= Math.min(4, r)) break
    if (c >= 0 && c < r) set.add(c)
  }
  return [...set].sort((a, b) => a - b)
}
