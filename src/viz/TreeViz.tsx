import { useMemo, useState } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'
import { TraceViewer } from '../components/TraceViewer'
import { TreeView } from '../components/TreeView'
import { ArrayInput } from '../components/ArrayInput'
import { BST_DELETE_CODE, BST_INSERT_CODE, BST_SEARCH_CODE, bstFromSequence, bstOperationTrace, searchCost, type TreeOp, type TreeState } from '../engines/bst'
import { RB_INSERT_CODE, rbFromSequence, rbInsertTrace, type RBState } from '../engines/redBlack'
import { RB_DELETE_CODE, rbDeleteTrace, type RBDeleteState } from '../engines/redBlackDelete'
import { checkRedBlack, height, inorder, isBST, size, toggleColor, type TNode, blackHeight } from '../engines/tree'
import { makeRng, randomPermutation } from '../engines/random'
import type { Trace } from '../trace/types'
import { Tex } from '../components/Tex'
import { tx } from '../i18n/lang'

const seqPresets = () => [
  { label: tx('Ön alıştırma ağacı', 'Pre-lecture tree'), values: [5, 3, 9, 1, 4, 6] },
  { label: tx('Dengeli sıra', 'Balanced order'), values: [8, 4, 12, 2, 6, 10, 14, 1, 3, 5, 7] },
  { label: tx('Sıralı (dejenere)', 'Sorted (degenerate)'), values: [1, 2, 3, 4, 5, 6, 7, 8] },
  { label: tx('Zikzak', 'Zigzag'), values: [1, 8, 2, 7, 3, 6, 4, 5] },
]

const opLabel = (): Record<TreeOp, string> => ({
  insert: tx('Ekle', 'Insert'),
  search: tx('Ara', 'Search'),
  delete: tx('Sil', 'Delete'),
  min: 'Minimum',
  max: tx('Maksimum', 'Maximum'),
})

function concatTraces<S>(parts: Trace<S>[]): Trace<S> {
  return parts.flat()
}

function buildBstTrace(keys: number[]): Trace<TreeState> {
  let t: TNode | null = null
  const parts: Trace<TreeState>[] = []
  for (const k of keys) {
    const r = bstOperationTrace(t, 'insert', k)
    parts.push(r.trace)
    t = r.result
  }
  return parts.length ? concatTraces(parts) : [{ state: { root: null, roles: {}, probe: null }, explain: tx('Boş ağaç.', 'Empty tree.') }]
}

/* ───────────── BST ───────────── */

