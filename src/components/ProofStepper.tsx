import { useState } from 'react'
import { Rich } from './Tex'

/** Reveals the steps of a proof one at a time, so the reader predicts each step before seeing it. */
export function ProofStepper({ steps, label }: { steps: { title: string; body: string }[]; label?: string }) {
  const [shown, setShown] = useState(1)
  return (
    <div className="stack" style={{ gap: 8 }}>
      {label && <span className="label-tag">{label}</span>}
      <ol style={{ listStyle: 'none', padding: 0, margin: 0 }} className="stack" aria-live="polite">
        {steps.slice(0, shown).map((s, i) => (
          <li key={i} className="callout formal" style={{ marginBottom: 0 }}>
            <strong>
              {i + 1}. {s.title}
            </strong>
            <Rich text={s.body} />
          </li>
        ))}
      </ol>
      <div className="row">
        <button className="btn sm primary" onClick={() => setShown((x) => Math.min(steps.length, x + 1))} disabled={shown >= steps.length}>
          Sonraki adım ({shown}/{steps.length})
        </button>
        <button className="btn sm" onClick={() => setShown(steps.length)} disabled={shown >= steps.length}>
          Tümünü göster
        </button>
        {shown > 1 && (
          <button className="btn sm ghost" onClick={() => setShown(1)}>
            Gizle
          </button>
        )}
      </div>
    </div>
  )
}
