import type { Trace, TraceStep } from '../trace/types'
import { MNode, snap, fromSnap, type TNode } from './tree'
import { tx } from '../i18n/lang'

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
  ctx.trace.push({ ...step, state: { root: snap(root, false), roles: { ...roles }, probe }, counters: { [tx('karşılaştırma', 'comparisons')]: ctx.comparisons } })
}

/** Descends like search(i); returns the node where search stops. Records one step per comparison. */
function descend(ctx: Ctx, root: MNode, key: number, roles: Record<number, NodeRole>, line0: number): MNode {
  let x = root
  for (;;) {
    ctx.comparisons++
    roles[x.key] = 'current'
    if (key === x.key) {
      pushT(ctx, root, roles, { line: line0 + 1, explain: tx(`key(x) = ${x.key} = ${key}: anahtar bulundu.`, `key(x) = ${x.key} = ${key}: key found.`), vars: { 'key(x)': x.key, i: key } }, { key, at: x.key })
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
        explain: tx(`${key} ${goLeft ? '<' : '>'} ${x.key}: ${goLeft ? 'sol' : 'sağ'} alt ağaca ${next ? 'iniyoruz' : 'bakıyoruz, ama orası NIL; arama bu düğümde durur'}.`, `${key} ${goLeft ? '<' : '>'} ${x.key}: ${next ? `we go down into the ${goLeft ? 'left' : 'right'} subtree` : `we look at the ${goLeft ? 'left' : 'right'} subtree, but it is NIL; the search stops at this node`}.`),
        vars: { 'key(x)': x.key, i: key },
        predict: {
          question: tx(`${key} aranıyor ve şu anki düğüm ${x.key}. Arama hangi yöne devam eder?`, `Searching for ${key}; the current node is ${x.key}. Which way does the search continue?`),
          options: [tx('Sol çocuğa', 'To the left child'), tx('Sağ çocuğa', 'To the right child')],
          answer: goLeft ? 0 : 1,
          why: goLeft
            ? tx(`${key} < ${x.key}; BST özelliğine göre ${x.key}'den küçük tüm anahtarlar sol alt ağaçtadır.`, `${key} < ${x.key}; by the BST property all keys smaller than ${x.key} are in the left subtree.`)
            : tx(`${key} > ${x.key}; BST özelliğine göre ${x.key}'den büyük tüm anahtarlar sağ alt ağaçtadır.`, `${key} > ${x.key}; by the BST property all keys larger than ${x.key} are in the right subtree.`),
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
      pushT(ctx, null, roles, { explain: tx('Ağaç boş.', 'The tree is empty.') })
      return { trace: ctx.trace, result: null, message: tx('Ağaç boş.', 'The tree is empty.') }
    }
    let x = ref.root
    for (;;) {
      roles[x.key] = 'current'
      const next = op === 'min' ? x.left : x.right
      pushT(ctx, ref.root, roles, { explain: next ? tx(`${x.key}: ${op === 'min' ? 'sol' : 'sağ'} çocuk var, daha ${op === 'min' ? 'küçük' : 'büyük'} anahtarlar orada.`, `${x.key}: there is a ${op === 'min' ? 'left' : 'right'} child; ${op === 'min' ? 'smaller' : 'larger'} keys are there.`) : tx(`${x.key}: ${op === 'min' ? 'sol' : 'sağ'} çocuk NIL. ${op === 'min' ? 'En küçük' : 'En büyük'} anahtar ${x.key}.`, `${x.key}: the ${op === 'min' ? 'left' : 'right'} child is NIL. The ${op === 'min' ? 'smallest' : 'largest'} key is ${x.key}.`) })
      if (!next) break
      roles[x.key] = 'path'
      x = next
    }
    roles[x.key] = 'found'
    message = tx(`${op === 'min' ? 'Minimum' : 'Maksimum'}: ${x.key}`, `${op === 'min' ? 'Minimum' : 'Maximum'}: ${x.key}`)
    pushT(ctx, ref.root, roles, { explain: tx(`${message}. Yol uzunluğu ağacın yüksekliğini aşamaz: O(h).`, `${message}. The path length cannot exceed the tree height: O(h).`) })
    return { trace: ctx.trace, result: snap(ref.root, false), message }
  }

  if (!ref.root) {
    if (op === 'insert') {
      ref.root = new MNode(key)
      roles[key] = 'new'
      pushT(ctx, ref.root, roles, { line: 3, explain: tx(`Ağaç boştu: ${key} kök olarak eklendi.`, `The tree was empty: ${key} was inserted as the root.`) })
      return { trace: ctx.trace, result: snap(ref.root, false), message: tx(`${key} eklendi.`, `${key} inserted.`) }
    }
    pushT(ctx, null, roles, { explain: tx('Ağaç boş; aranacak ya da silinecek düğüm yok.', 'The tree is empty; there is no node to search for or delete.') })
    return { trace: ctx.trace, result: null, message: tx('Ağaç boş.', 'The tree is empty.') }
  }

  const x = descend(ctx, ref.root, key, roles, 1)
  if (op === 'search') {
    if (x.key === key) {
      roles[x.key] = 'found'
      message = tx(`${key} bulundu.`, `${key} found.`)
    } else {
      roles[x.key] = 'focus'
      message = tx(`${key} ağaçta yok; search, ${key} eklenseydi ebeveyni olacak düğümü (${x.key}) döndürür.`, `${key} is not in the tree; search returns the node that would be its parent if ${key} were inserted (${x.key}).`)
    }
    pushT(ctx, ref.root, roles, { line: 1, explain: message }, { key, at: x.key })
    return { trace: ctx.trace, result: snap(ref.root, false), message }
  }

  if (op === 'insert') {
    if (x.key === key) {
      roles[x.key] = 'found'
      message = tx(`${key} zaten ağaçta. Ders notlarında anahtarlar farklı varsayıldığı için ekleme yapılmadı.`, `${key} is already in the tree. Since the lecture notes assume distinct keys, nothing was inserted.`)
      pushT(ctx, ref.root, roles, { line: 2, explain: message })
      return { trace: ctx.trace, result: snap(ref.root, false), message }
    }
    const y = new MNode(key)
    y.parent = x
    if (key < x.key) x.left = y
    else x.right = y
    roles[x.key] = 'path'
    roles[key] = 'new'
    message = tx(`${key}, ${x.key} düğümünün ${key < x.key ? 'sol' : 'sağ'} çocuğu olarak eklendi.`, `${key} was inserted as the ${key < x.key ? 'left' : 'right'} child of ${x.key}.`)
    pushT(ctx, ref.root, roles, { line: key < x.key ? 4 : 5, explain: tx(`${message} search'ün durduğu düğümün o tarafı NIL olmak zorundaydı.`, `${message} That side of the node where search stopped had to be NIL.`) })
    return { trace: ctx.trace, result: snap(ref.root, false), message }
  }

  // delete
  if (x.key !== key) {
    roles[x.key] = 'focus'
    message = tx(`${key} ağaçta yok; silinecek bir şey yok.`, `${key} is not in the tree; there is nothing to delete.`)
    pushT(ctx, ref.root, roles, { line: 2, explain: message })
    return { trace: ctx.trace, result: snap(ref.root, false), message }
  }
  roles[x.key] = 'removed'
  if (!x.left && !x.right) {
    pushT(ctx, ref.root, roles, { line: 3, phase: tx('1. durum', 'Case 1'), explain: tx(`${key} bir yaprak (çocuğu yok): ebeveynindeki işaretçi NIL yapılır.`, `${key} is a leaf (no children): the pointer in its parent is set to NIL.`) })
    replaceChild(x.parent, x, null, ref)
    delete roles[key]
    message = tx(`${key} silindi (yaprak).`, `${key} deleted (leaf).`)
  } else if (!x.left || !x.right) {
    const c = (x.left ?? x.right)!
    roles[c.key] = 'focus'
    pushT(ctx, ref.root, roles, { line: 4, phase: tx('2. durum', 'Case 2'), explain: tx(`${key} yalnızca bir çocuğa (${c.key}) sahip: ${c.key} alt ağacı ${key}'in yerine yükseltilir.`, `${key} has only one child (${c.key}): the subtree of ${c.key} is promoted into ${key}'s place.`) })
    replaceChild(x.parent, x, c, ref)
    delete roles[key]
    message = tx(`${key} silindi; yerine ${c.key} geçti.`, `${key} deleted; ${c.key} took its place.`)
  } else {
    let z = x.right!
    roles[z.key] = 'path'
    pushT(ctx, ref.root, roles, { line: 6, phase: tx('3. durum', 'Case 3'), explain: tx(`${key} iki çocuğa sahip. Ardılını (successor) arıyoruz: sağ alt ağaçtaki en küçük anahtar. Önce sağ çocuk ${z.key}.`, `${key} has two children. We look for its successor: the smallest key in the right subtree. First the right child ${z.key}.`) })
    while (z.left) {
      ctx.comparisons++
      z = z.left
      roles[z.key] = 'path'
      pushT(ctx, ref.root, roles, { line: 6, phase: tx('3. durum', 'Case 3'), explain: tx(`Sol çocuk var: ${z.key}'e iniyoruz.`, `There is a left child: we go down to ${z.key}.`) })
    }
    roles[z.key] = 'successor'
    pushT(ctx, ref.root, roles, { line: 6, phase: tx('3. durum', 'Case 3'), explain: tx(`Ardıl z = ${z.key} (sol çocuğu yok). ${key}'ten büyük en küçük anahtar bu.`, `Successor z = ${z.key} (it has no left child). It is the smallest key larger than ${key}.`) })
    if (z.parent !== x) {
      replaceChild(z.parent, z, z.right, ref)
      z.right = x.right
      z.right!.parent = z
      pushT(ctx, ref.root, roles, { line: 7, phase: tx('3. durum', 'Case 3'), explain: tx(`z'nin ${z.right ? 'sağ alt ağacı' : 'boş sağ tarafı'} z'nin eski yerine bağlandı; z artık ${key}'in yerine geçmeye hazır.`, `z's ${z.right ? 'right subtree' : 'empty right side'} was linked into z's old place; z is now ready to take ${key}'s place.`) })
    }
    z.left = x.left
    z.left!.parent = z
    replaceChild(x.parent, x, z, ref)
    delete roles[key]
    roles[z.key] = 'found'
    message = tx(`${key} silindi; yerine ardılı ${z.key} geçti.`, `${key} deleted; its successor ${z.key} took its place.`)
    pushT(ctx, ref.root, roles, { line: 8, phase: tx('3. durum', 'Case 3'), explain: tx(`${message} BST özelliği korunur: ${z.key}, ${key}'in sol alt ağacındaki her şeyden büyük, sağ alt ağaçta kalan her şeyden küçük.`, `${message} The BST property is preserved: ${z.key} is larger than everything in ${key}'s left subtree and smaller than everything left in the right subtree.`) })
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