export function BSTViz() {
  const SEQ_PRESETS = seqPresets()
  const OP_LABEL = opLabel()
  const [seq, setSeq] = useState(SEQ_PRESETS[0].values)
  const [tree, setTree] = useState<TNode | null>(() => bstFromSequence(SEQ_PRESETS[0].values))
  const [trace, setTrace] = useState<Trace<TreeState>>(() => buildBstTrace(SEQ_PRESETS[0].values))
  const [title, setTitle] = useState(tx('Ağacı kur: ', 'Build the tree: ') + SEQ_PRESETS[0].values.join(', '))
  const [op, setOp] = useState<TreeOp>('insert')
  const [keyText, setKeyText] = useState('7')
  const [err, setErr] = useState<string | null>(null)
  const [runId, setRunId] = useState(0)

  const build = (v: number[]) => {
    setSeq(v)
    setTree(bstFromSequence(v))
    setTrace(buildBstTrace(v))
    setTitle(tx('Ağacı kur: ', 'Build the tree: ') + v.join(', '))
    setRunId((r) => r + 1)
  }
  const run = () => {
    const needsKey = op === 'insert' || op === 'search' || op === 'delete'
    const k = Number(keyText)
    if (needsKey && (!Number.isFinite(k) || keyText.trim() === '' || Math.abs(k) > 999)) {
      setErr(tx('Geçerli bir anahtar girin (−999…999; ondalıklı arama, ör. 4.5, de mümkün).', 'Enter a valid key (−999…999; fractional search, e.g. 4.5, is also possible).'))
      return
    }
    if (op === 'insert' && (size(tree) >= 31 || !Number.isInteger(k))) {
      setErr(size(tree) >= 31 ? tx('Okunabilirlik için en fazla 31 düğüm.', 'At most 31 nodes, for readability.') : tx('Eklenen anahtarlar tam sayı olmalı.', 'Inserted keys must be integers.'))
      return
    }
    setErr(null)
    const r = bstOperationTrace(tree, op, k)
    setTrace(r.trace)
    setTree(r.result)
    setTitle(`${OP_LABEL[op]}${needsKey ? ' ' + k : ''}: ${r.message}`)
    setRunId((x) => x + 1)
  }
  const code = op === 'delete' ? BST_DELETE_CODE : op === 'insert' ? BST_INSERT_CODE : BST_SEARCH_CODE
  const toolbar = (
    <>
      <ArrayInput value={seq} onChange={build} presets={SEQ_PRESETS} options={{ maxLength: 20, distinct: true, min: -99, max: 99 }} random={() => randomPermutation(makeRng(Date.now() % 7919), 10)} label={tx('Ekleme sırası (ağacı yeniden kurar)', 'Insertion order (rebuilds the tree)')}
        hint={tx('Farklı tam sayılar, en fazla 20. Aynı küme farklı sıralarla farklı ağaçlar verir.', 'Distinct integers, at most 20. The same set in different orders gives different trees.')} />
      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault()
          run()
        }}
      >
        <label className="field">
          {tx('İşlem', 'Operation')}
          <select className="input" value={op} onChange={(e) => setOp(e.target.value as TreeOp)}>
            {(Object.keys(OP_LABEL) as TreeOp[]).map((o) => (
              <option key={o} value={o}>
                {OP_LABEL[o]}
              </option>
            ))}
          </select>
        </label>
        {(op === 'insert' || op === 'search' || op === 'delete') && (
          <label className="field">
            {tx('Anahtar', 'Key')}
            <input className="input mono" style={{ width: 80 }} value={keyText} onChange={(e) => setKeyText(e.target.value)} aria-invalid={!!err} />
          </label>
        )}
        <button className="btn primary" type="submit" style={{ alignSelf: 'flex-end' }}>
          {tx('Çalıştır', 'Run')}
        </button>
      </form>
      {err && (
        <div className="error-msg" role="alert" style={{ flexBasis: '100%' }}>
          {err}
        </div>
      )}
    </>
  )
  return (
    <TraceViewer
      key={runId}
      trace={trace}
      label={tx('İkili arama ağacı görselleştirmesi', 'Binary search tree visualization')}
      toolbar={toolbar}
      code={code}
      render={(step) => (
        <div className="stack">
          <div className="small">
            <strong>{title}</strong>
          </div>
          <TreeView root={step.state.root} roles={step.state.roles} probe={step.state.probe} label="BST" />
        </div>
      )}
      side={(step) => <TreeStats t={step.state.root} />}
      legend={
        <span className="muted">
          {tx(
            'Halka: turuncu = şu anki düğüm, kesikli mor = yol, yeşil = bulundu/yeni, kırmızı = silinecek. Etiket kutusu aranan anahtardır.',
            'Ring: orange = current node, dashed purple = path, green = found/new, red = to be removed. The label box is the key being searched for.',
          )}
        </span>
      }
    />
  )
}

