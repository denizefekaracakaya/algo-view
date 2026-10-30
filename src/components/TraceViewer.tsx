import { useCallback, useState, type KeyboardEvent, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw, SkipForward, HelpCircle, CheckCircle2, XCircle } from 'lucide-react'
import type { Trace, TraceStep } from '../trace/types'
import { SPEEDS, useTracePlayer } from '../trace/player'
import { useProgress } from '../state/ProgressContext'
import { Pseudocode } from './Pseudocode'
import { tx } from '../i18n/lang'

interface Props<S> {
  trace: Trace<S>
  label: string
  render: (step: TraceStep<S>, index: number) => ReactNode
  code?: string[]
  codeTitle?: string
  legend?: ReactNode
  toolbar?: ReactNode
  side?: (step: TraceStep<S>) => ReactNode
}

/**
 * Generic step-by-step player: play/pause, previous/next, reset, jump to end, speed,
 * a scrubber, the current explanation, variables, counters, pseudocode highlighting and
 * optional "predict before you see" questions.
 */
export function TraceViewer<S>({ trace, label, render, code, codeTitle, legend, toolbar, side }: Props<S>) {
  const { progress, dispatch } = useProgress()
  const speed = progress.prefs.speed
  const predictMode = progress.prefs.predict
  const [pending, setPending] = useState<number | null>(null)
  const [answers, setAnswers] = useState<Record<number, number>>({})

  const needsPrediction = useCallback(
    (idx: number) => predictMode && idx < trace.length && !!trace[idx]?.predict && answers[idx] === undefined,
    [predictMode, trace, answers],
  )
  const guard = useCallback(
    (nextIdx: number) => {
      if (needsPrediction(nextIdx)) {
        setPending(nextIdx)
        return false
      }
      return true
    },
    [needsPrediction],
  )
  const p = useTracePlayer(trace.length, speed, guard)
  const step = trace[p.index]
  const atEnd = p.index >= trace.length - 1

  const onNext = () => {
    if (pending !== null) return
    if (guard(p.index + 1)) p.next()
  }
  const onKey = (e: KeyboardEvent) => {
    const tag = (e.target as HTMLElement).tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      onNext()
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      setPending(null)
      p.prev()
    }
  }
  const answer = (choice: number) => {
    if (pending === null) return
    setAnswers((a) => ({ ...a, [pending]: choice }))
  }
  const continueAfter = () => {
    if (pending === null) return
    const target = pending
    setPending(null)
    p.goto(target)
  }
  const pq = pending !== null ? trace[pending].predict! : null
  const pAnswer = pending !== null ? answers[pending] : undefined

  if (!step) return null
  return (
    <section className="card viz" aria-label={label} onKeyDown={onKey} style={{ ['--anim-ms' as string]: `${Math.round(Math.min(620, (1000 / speed) * 0.85))}ms` }}>
      {toolbar && <div className="viz-toolbar">{toolbar}</div>}
      <div className="viz-body">
        <div className="viz-stage">
          {render(step, p.index)}
          {legend && <div className="legend">{legend}</div>}
        </div>
        <div className="viz-side" role="group" aria-label={tx('Adım açıklaması', 'Step explanation')}>
          {pq ? (
            <div className="predict" role="group" aria-label={tx('Tahmin sorusu', 'Prediction question')}>
              <h3>
                <HelpCircle size={16} style={{ verticalAlign: '-3px' }} aria-hidden /> {tx('Önce tahmin et', 'Predict first')}
              </h3>
              <p className="small" style={{ marginBottom: 8 }}>
                {pq.question}
              </p>
              <div className="opts">
                {pq.options.map((o, i) => (
                  <button
                    key={i}
                    className={'btn sm' + (pAnswer !== undefined && i === pq.answer ? ' primary' : '')}
                    disabled={pAnswer !== undefined}
                    onClick={() => answer(i)}
                  >
                    {o}
                  </button>
                ))}
              </div>
              {pAnswer !== undefined && (
                <div className={'feedback ' + (pAnswer === pq.answer ? 'ok' : 'no')} role="status">
                  {pAnswer === pq.answer ? <CheckCircle2 size={15} aria-hidden /> : <XCircle size={15} aria-hidden />}{' '}
                  <strong>{pAnswer === pq.answer ? tx('Doğru.', 'Correct.') : tx('Tam değil.', 'Not quite.')}</strong> {pq.why}
                  <div style={{ marginTop: 8 }}>
                    <button className="btn sm primary" onClick={continueAfter} autoFocus>
                      {tx('Adımı göster', 'Show the step')} <ChevronRight size={15} aria-hidden />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              {step.phase && (
                <div className="phase" key={'ph' + step.phase}>
                  {step.phase}
                </div>
              )}
              <div className="explain" aria-live="polite" aria-atomic="true">
                <span key={p.index} className="explain-text">
                  {step.explain}
                </span>
              </div>
            </div>
          )}
          {step.vars && Object.keys(step.vars).length > 0 && (
            <div>
              <span className="label-tag">{tx('Değişkenler', 'Variables')}</span>
              <dl className="kv">
                {Object.entries(step.vars).map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
          {step.counters && (
            <div>
              <span className="label-tag">{tx('Sayaçlar', 'Counters')}</span>
              <dl className="kv">
                {Object.entries(step.counters).map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
          {side?.(step)}
          {code && (
            <div>
              <span className="label-tag">{codeTitle ?? tx('Sözde kod (pseudocode)', 'Pseudocode')}</span>
              <Pseudocode lines={code} active={step.line} />
            </div>
          )}
        </div>
      </div>
      <div className="viz-controls" role="toolbar" aria-label={tx('Oynatma kontrolleri', 'Playback controls')}>
        <button className="btn icon" onClick={() => { setPending(null); p.reset() }} aria-label={tx('Başa sar', 'Reset')} title={tx('Başa sar', 'Reset')}>
          <RotateCcw size={17} aria-hidden />
        </button>
        <button className="btn icon" onClick={() => { setPending(null); p.prev() }} disabled={p.index === 0} aria-label={tx('Önceki adım', 'Previous step')} title={tx('Önceki adım (←)', 'Previous step (←)')}>
          <ChevronLeft size={18} aria-hidden />
        </button>
        {p.playing ? (
          <button className="btn primary" onClick={p.pause} aria-label={tx('Duraklat', 'Pause')}>
            <Pause size={17} aria-hidden /> {tx('Duraklat', 'Pause')}
          </button>
        ) : (
          <button className="btn primary" onClick={() => (atEnd ? (setPending(null), p.reset(), p.play()) : p.play())} disabled={trace.length <= 1 || pending !== null} aria-label={tx('Oynat', 'Play')}>
            <Play size={17} aria-hidden /> {tx('Oynat', 'Play')}
          </button>
        )}
        <button className="btn icon" onClick={onNext} disabled={atEnd || pending !== null} aria-label={tx('Sonraki adım', 'Next step')} title={tx('Sonraki adım (→)', 'Next step (→)')}>
          <ChevronRight size={18} aria-hidden />
        </button>
        <button className="btn icon" onClick={() => { setPending(null); p.end() }} disabled={atEnd} aria-label={tx('Sona git', 'Jump to end')} title={tx('Sona git', 'Jump to end')}>
          <SkipForward size={17} aria-hidden />
        </button>
        <input
          className="scrub"
          type="range"
          min={0}
          max={Math.max(0, trace.length - 1)}
          value={p.index}
          onChange={(e) => {
            setPending(null)
            p.goto(Number(e.target.value))
          }}
          aria-label={tx('Adım seçici', 'Step scrubber')}
        />
        <span className="step-count" aria-live="off">
          {p.index + 1} / {trace.length}
        </span>
        <label className="row small" style={{ gap: 4 }}>
          <span className="muted">{tx('Hız', 'Speed')}</span>
          <select className="input" style={{ minHeight: 30, padding: '2px 6px' }} value={speed} onChange={(e) => dispatch({ type: 'prefs', prefs: { speed: Number(e.target.value) } })} aria-label={tx('Oynatma hızı', 'Playback speed')}>
            {SPEEDS.map((s) => (
              <option key={s} value={s}>
                {s}×
              </option>
            ))}
          </select>
        </label>
        <button
          className="btn sm"
          aria-pressed={predictMode}
          onClick={() => {
            setPending(null)
            dispatch({ type: 'prefs', prefs: { predict: !predictMode } })
          }}
          title={tx('Açıkken, önemli adımlardan önce ne olacağını tahmin etmeniz istenir.', 'When on, you are asked to predict what happens before key steps.')}
        >
          <HelpCircle size={15} aria-hidden /> {tx('Tahmin modu', 'Prediction mode')}
        </button>
      </div>
    </section>
  )
}
