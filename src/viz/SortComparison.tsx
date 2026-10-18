import { useMemo, useState } from 'react'
import { Tex } from '../components/Tex'
import { insertionSortComparisons } from '../engines/insertionSort'
import { mergeSortComparisons } from '../engines/mergeSort'
import { quickSort } from '../engines/quickSort'
import { digitCount } from '../engines/bucketSort'
import { makeRng, randomArray } from '../engines/random'
import { tx } from '../i18n/lang'

interface Row {
  id: string
  name: string
  model: string
  worst: string
  expected: string
  guarantee: string
  stable: string
  notes: string
}

const rows = (): Row[] => {
  const cmp = tx('Karşılaştırma', 'Comparison')
  const val = tx('Değer tabanlı', 'Value-based')
  const yes = tx('Evet', 'Yes')
  const no = tx('Hayır', 'No')
  const det = tx('En kötü durum (deterministik)', 'Worst case (deterministic)')
  return [
    { id: 'ins', name: 'InsertionSort', model: cmp, worst: 'O(n^2)', expected: '—', guarantee: det, stable: yes, notes: tx('Neredeyse sıralı girdide az iş yapar, ama garanti n² ölçeğindedir.', 'Does little work on nearly sorted input, but the guarantee is on the n² scale.') },
    { id: 'mer', name: 'MergeSort', model: cmp, worst: 'O(n\\log n)', expected: '—', guarantee: det, stable: yes, notes: tx('Karşılaştırma modelinde asimptotik olarak en iyisi (alt sınırla eşleşir).', 'Asymptotically optimal in the comparison model (matches the lower bound).') },
    {
      id: 'qsr',
      name: tx('QuickSort (rastgele pivot)', 'QuickSort (random pivot)'),
      model: cmp,
      worst: 'O(n^2)',
      expected: 'O(n\\log n)',
      guarantee: tx('Her girdi için beklenen süre (algoritmanın rastgeleliği üzerinden)', 'Expected time for every input (over the algorithm’s randomness)'),
      stable: no,
      notes: tx('Yerinde (in-place) kolayca uygulanır; pratikte hızlı.', 'Easy to implement in place; fast in practice.'),
    },
    {
      id: 'qsd',
      name: tx('QuickSort (sabit pivot, ör. son eleman)', 'QuickSort (fixed pivot, e.g. last element)'),
      model: cmp,
      worst: 'O(n^2)',
      expected: '—',
      guarantee: tx('Deterministik; sıralı girdide Θ(n²)', 'Deterministic; Θ(n²) on sorted input'),
      stable: no,
      notes: tx('Rastgele girdi üzerinde ortalama iyi olabilir, ama bu girdi dağılımına dair bir varsayımdır.', 'Can be good on average over random input, but that is an assumption about the input distribution.'),
    },
    { id: 'cnt', name: 'CountingSort', model: val, worst: 'O(n + r)', expected: '—', guarantee: tx('En kötü durum; anahtarlar {0,…,r−1}', 'Worst case; keys in {0,…,r−1}'), stable: yes, notes: tx('r büyükse (ör. r ≫ n) zaman ve bellek pahalı.', 'Expensive in time and memory when r is large (e.g. r ≫ n).') },
    { id: 'rad', name: tx('RadixSort (taban r)', 'RadixSort (base r)'), model: val, worst: 'O(d(n + r))', expected: '—', guarantee: tx('En kötü durum; d = ⌊log_r M⌋ + 1 basamak', 'Worst case; d = ⌊log_r M⌋ + 1 digits'), stable: yes, notes: tx('r = n ve M ≤ n^c (c sabit) ise O(n).', 'O(n) if r = n and M ≤ n^c (c constant).') },
  ]
}

const scenarios = () => [
  {
    id: 'small-int',
    label: tx('n tam sayı, değerler [0, n)', 'n integers, values in [0, n)'),
    best: ['cnt', 'rad'],
    why: tx('Değer aralığı küçük (r = n): CountingSort O(n + n) = O(n). Karşılaştırma alt sınırı bu modelde geçerli değil.', 'The value range is small (r = n): CountingSort is O(n + n) = O(n). The comparison lower bound does not apply in this model.'),
  },
  {
    id: 'poly-int',
    label: tx('n tam sayı, değerler ≤ n³', 'n integers, values ≤ n³'),
    best: ['rad'],
    why: tx('CountingSort’ta r = n³ kova gerekir (O(n³)). RadixSort taban r = n ile d = 3 (+1) basamak: O(n).', 'CountingSort would need r = n³ buckets (O(n³)). RadixSort with base r = n has d = 3 (+1) digits: O(n).'),
  },
  {
    id: 'huge-int',
    label: tx('n tam sayı, değerler ≤ 2ⁿ', 'n integers, values ≤ 2ⁿ'),
    best: ['mer', 'qsr'],
    why: tx('RadixSort taban n ile d ≈ n / log n basamak → O(n²/log n). Karşılaştırma tabanlı O(n log n) daha iyi.', 'RadixSort with base n has d ≈ n / log n digits → O(n²/log n). Comparison-based O(n log n) is better.'),
  },
  {
    id: 'objects',
    label: tx('Yalnızca karşılaştırılabilen nesneler, en kötü durum garantisi gerek', 'Objects that can only be compared; a worst-case guarantee is needed'),
    best: ['mer'],
    why: tx('Değerlere erişim yok → karşılaştırma modeli; Ω(n log n) alt sınırı geçerli ve MergeSort bunu en kötü durumda sağlıyor.', 'No access to values → the comparison model; the Ω(n log n) lower bound applies, and MergeSort achieves it in the worst case.'),
  },
  {
    id: 'adversary',
    label: tx('Girdi bir rakip tarafından seçiliyor, pratik hız önemli', 'An adversary picks the input; practical speed matters'),
    best: ['qsr', 'mer'],
    why: tx('Rastgele pivot, rakibin seçtiği her girdi için beklenen O(n log n) verir; sabit pivot ise sıralı girdide Θ(n²) olur.', 'A random pivot gives expected O(n log n) on every input the adversary picks; a fixed pivot is Θ(n²) on sorted input.'),
  },
]

