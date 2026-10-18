import { useMemo, useState } from 'react'
import { LineChart } from '../components/LineChart'
import { Tex } from '../components/Tex'
import { insertionSortComparisons } from '../engines/insertionSort'
import { mergeSortComparisons } from '../engines/mergeSort'
import { makeRng, randomPermutation } from '../engines/random'

interface Fn {
  id: string
  label: string
  tex: string
  f: (n: number) => number
}

const lg = (n: number) => Math.log2(Math.max(n, 1))

const GROWTH_FNS: Fn[] = [
  { id: 'log', label: 'log n', tex: '\\log_2 n', f: lg },
  { id: 'n', label: 'n', tex: 'n', f: (n) => n },
  { id: 'nlogn', label: 'n log n', tex: 'n\\log_2 n', f: (n) => n * lg(n) },
  { id: 'n1.585', label: 'n^1.585', tex: 'n^{\\log_2 3}', f: (n) => n ** Math.log2(3) },
  { id: 'n2', label: 'n²', tex: 'n^2', f: (n) => n * n },
  { id: 'n3', label: 'n³', tex: 'n^3', f: (n) => n ** 3 },
  { id: '2n', label: '2ⁿ', tex: '2^n', f: (n) => 2 ** n },
]

const COLORS = ['var(--series-1)', 'var(--series-2)', 'var(--series-3)', 'var(--series-4)']

export function GrowthExplorer() {
  const [selected, setSelected] = useState<string[]>(['nlogn', 'n2'])
  const [maxN, setMaxN] = useState(64)
  const [logY, setLogY] = useState(true)
  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length >= 4 ? [...s.slice(1), id] : [...s, id]))
  const ns = useMemo(() => {
    const out: number[] = []
    const step = Math.max(1, Math.floor(maxN / 40))
    for (let n = 1; n <= maxN; n += step) out.push(n)
    if (out[out.length - 1] !== maxN) out.push(maxN)
    return out
  }, [maxN])
  const series = GROWTH_FNS.filter((f) => selected.includes(f.id)).map((f, i) => ({
    name: f.label,
    color: COLORS[i],
    points: ns.map((n) => ({ x: n, y: f.f(n) })),
  }))
  return (
    <div className="card card-pad stack">
      <div className="row" role="group" aria-label="Fonksiyon seçimi (en fazla 4)">
        {GROWTH_FNS.map((f) => (
          <button key={f.id} className="btn sm" aria-pressed={selected.includes(f.id)} onClick={() => toggle(f.id)}>
            <Tex>{f.tex}</Tex>
          </button>
        ))}
      </div>
      <div className="row">
        <label className="field" style={{ flex: '1 1 220px' }}>
          n üst sınırı: {maxN}
          <input type="range" min={8} max={1024} step={8} value={maxN} onChange={(e) => setMaxN(Number(e.target.value))} style={{ accentColor: 'var(--accent)' }} />
        </label>
        <label className="row small">
          <input type="checkbox" checked={logY} onChange={(e) => setLogY(e.target.checked)} /> Logaritmik dikey eksen
        </label>
      </div>
      <LineChart title="Büyüme fonksiyonları (kuramsal)" xLabel="n" yLabel={logY ? 'f(n) (log)' : 'f(n)'} logY={logY} series={series} />
      <p className="small muted">Bunlar kuramsal fonksiyonlardır, ölçüm değildir. Sabit çarpanlar küçük n için sıralamayı değiştirebilir; asimptotik analiz n → ∞ davranışıyla ilgilenir.</p>
    </div>
  )
}

/* ---------- Big-O witness checker ---------- */

interface TFn {
  id: string
  tex: string
  f: (n: number) => number
}

const T_FNS: TFn[] = [
  { id: 'poly', tex: 'T(n) = 3n^2 + 5n + 10', f: (n) => 3 * n * n + 5 * n + 10 },
  { id: 'ms', tex: 'T(n) = 11n\\log_2 n + 11n', f: (n) => 11 * n * lg(n) + 11 * n },
  { id: 'is', tex: 'T(n) = n(n+1)/2', f: (n) => (n * (n + 1)) / 2 },
  { id: 'lin', tex: 'T(n) = 100n + 1000', f: (n) => 100 * n + 1000 },
]

