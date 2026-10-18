import { createContext, useContext, useEffect, useMemo, useReducer, type Dispatch, type ReactNode } from 'react'
import { loadProgress, progressReducer, saveProgress, type ProgressAction, type ProgressData } from './progress'

interface Ctx {
  progress: ProgressData
  dispatch: Dispatch<ProgressAction>
}

const ProgressCtx = createContext<Ctx | null>(null)

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, dispatch] = useReducer(progressReducer, undefined, loadProgress)
  useEffect(() => saveProgress(progress), [progress])
  useEffect(() => {
    const root = document.documentElement
    if (progress.prefs.theme === 'system') root.removeAttribute('data-theme')
    else root.setAttribute('data-theme', progress.prefs.theme)
  }, [progress.prefs.theme])
  const value = useMemo(() => ({ progress, dispatch }), [progress])
  return <ProgressCtx.Provider value={value}>{children}</ProgressCtx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useProgress(): Ctx {
  const c = useContext(ProgressCtx)
  if (!c) throw new Error('useProgress must be used inside ProgressProvider')
  return c
}
