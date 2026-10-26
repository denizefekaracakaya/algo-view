import type { ReactNode } from 'react'

/** Small building blocks shared by the visualizers of Lectures 8–17. */

export function Seg<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="field">
      {label}
      <div className="seg" role="group" aria-label={label}>
        {options.map((o) => (
          <button key={o.value} type="button" aria-pressed={value === o.value} onClick={() => onChange(o.value)}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function Choice<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <label className="field">
      {label}
      <select className="input" value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export function KV({ items }: { items: [ReactNode, ReactNode][] }) {
  return (
    <dl className="kv">
      {items.map(([k, v], i) => (
        <div key={i}>
          <dt>{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  )
}

export type CellTone = 'cur' | 'from' | 'path' | 'hl' | 'bad' | 'muted' | undefined

/** A labelled table (DP tables, distance matrices). */
export function Grid({ caption, colHead, rowHead, cells, tone, corner = '' }: { caption: string; colHead: ReactNode[]; rowHead: ReactNode[]; cells: ReactNode[][]; tone?: (i: number, j: number) => CellTone; corner?: ReactNode }) {
  return (
    <div className="grid-wrap">
      <table className="dp-grid">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            <th scope="col">{corner}</th>
            {colHead.map((c, j) => (
              <th key={j} scope="col">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cells.map((row, i) => (
            <tr key={i}>
              <th scope="row">{rowHead[i]}</th>
              {row.map((c, j) => {
                const t = tone?.(i, j)
                return (
                  <td key={j} className={t ? 'c-' + t : undefined}>
                    {c}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function Legend({ items }: { items: { color: string; border?: string; label: string }[] }) {
  return (
    <span className="legend" style={{ marginTop: 0 }}>
      {items.map((it, i) => (
        <span key={i}>
          <span className="swatch" style={{ background: it.color, border: `2px solid ${it.border ?? it.color}` }} aria-hidden /> {it.label}
        </span>
      ))}
    </span>
  )
}