function TreeStats({ t, rb = false }: { t: TNode | null; rb?: boolean }) {
  const n = size(t)
  const h = height(t)
  return (
    <div>
      <span className="label-tag">{tx('Ağaç ölçüleri', 'Tree measures')}</span>
      <dl className="kv">
        <div>
          <dt>n</dt>
          <dd>{n}</dd>
        </div>
        <div>
          <dt>{tx('yükseklik h', 'height h')}</dt>
          <dd>{h < 0 ? '—' : h}</dd>
        </div>
        <div>
          <dt>{tx('en az h = ⌊log₂n⌋', 'minimum h = ⌊log₂n⌋')}</dt>
          <dd>{n ? Math.floor(Math.log2(n)) : '—'}</dd>
        </div>
        {rb && (
          <div>
            <dt>2·log₂(n+1)</dt>
            <dd>{n ? (2 * Math.log2(n + 1)).toFixed(2) : '—'}</dd>
          </div>
        )}
      </dl>
      <p className="small muted" style={{ marginTop: 6 }}>
        {tx('Sıralı dolaşım (inorder)', 'In-order traversal')}: <span className="mono">{inorder(t).join(' ') || '—'}</span>
      </p>
    </div>
  )
}

/* ───────────── Red-black tree ───────────── */

function buildRbTrace(keys: number[]): { trace: Trace<RBState>; tree: TNode | null } {
  let t: TNode | null = null
  const parts: Trace<RBState>[] = []
  for (const k of keys) {
    const r = rbInsertTrace(t, k)
    parts.push(r.trace)
    t = r.result
  }
  return { trace: parts.length ? parts.flat() : [{ state: { root: null, roles: {}, labels: {}, caseNo: null }, explain: tx('Boş ağaç.', 'Empty tree.') }], tree: t }
}

