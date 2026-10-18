import type { Trace, TraceStep } from '../trace/types'
import { MNode, snap, fromSnap, type TNode } from './tree'

/** Binary search tree operations from the Lecture 7 notes (distinct keys). */
export const BST_SEARCH_CODE = [
  'search(x, i):',
  '    if key(x) == i: return x',
  '    else if i < key(x):',
  '        if left(x) == NIL: return x',
  '        else: return search(left(x), i)',
  '    else if i > key(x):',
  '        if right(x) == NIL: return x',
  '        else: return search(right(x), i)',
]

export const BST_INSERT_CODE = [
  'insert(i):',
  '    x = search(i)',
  '    y = new node: key(y) = i, left(y) = right(y) = NIL, p(y) = x',
  '    if i < key(x): left(x) = y',
  '    else: right(x) = y',
]

export const BST_DELETE_CODE = [
  'delete(i):',
  '    x = search(i); if key(x) ≠ i: return',
  '    if x has no children: replace x by NIL in its parent',
  '    else if x has one child c: lift c into x’s position',
  '    else:  # two children',
  '        z = successor(x) = min of right subtree (no left child)',
  '        lift z’s right child into z’s position',
  '        replace x by z',
]

export type NodeRole = 'current' | 'path' | 'found' | 'new' | 'removed' | 'successor' | 'focus'

export interface TreeState {
  root: TNode | null
  roles: Record<number, NodeRole>
  /** Optional ghost key shown next to a node (e.g. the value being inserted). */
  probe: { key: number; at: number | null } | null
}

export type TreeOp = 'insert' | 'search' | 'delete' | 'min' | 'max'

interface Ctx {
  trace: Trace<TreeState>
  comparisons: number
}

function pushT(ctx: Ctx, root: MNode | null, roles: Record<number, NodeRole>, step: Omit<TraceStep<TreeState>, 'state' | 'counters'>, probe: TreeState['probe'] = null) {
  ctx.trace.push({ ...step, state: { root: snap(root, false), roles: { ...roles }, probe }, counters: { 'karşılaştırma': ctx.comparisons } })
}

/** Descends like search(i); returns the node where search stops. Records one step per comparison. */
function descend(ctx: Ctx, root: MNode, key: number, roles: Record<number, NodeRole>, line0: number): MNode {
  let x = root
  for (;;) {
    ctx.comparisons++
    roles[x.key] = 'current'
    if (key === x.key) {
      pushT(ctx, root, roles, { line: line0 + 1, explain: `key(x) = ${x.key} = ${key}: anahtar bulundu.`, vars: { 'key(x)': x.key, i: key } }, { key, at: x.key })
      return x
    }
    const goLeft = key < x.key
    const next = goLeft ? x.left : x.right
    pushT(
      ctx,
      root,
      roles,
      {
        line: goLeft ? line0 + 2 : line0 + 5,
        explain: `${key} ${goLeft ? '<' : '>'} ${x.key}: ${goLeft ? 'sol' : 'sağ'} alt ağaca ${next ? 'iniyoruz' : 'bakıyoruz, ama orası NIL; arama bu düğümde durur'}.`,
        vars: { 'key(x)': x.key, i: key },
        predict: {
          question: `${key} aranıyor ve şu anki düğüm ${x.key}. Arama hangi yöne devam eder?`,
          options: ['Sol çocuğa', 'Sağ çocuğa'],
          answer: goLeft ? 0 : 1,
          why: goLeft
            ? `${key} < ${x.key}; BST özelliğine göre ${x.key}'den küçük tüm anahtarlar sol alt ağaçtadır.`
            : `${key} > ${x.key}; BST özelliğine göre ${x.key}'den büyük tüm anahtarlar sağ alt ağaçtadır.`,
        },
      },
      { key, at: x.key },
    )
    if (!next) return x
    roles[x.key] = 'path'
    x = next
  }
}

