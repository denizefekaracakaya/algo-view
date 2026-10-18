import { useMemo, useState } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'
import { TraceViewer } from '../components/TraceViewer'
import { TreeView } from '../components/TreeView'
import { ArrayInput } from '../components/ArrayInput'
import { BST_DELETE_CODE, BST_INSERT_CODE, BST_SEARCH_CODE, bstFromSequence, bstOperationTrace, searchCost, type TreeOp, type TreeState } from '../engines/bst'
import { RB_INSERT_CODE, rbFromSequence, rbInsertTrace, type RBState } from '../engines/redBlack'
import { checkRedBlack, height, inorder, isBST, size, toggleColor, type TNode, blackHeight } from '../engines/tree'
import { makeRng, randomPermutation } from '../engines/random'
import type { Trace } from '../trace/types'
import { Tex } from '../components/Tex'

const SEQ_PRESETS = [
  { label: 'Ön alıştırma ağacı', values: [5, 3, 9, 1, 4, 6] },
  { label: 'Dengeli sıra', values: [8, 4, 12, 2, 6, 10, 14, 1, 3, 5, 7] },
  { label: 'Sıralı (dejenere)', values: [1, 2, 3, 4, 5, 6, 7, 8] },
  { label: 'Zikzak', values: [1, 8, 2, 7, 3, 6, 4, 5] },
]

const OP_LABEL: Record<TreeOp, string> = { insert: 'Ekle', search: 'Ara', delete: 'Sil', min: 'Minimum', max: 'Maksimum' }

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
  return parts.length ? concatTraces(parts) : [{ state: { root: null, roles: {}, probe: null }, explain: 'Boş ağaç.' }]
}

/* ───────────── BST ───────────── */

export function BSTViz() {
  const [seq, setSeq] = useState(SEQ_PRESETS[0].values)
  const [tree, setTree] = useState<TNode | null>(() => bstFromSequence(SEQ_PRESETS[0].values))
  const [trace, setTrace] = useState<Trace<TreeState>>(() => buildBstTrace(SEQ_PRESETS[0].values))
  const [title, setTitle] = useState('Ağacı kur: ' + SEQ_PRESETS[0].values.join(', '))
  const [op, setOp] = useState<TreeOp>('insert')
  const [keyText, setKeyText] = useState('7')
  const [err, setErr] = useState<string | null>(null)
  const [runId, setRunId] = useState(0)

  const build = (v: number[]) => {
    setSeq(v)
    setTree(bstFromSequence(v))
    setTrace(buildBstTrace(v))
    setTitle('Ağacı kur: ' + v.join(', '))
    setRunId((r) => r + 1)
  }
  const run = () => {
    const needsKey = op === 'insert' || op === 'search' || op === 'delete'
    const k = Number(keyText)
    if (needsKey && (!Number.isFinite(k) || keyText.trim() === '' || Math.abs(k) > 999)) {
      setErr('Geçerli bir anahtar girin (−999…999; ondalıklı arama, ör. 4.5, de mümkün).')
      return
    }
    if (op === 'insert' && (size(tree) >= 31 || !Number.isInteger(k))) {
      setErr(size(tree) >= 31 ? 'Okunabilirlik için en fazla 31 düğüm.' : 'Eklenen anahtarlar tam sayı olmalı.')
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
      <ArrayInput value={seq} onChange={build} presets={SEQ_PRESETS} options={{ maxLength: 20, distinct: true, min: -99, max: 99 }} random={() => randomPermutation(makeRng(Date.now() % 7919), 10)} label="Ekleme sırası (ağacı yeniden kurar)" hint="Farklı tam sayılar, en fazla 20. Aynı küme farklı sıralarla farklı ağaçlar verir." />
      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault()
          run()
        }}
      >
        <label className="field">
          İşlem
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
            Anahtar
            <input className="input mono" style={{ width: 80 }} value={keyText} onChange={(e) => setKeyText(e.target.value)} aria-invalid={!!err} />
          </label>
        )}
        <button className="btn primary" type="submit" style={{ alignSelf: 'flex-end' }}>
          Çalıştır
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
      label="İkili arama ağacı görselleştirmesi"
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
          Halka: turuncu = şu anki düğüm, kesikli mor = yol, yeşil = bulundu/yeni, kırmızı = silinecek. Etiket kutusu aranan anahtardır.
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
      <span className="label-tag">Ağaç ölçüleri</span>
      <dl className="kv">
        <div>
          <dt>n</dt>
          <dd>{n}</dd>
        </div>
        <div>
          <dt>yükseklik h</dt>
          <dd>{h < 0 ? '—' : h}</dd>
        </div>
        <div>
          <dt>en az h = ⌊log₂n⌋</dt>
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
        Sıralı dolaşım (inorder): <span className="mono">{inorder(t).join(' ') || '—'}</span>
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
  return { trace: parts.length ? parts.flat() : [{ state: { root: null, roles: {}, labels: {}, caseNo: null }, explain: 'Boş ağaç.' }], tree: t }
}

