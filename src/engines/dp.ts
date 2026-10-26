import type { Trace, TraceStep } from '../trace/types'
import { tx } from '../i18n/lang'

/** Lecture 13: longest common subsequence, knapsack (unbounded and 0/1) and max-weight independent set in a tree. */

export const LCS_CODE = [
  'lenLCS(X, Y):',
  '    C[i, 0] = C[0, j] = 0',
  '    for i = 1, …, m:',
  '        for j = 1, …, n:',
  '            if X[i] == Y[j]: C[i, j] = C[i−1, j−1] + 1',
  '            else: C[i, j] = max(C[i−1, j], C[i, j−1])',
  '',
  'LCS(X, Y, C):   # walk back from C[m, n]',
  '    if X[i] == Y[j]: prepend X[i]; i−−; j−−',
  '    elif C[i, j] == C[i, j−1]: j−−',
  '    else: i−−',
]

export interface TableState {
  /** table[i][j]; null = not filled yet. */
  table: (number | null)[][]
  cell: [number, number] | null
  /** Cells the current value was computed from. */
  from: [number, number][]
  /** Traceback path / chosen cells. */
  path: [number, number][]
  result: string | null
}

export function lcsTable(X: string, Y: string): number[][] {
  const C = Array.from({ length: X.length + 1 }, () => new Array(Y.length + 1).fill(0))
  for (let i = 1; i <= X.length; i++)
    for (let j = 1; j <= Y.length; j++) C[i][j] = X[i - 1] === Y[j - 1] ? C[i - 1][j - 1] + 1 : Math.max(C[i - 1][j], C[i][j - 1])
  return C
}

export function lcs(X: string, Y: string): string {
  const C = lcsTable(X, Y)
  let i = X.length
  let j = Y.length
  let out = ''
  while (i > 0 && j > 0) {
    if (X[i - 1] === Y[j - 1]) {
      out = X[i - 1] + out
      i--
      j--
    } else if (C[i][j] === C[i][j - 1]) j--
    else i--
  }
  return out
}

