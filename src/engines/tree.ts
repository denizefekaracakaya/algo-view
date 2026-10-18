/** Immutable tree snapshots shared by the BST and red-black tree engines and the tree renderer. */
export type Color = 'R' | 'B'

export interface TNode {
  key: number
  left: TNode | null
  right: TNode | null
  color?: Color
}

/** Mutable node used internally by the engines (has a parent pointer). */
export class MNode {
  key: number
  left: MNode | null = null
  right: MNode | null = null
  parent: MNode | null = null
  color: Color = 'R'
  constructor(key: number, color: Color = 'R') {
    this.key = key
    this.color = color
  }
}

export function snap(x: MNode | null, withColor: boolean): TNode | null {
  if (!x) return null
  const n: TNode = { key: x.key, left: snap(x.left, withColor), right: snap(x.right, withColor) }
  if (withColor) n.color = x.color
  return n
}

export function fromSnap(t: TNode | null, parent: MNode | null = null): MNode | null {
  if (!t) return null
  const m = new MNode(t.key, t.color ?? 'B')
  m.parent = parent
  m.left = fromSnap(t.left, m)
  m.right = fromSnap(t.right, m)
  return m
}

/** Height = number of edges on the longest root-to-leaf path (as in the Lecture 7 slides). Empty tree: −1. */
export function height(t: TNode | null): number {
  if (!t) return -1
  return 1 + Math.max(height(t.left), height(t.right))
}

export function size(t: TNode | null): number {
  return t ? 1 + size(t.left) + size(t.right) : 0
}

export function inorder(t: TNode | null, out: number[] = []): number[] {
  if (!t) return out
  inorder(t.left, out)
  out.push(t.key)
  inorder(t.right, out)
  return out
}

export function isBST(t: TNode | null, lo = -Infinity, hi = Infinity): boolean {
  if (!t) return true
  if (!(t.key > lo && t.key < hi)) return false
  return isBST(t.left, lo, t.key) && isBST(t.right, t.key, hi)
}

/** Finds the node with the given key (or null). */
export function findNode(t: TNode | null, key: number): TNode | null {
  while (t && t.key !== key) t = key < t.key ? t.left : t.right
  return t
}

/** Toggles the color of the node with `key` (returns a new tree). Used by the invariant playground. */
export function toggleColor(t: TNode | null, key: number): TNode | null {
  if (!t) return null
  if (t.key === key) return { ...t, color: t.color === 'R' ? 'B' : 'R' }
  return key < t.key ? { ...t, left: toggleColor(t.left, key) } : { ...t, right: toggleColor(t.right, key) }
}

export interface PropertyCheck {
  id: 1 | 2 | 3 | 4 | 5
  holds: boolean
  offenders: number[]
  message: string
}

/** Checks the five red-black properties exactly as listed in the Lecture 7 notes. */
export function checkRedBlack(t: TNode | null): PropertyCheck[] {
  const all: TNode[] = []
  const walk = (x: TNode | null) => {
    if (!x) return
    all.push(x)
    walk(x.left)
    walk(x.right)
  }
  walk(t)
  const uncolored = all.filter((x) => x.color !== 'R' && x.color !== 'B').map((x) => x.key)
  const p1: PropertyCheck = {
    id: 1,
    holds: uncolored.length === 0,
    offenders: uncolored,
    message: uncolored.length ? 'Bazı düğümlerin rengi yok.' : 'Her düğüm kırmızı ya da siyah.',
  }
  const rootOk = !t || t.color === 'B'
  const p2: PropertyCheck = {
    id: 2,
    holds: rootOk,
    offenders: rootOk ? [] : [t!.key],
    message: rootOk ? (t ? 'Kök siyah.' : 'Ağaç boş; kök özelliği kendiliğinden sağlanır.') : `Kök (${t!.key}) kırmızı.`,
  }
  const p3: PropertyCheck = { id: 3, holds: true, offenders: [], message: 'NIL yaprakları (çizilmeyen boş çocuklar) tanım gereği siyahtır.' }
  const redRed: number[] = []
  for (const x of all) {
    if (x.color !== 'R') continue
    for (const c of [x.left, x.right]) if (c && c.color === 'R') redRed.push(x.key, c.key)
  }
  const p4: PropertyCheck = {
    id: 4,
    holds: redRed.length === 0,
    offenders: [...new Set(redRed)],
    message: redRed.length ? `Kırmızı-kırmızı ihlali: ${pairs(redRed)}.` : 'Her kırmızı düğümün çocukları siyah.',
  }
  const badBH: number[] = []
  const bh = (x: TNode | null): number => {
    if (!x) return 1 // NIL is black
    const l = bh(x.left)
    const r = bh(x.right)
    if (l !== r) badBH.push(x.key)
    return Math.max(l, r) + (x.color === 'B' ? 1 : 0)
  }
  bh(t)
  const p5: PropertyCheck = {
    id: 5,
    holds: badBH.length === 0,
    offenders: badBH,
    message: badBH.length
      ? `Şu düğümlerde sol ve sağ NIL yollarındaki siyah düğüm sayısı farklı: ${badBH.join(', ')}.`
      : 'Her düğümden NIL’e giden tüm yollarda siyah düğüm sayısı aynı.',
  }
  return [p1, p2, p3, p4, p5]
}

function pairs(xs: number[]): string {
  const out: string[] = []
  for (let i = 0; i < xs.length; i += 2) out.push(`${xs[i]}→${xs[i + 1]}`)
  return out.join(', ')
}

export function isRedBlack(t: TNode | null): boolean {
  return isBST(t) && checkRedBlack(t).every((p) => p.holds)
}

/** Black height of the root (number of black nodes on any root→NIL path, excluding the root, NIL counted). */
export function blackHeight(t: TNode | null): number {
  if (!t) return 0
  let x: TNode | null = t.left
  let b = 0
  while (x) {
    if (x.color === 'B') b++
    x = x.left
  }
  return b + 1 // + NIL
}
