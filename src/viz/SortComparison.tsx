import { useMemo, useState } from 'react'
import { Tex } from '../components/Tex'
import { insertionSortComparisons } from '../engines/insertionSort'
import { mergeSortComparisons } from '../engines/mergeSort'
import { quickSort } from '../engines/quickSort'
import { digitCount } from '../engines/bucketSort'
import { makeRng, randomArray } from '../engines/random'

interface Row {
  id: string
  name: string
  model: 'Karşılaştırma' | 'Değer tabanlı'
  worst: string
  expected: string
  guarantee: string
  stable: string
  notes: string
}

const ROWS: Row[] = [
  { id: 'ins', name: 'InsertionSort', model: 'Karşılaştırma', worst: 'O(n^2)', expected: '—', guarantee: 'En kötü durum (deterministik)', stable: 'Evet', notes: 'Neredeyse sıralı girdide az iş yapar, ama garanti n² ölçeğindedir.' },
  { id: 'mer', name: 'MergeSort', model: 'Karşılaştırma', worst: 'O(n\\log n)', expected: '—', guarantee: 'En kötü durum (deterministik)', stable: 'Evet', notes: 'Karşılaştırma modelinde asimptotik olarak en iyisi (alt sınırla eşleşir).' },
  { id: 'qsr', name: 'QuickSort (rastgele pivot)', model: 'Karşılaştırma', worst: 'O(n^2)', expected: 'O(n\\log n)', guarantee: 'Her girdi için beklenen süre (algoritmanın rastgeleliği üzerinden)', stable: 'Hayır', notes: 'Yerinde (in-place) kolayca uygulanır; pratikte hızlı.' },
  { id: 'qsd', name: 'QuickSort (sabit pivot, ör. son eleman)', model: 'Karşılaştırma', worst: 'O(n^2)', expected: '—', guarantee: 'Deterministik; sıralı girdide Θ(n²)', stable: 'Hayır', notes: 'Rastgele girdi üzerinde ortalama iyi olabilir, ama bu girdi dağılımına dair bir varsayımdır.' },
  { id: 'cnt', name: 'CountingSort', model: 'Değer tabanlı', worst: 'O(n + r)', expected: '—', guarantee: 'En kötü durum; anahtarlar {0,…,r−1}', stable: 'Evet', notes: 'r büyükse (ör. r ≫ n) zaman ve bellek pahalı.' },
  { id: 'rad', name: 'RadixSort (taban r)', model: 'Değer tabanlı', worst: 'O(d(n + r))', expected: '—', guarantee: 'En kötü durum; d = ⌊log_r M⌋ + 1 basamak', stable: 'Evet', notes: 'r = n ve M ≤ n^c (c sabit) ise O(n).' },
]

const SCENARIOS = [
  { id: 'small-int', label: 'n tam sayı, değerler [0, n)', best: ['cnt', 'rad'], why: 'Değer aralığı küçük (r = n): CountingSort O(n + n) = O(n). Karşılaştırma alt sınırı bu modelde geçerli değil.' },
  { id: 'poly-int', label: 'n tam sayı, değerler ≤ n³', best: ['rad'], why: 'CountingSort’ta r = n³ kova gerekir (O(n³)). RadixSort taban r = n ile d = 3 (+1) basamak: O(n).' },
  { id: 'huge-int', label: 'n tam sayı, değerler ≤ 2ⁿ', best: ['mer', 'qsr'], why: 'RadixSort taban n ile d ≈ n / log n basamak → O(n²/log n). Karşılaştırma tabanlı O(n log n) daha iyi.' },
  { id: 'objects', label: 'Yalnızca karşılaştırılabilen nesneler, en kötü durum garantisi gerek', best: ['mer'], why: 'Değerlere erişim yok → karşılaştırma modeli; Ω(n log n) alt sınırı geçerli ve MergeSort bunu en kötü durumda sağlıyor.' },
  { id: 'adversary', label: 'Girdi bir rakip tarafından seçiliyor, pratik hız önemli', best: ['qsr', 'mer'], why: 'Rastgele pivot, rakibin seçtiği her girdi için beklenen O(n log n) verir; sabit pivot ise sıralı girdide Θ(n²) olur.' },
]

export function SortComparison() {
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
          Senaryo
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
        <strong>Uygun seçim: </strong>
        {sc.best.map((b) => ROWS.find((r) => r.id === b)!.name).join(' veya ')}. {sc.why}
      </div>
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Algoritma</th>
              <th>Model</th>
              <th>En kötü durum</th>
              <th>Beklenen</th>
              <th>Garanti türü</th>
              <th>Kararlı</th>
              <th>Not</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.id} className={sc.best.includes(r.id) ? 'hl' : ''}>
                <td>
                  <strong>{r.name}</strong>
                  {sc.best.includes(r.id) && <span className="sr-only"> (önerilen)</span>}
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
        <summary>Bir örnek girdide ölçülen işlem sayıları (ampirik)</summary>
        <div className="stack" style={{ marginTop: 8 }}>
          <label className="field">
            n = {n} (değerler [0, n) aralığında, tohum 5)
            <input type="range" min={8} max={512} step={8} value={n} onChange={(e) => setN(Number(e.target.value))} style={{ accentColor: 'var(--accent)' }} />
          </label>
          <table className="data">
            <tbody>
              <tr><td>InsertionSort karşılaştırma</td><td className="num">{measured.ins}</td></tr>
              <tr><td>MergeSort karşılaştırma</td><td className="num">{measured.mer}</td></tr>
              <tr><td>QuickSort (rastgele, tohum 1) karşılaştırma</td><td className="num">{measured.qsr}</td></tr>
              <tr><td>QuickSort (son eleman) — sıralı girdi, karşılaştırma</td><td className="num">{measured.qsdSorted}</td></tr>
              <tr><td>CountingSort temel işlem ≈ n + r (r = n)</td><td className="num">{measured.cnt}</td></tr>
              <tr><td>RadixSort temel işlem ≈ d(n + r) (r = n)</td><td className="num">{measured.rad}</td></tr>
            </tbody>
          </table>
          <p className="small muted">Karşılaştırma sayıları ile kova işlemleri farklı birimlerdir; bu tablo yalnızca ölçek fikri verir ve hiçbir asimptotik iddiayı kanıtlamaz.</p>
        </div>
      </details>
    </div>
  )
}