export function lcsTrace(X: string, Y: string): Trace<TableState> {
  const m = X.length
  const n = Y.length
  const table: (number | null)[][] = Array.from({ length: m + 1 }, (_, i) => Array.from({ length: n + 1 }, (_, j) => (i === 0 || j === 0 ? 0 : null)))
  const trace: Trace<TableState> = []
  let filled = 0
  const push = (cell: [number, number] | null, from: [number, number][], path: [number, number][], result: string | null, step: Omit<TraceStep<TableState>, 'state'>) =>
    trace.push({ ...step, state: { table: table.map((r) => [...r]), cell, from, path: [...path], result }, counters: { [tx('doldurulan hücre', 'cells filled')]: filled } })
  push(null, [], [], null, { line: 2, phase: tx('Başlangıç', 'Start'), explain: tx('Boş bir önekle herhangi bir dizinin LCS’si boştur: ilk satır ve sütun 0.', 'The LCS of an empty prefix with anything is empty: the first row and column are 0.') })
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++) {
      filled++
      const eq = X[i - 1] === Y[j - 1]
      const up = table[i - 1][j]!
      const left = table[i][j - 1]!
      const diag = table[i - 1][j - 1]!
      table[i][j] = eq ? diag + 1 : Math.max(up, left)
      push([i, j], eq ? [[i - 1, j - 1]] : [up >= left ? [i - 1, j] : [i, j - 1]], [], null, {
        line: eq ? 5 : 6,
        phase: tx(`Satır ${i} (${X[i - 1]})`, `Row ${i} (${X[i - 1]})`),
        explain: eq
          ? tx(`X[${i}] = Y[${j}] = ${X[i - 1]}: bu harf LCS’nin sonuna eklenir, C[${i}, ${j}] = C[${i - 1}, ${j - 1}] + 1 = ${diag + 1}.`, `X[${i}] = Y[${j}] = ${X[i - 1]}: this letter extends the LCS, C[${i}, ${j}] = C[${i - 1}, ${j - 1}] + 1 = ${diag + 1}.`)
          : tx(`${X[i - 1]} ≠ ${Y[j - 1]}: iki harften biri LCS’de son olamaz; C[${i}, ${j}] = max(${up}, ${left}) = ${Math.max(up, left)}.`, `${X[i - 1]} ≠ ${Y[j - 1]}: one of the two letters cannot end the LCS; C[${i}, ${j}] = max(${up}, ${left}) = ${Math.max(up, left)}.`),
        predict:
          (i + j) % 3 === 0
            ? {
                question: tx(`C[${i}, ${j}] kaç olur? (X[${i}] = ${X[i - 1]}, Y[${j}] = ${Y[j - 1]})`, `What is C[${i}, ${j}]? (X[${i}] = ${X[i - 1]}, Y[${j}] = ${Y[j - 1]})`),
                options: [...new Set([table[i][j]!, Math.max(0, table[i][j]! - 1), table[i][j]! + 1])].sort((a, b) => a - b).map(String),
                answer: [...new Set([table[i][j]!, Math.max(0, table[i][j]! - 1), table[i][j]! + 1])].sort((a, b) => a - b).indexOf(table[i][j]!),
                why: eq ? tx('Harfler eşit: çapraz komşu + 1.', 'The letters match: diagonal neighbour + 1.') : tx('Harfler farklı: üst ve sol komşunun büyüğü.', 'The letters differ: the larger of the upper and left neighbours.'),
              }
            : undefined,
      })
    }
  // Traceback (Algorithm 2 of the notes).
  let i = m
  let j = n
  let out = ''
  const path: [number, number][] = [[i, j]]
  push([i, j], [], path, '', { line: 8, phase: tx('Geri izleme', 'Traceback'), explain: tx(`Uzunluk C[${m}, ${n}] = ${table[m][n]}. Şimdi C[${m}, ${n}]'den geriye yürüyerek LCS’nin kendisini buluyoruz.`, `The length is C[${m}, ${n}] = ${table[m][n]}. Now we walk back from C[${m}, ${n}] to recover the LCS itself.`) })
  while (i > 0 && j > 0) {
    let explain: string
    let line: number
    if (X[i - 1] === Y[j - 1]) {
      out = X[i - 1] + out
      explain = tx(`X[${i}] = Y[${j}] = ${X[i - 1]}: başa ekle, çapraz git. LCS şimdilik “${out}”.`, `X[${i}] = Y[${j}] = ${X[i - 1]}: prepend it and go diagonally. The LCS so far is “${out}”.`)
      line = 9
      i--
      j--
    } else if (table[i][j] === table[i][j - 1]) {
      explain = tx(`${X[i - 1]} ≠ ${Y[j - 1]} ve C[${i}, ${j}] = C[${i}, ${j - 1}]: Y’den bir harf at, sola git.`, `${X[i - 1]} ≠ ${Y[j - 1]} and C[${i}, ${j}] = C[${i}, ${j - 1}]: drop a letter of Y, go left.`)
      line = 10
      j--
    } else {
      explain = tx(`${X[i - 1]} ≠ ${Y[j - 1]} ve sol komşu daha küçük: X’ten bir harf at, yukarı git.`, `${X[i - 1]} ≠ ${Y[j - 1]} and the left neighbour is smaller: drop a letter of X, go up.`)
      line = 11
      i--
    }
    path.push([i, j])
    push([i, j], [], path, out, { line, phase: tx('Geri izleme', 'Traceback'), explain })
  }
  push(null, [], path, out, { line: 8, phase: tx('Bitti', 'Done'), explain: tx(`LCS = “${out}” (uzunluk ${out.length}). Tablo O(mn), geri izleme O(m + n) sürer.`, `LCS = “${out}” (length ${out.length}). The table takes O(mn), the traceback O(m + n).`) })
  return trace
}

export interface Item {
  name: string
  w: number
  v: number
}

/** The notes’ example items (W = 10). */
export const NOTES_ITEMS: Item[] = [
  { name: 'A', w: 6, v: 25 },
  { name: 'B', w: 3, v: 13 },
  { name: 'C', w: 4, v: 15 },
  { name: 'D', w: 2, v: 8 },
]

export const KNAPSACK01_CODE = [
  'ZeroOneKnapsack(W, n, w, v):',
  '    K[x, 0] = 0; K[0, j] = 0',
  '    for j = 1, …, n:',
  '        for x = 1, …, W:',
  '            K[x, j] = K[x, j−1]                    # skip item j',
  '            if w_j ≤ x:',
  '                K[x, j] = max(K[x, j], K[x − w_j, j−1] + v_j)   # take it',
  '    return K[W, n]',
]

