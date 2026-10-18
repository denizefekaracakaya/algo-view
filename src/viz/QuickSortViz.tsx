import { useMemo, useState } from 'react'
import { ArrayInput } from '../components/ArrayInput'
import { ArrayView, Legend, type CellSpec } from '../components/ArrayView'
import { TraceViewer } from '../components/TraceViewer'
import { QUICKSORT_CODE, expectedComparisons, quickSort, quickSortTrace, type QSCall, type QSPivot, type QuickSortState } from '../engines/quickSort'
import { makeRng, randomPermutation } from '../engines/random'
import { Tex } from '../components/Tex'

const PRESETS = [
  { label: 'Slayt örneği', values: [8, 7, 1, 3, 5, 6, 4] },
  { label: 'Sıralı (deterministik pivot için en kötü)', values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
  { label: 'Tekrarlı', values: [4, 2, 4, 1, 4, 3, 2] },
  { label: '14 eleman', values: [12, 3, 9, 14, 1, 7, 11, 5, 2, 13, 8, 6, 10, 4] },
]

const PIVOT_LABEL: Record<QSPivot, string> = { last: 'Son eleman', first: 'İlk eleman', random: 'Rastgele', median: 'Medyan (ideal)' }

export function QuickSortViz() {
  const [arr, setArr] = useState(PRESETS[0].values)
  const [strategy, setStrategy] = useState<QSPivot>('random')
  const [seed, setSeed] = useState(1)
  const trace = useMemo(() => quickSortTrace(arr, strategy, seed), [arr, strategy, seed])
  const toolbar = (
    <>
      <ArrayInput
        value={arr}
        onChange={setArr}
        presets={PRESETS}
        options={{ maxLength: 20, min: -99, max: 99 }}
        random={() => randomPermutation(makeRng(seed * 31 + arr.length), 10)}
        hint="En fazla 20 tam sayı. Rastgele pivot için tohum aynı kaldıkça çalışma birebir tekrarlanır."
      />
      <div className="field">
        Pivot kuralı
        <div className="seg" role="group" aria-label="Pivot kuralı">
          {(Object.keys(PIVOT_LABEL) as QSPivot[]).map((p) => (
            <button key={p} aria-pressed={strategy === p} onClick={() => setStrategy(p)}>
              {PIVOT_LABEL[p]}
            </button>
          ))}
        </div>
      </div>
      <div className="field">
        Tohum (seed)
        <div className="row" style={{ gap: 4 }}>
          <input className="input mono" style={{ width: 80 }} type="number" value={seed} disabled={strategy !== 'random'} onChange={(e) => setSeed(Math.floor(Number(e.target.value) || 0))} aria-label="Rastgele tohum" />
          <button className="btn sm" disabled={strategy !== 'random'} onClick={() => setSeed((s) => s + 1)}>
            Yeni tohum
          </button>
        </div>
      </div>
    </>
  )
  return (
    <TraceViewer
      key={arr.join(',') + strategy + seed}
      trace={trace}
      label="QuickSort görselleştirmesi"
      toolbar={toolbar}
      code={QUICKSORT_CODE}
      render={(step) => <QSStage s={step.state} />}
      legend={
        <>
          <Legend states={['pivot', 'less', 'greater', 'compare', 'sorted', 'elim']} />
          <span className="muted">✕ = şu anki çağrının dışında</span>
        </>
      }
    />
  )
}

function QSStage({ s }: { s: QuickSortState }) {
  const cells: CellSpec[] = s.a.map((v, x) => {
    let state: CellSpec['state'] = 'none'
    const inRange = s.lo !== null && s.hi !== null && x >= s.lo && x <= s.hi
    if (s.lo !== null && !inRange) state = 'elim'
    if (inRange && s.i !== null) {
      if (x < s.i) state = 'less'
      else if (s.j !== null && x < s.j) state = 'greater'
      else if (s.j !== null && x > s.j && x !== s.pivotAt) state = 'none'
      else if (s.j === null && x !== s.pivotAt && x > s.i) state = 'greater'
    }
    if (s.j === x) state = 'compare'
    if (s.fixed[x]) state = 'sorted'
    if (s.pivotAt === x) state = 'pivot'
    const marks: string[] = []
    if (s.lo === x) marks.push('lo')
    if (s.hi === x) marks.push('hi')
    if (s.i === x) marks.push('i')
    if (s.j === x) marks.push('j')
    return { value: v, state, mark: marks.join(',') || undefined }
  })
  return (
    <div className="stack">
      <ArrayView cells={cells} label="QuickSort dizi durumu" />
      {s.pending.length > 0 && (
        <p className="small muted" style={{ margin: 0 }}>
          Bekleyen sağ parçalar (çağrı yığını): {s.pending.filter(([a, b]) => a <= b).map(([a, b]) => `A[${a}..${b}]`).join(', ') || '—'}
        </p>
      )}
      <div>
        <span className="label-tag">Özyineleme ağacı (her düğüm bir çağrının pivotu)</span>
        <CallTree calls={s.calls} active={s.activeCall} />
      </div>
    </div>
  )
}

function CallTree({ calls, active }: { calls: QSCall[]; active: number | null }) {
  if (!calls.length) return <p className="small muted">Henüz çağrı yok.</p>
  // Pivots form a BST: lay out by array position (lo..hi midpoint of the pivot's final slot).
  const maxDepth = Math.max(...calls.map((c) => c.depth))
  const span = Math.max(...calls.map((c) => c.hi)) + 1
  const gx = 36
  const gy = 44
  const W = Math.max(280, span * gx + 20)
  const H = (maxDepth + 1) * gy + 16
  const x = (c: QSCall) => 10 + gx / 2 + ((c.lo + c.hi) / 2) * gx
  const byId = new Map(calls.map((c) => [c.id, c]))
  return (
    <svg className="tree-svg" viewBox={`0 0 ${W} ${H}`} width={W} role="img" aria-label={`Özyineleme ağacı: ${calls.length} çağrı, derinlik ${maxDepth + 1}`}>
      {calls.map((c) => {
        if (c.parent === null) return null
        const p = byId.get(c.parent)!
        return <line key={'e' + c.id} className="edge" x1={x(p)} y1={p.depth * gy + 18} x2={x(c)} y2={c.depth * gy + 18} />
      })}
      {calls.map((c) => (
        <g key={c.id} transform={`translate(${x(c)} ${c.depth * gy + 18})`}>
          <rect x={-15} y={-13} width={30} height={26} rx={6} fill={c.id === active ? 'var(--st-pivot-bg)' : 'var(--surface)'} stroke={c.id === active ? 'var(--st-pivot)' : 'var(--border-strong)'} strokeWidth={c.id === active ? 2.5 : 1.5} />
          <text textAnchor="middle" dominantBaseline="central" fontFamily="var(--mono)" fontSize={12} fontWeight={700} fill="var(--text)">
            {c.pivotValue ?? '·'}
          </text>
        </g>
      ))}
    </svg>
  )
}

/* ----------- Experiment: comparisons over many seeds ----------- */

export function QuickSortExperiment() {
  const [n, setN] = useState(32)
  const [runs, setRuns] = useState(300)
  const [input, setInput] = useState<'sorted' | 'random'>('sorted')
  const data = useMemo(() => {
    const a = input === 'sorted' ? Array.from({ length: n }, (_, i) => i + 1) : randomPermutation(makeRng(99), n)
    const counts = Array.from({ length: runs }, (_, s) => quickSort(a, 'random', s + 1).comparisons)
    const det = quickSort(a, 'last').comparisons
    const mean = counts.reduce((x, y) => x + y, 0) / runs
    const min = Math.min(...counts)
    const max = Math.max(...counts)
    const bins = 16
    const width = Math.max(1, Math.ceil((max - min + 1) / bins))
    const hist = Array.from({ length: bins }, (_, b) => ({ lo: min + b * width, count: 0 }))
    for (const c of counts) hist[Math.min(bins - 1, Math.floor((c - min) / width))].count++
    return { counts, det, mean, min, max, hist, width }
  }, [n, runs, input])
  const E = expectedComparisons(n)
  const peak = Math.max(...data.hist.map((h) => h.count))
  return (
    <div className="card card-pad stack">
      <div className="row">
        <label className="field">
          n = {n}
          <input type="range" min={4} max={200} value={n} onChange={(e) => setN(Number(e.target.value))} style={{ accentColor: 'var(--accent)' }} />
        </label>
        <label className="field">
          Çalıştırma sayısı (farklı tohumlar)
          <select className="input" value={runs} onChange={(e) => setRuns(Number(e.target.value))}>
            {[50, 300, 1000].map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Sabit girdi
          <select className="input" value={input} onChange={(e) => setInput(e.target.value as 'sorted' | 'random')}>
            <option value="sorted">Sıralı dizi (deterministik pivot için kötü)</option>
            <option value="random">Sabit bir karışık dizi</option>
          </select>
        </label>
      </div>
      <div className="table-wrap">
        <table className="data">
          <tbody>
            <tr>
              <td>Rastgele pivot, ölçülen ortalama ({runs} tohum)</td>
              <td className="num">{data.mean.toFixed(1)}</td>
            </tr>
            <tr>
              <td>Rastgele pivot, en az / en çok gözlenen</td>
              <td className="num">
                {data.min} / {data.max}
              </td>
            </tr>
            <tr className="hl">
              <td>
                Kuramsal beklenen değer <Tex>{'E[C] = 2(n+1)H_n - 4n'}</Tex>
              </td>
              <td className="num">{E.toFixed(1)}</td>
            </tr>
            <tr>
              <td>
                Kuramsal üst sınır <Tex>{'2n\\ln n'}</Tex>
              </td>
              <td className="num">{(2 * n * Math.log(n)).toFixed(1)}</td>
            </tr>
            <tr>
              <td>Deterministik “son eleman” pivotu, bu girdi</td>
              <td className="num">{data.det}</td>
            </tr>
            <tr>
              <td>
                En kötü durum <Tex>{'n(n-1)/2'}</Tex>
              </td>
              <td className="num">{(n * (n - 1)) / 2}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <figure style={{ margin: 0 }}>
        <svg viewBox="0 0 640 160" className="chart" role="img" aria-label="Karşılaştırma sayısı histogramı">
          {data.hist.map((h, i) => {
            const bh = (h.count / peak) * 120
            return (
              <g key={i}>
                <rect x={20 + i * 37} y={135 - bh} width={33} height={bh} rx={3} fill="var(--series-1)">
                  <title>
                    {h.lo}–{h.lo + data.width - 1}: {h.count} çalıştırma
                  </title>
                </rect>
              </g>
            )
          })}
          {(() => {
            const x = 20 + ((E - data.min) / (data.width * 16)) * (37 * 16)
            return x >= 20 && x <= 612 ? (
              <g>
                <line x1={x} x2={x} y1={10} y2={138} stroke="var(--series-2)" strokeWidth={2} strokeDasharray="5 3" />
                <text x={x + 4} y={20} fontSize={11} fill="var(--text-2)">
                  E[C]
                </text>
              </g>
            ) : null
          })()}
          <text x={20} y={152} fontSize={11} fill="var(--muted)" fontFamily="var(--mono)">
            {data.min}
          </text>
          <text x={612} y={152} fontSize={11} fill="var(--muted)" textAnchor="end" fontFamily="var(--mono)">
            {data.max}
          </text>
        </svg>
        <figcaption className="small muted">
          Histogram: aynı girdide farklı tohumlarla ölçülen karşılaştırma sayıları (ampirik). Kesikli çizgi kuramsal beklenen değerdir.
        </figcaption>
      </figure>
      <div className="callout warn">
        Tek bir çalıştırma (ya da birkaç yüz çalıştırma) beklenen süre teoremini <strong>kanıtlamaz</strong>; teorem her girdi için, algoritmanın kendi rastgele seçimleri üzerinden alınan beklentiyle ilgilidir ve bir kanıt gerektirir. Ölçümler yalnızca teoremle tutarlı olup olmadığımızı gösterir.
      </div>
    </div>
  )
}

/* ----------- P[z_i and z_j are compared] = 2/(j−i+1) ----------- */

export function PairProbability() {
  const n = 10
  const [pair, setPair] = useState<[number, number]>([2, 6])
  const [i, j] = pair
  const sim = useMemo(() => {
    const runs = 2000
    let hit = 0
    for (let s = 1; s <= runs; s++) {
      // Simulate only the pivot order restricted to [z_i..z_j]: first pivot chosen among them decides.
      const rng = makeRng(s * 7 + i * 131 + j)
      let lo = 1
      let hi = n
      for (;;) {
        const p = lo + Math.floor(rng() * (hi - lo + 1))
        if (p >= i && p <= j) {
          if (p === i || p === j) hit++
          break
        }
        if (p < i) lo = p + 1
        else hi = p - 1
      }
    }
    return hit / runs
  }, [i, j])
  return (
    <div className="card card-pad stack">
      <p className="small" style={{ margin: 0 }}>
        n = {n} sıralı eleman <Tex>{'z_1 < \\dots < z_{10}'}</Tex>. Bir hücreye tıklayarak (i, j) çiftini seçin. Hücre rengi <Tex>{'P[z_i, z_j \\text{ karşılaştırılır}] = \\tfrac{2}{j-i+1}'}</Tex> değerini gösterir.
      </p>
      <div className="table-wrap">
        <table className="data" style={{ width: 'auto' }} aria-label="Karşılaştırılma olasılıkları matrisi">
          <thead>
            <tr>
              <th>i \ j</th>
              {Array.from({ length: n }, (_, c) => (
                <th key={c}>{c + 1}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: n }, (_, r) => (
              <tr key={r}>
                <th>{r + 1}</th>
                {Array.from({ length: n }, (_, c) => {
                  const a = r + 1
                  const b = c + 1
                  if (b <= a) return <td key={c} />
                  const p = 2 / (b - a + 1)
                  const sel = a === i && b === j
                  return (
                    <td key={c} style={{ padding: 2 }}>
                      <button
                        className="mono"
                        onClick={() => setPair([a, b])}
                        aria-pressed={sel}
                        aria-label={`z${a} ve z${b}: olasılık ${p.toFixed(2)}`}
                        style={{
                          width: 38,
                          height: 28,
                          border: sel ? '2px solid var(--text)' : '1px solid var(--border)',
                          borderRadius: 4,
                          cursor: 'pointer',
                          fontSize: 10,
                          color: p > 0.5 ? '#fff' : 'var(--text)',
                          background: `color-mix(in srgb, var(--series-1) ${Math.round(p * 100)}%, var(--surface))`,
                        }}
                      >
                        {p.toFixed(2)}
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="row" aria-label="Seçilen aralık">
        {Array.from({ length: n }, (_, t) => {
          const v = t + 1
          const inWin = v >= i && v <= j
          const end = v === i || v === j
          return (
            <span
              key={v}
              className="mono small"
              style={{
                padding: '4px 8px',
                borderRadius: 6,
                border: '1.5px solid ' + (end ? 'var(--st-pivot)' : inWin ? 'var(--st-active)' : 'var(--border)'),
                background: end ? 'var(--st-pivot-bg)' : inWin ? 'var(--st-active-bg)' : 'transparent',
              }}
            >
              z{v}
            </span>
          )
        })}
      </div>
      <div className="callout formal">
        <span className="label-tag">Neden 2/(j−i+1)?</span>
        <Tex>{`z_${i}`}</Tex> ile <Tex>{`z_${j}`}</Tex> ancak birisi, <Tex>{`\\{z_${i},\\dots,z_${j}\\}`}</Tex> penceresinden seçilen <strong>ilk</strong> pivot olursa karşılaştırılır. Pencerenin dışından seçilen pivotlar ikisini aynı tarafta bırakır; pencerenin içinden ama uçlardan farklı bir pivot ise onları ayırır ve bir daha karşılaşmazlar. Pencere {j - i + 1} eleman içerir ve ilk seçilen her biri eşit olasılıklıdır: <Tex>{`\\tfrac{2}{${j - i + 1}} = ${(2 / (j - i + 1)).toFixed(3)}`}</Tex>.
      </div>
      <p className="small muted" style={{ margin: 0 }}>
        Simülasyon (2000 tohum, ampirik): karşılaştırılma oranı ≈ {sim.toFixed(3)}. Doğrusallık (linearity of expectation) ile tüm çiftler toplanınca <Tex>{'E[C] = \\sum_{i<j} \\tfrac{2}{j-i+1} \\le 2n\\ln n'}</Tex>.
      </p>
    </div>
  )
}
