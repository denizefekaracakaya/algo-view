import { useEffect, useRef, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useProgress } from '../state/ProgressContext'
import type { ThemePref } from '../state/progress'
import { SPEEDS } from '../trace/player'
import { tx, type Lang } from '../i18n/lang'

export function SettingsPage() {
  const { progress, dispatch } = useProgress()
  const [confirming, setConfirming] = useState(false)
  const [done, setDone] = useState(false)
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!confirming) return
    cancelRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setConfirming(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [confirming])

  const lessonsTouched = Object.keys(progress.lessons).length
  const answered = Object.keys(progress.quiz).length

  return (
    <div className="stack" style={{ maxWidth: 720 }}>
      <h1>{tx('Ayarlar', 'Settings')}</h1>
      <div className="card card-pad stack">
        <h2>{tx('Görünüm ve oynatma', 'Appearance and playback')}</h2>
        <label className="field">
          {tx('Dil', 'Language')}
          <select className="input" value={progress.prefs.lang} onChange={(e) => dispatch({ type: 'prefs', prefs: { lang: e.target.value as Lang } })}>
            <option value="tr">Türkçe</option>
            <option value="en">English</option>
          </select>
        </label>
        <label className="field">
          {tx('Tema', 'Theme')}
          <select className="input" value={progress.prefs.theme} onChange={(e) => dispatch({ type: 'prefs', prefs: { theme: e.target.value as ThemePref } })}>
            <option value="system">{tx('Sistem ayarını izle', 'Follow system setting')}</option>
            <option value="light">{tx('Açık', 'Light')}</option>
            <option value="dark">{tx('Karanlık', 'Dark')}</option>
          </select>
        </label>
        <label className="field">
          {tx('Varsayılan oynatma hızı', 'Default playback speed')}
          <select className="input" value={progress.prefs.speed} onChange={(e) => dispatch({ type: 'prefs', prefs: { speed: Number(e.target.value) } })}>
            {SPEEDS.map((s) => (
              <option key={s} value={s}>
                {s} {tx('adım/saniye', 'steps/second')}
              </option>
            ))}
          </select>
        </label>
        <label className="row">
          <input type="checkbox" checked={progress.prefs.predict} onChange={(e) => dispatch({ type: 'prefs', prefs: { predict: e.target.checked } })} />
          {tx('Tahmin modu: önemli adımlardan önce ne olacağını sor', 'Prediction mode: ask what will happen before key steps')}
        </label>
        <p className="small muted" style={{ margin: 0 }}>
          {tx('Sistem “hareketi azalt” ayarı açıksa animasyonlar otomatik olarak kapatılır.', 'Animations are turned off automatically when the system “reduce motion” setting is on.')}
        </p>
      </div>
      <div className="card card-pad stack">
        <h2>{tx('Öğrenme ilerlemesi', 'Learning progress')}</h2>
        <p className="small" style={{ margin: 0 }}>
          {tx(
            `${lessonsTouched} derse girildi, ${answered} quiz sorusu denendi. Veriler yalnızca bu tarayıcıda (localStorage) saklanır; hesap ya da sunucu yoktur.`,
            `${lessonsTouched} lessons opened, ${answered} quiz questions attempted. Data is stored only in this browser (localStorage); there is no account or server.`,
          )}
        </p>
        <div>
          <button className="btn danger" onClick={() => setConfirming(true)}>
            <Trash2 size={15} aria-hidden /> {tx('İlerlemeyi sıfırla', 'Reset progress')}
          </button>
        </div>
        {done && (
          <p role="status" className="feedback ok" style={{ margin: 0 }}>
            {tx('İlerleme sıfırlandı.', 'Progress has been reset.')}
          </p>
        )}
      </div>
      {confirming && (
        <div className="modal-backdrop" onClick={() => setConfirming(false)}>
          <div className="card card-pad modal" role="alertdialog" aria-modal="true" aria-labelledby="reset-title" aria-describedby="reset-desc" onClick={(e) => e.stopPropagation()}>
            <h2 id="reset-title">{tx('İlerleme sıfırlansın mı?', 'Reset progress?')}</h2>
            <p id="reset-desc">
              {tx(
                'Tamamlanan dersler, quiz sonuçları ve son ziyaret edilen ders silinecek. Dil, tema ve oynatma tercihleri korunur. Bu işlem geri alınamaz.',
                'Completed lessons, quiz results and the last visited lesson will be deleted. Language, theme and playback preferences are kept. This cannot be undone.',
              )}
            </p>
            <div className="row" style={{ justifyContent: 'flex-end' }}>
              <button ref={cancelRef} className="btn" onClick={() => setConfirming(false)}>
                {tx('Vazgeç', 'Cancel')}
              </button>
              <button
                className="btn danger"
                onClick={() => {
                  dispatch({ type: 'reset' })
                  setConfirming(false)
                  setDone(true)
                }}
              >
                {tx('Evet, sıfırla', 'Yes, reset')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
