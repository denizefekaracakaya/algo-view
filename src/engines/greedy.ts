import type { Trace, TraceStep } from '../trace/types'
import { tx } from '../i18n/lang'

/** Lecture 14: activity selection, scheduling by length/weight ratio, Huffman codes. */

export interface Activity {
  name: string
  s: number
  f: number
}

/** Our own example (a day of club activities, hours 0–12). */
export const ACTIVITIES: Activity[] = [
  { name: 'a', s: 1, f: 4 },
  { name: 'b', s: 3, f: 5 },
  { name: 'c', s: 0, f: 6 },
  { name: 'd', s: 5, f: 7 },
  { name: 'e', s: 3, f: 9 },
  { name: 'f', s: 5, f: 9 },
  { name: 'g', s: 6, f: 10 },
  { name: 'h', s: 8, f: 11 },
  { name: 'i', s: 8, f: 12 },
  { name: 'j', s: 2, f: 14 },
  { name: 'k', s: 12, f: 16 },
]

export const ACTIVITY_CODE = [
  'Greedy-AS(a):          # a sorted by finish time f',
  '    A = {a1}; k = 1',
  '    for m = 2, …, n:',
  '        if s_m ≥ f_k:          # a_m starts after the last chosen one ends',
  '            A = A ∪ {a_m}; k = m',
  '    return A',
]

export interface ActivityState {
  sorted: Activity[]
  chosen: string[]
  rejected: string[]
  current: string | null
  lastFinish: number | null
}

export function activityTrace(acts: Activity[]): { trace: Trace<ActivityState>; chosen: string[] } {
  const sorted = [...acts].sort((a, b) => a.f - b.f || a.s - b.s)
  const chosen: string[] = []
  const rejected: string[] = []
  const trace: Trace<ActivityState> = []
  let lastF: number | null = null
  const push = (current: string | null, step: Omit<TraceStep<ActivityState>, 'state'>) =>
    trace.push({ ...step, state: { sorted, chosen: [...chosen], rejected: [...rejected], current, lastFinish: lastF }, counters: { [tx('seçilen', 'chosen')]: chosen.length } })
  push(null, { line: 1, phase: tx('Sıralama', 'Sort'), explain: tx(`Etkinlikler bitiş zamanına göre sıralandı: ${sorted.map((a) => a.name).join(', ')}.`, `Activities sorted by finish time: ${sorted.map((a) => a.name).join(', ')}.`) })
  sorted.forEach((a, m) => {
    if (m === 0) {
      chosen.push(a.name)
      lastF = a.f
      push(a.name, { line: 2, phase: tx('Açgözlü seçim', 'Greedy choice'), explain: tx(`En erken biten ${a.name} [${a.s}, ${a.f}) seçilir: bir optimal çözüm onu içerir (Önerme 1).`, `The earliest-finishing ${a.name} [${a.s}, ${a.f}) is chosen: some optimal solution contains it (Proposition 1).`) })
      return
    }
    const ok = a.s >= lastF!
    const before = lastF!
    if (ok) {
      chosen.push(a.name)
      lastF = a.f
    } else rejected.push(a.name)
    push(a.name, {
      line: ok ? 5 : 4,
      phase: tx('Açgözlü seçim', 'Greedy choice'),
      explain: ok
        ? tx(`${a.name} [${a.s}, ${a.f}): ${a.s} ≥ ${before}, çakışmıyor → seçildi.`, `${a.name} [${a.s}, ${a.f}): ${a.s} ≥ ${before}, no conflict → chosen.`)
        : tx(`${a.name} [${a.s}, ${a.f}): ${a.s} < ${before}, son seçilenle çakışıyor → atlandı.`, `${a.name} [${a.s}, ${a.f}): ${a.s} < ${before}, it overlaps the last chosen one → skipped.`),
      predict: {
        question: tx(`Son seçilen ${before}'de bitiyor. ${a.name} [${a.s}, ${a.f}) seçilir mi?`, `The last chosen activity ends at ${before}. Is ${a.name} [${a.s}, ${a.f}) chosen?`),
        options: [tx('Evet', 'Yes'), tx('Hayır', 'No')],
        answer: ok ? 0 : 1,
        why: ok ? tx(`${a.s} ≥ ${before}.`, `${a.s} ≥ ${before}.`) : tx(`${a.s} < ${before}: çakışma.`, `${a.s} < ${before}: overlap.`),
      },
    })
  })
  push(null, { line: 6, phase: tx('Bitti', 'Done'), explain: tx(`${chosen.length} etkinlik: {${chosen.join(', ')}}. Sıralıysa tek geçiş O(n), değilse sıralama ile O(n log n).`, `${chosen.length} activities: {${chosen.join(', ')}}. One pass O(n) if sorted, O(n log n) with sorting.`) })
  return { trace, chosen }
}

/** Brute-force maximum number of non-overlapping activities (for tests). */
export function maxActivitiesBrute(acts: Activity[]): number {
  let best = 0
  for (let mask = 0; mask < 1 << acts.length; mask++) {
    const pick = acts.filter((_, i) => mask & (1 << i)).sort((a, b) => a.s - b.s)
    if (pick.every((a, i) => i === 0 || pick[i - 1].f <= a.s)) best = Math.max(best, pick.length)
  }
  return best
}

