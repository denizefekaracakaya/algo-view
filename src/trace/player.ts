import { useCallback, useEffect, useReducer, useRef } from 'react'

/** Pure state machine for stepping through a trace. Snapshots are immutable, so moving the index is enough. */
export interface PlayerState {
  index: number
  length: number
  playing: boolean
}

export type PlayerAction =
  | { type: 'next' }
  | { type: 'prev' }
  | { type: 'reset' }
  | { type: 'end' }
  | { type: 'goto'; index: number }
  | { type: 'play' }
  | { type: 'pause' }
  | { type: 'load'; length: number }

export function playerReducer(s: PlayerState, a: PlayerAction): PlayerState {
  const last = Math.max(0, s.length - 1)
  switch (a.type) {
    case 'next':
      if (s.index >= last) return { ...s, playing: false }
      return { ...s, index: s.index + 1, playing: s.playing && s.index + 1 < last }
    case 'prev':
      return { ...s, index: Math.max(0, s.index - 1), playing: false }
    case 'reset':
      return { ...s, index: 0, playing: false }
    case 'end':
      return { ...s, index: last, playing: false }
    case 'goto':
      return { ...s, index: Math.min(last, Math.max(0, Math.round(a.index))), playing: false }
    case 'play':
      if (s.length <= 1) return s
      return { ...s, playing: true, index: s.index >= last ? 0 : s.index }
    case 'pause':
      return { ...s, playing: false }
    case 'load':
      return { index: 0, length: a.length, playing: false }
  }
}

/** Steps per second for each speed setting. */
export const SPEEDS = [0.5, 1, 2, 4, 8] as const

/**
 * React binding of the player. `beforeAdvance` lets the host intercept automatic steps
 * (e.g. to pause for a prediction question); returning false blocks the step.
 */
export function useTracePlayer(length: number, speed: number, beforeAdvance?: (nextIndex: number) => boolean) {
  const [state, dispatch] = useReducer(playerReducer, { index: 0, length, playing: false })
  const guard = useRef(beforeAdvance)
  useEffect(() => {
    guard.current = beforeAdvance
  })

  useEffect(() => {
    dispatch({ type: 'load', length })
  }, [length])

  useEffect(() => {
    if (!state.playing) return
    const id = window.setTimeout(() => {
      if (guard.current && !guard.current(state.index + 1)) {
        dispatch({ type: 'pause' })
        return
      }
      dispatch({ type: 'next' })
    }, 1000 / speed)
    return () => window.clearTimeout(id)
  }, [state.playing, state.index, speed])

  const next = useCallback(() => dispatch({ type: 'next' }), [])
  const prev = useCallback(() => dispatch({ type: 'prev' }), [])
  const reset = useCallback(() => dispatch({ type: 'reset' }), [])
  const end = useCallback(() => dispatch({ type: 'end' }), [])
  const play = useCallback(() => dispatch({ type: 'play' }), [])
  const pause = useCallback(() => dispatch({ type: 'pause' }), [])
  const goto = useCallback((index: number) => dispatch({ type: 'goto', index }), [])
  return { ...state, index: Math.min(state.index, Math.max(0, length - 1)), next, prev, reset, end, play, pause, goto }
}
