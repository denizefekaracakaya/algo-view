import { useId, useState } from 'react'
import { Shuffle } from 'lucide-react'
import { parseNumberList, type NumberListOptions } from '../engines/parse'
import { tx } from '../i18n/lang'

export interface Preset {
  label: string
  values: number[]
}

interface Props {
  value: number[]
  onChange: (v: number[]) => void
  presets: Preset[]
  options: NumberListOptions
  random: () => number[]
  label?: string
  hint?: string
}

/** Editable list of numbers with presets, a random generator and validation messages. */
export function ArrayInput({ value, onChange, presets, options, random, label = tx('Girdi dizisi', 'Input array'), hint }: Props) {
  const [text, setText] = useState(value.join(', '))
  const [error, setError] = useState<string | null>(null)
  const id = useId()
  const apply = (t: string) => {
    const r = parseNumberList(t, options)
    if (!r.ok) {
      setError(r.error)
      return
    }
    setError(null)
    onChange(r.value)
  }
  const set = (v: number[]) => {
    setText(v.join(', '))
    setError(null)
    onChange(v)
  }
  return (
    <div className="stack" style={{ gap: 6, flex: '1 1 320px' }}>
      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault()
          apply(text)
        }}
      >
        <label className="field grow" htmlFor={id} style={{ minWidth: 200 }}>
          {label}
          <input
            id={id}
            className="input mono"
            value={text}
            onChange={(e) => setText(e.target.value)}
            aria-invalid={!!error}
            aria-describedby={error ? id + '-err' : id + '-hint'}
          />
        </label>
        <button className="btn primary" type="submit" style={{ alignSelf: 'flex-end' }}>
          {tx('Uygula', 'Apply')}
        </button>
        <button className="btn" type="button" style={{ alignSelf: 'flex-end' }} onClick={() => set(random())} aria-label={tx('Rastgele dizi üret', 'Generate a random array')}>
          <Shuffle size={15} aria-hidden /> {tx('Rastgele', 'Random')}
        </button>
      </form>
      <div className="row" role="group" aria-label={tx('Hazır örnekler', 'Preset examples')}>
        <span className="small muted">{tx('Örnekler:', 'Examples:')}</span>
        {presets.map((p) => (
          <button key={p.label} className="btn sm" type="button" onClick={() => set(p.values)}>
            {p.label}
          </button>
        ))}
      </div>
      {error ? (
        <div className="error-msg" id={id + '-err'} role="alert">
          {error}
        </div>
      ) : (
        <div className="small muted" id={id + '-hint'}>
          {hint ?? tx(`Virgül veya boşlukla ayrılmış en fazla ${options.maxLength ?? 32} sayı.`, `Up to ${options.maxLength ?? 32} numbers separated by commas or spaces.`)}
        </div>
      )}
    </div>
  )
}
