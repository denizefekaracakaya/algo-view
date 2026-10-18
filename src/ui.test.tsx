import { describe, expect, it, vi } from 'vitest'
import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { playerReducer } from './trace/player'
import { emptyProgress, loadProgress, progressReducer, saveProgress, STORAGE_KEY } from './state/progress'
import { ProgressProvider } from './state/ProgressContext'
import { TraceViewer } from './components/TraceViewer'
import { Quiz } from './components/Quiz'
import { ArrayInput } from './components/ArrayInput'
import { insertionSortTrace } from './engines/insertionSort'
import { LessonPage } from './pages/LessonPage'
import { Dashboard } from './pages/Dashboard'
import { PracticePage } from './pages/PracticePage'
import { drillInput, insertionDrill } from './practice/drills'
import type { Question } from './content/types'
import App from './App'
import { setCurrentLang } from './i18n/lang'

describe('player reducer', () => {
  const s0 = { index: 0, length: 5, playing: false }
  it('next/prev stay in bounds', () => {
    let s = playerReducer(s0, { type: 'prev' })
    expect(s.index).toBe(0)
    for (let i = 0; i < 10; i++) s = playerReducer(s, { type: 'next' })
    expect(s.index).toBe(4)
    s = playerReducer(s, { type: 'prev' })
    expect(s.index).toBe(3)
  })
  it('play stops at the end; play at the end restarts', () => {
    let s = playerReducer({ ...s0, index: 3 }, { type: 'play' })
    expect(s.playing).toBe(true)
    s = playerReducer(s, { type: 'next' })
    expect(s).toEqual({ index: 4, length: 5, playing: false })
    s = playerReducer(s, { type: 'play' })
    expect(s.index).toBe(0)
  })
  it('goto clamps and reset returns to 0', () => {
    expect(playerReducer(s0, { type: 'goto', index: 99 }).index).toBe(4)
    expect(playerReducer({ ...s0, index: 3 }, { type: 'reset' }).index).toBe(0)
    expect(playerReducer(s0, { type: 'load', length: 9 })).toEqual({ index: 0, length: 9, playing: false })
  })
})

describe('progress persistence', () => {
  it('reducer tracks visits, completion, quiz and reset (keeping prefs)', () => {
    let p = emptyProgress()
    p = progressReducer(p, { type: 'visit', lessonId: 'a', now: 1 })
    expect(p.lessons.a.status).toBe('in-progress')
    expect(p.lastLesson).toBe('a')
    p = progressReducer(p, { type: 'complete', lessonId: 'a', now: 2 })
    p = progressReducer(p, { type: 'visit', lessonId: 'a', now: 3 })
    expect(p.lessons.a.status).toBe('completed')
    p = progressReducer(p, { type: 'quiz', key: 'a:q1', correct: false })
    p = progressReducer(p, { type: 'quiz', key: 'a:q1', correct: true })
    p = progressReducer(p, { type: 'quiz', key: 'a:q1', correct: false })
    expect(p.quiz['a:q1']).toEqual({ correct: true, attempts: 3 })
    p = progressReducer(p, { type: 'prefs', prefs: { theme: 'dark' } })
    p = progressReducer(p, { type: 'reset' })
    expect(p.lessons).toEqual({})
    expect(p.prefs.theme).toBe('dark')
  })
  it('save/load round-trips and survives corrupt storage', () => {
    const p = progressReducer(emptyProgress(), { type: 'complete', lessonId: 'x', now: 5 })
    saveProgress(p)
    expect(loadProgress()).toEqual(p)
    localStorage.setItem(STORAGE_KEY, '{not json')
    expect(loadProgress()).toEqual(emptyProgress())
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 99 }))
    expect(loadProgress()).toEqual(emptyProgress())
  })
})

const wrap = (ui: React.ReactNode) => render(<ProgressProvider>{ui}</ProgressProvider>)

