import { HashRouter, NavLink, Link, Route, Routes, useLocation } from 'react-router-dom'
import { Suspense, lazy, useEffect } from 'react'
import { Moon, Sun, Monitor } from 'lucide-react'
import { ProgressProvider, useProgress } from './state/ProgressContext'
import { Dashboard } from './pages/Dashboard'
import { SourcesPage } from './pages/SourcesPage'
import { SettingsPage } from './pages/SettingsPage'
import type { ThemePref } from './state/progress'

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

const NEXT_THEME: Record<ThemePref, ThemePref> = { system: 'light', light: 'dark', dark: 'system' }
const THEME_LABEL: Record<ThemePref, string> = { system: 'Sistem teması', light: 'Açık tema', dark: 'Koyu tema' }

function ThemeToggle() {
  const { progress, dispatch } = useProgress()
  const t = progress.prefs.theme
  const Icon = t === 'light' ? Sun : t === 'dark' ? Moon : Monitor
  return (
    <button className="btn icon ghost" onClick={() => dispatch({ type: 'prefs', prefs: { theme: NEXT_THEME[t] } })} aria-label={`${THEME_LABEL[t]} (değiştirmek için tıklayın)`} title={THEME_LABEL[t]}>
      <Icon size={18} aria-hidden />
    </button>
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
        İçeriğe geç
      </a>
      <header className="topbar">
        <div className="topbar-inner">
          <Link to="/" className="brand" aria-label="Algo View ana sayfa">
            <Logo />
            <span className="brand-text">Algo View</span>
          </Link>
          <nav className="topnav" aria-label="Ana menü">
            <NavLink to="/" end>
              Panel
            </NavLink>
            <NavLink to="/kaynaklar">Kaynaklar</NavLink>
            <NavLink to="/ayarlar">Ayarlar</NavLink>
          </nav>
          <span className="spacer" />
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
              <Suspense fallback={<p className="muted">Ders yükleniyor…</p>}>
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
                <h1>Sayfa bulunamadı</h1>
                <p>
                  <Link to="/">Panele dön</Link>
                </p>
              </div>
            }
          />
        </Routes>
      </main>
      <footer className="footer">
        Algo View, Stanford CS161 (Winter 2026) kamuya açık ders materyallerine dayanan bağımsız bir öğrenme aracıdır; Stanford Üniversitesi ile bağlantılı ya da onun resmî bir ürünü değildir. Açıklamalar, örnekler ve sorular özgündür; resmî kaynaklara bağlantılar verilmiştir.
      </footer>
    </>
  )
}

export default function App() {
  return (
    <ProgressProvider>
      <HashRouter>
        <Shell />
      </HashRouter>
    </ProgressProvider>
  )
}
