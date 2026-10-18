import type { Trace, TraceStep } from '../trace/types'
import { MNode, snap, fromSnap, type TNode } from './tree'
import type { NodeRole } from './bst'
import { tx } from '../i18n/lang'

/**
 * Red-black tree insertion (Lecture 7 notes, Algorithms 7–8; full case analysis as in CLRS 13.3).
 * Case numbering follows the notes:
 *   Case 1: parent p is black → done.
 *   Case 2: p red, uncle u red → recolor p, u black and grandparent red; continue at grandparent.
 *   Case 3: p red, uncle u black → (rotate at p first if x is an "inner" grandchild), then recolor and rotate at grandparent.
 */
export const RB_INSERT_CODE = [
  'insert_rb(i):',
  '    p = search(i); x = new node with key i as child of p',
  '    color(x) = red',
  '    recolor(x)',
  '',
  'recolor(x):            # x is red',
  '    if x is root: color(x) = black; return',
  '    p = parent(x); if color(p) == black: return      # Case 1',
  '    g = parent(p); u = sibling(p)                     # uncle',
  '    if color(u) == red:                               # Case 2',
  '        color(p) = black; color(u) = black; color(g) = red',
  '        recolor(g)',
  '    else:                                             # Case 3',
  '        if x is an inner grandchild: rotate at p, swap roles of x and p',
  '        color(p) = black; color(g) = red',
  '        rotate at g (right if p is a left child, else left)',
]

export interface RBState {
  root: TNode | null
  roles: Record<number, NodeRole>
  /** Labels shown next to nodes: x, p, u, g. */
  labels: Record<number, string>
  caseNo: 1 | 2 | 3 | null
}

export class RBTree {
  root: MNode | null = null

  static from(t: TNode | null): RBTree {
    const r = new RBTree()
    r.root = fromSnap(t)
    return r
  }

  snapshot(): TNode | null {
    return snap(this.root, true)
  }

  rotateLeft(x: MNode) {
    const y = x.right!
    x.right = y.left
    if (y.left) y.left.parent = x
    y.parent = x.parent
    if (!x.parent) this.root = y
    else if (x === x.parent.left) x.parent.left = y
    else x.parent.right = y
    y.left = x
    x.parent = y
  }

  rotateRight(x: MNode) {
    const y = x.left!
    x.left = y.right
    if (y.right) y.right.parent = x
    y.parent = x.parent
    if (!x.parent) this.root = y
    else if (x === x.parent.right) x.parent.right = y
    else x.parent.left = y
    y.right = x
    x.parent = y
  }

  /** Untraced insert. Returns false if the key already exists. */
  insert(key: number): boolean {
    return insertImpl(this, key, null)
  }
}

const isRed = (x: MNode | null) => !!x && x.color === 'R'

interface Rec {
  trace: Trace<RBState>
  comparisons: number
  rotations: number
  recolors: number
}

function push(t: RBTree, rec: Rec, roles: Record<number, NodeRole>, labels: Record<number, string>, caseNo: RBState['caseNo'], step: Omit<TraceStep<RBState>, 'state' | 'counters'>) {
  rec.trace.push({
    ...step,
    state: { root: t.snapshot(), roles: { ...roles }, labels: { ...labels }, caseNo },
    counters: { [tx('karşılaştırma', 'comparisons')]: rec.comparisons, [tx('yeniden boyama', 'recolorings')]: rec.recolors, [tx('rotasyon', 'rotations')]: rec.rotations },
  })
}