export function SortComparison() {
  const ROWS = rows()
  const SCENARIOS = scenarios()
  const [scenario, setScenario] = useState(SCENARIOS[0].id)
  const [n, setN] = useState(64)
  const sc = SCENARIOS.find((s) => s.id === scenario)!
  const measured = useMemo(() => {
    const rng = makeRng(5)
    const a = randomArray(rng, n, 0, n - 1)
    const sorted = Array.from({ length: n }, (_, i) => i)
    const r = Math.max(2, n)
    return {
      ins: insertionSortComparisons(a),
      mer: mergeSortComparisons(a),
      qsr: quickSort(a, 'random', 1).comparisons,
      qsdSorted: quickSort(sorted, 'last').comparisons,
      cnt: n + r,
      rad: digitCount(n - 1, r) * (n + r),
    }
  }, [n])
  return (
    <div className="card card-pad stack">
      <div className="row">
        <label className="field grow">
          {tx('Senaryo', 'Scenario')}
          <select className="input" value={scenario} onChange={(e) => setScenario(e.target.value)}>
            {SCENARIOS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="callout" role="status">
        <strong>{tx('Uygun seçim: ', 'Suitable choice: ')}</strong>
        {sc.best.map((b) => ROWS.find((r) => r.id === b)!.name).join(tx(' veya ', ' or '))}. {sc.why}
      </div>
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>{tx('Algoritma', 'Algorithm')}</th>
              <th>Model</th>
              <th>{tx('En kötü durum', 'Worst case')}</th>
              <th>{tx('Beklenen', 'Expected')}</th>
              <th>{tx('Garanti türü', 'Kind of guarantee')}</th>
              <th>{tx('Kararlı', 'Stable')}</th>
              <th>{tx('Not', 'Note')}</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.id} className={sc.best.includes(r.id) ? 'hl' : ''}>
                <td>
                  <strong>{r.name}</strong>
                  {sc.best.includes(r.id) && <span className="sr-only"> {tx('(önerilen)', '(recommended)')}</span>}
                </td>
                <td>{r.model}</td>
                <td>
                  <Tex>{r.worst}</Tex>
                </td>
                <td>{r.expected === '—' ? '—' : <Tex>{r.expected}</Tex>}</td>
                <td className="small">{r.guarantee}</td>
                <td>{r.stable}</td>
                <td className="small">{r.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <details>
        <summary>{tx('Bir örnek girdide ölçülen işlem sayıları (ampirik)', 'Operation counts measured on one sample input (empirical)')}</summary>
        <div className="stack" style={{ marginTop: 8 }}>
          <label className="field">
            n = {n} {tx('(değerler [0, n) aralığında, tohum 5)', '(values in [0, n), seed 5)')}
            <input type="range" min={8} max={512} step={8} value={n} onChange={(e) => setN(Number(e.target.value))} style={{ accentColor: 'var(--accent)' }} />
          </label>
          <table className="data">
            <tbody>
              <tr><td>{tx('InsertionSort karşılaştırma', 'InsertionSort comparisons')}</td><td className="num">{measured.ins}</td></tr>
              <tr><td>{tx('MergeSort karşılaştırma', 'MergeSort comparisons')}</td><td className="num">{measured.mer}</td></tr>
              <tr><td>{tx('QuickSort (rastgele, tohum 1) karşılaştırma', 'QuickSort (random, seed 1) comparisons')}</td><td className="num">{measured.qsr}</td></tr>
              <tr><td>{tx('QuickSort (son eleman) — sıralı girdi, karşılaştırma', 'QuickSort (last element) — sorted input, comparisons')}</td><td className="num">{measured.qsdSorted}</td></tr>
              <tr><td>{tx('CountingSort temel işlem ≈ n + r (r = n)', 'CountingSort basic operations ≈ n + r (r = n)')}</td><td className="num">{measured.cnt}</td></tr>
              <tr><td>{tx('RadixSort temel işlem ≈ d(n + r) (r = n)', 'RadixSort basic operations ≈ d(n + r) (r = n)')}</td><td className="num">{measured.rad}</td></tr>
            </tbody>
          </table>
          <p className="small muted">
            {tx(
              'Karşılaştırma sayıları ile kova işlemleri farklı birimlerdir; bu tablo yalnızca ölçek fikri verir ve hiçbir asimptotik iddiayı kanıtlamaz.',
              'Comparison counts and bucket operations are different units; this table only gives a sense of scale and proves no asymptotic claim.',
            )}
          </p>
        </div>
      </details>
    </div>
  )
}