export function RBViz() {
  const [seq, setSeq] = useState([10, 20, 30, 15, 25, 5, 1])
  const initial = useMemo(() => buildRbTrace([10, 20, 30, 15, 25, 5, 1]), [])
  const [tree, setTree] = useState<TNode | null>(initial.tree)
  const [trace, setTrace] = useState<Trace<RBState>>(initial.trace)
  const [keyText, setKeyText] = useState('12')
  const [err, setErr] = useState<string | null>(null)
  const [runId, setRunId] = useState(0)

  const build = (v: number[]) => {
    const r = buildRbTrace(v)
    setSeq(v)
    setTree(r.tree)
    setTrace(r.trace)
    setRunId((x) => x + 1)
  }
  const insert = () => {
    const k = Number(keyText)
    if (!Number.isInteger(k) || Math.abs(k) > 999 || keyText.trim() === '') {
      setErr('−999…999 aralığında bir tam sayı girin.')
      return
    }
    if (size(tree) >= 31) {
      setErr('Okunabilirlik için en fazla 31 düğüm.')
      return
    }
    setErr(null)
    const r = rbInsertTrace(tree, k)
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
          { label: 'Karışık', values: [10, 20, 30, 15, 25, 5, 1] },
          { label: 'Sıralı 1…10', values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
          { label: 'Durum 3 üçgen', values: [10, 5, 7] },
          { label: 'Durum 2 zinciri', values: [10, 5, 15, 3, 7, 1] },
        ]}
        options={{ maxLength: 20, distinct: true, min: -99, max: 99 }}
        random={() => randomPermutation(makeRng(Date.now() % 7907), 12)}
        label="Ekleme sırası (ağacı yeniden kurar)"
        hint="Farklı tam sayılar, en fazla 20. Kırmızı-siyah silme bu derste ayrıntılı işlenmediği için yalnızca ekleme gösterilir."
      />
      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault()
          insert()
        }}
      >
        <label className="field">
          Anahtar ekle
          <input className="input mono" style={{ width: 80 }} value={keyText} onChange={(e) => setKeyText(e.target.value)} aria-invalid={!!err} />
        </label>
        <button className="btn primary" type="submit" style={{ alignSelf: 'flex-end' }}>
          insert_rb
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
      label="Kırmızı-siyah ağaç ekleme görselleştirmesi"
      toolbar={toolbar}
      code={RB_INSERT_CODE}
      render={(step) => {
        const checks = checkRedBlack(step.state.root)
        const bad = checks.flatMap((c) => (c.id === 4 ? c.offenders : c.id === 2 ? c.offenders : []))
        return (
          <div className="stack">
            {step.state.caseNo && <span className="badge accent">Durum {step.state.caseNo}</span>}
            <TreeView root={step.state.root} roles={step.state.roles} labels={step.state.labels} bad={bad} label="Kırmızı-siyah ağaç" />
          </div>
        )
      }}
      side={(step) => (
        <>
          <InvariantPanel t={step.state.root} />
          <TreeStats t={step.state.root} rb />
        </>
      )}
      legend={<span className="muted">Dolgu rengi düğüm rengidir; ekran okuyucular için ayrıca “kırmızı/siyah” olarak etiketlenir. x, p, u, g: düğüm, ebeveyn, amca, büyük ebeveyn. “!” = ihlal.</span>}
    />
  )
}

const PROP_TEXT: Record<number, string> = {
  1: 'Her düğüm kırmızı ya da siyah',
  2: 'Kök siyah',
  3: 'NIL’ler siyah',
  4: 'Kırmızı düğümün çocukları siyah',
  5: 'Her x için tüm x→NIL yollarında eşit sayıda siyah düğüm',
}