export function BigOWitness() {
  const [tId, setTId] = useState('poly')
  const [fId, setFId] = useState('n2')
  const [mode, setMode] = useState<'O' | 'Omega'>('O')
  const [c, setC] = useState(4)
  const [n0, setN0] = useState(1)
  const N = 2000
  const T = T_FNS.find((t) => t.id === tId)!
  const F = GROWTH_FNS.find((f) => f.id === fId)!
  const result = useMemo(() => {
    let firstFail: number | null = null
    let fails = 0
    for (let n = Math.max(1, n0); n <= N; n++) {
      const ok = mode === 'O' ? T.f(n) <= c * F.f(n) : T.f(n) >= c * F.f(n)
      if (!ok) {
        fails++
        if (firstFail === null) firstFail = n
      }
    }
    return { firstFail, fails }
  }, [T, F, c, n0, mode])
  const ns = Array.from({ length: 41 }, (_, i) => Math.max(1, Math.round((i / 40) * Math.max(40, n0 * 3 + 20))))
  const uniq = [...new Set(ns)]
  return (
    <div className="card card-pad stack">
      <div className="row">
        <label className="field">
          T(n)
          <select className="input" value={tId} onChange={(e) => setTId(e.target.value)}>
            {T_FNS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.tex.replace(/\\log_2/g, 'log₂').replace(/\^2/g, '²').replace(/\\/g, '')}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          İddia
          <select className="input" value={mode} onChange={(e) => setMode(e.target.value as 'O' | 'Omega')}>
            <option value="O">T(n) = O(f(n))</option>
            <option value="Omega">T(n) = Ω(f(n))</option>
          </select>
        </label>
        <label className="field">
          f(n)
          <select className="input" value={fId} onChange={(e) => setFId(e.target.value)}>
            {GROWTH_FNS.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          c
          <input className="input mono" style={{ width: 90 }} type="number" min={0.01} step={0.5} value={c} onChange={(e) => setC(Math.max(0.01, Number(e.target.value) || 0.01))} />
        </label>
        <label className="field">
          n₀
          <input className="input mono" style={{ width: 90 }} type="number" min={1} step={1} value={n0} onChange={(e) => setN0(Math.max(1, Math.floor(Number(e.target.value) || 1)))} />
        </label>
      </div>
      <div className="callout formal">
        <span className="label-tag">Tanım (Ders 2)</span>
        {mode === 'O' ? (
          <Tex>{'T(n) = O(f(n)) \\iff \\exists\\, c > 0,\\ n_0 \\text{ öyle ki } \\forall n \\ge n_0:\\ 0 \\le T(n) \\le c\\cdot f(n)'}</Tex>
        ) : (
          <Tex>{'T(n) = \\Omega(f(n)) \\iff \\exists\\, c > 0,\\ n_0 \\text{ öyle ki } \\forall n \\ge n_0:\\ 0 \\le c\\cdot f(n) \\le T(n)'}</Tex>
        )}
      </div>
      <div role="status" className={'feedback ' + (result.firstFail === null ? 'ok' : 'no')}>
        {result.firstFail === null ? (
          <>
            n₀ = {n0} ile {N}’e kadar her n için <Tex>{mode === 'O' ? `T(n) \\le ${c}\\cdot ${F.tex}` : `T(n) \\ge ${c}\\cdot ${F.tex}`}</Tex> sağlanıyor. Bu, sonlu bir aralıkta yapılan sayısal bir
            kontroldür; tanık (c, n₀) için gerçek bir kanıt tüm n ≥ n₀ için cebirsel bir eşitsizlik gerektirir.
          </>
        ) : (
          <>
            n = {result.firstFail} için koşul bozuluyor ({result.fails} karşı örnek, n ≤ {N}). Ya c / n₀ yeterli değil ya da iddia yanlış: hiçbir sabit c işe yaramıyorsa (ör. n² = O(n) denemesi), iddia yanlıştır.
          </>
        )}
      </div>
      <LineChart
        title="T(n) ile c·f(n) karşılaştırması"
        xLabel="n"
        yLabel="değer (log)"
        logY
        series={[
          { name: 'T(n)', color: 'var(--series-1)', points: uniq.map((n) => ({ x: n, y: T.f(n) })) },
          { name: `c·f(n), c = ${c}`, color: 'var(--series-2)', dashed: true, points: uniq.map((n) => ({ x: n, y: c * F.f(n) })) },
        ]}
      />
    </div>
  )
}

/* ---------- Empirical comparison counts ---------- */

export function EmpiricalSorting() {
  const [seed, setSeed] = useState(1)
  const data = useMemo(() => {
    const rng = makeRng(seed)
    return [4, 8, 16, 32, 64, 96, 128, 192, 256].map((n) => {
      const a = randomPermutation(rng, n)
      return { n, ins: insertionSortComparisons(a), mer: mergeSortComparisons(a) }
    })
  }, [seed])
  return (
    <div className="card card-pad stack">
      <div className="row">
        <span className="small muted grow">
          Her n için rastgele bir permütasyon (tohum {seed}) üzerinde gerçek karşılaştırma sayıları (nokta = ölçüm), kesikli çizgiler kuramsal referanslar.
        </span>
        <button className="btn sm" onClick={() => setSeed((s) => s + 1)}>
          Yeni rastgele girdiler
        </button>
      </div>
      <LineChart
        title="InsertionSort ve MergeSort karşılaştırma sayıları"
        xLabel="n"
        yLabel="karşılaştırma"
        series={[
          { name: 'InsertionSort (ölçüm)', color: 'var(--series-2)', dots: true, points: data.map((d) => ({ x: d.n, y: d.ins })) },
          { name: 'n²/4 (kuram, ortalama)', color: 'var(--series-2)', dashed: true, points: data.map((d) => ({ x: d.n, y: (d.n * d.n) / 4 })) },
          { name: 'MergeSort (ölçüm)', color: 'var(--series-1)', dots: true, points: data.map((d) => ({ x: d.n, y: d.mer })) },
          { name: 'n log₂ n (kuram)', color: 'var(--series-1)', dashed: true, points: data.map((d) => ({ x: d.n, y: d.n * lg(d.n) })) },
        ]}
      />
      <p className="small muted">
        Uyarı: Bu noktalar belirli girdilerdeki sayımlardır. En kötü durum garantisi (ör. MergeSort için O(n log n)) her girdi için geçerli bir kanıttan gelir, birkaç ölçümden değil.
      </p>
    </div>
  )
}
