import type { Trace, TraceStep } from '../trace/types'
import type { MNode, TNode } from './tree'
import type { NodeRole } from './bst'
import { RBTree, type RBState } from './redBlack'
import { tx } from '../i18n/lang'

/**
 * Red-black tree deletion (CLRS 13.4). Lecture 7 only covers insertion in detail; this follows the usual case names.
 * After a black position leaves the tree, the child x that took its place carries an "extra black":
 *   Case 1: sibling w red → recolor and rotate so that x gets a black sibling.
 *   Case 2: w black, both of w's children black → color w red, the extra black moves up to the parent.
 *   Case 3: w black, near child red, far child black → rotate at w so that the far child becomes red.
 *   Case 4: w black, far child red → recolor and rotate at the parent; the extra black disappears.
 */
export const RB_DELETE_CODE = [
  'delete_rb(z):',
  '    y = z if z has at most one child, else successor(z)',
  '    x = the only child of y (maybe NIL); splice y out, y takes z’s place and color',
  '    if the removed color was red: done                # no path lost a black',
  '    fixup(x)                                          # x carries an extra black',
  '',
  'fixup(x):',
  '    while x is not the root and color(x) == black:',
  '        p = parent(x); w = sibling(x)',
  '        if color(w) == red:                           # Case 1',
  '            color(w) = black; color(p) = red; rotate at p toward x',
  '        elif both children of w are black:            # Case 2',
  '            color(w) = red; x = p',
  '        else:',
  '            if the far child of w is black:           # Case 3',
  '                color(near) = black; color(w) = red; rotate at w away from x',
  '            color(w) = color(p); color(p) = black      # Case 4',
  '            color(far) = black; rotate at p toward x; x = root',
  '    color(x) = black',
]

export interface RBDeleteState extends Omit<RBState, 'caseNo'> {
  caseNo: 1 | 2 | 3 | 4 | null
}

interface Rec {
  trace: Trace<RBDeleteState>
  comparisons: number
  rotations: number
  recolors: number
}

const isRed = (x: MNode | null) => !!x && x.color === 'R'

