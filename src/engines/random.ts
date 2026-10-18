/**
 * Seeded pseudo-random number generator (mulberry32). Deterministic for a given seed,
 * so randomized executions can be replayed exactly.
 */
export type Rng = () => number

export function makeRng(seed: number): Rng {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Uniform integer in [lo, hi] (inclusive). */
export function randInt(rng: Rng, lo: number, hi: number): number {
  return lo + Math.floor(rng() * (hi - lo + 1))
}

export function randomArray(rng: Rng, n: number, lo: number, hi: number): number[] {
  return Array.from({ length: n }, () => randInt(rng, lo, hi))
}

/** Random permutation of 1..n (Fisher–Yates). */
export function randomPermutation(rng: Rng, n: number): number[] {
  const a = Array.from({ length: n }, (_, i) => i + 1)
  for (let i = n - 1; i > 0; i--) {
    const j = randInt(rng, 0, i)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
