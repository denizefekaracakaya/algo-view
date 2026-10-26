import type { ReactNode } from 'react'
import { CheckCircle2, Eye, RefreshCw, RotateCcw, XCircle } from 'lucide-react'
import { tx } from '../i18n/lang'
import type { Drill } from './useDrill'

export function DrillFrame({ d, prompt, stage, controls, onNew, onRestart }: { d: Drill; prompt: ReactNode; stage: ReactNode; controls: ReactNode; onNew: () => void; onRestart: () => void }) {
  return (
    <div className="card viz drill">
      <div className="viz-toolbar">
        <span className="step-count mono">
          {tx('Adım', 'Step')} {Math.min(d.idx + 1, d.total)} / {d.total}
        </span>
        <span className={'badge ' + (d.mistakes ? 'progress' : 'done')}>
          {d.mistakes} {tx('hata', d.mistakes === 1 ? 'mistake' : 'mistakes')}
        </span>
        <span className="spacer" />
        <button className="btn sm ghost" onClick={onRestart}>
          <RotateCcw size={14} aria-hidden /> {tx('Baştan', 'Restart')}
        </button>
        <button className="btn sm" onClick={onNew}>
          <RefreshCw size={14} aria-hidden /> {tx('Yeni girdi', 'New input')}
        </button>
      </div>
      <div className="viz-stage">{stage}</div>
      <div className="drill-panel">
        {d.done ? (
          <div className="feedback ok drill-done" role="status">
            <CheckCircle2 size={16} aria-hidden />{' '}
            <strong>
              {d.mistakes === 0
                ? tx('Tamamlandı, hiç hata yok!', 'Done, without a single mistake!')
                : tx(`Tamamlandı: ${d.total} adımda ${d.mistakes} hata.`, `Done: ${d.mistakes} mistake(s) in ${d.total} steps.`)}
            </strong>{' '}
            {d.mistakes > 0 ? tx('Aynı girdiyle baştan dene ya da yeni bir girdi al.', 'Try the same input again or get a new one.') : tx('Yeni bir girdiyle tekrar dene.', 'Try again with a new input.')}
          </div>
        ) : (
          <>
            <p className="drill-prompt">{prompt}</p>
            <div className="drill-controls" role="group" aria-label={tx('Seçenekler', 'Choices')}>
              {controls}
            </div>
            <button className="btn sm ghost" onClick={d.reveal}>
              <Eye size={14} aria-hidden /> {tx('Bu adımı göster', 'Show this step')}
            </button>
          </>
        )}
        <div aria-live="polite">
          {d.fb && !d.done && (
            <div key={d.idx + ':' + d.mistakes} className={'feedback drill-fb ' + (d.fb.ok ? 'ok' : 'no')}>
              {d.fb.ok ? <CheckCircle2 size={15} aria-hidden /> : <XCircle size={15} aria-hidden />} <strong>{d.fb.ok ? tx('Doğru. ', 'Right. ') : tx('Olmadı. ', 'Not quite. ')}</strong>
              {d.fb.text}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
