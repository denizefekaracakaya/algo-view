import { useMemo, useState } from 'react'
import { ArrayInput } from '../components/ArrayInput'
import { ArrayView, Legend, type CellSpec, type CellState } from '../components/ArrayView'
import { TraceViewer } from '../components/TraceViewer'
import { CHOOSE_PIVOT_MOM_CODE, SELECT_CODE, selectTrace, validateK, type PivotStrategy, type SelectRole, type SelectState } from '../engines/select'
import { makeRng, randomPermutation } from '../engines/random'
import { Pseudocode } from '../components/Pseudocode'

const PRESETS = [
  { label: 'Örnek', values: [9, 3, 15, 1, 12, 7, 4, 11, 6, 2, 14, 8] },
  { label: 'Sıralı (ilk-eleman kötü)', values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
  { label: 'Tekrarlı', values: [5, 2, 5, 9, 1, 5, 7, 2] },
  { label: '25 eleman', values: [23, 7, 18, 2, 25, 11, 14, 5, 20, 9, 1, 16, 12, 22, 4, 19, 8, 24, 13, 3, 17, 6, 21, 10, 15] },
]

const ROLE_STATE: Record<SelectRole, CellState> = {
  candidate: 'active',
  eliminated: 'elim',
  pivot: 'pivot',
  less: 'less',
  equal: 'pivot',
  greater: 'greater',
  found: 'found',
}

export function SelectViz() {
  const [arr, setArr] = useState(PRESETS[0].values)
  const [k, setK] = useState(6)
  const [kText, setKText] = useState('6')
  const [strategy, setStrategy] = useState<PivotStrategy>('random')
  const [seed, setSeed] = useState(7)
  const [kErr, setKErr] = useState<string | null>(null)
  const effectiveK = validateK(arr.length, k) ? Math.max(1, Math.min(arr.length, k)) : k
  const trace = useMemo(() => (arr.length ? selectTrace(arr, effectiveK, strategy, seed) : []), [arr, effectiveK, strategy, seed])

  const toolbar = (
    <>
      <ArrayInput
        value={arr}
        onChange={(v) => {
          setArr(v)
          if (validateK(v.length, k)) {
            const nk = Math.ceil(v.length / 2)
            setK(nk)
            setKText(String(nk))
          }
        }}
        presets={PRESETS}
        options={{ minLength: 1, maxLength: 30, min: -99, max: 99 }}
        random={() => randomPermutation(makeRng(Date.now() % 100000), 12 + Math.floor(Math.random() * 10))}
        hint="1–30 tam sayı. Tekrarlı değerler desteklenir (A= kümesi)."
      />
      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault()
          const v = Number(kText)
          const err = validateK(arr.length, v)
          setKErr(err)
          if (!err) setK(v)
        }}
      >
        <label className="field">
          k (1 tabanlı)
          <input className="input mono" style={{ width: 70 }} value={kText} onChange={(e) => setKText(e.target.value)} aria-invalid={!!kErr} inputMode="numeric" />
        </label>
        <button className="btn" type="submit" style={{ alignSelf: 'flex-end' }}>
          Ayarla
        </button>
        <button className="btn sm" type="button" style={{ alignSelf: 'flex-end' }} onClick={() => { const m = Math.ceil(arr.length / 2); setK(m); setKText(String(m)); setKErr(null) }}>
          Medyan
        </button>
      </form>
      <div className="field">
        ChoosePivot
        <div className="seg" role="group" aria-label="Pivot stratejisi">
          <button aria-pressed={strategy === 'first'} onClick={() => setStrategy('first')}>
            İlk eleman
          </button>
          <button aria-pressed={strategy === 'random'} onClick={() => setStrategy('random')}>
            Rastgele
          </button>
          <button aria-pressed={strategy === 'mom'} onClick={() => setStrategy('mom')}>
            Medyanların medyanı
          </button>
        </div>
      </div>
      {strategy === 'random' && (
        <label className="field">
          Tohum (seed)
          <input className="input mono" style={{ width: 90 }} type="number" value={seed} onChange={(e) => setSeed(Math.floor(Number(e.target.value) || 0))} />
        </label>
      )}
      {kErr && (
        <div className="error-msg" role="alert" style={{ flexBasis: '100%' }}>
          {kErr}
        </div>
      )}
    </>
  )

  if (!trace.length) return null
  return (
    <TraceViewer
      key={arr.join(',') + effectiveK + strategy + seed}
      trace={trace}
      label="Select görselleştirmesi"
      toolbar={toolbar}
      code={SELECT_CODE}
      render={(step) => <SelectStage s={step.state} />}
      side={() => (strategy === 'mom' ? <details><summary className="small">ChoosePivot (medyanların medyanı)</summary><Pseudocode lines={CHOOSE_PIVOT_MOM_CODE} /></details> : null)}
      legend={<Legend states={['active', 'pivot', 'less', 'greater', 'elim', 'found']} />}
    />
  )
}

function SelectStage({ s }: { s: SelectState }) {
  const cells: CellSpec[] = s.values.map((v, i) => ({
    value: v,
    state: ROLE_STATE[s.roles[i]],
    mark: s.pivotId === i ? 'p' : s.medianIds?.includes(i) ? 'med' : undefined,
  }))
  const sorted = [...s.values].sort((a, b) => a - b)
  return (
    <div className="stack">
      <div className="row small">
        <span className="badge accent">aranan sıra k = {s.k}</span>
        <span className="badge">aday sayısı {s.current.length}</span>
        <span className="badge">derinlik {s.depth}</span>
        {s.sizes && (
          <span className="badge">
            |A&lt;| = {s.sizes.less}, |A=| = {s.sizes.equal}, |A&gt;| = {s.sizes.greater}
          </span>
        )}
      </div>
      <div>
        <span className="label-tag">Orijinal dizi (konumlar korunur)</span>
        <ArrayView cells={cells} label="Select dizi durumu" />
      </div>
      {s.groups && (
        <div>
          <span className="label-tag">5’li gruplar (sıralanmış) ve medyanları</span>
          <div className="row" style={{ alignItems: 'flex-start', gap: 14 }}>
            {s.groups.map((g, gi) => (
              <div key={gi} style={{ display: 'flex', flexDirection: 'column', gap: 3 }} aria-label={`Grup ${gi + 1}`}>
                {g.map((id) => {
                  const isMed = s.medianIds?.includes(id)
                  const isP = s.pivotId === id
                  return (
                    <span
                      key={id}
                      className="mono small"
                      style={{
                        padding: '1px 8px',
                        borderRadius: 5,
                        textAlign: 'center',
                        border: '1.5px solid ' + (isP ? 'var(--st-pivot)' : isMed ? 'var(--st-active)' : 'var(--border)'),
                        background: isP ? 'var(--st-pivot-bg)' : isMed ? 'var(--st-active-bg)' : 'transparent',
                        fontWeight: isMed ? 700 : 400,
                      }}
                    >
                      {s.values[id]}
                      {isP ? ' P' : isMed ? ' m' : ''}
                    </span>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      )}
      <details className="small muted">
        <summary>Kontrol: dizinin sıralı hâli (cevabı gösterir)</summary>
        <span className="mono">{sorted.join(' ')}</span>
      </details>
    </div>
  )
}
