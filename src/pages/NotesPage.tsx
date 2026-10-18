import { Link } from 'react-router-dom'
import { Download } from 'lucide-react'
import { allLessons } from '../content/curriculum'
import { Inline } from '../components/Tex'
import { LessonNotes } from '../components/LessonNotes'
import { useProgress } from '../state/ProgressContext'
import { locale, tx } from '../i18n/lang'

const plain = (s: string) => s.replace(/\$/g, '')

export function NotesPage() {
  const { progress } = useProgress()
  const withNotes = allLessons().filter((l) => progress.notes[l.id])
  const download = () => {
    const md = [
      `# Algo View — ${tx('Notlarım', 'My notes')}`,
      '',
      ...withNotes.flatMap((l) => [`## ${tx('Ders', 'Lecture')} ${l.lecture} · ${plain(l.title)}`, '', progress.notes[l.id].text.trim(), '']),
    ].join('\n')
    const url = URL.createObjectURL(new Blob([md], { type: 'text/markdown;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url
    a.download = tx('algo-view-notlarim.md', 'algo-view-notes.md')
    a.click()
    URL.revokeObjectURL(url)
  }
  return (
    <div className="stack" style={{ maxWidth: 860 }}>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0 }}>{tx('Notlarım', 'My notes')}</h1>
        <button className="btn" onClick={download} disabled={!withNotes.length}>
          <Download size={16} aria-hidden /> {tx('Markdown olarak indir', 'Download as Markdown')}
        </button>
      </div>
      <p className="small muted" style={{ margin: 0 }}>
        {tx(
          'Her dersin sonundaki “Notlarım” kutusuna yazdıkların burada toplanır. Notlar yalnızca bu tarayıcıda saklanır ve ilerlemeyi sıfırlamak onları silmez; bir notu silmek için kutuyu boşalt.',
          'Whatever you write in the “My notes” box at the end of each lesson is collected here. Notes are stored only in this browser and resetting progress does not delete them; empty a box to delete that note.',
        )}
      </p>
      {withNotes.length === 0 ? (
        <div className="card card-pad">
          <p style={{ margin: 0 }}>
            {tx('Henüz not yok. Bir derse girip sayfanın sonundaki “Notlarım” bölümüne yazmaya başla.', 'No notes yet. Open a lesson and start writing in the “My notes” section at the end of the page.')}{' '}
            <Link to="/">{tx('Panele git', 'Go to the dashboard')}</Link>
          </p>
        </div>
      ) : (
        withNotes.map((l) => (
          <section key={l.id} className="card card-pad stack" aria-labelledby={`note-h-${l.id}`}>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <h2 id={`note-h-${l.id}`} style={{ margin: 0, fontSize: '1.05rem' }}>
                <span className="lecture-num">
                  {tx('Ders', 'Lecture')} {l.lecture}
                </span>{' '}
                <Link to={`/ders/${l.id}`}>
                  <Inline src={l.title} />
                </Link>
              </h2>
              <span className="small muted">{new Date(progress.notes[l.id].updatedAt).toLocaleDateString(locale())}</span>
            </div>
            <LessonNotes lessonId={l.id} />
          </section>
        ))
      )}
    </div>
  )
}
