import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { ProgressProvider } from '../state/ProgressContext'
import { emptyProgress, progressReducer, saveProgress } from '../state/progress'
import { LECTURES_BY_LANG } from '../content/curriculum'
import { WrapUpPage } from './WrapUpPage'
import { TOOLBOX_LESSONS } from '../content/wrapup'

const page = () =>
  render(
    <ProgressProvider>
      <MemoryRouter>
        <WrapUpPage />
      </MemoryRouter>
    </ProgressProvider>,
  )

describe('Lecture 18 wrap-up page', () => {
  it('the toolbox links every lesson, and only lessons that exist', () => {
    const ids = LECTURES_BY_LANG.tr.flatMap((l) => l.lessons.map((x) => x.id))
    const used = TOOLBOX_LESSONS.flat()
    expect(new Set(used)).toEqual(new Set(ids))
    for (const group of TOOLBOX_LESSONS) expect(new Set(group).size).toBe(group.length)
  })

  it('the linear program of the slides: optimum 5/7 at (3/7, 2/7), dual certificate 1/7, 3/7; 4x + y peaks at 2', () => {
    const feasible = ([x, y]: number[]) => x >= -1e-12 && y >= -1e-12 && 4 * x + y <= 2 + 1e-12 && x + 2 * y <= 1 + 1e-12
    const corners = [[0, 0], [0.5, 0], [3 / 7, 2 / 7], [0, 0.5]]
    expect(corners.every(feasible)).toBe(true)
    expect(Math.max(...corners.map(([x, y]) => x + y))).toBeCloseTo(5 / 7)
    // A fine grid never beats the corner.
    let best = 0
    for (let i = 0; i <= 500; i++) for (let j = 0; j <= 500; j++) if (feasible([i / 1000, j / 1000])) best = Math.max(best, i / 1000 + j / 1000)
    expect(best).toBeLessThanOrEqual(5 / 7 + 1e-9)
    const [u, v] = [1 / 7, 3 / 7]
    expect(4 * u + v).toBeCloseTo(1)
    expect(u + 2 * v).toBeCloseTo(1)
    expect(2 * u + v).toBeCloseTo(5 / 7)
    expect(corners.map(([x, y]) => 4 * x + y)).toEqual([0, 2, expect.closeTo(2), 0.5])
  })

  it('the interpolation question: f(1) = 5, f(3) = 9 gives f(x) = 3 + 2x', () => {
    const a1 = (9 - 5) / (3 - 1)
    expect([5 - a1, a1]).toEqual([3, 2])
  })

  it('renders the toolbox, the gems and the open lessons; checks give feedback', async () => {
    saveProgress(progressReducer(emptyProgress(), { type: 'complete', lessonId: 'l1-why', now: 1 }))
    const user = userEvent.setup()
    page()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Sırada ne var?')
    expect(screen.getByText('30 dersin 1 tanesini tamamladın.')).toBeInTheDocument()
    expect(screen.getByText('Henüz tamamlanmamış 29 ders')).toBeInTheDocument()
    expect(screen.getByText('Doğrusal programlama ve dualite')).toBeInTheDocument()
    expect(screen.getByText(/^Uygun bölge/)).toBeInTheDocument()
    expect(screen.getAllByText('Doğru mu, hızlı mı? Analiz araçları')).toHaveLength(1)
    const q = document.querySelector<HTMLElement>('[aria-labelledby="q-l18-wrapup:check:w2"]')!
    await user.type(within(q).getByLabelText('Cevabınız'), '2')
    await user.click(within(q).getByRole('button', { name: 'Kontrol et' }))
    expect(within(q).getByRole('status')).toHaveTextContent('Doğru')
  })
})
