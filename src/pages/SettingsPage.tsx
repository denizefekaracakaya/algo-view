import { useEffect, useRef, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useProgress } from '../state/ProgressContext'
import type { ThemePref } from '../state/progress'
import { SPEEDS } from '../trace/player'

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
      <h1>Ayarlar</h1>
      <div className="card card-pad stack">
        <h2>Görünüm ve oynatma</h2>
        <label className="field">
          Tema
          <select className="input" value={progress.prefs.theme} onChange={(e) => dispatch({ type: 'prefs', prefs: { theme: e.target.value as ThemePref } })}>
            <option value="system">Sistem ayarını izle</option>
            <option value="light">Açık</option>
            <option value="dark">Koyu</option>
          </select>
        </label>
        <label className="field">
          Varsayılan oynatma hızı
          <select className="input" value={progress.prefs.speed} onChange={(e) => dispatch({ type: 'prefs', prefs: { speed: Number(e.target.value) } })}>
            {SPEEDS.map((s) => (
              <option key={s} value={s}>
                {s} adım/saniye
              </option>
            ))}
          </select>
        </label>
        <label className="row">
          <input type="checkbox" checked={progress.prefs.predict} onChange={(e) => dispatch({ type: 'prefs', prefs: { predict: e.target.checked } })} />
          Tahmin modu: önemli adımlardan önce ne olacağını sor
        </label>
        <p className="small muted" style={{ margin: 0 }}>
          Sistem “hareketi azalt” ayarı açıksa animasyonlar otomatik olarak kapatılır.
        </p>
      </div>
      <div className="card card-pad stack">
        <h2>Öğrenme ilerlemesi</h2>
        <p className="small" style={{ margin: 0 }}>
          {lessonsTouched} derse girildi, {answered} quiz sorusu denendi. Veriler yalnızca bu tarayıcıda (localStorage) saklanır; hesap ya da sunucu yoktur.
        </p>
        <div>
          <button className="btn danger" onClick={() => setConfirming(true)}>
            <Trash2 size={15} aria-hidden /> İlerlemeyi sıfırla
          </button>
        </div>
        {done && (
          <p role="status" className="feedback ok" style={{ margin: 0 }}>
            İlerleme sıfırlandı.
          </p>
        )}
      </div>
      {confirming && (
        <div className="modal-backdrop" onClick={() => setConfirming(false)}>
          <div className="card card-pad modal" role="alertdialog" aria-modal="true" aria-labelledby="reset-title" aria-describedby="reset-desc" onClick={(e) => e.stopPropagation()}>
            <h2 id="reset-title">İlerleme sıfırlansın mı?</h2>
            <p id="reset-desc">Tamamlanan dersler, quiz sonuçları ve son ziyaret edilen ders silinecek. Tema ve oynatma tercihleri korunur. Bu işlem geri alınamaz.</p>
            <div className="row" style={{ justifyContent: 'flex-end' }}>
              <button ref={cancelRef} className="btn" onClick={() => setConfirming(false)}>
                Vazgeç
              </button>
              <button
                className="btn danger"
                onClick={() => {
                  dispatch({ type: 'reset' })
                  setConfirming(false)
                  setDone(true)
                }}
              >
                Evet, sıfırla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
