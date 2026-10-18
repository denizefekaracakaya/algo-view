import type { Trace } from '../trace/types'

/**
 * Divide-and-conquer integer multiplication from Lecture 1 (and its recurrence analysis in Lecture 3).
 * Numbers are handled as BigInt so results are exact. Cost model: one "basic operation" is a
 * multiplication of two 1-digit numbers (as in the Lecture 1 notes).
 */
export type MultAlgo = 'mult1' | 'karatsuba'

export const KARATSUBA_CODE = [
  'Karatsuba(x, y):',
  '    if x and y are 1-digit: return x·y',
  '    split x = 10^m·a + b,  y = 10^m·c + d',
  '    z1 = Karatsuba(a, c)',
  '    z2 = Karatsuba(b, d)',
  '    z3 = Karatsuba(a + b, c + d)',
  '    z4 = z3 − z1 − z2          # = ad + bc',
  '    return z1·10^(2m) + z4·10^m + z2',
]

export const MULT1_CODE = [
  'Mult1(x, y):',
  '    if x and y are 1-digit: return x·y',
  '    split x = 10^m·a + b,  y = 10^m·c + d',
  '    z1 = Mult1(a, c)',
  '    z2 = Mult1(a, d)',
  '    z3 = Mult1(b, c)',
  '    z4 = Mult1(b, d)',
  '    return z1·10^(2m) + (z2 + z3)·10^m + z4',
]

const digits = (x: bigint) => (x < 0n ? -x : x).toString().length
const pow10 = (m: number) => 10n ** BigInt(m)

export interface MultNode {
  id: string
  parent: string | null
  depth: number
  x: string
  y: string
  status: 'waiting' | 'active' | 'base' | 'done'
  result?: string
  split?: { m: number; a: string; b: string; c: string; d: string }
  /** Label of this call in its parent (z1, z2, …). */
  role: string
}

export interface MultState {
  nodes: MultNode[]
  activeId: string | null
}

/** Exact product + number of 1-digit multiplications, without building a trace. */
export function multiply(x: bigint, y: bigint, algo: MultAlgo): { product: bigint; ops: number } {
  if (digits(x) <= 1 && digits(y) <= 1) return { product: x * y, ops: 1 }
  const n = Math.max(digits(x), digits(y))
  const m = Math.floor(n / 2)
  const P = pow10(m)
  const a = x / P
  const b = x % P
  const c = y / P
  const d = y % P
  if (algo === 'mult1') {
    const r = [multiply(a, c, algo), multiply(a, d, algo), multiply(b, c, algo), multiply(b, d, algo)]
    return {
      product: r[0].product * P * P + (r[1].product + r[2].product) * P + r[3].product,
      ops: r.reduce((s, v) => s + v.ops, 0),
    }
  }
  const z1 = multiply(a, c, algo)
  const z2 = multiply(b, d, algo)
  const z3 = multiply(a + b, c + d, algo)
  const z4 = z3.product - z1.product - z2.product
  return { product: z1.product * P * P + z4 * P + z2.product, ops: z1.ops + z2.ops + z3.ops }
}

/** One-digit multiplications done by the grade-school algorithm: every digit pair. */
export function gradeSchoolOps(x: bigint, y: bigint): number {
  return digits(x) * digits(y)
}

export function multiplyTrace(xIn: bigint, yIn: bigint, algo: MultAlgo): Trace<MultState> {
  const trace: Trace<MultState> = []
  const nodes = new Map<string, MultNode>()
  const order: string[] = []
  let ops = 0
  let calls = 0

  const push = (activeId: string | null, line: number, explain: string, vars?: Record<string, string | number>) =>
    trace.push({
      state: { nodes: order.map((id) => ({ ...nodes.get(id)!, split: nodes.get(id)!.split ? { ...nodes.get(id)!.split! } : undefined })), activeId },
      line,
      explain,
      vars,
      counters: { 'tek basamaklı çarpma': ops, 'çağrı': calls },
    })
  const set = (id: string, p: Partial<MultNode>) => nodes.set(id, { ...nodes.get(id)!, ...p })

  const rec = (x: bigint, y: bigint, id: string, parent: string | null, depth: number, role: string): bigint => {
    nodes.set(id, { id, parent, depth, x: x.toString(), y: y.toString(), status: 'active', role })
    order.push(id)
    calls++
    if (digits(x) <= 1 && digits(y) <= 1) {
      ops++
      const r = x * y
      set(id, { status: 'base', result: r.toString() })
      push(id, 2, `Taban durumu: ${x} ve ${y} tek basamaklı. Doğrudan ${x}·${y} = ${r} hesaplanır (1 tek basamaklı çarpma).`)
      set(id, { status: 'done' })
      return r
    }
    const n = Math.max(digits(x), digits(y))
    const m = Math.floor(n / 2)
    const P = pow10(m)
    const a = x / P
    const b = x % P
    const c = y / P
    const d = y % P
    set(id, { split: { m, a: a.toString(), b: b.toString(), c: c.toString(), d: d.toString() } })
    push(
      id,
      3,
      `${x} × ${y}: n = ${n} basamak, m = ⌊n/2⌋ = ${m}. x = 10^${m}·${a} + ${b}, y = 10^${m}·${c} + ${d}.`,
      { n, m, a: a.toString(), b: b.toString(), c: c.toString(), d: d.toString() },
    )
    let result: bigint
    if (algo === 'mult1') {
      const z1 = rec(a, c, id + '1', id, depth + 1, 'z1 = ac')
      const z2 = rec(a, d, id + '2', id, depth + 1, 'z2 = ad')
      const z3 = rec(b, c, id + '3', id, depth + 1, 'z3 = bc')
      const z4 = rec(b, d, id + '4', id, depth + 1, 'z4 = bd')
      result = z1 * P * P + (z2 + z3) * P + z4
      set(id, { status: 'done', result: result.toString() })
      push(id, 8, `Dört alt çarpım hazır: ac = ${z1}, ad = ${z2}, bc = ${z3}, bd = ${z4}. Sonuç = ${z1}·10^${2 * m} + (${z2} + ${z3})·10^${m} + ${z4} = ${result}.`)
    } else {
      const z1 = rec(a, c, id + '1', id, depth + 1, 'z1 = ac')
      const z2 = rec(b, d, id + '2', id, depth + 1, 'z2 = bd')
      const z3 = rec(a + b, c + d, id + '3', id, depth + 1, 'z3 = (a+b)(c+d)')
      const z4 = z3 - z1 - z2
      result = z1 * P * P + z4 * P + z2
      set(id, { status: 'done', result: result.toString() })
      push(
        id,
        8,
        `Yalnızca üç alt çarpım: z1 = ${z1}, z2 = ${z2}, z3 = ${z3}. ad + bc = z3 − z1 − z2 = ${z4} (toplama/çıkarma ucuzdur). Sonuç = ${z1}·10^${2 * m} + ${z4}·10^${m} + ${z2} = ${result}.`,
      )
    }
    return result
  }
  const product = rec(xIn, yIn, 'r', null, 0, 'kök')
  push(null, 8, `Bitti: ${xIn} × ${yIn} = ${product}. ${ops} tek basamaklı çarpma, ${calls} özyinelemeli çağrı. Okul yöntemi ${gradeSchoolOps(xIn, yIn)} çarpma yapardı.`)
  return trace
}
