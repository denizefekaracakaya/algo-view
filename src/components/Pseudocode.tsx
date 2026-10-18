export function Pseudocode({ lines, active }: { lines: string[]; active?: number }) {
  return (
    <pre className="code" aria-label="Sözde kod">
      {lines.map((l, i) => (
        <div key={i} className={'ln' + (active === i + 1 ? ' hl' : '')} aria-current={active === i + 1 ? 'step' : undefined}>
          <span className="no">{i + 1}</span>
          <span>{l || ' '}</span>
        </div>
      ))}
    </pre>
  )
}