function insertImpl(t: RBTree, key: number, rec: Rec | null): boolean {
  const roles: Record<number, NodeRole> = {}
  const labels: Record<number, string> = {}
  const emit = (caseNo: RBState['caseNo'], step: Omit<TraceStep<RBState>, 'state' | 'counters'>) => rec && push(t, rec, roles, labels, caseNo, step)

  // 1. BST insert
  let parent: MNode | null = null
  let cur = t.root
  while (cur) {
    if (rec) rec.comparisons++
    if (key === cur.key) {
      roles[cur.key] = 'found'
      emit(null, { line: 2, explain: tx(`${key} zaten ağaçta; anahtarlar farklı varsayıldığından ekleme yapılmadı.`, `${key} is already in the tree; since keys are assumed distinct, nothing was inserted.`) })
      return false
    }
    roles[cur.key] = 'current'
    const goLeft = key < cur.key
    emit(null, {
      line: 2,
      phase: tx('BST ekleme', 'BST insert'),
      explain: tx(`${key} ${goLeft ? '<' : '>'} ${cur.key}: ${goLeft ? 'sola' : 'sağa'} in.`, `${key} ${goLeft ? '<' : '>'} ${cur.key}: go ${goLeft ? 'left' : 'right'}.`),
      predict: rec
        ? {
            question: tx(`${key} ekleniyor, şu anki düğüm ${cur.key}. Hangi yöne inilir?`, `Inserting ${key}; the current node is ${cur.key}. Which way do we go?`),
            options: [tx('Sola', 'Left'), tx('Sağa', 'Right')],
            answer: goLeft ? 0 : 1,
            why: tx(`Kırmızı-siyah ağaç da bir BST'dir: ${key} ${goLeft ? '<' : '>'} ${cur.key}.`, `A red-black tree is also a BST: ${key} ${goLeft ? '<' : '>'} ${cur.key}.`),
          }
        : undefined,
    })
    roles[cur.key] = 'path'
    parent = cur
    cur = goLeft ? cur.left : cur.right
  }
  let x = new MNode(key, 'R')
  x.parent = parent
  if (!parent) t.root = x
  else if (key < parent.key) parent.left = x
  else parent.right = x
  for (const k of Object.keys(roles)) delete roles[Number(k)]
  roles[key] = 'new'
  labels[key] = 'x'
  emit(null, {
    line: 3,
    phase: tx('BST ekleme', 'BST insert'),
    explain: tx(`${key} yeni bir KIRMIZI düğüm olarak eklendi. Kırmızı eklemek siyah yükseklikleri değiştirmez (özellik 5 korunur); yalnızca özellik 4 (kırmızı-kırmızı) bozulabilir.`, `${key} was inserted as a new RED node. Inserting red doesn't change black heights (property 5 holds); only property 4 (red-red) can break.`),
  })

  // 2. recolor / fix-up
  for (;;) {
    for (const k of Object.keys(labels)) delete labels[Number(k)]
    labels[x.key] = 'x'
    const p = x.parent
    if (!p) {
      if (x.color === 'R') {
        x.color = 'B'
        if (rec) rec.recolors++
        emit(null, { line: 7, phase: tx('Kök', 'Root'), explain: tx(`x = ${x.key} kök ve kırmızı: kökü siyaha boyuyoruz (özellik 2). Bu, tüm yollara 1 siyah ekler; özellik 5 korunur.`, `x = ${x.key} is the root and red: we color the root black (property 2). This adds 1 black to every path; property 5 holds.`) })
      } else emit(null, { line: 7, phase: tx('Kök', 'Root'), explain: tx(`x = ${x.key} kök ve siyah; düzeltme tamamlandı.`, `x = ${x.key} is the root and black; the fix-up is complete.`) })
      break
    }
    labels[p.key] = 'p'
    if (p.color === 'B') {
      emit(1, { line: 8, phase: tx('Durum 1', 'Case 1'), explain: tx(`Ebeveyn p = ${p.key} siyah: kırmızı x'in ebeveyni siyah olduğundan özellik 4 sağlanır. Bitti.`, `The parent p = ${p.key} is black: since red x has a black parent, property 4 holds. Done.`) })
      break
    }
    const g = p.parent! // p is red, so it is not the root
    const pIsLeft = g.left === p
    const u = pIsLeft ? g.right : g.left
    labels[g.key] = 'g'
    if (u) labels[u.key] = 'u'
    const caseNo: 2 | 3 = isRed(u) ? 2 : 3
    emit(caseNo, {
      line: 9,
      phase: tx('Durum belirleme', 'Choosing the case'),
      explain: tx(`x = ${x.key} ve ebeveyni p = ${p.key} ikisi de kırmızı (ihlal). Büyük ebeveyn g = ${g.key}, amca u = ${u ? u.key : 'NIL'} (${isRed(u) ? 'kırmızı' : 'siyah'}).`, `x = ${x.key} and its parent p = ${p.key} are both red (violation). Grandparent g = ${g.key}, uncle u = ${u ? u.key : 'NIL'} (${isRed(u) ? 'red' : 'black'}).`),
      predict: {
        question: tx(`p = ${p.key} kırmızı, amca u = ${u ? u.key : 'NIL'} ${isRed(u) ? 'kırmızı' : 'siyah'}. Hangi durum uygulanır?`, `p = ${p.key} is red, the uncle u = ${u ? u.key : 'NIL'} is ${isRed(u) ? 'red' : 'black'}. Which case applies?`),
        options: [tx('Durum 1: bir şey yapma', 'Case 1: do nothing'), tx('Durum 2: yeniden boya, g’de devam et', 'Case 2: recolor, continue at g'), tx('Durum 3: yeniden boya ve rotasyon yap', 'Case 3: recolor and rotate')],
        answer: caseNo - 1,
        why: isRed(u)
          ? tx('Amca kırmızı: p ve u siyaha, g kırmızıya boyanır; her yoldaki siyah sayısı değişmez ama g’de yeni bir ihlal oluşabilir.', 'The uncle is red: p and u are colored black and g red; the number of blacks on every path is unchanged, but a new violation may appear at g.')
          : tx('Amca siyah (NIL dahil): yalnızca boyama yetmez, g etrafında rotasyon gerekir.', 'The uncle is black (NIL included): recoloring alone is not enough; a rotation around g is needed.'),
      },
    })
    if (caseNo === 2) {
      p.color = 'B'
      u!.color = 'B'
      g.color = 'R'
      if (rec) rec.recolors += 3
      emit(2, {
        line: 11,
        phase: tx('Durum 2', 'Case 2'),
        explain: tx(`Durum 2: p = ${p.key} ve u = ${u!.key} siyaha, g = ${g.key} kırmızıya boyandı. g'nin altındaki her yolda bir kırmızı→siyah, bir siyah→kırmızı değişimi oldu; siyah sayısı aynı kaldı.`, `Case 2: p = ${p.key} and u = ${u!.key} were colored black, g = ${g.key} red. Every path below g had one red→black and one black→red change; the black count stayed the same.`),
      })
      x = g
      emit(2, { line: 12, phase: tx('Durum 2', 'Case 2'), explain: tx(`Şimdi g = ${g.key} kırmızı; onun ebeveyni de kırmızıysa ihlal yukarı taşınmış olabilir. recolor(${g.key}) ile devam.`, `Now g = ${g.key} is red; if its parent is red too, the violation may have moved up. Continue with recolor(${g.key}).`) })
      continue
    }
    // Case 3
    const xIsLeft = p.left === x
    let pp = p
    if (xIsLeft !== pIsLeft) {
      if (rec) rec.rotations++
      if (pIsLeft) t.rotateLeft(p)
      else t.rotateRight(p)
      emit(3, {
        line: 14,
        phase: tx('Durum 3', 'Case 3'),
        explain: tx(`x = ${x.key}, g'nin "iç" torunu (üçgen biçimi). Önce p = ${p.key} etrafında ${pIsLeft ? 'sola' : 'sağa'} rotasyon: x ile p'nin rolleri değişir ve durum "dış" (düz çizgi) biçimine döner.`, `x = ${x.key} is an "inner" grandchild of g (triangle shape). First a ${pIsLeft ? 'left' : 'right'} rotation around p = ${p.key}: x and p swap roles and the situation turns into the "outer" (straight line) shape.`),
      })
      pp = x
      x = p
      for (const k of Object.keys(labels)) delete labels[Number(k)]
      labels[x.key] = 'x'
      labels[pp.key] = 'p'
      labels[g.key] = 'g'
      if (u) labels[u.key] = 'u'
    }
    pp.color = 'B'
    g.color = 'R'
    if (rec) rec.recolors += 2
    emit(3, { line: 15, phase: tx('Durum 3', 'Case 3'), explain: tx(`p = ${pp.key} siyaha, g = ${g.key} kırmızıya boyandı (geçici olarak özellik 5 bozuk olabilir; rotasyon bunu düzeltecek).`, `p = ${pp.key} was colored black, g = ${g.key} red (property 5 may be temporarily broken; the rotation will fix it).`) })
    if (rec) rec.rotations++
    if (pIsLeft) t.rotateRight(g)
    else t.rotateLeft(g)
    emit(3, {
      line: 16,
      phase: tx('Durum 3', 'Case 3'),
      explain: tx(`g = ${g.key} etrafında ${pIsLeft ? 'sağa' : 'sola'} rotasyon. Siyah ${pp.key} artık bu alt ağacın kökü, iki çocuğu kırmızı: tüm yollardaki siyah sayısı eskisiyle aynı ve kırmızı-kırmızı ihlali kalmadı. Bitti.`, `A ${pIsLeft ? 'right' : 'left'} rotation around g = ${g.key}. The black ${pp.key} is now the root of this subtree with two red children: every path has the same number of blacks as before and no red-red violation is left. Done.`),
    })
    break
  }
  for (const k of Object.keys(labels)) delete labels[Number(k)]
  for (const k of Object.keys(roles)) delete roles[Number(k)]
  roles[key] = 'new'
  emit(null, { line: 4, phase: tx('Bitti', 'Done'), explain: tx(`${key} eklendi; beş kırmızı-siyah özelliğin tümü sağlanıyor.`, `${key} inserted; all five red-black properties hold.`) })
  return true
}

export function rbInsertTrace(start: TNode | null, key: number): { trace: Trace<RBState>; result: TNode | null; inserted: boolean } {
  const t = RBTree.from(start)
  const rec: Rec = { trace: [], comparisons: 0, rotations: 0, recolors: 0 }
  const inserted = insertImpl(t, key, rec)
  return { trace: rec.trace, result: t.snapshot(), inserted }
}

export function rbFromSequence(keys: readonly number[]): TNode | null {
  const t = new RBTree()
  for (const k of keys) t.insert(k)
  return t.snapshot()
}