export const KNAPSACK_UNB_CODE = [
  'UnboundedKnapsack(W, n, w, v):',
  '    K[0] = 0',
  '    for x = 1, …, W:',
  '        K[x] = 0',
  '        for i = 1, …, n:',
  '            if w_i ≤ x: K[x] = max(K[x], K[x − w_i] + v_i)',
  '    return K[W]',
]

export function knapsack01(items: Item[], W: number): { value: number; take: string[]; K: number[][] } {
  const n = items.length
  // K[j][x] (rows = items, columns = capacity) for display.
  const K = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(0))
  for (let j = 1; j <= n; j++)
    for (let x = 1; x <= W; x++) {
      K[j][x] = K[j - 1][x]
      if (items[j - 1].w <= x) K[j][x] = Math.max(K[j][x], K[j - 1][x - items[j - 1].w] + items[j - 1].v)
    }
  const take: string[] = []
  let x = W
  for (let j = n; j >= 1; j--)
    if (K[j][x] !== K[j - 1][x]) {
      take.unshift(items[j - 1].name)
      x -= items[j - 1].w
    }
  return { value: K[n][W], take, K }
}

export function knapsackUnbounded(items: Item[], W: number): { value: number; take: string[]; K: number[] } {
  const K = new Array(W + 1).fill(0)
  const choice: (number | null)[] = new Array(W + 1).fill(null)
  for (let x = 1; x <= W; x++)
    items.forEach((it, i) => {
      if (it.w <= x && K[x - it.w] + it.v > K[x]) {
        K[x] = K[x - it.w] + it.v
        choice[x] = i
      }
    })
  const take: string[] = []
  let x = W
  while (x > 0 && choice[x] !== null) {
    take.push(items[choice[x]!].name)
    x -= items[choice[x]!].w
  }
  return { value: K[W], take: take.sort(), K }
}

/** 0/1 knapsack table, filled row by row (one row per item). Table rows = items 0…n, columns = capacity 0…W. */
export function knapsack01Trace(items: Item[], W: number): Trace<TableState> {
  const n = items.length
  const table: (number | null)[][] = Array.from({ length: n + 1 }, (_, j) => Array.from({ length: W + 1 }, (_, x) => (j === 0 || x === 0 ? 0 : null)))
  const trace: Trace<TableState> = []
  let filled = 0
  const push = (cell: [number, number] | null, from: [number, number][], path: [number, number][], result: string | null, step: Omit<TraceStep<TableState>, 'state'>) =>
    trace.push({ ...step, state: { table: table.map((r) => [...r]), cell, from, path: [...path], result }, counters: { [tx('doldurulan hücre', 'cells filled')]: filled } })
  push(null, [], [], null, { line: 2, phase: tx('Başlangıç', 'Start'), explain: tx('Hiç eşya yokken ya da kapasite 0 iken değer 0.', 'With no items, or with capacity 0, the value is 0.') })
  for (let j = 1; j <= n; j++) {
    const it = items[j - 1]
    for (let x = 1; x <= W; x++) {
      filled++
      const skip = table[j - 1][x]!
      const fits = it.w <= x
      const take = fits ? table[j - 1][x - it.w]! + it.v : -Infinity
      table[j][x] = Math.max(skip, take)
      push([j, x], fits ? [[j - 1, x], [j - 1, x - it.w]] : [[j - 1, x]], [], null, {
        line: fits ? 7 : 5,
        phase: tx(`Eşya ${it.name} (w=${it.w}, v=${it.v})`, `Item ${it.name} (w=${it.w}, v=${it.v})`),
        explain: fits
          ? tx(
              `x = ${x}: ${it.name}'yi alma → ${skip}; al → K[${x - it.w}, ${j - 1}] + ${it.v} = ${take}. En iyisi ${table[j][x]}.`,
              `x = ${x}: skip ${it.name} → ${skip}; take it → K[${x - it.w}, ${j - 1}] + ${it.v} = ${take}. The best is ${table[j][x]}.`,
            )
          : tx(`x = ${x}: ${it.name} sığmıyor (w = ${it.w} > ${x}); bir önceki satırdan ${skip}.`, `x = ${x}: ${it.name} does not fit (w = ${it.w} > ${x}); copy ${skip} from the previous row.`),
      })
    }
  }
  // Recover the chosen items.
  const path: [number, number][] = []
  const chosen: string[] = []
  let x = W
  for (let j = n; j >= 1; j--) {
    path.push([j, x])
    if (table[j][x] !== table[j - 1][x]) {
      chosen.unshift(items[j - 1].name)
      x -= items[j - 1].w
    }
  }
  push([n, W], [], path, chosen.join(', '), {
    line: 8,
    phase: tx('Bitti', 'Done'),
    explain: tx(
      `En iyi değer K[${W}, ${n}] = ${table[n][W]}. Geriye doğru, değerin değiştiği satırlar alınan eşyaları gösterir: {${chosen.join(', ')}}. O(nW) hücre, her biri O(1).`,
      `The best value is K[${W}, ${n}] = ${table[n][W]}. Walking back, the rows where the value changes are the items taken: {${chosen.join(', ')}}. O(nW) cells, O(1) each.`,
    ),
  })
  return trace
}

