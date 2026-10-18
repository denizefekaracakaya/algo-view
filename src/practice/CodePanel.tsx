import { useEffect, useMemo, useState, type KeyboardEvent } from 'react'
import { CheckCircle2, Circle, Eye, Lightbulb, Loader2, Play, RotateCcw, XCircle } from 'lucide-react'
import { Inline, Rich } from '../components/Tex'
import { useProgress } from '../state/ProgressContext'
import { tx } from '../i18n/lang'
import { exercisesFor, type Exercise, type RunOutcome, type TestCase } from './coding'
import { runCode, RUN_TIMEOUT_MS } from './runner'

export function CodePanel({ lessonId }: { lessonId: string | null }) {
  const { progress } = useProgress()
  const list = exercisesFor(lessonId)
  const [active, setActive] = useState(list[0]?.id ?? null)
  const ex = list.find((e) => e.id === active)
  if (!ex) return <p className="muted">{tx('Bu ders için kod alıştırması yok.', 'There is no coding exercise for this lesson.')}</p>
  return (
    <div className="code-lab">
      <nav className="code-list" aria-label={tx('Kod alıştırmaları', 'Coding exercises')}>
        {list.map((e) => (
          <button key={e.id} aria-pressed={e.id === active} onClick={() => setActive(e.id)}>
            {progress.code[e.id]?.solved ? <CheckCircle2 size={15} color="var(--st-sorted)" aria-label={tx('çözüldü', 'solved')} /> : <Circle size={15} aria-hidden className="muted" />}
            <span>{e.title()}</span>
          </button>
        ))}
      </nav>
      <ExerciseView key={ex.id} ex={ex} />
    </div>
  )
}

const short = (v: unknown, max = 90): string => {
  let s: string
  try {
    s = v === undefined ? 'undefined' : JSON.stringify(v)
  } catch {
    s = String(v)
  }
  return s.length > max ? s.slice(0, max - 1) + '…' : s
}

const argsText = (t: TestCase) => t.label ?? t.args.map((a) => short(a, 60)).join(', ')

