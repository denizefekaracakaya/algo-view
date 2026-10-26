import { useMemo, useState } from 'react'
import { TraceViewer } from '../components/TraceViewer'
import { ArrayInput } from '../components/ArrayInput'
import { Choice, KV, Legend } from '../components/VizParts'
import { Tex } from '../components/Tex'
import { LineChart } from '../components/LineChart'
import { HASH_CODE, HASH_P, expectedCollidingPairs, hashFormula, hashTrace, makeHash, noCollisionBound, noCollisionProbability, simulateBalls, type HashKind, type HashState } from '../engines/hashing'
import { makeRng, randomArray } from '../engines/random'
import { tx } from '../i18n/lang'

export function HashTableViz() {
  const [kind, setKind] = useState<HashKind>('notes')
  const [n, setN] = useState(5)
  const [seed, setSeed] = useState(7)
  const [keys, setKeys] = useState([1, 2, 4, 7, 8])
  const [lookups, setLookups] = useState([7, 3])
  const h = useMemo(() => makeHash(kind, n, seed), [kind, n, seed])
  const { trace, buckets } = useMemo(() => hashTrace(keys, lookups, h), [keys, lookups, h])
  const longest = Math.max(...buckets.map((b) => b.length))
  const toolbar = (
    <>
      <ArrayInput
        value={keys}
        onChange={setKeys}
        label={tx('Eklenecek anahtarlar', 'Keys to insert')}
        presets={[
          { label: tx('Notlardaki örnek', 'Notes example'), values: [1, 2, 4, 7, 8] },
          { label: tx('n’nin katları', 'Multiples of n'), values: [5, 10, 15, 20, 25, 30] },
          { label: tx('Ardışık', 'Consecutive'), values: [10, 11, 12, 13, 14, 15, 16, 17] },
        ]}
        options={{ maxLength: 16, min: 0, max: HASH_P - 1, nonNegative: true }}
        random={() => randomArray(makeRng(Date.now() % 9973), 10, 0, HASH_P - 1)}
        hint={tx(`Anahtar evreni U = {0, …, ${HASH_P - 1}}; en fazla 16 anahtar.`, `Key universe U = {0, …, ${HASH_P - 1}}; at most 16 keys.`)}
      />
      <ArrayInput
        value={lookups}
        onChange={setLookups}
        label={tx('Sonra aranacaklar', 'Then look up')}
        presets={[{ label: tx('Biri var, biri yok', 'One present, one absent'), values: [7, 3] }]}
        options={{ maxLength: 4, min: 0, max: HASH_P - 1, nonNegative: true }}
        random={() => randomArray(makeRng(Date.now() % 7919), 2, 0, HASH_P - 1)}
      />
      <Choice
        label={tx('Hash fonksiyonu', 'Hash function')}
        value={kind}
        onChange={setKind}
        options={[
          { value: 'notes', label: tx('Notlar: (13x + 2) mod n', 'Notes: (13x + 2) mod n') },
          { value: 'mod', label: 'x mod n' },
          { value: 'universal', label: tx('Evrensel aileden rastgele', 'Random from the universal family') },
        ]}
      />
      <Choice label={tx('Kova sayısı n', 'Buckets n')} value={String(n)} onChange={(v) => setN(Number(v))} options={[3, 5, 7, 8, 10, 13].map((v) => ({ value: String(v), label: String(v) }))} />
      {kind === 'universal' && (
        <button className="btn" type="button" style={{ alignSelf: 'flex-end' }} onClick={() => setSeed((s) => s + 1)}>
          {tx('Yeni a, b çek', 'Draw new a, b')}
        </button>
      )}
    </>
  )
  return (
    <TraceViewer
      key={kind + n + seed + keys.join(',') + '|' + lookups.join(',')}
      trace={trace}
      label={tx('Zincirleme hash tablosu görselleştirmesi', 'Hash table with chaining visualization')}
      toolbar={toolbar}
      code={HASH_CODE}
      render={(step) => <Buckets s={step.state} />}
      side={() => (
        <div className="stack">
          <div className="small">
            <Tex>{hashFormula(h)}</Tex>
          </div>
          <KV
            items={[
              [tx('anahtar sayısı', 'keys'), buckets.reduce((a, b) => a + b.length, 0)],
              [tx('en uzun zincir', 'longest chain'), longest],
              [tx('boş kova', 'empty buckets'), buckets.filter((b) => !b.length).length],
            ]}
          />
          <p className="small muted" style={{ margin: 0 }}>
            {kind === 'mod'
              ? tx('Sabit bir fonksiyon için kötü bir anahtar kümesi her zaman bulunabilir: n’nin katlarını deneyin.', 'For any fixed function a bad key set always exists: try the multiples of n.')
              : kind === 'universal'
                ? tx(`a ∈ {1…${HASH_P - 1}} ve b ∈ {0…${HASH_P - 1}} rastgele çekildi. Hangi anahtarlar verilirse verilsin, iki farklı anahtarın çakışma olasılığı ≤ 1/n.`, `a ∈ {1…${HASH_P - 1}} and b ∈ {0…${HASH_P - 1}} were drawn at random. Whatever keys are given, two distinct keys collide with probability ≤ 1/n.`)
                : tx('Notlardaki örnek: 1 → 0, 8 → 1, 2 ve 7 → 3, 4 → 4; kova 2 boş.', 'The notes’ example: 1 → 0, 8 → 1, 2 and 7 → 3, 4 → 4; bucket 2 is empty.')}
          </p>
        </div>
      )}
      legend={<Legend items={[{ color: 'var(--st-compare-bg)', border: 'var(--st-compare)', label: tx('karşılaştırılan', 'compared') }, { color: 'var(--st-sorted-bg)', border: 'var(--st-sorted)', label: tx('bulundu / eklendi', 'found / inserted') }]} />}
    />
  )
}