function replaceChild(parent: MNode | null, old: MNode, nu: MNode | null, rootRef: { root: MNode | null }) {
  if (nu) nu.parent = parent
  if (!parent) rootRef.root = nu
  else if (parent.left === old) parent.left = nu
  else parent.right = nu
}

export function bstOperationTrace(start: TNode | null, op: TreeOp, key: number): { trace: Trace<TreeState>; result: TNode | null; message: string } {
  const ctx: Ctx = { trace: [], comparisons: 0 }
  const ref = { root: fromSnap(start) }
  const roles: Record<number, NodeRole> = {}
  let message = ''

  if (op === 'min' || op === 'max') {
    if (!ref.root) {
      pushT(ctx, null, roles, { explain: 'Ağaç boş.' })
      return { trace: ctx.trace, result: null, message: 'Ağaç boş.' }
    }
    let x = ref.root
    for (;;) {
      roles[x.key] = 'current'
      const next = op === 'min' ? x.left : x.right
      pushT(ctx, ref.root, roles, { explain: next ? `${x.key}: ${op === 'min' ? 'sol' : 'sağ'} çocuk var, daha ${op === 'min' ? 'küçük' : 'büyük'} anahtarlar orada.` : `${x.key}: ${op === 'min' ? 'sol' : 'sağ'} çocuk NIL. ${op === 'min' ? 'En küçük' : 'En büyük'} anahtar ${x.key}.` })
      if (!next) break
      roles[x.key] = 'path'
      x = next
    }
    roles[x.key] = 'found'
    message = `${op === 'min' ? 'Minimum' : 'Maksimum'}: ${x.key}`
    pushT(ctx, ref.root, roles, { explain: `${message}. Yol uzunluğu ağacın yüksekliğini aşamaz: O(h).` })
    return { trace: ctx.trace, result: snap(ref.root, false), message }
  }

  if (!ref.root) {
    if (op === 'insert') {
      ref.root = new MNode(key)
      roles[key] = 'new'
      pushT(ctx, ref.root, roles, { line: 3, explain: `Ağaç boştu: ${key} kök olarak eklendi.` })
      return { trace: ctx.trace, result: snap(ref.root, false), message: `${key} eklendi.` }
    }
    pushT(ctx, null, roles, { explain: 'Ağaç boş; aranacak ya da silinecek düğüm yok.' })
    return { trace: ctx.trace, result: null, message: 'Ağaç boş.' }
  }

  const x = descend(ctx, ref.root, key, roles, 1)
  if (op === 'search') {
    if (x.key === key) {
      roles[x.key] = 'found'
      message = `${key} bulundu.`
    } else {
      roles[x.key] = 'focus'
      message = `${key} ağaçta yok; search, ${key} eklenseydi ebeveyni olacak düğümü (${x.key}) döndürür.`
    }
    pushT(ctx, ref.root, roles, { line: 1, explain: message }, { key, at: x.key })
    return { trace: ctx.trace, result: snap(ref.root, false), message }
  }

  if (op === 'insert') {
    if (x.key === key) {
      roles[x.key] = 'found'
      message = `${key} zaten ağaçta. Ders notlarında anahtarlar farklı varsayıldığı için ekleme yapılmadı.`
      pushT(ctx, ref.root, roles, { line: 2, explain: message })
      return { trace: ctx.trace, result: snap(ref.root, false), message }
    }
    const y = new MNode(key)
    y.parent = x
    if (key < x.key) x.left = y
    else x.right = y
    roles[x.key] = 'path'
    roles[key] = 'new'
    message = `${key}, ${x.key} düğümünün ${key < x.key ? 'sol' : 'sağ'} çocuğu olarak eklendi.`
    pushT(ctx, ref.root, roles, { line: key < x.key ? 4 : 5, explain: `${message} search'ün durduğu düğümün o tarafı NIL olmak zorundaydı.` })
    return { trace: ctx.trace, result: snap(ref.root, false), message }
  }

  // delete
  if (x.key !== key) {
    roles[x.key] = 'focus'
    message = `${key} ağaçta yok; silinecek bir şey yok.`
    pushT(ctx, ref.root, roles, { line: 2, explain: message })
    return { trace: ctx.trace, result: snap(ref.root, false), message }
  }
  roles[x.key] = 'removed'
  if (!x.left && !x.right) {
    pushT(ctx, ref.root, roles, { line: 3, phase: '1. durum', explain: `${key} bir yaprak (çocuğu yok): ebeveynindeki işaretçi NIL yapılır.` })
    replaceChild(x.parent, x, null, ref)
    delete roles[key]
    message = `${key} silindi (yaprak).`
  } else if (!x.left || !x.right) {
    const c = (x.left ?? x.right)!
    roles[c.key] = 'focus'
    pushT(ctx, ref.root, roles, { line: 4, phase: '2. durum', explain: `${key} yalnızca bir çocuğa (${c.key}) sahip: ${c.key} alt ağacı ${key}'in yerine yükseltilir.` })
    replaceChild(x.parent, x, c, ref)
    delete roles[key]
    message = `${key} silindi; yerine ${c.key} geçti.`
  } else {
    let z = x.right!
    roles[z.key] = 'path'
    pushT(ctx, ref.root, roles, { line: 6, phase: '3. durum', explain: `${key} iki çocuğa sahip. Ardılını (successor) arıyoruz: sağ alt ağaçtaki en küçük anahtar. Önce sağ çocuk ${z.key}.` })
    while (z.left) {
      ctx.comparisons++
      z = z.left
      roles[z.key] = 'path'
      pushT(ctx, ref.root, roles, { line: 6, phase: '3. durum', explain: `Sol çocuk var: ${z.key}'e iniyoruz.` })
    }
    roles[z.key] = 'successor'
    pushT(ctx, ref.root, roles, { line: 6, phase: '3. durum', explain: `Ardıl z = ${z.key} (sol çocuğu yok). ${key}'ten büyük en küçük anahtar bu.` })
    if (z.parent !== x) {
      replaceChild(z.parent, z, z.right, ref)
      z.right = x.right
      z.right!.parent = z
      pushT(ctx, ref.root, roles, { line: 7, phase: '3. durum', explain: `z'nin ${z.right ? 'sağ alt ağacı' : 'boş sağ tarafı'} z'nin eski yerine bağlandı; z artık ${key}'in yerine geçmeye hazır.` })
    }
    z.left = x.left
    z.left!.parent = z
    replaceChild(x.parent, x, z, ref)
    delete roles[key]
    roles[z.key] = 'found'
    message = `${key} silindi; yerine ardılı ${z.key} geçti.`
    pushT(ctx, ref.root, roles, { line: 8, phase: '3. durum', explain: `${message} BST özelliği korunur: ${z.key}, ${key}'in sol alt ağacındaki her şeyden büyük, sağ alt ağaçta kalan her şeyden küçük.` })
    return { trace: ctx.trace, result: snap(ref.root, false), message }
  }
  pushT(ctx, ref.root, roles, { line: 1, explain: message })
  return { trace: ctx.trace, result: snap(ref.root, false), message }
}

/** Plain (non-traced) insert used to build trees quickly. Duplicate keys are ignored. */
export function bstInsert(t: TNode | null, key: number): TNode {
  if (!t) return { key, left: null, right: null }
  if (key === t.key) return t
  return key < t.key ? { ...t, left: bstInsert(t.left, key) } : { ...t, right: bstInsert(t.right, key) }
}

export function bstFromSequence(keys: readonly number[]): TNode | null {
  let t: TNode | null = null
  for (const k of keys) t = bstInsert(t, k)
  return t
}

export function bstDelete(t: TNode | null, key: number): TNode | null {
  return bstOperationTrace(t, 'delete', key).result
}

/** Number of key comparisons search(i) performs. */
export function searchCost(t: TNode | null, key: number): number {
  let c = 0
  while (t) {
    c++
    if (key === t.key) return c
    const next: TNode | null = key < t.key ? t.left : t.right
    if (!next) return c
    t = next
  }
  return c
}
