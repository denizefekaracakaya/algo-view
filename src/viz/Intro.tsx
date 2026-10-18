import { useState } from 'react'
import { Tex } from '../components/Tex'

/** Lecture 1: an n^1.6 algorithm run "by hand" (much slower) eventually beats an n^2 algorithm on a computer. */
export function HandVsComputer() {
  const [slow, setSlow] = useState(4) // log10 of slowdown factor
  const [e, setE] = useState(1.6)
  const factor = 10 ** slow
  // factor * n^e < n^2  ⇔  n > factor^(1/(2−e))
  const crossLog = slow / (2 - e)
  return (
    <div className="card card-pad stack">
      <div className="row">
        <label className="field" style={{ flex: '1 1 220px' }}>
          Elle çalıştırma kaç kat yavaş? 10^{slow} = {factor.toLocaleString('tr-TR')}
          <input type="range" min={1} max={8} value={slow} onChange={(ev) => setSlow(Number(ev.target.value))} style={{ accentColor: 'var(--accent)' }} />
        </label>
        <label className="field" style={{ flex: '1 1 220px' }}>
          Hızlı algoritmanın üssü e = {e.toFixed(2)}
          <input type="range" min={1.05} max={1.95} step={0.05} value={e} onChange={(ev) => setE(Number(ev.target.value))} style={{ accentColor: 'var(--accent)' }} />
        </label>
      </div>
      <Tex display>{`${factor === 1 ? '' : '10^{' + slow + '}\\cdot '}n^{${e.toFixed(2)}} < n^2 \\iff n > 10^{${slow}/(2-${e.toFixed(2)})} = 10^{${crossLog.toFixed(2)}}`}</Tex>
      <p className="small" style={{ margin: 0 }} role="status">
        Yaklaşık <strong>{crossLog < 15 ? Math.ceil(10 ** crossLog).toLocaleString('tr-TR') : `10^${crossLog.toFixed(1)}`}</strong> basamaktan büyük sayılar için, n^{e.toFixed(2)} ölçeğindeki algoritmayı elle çalıştırmak bile n² algoritmasını bilgisayarda çalıştırmaktan hızlıdır. Sabit çarpan ne kadar büyük olursa olsun, üs farkı sonunda kazanır — asimptotik analizin özü.
      </p>
    </div>
  )
}
