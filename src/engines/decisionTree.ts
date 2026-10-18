/**
 * Builds the decision tree of a deterministic comparison-based sorting algorithm on n items
 * (Lecture 6). Every input ordering is run through the algorithm; the algorithm can only learn
 * about the input via the comparison oracle, so runs that received the same answers so far must
 * ask the same next question — they share a path in the tree.
 */
export type DTAlgo = 'insertion' | 'merge' | 'quick'

export type Less = (x: number, y: number) => boolean

function insertionSortBy(items: number[], less: Less): number[] {
  const A = [...items]
  for (let i = 1; i < A.length; i++) {
    const cur = A[i]
    let j = i - 1
    while (j >= 0 && less(cur, A[j])) {
      A[j + 1] = A[j]
      j--
    }
    A[j + 1] = cur
  }
  return A
}

function mergeSortBy(items: number[], less: Less): number[] {
  if (items.length <= 1) return items
  const mid = Math.floor(items.length / 2)
  const L = mergeSortBy(items.slice(0, mid), less)
  const R = mergeSortBy(items.slice(mid), less)
  const S: number[] = []
  let i = 0
  let j = 0
  while (i < L.length && j < R.length) {
    if (less(R[j], L[i])) S.push(R[j++])
    else S.push(L[i++])
  }
  return [...S, ...L.slice(i), ...R.slice(j)]
}

function quickSortBy(items: number[], less: Less): number[] {
  if (items.length <= 1) return items
  const [p, ...rest] = items
  const L: number[] = []
  const R: number[] = []
  for (const x of rest) (less(x, p) ? L : R).push(x)
  return [...quickSortBy(L, less), p, ...quickSortBy(R, less)]
}

export const DT_SORTERS: Record<DTAlgo, (items: number[], less: Less) => number[]> = {
  insertion: insertionSortBy,
  merge: mergeSortBy,
  quick: quickSortBy,
}

export interface DTNode {
  id: number
  /** Question "is item x smaller than item y?" (items are 0-based labels a, b, c…). */
  q: [number, number] | null
  yes: number | null
  no: number | null
  /** For leaves: the output order of labels. */
  output: number[] | null
  depth: number
  /** Input permutations (rank vectors) whose run passes through this node. */
  inputs: number[][]
}

export interface DecisionTree {
  nodes: DTNode[]
  n: number
  height: number
  leaves: number
}

export function permutations(n: number): number[][] {
  if (n === 0) return [[]]
  const res: number[][] = []
  for (const p of permutations(n - 1)) for (let i = 0; i <= p.length; i++) res.push([...p.slice(0, i), n - 1, ...p.slice(i)])
  return res
}

/**
 * ranks[x] is the rank (0 = smallest) of item x in the hidden input.
 * Returns the list of (question, answer) pairs and the output.
 */
export function runWithOracle(algo: DTAlgo, ranks: number[]): { path: { q: [number, number]; yes: boolean }[]; output: number[] } {
  const path: { q: [number, number]; yes: boolean }[] = []
  const less: Less = (x, y) => {
    const yes = ranks[x] < ranks[y]
    path.push({ q: [x, y], yes })
    return yes
  }
  const output = DT_SORTERS[algo](
    ranks.map((_, i) => i),
    less,
  )
  return { path, output }
}

export function buildDecisionTree(algo: DTAlgo, n: number): DecisionTree {
  const nodes: DTNode[] = [{ id: 0, q: null, yes: null, no: null, output: null, depth: 0, inputs: [] }]
  for (const ranks of permutations(n)) {
    const { path, output } = runWithOracle(algo, ranks)
    let cur = 0
    nodes[cur].inputs.push(ranks)
    for (const { q, yes } of path) {
      const node = nodes[cur]
      if (node.q === null && node.output === null) node.q = q
      else if (!node.q || node.q[0] !== q[0] || node.q[1] !== q[1]) throw new Error('Algoritma deterministik değil: aynı geçmişte farklı soru sordu.')
      const branch = yes ? 'yes' : 'no'
      if (node[branch] === null) {
        nodes.push({ id: nodes.length, q: null, yes: null, no: null, output: null, depth: node.depth + 1, inputs: [] })
        node[branch] = nodes.length - 1
      }
      cur = node[branch]!
      nodes[cur].inputs.push(ranks)
    }
    nodes[cur].output = output
  }
  const leaves = nodes.filter((x) => x.output !== null).length
  const height = nodes.reduce((m, x) => Math.max(m, x.depth), 0)
  return { nodes, n, height, leaves }
}

export function factorial(n: number): number {
  let f = 1
  for (let i = 2; i <= n; i++) f *= i
  return f
}

/** log2(n!) computed as a sum of logs (no overflow). */
export function log2Factorial(n: number): number {
  let s = 0
  for (let i = 2; i <= n; i++) s += Math.log2(i)
  return s
}

export const LABELS = ['a', 'b', 'c', 'd', 'e']
