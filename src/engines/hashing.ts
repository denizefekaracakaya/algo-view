import type { Trace } from '../trace/types'
import { makeRng, randInt } from './random'
import { tx } from '../i18n/lang'

/** Lecture 8: hash tables with chaining, universal hashing and balls-into-bins. */

export type HashKind = 'notes' | 'mod' | 'universal'

export interface HashFn {
  kind: HashKind
  n: number
  a: number
  b: number
  p: number
}

/** Prime used by the universal family; keys are 0…P−1 (the universe U). */
export const HASH_P = 101

export function makeHash(kind: HashKind, n: number, seed = 1): HashFn {
  if (kind === 'notes') return { kind, n, a: 13, b: 2, p: 0 }
  if (kind === 'mod') return { kind, n, a: 1, b: 0, p: 0 }
  const rng = makeRng(seed)
  return { kind, n, a: randInt(rng, 1, HASH_P - 1), b: randInt(rng, 0, HASH_P - 1), p: HASH_P }
}

export function applyHash(h: HashFn, x: number): number {
  if (h.kind === 'universal') return (((h.a * x + h.b) % h.p) + h.p) % h.p % h.n
  return (((h.a * x + h.b) % h.n) + h.n) % h.n
}

export function hashFormula(h: HashFn): string {
  if (h.kind === 'universal') return `h(x) = ((${h.a}x + ${h.b}) \\bmod ${h.p}) \\bmod ${h.n}`
  if (h.kind === 'mod') return `h(x) = x \\bmod ${h.n}`
  return `h(x) = (13x + 2) \\bmod ${h.n}`
}

function hashWork(h: HashFn, x: number): string {
  if (h.kind === 'universal') {
    const inner = (h.a * x + h.b) % h.p
    return `((${h.a}·${x} + ${h.b}) mod ${h.p}) mod ${h.n} = ${inner} mod ${h.n} = ${inner % h.n}`
  }
  if (h.kind === 'mod') return `${x} mod ${h.n} = ${applyHash(h, x)}`
  return `(13·${x} + 2) mod ${h.n} = ${13 * x + 2} mod ${h.n} = ${applyHash(h, x)}`
}

export interface HashState {
  buckets: number[][]
  /** Key being processed and its bucket. */
  key: number | null
  bucket: number | null
  /** Position in the chain being compared (−1: none). */
  probe: number
  op: 'insert' | 'lookup' | null
  found: boolean | null
}

export const HASH_CODE = [
  'insert(x):',
  '    i = h(x)',
  '    walk the list of bucket i; if x is there, stop',
  '    append x to the list of bucket i',
  '',
  'lookup(x):',
  '    i = h(x)',
  '    walk the list of bucket i, comparing with x',
]

/** All buckets for small tables; otherwise four nearby candidates (always including the right one). */
function bucketOptions(n: number, i: number): number[] {
  if (n <= 8) return Array.from({ length: n }, (_, k) => k)
  return [...new Set([i, (i + 1) % n, (i + n - 2) % n, (i + 3) % n])].sort((a, b) => a - b)
}

