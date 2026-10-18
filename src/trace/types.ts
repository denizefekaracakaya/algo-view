/**
 * Execution-trace model shared by every visualizer.
 *
 * An algorithm engine produces an array of immutable snapshots. The player only
 * moves an index over that array, so "previous step" always shows exactly the
 * state the algorithm had at that moment — nothing is recomputed or undone.
 */

/** A "predict the next step" question attached to a step. It is asked before the step is revealed. */
export interface Prediction {
  question: string
  options: string[]
  answer: number
  /** Why the correct option is correct (shown after answering). */
  why: string
}

export interface TraceStep<S> {
  /** Full, self-contained snapshot of the algorithm state at this step. Never mutated after creation. */
  state: S
  /** 1-based line of the pseudocode currently executing (if any). */
  line?: number
  /** Short Turkish explanation of what happened in this step and why. */
  explain: string
  /** Optional phase label, e.g. "Bölme" / "Birleştirme". */
  phase?: string
  /** Algorithm-specific variables to display (i, j, pivot, k…). */
  vars?: Record<string, string | number>
  /** Cumulative operation counters (comparisons, moves…). */
  counters?: Record<string, number>
  predict?: Prediction
}

export type Trace<S> = TraceStep<S>[]

/** Deep-freezes a value in development so accidental mutation of snapshots fails loudly. */
export function freeze<T>(value: T): T {
  if (import.meta.env?.DEV && value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value)
    for (const v of Object.values(value as Record<string, unknown>)) freeze(v)
  }
  return value
}