describe('TraceViewer', () => {
  const trace = insertionSortTrace([3, 1, 2])
  const viewer = () =>
    wrap(<TraceViewer trace={trace} label="test viz" render={(s) => <div data-testid="state">{s.state.a.join(',')}</div>} />)

  it('next / previous / reset change the displayed snapshot consistently', async () => {
    const user = userEvent.setup()
    viewer()
    const count = () => screen.getByText(/\/ \d+$/).textContent
    expect(count()).toBe(`1 / ${trace.length}`)
    const states: string[] = []
    for (let i = 0; i < 6; i++) {
      states.push(screen.getByTestId('state').textContent!)
      await user.click(screen.getByRole('button', { name: 'Sonraki adım' }))
    }
    expect(count()).toBe(`7 / ${trace.length}`)
    for (let i = 5; i >= 0; i--) {
      await user.click(screen.getByRole('button', { name: 'Önceki adım' }))
      expect(screen.getByTestId('state').textContent).toBe(states[i])
      expect(screen.getByText(trace[i].explain)).toBeInTheDocument()
    }
    await user.click(screen.getByRole('button', { name: 'Sona git' }))
    expect(screen.getByTestId('state').textContent).toBe('1,2,3')
    expect(screen.getByRole('button', { name: 'Sonraki adım' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Başa sar' }))
    expect(count()).toBe(`1 / ${trace.length}`)
  })

  it('keyboard arrows step the trace', async () => {
    const user = userEvent.setup()
    viewer()
    const region = screen.getByRole('region', { name: 'test viz' })
    region.querySelector('button')!.focus()
    await user.keyboard('{ArrowRight}{ArrowRight}')
    expect(screen.getByText(/^3 \//)).toBeInTheDocument()
    await user.keyboard('{ArrowLeft}')
    expect(screen.getByText(/^2 \//)).toBeInTheDocument()
  })

  it('play advances automatically and pause stops', async () => {
    const user = userEvent.setup()
    viewer()
    await user.selectOptions(screen.getByLabelText('Oynatma hızı'), '8')
    await user.click(screen.getByRole('button', { name: 'Oynat' }))
    await act(() => new Promise((r) => setTimeout(r, 450)))
    await user.click(screen.getByRole('button', { name: 'Duraklat' }))
    const n = Number(screen.getByText(/\/ \d+$/).textContent!.split(' / ')[0])
    expect(n).toBeGreaterThan(1)
    await act(() => new Promise((r) => setTimeout(r, 300)))
    expect(Number(screen.getByText(/\/ \d+$/).textContent!.split(' / ')[0])).toBe(n)
  })

  it('prediction mode asks before revealing a step and gives feedback', async () => {
    const user = userEvent.setup()
    viewer()
    await user.click(screen.getByRole('button', { name: /Tahmin modu/ }))
    await user.click(screen.getByRole('button', { name: 'Sonraki adım' }))
    const group = screen.getByRole('group', { name: 'Tahmin sorusu' })
    const p = trace[1].predict!
    expect(within(group).getByText(p.question)).toBeInTheDocument()
    expect(screen.getByText(/^1 \//)).toBeInTheDocument() // not advanced yet
    await user.click(within(group).getByRole('button', { name: p.options[p.answer] }))
    expect(within(group).getByRole('status')).toHaveTextContent('Doğru')
    await user.click(within(group).getByRole('button', { name: /Adımı göster/ }))
    expect(screen.getByText(/^2 \//)).toBeInTheDocument()
  })
})

describe('Quiz', () => {
  const qs: Question[] = [
    { id: 'm', kind: 'mcq', prompt: 'İki artı iki?', options: ['3', '4'], answer: 1, hint: 'Parmaklarınızı sayın.', explanation: 'Dört eder.' },
    { id: 'n', kind: 'numeric', prompt: 'Sayı?', answer: 7, hint: 'Yedi gibi bir şey.', explanation: 'Yedi.' },
    { id: 'o', kind: 'order', prompt: 'Sırala', items: ['A', 'B', 'C'], hint: 'Alfabe.', explanation: 'ABC.' },
  ]
  it('gives correct/incorrect feedback, hints and records progress', async () => {
    const user = userEvent.setup()
    wrap(<Quiz lessonId="t" questions={qs} />)
    const [mcq, num, ord] = screen.getAllByRole('article')
    await user.click(within(mcq).getByLabelText('3'))
    await user.click(within(mcq).getByRole('button', { name: 'Kontrol et' }))
    expect(within(mcq).getByRole('status')).toHaveTextContent('Yanlış')
    await user.click(within(mcq).getByRole('button', { name: /İpucu/ }))
    expect(within(mcq).getByText('Parmaklarınızı sayın.')).toBeInTheDocument()
    await user.click(within(mcq).getByLabelText('4'))
    await user.click(within(mcq).getByRole('button', { name: 'Kontrol et' }))
    expect(within(mcq).getByRole('status')).toHaveTextContent('Doğru')
    expect(screen.getByText('1 / 3 soru doğru cevaplandı.')).toBeInTheDocument()

    await user.click(within(num).getByRole('button', { name: 'Kontrol et' }))
    expect(within(num).getByText('Lütfen bir sayı girin.')).toBeInTheDocument()
    await user.type(within(num).getByLabelText('Cevabınız'), '7')
    await user.click(within(num).getByRole('button', { name: 'Kontrol et' }))
    expect(within(num).getByRole('status')).toHaveTextContent('Doğru')

    // order: move items until correct
    const items = () => within(ord).getAllByRole('listitem').map((li) => li.textContent!.replace(/^\d+\./, '').trim()[0])
    expect(items().join('')).not.toBe('ABC')
    for (let guard = 0; guard < 10 && items().join('') !== 'ABC'; guard++) {
      const cur = items()
      const i = cur.findIndex((x, k) => x !== 'ABC'[k])
      const j = cur.indexOf('ABC'[i])
      await user.click(within(ord).getByRole('button', { name: `"${cur[j]}" yukarı taşı` }))
    }
    await user.click(within(ord).getByRole('button', { name: 'Sıralamayı kontrol et' }))
    expect(within(ord).getByRole('status')).toHaveTextContent('Doğru')
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).quiz['t:o'].correct).toBe(true)
  })
})

describe('ArrayInput validation', () => {
  it('shows an error for invalid tokens and too-long input, applies valid input', async () => {
    const user = userEvent.setup()
    let applied: number[] = []
    render(<ArrayInput value={[1, 2]} onChange={(v) => (applied = v)} presets={[{ label: 'P', values: [9, 8] }]} options={{ maxLength: 3 }} random={() => [5]} />)
    const input = screen.getByLabelText('Girdi dizisi')
    await user.clear(input)
    await user.type(input, '1, a')
    await user.click(screen.getByRole('button', { name: 'Uygula' }))
    expect(screen.getByRole('alert')).toHaveTextContent('"a" geçerli bir sayı değil')
    await user.clear(input)
    await user.type(input, '1 2 3 4')
    await user.click(screen.getByRole('button', { name: 'Uygula' }))
    expect(screen.getByRole('alert')).toHaveTextContent('en fazla 3')
    await user.clear(input)
    await user.type(input, '4;5')
    await user.click(screen.getByRole('button', { name: 'Uygula' }))
    expect(applied).toEqual([4, 5])
    await user.click(screen.getByRole('button', { name: 'P' }))
    expect(applied).toEqual([9, 8])
  })
})

describe('pages', () => {
  it('lesson page renders the correct lesson, marks it visited, completion persists', async () => {
    const user = userEvent.setup()
    wrap(
      <MemoryRouter initialEntries={['/ders/l3-master']}>
        <Routes>
          <Route path="/ders/:lessonId" element={<LessonPage />} />
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Özyineleme ağaçları ve Master Teoremi')
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).lastLesson).toBe('l3-master')
    await user.click(screen.getByRole('button', { name: /Dersi tamamlandı olarak işaretle/ }))
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).lessons['l3-master'].status).toBe('completed')
  })
  it('unknown lesson shows a not-found message', () => {
    wrap(
      <MemoryRouter initialEntries={['/ders/yok']}>
        <Routes>
          <Route path="/ders/:lessonId" element={<LessonPage />} />
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.getByText('Ders bulunamadı')).toBeInTheDocument()
  })
  it('dashboard shows completed state from storage', () => {
    saveProgress(progressReducer(emptyProgress(), { type: 'complete', lessonId: 'l1-why', now: 1 }))
    wrap(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    )
    expect(screen.getAllByLabelText('tamamlandı').length).toBe(1)
    expect(screen.getByRole('link', { name: /Kaldığın yerden devam et/ })).toHaveAttribute('href', '/ders/l1-karatsuba')
  })
})

describe('practice lab', () => {
  const renderPractice = (entry: string) =>
    wrap(
      <MemoryRouter initialEntries={[entry]}>
        <Routes>
          <Route path="/alistirma" element={<PracticePage />} />
        </Routes>
      </MemoryRouter>,
    )
  it('an InsertionSort drill can be traced by hand; mistakes give a hint and are counted', async () => {
    const user = userEvent.setup()
    const rnd = vi.spyOn(Math, 'random').mockReturnValue(0.5)
    renderPractice('/alistirma?ders=l2-insertion')
    const { steps } = insertionDrill(drillInput('insertion', 1 + Math.floor(0.5 * 1e6)))
    rnd.mockRestore()
    const wrong = steps[0].answer === 0 ? 1 : 0
    await user.click(screen.getByRole('button', { name: `İndeks ${wrong}` }))
    expect(screen.getByText('Olmadı.')).toBeInTheDocument()
    expect(screen.getByText('1 hata')).toBeInTheDocument()
    for (const st of steps) await user.click(screen.getByRole('button', { name: `İndeks ${st.answer}` }))
    expect(screen.getByRole('status')).toHaveTextContent(`Tamamlandı: ${steps.length} adımda 1 hata.`)
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).drills.insertion).toEqual({ runs: 1, perfect: 0 })
  })
  it('the question generator shows a question and draws a new one on demand', async () => {
    const user = userEvent.setup()
    renderPractice('/alistirma?mod=soru&ders=l3-master')
    expect(screen.getByRole('checkbox', { name: /Master teoremi/ })).toBeChecked()
    expect(screen.getByText(/^S1\./)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Yeni soru/ }))
    expect(screen.getByText(/^S2\./)).toBeInTheDocument()
  })
})

describe('language and theme switches', () => {
  it('switches the whole UI and lesson content to English and back, and persists the choice', async () => {
    const user = userEvent.setup()
    window.location.hash = '#/ders/l3-master'
    render(<App />)
    expect(await screen.findByRole('heading', { level: 1, name: /Özyineleme ağaçları ve Master Teoremi/ })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'EN' }))
    expect(await screen.findByRole('heading', { level: 1, name: /Recursion trees and the Master Theorem/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Settings' })).toBeInTheDocument()
    expect(document.documentElement.lang).toBe('en')
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).prefs.lang).toBe('en')
    await user.click(screen.getByRole('button', { name: 'TR' }))
    expect(await screen.findByRole('link', { name: 'Ayarlar' })).toBeInTheDocument()
    setCurrentLang('tr')
    window.location.hash = ''
  })
  it('theme button toggles between light and dark', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Karanlık moda geç' }))
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    await user.click(screen.getByRole('button', { name: 'Açık moda geç' }))
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })
})