/** Inserts `keys`, then looks up `lookups`, recording every bucket computation and chain comparison. */
export function hashTrace(keys: number[], lookups: number[], h: HashFn): { trace: Trace<HashState>; buckets: number[][] } {
  const buckets: number[][] = Array.from({ length: h.n }, () => [])
  const trace: Trace<HashState> = []
  let comparisons = 0
  const push = (s: Omit<HashState, 'buckets'>, line: number, explain: string, phase: string, predict?: Trace<HashState>[number]['predict']) =>
    trace.push({
      state: { ...s, buckets: buckets.map((b) => [...b]) },
      line,
      explain,
      phase,
      predict,
      counters: { [tx('karşılaştırma', 'comparisons')]: comparisons, [tx('anahtar', 'keys')]: buckets.reduce((a, b) => a + b.length, 0) },
      vars: { n: h.n, [tx('doluluk', 'load')]: (buckets.reduce((a, b) => a + b.length, 0) / h.n).toFixed(2) },
    })
  push({ key: null, bucket: null, probe: -1, op: null, found: null }, 1, tx(`Boş tablo: ${h.n} kova, her biri boş bir bağlı liste.`, `Empty table: ${h.n} buckets, each an empty linked list.`), tx('Başlangıç', 'Start'))
  const visit = (x: number, op: 'insert' | 'lookup') => {
    const i = applyHash(h, x)
    const phase = op === 'insert' ? tx(`insert(${x})`, `insert(${x})`) : tx(`lookup(${x})`, `lookup(${x})`)
    push(
      { key: x, bucket: i, probe: -1, op, found: null },
      op === 'insert' ? 2 : 7,
      tx(`h(${x}) = ${hashWork(h, x)}: ${x} kova ${i}'e gider.`, `h(${x}) = ${hashWork(h, x)}: ${x} goes to bucket ${i}.`),
      phase,
      {
        question: tx(`${x} hangi kovaya düşer?`, `Which bucket does ${x} land in?`),
        options: bucketOptions(h.n, i).map(String),
        answer: bucketOptions(h.n, i).indexOf(i),
        why: tx(`${hashWork(h, x)}.`, `${hashWork(h, x)}.`),
      },
    )
    const chain = buckets[i]
    for (let k = 0; k < chain.length; k++) {
      comparisons++
      const hit = chain[k] === x
      push(
        { key: x, bucket: i, probe: k, op, found: hit ? true : null },
        op === 'insert' ? 3 : 8,
        hit
          ? tx(`Listede ${k + 1}. eleman ${chain[k]} = ${x}: bulundu.`, `Element ${k + 1} of the list is ${chain[k]} = ${x}: found.`)
          : tx(`Listede ${k + 1}. eleman ${chain[k]} ≠ ${x}; devam.`, `Element ${k + 1} of the list is ${chain[k]} ≠ ${x}; keep going.`),
        phase,
      )
      if (hit) {
        if (op === 'insert') push({ key: x, bucket: i, probe: k, op, found: true }, 3, tx(`${x} zaten tabloda; tekrar eklenmez.`, `${x} is already in the table; it is not added again.`), phase)
        return
      }
    }
    if (op === 'insert') {
      chain.push(x)
      push(
        { key: x, bucket: i, probe: chain.length - 1, op, found: null },
        4,
        chain.length > 1
          ? tx(`Çakışma: kova ${i}'de zaten ${chain.length - 1} anahtar vardı. ${x} listenin sonuna eklendi (zincir uzunluğu ${chain.length}).`, `Collision: bucket ${i} already held ${chain.length - 1} key(s). ${x} was appended to the list (chain length ${chain.length}).`)
          : tx(`Kova ${i} boştu; ${x} eklendi.`, `Bucket ${i} was empty; ${x} was added.`),
        phase,
      )
    } else {
      push({ key: x, bucket: i, probe: -1, op, found: false }, 8, tx(`Liste bitti: ${x} tabloda yok (${chain.length} karşılaştırma).`, `End of the list: ${x} is not in the table (${chain.length} comparison(s)).`), phase)
    }
  }
  for (const x of keys) visit(x, 'insert')
  for (const x of lookups) visit(x, 'lookup')
  return { trace, buckets }
}

export function buildTable(keys: number[], h: HashFn): number[][] {
  const buckets: number[][] = Array.from({ length: h.n }, () => [])
  for (const x of keys) {
    const i = applyHash(h, x)
    if (!buckets[i].includes(x)) buckets[i].push(x)
  }
  return buckets
}

/**
 * Exact collision probability of two distinct keys over the whole family h_{a,b}, a ∈ {1…p−1}, b ∈ {0…p−1}
 * (Lecture 8, Proposition 1 says it is at most 1/n).
 */
export function familyCollisionProbability(x1: number, x2: number, p: number, n: number): number {
  let hits = 0
  for (let a = 1; a < p; a++)
    for (let b = 0; b < p; b++) if (((a * x1 + b) % p) % n === ((a * x2 + b) % p) % n) hits++
  return hits / (p * (p - 1))
}

/** P[no collision] when m balls go into n bins uniformly at random: Π (1 − i/n). */
export function noCollisionProbability(m: number, n: number): number {
  let p = 1
  for (let i = 1; i < m; i++) p *= Math.max(0, 1 - i / n)
  return p
}

/** The notes’ upper bound e^{−m(m−1)/2n} on P[no collision]. */
export const noCollisionBound = (m: number, n: number) => Math.exp((-m * (m - 1)) / (2 * n))

/** Expected number of colliding pairs m(m−1)/2n (linearity of expectation). */
export const expectedCollidingPairs = (m: number, n: number) => (m * (m - 1)) / (2 * n)

/** Smallest m with P[some collision] > 1/2. */
export function birthdayThreshold(n: number): number {
  let m = 1
  while (noCollisionProbability(m, n) >= 0.5) m++
  return m
}

/** Throws m balls into n bins `trials` times; returns the fraction of trials with a collision and the bin loads of the last trial. */
export function simulateBalls(m: number, n: number, trials: number, seed: number): { collisionRate: number; loads: number[] } {
  const rng = makeRng(seed)
  let collisions = 0
  let loads: number[] = []
  for (let t = 0; t < trials; t++) {
    loads = new Array(n).fill(0)
    let hit = false
    for (let i = 0; i < m; i++) {
      const bin = randInt(rng, 0, n - 1)
      if (loads[bin]++ > 0) hit = true
    }
    if (hit) collisions++
  }
  return { collisionRate: collisions / trials, loads }
}