export function RBViz() {
  const [seq, setSeq] = useState([10, 20, 30, 15, 25, 5, 1])
  const initial = useMemo(() => buildRbTrace([10, 20, 30, 15, 25, 5, 1]), [])
  const [tree, setTree] = useState<TNode | null>(initial.tree)
  const [trace, setTrace] = useState<Trace<RBDeleteState>>(initial.trace)
  const [keyText, setKeyText] = useState('12')
  const [lastOp, setLastOp] = useState<'insert' | 'delete'>('insert')
  const [err, setErr] = useState<string | null>(null)
  const [runId, setRunId] = useState(0)

  const build = (v: number[]) => {
    const r = buildRbTrace(v)
    setSeq(v)
    setTree(r.tree)
    setTrace(r.trace)
    setLastOp('insert')
    setRunId((x) => x + 1)
  }
  const run = (op: 'insert' | 'delete') => {
    const k = Number(keyText)
    if (!Number.isInteger(k) || Math.abs(k) > 999 || keyText.trim() === '') {
      setErr(tx('−999…999 aralığında bir tam sayı girin.', 'Enter an integer in the range −999…999.'))
      return
    }
    if (op === 'insert' && size(tree) >= 31) {
      setErr(tx('Okunabilirlik için en fazla 31 düğüm.', 'At most 31 nodes, for readability.'))
      return
    }
    setErr(null)
    const r = op === 'insert' ? rbInsertTrace(tree, k) : rbDeleteTrace(tree, k)
    setLastOp(op)
    setTree(r.result)
    setTrace(r.trace)
    setRunId((x) => x + 1)
  }
  const toolbar = (
    <>
      <ArrayInput
        value={seq}
        onChange={build}
        presets={[
          { label: tx('Karışık', 'Shuffled'), values: [10, 20, 30, 15, 25, 5, 1] },
          { label: tx('Sıralı 1…10', 'Sorted 1…10'), values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
          { label: tx('Durum 3 üçgen', 'Case 3 triangle'), values: [10, 5, 7] },
          { label: tx('Durum 2 zinciri', 'Case 2 chain'), values: [10, 5, 15, 3, 7, 1] },
        ]}
        options={{ maxLength: 20, distinct: true, min: -99, max: 99 }}
        random={() => randomPermutation(makeRng(Date.now() % 7907), 12)}
        label={tx('Ekleme sırası (ağacı yeniden kurar)', 'Insertion order (rebuilds the tree)')}
        hint={tx(
          'Farklı tam sayılar, en fazla 20. Ağaç kurulduktan sonra aşağıdan tek tek anahtar ekleyip silebilirsiniz.',
          'Distinct integers, at most 20. Once the tree is built you can insert and delete single keys below.',
        )}
      />
      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault()
          run('insert')
        }}
      >
        <label className="field">
          {tx('Anahtar', 'Key')}
          <input className="input mono" style={{ width: 80 }} value={keyText} onChange={(e) => setKeyText(e.target.value)} aria-invalid={!!err} />
        </label>
        <button className="btn primary" type="submit" style={{ alignSelf: 'flex-end' }}>
          insert_rb
        </button>
        <button className="btn" type="button" style={{ alignSelf: 'flex-end' }} onClick={() => run('delete')}>
          delete_rb
        </button>
      </form>
      {err && (
        <div className="error-msg" role="alert" style={{ flexBasis: '100%' }}>
          {err}
        </div>
      )}
    </>
  )
  return (
    <TraceViewer
      key={runId}
      trace={trace}
      label={tx('Kırmızı-siyah ağaç görselleştirmesi', 'Red-black tree visualization')}
      toolbar={toolbar}
      code={lastOp === 'insert' ? RB_INSERT_CODE : RB_DELETE_CODE}
      render={(step) => {
        const checks = checkRedBlack(step.state.root)
        const bad = checks.flatMap((c) => (c.id === 4 ? c.offenders : c.id === 2 ? c.offenders : []))
        return (
          <div className="stack">
            {step.state.caseNo && <span className="badge accent">{tx('Durum', 'Case')} {step.state.caseNo}</span>}
            <TreeView root={step.state.root} roles={step.state.roles} labels={step.state.labels} bad={bad} label={tx("Kırmızı-siyah ağaç", "Red-black tree")} />
          </div>
        )
      }}
      side={(step) => (
        <>
          <InvariantPanel t={step.state.root} />
          <TreeStats t={step.state.root} rb />
        </>
      )}
      legend={
        <span className="muted">
          {tx(
            'Dolgu rengi düğüm rengidir; ekran okuyucular için ayrıca “kırmızı/siyah” olarak etiketlenir. Eklemede x, p, u, g: düğüm, ebeveyn, amca, büyük ebeveyn. Silmede z: silinen, y: ardıl, x: ekstra siyahı taşıyan, w: x’in kardeşi. “!” = ihlal.',
            'The fill color is the node color; for screen readers it is also labelled “red/black”. In insertion x, p, u, g: node, parent, uncle, grandparent. In deletion z: deleted, y: successor, x: carrier of the extra black, w: x’s sibling. “!” = violation.',
          )}
        </span>
      }
    />
  )
}

const propText = (id: number): string =>
  [
    '',
    tx('Her düğüm kırmızı ya da siyah', 'Every node is red or black'),
    tx('Kök siyah', 'The root is black'),
    tx('NIL’ler siyah', 'NILs are black'),
    tx('Kırmızı düğümün çocukları siyah', 'Children of a red node are black'),
    tx('Her x için tüm x→NIL yollarında eşit sayıda siyah düğüm', 'For every x, all x→NIL paths have the same number of black nodes'),
  ][id]