export function knapsackUnboundedTrace(items: Item[], W: number): Trace<TableState> {
  const table: (number | null)[][] = [Array.from({ length: W + 1 }, (_, x) => (x === 0 ? 0 : null))]
  const trace: Trace<TableState> = []
  let filled = 0
  const push = (cell: [number, number] | null, from: [number, number][], result: string | null, step: Omit<TraceStep<TableState>, 'state'>) =>
    trace.push({ ...step, state: { table: table.map((r) => [...r]), cell, from, path: [], result }, counters: { [tx('doldurulan hücre', 'cells filled')]: filled } })
  push(null, [], null, { line: 2, phase: tx('Başlangıç', 'Start'), explain: tx('K[0] = 0: boş sırt çantası.', 'K[0] = 0: an empty knapsack.') })
  for (let x = 1; x <= W; x++) {
    filled++
    let best = 0
    let from: [number, number][] = []
    const parts: string[] = []
    for (const it of items) {
      if (it.w > x) continue
      const val = table[0][x - it.w]! + it.v
      parts.push(`${it.name}: K[${x - it.w}] + ${it.v} = ${val}`)
      if (val > best) {
        best = val
        from = [[0, x - it.w]]
      }
    }
    table[0][x] = best
    push([0, x], from, null, {
      line: 6,
      phase: `x = ${x}`,
      explain: parts.length
        ? tx(`K[${x}] = max(${parts.join('; ')}) = ${best}.`, `K[${x}] = max(${parts.join('; ')}) = ${best}.`)
        : tx(`Hiçbir eşya ${x} kapasiteye sığmıyor: K[${x}] = 0.`, `No item fits into capacity ${x}: K[${x}] = 0.`),
    })
  }
  const r = knapsackUnbounded(items, W)
  push([0, W], [], r.take.join(', '), { line: 7, phase: tx('Bitti', 'Done'), explain: tx(`K[${W}] = ${r.value}; örneğin {${r.take.join(', ')}}. O(nW).`, `K[${W}] = ${r.value}; for example {${r.take.join(', ')}}. O(nW).`) })
  return trace
}

/** A rooted tree for the independent-set DP: children lists and weights (our own example). */
export interface WTree {
  root: string
  children: Record<string, string[]>
  weight: Record<string, number>
}

export const MWIS_EXAMPLE: WTree = {
  root: 'a',
  children: { a: ['b', 'c', 'd'], b: ['e', 'f'], c: [], d: ['g', 'h'], e: [], f: ['i'], g: [], h: [], i: [] },
  weight: { a: 5, b: 3, c: 2, d: 8, e: 4, f: 1, g: 3, h: 6, i: 7 },
}

export const MWIS_CODE = [
  'SolveSubtreeAt(u):',
  '    for v in children(u): SolveSubtreeAt(v)',
  '    A(u) = max( Σ A(v),  w_u + Σ B(v) )     # u out / u in',
  '    B(u) = Σ A(v)                             # best set of T_u without u',
  'return A(root)',
]

