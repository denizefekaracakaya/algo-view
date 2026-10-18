import { useMemo, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Tex } from '../components/Tex'
import { substitution, type SubTerm } from '../engines/recurrence'

const PRESETS: { label: string; terms: SubTerm[]; p: number; c: number }[] = [
  { label: 'Özgün örnek: T(n/3)+T(n/2)+n', terms: [{ k: 1, num: 1, den: 3 }, { k: 1, num: 1, den: 2 }], p: 1, c: 1 },
  { label: 'Select: T(n/5)+T(7n/10)+cn', terms: [{ k: 1, num: 1, den: 5 }, { k: 1, num: 7, den: 10 }], p: 1, c: 1 },
  { label: 'Başarısız tahmin: 2T(n/2)+n', terms: [{ k: 2, num: 1, den: 2 }], p: 1, c: 1 },
  { label: '2T(n/2)+3T(n/3)+n²', terms: [{ k: 2, num: 1, den: 2 }, { k: 3, num: 1, den: 3 }], p: 2, c: 1 },
]

/** Step-by-step substitution method for T(n) ≤ Σ k·T(αn) + c·n^p with the guess T(n) ≤ D·n^p. */
export function SubstitutionLab() {
  const [terms, setTerms] = useState<SubTerm[]>(PRESETS[0].terms)
  const [p, setP] = useState(1)
  const [c, setC] = useState(1)
  const [shown, setShown] = useState(1)
  const valid = terms.every((t) => t.k >= 1 && t.num >= 1 && t.den > t.num && Number.isInteger(t.k) && Number.isInteger(t.num) && Number.isInteger(t.den)) && c >= 1 && Number.isInteger(c)
  const res = useMemo(() => (valid ? substitution(terms, p, c, 1) : null), [terms, p, c, valid])
  const update = (i: number, patch: Partial<SubTerm>) => {
    setTerms((ts) => ts.map((t, j) => (j === i ? { ...t, ...patch } : t)))
    setShown(1)
  }
  const tex = `T(n) \\le ${terms.map((t) => `${t.k === 1 ? '' : t.k}T\\!\\left(\\tfrac{${t.num === 1 ? '' : t.num}n}{${t.den}}\\right)`).join(' + ')} + ${c === 1 ? '' : c}n${p === 1 ? '' : `^{${p}}`},\\quad T(1) = 1`
  return (
    <div className="card viz">
      <div className="viz-toolbar" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
        <div className="row">
          {PRESETS.map((pr) => (
            <button
              key={pr.label}
              className="btn sm"
              onClick={() => {
                setTerms(pr.terms)
                setP(pr.p)
                setC(pr.c)
                setShown(1)
              }}
            >
              {pr.label}
            </button>
          ))}
        </div>
        <div className="row">
          {terms.map((t, i) => (
            <fieldset key={i} className="row" style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '4px 8px', margin: 0 }}>
              <legend className="small muted">Terim {i + 1}</legend>
              <input className="input mono" style={{ width: 54 }} type="number" min={1} value={t.k} onChange={(e) => update(i, { k: Math.max(1, Math.floor(Number(e.target.value) || 1)) })} aria-label={`Terim ${i + 1} kopya sayısı`} />
              <span className="mono">· T(</span>
              <input className="input mono" style={{ width: 54 }} type="number" min={1} value={t.num} onChange={(e) => update(i, { num: Math.max(1, Math.floor(Number(e.target.value) || 1)) })} aria-label={`Terim ${i + 1} pay`} />
              <span className="mono">n /</span>
              <input className="input mono" style={{ width: 60 }} type="number" min={2} value={t.den} onChange={(e) => update(i, { den: Math.max(2, Math.floor(Number(e.target.value) || 2)) })} aria-label={`Terim ${i + 1} payda`} />
              <span className="mono">)</span>
              {terms.length > 1 && (
                <button className="btn icon sm ghost" onClick={() => setTerms((ts) => ts.filter((_, j) => j !== i))} aria-label={`Terim ${i + 1} sil`}>
                  <Trash2 size={14} aria-hidden />
                </button>
              )}
            </fieldset>
          ))}
          {terms.length < 4 && (
            <button className="btn sm" onClick={() => setTerms((ts) => [...ts, { k: 1, num: 1, den: 4 }])}>
              <Plus size={14} aria-hidden /> Terim ekle
            </button>
          )}
          <label className="field">
            c (iş katsayısı)
            <input className="input mono" style={{ width: 70 }} type="number" min={1} value={c} onChange={(e) => setC(Math.max(1, Math.floor(Number(e.target.value) || 1)))} />
          </label>
          <label className="field">
            p (iş üssü, tahmin D·nᵖ)
            <select className="input" value={p} onChange={(e) => setP(Number(e.target.value))}>
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
            </select>
          </label>
        </div>
      </div>
      <div className="viz-stage stack">
        <Tex display>{tex}</Tex>
        {!valid && (
          <div className="error-msg" role="alert">
            Her terimde pay &lt; payda olmalı (alt problem n’den küçük) ve tüm değerler pozitif tam sayı olmalı.
          </div>
        )}
        {res && (
          <ol className="stack" style={{ listStyle: 'none', padding: 0, margin: 0 }} aria-live="polite">
            {res.steps.slice(0, shown).map((s, i) => (
              <li key={i} className="callout" style={{ marginBottom: 0 }}>
                <span className="label-tag">{s.title}</span>
                <Tex display>{s.tex}</Tex>
                {s.note && <p className="small" style={{ margin: 0 }}>{s.note}</p>}
              </li>
            ))}
          </ol>
        )}
        {res && (
          <div className="row">
            <button className="btn primary" onClick={() => setShown((s) => Math.min(res.steps.length, s + 1))} disabled={shown >= res.steps.length}>
              Sonraki adım ({shown}/{res.steps.length})
            </button>
            <button className="btn" onClick={() => setShown(res.steps.length)} disabled={shown >= res.steps.length}>
              Tümünü göster
            </button>
            <button className="btn ghost" onClick={() => setShown(1)}>
              Başa dön
            </button>
          </div>
        )}
        <p className="small muted">
          Not: Taban ve tavan (⌊⌋, ⌈⌉) etkileri, Ders 3–4 notlarındaki gibi göz ardı edilmiştir. Bir tahminin tümevarımla doğrulanamaması, sınırın yanlış olduğunu her zaman göstermez (ör. T(n) ≤ 2T(n/2)+1 için cn başarısız olur ama cn − 1 çalışır).
        </p>
      </div>
    </div>
  )
}