export interface Job {
  name: string
  l: number
  w: number
}

/** Σ w_j c_j for a given order. */
export function weightedCompletion(order: Job[]): number {
  let t = 0
  let sum = 0
  for (const j of order) {
    t += j.l
    sum += j.w * t
  }
  return sum
}

/** The greedy order: increasing l/w. */
export const ratioOrder = (jobs: Job[]) => [...jobs].sort((a, b) => a.l / a.w - b.l / b.w)

export interface HNode {
  id: number
  label: string
  freq: number
  left: HNode | null
  right: HNode | null
}

/** The notes’ frequencies (in %), for the Huffman example. */
export const HUFFMAN_EXAMPLE: [string, number][] = [
  ['a', 45],
  ['b', 13],
  ['c', 12],
  ['d', 16],
  ['e', 5],
  ['f', 9],
]

export const HUFFMAN_CODE = [
  'Huffman(C, f):',
  '    make a leaf N_k with key f(c_k) for every character',
  '    current = {N_1, …, N_n}',
  '    while |current| > 1:',
  '        take the two nodes N_i, N_j of smallest key',
  '        I = new node with children N_i, N_j; key = sum',
  '        current = current − {N_i, N_j} + {I}',
  '    return the only node: the root',
]

export interface HuffmanState {
  forest: HNode[]
  merged: number[]
  codes: Record<string, string> | null
}

/** Ties are broken by insertion order (older nodes first), so the result is deterministic. */
export function huffmanTrace(chars: [string, number][]): { trace: Trace<HuffmanState>; root: HNode; codes: Record<string, string>; cost: number } {
  let id = 0
  let forest: HNode[] = chars.map(([c, f]) => ({ id: id++, label: c, freq: f, left: null, right: null }))
  const trace: Trace<HuffmanState> = []
  const push = (merged: number[], codes: Record<string, string> | null, step: Omit<TraceStep<HuffmanState>, 'state'>) => trace.push({ ...step, state: { forest: [...forest], merged, codes } })
  push([], null, { line: 3, phase: tx('Başlangıç', 'Start'), explain: tx('Her karakter, sıklığı anahtar olan tek düğümlük bir ağaç.', 'Each character is a one-node tree whose key is its frequency.') })
  while (forest.length > 1) {
    const sorted = [...forest].sort((a, b) => a.freq - b.freq || a.id - b.id)
    const [x, y] = sorted
    const node: HNode = { id: id++, label: '', freq: x.freq + y.freq, left: x, right: y }
    const opts = sorted.slice(0, 4).map((n) => n.label || String(n.freq))
    forest = [...forest.filter((n) => n !== x && n !== y), node]
    push([node.id], null, {
      line: 6,
      phase: tx('Birleştirme', 'Merge'),
      explain: tx(
        `En küçük iki anahtar: ${x.label || 'iç'} (${x.freq}) ve ${y.label || 'iç'} (${y.freq}). Birleşip anahtarı ${node.freq} olan yeni bir düğüm oldular.`,
        `The two smallest keys: ${x.label || 'internal'} (${x.freq}) and ${y.label || 'internal'} (${y.freq}). They are merged into a new node with key ${node.freq}.`,
      ),
      predict:
        x.label && opts.length > 2
          ? {
              question: tx('Hangi düğüm bu adımda birleştirilenlerden biridir?', 'Which node is one of the two merged in this step?'),
              options: [x.label, ...sorted.slice(2, 4).map((n) => n.label || `${tx('iç', 'internal')} ${n.freq}`)],
              answer: 0,
              why: tx(`En küçük sıklık ${x.freq}.`, `The smallest frequency is ${x.freq}.`),
            }
          : undefined,
    })
  }
  const root = forest[0]
  const codes: Record<string, string> = {}
  const walk = (n: HNode, code: string) => {
    if (!n.left && !n.right) codes[n.label] = code || '0'
    if (n.left) walk(n.left, code + '0')
    if (n.right) walk(n.right, code + '1')
  }
  walk(root, '')
  const total = chars.reduce((s, [, f]) => s + f, 0)
  const cost = chars.reduce((s, [c, f]) => s + f * codes[c].length, 0) / total
  push([], codes, {
    line: 8,
    phase: tx('Bitti', 'Done'),
    explain: tx(
      `Tek ağaç kaldı. Sol = 0, sağ = 1: ${chars.map(([c]) => `${c} = ${codes[c]}`).join(', ')}. Ortalama ${cost.toFixed(2)} bit/karakter (sabit uzunlukta ${Math.ceil(Math.log2(chars.length))} bit gerekirdi).`,
      `One tree is left. Left = 0, right = 1: ${chars.map(([c]) => `${c} = ${codes[c]}`).join(', ')}. On average ${cost.toFixed(2)} bits per character (a fixed-length code would need ${Math.ceil(Math.log2(chars.length))} bits).`,
    ),
  })
  return { trace, root, codes, cost }
}