export function InvariantPanel({ t }: { t: TNode | null }) {
  const checks = checkRedBlack(t)
  const bst = isBST(t)
  return (
    <div>
      <span className="label-tag">{tx('Değişmez denetleyicisi', 'Invariant checker')}</span>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }} className="small" aria-live="polite">
        <li className="row" style={{ gap: 6, flexWrap: 'nowrap', alignItems: 'flex-start' }}>
          {bst ? <CheckCircle2 size={15} color="var(--st-sorted)" aria-hidden /> : <XCircle size={15} color="var(--st-bad)" aria-hidden />}
          <span>
            <strong>{tx('BST özelliği', 'BST property')}</strong> — {bst ? tx('sağlanıyor', 'holds') : tx('BOZUK', 'BROKEN')}
          </span>
        </li>
        {checks.map((c) => (
          <li key={c.id} className="row" style={{ gap: 6, flexWrap: 'nowrap', alignItems: 'flex-start' }}>
            {c.holds ? <CheckCircle2 size={15} color="var(--st-sorted)" aria-hidden style={{ flex: 'none', marginTop: 3 }} /> : <XCircle size={15} color="var(--st-bad)" aria-hidden style={{ flex: 'none', marginTop: 3 }} />}
            <span>
              <strong>
                {c.id}. {propText(c.id)}
              </strong>{' '}
              <span className="sr-only">{c.holds ? tx('sağlanıyor', 'holds') : tx('ihlal', 'violated')}</span>
              {!c.holds && <span style={{ color: 'var(--st-bad)' }}> — {c.message}</span>}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Toggle node colors to explore which colorings are valid red-black trees. */
export function RBPlayground() {
  const [base, setBase] = useState<'valid' | 'path'>('valid')
  const start = useMemo(() => (base === 'valid' ? rbFromSequence([8, 4, 12, 2, 6, 10, 14, 1, 3]) : rbFromSequence([2, 1, 3, 4, 5])), [base])
  const [t, setT] = useState<TNode | null>(start)
  const checks = checkRedBlack(t)
  const bad = [...new Set(checks.flatMap((c) => (c.holds ? [] : c.offenders)))]
  const valid = checks.every((c) => c.holds)
  return (
    <div className="card viz">
      <div className="viz-toolbar">
        <span className="small grow">
          {tx(
            'Bir düğüme tıklayın (veya odaklanıp Enter’a basın) ve rengini değiştirin. Hangi renklendirmeler geçerli bir kırmızı-siyah ağaç verir?',
            'Click a node (or focus it and press Enter) to change its color. Which colorings give a valid red-black tree?',
          )}
        </span>
        <div className="seg" role="group" aria-label={tx('Başlangıç ağacı', 'Starting tree')}>
          <button aria-pressed={base === 'valid'} onClick={() => { setBase('valid'); setT(rbFromSequence([8, 4, 12, 2, 6, 10, 14, 1, 3])) }}>
            {tx('9 düğümlü ağaç', '9-node tree')}
          </button>
          <button aria-pressed={base === 'path'} onClick={() => { setBase('path'); setT(rbFromSequence([2, 1, 3, 4, 5])) }}>
            {tx('5 düğümlü ağaç', '5-node tree')}
          </button>
        </div>
        <button className="btn sm" onClick={() => setT(start)}>
          {tx('Geçerli renklere dön', 'Back to valid colors')}
        </button>
      </div>
      <div className="viz-body">
        <div className="viz-stage">
          <div role="status" className={'feedback ' + (valid ? 'ok' : 'no')} style={{ marginBottom: 12 }}>
            {valid ? (
              <>
                {tx(
                  `Geçerli bir kırmızı-siyah ağaç. Kökün siyah yüksekliği b(r) = ${blackHeight(t)} (NIL dahil, kök hariç).`,
                  `A valid red-black tree. The black height of the root is b(r) = ${blackHeight(t)} (NIL included, root excluded).`,
                )}
              </>
            ) : (
              <>
                {tx('Geçersiz:', 'Invalid:')} {checks.filter((c) => !c.holds).map((c) => `${tx('özellik', 'property')} ${c.id}`).join(', ')}{' '}
                {tx('bozuluyor. “!” ile işaretli düğümlere bakın.', 'broken. Look at the nodes marked “!”.')}
              </>
            )}
          </div>
          <TreeView root={t} bad={bad} label={tx('Renkleri düzenlenebilir ağaç', 'Tree with editable colors')} onNodeClick={(k) => setT((x) => toggleColor(x, k))} />
        </div>
        <div className="viz-side">
          <InvariantPanel t={t} />
        </div>
      </div>
    </div>
  )
}

/* ───────────── BST vs RB comparison ───────────── */

export function TreeCompare() {
  const [seq, setSeq] = useState([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
  const bst = useMemo(() => bstFromSequence(seq), [seq])
  const rb = useMemo(() => rbFromSequence(seq), [seq])
  const avg = (t: TNode | null) => (seq.length ? seq.reduce((s, k) => s + searchCost(t, k), 0) / seq.length : 0)
  const worst = (t: TNode | null) => (seq.length ? Math.max(...seq.map((k) => searchCost(t, k))) : 0)
  return (
    <div className="card viz">
      <div className="viz-toolbar">
        <ArrayInput
          value={seq}
          onChange={setSeq}
          presets={[
            { label: tx('Sıralı 1…12', 'Sorted 1…12'), values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
            { label: tx('Ters sıralı', 'Reverse sorted'), values: [12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1] },
            { label: tx('Karışık', 'Shuffled'), values: [7, 3, 11, 1, 5, 9, 13, 2, 4, 6, 8, 10, 12] },
          ]}
          options={{ maxLength: 24, distinct: true, min: -99, max: 99 }}
          random={() => randomPermutation(makeRng(Date.now() % 7901), 14)}
          label={tx('Aynı ekleme sırası her iki ağaca uygulanır', 'The same insertion order is applied to both trees')}
        />
      </div>
      <div className="viz-stage">
        <div className="table-wrap">
          <table className="data" style={{ maxWidth: 640 }}>
            <thead>
              <tr>
                <th>{tx('Ölçü', 'Measure')}</th>
                <th>{tx('Sıradan BST', 'Plain BST')}</th>
                <th>{tx('Kırmızı-siyah ağaç', 'Red-black tree')}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{tx('Yükseklik', 'Height')}</td>
                <td className="num">{height(bst)}</td>
                <td className="num">{height(rb)}</td>
              </tr>
              <tr>
                <td>{tx('Başarılı aramada ortalama karşılaştırma', 'Average comparisons in a successful search')}</td>
                <td className="num">{avg(bst).toFixed(2)}</td>
                <td className="num">{avg(rb).toFixed(2)}</td>
              </tr>
              <tr>
                <td>{tx('En kötü arama karşılaştırması', 'Worst-case search comparisons')}</td>
                <td className="num">{worst(bst)}</td>
                <td className="num">{worst(rb)}</td>
              </tr>
              <tr>
                <td>
                  {tx('Garanti edilen yükseklik sınırı', 'Guaranteed height bound')} (n = {seq.length})
                </td>
                <td className="num">n − 1 = {Math.max(0, seq.length - 1)}</td>
                <td className="num">
                  <Tex>{`2\\log_2(n+1) \\approx ${(2 * Math.log2(seq.length + 1)).toFixed(2)}`}</Tex>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginTop: 16 }}>
          <div>
            <h3>{tx('Sıradan BST', 'Plain BST')}</h3>
            <TreeView root={bst} label={tx('Sıradan BST', 'Plain BST')} minWidth={260} />
          </div>
          <div>
            <h3>{tx('Kırmızı-siyah ağaç', 'Red-black tree')}</h3>
            <TreeView root={rb} label={tx("Kırmızı-siyah ağaç", "Red-black tree")} minWidth={260} />
          </div>
        </div>
        <p className="small muted">
          {tx(
            'Sayılar bu tek ekleme sırası için ölçülmüştür. Kırmızı-siyah ağacın O(log n) yüksekliği ise her ekleme sırası için kanıtlanmış bir garantidir.',
            'The numbers are measured for this single insertion order. The O(log n) height of the red-black tree, however, is a proven guarantee for every insertion order.',
          )}
        </p>
      </div>
    </div>
  )
}