function deleteImpl(t: RBTree, key: number, rec: Rec | null): boolean {
  const roles: Record<number, NodeRole> = {}
  const labels: Record<number, string> = {}
  const clear = (o: Record<number, unknown>) => {
    for (const k of Object.keys(o)) delete o[Number(k)]
  }
  const emit = (caseNo: RBDeleteState['caseNo'], step: Omit<TraceStep<RBDeleteState>, 'state' | 'counters'>) => {
    if (!rec) return
    rec.trace.push({
      ...step,
      state: { root: t.snapshot(), roles: { ...roles }, labels: { ...labels }, caseNo },
      counters: { [tx('karşılaştırma', 'comparisons')]: rec.comparisons, [tx('yeniden boyama', 'recolorings')]: rec.recolors, [tx('rotasyon', 'rotations')]: rec.rotations },
    })
  }
  const paint = (n: MNode, c: 'R' | 'B') => {
    if (n.color !== c && rec) rec.recolors++
    n.color = c
  }
  const colorName = (c: 'R' | 'B') => (c === 'R' ? tx('kırmızı', 'red') : tx('siyah', 'black'))
  const redName = (n: MNode | null) => (isRed(n) ? tx('kırmızı', 'red') : tx('siyah', 'black'))

  // 1. Search for z.
  let z = t.root
  while (z && z.key !== key) {
    if (rec) rec.comparisons++
    roles[z.key] = 'path'
    const goLeft = key < z.key
    emit(null, {
      line: 1,
      phase: tx('Arama', 'Search'),
      explain: tx(`${key} ${goLeft ? '<' : '>'} ${z.key}: ${goLeft ? 'sola' : 'sağa'} in.`, `${key} ${goLeft ? '<' : '>'} ${z.key}: go ${goLeft ? 'left' : 'right'}.`),
    })
    z = goLeft ? z.left : z.right
  }
  if (!z) {
    emit(null, { line: 1, phase: tx('Arama', 'Search'), explain: tx(`${key} ağaçta yok; silinecek bir şey yok.`, `${key} is not in the tree; there is nothing to delete.`) })
    return false
  }
  if (rec) rec.comparisons++
  clear(roles)
  roles[z.key] = 'removed'
  labels[z.key] = 'z'

  // 2. Choose y (the position that really leaves the tree) and splice it out.
  let y: MNode = z
  if (z.left && z.right) {
    y = z.right
    while (y.left) y = y.left
    roles[y.key] = 'successor'
    labels[y.key] = 'y'
    const opts = [...new Set([y.key, z.left.key, z.right.key])]
    emit(null, {
      line: 2,
      phase: tx('BST silme', 'BST delete'),
      explain: tx(
        `z = ${z.key} iki çocuklu. Ardılı y = ${y.key} (sağ alt ağacın en küçüğü) z'nin yerine ve rengine geçecek; ağaçtan fiilen ayrılan, y'nin eski konumu. O konumun rengi ${colorName(y.color)}.`,
        `z = ${z.key} has two children. Its successor y = ${y.key} (the minimum of the right subtree) takes z's place and color; what actually leaves the tree is y's old position. That position is ${colorName(y.color)}.`,
      ),
      predict:
        opts.length > 1
          ? {
              question: tx(`${z.key} silinirken onun yerine hangi anahtar geçer?`, `When ${z.key} is deleted, which key takes its place?`),
              options: opts.map(String),
              answer: 0,
              why: tx(`Ardıl, sağ alt ağaçta hep sola inilerek bulunur: ${y.key}.`, `The successor is found by always going left in the right subtree: ${y.key}.`),
            }
          : undefined,
    })
  } else {
    emit(null, {
      line: 2,
      phase: tx('BST silme', 'BST delete'),
      explain: tx(`z = ${z.key} en fazla bir çocuklu; doğrudan çıkarılır, çocuğu (varsa) yerine geçer. Ayrılan konumun rengi ${colorName(z.color)}.`, `z = ${z.key} has at most one child; it is removed directly and its child (if any) takes its place. The removed position is ${colorName(z.color)}.`),
    })
  }
  const removedColor = y.color
  const x0 = y.left ?? y.right
  let xParent: MNode | null
  const transplant = (u: MNode, v: MNode | null) => {
    if (!u.parent) t.root = v
    else if (u === u.parent.left) u.parent.left = v
    else u.parent.right = v
    if (v) v.parent = u.parent
  }
  if (y === z) {
    xParent = z.parent
    transplant(z, x0)
  } else {
    if (y.parent === z) xParent = y
    else {
      xParent = y.parent
      transplant(y, y.right)
      y.right = z.right
      y.right!.parent = y
    }
    transplant(z, y)
    y.left = z.left
    y.left!.parent = y
    y.color = z.color
  }
  clear(roles)
  let xNode: MNode | null = x0
  let xp: MNode | null = xParent
  const markX = () => {
    clear(labels)
    if (xNode) labels[xNode.key] = 'x'
    if (xp) labels[xp.key] = 'p'
  }
  const xName = () => (xNode ? String(xNode.key) : tx(`NIL (${xp ? xp.key : '—'} altında)`, `NIL (under ${xp ? xp.key : '—'})`))
  markX()

  if (removedColor === 'R') {
    emit(null, {
      line: 4,
      phase: tx('Kırmızı ayrıldı', 'A red left'),
      explain: tx('Ayrılan konum kırmızıydı: hiçbir yol siyah düğüm kaybetmedi ve kırmızı-kırmızı oluşmadı. Düzeltme gerekmez.', 'The position that left was red: no path lost a black node and no red-red pair appeared. No fix-up is needed.'),
    })
  } else {
    emit(null, {
      line: 5,
      phase: tx('Ekstra siyah', 'Extra black'),
      explain: tx(
        `Ayrılan konum siyahtı: oradan geçen yollar bir siyah kaybetti (özellik 5 bozuldu). Yerine gelen x = ${xName()} bir "ekstra siyah" taşıyor sayılır.`,
        `The position that left was black: paths through it lost one black (property 5 broke). The x = ${xName()} that took its place is said to carry an "extra black".`,
      ),
    })
    // 3. Fix-up.
    while (xNode !== t.root && !isRed(xNode)) {
      const p = xp!
      const xIsLeft = p.left === xNode
      // x's side is one black short, so the sibling w cannot be NIL.
      let w = (xIsLeft ? p.right : p.left)!
      const near = () => (xIsLeft ? w.left : w.right)
      const far = () => (xIsLeft ? w.right : w.left)
      const rotToward = (n: MNode) => (xIsLeft ? t.rotateLeft(n) : t.rotateRight(n))
      const rotAway = (n: MNode) => (xIsLeft ? t.rotateRight(n) : t.rotateLeft(n))
      const label = () => {
        markX()
        labels[w.key] = 'w'
      }
      label()
      const caseNo: 1 | 2 | 3 | 4 = w.color === 'R' ? 1 : !isRed(w.left) && !isRed(w.right) ? 2 : !isRed(far()) ? 3 : 4
      emit(caseNo, {
        line: 9,
        phase: tx('Durum belirleme', 'Choosing the case'),
        explain: tx(
          `x = ${xName()} ekstra siyah taşıyor. Kardeşi w = ${w.key} (${colorName(w.color)}); w'nin yakın çocuğu ${near()?.key ?? 'NIL'} (${redName(near())}), uzak çocuğu ${far()?.key ?? 'NIL'} (${redName(far())}).`,
          `x = ${xName()} carries the extra black. Its sibling w = ${w.key} (${colorName(w.color)}); w's near child is ${near()?.key ?? 'NIL'} (${redName(near())}), its far child ${far()?.key ?? 'NIL'} (${redName(far())}).`,
        ),
        predict: {
          question: tx('Hangi silme durumu uygulanır?', 'Which deletion case applies?'),
          options: [
            tx('Durum 1: kardeş kırmızı', 'Case 1: the sibling is red'),
            tx('Durum 2: kardeş ve iki çocuğu siyah', 'Case 2: the sibling and both its children are black'),
            tx('Durum 3: yakın çocuk kırmızı, uzak çocuk siyah', 'Case 3: near child red, far child black'),
            tx('Durum 4: uzak çocuk kırmızı', 'Case 4: the far child is red'),
          ],
          answer: caseNo - 1,
          why: [
            '',
            tx('Kardeş kırmızı: önce bir rotasyonla x’e siyah bir kardeş kazandırılır.', 'The sibling is red: a rotation first gives x a black sibling.'),
            tx('Kardeşin kırmızı çocuğu yok: kardeşten bir siyah “geri alınır” ve sorun yukarı taşınır.', 'The sibling has no red child: one black is “taken back” from the sibling and the problem moves up.'),
            tx('Kırmızı çocuk yakın tarafta: önce w etrafında döndürüp onu uzak tarafa taşırız.', 'The red child is on the near side: we first rotate at w to move it to the far side.'),
            tx('Uzak çocuk kırmızı: tek rotasyon ve boyama ekstra siyahı yok eder.', 'The far child is red: one rotation plus recoloring removes the extra black.'),
          ][caseNo],
        },
      })
      if (caseNo === 1) {
        paint(w, 'B')
        paint(p, 'R')
        if (rec) rec.rotations++
        rotToward(p)
        w = (xIsLeft ? p.right : p.left)!
        label()
        emit(1, {
          line: 11,
          phase: tx('Durum 1', 'Case 1'),
          explain: tx(
            `Durum 1: eski kardeş siyaha, p = ${p.key} kırmızıya boyandı ve p etrafında x'e doğru döndürüldü. Siyah sayıları değişmedi; x'in yeni kardeşi w = ${w.key} siyah. Durum 2, 3 ya da 4 ile devam.`,
            `Case 1: the old sibling was colored black, p = ${p.key} red, and we rotated at p toward x. Black counts are unchanged; x's new sibling w = ${w.key} is black. Continue with case 2, 3 or 4.`,
          ),
        })
        continue
      }
      if (caseNo === 2) {
        paint(w, 'R')
        xNode = p
        xp = p.parent
        markX()
        labels[w.key] = 'w'
        emit(2, {
          line: 13,
          phase: tx('Durum 2', 'Case 2'),
          explain: isRed(p)
            ? tx(`Durum 2: w = ${w.key} kırmızıya boyandı; ekstra siyah p = ${p.key}'ye çıktı. p kırmızı olduğu için döngü biter ve p siyaha boyanır.`, `Case 2: w = ${w.key} was colored red; the extra black moved up to p = ${p.key}. Since p is red, the loop ends and p is colored black.`)
            : tx(`Durum 2: w = ${w.key} kırmızıya boyandı. Artık p = ${p.key}'nin iki tarafı da bir siyah eksik; ekstra siyah p'ye çıkar ve döngü p'den devam eder.`, `Case 2: w = ${w.key} was colored red. Now both sides of p = ${p.key} are one black short; the extra black moves up to p and the loop continues there.`),
        })
        continue
      }
      if (caseNo === 3) {
        const n = near()!
        paint(n, 'B')
        paint(w, 'R')
        if (rec) rec.rotations++
        rotAway(w)
        w = (xIsLeft ? p.right : p.left)!
        label()
        emit(3, {
          line: 16,
          phase: tx('Durum 3', 'Case 3'),
          explain: tx(
            `Durum 3: yakın çocuk ${n.key} siyaha, eski kardeş kırmızıya boyandı ve x'ten uzağa döndürüldü. Yeni kardeş w = ${w.key}'nin uzak çocuğu artık kırmızı: Durum 4.`,
            `Case 3: the near child ${n.key} was colored black, the old sibling red, and we rotated away from x. The new sibling w = ${w.key} now has a red far child: case 4.`,
          ),
        })
      }
      const f = far()!
      if (w.color !== p.color && rec) rec.recolors++
      w.color = p.color
      paint(p, 'B')
      paint(f, 'B')
      if (rec) rec.rotations++
      rotToward(p)
      clear(labels)
      labels[w.key] = 'w'
      labels[p.key] = 'p'
      emit(4, {
        line: 18,
        phase: tx('Durum 4', 'Case 4'),
        explain: tx(
          `Durum 4: w = ${w.key}, p'nin rengini aldı; p = ${p.key} ve uzak çocuk ${f.key} siyaha boyandı; p etrafında x'e doğru döndürüldü. x tarafına bir siyah eklendi, öbür taraf siyah sayısını korudu: ekstra siyah yok oldu.`,
          `Case 4: w = ${w.key} took p's color; p = ${p.key} and the far child ${f.key} were colored black; we rotated at p toward x. One black was added on x's side while the other side kept its count: the extra black is gone.`,
        ),
      })
      xNode = t.root
      xp = null
    }
    if (xNode && xNode.color === 'R') {
      paint(xNode, 'B')
      clear(labels)
      labels[xNode.key] = 'x'
      emit(null, { line: 19, phase: tx('Son boyama', 'Final recolor'), explain: tx(`x = ${xNode.key} siyaha boyandı ve ekstra siyahı üstlendi.`, `x = ${xNode.key} was colored black and absorbed the extra black.`) })
    } else if (xNode && xNode === t.root) {
      clear(labels)
      emit(null, {
        line: 19,
        phase: tx('Kök', 'Root'),
        explain: tx('Ekstra siyah köke ulaştı: kökten geçen her yol aynı anda bir siyah kaybettiği için özellik 5 yeniden sağlanır.', 'The extra black reached the root: every path lost one black at the same time, so property 5 holds again.'),
      })
    }
  }
  clear(labels)
  clear(roles)
  emit(null, { line: 1, phase: tx('Bitti', 'Done'), explain: tx(`${key} silindi; beş kırmızı-siyah özelliğin tümü sağlanıyor.`, `${key} deleted; all five red-black properties hold.`) })
  return true
}

export function rbDeleteTrace(start: TNode | null, key: number): { trace: Trace<RBDeleteState>; result: TNode | null; deleted: boolean } {
  const t = RBTree.from(start)
  const rec: Rec = { trace: [], comparisons: 0, rotations: 0, recolors: 0 }
  const deleted = deleteImpl(t, key, rec)
  return { trace: rec.trace, result: t.snapshot(), deleted }
}

export function rbDelete(start: TNode | null, key: number): TNode | null {
  const t = RBTree.from(start)
  deleteImpl(t, key, null)
  return t.snapshot()
}
