import { tx } from '../i18n/lang'

export function Pseudocode({ lines, active }: { lines: string[]; active?: number }) {
  return (
    // Focusable so keyboard users can scroll long lines on narrow screens.
    <pre className="code" role="group" aria-label={tx('Sözde kod', 'Pseudocode')} tabIndex={0}>
      {lines.map((l, i) => (
        <div key={i} className={'ln' + (active === i + 1 ? ' hl' : '')} aria-current={active === i + 1 ? 'step' : undefined}>
          <span className="no">{i + 1}</span>
          <span>{l || ' '}</span>
        </div>
      ))}
    </pre>
  )
}