function Buckets({ s }: { s: HashState }) {
  return (
    <ol className="hash-buckets" aria-label={tx('Kovalar', 'Buckets')}>
      {s.buckets.map((chain, i) => {
        const active = s.bucket === i
        return (
          <li key={i} className={active ? 'active' : undefined}>
            <span className="mono hash-index">B{i}</span>
            <span className="hash-chain">
              {chain.length === 0 && <span className="muted mono small">NIL</span>}
              {chain.map((x, k) => {
                const cls = active && k === s.probe ? (s.found || (s.op === 'insert' && k === chain.length - 1 && x === s.key) ? 'found' : 'probe') : ''
                return (
                  <span key={k} className="hash-item-wrap">
                    {k > 0 && <span aria-hidden className="muted">→</span>}
                    <span className={'mono hash-item ' + cls}>{x}</span>
                  </span>
                )
              })}
            </span>
            {active && s.key !== null && (
              <span className="small" style={{ color: 'var(--st-compare)' }}>
                ← {s.op === 'lookup' ? tx('aranan', 'looking up') : tx('eklenen', 'inserting')} {s.key}
                {s.found === false ? tx(' (yok)', ' (absent)') : ''}
              </span>
            )}
          </li>
        )
      })}
    </ol>
  )
}

/** Balls into bins / birthday paradox: exact probability, the notes’ bound and a seeded simulation. */
export function BirthdayViz() {
  const [n, setN] = useState(365)
  const [m, setM] = useState(23)
  const [seed, setSeed] = useState(1)
  const exact = 1 - noCollisionProbability(m, n)
  const bound = 1 - noCollisionBound(m, n)
  const sim = useMemo(() => simulateBalls(m, n, 2000, seed), [m, n, seed])
  const maxM = Math.min(n + 1, Math.max(60, Math.ceil(3 * Math.sqrt(n))))
  const xs = Array.from({ length: maxM }, (_, i) => i + 1)
  return (
    <div className="card card-pad stack" role="group" aria-label={tx('Doğum günü paradoksu', 'Birthday paradox')}>
      <div className="row">
        <Choice label={tx('Kova (gün) sayısı n', 'Bins (days) n')} value={String(n)} onChange={(v) => { setN(Number(v)); setM(Math.min(m, Number(v) + 1)) }} options={[30, 100, 365, 1000].map((v) => ({ value: String(v), label: String(v) }))} />
        <label className="field">
          <span>
            {tx('Top (kişi) sayısı m', 'Balls (people) m')}: <strong className="mono">{m}</strong>
          </span>
          <input type="range" min={1} max={maxM} value={m} onChange={(e) => setM(Number(e.target.value))} />
        </label>
        <button className="btn" type="button" style={{ alignSelf: 'flex-end' }} onClick={() => setSeed((x) => x + 1)}>
          {tx('Yeniden simüle et', 'Simulate again')}
        </button>
      </div>
      <KV
        items={[
          [tx('P[çakışma]', 'P[collision]'), exact.toFixed(3)],
          [tx('alt sınır', 'lower bound'), bound.toFixed(3)],
          [tx('simülasyon', 'simulation'), sim.collisionRate.toFixed(3)],
          [tx('E[çakışan çift]', 'E[colliding pairs]'), expectedCollidingPairs(m, n).toFixed(2)],
        ]}
      />
      <LineChart
        title={tx('P[en az bir çakışma], m’ye göre', 'P[at least one collision] against m')}
        xLabel="m"
        yLabel="P"
        height={240}
        series={[
          { name: tx('tam değer', 'exact'), color: 'var(--series-1)', points: xs.map((x) => ({ x, y: 1 - noCollisionProbability(x, n) })) },
          { name: tx('alt sınır 1 − e^(−m(m−1)/2n)', 'lower bound 1 − e^(−m(m−1)/2n)'), color: 'var(--series-2)', dashed: true, points: xs.map((x) => ({ x, y: 1 - noCollisionBound(x, n) })) },
        ]}
      />
      <p className="small muted" style={{ margin: 0 }}>
        {tx(
          `${m} top ${n} kovaya rastgele atılıyor; simülasyon 2000 deneme yapar (tohum ${seed}). Beklenen çakışan çift sayısı m(m−1)/2n, çakışma olasılığı için bir üst sınırdır.`,
          `${m} balls are thrown into ${n} bins at random; the simulation runs 2000 trials (seed ${seed}). The expected number of colliding pairs m(m−1)/2n is an upper bound on the collision probability.`,
        )}
      </p>
    </div>
  )
}