export interface MwisState {
  A: Record<string, number | null>
  B: Record<string, number | null>
  current: string | null
  /** Final chosen set (filled in at the end). */
  chosen: string[]
}

export function mwisTrace(t: WTree): { trace: Trace<MwisState>; best: number; chosen: string[] } {
  const all = Object.keys(t.weight)
  const A: Record<string, number | null> = Object.fromEntries(all.map((v) => [v, null]))
  const B: Record<string, number | null> = Object.fromEntries(all.map((v) => [v, null]))
  const trace: Trace<MwisState> = []
  const push = (current: string | null, chosen: string[], step: Omit<TraceStep<MwisState>, 'state'>) => trace.push({ ...step, state: { A: { ...A }, B: { ...B }, current, chosen } })
  push(null, [], { line: 1, phase: tx('Başlangıç', 'Start'), explain: tx(`Kök ${t.root}. Alt ağaçlar yapraklardan köke (post-order) çözülecek.`, `The root is ${t.root}. Subtrees are solved from the leaves up (post-order).`) })
  const solve = (u: string) => {
    for (const v of t.children[u]) solve(v)
    const out = t.children[u].reduce((s, v) => s + A[v]!, 0)
    const inn = t.weight[u] + t.children[u].reduce((s, v) => s + B[v]!, 0)
    A[u] = Math.max(out, inn)
    B[u] = out
    push(u, [], {
      line: 3,
      phase: u,
      explain: t.children[u].length
        ? tx(
            `${u}: dışarıda bırak → Σ A(çocuk) = ${out}; al → ${t.weight[u]} + Σ B(çocuk) = ${inn}. A(${u}) = ${A[u]}, B(${u}) = ${B[u]}.`,
            `${u}: leave it out → Σ A(child) = ${out}; take it → ${t.weight[u]} + Σ B(child) = ${inn}. A(${u}) = ${A[u]}, B(${u}) = ${B[u]}.`,
          )
        : tx(`${u} bir yaprak: A(${u}) = w = ${t.weight[u]}, B(${u}) = 0.`, `${u} is a leaf: A(${u}) = w = ${t.weight[u]}, B(${u}) = 0.`),
      predict: t.children[u].length
        ? {
            question: tx(`A(${u}) kaç?`, `What is A(${u})?`),
            options: [...new Set([out, inn])].sort((a, b) => a - b).map(String),
            answer: [...new Set([out, inn])].sort((a, b) => a - b).indexOf(A[u]!),
            why: tx(`İki seçeneğin büyüğü: max(${out}, ${inn}).`, `The larger of the two options: max(${out}, ${inn}).`),
          }
        : undefined,
    })
  }
  solve(t.root)
  // Recover the set.
  const chosen: string[] = []
  const pick = (u: string, parentTaken: boolean) => {
    const inn = t.weight[u] + t.children[u].reduce((s, v) => s + B[v]!, 0)
    const take = !parentTaken && inn >= t.children[u].reduce((s, v) => s + A[v]!, 0)
    if (take) chosen.push(u)
    for (const v of t.children[u]) pick(v, take)
  }
  pick(t.root, false)
  push(null, chosen, {
    line: 5,
    phase: tx('Bitti', 'Done'),
    explain: tx(`En ağır bağımsız küme ağırlığı A(${t.root}) = ${A[t.root]}: {${chosen.join(', ')}}. Her düğüm bir kez: O(|V|).`, `The heaviest independent set weighs A(${t.root}) = ${A[t.root]}: {${chosen.join(', ')}}. Each node once: O(|V|).`),
  })
  return { trace, best: A[t.root]!, chosen }
}

/** Brute force over all subsets (for tests). */
export function mwisBrute(t: WTree): number {
  const all = Object.keys(t.weight)
  const edges: [string, string][] = []
  for (const u of all) for (const v of t.children[u]) edges.push([u, v])
  let best = 0
  for (let mask = 0; mask < 1 << all.length; mask++) {
    const inSet = (x: string) => !!(mask & (1 << all.indexOf(x)))
    if (edges.some(([u, v]) => inSet(u) && inSet(v))) continue
    best = Math.max(best, all.filter(inSet).reduce((s, x) => s + t.weight[x], 0))
  }
  return best
}
