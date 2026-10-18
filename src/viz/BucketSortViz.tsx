import { useMemo, useState } from 'react'
import { TraceViewer } from '../components/TraceViewer'
import { ArrayInput } from '../components/ArrayInput'
import { COUNTING_SORT_CODE, RADIX_SORT_CODE, bucketSortTrace, digitCount, type BucketState, type Tagged } from '../engines/bucketSort'
import { makeRng, randomArray } from '../engines/random'
import { Tex } from '../components/Tex'


export function BucketSortViz() {
  const [mode, setMode] = useState<'counting' | 'radix'>('counting')
  const [arr, setArr] = useState([3, 1, 4, 1, 5, 9, 2, 6, 5, 3])
  const [r, setR] = useState(10)
  const [error, setError] = useState<string | null>(null)
  const max = arr.length ? Math.max(...arr) : 0
  const effectiveR = mode === 'counting' ? Math.max(r, max + 1) : r
  const tooLarge = mode === 'counting' && max + 1 > 40
  const trace = useMemo(() => (tooLarge ? null : bucketSortTrace(arr, mode, effectiveR)), [arr, mode, effectiveR, tooLarge])

  const presets =
    mode === 'counting'
      ? [
          { label: 'Doğum ayı (1–12)', values: [3, 1, 12, 4, 1, 7, 12, 5, 3] },
          { label: 'Rakamlar', values: [3, 1, 4, 1, 5, 9, 2, 6, 5, 3] },
          { label: 'Hepsi aynı', values: [2, 2, 2, 2] },
        ]
      : [
          { label: 'Slayt örneği', values: [21, 345, 13, 101, 50, 234, 1] },
          { label: 'Tekrarlı', values: [170, 45, 75, 90, 802, 24, 2, 66, 45] },
          { label: '0 ve sınırlar', values: [0, 999, 100, 99, 1, 10] },
        ]

  const toolbar = (
    <>
      <div className="field">
        Algoritma
        <div className="seg" role="group" aria-label="Algoritma">
          <button aria-pressed={mode === 'counting'} onClick={() => { setMode('counting'); setArr([3, 1, 4, 1, 5, 9, 2, 6, 5, 3]); setR(10) }}>
            CountingSort
          </button>
          <button aria-pressed={mode === 'radix'} onClick={() => { setMode('radix'); setArr([21, 345, 13, 101, 50, 234, 1]); setR(10) }}>
            RadixSort (LSD)
          </button>
        </div>
      </div>
      <ArrayInput
        key={mode}
        value={arr}
        onChange={(v) => {
          setArr(v)
          setError(null)
        }}
        presets={presets}
        options={{ maxLength: 14, min: 0, max: mode === 'counting' ? 39 : 99999, nonNegative: true }}
        random={() => randomArray(makeRng(Date.now() % 9973), 10, 0, mode === 'counting' ? 9 : 999)}
        hint={mode === 'counting' ? 'Negatif olmayan anahtarlar 0…39 (en fazla 14). Kova sayısı r ≥ max + 1 olmalı.' : 'Negatif olmayan tam sayılar (en fazla 14).'}
      />
      <label className="field">
        {mode === 'counting' ? 'Kova sayısı r' : 'Taban r'}
        <select className="input" value={r} onChange={(e) => setR(Number(e.target.value))}>
          {(mode === 'counting' ? [10, 13, 20, 40] : [2, 4, 8, 10, 16]).map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </label>
      {mode === 'counting' && r < max + 1 && (
        <div className="small" style={{ flexBasis: '100%', color: 'var(--st-compare)' }}>
          En büyük anahtar {max}; anahtar evreni {'{0,…,r−1}'} olmalı, bu yüzden r = {max + 1} kullanılıyor.
        </div>
      )}
      {error && <div className="error-msg">{error}</div>}
    </>
  )

  if (!trace) return <div className="error-msg">Anahtar evreni görselleştirme için çok büyük.</div>
  return (
    <div className="stack">
      <TraceViewer
        key={mode + arr.join(',') + effectiveR}
        trace={trace}
        label={mode === 'counting' ? 'CountingSort görselleştirmesi' : 'RadixSort görselleştirmesi'}
        toolbar={toolbar}
        code={mode === 'counting' ? COUNTING_SORT_CODE : RADIX_SORT_CODE}
        render={(step) => <BucketStage s={step.state} mode={mode} />}
        side={() => <Assumptions mode={mode} n={arr.length} r={effectiveR} max={max} />}
        legend={<span className="muted">Alt simge (1, 2, …) elemanın girişteki sırasını gösterir: eşit anahtarlar çıktıda aynı sırada kalır (kararlılık).</span>}
      />
    </div>
  )
}

function Item({ x, hl, digit, r }: { x: Tagged; hl: boolean; digit: number | null; r: number }) {
  const s = x.key.toString(r)
  const pos = digit === null ? -1 : s.length - 1 - digit
  return (
    <span
      className="mono"
      aria-label={`${x.key} (giriş sırası ${x.tag + 1})`}
      style={{
        display: 'inline-block',
        padding: '2px 7px',
        borderRadius: 6,
        border: '1.5px solid ' + (hl ? 'var(--st-compare)' : 'var(--border-strong)'),
        background: hl ? 'var(--st-compare-bg)' : 'var(--surface)',
        fontSize: 13,
        fontWeight: 600,
      }}
    >
      {digit === null
        ? x.key
        : [...s].map((ch, i) => (
            <span key={i} style={i === pos ? { textDecoration: 'underline', textUnderlineOffset: 3, color: 'var(--accent-ink)' } : undefined}>
              {ch}
            </span>
          ))}
      {digit !== null && pos < 0 && <span style={{ color: 'var(--accent-ink)' }}>(0)</span>}
      <sub style={{ color: 'var(--muted)', fontSize: 10 }}>{x.tag + 1}</sub>
    </span>
  )
}

function BucketStage({ s, mode }: { s: BucketState; mode: 'counting' | 'radix' }) {
  return (
    <div className="stack">
      {mode === 'radix' && (
        <div className="small">
          Geçiş {s.pass + 1} / {s.totalPasses} · taban {s.r}
          {s.r !== 10 && ' · sayılar taban-' + s.r + ' gösterimde'} · altı çizili basamak = bu geçişin anahtarı
        </div>
      )}
      <div>
        <span className="label-tag">Dağıtılacak elemanlar</span>
        <div className="row" style={{ minHeight: 30 }}>
          {s.input.length ? s.input.map((x) => <Item key={x.tag} x={x} hl={false} digit={s.digit} r={s.r} />) : <span className="small muted">—</span>}
        </div>
      </div>
      <div>
        <span className="label-tag">Kovalar (FIFO bağlı listeler)</span>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(s.r, 10)}, minmax(54px, 1fr))`, gap: 6 }}>
          {s.buckets.map((b, i) => (
            <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 4, minHeight: 60, background: s.highlight?.bucket === i ? 'var(--accent-soft)' : 'var(--surface-2)' }} aria-label={`Kova ${i}: ${b.map((x) => x.key).join(', ') || 'boş'}`}>
              <div className="mono small muted" style={{ textAlign: 'center' }}>
                {mode === 'radix' ? i.toString(s.r) : i}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' }}>
                {b.map((x) => (
                  <Item key={x.tag} x={x} hl={s.highlight?.tag === x.tag} digit={s.digit} r={s.r} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <span className="label-tag">Çıktı (kovaların birleştirilmesi)</span>
        <div className="row" style={{ minHeight: 30 }}>
          {s.output.length ? s.output.map((x) => <Item key={x.tag} x={x} hl={false} digit={s.digit} r={s.r} />) : <span className="small muted">—</span>}
        </div>
      </div>
    </div>
  )
}

function Assumptions({ mode, n, r, max }: { mode: 'counting' | 'radix'; n: number; r: number; max: number }) {
  const d = digitCount(max, r)
  return (
    <div className="callout">
      <span className="label-tag">Varsayımlar ve maliyet</span>
      <ul className="small" style={{ margin: 0, paddingLeft: '1.1em' }}>
        <li>Anahtarların değerlerine doğrudan erişebiliyoruz (yalnızca karşılaştırma yapmıyoruz).</li>
        <li>Olası anahtarlar önceden biliniyor: {mode === 'counting' ? <>{'{0,…,'}{r - 1}{'}'}</> : <>taban-{r} basamaklar {'{0,…,'}{r - 1}{'}'}</>}.</li>
        <li>{mode === 'counting' ? 'Çok fazla olası değer yok: r büyükse kovalar zaman ve yer harcar.' : 'Basamak sayısı d = ⌊log_r M⌋ + 1 küçük kalmalı.'}</li>
      </ul>
      <p className="small" style={{ margin: '6px 0 0' }}>
        {mode === 'counting' ? (
          <>
            <Tex>{`O(n + r) = O(${n} + ${r})`}</Tex> — en kötü durum.
          </>
        ) : (
          <>
            <Tex>{`d = ${d},\\ O(d(n + r)) = O(${d}\\cdot(${n} + ${r}))`}</Tex> — en kötü durum.
          </>
        )}
      </p>
    </div>
  )
}
