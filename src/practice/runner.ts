import { HARNESS_SRC, type CheckMode, type RunOutcome, type TestCase } from './coding'

export const RUN_TIMEOUT_MS = 5000

type Harness = (code: string, fnName: string, tests: TestCase[], mode: CheckMode) => RunOutcome

/** Same harness on the main thread: only used where Worker does not exist (unit tests). */
export const harnessInline = (): Harness => new Function(HARNESS_SRC + '\nreturn harness')() as Harness

/**
 * Runs the learner's code in a throwaway Web Worker; if it does not answer within the time
 * limit (an infinite loop, or a far too slow algorithm) the worker is terminated.
 */
export function runCode(code: string, fnName: string, tests: TestCase[], mode: CheckMode, timeoutMs = RUN_TIMEOUT_MS): Promise<RunOutcome> {
  if (typeof Worker === 'undefined') return Promise.resolve(harnessInline()(code, fnName, tests, mode))
  const src = HARNESS_SRC + '\nself.onmessage = function (e) { var d = e.data; self.postMessage(harness(d.code, d.fnName, d.tests, d.mode)) }'
  const url = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }))
  const worker = new Worker(url)
  return new Promise<RunOutcome>((resolve) => {
    const done = (r: RunOutcome) => {
      clearTimeout(timer)
      worker.terminate()
      URL.revokeObjectURL(url)
      resolve(r)
    }
    const timer = setTimeout(() => done({ error: 'timeout', results: [], logs: [] }), timeoutMs)
    worker.onmessage = (e: MessageEvent<RunOutcome>) => done(e.data)
    worker.onerror = (e) => {
      e.preventDefault()
      done({ error: 'syntax', message: e.message, results: [], logs: [] })
    }
    worker.postMessage({ code, fnName, tests, mode })
  })
}
