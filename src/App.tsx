import { HashRouter, NavLink, Link, Route, Routes, useLocation } from 'react-router-dom'
import { Suspense, lazy, useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { ProgressProvider, useProgress } from './state/ProgressContext'
import { Dashboard } from './pages/Dashboard'
import { SourcesPage } from './pages/SourcesPage'
import { SettingsPage } from './pages/SettingsPage'
import { LANGS, tx } from './i18n/lang'

// Lesson pages carry the visualizers, KaTeX-heavy content and engines: load them on demand.
const LessonPage = lazy(() => import('./pages/LessonPage').then((m) => ({ default: m.LessonPage })))

export function Logo() {
  return (
    <svg className="brand-mark" viewBox="0 0 32 32" aria-hidden>
      <rect width="32" height="32" rx="8" fill="var(--accent)" />
      <rect x="6" y="18" width="4" height="8" rx="1" fill="var(--on-accent)" />
      <rect x="12" y="13" width="4" height="13" rx="1" fill="var(--on-accent)" />
      <rect x="18" y="9" width="4" height="17" rx="1" fill="var(--on-accent)" opacity="0.7" />
      <rect x="24" y="5" width="4" height="21" rx="1" fill="var(--on-accent)" />
    </svg>
  )
}

const darkQuery = () => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null)

/** The theme actually shown: an explicit choice, or the system setting when the preference is 'system'. */
function useEffectiveDark(): boolean {
  const { progress } = useProgress()
  const [systemDark, setSystemDark] = useState(() => darkQuery()?.matches ?? false)
  useEffect(() => {
    const q = darkQuery()
    if (!q) return
    const on = (e: MediaQueryListEvent) => setSystemDark(e.matches)
    q.addEventListener?.('change', on)
    return () => q.removeEventListener?.('change', on)
  }, [])
  const t = progress.prefs.theme
  return t === 'dark' || (t === 'system' && systemDark)
}

function ThemeToggle() {
  const { dispatch } = useProgress()
  const dark = useEffectiveDark()
  const label = dark ? tx('Açık moda geç', 'Switch to light mode') : tx('Karanlık moda geç', 'Switch to dark mode')
  return (
    <button className="btn icon ghost" onClick={() => dispatch({ type: 'prefs', prefs: { theme: dark ? 'light' : 'dark' } })} aria-label={label} title={label}>
      {dark ? <Sun size={18} aria-hidden /> : <Moon size={18} aria-hidden />}
    </button>
  )
}

function LangSwitch() {
  const { progress, dispatch } = useProgress()
  return (
    <div className="seg lang-switch" role="group" aria-label={tx('Dil', 'Language')}>
      {LANGS.map((l) => (
        <button key={l} lang={l} aria-pressed={progress.prefs.lang === l} onClick={() => dispatch({ type: 'prefs', prefs: { lang: l } })} title={l === 'tr' ? 'Türkçe' : 'English'}>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function Shell() {
  return (
    <>
      <a href="#main" className="skip-link">
        {tx('İçeriğe geç', 'Skip to content')}
      </a>
      <header className="topbar">
        <div className="topbar-inner">
          <Link to="/" className="brand" aria-label={tx('Algo View ana sayfa', 'Algo View home')}>
            <Logo />
            <span className="brand-text">Algo View</span>
          </Link>
          <nav className="topnav" aria-label={tx('Ana menü', 'Main menu')}>
            <NavLink to="/" end>
              {tx('Panel', 'Dashboard')}
            </NavLink>
            <NavLink to="/kaynaklar">{tx('Kaynaklar', 'Sources')}</NavLink>
            <NavLink to="/ayarlar">{tx('Ayarlar', 'Settings')}</NavLink>
          </nav>
          <span className="spacer" />
          <LangSwitch />
          <ThemeToggle />
        </div>
      </header>
      <main id="main" className="page" tabIndex={-1}>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route
            path="/ders/:lessonId"
            element={
              <Suspense fallback={<p className="muted">{tx('Ders yükleniyor…', 'Loading lesson…')}</p>}>
                <LessonPage />
              </Suspense>
            }
          />
          <Route path="/kaynaklar" element={<SourcesPage />} />
          <Route path="/ayarlar" element={<SettingsPage />} />
          <Route
            path="*"
            element={
              <div className="card card-pad">
                <h1>{tx('Sayfa bulunamadı', 'Page not found')}</h1>
                <p>
                  <Link to="/">{tx('Panele dön', 'Back to dashboard')}</Link>
                </p>
              </div>
            }
          />
        </Routes>
      </main>
      <footer className="footer">
        {tx(
          'Algo View, Stanford CS161 (Winter 2026) kamuya açık ders materyallerine dayanan bağımsız bir öğrenme aracıdır; Stanford Üniversitesi ile bağlantılı ya da onun resmî bir ürünü değildir. Açıklamalar, örnekler ve sorular özgündür; resmî kaynaklara bağlantılar verilmiştir.',
          'Algo View is an independent learning tool based on the public course materials of Stanford CS161 (Winter 2026); it is not affiliated with, or an official product of, Stanford University. Explanations, examples and questions are original; official sources are linked.',
        )}
      </footer>
    </>
  )
}

/** Remounts the whole page tree on a language switch so traces and content are rebuilt in that language. */
function LangKeyed() {
  const { progress } = useProgress()
  return <Shell key={progress.prefs.lang} />
}

export default function App() {
  return (
    <ProgressProvider>
      <HashRouter>
        <LangKeyed />
      </HashRouter>
    </ProgressProvider>
  )
}
