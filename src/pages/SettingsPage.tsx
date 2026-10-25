import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { Download, HardDrive, Trash2, Upload } from 'lucide-react'
import { useProgress } from '../state/ProgressContext'
import { backupJson, parseBackup, type ProgressData, type ThemePref } from '../state/progress'
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
      <BackupCard />
      {confirming && (
        <div className="modal-backdrop" onClick={() => setConfirming(false)}>
          <div className="card card-pad modal" role="alertdialog" aria-modal="true" aria-labelledby="reset-title" aria-describedby="reset-desc" onClick={(e) => e.stopPropagation()}>
            <h2 id="reset-title">{tx('İlerleme sıfırlansın mı?', 'Reset progress?')}</h2>
            <p id="reset-desc">
              {tx(
                'Tamamlanan dersler, quiz sonuçları, alıştırma istatistikleri, sınav geçmişi, kod alıştırmaları ve son ziyaret edilen ders silinecek. Kişisel notlarınız ile dil, tema ve oynatma tercihleri korunur. Bu işlem geri alınamaz.',
                'Completed lessons, quiz results, practice statistics, exam history, coding exercises and the last visited lesson will be deleted. Your personal notes and language, theme and playback preferences are kept. This cannot be undone.',
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

const summary = (p: ProgressData) => ({
  lessons: Object.values(p.lessons).filter((l) => l.status === 'completed').length,
  quiz: Object.keys(p.quiz).length,
  notes: Object.keys(p.notes).length,
  code: Object.values(p.code).filter((c) => c.solved).length,
  exams: p.exams.length,
})

function SummaryText({ p }: { p: ProgressData }) {
  const s = summary(p)
  return (
    <>
      {tx(
        `${s.lessons} tamamlanan ders · ${s.quiz} quiz sorusu · ${s.notes} not · ${s.code} çözülen kod alıştırması · ${s.exams} sınav`,
        `${s.lessons} completed lessons · ${s.quiz} quiz questions · ${s.notes} notes · ${s.code} solved coding exercises · ${s.exams} exams`,
      )}
    </>
  )
}

/** Export / import of all progress as a JSON file, plus the browser's persistent-storage request. */
function BackupCard() {
  const { progress, dispatch, saved } = useProgress()
  const [pending, setPending] = useState<ProgressData | null>(null)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [persisted, setPersisted] = useState<boolean | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const storage = typeof navigator !== 'undefined' ? navigator.storage : undefined
  const canPersist = !!storage?.persist && !!storage.persisted

  useEffect(() => {
    if (!canPersist) return
    storage!.persisted().then(setPersisted, () => setPersisted(null))
  }, [canPersist, storage])

  const download = () => {
    const url = URL.createObjectURL(new Blob([backupJson(progress)], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `algo-view-${tx('yedek', 'backup')}-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setMsg({ ok: true, text: tx('Yedek dosyası indirildi.', 'Backup file downloaded.') })
  }

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const data = parseBackup(await file.text())
    setPending(data)
    setMsg(data ? null : { ok: false, text: tx('Bu dosya geçerli bir Algo View yedeği değil.', 'This file is not a valid Algo View backup.') })
  }

  const requestPersist = async () => {
    try {
      setPersisted(await storage!.persist())
    } catch {
      setPersisted(false)
    }
  }

  return (
    <div className="card card-pad stack">
      <h2>{tx('Çalışmalarını kaydet', 'Save your work')}</h2>
      <p className={'small ' + (saved ? '' : 'feedback no')} style={{ margin: 0 }} role={saved ? undefined : 'alert'}>
        {saved
          ? tx(
              'İlerlemen, notların, kodların ve sınav geçmişin her değişiklikte otomatik olarak bu tarayıcıya kaydedilir. Başka bir tarayıcıya ya da bilgisayara taşımak veya tarayıcı verilerini temizlemeden önce saklamak için yedek dosyası indir.',
              'Your progress, notes, code and exam history are saved to this browser automatically on every change. Download a backup file to move them to another browser or computer, or to keep them before clearing browser data.',
            )
          : tx(
              'Tarayıcı kaydetmeye izin vermiyor (gizli pencere ya da dolu depolama). Çalışmaların yalnızca bu sekme açıkken durur; kaybetmemek için yedek indir.',
              'The browser does not allow saving (private window or full storage). Your work only lasts while this tab is open; download a backup so you do not lose it.',
            )}
      </p>
      <p className="small muted" style={{ margin: 0 }}>
        <SummaryText p={progress} />
      </p>
      <div className="row">
        <button className="btn primary" onClick={download}>
          <Download size={15} aria-hidden /> {tx('Yedeği indir (.json)', 'Download backup (.json)')}
        </button>
        <button className="btn" onClick={() => fileRef.current?.click()}>
          <Upload size={15} aria-hidden /> {tx('Yedekten geri yükle', 'Restore from backup')}
        </button>
        <input ref={fileRef} type="file" accept=".json,application/json" hidden onChange={(e) => void onFile(e)} aria-label={tx('Yedek dosyası seç', 'Choose backup file')} />
      </div>
      {pending && (
        <div className="feedback hint stack" role="status">
          <span>
            <strong>{tx('Dosyadaki yedek:', 'Backup in the file:')}</strong> <SummaryText p={pending} />
          </span>
          <span className="small">{tx('Geri yüklemek bu tarayıcıdaki mevcut ilerlemenin yerine geçer.', 'Restoring replaces the progress currently in this browser.')}</span>
          <div className="row">
            <button
              className="btn primary sm"
              onClick={() => {
                dispatch({ type: 'replace', data: pending })
                setPending(null)
                setMsg({ ok: true, text: tx('Yedek geri yüklendi.', 'Backup restored.') })
              }}
            >
              {tx('Geri yükle', 'Restore')}
            </button>
            <button className="btn sm" onClick={() => setPending(null)}>
              {tx('Vazgeç', 'Cancel')}
            </button>
          </div>
        </div>
      )}
      {msg && (
        <p role="status" className={'feedback ' + (msg.ok ? 'ok' : 'no')} style={{ margin: 0 }}>
          {msg.text}
        </p>
      )}
      {canPersist && (
        <div className="row small">
          <HardDrive size={15} aria-hidden />
          {persisted ? (
            <span>{tx('Kalıcı depolama açık: tarayıcı yer açmak için verilerini kendiliğinden silmez.', 'Persistent storage is on: the browser will not delete your data on its own to free up space.')}</span>
          ) : (
            <>
              <span className="grow">{tx('Tarayıcı, disk dolduğunda site verilerini silebilir.', 'The browser may delete site data when the disk fills up.')}</span>
              <button className="btn sm" onClick={() => void requestPersist()}>
                {tx('Kalıcı depolama iste', 'Request persistent storage')}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
