import { useMemo, useState } from 'react'
import { TraceViewer } from '../components/TraceViewer'
import { ArrayInput } from '../components/ArrayInput'
import { COUNTING_SORT_CODE, RADIX_SORT_CODE, bucketSortTrace, digitCount, type BucketState, type Tagged } from '../engines/bucketSort'
import { makeRng, randomArray } from '../engines/random'
import { Tex } from '../components/Tex'
import { tx } from '../i18n/lang'


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
          { label: tx('Doğum ayı (1–12)', 'Birth month (1–12)'), values: [3, 1, 12, 4, 1, 7, 12, 5, 3] },
          { label: tx('Rakamlar', 'Digits'), values: [3, 1, 4, 1, 5, 9, 2, 6, 5, 3] },
          { label: tx('Hepsi aynı', 'All equal'), values: [2, 2, 2, 2] },
        ]
      : [
          { label: tx('Slayt örneği', 'Slide example'), values: [21, 345, 13, 101, 50, 234, 1] },
          { label: tx('Tekrarlı', 'Duplicates'), values: [170, 45, 75, 90, 802, 24, 2, 66, 45] },
          { label: tx('0 ve sınırlar', '0 and edge values'), values: [0, 999, 100, 99, 1, 10] },
        ]

  const toolbar = (
    <>
      <div className="field">
        {tx('Algoritma', 'Algorithm')}
        <div className="seg" role="group" aria-label={tx('Algoritma', 'Algorithm')}>
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
        hint={mode === 'counting' ? tx('Negatif olmayan anahtarlar 0…39 (en fazla 14). Kova sayısı r ≥ max + 1 olmalı.', 'Non-negative keys 0…39 (at most 14). The number of buckets must be r ≥ max + 1.') : tx('Negatif olmayan tam sayılar (en fazla 14).', 'Non-negative integers (at most 14).')}
      />
      <label className="field">
        {mode === 'counting' ? tx('Kova sayısı r', 'Number of buckets r') : tx('Taban r', 'Base r')}
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
          {tx(`En büyük anahtar ${max}; anahtar evreni {0,…,r−1} olmalı, bu yüzden r = ${max + 1} kullanılıyor.`, `The largest key is ${max}; the key universe must be {0,…,r−1}, so r = ${max + 1} is used.`)}
        </div>
      )}
      {error && <div className="error-msg">{error}</div>}
    </>
  )

  if (!trace) return <div className="error-msg">{tx('Anahtar evreni görselleştirme için çok büyük.', 'The key universe is too large to visualize.')}</div>
  return (
    <div className="stack">
      <TraceViewer
        key={mode + arr.join(',') + effectiveR}
        trace={trace}
        label={mode === 'counting' ? tx('CountingSort görselleştirmesi', 'CountingSort visualization') : tx('RadixSort görselleştirmesi', 'RadixSort visualization')}
        toolbar={toolbar}
        code={mode === 'counting' ? COUNTING_SORT_CODE : RADIX_SORT_CODE}
        render={(step) => <BucketStage s={step.state} mode={mode} />}
        side={() => <Assumptions mode={mode} n={arr.length} r={effectiveR} max={max} />}
        legend={
          <span className="muted">
            {tx(
              'Alt simge (1, 2, …) elemanın girişteki sırasını gösterir: eşit anahtarlar çıktıda aynı sırada kalır (kararlılık).',
              'The subscript (1, 2, …) shows the item’s position in the input: equal keys stay in the same order in the output (stability).',
            )}
          </span>
        }
      />
    </div>
  )
}

function Item({ x, hl, digit, r }: { x: Tagged; hl: boolean; digit: number | null; r: number }) {
  const s = x.key.toString(r)
  const pos = digit === null ? -1 : s.length - 1 - digit
  return (
    <span
      className="mono bucket-item"
      aria-label={tx(`${x.key} (giriş sırası ${x.tag + 1})`, `${x.key} (input position ${x.tag + 1})`)}
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
          {tx('Geçiş', 'Pass')} {s.pass + 1} / {s.totalPasses} · {tx('taban', 'base')} {s.r}
          {s.r !== 10 && tx(` · sayılar taban-${s.r} gösterimde`, ` · numbers shown in base ${s.r}`)} · {tx('altı çizili basamak = bu geçişin anahtarı', 'underlined digit = this pass’s key')}
        </div>
      )}
      <div>
        <span className="label-tag">{tx('Dağıtılacak elemanlar', 'Items to distribute')}</span>
        <div className="row" style={{ minHeight: 30 }}>
          {s.input.length ? s.input.map((x) => <Item key={x.tag} x={x} hl={false} digit={s.digit} r={s.r} />) : <span className="small muted">—</span>}
        </div>
      </div>
      <div>
        <span className="label-tag">{tx('Kovalar (FIFO bağlı listeler)', 'Buckets (FIFO linked lists)')}</span>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(s.r, 10)}, minmax(54px, 1fr))`, gap: 6 }}>
          {s.buckets.map((b, i) => (
            <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 4, minHeight: 60, background: s.highlight?.bucket === i ? 'var(--accent-soft)' : 'var(--surface-2)' }} aria-label={`${tx('Kova', 'Bucket')} ${i}: ${b.map((x) => x.key).join(', ') || tx('boş', 'empty')}`}>
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
        <span className="label-tag">{tx('Çıktı (kovaların birleştirilmesi)', 'Output (buckets concatenated)')}</span>
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
      <span className="label-tag">{tx('Varsayımlar ve maliyet', 'Assumptions and cost')}</span>
      <ul className="small" style={{ margin: 0, paddingLeft: '1.1em' }}>
        <li>{tx('Anahtarların değerlerine doğrudan erişebiliyoruz (yalnızca karşılaştırma yapmıyoruz).', 'We can access the key values directly (we are not limited to comparisons).')}</li>
        <li>
          {tx('Olası anahtarlar önceden biliniyor:', 'The possible keys are known in advance:')}{' '}
          {mode === 'counting' ? <>{'{0,…,'}{r - 1}{'}'}</> : <>{tx(`taban-${r} basamaklar`, `base-${r} digits`)} {'{0,…,'}{r - 1}{'}'}</>}.
        </li>
        <li>{mode === 'counting' ? tx('Çok fazla olası değer yok: r büyükse kovalar zaman ve yer harcar.', 'There are not too many possible values: with a large r the buckets cost time and space.') : tx('Basamak sayısı d = ⌊log_r M⌋ + 1 küçük kalmalı.', 'The number of digits d = ⌊log_r M⌋ + 1 must stay small.')}</li>
      </ul>
      <p className="small" style={{ margin: '6px 0 0' }}>
        {mode === 'counting' ? (
          <>
            <Tex>{`O(n + r) = O(${n} + ${r})`}</Tex> — {tx('en kötü durum', 'worst case')}.
          </>
        ) : (
          <>
            <Tex>{`d = ${d},\\ O(d(n + r)) = O(${d}\\cdot(${n} + ${r}))`}</Tex> — {tx('en kötü durum', 'worst case')}.
          </>
        )}
      </p>
    </div>
  )
}
