import { useState } from 'react'
import { useProgress } from '../state/ProgressContext'
import { tx } from '../i18n/lang'
import type { DrillId, DrillStepBase } from './drills'

export interface Feedback {
  ok: boolean
  text: string
}

/** Step machine shared by all drills: a wrong choice costs a mistake and shows a hint; a right one advances. */
export function useDrill<S extends DrillStepBase>(steps: S[], id: DrillId) {
  const { dispatch } = useProgress()
  const [idx, setIdx] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [fb, setFb] = useState<Feedback | null>(null)
  const step = idx < steps.length ? steps[idx] : null
  const advance = (m: number) => {
    const next = idx + 1
    setIdx(next)
    if (next === steps.length) dispatch({ type: 'drill', id, mistakes: m })
  }
  const choose = (v: number) => {
    if (!step) return
    if (v === step.answer) {
      setFb({ ok: true, text: step.why })
      advance(mistakes)
    } else {
      setMistakes(mistakes + 1)
      setFb({ ok: false, text: step.hint })
    }
  }
  const reveal = () => {
    if (!step) return
    setMistakes(mistakes + 1)
    setFb({ ok: true, text: tx('Gösterildi (hata sayıldı): ', 'Shown (counted as a mistake): ') + step.why })
    advance(mistakes + 1)
  }
  return { idx, step, total: steps.length, done: !step, mistakes, fb, choose, reveal }
}

export type Drill = ReturnType<typeof useDrill>

export interface DrillProps {
  seed: number
  onNew: () => void
  onRestart: () => void
}