export function InvariantPanel({ t }: { t: TNode | null }) {
  const checks = checkRedBlack(t)
  const bst = isBST(t)
  return (
    <div>
      <span className="label-tag">Değişmez denetleyicisi</span>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }} className="small" aria-live="polite">
        <li className="row" style={{ gap: 6, flexWrap: 'nowrap', alignItems: 'flex-start' }}>
          {bst ? <CheckCircle2 size={15} color="var(--st-sorted)" aria-hidden /> : <XCircle size={15} color="var(--st-bad)" aria-hidden />}
          <span>
            <strong>BST özelliği</strong> — {bst ? 'sağlanıyor' : 'BOZUK'}
          </span>
        </li>
        {checks.map((c) => (
          <li key={c.id} className="row" style={{ gap: 6, flexWrap: 'nowrap', alignItems: 'flex-start' }}>
            {c.holds ? <CheckCircle2 size={15} color="var(--st-sorted)" aria-hidden style={{ flex: 'none', marginTop: 3 }} /> : <XCircle size={15} color="var(--st-bad)" aria-hidden style={{ flex: 'none', marginTop: 3 }} />}
            <span>
              <strong>
                {c.id}. {PROP_TEXT[c.id]}
              </strong>{' '}
              <span className="sr-only">{c.holds ? 'sağlanıyor' : 'ihlal'}</span>
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
        <span className="small grow">Bir düğüme tıklayın (veya odaklanıp Enter’a basın) ve rengini değiştirin. Hangi renklendirmeler geçerli bir kırmızı-siyah ağaç verir?</span>
        <div className="seg" role="group" aria-label="Başlangıç ağacı">
          <button aria-pressed={base === 'valid'} onClick={() => { setBase('valid'); setT(rbFromSequence([8, 4, 12, 2, 6, 10, 14, 1, 3])) }}>
            9 düğümlü ağaç
          </button>
          <button aria-pressed={base === 'path'} onClick={() => { setBase('path'); setT(rbFromSequence([2, 1, 3, 4, 5])) }}>
            5 düğümlü ağaç
          </button>
        </div>
        <button className="btn sm" onClick={() => setT(start)}>
          Geçerli renklere dön
        </button>
      </div>
      <div className="viz-body">
        <div className="viz-stage">
          <div role="status" className={'feedback ' + (valid ? 'ok' : 'no')} style={{ marginBottom: 12 }}>
            {valid ? (
              <>
                Geçerli bir kırmızı-siyah ağaç. Kökün siyah yüksekliği b(r) = {blackHeight(t)} (NIL dahil, kök hariç).
              </>
            ) : (
              <>Geçersiz: {checks.filter((c) => !c.holds).map((c) => `özellik ${c.id}`).join(', ')} bozuluyor. “!” ile işaretli düğümlere bakın.</>
            )}
          </div>
          <TreeView root={t} bad={bad} label="Renkleri düzenlenebilir ağaç" onNodeClick={(k) => setT((x) => toggleColor(x, k))} />
        </div>
        <aside className="viz-side">
          <InvariantPanel t={t} />
        </aside>
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
            { label: 'Sıralı 1…12', values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
            { label: 'Ters sıralı', values: [12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1] },
            { label: 'Karışık', values: [7, 3, 11, 1, 5, 9, 13, 2, 4, 6, 8, 10, 12] },
          ]}
          options={{ maxLength: 24, distinct: true, min: -99, max: 99 }}
          random={() => randomPermutation(makeRng(Date.now() % 7901), 14)}
          label="Aynı ekleme sırası her iki ağaca uygulanır"
        />
      </div>
      <div className="viz-stage">
        <div className="table-wrap">
          <table className="data" style={{ maxWidth: 640 }}>
            <thead>
              <tr>
                <th>Ölçü</th>
                <th>Sıradan BST</th>
                <th>Kırmızı-siyah ağaç</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Yükseklik</td>
                <td className="num">{height(bst)}</td>
                <td className="num">{height(rb)}</td>
              </tr>
              <tr>
                <td>Başarılı aramada ortalama karşılaştırma</td>
                <td className="num">{avg(bst).toFixed(2)}</td>
                <td className="num">{avg(rb).toFixed(2)}</td>
              </tr>
              <tr>
                <td>En kötü arama karşılaştırması</td>
                <td className="num">{worst(bst)}</td>
                <td className="num">{worst(rb)}</td>
              </tr>
              <tr>
                <td>
                  Garanti edilen yükseklik sınırı (n = {seq.length})
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
            <h3>Sıradan BST</h3>
            <TreeView root={bst} label="Sıradan BST" minWidth={260} />
          </div>
          <div>
            <h3>Kırmızı-siyah ağaç</h3>
            <TreeView root={rb} label="Kırmızı-siyah ağaç" minWidth={260} />
          </div>
        </div>
        <p className="small muted">Sayılar bu tek ekleme sırası için ölçülmüştür. Kırmızı-siyah ağacın O(log n) yüksekliği ise her ekleme sırası için kanıtlanmış bir garantidir.</p>
      </div>
    </div>
  )
}
