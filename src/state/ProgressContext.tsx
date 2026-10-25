import { createContext, useContext, useEffect, useMemo, useReducer, useSyncExternalStore, type Dispatch, type ReactNode } from 'react'
import { setCurrentLang } from '../i18n/lang'
import { loadProgress, progressReducer, saveProgress, STORAGE_KEY, type ProgressAction, type ProgressData } from './progress'

interface Ctx {
  progress: ProgressData
  dispatch: Dispatch<ProgressAction>
  /** False when the last write to localStorage failed (private mode, quota): work then lives only in this tab. */
  saved: boolean
}

const ProgressCtx = createContext<Ctx | null>(null)

// Whether the last localStorage write succeeded, kept outside React and read with useSyncExternalStore.
let lastSaveOk = true
const saveListeners = new Set<() => void>()
const subscribeSave = (l: () => void) => {
  saveListeners.add(l)
  return () => void saveListeners.delete(l)
}
function persist(p: ProgressData) {
  const ok = saveProgress(p)
  if (ok === lastSaveOk) return
  lastSaveOk = ok
  saveListeners.forEach((l) => l())
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, dispatch] = useReducer(progressReducer, undefined, loadProgress)
  const saved = useSyncExternalStore(subscribeSave, () => lastSaveOk, () => true)
  // Set synchronously so children rendered in this pass already read the right language.
  setCurrentLang(progress.prefs.lang)
  useEffect(() => persist(progress), [progress])
  // Another tab saved: adopt its data so two open tabs do not overwrite each other's work.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) dispatch({ type: 'replace', data: loadProgress() })
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])
  useEffect(() => {
    document.documentElement.lang = progress.prefs.lang
  }, [progress.prefs.lang])
  useEffect(() => {
    const root = document.documentElement
    if (progress.prefs.theme === 'system') root.removeAttribute('data-theme')
    else root.setAttribute('data-theme', progress.prefs.theme)
  }, [progress.prefs.theme])
  const value = useMemo(() => ({ progress, dispatch, saved }), [progress, saved])
  return <ProgressCtx.Provider value={value}>{children}</ProgressCtx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useProgress(): Ctx {
  const c = useContext(ProgressCtx)
  if (!c) throw new Error('useProgress must be used inside ProgressProvider')
  return c
}