function ExerciseView({ ex }: { ex: Exercise }) {
  const { progress, dispatch } = useProgress()
  const stored = progress.code[ex.id]?.src
  const [src, setSrc] = useState(() => stored || ex.starter())
  const tests = useMemo(() => ex.tests(), [ex])
  const [running, setRunning] = useState(false)
  const [out, setOut] = useState<RunOutcome | null>(null)
  const [hints, setHints] = useState(0)
  const [confirmReset, setConfirmReset] = useState(false)

  // Autosave the draft shortly after typing stops.
  useEffect(() => {
    if (src === (stored || ex.starter())) return
    const t = setTimeout(() => dispatch({ type: 'code', id: ex.id, src }), 500)
    return () => clearTimeout(t)
  }, [src, stored, ex, dispatch])

  const run = async () => {
    setRunning(true)
    const r = await runCode(src, ex.fnName, tests, ex.mode)
    setOut(r)
    setRunning(false)
    const all = !r.error && r.results.length === tests.length && r.results.every((x) => x.ok)
    dispatch({ type: 'code', id: ex.id, src, solved: all })
  }

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      if (!running) void run()
      return
    }
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault()
      const el = e.currentTarget
      const { selectionStart: a, selectionEnd: b } = el
      const next = src.slice(0, a) + '  ' + src.slice(b)
      setSrc(next)
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = a + 2
      })
    }
  }

  const lines = src.split('\n').length
  const passed = out?.results.filter((r) => r.ok).length ?? 0
  const solved = progress.code[ex.id]?.solved
  return (
    <div className="stack code-ex">
      <section className="card card-pad">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem' }}>{ex.title()}</h2>
          {solved && (
            <span className="badge done">
              <CheckCircle2 size={12} aria-hidden /> {tx('çözüldü', 'solved')}
            </span>
          )}
        </div>
        <Rich text={ex.prompt()} />
        {ex.hints().slice(0, hints).map((h, i) => (
          <div key={i} className="feedback hint small">
            <strong>
              {tx('İpucu', 'Hint')} {i + 1}:{' '}
            </strong>
            <Inline src={h} />
          </div>
        ))}
      </section>

      <div className="card code-editor-card">
        <div className="viz-toolbar code-toolbar">
          <span className="mono small muted">JavaScript</span>
          <span className="spacer" />
          <button className="btn sm ghost" onClick={() => setHints((h) => h + 1)} disabled={hints >= ex.hints().length}>
            <Lightbulb size={14} aria-hidden /> {tx('İpucu', 'Hint')} ({hints}/{ex.hints().length})
          </button>
          {confirmReset ? (
            <>
              <span className="small">{tx('Kodun silinsin mi?', 'Discard your code?')}</span>
              <button
                className="btn sm danger"
                onClick={() => {
                  setSrc(ex.starter())
                  dispatch({ type: 'code', id: ex.id, src: ex.starter() })
                  setConfirmReset(false)
                  setOut(null)
                }}
              >
                {tx('Evet', 'Yes')}
              </button>
              <button className="btn sm" onClick={() => setConfirmReset(false)}>
                {tx('Hayır', 'No')}
              </button>
            </>
          ) : (
            <button className="btn sm ghost" onClick={() => setConfirmReset(true)}>
              <RotateCcw size={14} aria-hidden /> {tx('Başlangıç kodu', 'Starter code')}
            </button>
          )}
          <button className="btn sm primary" onClick={() => void run()} disabled={running} title="Ctrl + Enter">
            {running ? <Loader2 size={14} aria-hidden className="spin" /> : <Play size={14} aria-hidden />} {tx('Çalıştır ve test et', 'Run tests')}
          </button>
        </div>
        <div className="code-wrap">
          <pre className="code-gutter" aria-hidden>
            {Array.from({ length: lines }, (_, i) => i + 1).join('\n')}
          </pre>
          <textarea
            className="code-input"
            value={src}
            onChange={(e) => setSrc(e.target.value)}
            onKeyDown={onKey}
            rows={Math.max(10, lines + 1)}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            wrap="off"
            aria-label={tx(`${ex.fnName} fonksiyonunun kodu`, `Code of the function ${ex.fnName}`)}
          />
        </div>
      </div>

      <section className="card card-pad" aria-live="polite" aria-busy={running}>
        {!out ? (
          <p className="small muted" style={{ margin: 0 }}>
            {tx(
              `${tests.length} test hazır. Kod tarayıcında ayrı bir işçide (Web Worker) çalışır; ${RUN_TIMEOUT_MS / 1000} saniyede bitmezse durdurulur. console.log çıktıları burada görünür.`,
              `${tests.length} tests ready. The code runs in your browser in a separate worker (Web Worker) and is stopped if it does not finish within ${RUN_TIMEOUT_MS / 1000} seconds. console.log output shows up here.`,
            )}
          </p>
        ) : out.error ? (
          <div className="feedback no" role="status">
            <XCircle size={15} aria-hidden />{' '}
            <strong>
              {out.error === 'timeout'
                ? tx(`Süre sınırı (${RUN_TIMEOUT_MS / 1000} sn) aşıldı.`, `Time limit (${RUN_TIMEOUT_MS / 1000} s) exceeded.`)
                : out.error === 'missing'
                  ? tx(`\`${ex.fnName}\` adında bir fonksiyon bulunamadı.`, `No function called \`${ex.fnName}\` was found.`)
                  : tx('Kod çalıştırılamadı (sözdizimi hatası).', 'The code could not run (syntax error).')}
            </strong>{' '}
            {out.error === 'timeout' ? tx('Sonsuz döngü ya da büyük testler için fazla yavaş bir algoritma olabilir.', 'This may be an infinite loop or an algorithm too slow for the big tests.') : out.message}
          </div>
        ) : (
          <>
            <div className={'feedback ' + (passed === tests.length ? 'ok' : 'no')} role="status">
              {passed === tests.length ? <CheckCircle2 size={15} aria-hidden /> : <XCircle size={15} aria-hidden />}{' '}
              <strong>{tx(`${passed} / ${tests.length} test geçti.`, `${passed} / ${tests.length} tests passed.`)}</strong>{' '}
              {passed === tests.length ? tx('Tebrikler!', 'Well done!') : tx('Kırmızı testlerin girdisine bakıp kodunu izle.', 'Look at the inputs of the red tests and trace your code.')}
            </div>
            <ol className="test-list">
              {out.results.map((r, i) => (
                <li key={i} className={r.ok ? 'ok' : 'no'}>
                  {r.ok ? <CheckCircle2 size={14} color="var(--st-sorted)" aria-label={tx('geçti', 'passed')} /> : <XCircle size={14} color="var(--st-bad)" aria-label={tx('kaldı', 'failed')} />}
                  <span className="mono small grow">
                    {ex.fnName}({argsText(tests[i])})
                    {!r.ok && (
                      <span className="test-detail">
                        {r.error ? (
                          <>
                            {tx('hata', 'error')}: {r.error}
                          </>
                        ) : (
                          <>
                            {tx('beklenen', 'expected')}: {short(tests[i].expected)} · {tx('dönen', 'got')}: {short(r.got)}
                          </>
                        )}
                      </span>
                    )}
                  </span>
                  <span className="mono small muted">{r.ms} ms</span>
                </li>
              ))}
            </ol>
          </>
        )}
        {out && out.logs.length > 0 && (
          <div>
            <strong className="small">console.log</strong>
            <pre className="code-console">{out.logs.join('\n')}</pre>
          </div>
        )}
        {out && (
          <details className="code-solution">
            <summary>
              <Eye size={14} aria-hidden style={{ verticalAlign: '-2px' }} /> {tx('Örnek çözüm (önce kendin dene)', 'Sample solution (try it yourself first)')}
            </summary>
            <pre className="code-console">{ex.solution}</pre>
          </details>
        )}
      </section>
    </div>
  )
}
