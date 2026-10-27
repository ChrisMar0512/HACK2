import type { ReactNode } from 'react'
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useAuth } from './auth'
import { AppLayout } from './components/AppLayout'
import { ErrorState, PageLoader } from './components/ui'
import { AuthPage } from './pages/AuthPage'
import { DashboardPage } from './pages/DashboardPage'
import { WantedDetailPage } from './pages/WantedDetailPage'
import { WantedPage } from './pages/WantedPage'
import { NewsPage } from './pages/NewsPage'
import { NewsDetailPage } from './pages/NewsDetailPage'
import { SagasPage } from './pages/SagasPage'
import { SagaStoryPage } from './pages/SagaStoryPage'

function RequireAuth({ children }: { children: ReactNode }) {
  const { status, restoreError, retryRestore } = useAuth()
  const location = useLocation()

  if (status === 'loading') return restoreError ? <ErrorState message={restoreError} onRetry={retryRestore} /> : <PageLoader />
  if (status === 'anonymous') {
    return <Navigate to="/login" replace state={{ from: { pathname: location.pathname, search: location.search, hash: location.hash } }} />
  }
  return children
}

function NotFoundPage() {
  return (
    <section className="not-found">
      <span>404</span>
      <h1>Esta isla no figura en el mapa</h1>
      <p>La ruta que buscas no existe o fue retirada por la Guild.</p>
      <Link className="button button--primary" to="/">Volver a la bitácora</Link>
    </section>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
      <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
        <Route index element={<DashboardPage />} />
        <Route path="wanted" element={<WantedPage />} />
        <Route path="wanted/:id" element={<WantedDetailPage />} />
        <Route path="news" element={<NewsPage />}>
          <Route path=":id" element={<NewsDetailPage />} />
        </Route>
        <Route path="sagas" element={<SagasPage />} />
        <Route path="sagas/:id" element={<SagaStoryPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
