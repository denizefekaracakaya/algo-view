import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, NotebookPen } from 'lucide-react'
import { useProgress } from '../state/ProgressContext'
import { locale, tx } from '../i18n/lang'

const NOTE_MAX = 20_000

/** Personal notes for one lesson, saved to this browser shortly after typing stops. */
export function LessonNotes({ lessonId }: { lessonId: string }) {
  const { progress, dispatch } = useProgress()
  const stored = progress.notes[lessonId]
  const [text, setText] = useState(stored?.text ?? '')
  const dirty = text !== (stored?.text ?? '')
  useEffect(() => {
    if (!dirty) return
    const t = setTimeout(() => dispatch({ type: 'note', lessonId, text, now: Date.now() }), 600)
    return () => clearTimeout(t)
  }, [text, dirty, lessonId, dispatch])
  return (
    <div className="notes">
      <label htmlFor={`notes-${lessonId}`} className="sr-only">
        {tx('Bu ders için notların', 'Your notes for this lesson')}
      </label>
      <textarea
        id={`notes-${lessonId}`}
        className="input notes-input"
        value={text}
        maxLength={NOTE_MAX}
        rows={6}
        placeholder={tx('Kendi cümlelerinle özet, takıldığın yerler, sınav için hatırlatmalar…', 'A summary in your own words, where you got stuck, reminders for the exam…')}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="row small muted" style={{ justifyContent: 'space-between' }}>
        <span aria-live="polite">
          {dirty ? (
            tx('Kaydediliyor…', 'Saving…')
          ) : stored ? (
            <>
              <Check size={13} aria-hidden style={{ verticalAlign: '-2px' }} /> {tx('Kaydedildi', 'Saved')} · {new Date(stored.updatedAt).toLocaleString(locale(), { dateStyle: 'short', timeStyle: 'short' })}
            </>
          ) : (
            tx('Notlar yalnızca bu tarayıcıda saklanır.', 'Notes are stored only in this browser.')
          )}
        </span>
        <Link to="/notlar">
          <NotebookPen size={13} aria-hidden style={{ verticalAlign: '-2px' }} /> {tx('Tüm notlarım', 'All my notes')}
        </Link>
      </div>
    </div>
  )
}
